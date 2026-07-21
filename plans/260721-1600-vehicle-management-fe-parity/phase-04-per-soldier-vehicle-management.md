---
phase: 4
title: Per-Soldier Vehicle Management
status: completed
effort: ''
---

# Phase 4: Per-Soldier Vehicle Management

## Overview

Add a "Phương tiện" action to each row of the soldiers table (`components/SoldierTable.tsx`) that opens a modal to view a soldier's vehicle (using the already-fetched nested `Soldier.vehicle`), or attach one if they have none, or edit/delete an existing one including its images.

## Context Links

- Depends on: `phase-01-shared-vehicle-api-layer.md` (`useVehicle`, `Soldier.vehicle`), `phase-02-vehicle-form-components.md` (`VehicleFormFields`, `VehicleImagesUpload`)
- File to modify: `components/SoldierTable.tsx`
- Reference pattern for the modal: `UnitFormModal`/`DeleteModal` in `app/(private)/units/page.tsx` (plain `useState` form, `editing` prop drives create-vs-update)

## Requirements

- Functional: one icon button per row opens a single modal that handles all 3 states — no vehicle yet (attach form), existing vehicle (view/edit form pre-filled, with a delete action).
- Non-functional: no extra network round-trip to know whether a soldier has a vehicle — read it off `Soldier.vehicle`, already present in the list response (per Phase 1 overview). After any save/delete, call the existing `fetchSoldiers()` so the row's nested vehicle data refreshes from the server.

## Related Code Files

- Create: `components/SoldierVehicleModal.tsx`
- Modify: `components/SoldierTable.tsx`

## Implementation Steps

1. **`components/SoldierVehicleModal.tsx`**:
   ```ts
   interface SoldierVehicleModalProps {
     isOpen: boolean;
     onOpenChange: () => void;
     soldier: Soldier | null;   // null while modal is closed/transitioning
     onSuccess: () => void;     // caller refetches soldiers list
   }
   ```
   - Local state: `vehicle` fields object + `imagePaths` (seeded from `soldier?.vehicle` via `useEffect` keyed on `isOpen`/`soldier`, same pattern as `UnitFormModal`'s seeding `useEffect`), plus a `deleteConfirmOpen` flag for a nested delete-confirmation step (reuse the `DeleteModal` shape from `app/(private)/units/page.tsx`, or a small inline `<Modal>` — keep it local to this file, no new shared delete-modal abstraction needed for a single call site... actually there will be 2 call sites (this phase + Phase 5); if Phase 5's delete confirmation copy is generic enough ("Xóa phương tiện <biển số>?"), extract a tiny shared `components/VehicleDeleteModal.tsx` at that point instead of duplicating — decide during Phase 5 implementation, not before, to avoid premature abstraction).
   - Header: soldier's `fullName` + `code` for context ("Phương tiện của {fullName}").
   - Body: `VehicleFormFields` + `VehicleImagesUpload` (`vehicleId={soldier?.vehicle?.id}` when editing, `undefined` when attaching new).
   - Footer:
     - If `soldier?.vehicle` exists: "Xóa phương tiện" (danger, opens delete confirm) + "Lưu" (calls `updateVehicle(soldier.vehicle.id, payload)`).
     - If no vehicle: "Lưu" only (calls `attachVehicle(soldier.id, payload)`).
     - Delete confirm step calls `deleteVehicle(soldier.vehicle.id)`.
   - All three actions (`attachVehicle`/`updateVehicle`/`deleteVehicle`) on success: close modal, call `onSuccess()`.
   - Required-field validation before submit: same manual check as Phase 3 step 4 (all 4 fields non-empty), shown inline (small red text under the field), no network call if invalid.

2. **`components/SoldierTable.tsx`**:
   - Add `car-outline` (mdi) icon button to the actions cell (next to the existing delete button), tooltip/aria-label "Phương tiện". Visually indicate presence: e.g. `color={item.vehicle ? "primary" : "default"}` so rows with an attached vehicle stand out.
   - `onPress`: `setSelectedVehicleSoldier(item); onVehicleModalOpen();` (new `useState<Soldier | null>` + new `useDisclosure()`, alongside the existing `selectedSoldier`/delete-modal state).
   - Render `<SoldierVehicleModal isOpen={isVehicleModalOpen} onOpenChange={onVehicleModalOpenChange} soldier={selectedVehicleSoldier} onSuccess={fetchSoldiers} />` near the other modals at the bottom of the component.

## Success Criteria

- [ ] Clicking "Phương tiện" on a soldier with no vehicle shows an empty attach form; saving creates the vehicle and the table refreshes to show it.
- [ ] Clicking "Phương tiện" on a soldier with a vehicle shows the existing data pre-filled (fields + image thumbnails); editing and saving updates it.
- [ ] Deleting the vehicle from the modal removes it and its images server-side; the table refreshes to show "no vehicle" state for that row.
- [ ] No `GET /api/vehicles/by-personnel/*` network call is made anywhere in this flow — vehicle presence comes from the soldiers list response only.

## Risk Assessment

- **Risk:** stale `selectedVehicleSoldier` reference after `fetchSoldiers()` refetches — the modal was seeded from the pre-refresh soldier object.
  **Mitigation:** the modal closes on success before `onSuccess()`/refetch runs (per Implementation Steps 1), so staleness is never visibly rendered; next open always re-reads the latest `item` from the just-refreshed `data` array.
