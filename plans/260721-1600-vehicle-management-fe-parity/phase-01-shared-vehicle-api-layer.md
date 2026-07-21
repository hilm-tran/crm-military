---
phase: 1
title: Shared Vehicle API Layer
status: completed
effort: ''
---

# Phase 1: Shared Vehicle API Layer

## Overview

Add the vehicle data layer: a `useVehicle` hook covering the full `/api/vehicles` contract, a shared `PaginatedResponse<T>` type (deduplicated out of `use-soldier.ts`), a tiny image-URL helper, and the `vehicle` field additions to the existing soldier types so the soldiers table gets nested vehicle data for free.

## Requirements

- Functional: cover attach/list/detail/by-personnel/update/delete/delete-image/upload-image exactly as exposed by `VehicleController` (D:\military, commit 7db938c9).
- Non-functional: match existing hook conventions (`useCallback` + `useMemo`, `addToast` on success/error, rethrow on error) so components can rely on the same error-handling shape as `useSoldier`/`useUnit`.

## Related Code Files

- Create: `types/api.ts` — shared `PaginatedResponse<T>` interface
- Create: `lib/image-url.ts` — `resolveImageUrl(path)` helper
- Create: `hooks/use-vehicle.ts`
- Modify: `hooks/use-soldier.ts` — reuse `PaginatedResponse` from `types/api.ts`, add `vehicle` to `Soldier` and `CreateSoldierParams.militaryPersonnel`

## Implementation Steps

1. **`types/api.ts`** — move the `PaginatedResponse<T>` interface currently declared in `hooks/use-soldier.ts` (lines 17-28) here unchanged (`data: { totalPages, totalElements, size, number, content, first, last, empty }`). Export it.

2. **`lib/image-url.ts`** — export `resolveImageUrl(path: string | null | undefined): string | null`:
   - Returns `null` for `null`/`undefined`/empty input.
   - If `path` already starts with `http://` or `https://` or `data:`, return as-is.
   - Otherwise prefix with `process.env.NEXT_PUBLIC_BASE_API` (same env var `lib/api-client.ts` uses), i.e. `` `${process.env.NEXT_PUBLIC_BASE_API}${path}` ``.
   - Keep it a single small pure function — no new abstraction beyond this.

3. **`hooks/use-vehicle.ts`** — new hook, modeled on `hooks/use-unit.ts` (PUT/DELETE via `apiClient.fetch`, GET/POST via `apiClient.get`/`apiClient.post`):
   ```ts
   export const VEHICLE_TYPE_OPTIONS = [
     { code: "CAR", name: "Ô tô" },
     { code: "MOTORBIKE", name: "Xe máy" },
     { code: "OTHER", name: "Khác" },
   ] as const;

   export interface VehicleResponse {
     id: number;
     personnelId: number;
     vehicleType: "CAR" | "MOTORBIKE" | "OTHER";
     brand: string;
     model: string;
     licensePlate: string;
     imageUrls: string[];
   }

   export interface VehicleRequestPayload {
     vehicleType: "CAR" | "MOTORBIKE" | "OTHER";
     brand: string;
     model: string;
     licensePlate: string;
     imagePaths?: string[];
   }
   ```
   Functions (each: try/catch, `addToast` on success + on error, rethrow on error — same shape as `useUnit`):
   - `attachVehicle(personnelId: number, data: VehicleRequestPayload)` → `apiClient.post<VehicleResponse>(`/api/vehicles?personnelId=${personnelId}`, data)`
   - `updateVehicle(id: number, data: VehicleRequestPayload)` → `apiClient.fetch<VehicleResponse>(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) })`
   - `getVehicles(params: { page?: number; size?: number; keyword?: string })` → `apiClient.get<PaginatedResponse<VehicleResponse>>` on `/api/vehicles` with querystring (mirror `getSoldiers` in `use-soldier.ts`)
   - `getVehicleById(id: number)` → `apiClient.get<VehicleResponse>(`/api/vehicles/${id}`)`
   - `deleteVehicle(id: number)` → `apiClient.fetch(`/api/vehicles/${id}`, { method: "DELETE" })`
   - `deleteVehicleImage(id: number, imagePath: string)` → `apiClient.fetch(`/api/vehicles/${id}/images?imagePath=${encodeURIComponent(imagePath)}`, { method: "DELETE" })`
   - `uploadVehicleImage(file: File)` → same shape as `useSoldier.uploadImage`/`useUnit.uploadLogo`: `FormData` with `multipartFile`, POST to `/api/common/upload-image?category=vehicle`
   - Do **not** add a `getVehicleByPersonnelId` call site for the soldiers table — that data already comes nested on `Soldier.vehicle` (see step 4). Still expose `getVehicleByPersonnelId(personnelId: number)` → `GET /api/vehicles/by-personnel/${personnelId}` for API parity/reuse, but it is not called by Phase 3/4 UI.
   - Return everything via `useMemo`, matching `useUnit`'s return pattern.

4. **`hooks/use-soldier.ts`**:
   - Replace the local `PaginatedResponse<T>` declaration with `import { PaginatedResponse } from "@/types/api";`.
   - Import `VehicleResponse` and `VehicleRequestPayload` from `@/hooks/use-vehicle`.
   - Add `vehicle?: VehicleResponse | null;` to the `Soldier` interface.
   - Add `vehicle?: VehicleRequestPayload;` to `CreateSoldierParams["militaryPersonnel"]` (optional, matches backend `MilitaryPersonnelRequest.vehicle` being optional).
   - No behavioral change to `createSoldier`/`getSoldiers`/`deleteSoldier` bodies — the new field just flows through the existing `JSON.stringify(data)` POST body and the existing response typing.

## Success Criteria

- [ ] `types/api.ts` exports `PaginatedResponse<T>`; `hooks/use-soldier.ts` imports it instead of redeclaring it.
- [ ] `hooks/use-vehicle.ts` exposes `VEHICLE_TYPE_OPTIONS`, `VehicleResponse`, `VehicleRequestPayload`, and all 7 functions listed above, each following the existing try/catch + toast + rethrow convention.
- [ ] `Soldier.vehicle` and `CreateSoldierParams.militaryPersonnel.vehicle` compile with no `any`.
- [ ] `npx tsc --noEmit` (or `next build` in Phase 6) passes with no new type errors introduced by this phase.

## Risk Assessment

- **Risk:** `by-personnel/{personnelId}` 404s (`VEHICLE_NOT_FOUND`) when a soldier has no vehicle yet — if any future caller uses `getVehicleByPersonnelId` directly it will surface a red error toast for the normal "no vehicle" case.
  **Mitigation:** documented in this phase and enforced by Phase 3/4 design — the soldiers table and per-soldier modal read `Soldier.vehicle` from the already-fetched personnel list instead of calling this endpoint. Keep the function exported for parity but do not wire it into any component in this plan.
