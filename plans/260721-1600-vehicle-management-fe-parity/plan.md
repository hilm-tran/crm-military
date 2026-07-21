---
title: Vehicle Management FE Parity
description: ''
status: completed
priority: P2
branch: main
tags: []
blockedBy: []
blocks: []
created: '2026-07-21T09:00:41.961Z'
createdBy: 'ck:plan'
source: skill
---

# Vehicle Management FE Parity

## Overview

Backend commit `7db938c9` (D:\military) added a personnel vehicle management feature: `Vehicle` entity 1:1 with `MilitaryPersonnel`, DynamoDB table `military_vehicles`, REST API `/api/vehicles` (attach/list/detail/by-personnel/update/delete/delete-image), S3 image storage under `category=vehicle`, and an optional `vehicle` object nested in both `MilitaryPersonnelRequest` (create) and `MilitaryPersonnelResponse`.

This plan implements the FE counterpart with full API-surface parity (per user decision):
1. A vehicle sub-section in the existing "Thêm quân nhân" (Add Soldier) form — optional, created atomically with the soldier.
2. A per-soldier "Phương tiện" action on the soldiers table to view/create/edit/delete a soldier's vehicle and its images.
3. A standalone `/vehicles` page mirroring the existing `/units` page pattern (search, pagination, add/edit/delete) for admins who want to browse/manage vehicles directly by personnel ID.

Backend API contract (verified by reading `D:\military` source at commit `7db938c9`):
- `POST /api/vehicles?personnelId={id}` — attach (create) — body: `VehicleRequest`
- `GET /api/vehicles?page&size&keyword` — paginated list, keyword matches license plate/brand/model
- `GET /api/vehicles/{id}` — detail
- `GET /api/vehicles/by-personnel/{personnelId}` — detail by owner (404 `VEHICLE_NOT_FOUND` if none)
- `PUT /api/vehicles/{id}` — update (does not accept personnelId reassignment)
- `DELETE /api/vehicles/{id}/images?imagePath=` — delete one image
- `DELETE /api/vehicles/{id}` — delete vehicle + all its images
- `VehicleRequest`: `vehicleType` (enum CAR|MOTORBIKE|OTHER, required), `brand` (required, ≤100), `model` (required, ≤100), `licensePlate` (required, ≤20), `imagePaths` (≤10 filenames, uploaded beforehand via `POST /api/common/upload-image?category=vehicle`)
- `VehicleResponse`: adds `id`, `personnelId`, `imageUrls` (server-relative paths under `/api/common/images/vehicle/{filename}`)
- `MilitaryPersonnelResponse.vehicle` — nested `VehicleResponse | null`, already present on every personnel list/detail row — no extra fetch needed for the soldiers table.
- Error codes MIL00050–MIL00054 (not found, image not found/save/delete failed, already-exists-for-personnel) surface through the existing generic `apiClient` error-message toast — no special-case handling needed.

FE conventions confirmed by reading the current codebase (`hooks/use-soldier.ts`, `hooks/use-unit.ts`, `hooks/use-combobox.ts`, `components/AddSoldierModal.tsx`, `components/ImageUpload.tsx`, `app/(private)/units/page.tsx`, `lib/api-client.ts`, `lib/routes/*`):
- Data hooks call `apiClient.get/post/fetch` directly (PUT/DELETE via `apiClient.fetch(path, { method })`), catch errors, `addToast`, and rethrow — no shared PUT/DELETE helpers exist yet, none needed (existing pattern is fine, kept as-is).
- No combobox endpoint exists for vehicle type — `EVehicleType` is a small fixed enum, hardcode the 3 options client-side (matches `EVehicleType.getName()`: CAR="Ô tô", MOTORBIKE="Xe máy", OTHER="Khác").
- Routes are auto-generated from the `app/(private)` folder tree by `lib/routes/scripts/generate-routes.ts` (run via `npx tsx`) — do not hand-edit `routes.config.ts`/`routes.util.ts`.
- No test framework exists in this repo (no jest/vitest/playwright, no `test` script) — verification is `npm run lint` + `next build` (static export) + manual smoke test, not automated tests.
- Relative image paths (`/api/common/images/...`) must be prefixed with `NEXT_PUBLIC_BASE_API` to resolve against the backend origin, since this is a static-exported site with no reverse proxy for `/api/*` — existing `logoUrl`/`imageUrl` renders don't do this today; the new vehicle image UI will do it correctly via a small shared helper (see Phase 1) rather than copy the existing gap.

## Dependencies

None — no other unfinished plans exist in this repo. This plan has no cross-plan blockers.

## Validation Log

### Session 1 — 2026-07-21
**Trigger:** Post-plan handoff — user selected `/ck:plan validate`.
**Questions asked:** 3

#### Verification Results
- **Tier:** Full (6 phases, per `verification-roles.md` tiering table)
- **Method:** all cited backend claims (VehicleController/VehicleServiceImpl/VehicleRequest/VehicleResponse/ErrorCode/MilitaryPersonnelServiceImpl) were verified by reading the actual source at `D:\military` commit `7db938c9` during plan authoring (`git show`), not inferred. All cited FE claims (`hooks/use-soldier.ts`, `hooks/use-unit.ts`, `hooks/use-combobox.ts`, `lib/api-client.ts`, `components/ImageUpload.tsx`, `components/AddSoldierModal.tsx`, `components/SoldierTable.tsx`, `app/(private)/units/page.tsx`, `components/Sidebar.tsx`, `lib/routes/scripts/*`, `package.json`, `next.config.mjs`) were verified by direct `Read`/`Grep` during plan authoring, including a live dry-run of the route generator command.
- **Contract Verifier spot-check:** grepped all consumers of `useSoldier`/`Soldier`/`CreateSoldierParams` (`app/(private)/dashboard/page.tsx`, `hooks/use-soldier.ts`, `components/AddSoldierModal.tsx`, `components/SoldierTable.tsx`, `components/ImageUpload.tsx`) — 5 files, all accounted for. `dashboard/page.tsx` only reads `totalElements` via `getSoldiers`, unaffected by the new optional `vehicle` field — correctly excluded from any phase's "Related Code Files".
- **Claims checked:** 17 | **Verified:** 17 | **Failed:** 0 | **Unverified:** 0

#### Questions & Answers

1. **[Architecture]** In the Add-Soldier form (Phase 3), how should the optional vehicle section be presented?
   - Options: Switch/checkbox reveals section (Recommended) | Always-visible optional fields
   - **Answer:** Switch/checkbox reveals section
   - **Rationale:** Keeps the default form short; matches `phase-03-add-soldier-vehicle-integration.md`'s existing design (`hasVehicle` toggle) as written — no change needed.

2. **[Architecture]** In `VehicleImagesUpload` (Phase 2), when should removing an already-saved image actually delete it server-side?
   - Options: Immediately on click (Recommended) | Deferred until Save
   - **Answer:** Immediately on click
   - **Rationale:** Matches `phase-02-vehicle-form-components.md`'s existing design (calls `deleteVehicleImage` when `vehicleId` is set) as written — no change needed. Tradeoff accepted: "Hủy" (Cancel) on the modal after removing an image does not restore it.

3. **[Scope]** Standalone `/vehicles` page (Phase 5) "Add vehicle" requires typing a raw personnel ID (no name-search endpoint exists in the backend). Acceptable?
   - Options: Yes, accept it (Recommended) | Drop standalone "Add" entirely
   - **Answer:** Yes, accept it
   - **Rationale:** Matches `phase-05-standalone-vehicles-page.md`'s existing Risk Assessment note as written — no change needed. Confirms Phase 3 (Add-Soldier) and Phase 4 (per-soldier action) remain the primary, ID-free creation paths.

#### Confirmed Decisions
- Add-Soldier vehicle section: switch-gated, hidden by default — matches plan as written.
- Vehicle image removal: immediate server-side delete when editing a persisted vehicle — matches plan as written.
- Standalone `/vehicles` "Add" flow: raw personnel-ID input accepted as-is — matches plan as written.

#### Action Items
None — all 3 answers confirmed the plan's existing design; no phase file edits required.

#### Impact on Phases
None — no phase content changed as a result of this session.

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01-shared-vehicle-api-layer.md, phase-02-vehicle-form-components.md, phase-03-add-soldier-vehicle-integration.md, phase-04-per-soldier-vehicle-management.md, phase-05-standalone-vehicles-page.md, phase-06-build-verify.md
- Decision deltas checked: 3 (all confirmed-as-written, zero deltas)
- Reconciled stale references: 0
- Unresolved contradictions: 0

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Shared Vehicle API Layer](./phase-01-shared-vehicle-api-layer.md) | Completed |
| 2 | [Vehicle Form Components](./phase-02-vehicle-form-components.md) | Completed |
| 3 | [Add-Soldier Vehicle Integration](./phase-03-add-soldier-vehicle-integration.md) | Completed |
| 4 | [Per-Soldier Vehicle Management](./phase-04-per-soldier-vehicle-management.md) | Completed |
| 5 | [Standalone Vehicles Page](./phase-05-standalone-vehicles-page.md) | Completed |
| 6 | [Build Verify](./phase-06-build-verify.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
