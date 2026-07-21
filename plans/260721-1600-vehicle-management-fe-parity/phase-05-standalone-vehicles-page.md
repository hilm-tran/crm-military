---
phase: 5
title: Standalone Vehicles Page
status: completed
effort: ''
---

# Phase 5: Standalone Vehicles Page

## Overview

Add a `/vehicles` page mirroring `app/(private)/units/page.tsx`'s self-contained list+search+pagination+CRUD-modal pattern, exposing the full `GET/PUT/DELETE /api/vehicles` surface directly (not scoped to a single soldier), and wire it into the sidebar nav.

## Context Links

- Depends on: `phase-01-shared-vehicle-api-layer.md` (`useVehicle`), `phase-02-vehicle-form-components.md` (`VehicleFormFields`, `VehicleImagesUpload`)
- Reference pattern: `app/(private)/units/page.tsx` (single-file page: `FormModal` + `DeleteModal` + `Table`, plain `useState`, `useDebounce` for keyword)
- File to modify: `components/Sidebar.tsx`, `lib/routes/routes.config.ts` (regenerated, not hand-edited)

## Requirements

- Functional: search by keyword (matches license plate/brand/model server-side, per `VehicleServiceImpl.matchesKeyword`), paginate, add (requires a personnel ID since `attachVehicle` needs one), edit, delete with confirmation.
- Non-functional: `VehicleResponse` does not include the owner's name (only `personnelId`) — display `personnelId` as-is in the table; do not invent a personnel-name lookup join, that's out of scope (the backend contract doesn't provide it, and Phase 4's per-soldier flow is the name-aware entry point for most real usage).

## Related Code Files

- Create: `app/(private)/vehicles/page.tsx`
- Modify: `components/Sidebar.tsx` — add nav item
- Generated (do not hand-edit): `lib/routes/routes.config.ts`, `lib/routes/routes.type.ts`, `lib/routes/routes.util.ts`

## Implementation Steps

1. **`app/(private)/vehicles/page.tsx`** — copy the structure of `app/(private)/units/page.tsx`:
   - `VehicleFormModal` (local component in this file): `editing: VehicleResponse | null` prop drives create-vs-update, same as `UnitFormModal`. Body: a `personnelId` numeric `Input` (only shown/enabled when `editing` is `null` — creating requires a personnel ID via `attachVehicle(personnelId, payload)`; when editing, `personnelId` is fixed and just displayed as read-only text, since `updateVehicle` never changes ownership) + `VehicleFormFields` + `VehicleImagesUpload` (`vehicleId={editing?.id}`).
   - `VehicleDeleteConfirmModal` (or the shared `components/VehicleDeleteModal.tsx` if Phase 4 already extracted one — reuse it here instead of duplicating, per the note left in `phase-04-per-soldier-vehicle-management.md` step 1).
   - Main page component: `useVehicle().getVehicles({ keyword, page, size: 10 })` on keyword/page change (debounced keyword via `useDebounce`, same as `units/page.tsx`), `Table` with columns STT / ID QUÂN NHÂN / LOẠI XE / HÃNG / HIỆU / BIỂN SỐ / ẢNH (first thumbnail or "—") / HÀNH ĐỘNG (Sửa/Xóa buttons).
   - `PageHeader` icon `mdi:car-outline`, title "Quản lý Phương tiện", subtitle "Danh sách phương tiện của quân nhân".
2. **`components/Sidebar.tsx`** — add `{ href: "/vehicles", label: "Phương tiện", icon: "mdi:car-outline" }` to the existing `"Quân nhân"` group's `items` array (alongside `/soldiers`).
3. Regenerate routes: run `npx tsx lib/routes/scripts/generate-routes.ts` from the repo root after the `app/(private)/vehicles/page.tsx` file exists, so `routes.config.ts`/`routes.type.ts`/`routes.util.ts` pick up the new `/vehicles` entry automatically (do not hand-edit these 3 generated files).

**Implementation note (discovered during Phase 5 execution):** the generator is broken on Windows — `path.join` emits backslash separators (`__dirname`-relative `appPath`), and `FileGenerator` writes them unescaped into single-quoted JS string literals. `(private)\vehicles` and `(private)\requests` become `\v`/`\r` escape sequences (vertical-tab/carriage-return control chars embedded in the string), and `(private)\units` becomes an invalid `\u` Unicode escape — a hard syntax error. Confirmed by actually running it and diffing the output. Fix applied: reverted the generator's output (`git checkout -- lib/routes/routes.config.ts lib/routes/routes.type.ts`) and hand-added the single `"/vehicles"` entry (routes object + `routeKeys` + `routePatterns`) in the exact existing double-quote/forward-slash style instead. `routes.util.ts` needed no change (untouched by the diff). This is a pre-existing bug in `lib/routes/scripts/classes/RouteGenerator.ts`/`FileGenerator.ts` (Windows path-separator handling), out of scope to fix here — flagged for a separate fix, not blocking this plan.

## Success Criteria

- [ ] `/vehicles` lists all vehicles with working keyword search and pagination.
- [ ] Adding a vehicle by personnel ID succeeds when that personnel has no vehicle yet, and surfaces the backend's `VEHICLE_ALREADY_EXISTS_FOR_PERSONNEL` error toast when they already do.
- [ ] Editing and deleting a vehicle from this page works and matches the state shown after navigating back to `/soldiers` (Phase 4's per-soldier view reflects the same data).
- [ ] Sidebar shows "Phương tiện" under "Quân nhân" and navigates correctly; `routes.config.ts` contains a valid `/vehicles` entry (hand-added after the route generator was found to corrupt the file on Windows — see implementation note above).

## Risk Assessment

- **Risk:** admins won't know a personnel's numeric ID off-hand when adding a vehicle from this page (no personnel-name autocomplete exists in the backend's combobox API).
  **Mitigation:** accepted per user-confirmed scope ("Full parity" — build to the actual backend contract, not invent new backend endpoints); the primary/expected creation path remains Phase 3 (Add-Soldier form) and Phase 4 (per-soldier action, which has soldier context and needs no ID entry) — this page is the secondary/admin-browse surface.
