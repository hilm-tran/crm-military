---
phase: 2
title: Vehicle Form Components
status: completed
effort: ''
---

# Phase 2: Vehicle Form Components

## Overview

Build the two reusable UI pieces every vehicle form needs — a fields group (type/brand/model/plate) and a multi-image uploader (max 10) — so Phase 3 (Add-Soldier), Phase 4 (per-soldier modal) and Phase 5 (standalone page) share one implementation instead of three copies (DRY).

## Context Links

- Depends on: `phase-01-shared-vehicle-api-layer.md` (`useVehicle`, `VEHICLE_TYPE_OPTIONS`, `VehicleRequestPayload`, `resolveImageUrl`)
- Reference pattern: `components/ImageUpload.tsx` (single-image drag/drop, local preview via `URL.createObjectURL`), `components/AddSoldierModal.tsx` (react-hook-form `Controller` + HeroUI `Select`)

## Requirements

- Functional: `VehicleFormFields` edits `vehicleType`, `brand`, `model`, `licensePlate` with the same client-side constraints as the backend (`brand`/`model` ≤100, `licensePlate` ≤20, all required, `vehicleType` required). `VehicleImagesUpload` uploads via `category=vehicle`, previews a thumbnail grid, removes images, caps at 10.
- Non-functional: both are presentational + self-contained state-lifters (controlled via props/callbacks), no direct fetch of vehicle CRUD endpoints inside them — callers own submit/save.

## Related Code Files

- Create: `components/VehicleFormFields.tsx`
- Create: `components/VehicleImagesUpload.tsx`

## Implementation Steps

1. **`components/VehicleFormFields.tsx`** — plain controlled-inputs component (not a `react-hook-form` register wrapper, since it must be embeddable inside both a `react-hook-form` form (Phase 3) and plain `useState` forms (Phase 4/5, matching `UnitFormModal`'s plain-`useState` style):
   ```ts
   interface VehicleFormFieldsProps {
     value: { vehicleType: string; brand: string; model: string; licensePlate: string };
     onChange: (next: VehicleFormFieldsProps["value"]) => void;
     errors?: Partial<Record<"vehicleType" | "brand" | "model" | "licensePlate", string>>;
   }
   ```
   Renders: HeroUI `Select` for `vehicleType` (options from `VEHICLE_TYPE_OPTIONS`), `Input` for `brand` (maxLength 100), `Input` for `model` (maxLength 100), `Input` for `licensePlate` (maxLength 20). Each `Input`/`Select` wired to `value`/`onChange` directly (no internal state) so both call sites can validate/submit however they already do.

2. **`components/VehicleImagesUpload.tsx`**:
   ```ts
   interface VehicleImagesUploadProps {
     imagePaths: string[];          // filenames (server keys), source of truth
     imageUrls?: string[];          // parallel array of resolved URLs for already-persisted images (same order/length as imagePaths for the persisted subset)
     vehicleId?: number;            // present only when editing an existing, saved vehicle
     onChange: (paths: string[]) => void;
   }
   ```
   - Grid of thumbnails (reuse the drag/drop tile styling from `ImageUpload.tsx`), each with a small "x" remove button, plus one "add" tile shown while `imagePaths.length < 10`.
   - Add: same drag/drop + click-to-pick pattern as `ImageUpload.tsx`, but on file pick calls `useVehicle().uploadVehicleImage(file)`, then appends the returned filename to `imagePaths` via `onChange([...imagePaths, filename])`. Local preview: keep a parallel `previewUrls` React state map keyed by filename, populated with `URL.createObjectURL(file)` at upload time so newly added images render immediately without waiting on `imageUrls`.
   - Remove: if `vehicleId` is set (editing a persisted vehicle) call `useVehicle().deleteVehicleImage(vehicleId, path)` first, then on success drop it from `imagePaths` via `onChange`; if `vehicleId` is unset (still composing a brand-new vehicle, e.g. inside Add-Soldier), just drop it from `imagePaths` locally — nothing persisted server-side to clean up yet (same "orphan S3 object on cancel" tradeoff the existing `ImageUpload`/`uploadLogo` flows already accept — not a regression).
   - Thumbnail `src`: use `resolveImageUrl` (from Phase 1) on the matching `imageUrls[i]` when available, else the local `previewUrls[filename]` blob URL.
   - Enforce max 10 by hiding the "add" tile at length 10 (mirrors backend `@Size(max = 10)` on `imagePaths`).

## Success Criteria

- [ ] `VehicleFormFields` renders and validates all 4 fields with the same length limits as `VehicleRequest` on the backend.
- [ ] `VehicleImagesUpload` uploads, previews, and removes images; enforces the 10-image cap; calls `deleteVehicleImage` only when `vehicleId` is provided.
- [ ] Neither component performs vehicle create/update/delete calls directly — only image upload/delete and local array mutation via `onChange`.

## Risk Assessment

- **Risk:** Removing an image on an unsaved (no `vehicleId`) vehicle leaves an orphaned S3 object.
  **Mitigation:** accepted tradeoff, consistent with existing `ImageUpload`/personnel-photo and `uploadLogo`/unit-logo behavior already shipped in this codebase — not introduced by this plan.
