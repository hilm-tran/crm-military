---
phase: 3
title: Add-Soldier Vehicle Integration
status: completed
effort: ''
---

# Phase 3: Add-Soldier Vehicle Integration

## Overview

Add an optional "Phương tiện" section to `AddSoldierModal` so a vehicle can be created atomically with the soldier, matching the backend's optional `MilitaryPersonnelRequest.vehicle` field (if vehicle creation fails, the backend rolls back the whole personnel record — see `MilitaryPersonnelServiceImpl.create`, so the FE just needs to submit the combined payload and let the existing error toast surface any failure).

## Context Links

- Depends on: `phase-01-shared-vehicle-api-layer.md` (`CreateSoldierParams.militaryPersonnel.vehicle`), `phase-02-vehicle-form-components.md` (`VehicleFormFields`, `VehicleImagesUpload`)
- File to modify: `components/AddSoldierModal.tsx`

## Requirements

- Functional: a checkbox/toggle "Gán phương tiện cho quân nhân" reveals the vehicle fields + image uploader; when off, no `vehicle` key is sent in the payload. When on, all 4 vehicle fields are required before submit (mirrors backend `@NotNull`/`@NotBlank` on `VehicleRequest`).
- Non-functional: keep the existing two-column layout (`Tài khoản` / `Ảnh đại diện` columns) intact; add the vehicle section as a new full-width block below the grid, inside the same `ModalBody`/`form`.

## Related Code Files

- Modify: `components/AddSoldierModal.tsx`

## Implementation Steps

1. Extend `FormValues` with `hasVehicle: boolean`, `vehicle: { vehicleType: string; brand: string; model: string; licensePlate: string }`, `vehicleImagePaths: string[]`. Default `hasVehicle: false`, `vehicle` fields empty strings, `vehicleImagePaths: []`.
2. Add a HeroUI `Switch` (or `Checkbox`, match whatever primitive is already imported elsewhere in this codebase for booleans — check `@heroui/react` exports already in use before adding a new one) labeled "Gán phương tiện cho quân nhân", registered via `Controller` on `hasVehicle`.
3. Below the existing `grid grid-cols-2` block, conditionally render (when `hasVehicle` is true) a new section:
   - `<p className="font-medium text-xs text-default-500 uppercase pt-2">Thông tin phương tiện</p>`
   - `VehicleFormFields` bound to `watch("vehicle")` / `setValue("vehicle", ...)` (or a `Controller` wrapping the whole `vehicle` object), with `errors` derived from `formState.errors.vehicle`.
   - `VehicleImagesUpload` bound to `watch("vehicleImagePaths")` / `setValue("vehicleImagePaths", ...)`, no `vehicleId` prop (new vehicle, not yet persisted).
4. Add manual required-field validation in `onSubmit` (react-hook-form `register`-based required rules don't apply cleanly to the plain-controlled `VehicleFormFields`): before calling `createSoldier`, if `hasVehicle` is true and any of `vehicle.vehicleType/brand/model/licensePlate` is empty, set form errors via `setError` on the relevant `vehicle.*` field paths and abort submit.
5. In `onSubmit`, when building the `createSoldier` payload, add:
   ```ts
   militaryPersonnel: {
     ...,
     vehicle: data.hasVehicle
       ? {
           vehicleType: data.vehicle.vehicleType,
           brand: data.vehicle.brand,
           model: data.vehicle.model,
           licensePlate: data.vehicle.licensePlate,
           imagePaths: data.vehicleImagePaths.length ? data.vehicleImagePaths : undefined,
         }
       : undefined,
   }
   ```
6. `reset()` on successful submit must also clear `hasVehicle`, `vehicle`, `vehicleImagePaths` back to defaults (already covered if they're included in `defaultValues` passed to `useForm`, since `reset()` with no args resets to `defaultValues`).

## Success Criteria

- [ ] Creating a soldier with the vehicle switch off sends no `vehicle` key (verified by inspecting the network request body in dev tools).
- [ ] Creating a soldier with the vehicle switch on and all fields filled successfully creates both the soldier and the vehicle in one request; the new soldier row's nested vehicle data is visible after the list refreshes (Phase 4 renders this).
- [ ] Leaving a required vehicle field empty while the switch is on blocks submit with a visible field error, without a network call.
- [ ] Existing soldier-only creation flow (no vehicle) is unaffected — same request shape as before this phase, minus the added optional key.

## Risk Assessment

- **Risk:** Backend rolls back the whole personnel record if vehicle creation fails after personnel creation succeeds (e.g. a transient S3 error) — the user sees a generic error toast and has to retry the entire form, including re-picking images.
  **Mitigation:** this is backend behavior (`MilitaryPersonnelServiceImpl.create` catches `RuntimeException` from `vehicleService.create` and deletes the just-saved personnel), out of scope for the FE to change; acceptable since it's the same all-or-nothing UX the backend already committed to.
