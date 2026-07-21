---
phase: 6
title: Build Verify
status: completed
effort: ''
---

# Phase 6: Build Verify

## Overview

Verify the full vehicle FE feature compiles and works end-to-end. This repo has no test framework (no jest/vitest/playwright, no `test` script in `package.json`) — verification is lint + static-export build + a manual smoke-test checklist against a running backend, not automated tests.

## Context Links

- Depends on: Phases 1-5 complete
- Backend under test: `D:\military` at (or after) commit `7db938c9`, running locally/reachable at whatever `NEXT_PUBLIC_BASE_API` points to.

## Implementation Steps

1. `npm run lint` — fix any ESLint errors introduced by the new/modified files (`hooks/use-vehicle.ts`, `types/api.ts`, `lib/image-url.ts`, `components/VehicleFormFields.tsx`, `components/VehicleImagesUpload.tsx`, `components/SoldierVehicleModal.tsx`, `app/(private)/vehicles/page.tsx`, plus modified `hooks/use-soldier.ts`, `components/AddSoldierModal.tsx`, `components/SoldierTable.tsx`, `components/Sidebar.tsx`).
2. `npm run build` — this project uses `output: "export"` (static export), so a successful build is both the TypeScript compile check and the production-bundling check. Fix any type errors or build failures.
3. `npx tsc --noEmit` if `next build` output doesn't clearly surface type errors on its own — cross-check.
4. Confirm `git status`/`git diff` on `lib/routes/routes.config.ts`, `routes.type.ts`, `routes.util.ts` shows only the expected `/vehicles` addition (from Phase 5's generator run) and no unrelated churn.
5. Manual smoke test against a running backend (`npm run dev`, since `output: "export"` still works with `next dev` for local testing):
   - Add a soldier **without** a vehicle → succeeds, no `vehicle` key sent.
   - Add a soldier **with** a vehicle (fill all 4 fields + 1-2 images) → succeeds, soldier row shows vehicle-present state.
   - Open "Phương tiện" on that soldier → data pre-filled correctly, images visible.
   - Edit the vehicle (change plate, add/remove an image) → saves, table reflects changes.
   - Delete the vehicle from the soldier modal → soldier row reverts to "no vehicle" state.
   - Attach a new vehicle to a soldier who has none, from `/vehicles` page using their personnel ID → succeeds.
   - Attempt to attach a second vehicle to a soldier who already has one (either surface) → backend's "already has a vehicle" error toast appears, no partial state left behind.
   - Search `/vehicles` by license plate substring → filters correctly.
   - Delete a soldier who has a vehicle (existing soldier-delete flow) → succeeds without error (backend cascades vehicle deletion via `vehicleService.deleteByPersonnelId`, per `MilitaryPersonnelServiceImpl.delete`) — confirm the FE delete confirmation copy/flow for soldiers didn't need changes for this (it shouldn't; verify only).

## Success Criteria

- [ ] `npm run lint` passes with zero errors on touched files.
- [ ] `npm run build` completes successfully (static export, no type errors).
- [ ] All manual smoke-test steps above pass against a live backend.
- [ ] No unrelated diffs in generated route files beyond the new `/vehicles` entry.

## Execution Notes (2026-07-21)

- `npm run lint` initially failed to even run: `@eslint/compat` was imported by `eslint.config.mjs` but missing from `package.json`/`node_modules` — pre-existing broken tooling, unrelated to this feature. Fixed by `npm install --save-dev @eslint/compat` (now in `package.json`).
- Running `npm run lint` / `next build` invokes `eslint --fix` across the **entire repository**, not just changed files. The first run reformatted ~40 unrelated pre-existing files (quote style, import order, CRLF→LF). Reverted all of those (`git checkout --`) to keep the diff scoped to this feature; re-verified only the vehicle-feature files with a scoped `npx eslint`/`npx eslint --fix` run instead.
- `lib/routes/scripts/generate-routes.ts` is broken on Windows (see `phase-05-standalone-vehicles-page.md` implementation note) — used a direct `RouteGenerator` call to diagnose, then hand-added the `/vehicles` entry to `routes.config.ts` after reverting the corrupted regenerated output.
- **Baseline comparison:** stashed all changes and ran `npm run build` on the unmodified `main` branch — it already fails with the exact same 5 ESLint errors (`app/(private)/requests/page.tsx` ×2, `app/(private)/units/page.tsx` ×1, `components/ImageUpload.tsx` ×1, `components/SoldierTable.tsx`'s pre-existing QR-code `<img onClick>` ×1). Confirms these are pre-existing, unrelated to this feature — not a regression introduced here.
- `npx tsc --noEmit`: **0 errors**, repo-wide.
- `next build`'s TypeScript phase: `✓ Compiled successfully` — the subsequent `Failed to compile` is ESLint-only, from the same 5 pre-existing errors above (verified via targeted `npx eslint` on only the vehicle-feature files: 0 errors introduced by this feature).
- `npm run lint` scoped to vehicle-feature files only: 1 error remaining, and it is the pre-existing `SoldierTable.tsx` QR-image issue (not touched by this feature) — 0 new errors.
- **Not run:** live manual smoke testing (Implementation Steps step 5). `NEXT_PUBLIC_BASE_API` in `.env.local` points to a deployed API Gateway endpoint, but every `/api/vehicles`/`/api/personnel` call requires an authenticated session (username/password login) which this environment has no credentials for and no browser automation tool available to drive. The manual smoke-test checklist above still needs to be run by the user against `npm run dev` with real login credentials before this feature ships.

## Code Review Fixes Applied (2026-07-21)

Mandatory `code-reviewer` subagent pass found 2 real bugs and 1 hardening item in the new code, all fixed:
- **`components/AddSoldierModal.tsx`**: vehicle field validation (`onSubmit`) only set errors for still-empty fields, never cleared errors for fields the user had since filled in (plain-controlled `VehicleFormFields` isn't RHF-registered, so RHF can't auto-clear them). Fixed by calling `clearErrors(`vehicle.${field}`)` in the passing branch.
- **`components/VehicleImagesUpload.tsx`**: `handleFile`/`handleRemove` read the `imagePaths` prop via closure with no guard against concurrent invocation — two near-simultaneous uploads/removes (e.g. rapid drag-drops) could race, with the second `onChange` computed from a stale snapshot silently dropping the first operation's result. Fixed by adding an `isBusy` guard (`isUploading || removingPath !== null`) that both handlers check up front, and disabling the remove buttons + file input while any operation is in flight (serializes operations instead of racing).
- **`lib/image-url.ts`**: `filenameFromImageUrl` (used by `SoldierVehicleModal.tsx` and `app/(private)/vehicles/page.tsx` to reconstruct raw filenames from `VehicleResponse.imageUrls` for update/delete payloads) didn't strip query strings/hash fragments and didn't guard against a trailing-slash URL producing an empty string. Hardened defensively — not currently exploitable against the documented backend URL shape, but the tester `code-reviewer` correctly flagged it as fragile against a future backend change (e.g. cache-busting query params).

Independent `tester` subagent pass (before these 3 fixes) confirmed: 0 new lint errors, 0 TypeScript errors, `next build`'s TS-compile phase succeeds, all `use-vehicle.ts` endpoints match the backend contract exactly, and 0 contradictions with the Execution Notes above. Re-verified after the 3 fixes: `npx tsc --noEmit` still 0 errors; scoped `npx eslint --fix` on the 3 touched files: 0 errors (only pre-existing-pattern warnings: `no-console`, `no-img-element`); `git status` confirms no unrelated file churn.

Deferred, not fixed (explicitly out of scope for this plan, called out to the user):
- `AddSoldierModal`'s "Hủy" (Cancel) button doesn't call `reset()` — pre-existing gap (confirmed via `git diff` to predate this feature), now also leaves the new vehicle fields stale on reopen. Follow-up ticket, not a regression from this plan.
- The `VehicleImagesUpload` preview-seeding `useEffect`'s dependency array is intentionally narrow (`[vehicleId]` only) — verified safe today because HeroUI's `Modal` fully unmounts `ModalContent` on close (both current call sites remount fresh per open), but would be fragile if this component were ever reused outside a lazily-unmounted `Modal`. Not fixed since it doesn't manifest as a bug in either current call site.

## Risk Assessment

- **Risk:** manual smoke testing requires a running backend instance at commit `7db938c9`+ with S3 configured (`military.app.s3.bucket`) — if that's not available in the dev environment, image upload/delete steps can't be verified end-to-end.
  **Mitigation:** run lint + build regardless (catches all compile-time issues); flag any smoke-test steps that couldn't be run due to missing backend/S3 access rather than silently marking them done.
