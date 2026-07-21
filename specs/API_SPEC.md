# Military Manager - API Integration Specification

**Version:** 2.2  
**Last Updated:** 2026-07-21  
**Swagger:** https://xgour62062.execute-api.ap-southeast-2.amazonaws.com/swagger-ui/index.html

---

## API Client Configuration

### Base Setup

```typescript
// lib/api-client.ts
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
```

### Response Format

All endpoints return:

```json
{
  "httpStatus": 200,
  "data": { ... },
  "path": ""
}
```

Paginated endpoints return:

```json
{
  "httpStatus": 200,
  "data": {
    "content": [ ... ],
    "pageable": { ... },
    "totalPages": 1,
    "totalElements": 7,
    "size": 10,
    "number": 0,
    "first": true,
    "last": true,
    "empty": false
  },
  "path": ""
}
```

### Authentication

All endpoints (except signin/signup) require:

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Authentication APIs

### POST /api/auth/signin

**Purpose**: User login

**Request**:

```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:

```json
{
  "httpStatus": 200,
  "data": {
    "token": "jwt-token",
    "type": "Bearer",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "roles": ["ROLE_SYSTEM_ADMIN"]
    }
  }
}
```

---

### POST /api/auth/signup

**Purpose**: Create new user + military personnel

**Authorization**: `ROLE_ADMIN_UNIT`, `ROLE_ADMIN_REGION`, `ROLE_SYSTEM_ADMIN`

**Request**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": ["ROLE_USER"],
  "militaryPersonnel": {
    "fullName": "string",
    "rankCode": "DAI_UY",
    "unitCode": "DV001",
    "positionCode": "TRUNG_DOI_TRUONG",
    "imagePath": "string (optional)",
    "vehicle": {
      "vehicleType": "CAR | MOTORBIKE | OTHER",
      "brand": "string",
      "model": "string",
      "licensePlate": "string",
      "imagePaths": ["vehicle-image-1.jpg"]
    }
  }
}
```

> **Note**: `militaryPersonnel.vehicle` is optional. When present, the vehicle is created atomically together with the personnel (see [Vehicle APIs](#vehicle-apis)). The FE exposes this via a switch-gated section in the "Thêm quân nhân" modal.

---

### POST /api/auth/signout

**Purpose**: User logout

---

## Personnel APIs

### GET /api/personnel

**Purpose**: List military personnel (paginated)

**Query Parameters**: `page`, `size`, `keyword`

**Response** (paginated):

```json
{
  "id": 7732553894324217,
  "fullName": "Hoàng Ngọc Chiến",
  "regionCode": "QK2",
  "rankCode": "DAI_UY",
  "unitCode": "DV001",
  "positionCode": "TRUNG_DOI_TRUONG",
  "code": "DV001-DAI-UY-TRUNG-DOI-TRUONG-00001",
  "qrCode": "iVBORw0KGgo... (base64 PNG)",
  "qrSource": "SYSTEM",
  "imageUrl": "/api/common/images/personnel/xxx.jpg",
  "vehicle": {
    "id": 123,
    "personnelId": 7732553894324217,
    "vehicleType": "CAR",
    "brand": "Toyota",
    "model": "Vios",
    "licensePlate": "51A-12345",
    "imageUrls": ["/api/common/images/vehicle/xxx.jpg"]
  }
}
```

> **Note**: Every personnel list/detail row carries a nested `vehicle` object (`VehicleResponse | null`). The soldiers table reads it directly — no extra fetch needed to show a soldier's vehicle.

---

### POST /api/personnel

**Purpose**: Create military personnel

**Request**:

```json
{
  "fullName": "string (max 200)",
  "unitCode": "string (max 150)",
  "rankCode": "DAI_UY",
  "positionCode": "TRUNG_DOI_TRUONG",
  "regionCode": "string",
  "imagePath": "string"
}
```

---

### GET /api/personnel/{id}

**Purpose**: Get personnel details

---

### PUT /api/personnel/{id}

**Purpose**: Update personnel

---

### DELETE /api/personnel/{id}

**Purpose**: Delete personnel

---

## Region APIs

> ⚠️ **Not in current deployment (2026-07-21)**: The live Swagger (`/v3/api-docs`) exposes **no** `/api/military-regions` endpoints and no `/api/common/combobox/regions`. Regions are not managed by the FE. The section below is retained for reference only; `regionCode` still appears on units/personnel as a stored field.

### GET /api/military-regions

**Purpose**: List regions (paginated)

**Query Parameters**: `page`, `size`, `keyword`

**Response item**:

```json
{
  "id": 7732547877141113,
  "regionCode": "QK1",
  "regionName": "Quân khu 1",
  "establishedDate": "1945-10-16",
  "description": "Quân khu 1 là đơn vị quân sự...",
  "logoUrl": "/api/common/images/region/xxx.jpg"
}
```

---

### POST /api/military-regions

**Purpose**: Create region

**Request**:

```json
{
  "regionCode": "string (max 50)",
  "regionName": "string (max 200)",
  "establishedDate": "1945-10-16",
  "description": "string (max 1000)",
  "logoPath": "string (max 255)"
}
```

> **Note**: Request uses `logoPath`, response returns `logoUrl`

---

### GET /api/military-regions/{id}

**Purpose**: Get region details

---

### PUT /api/military-regions/{id}

**Purpose**: Update region

---

### DELETE /api/military-regions/{id}

**Purpose**: Delete region

---

## Unit APIs

### GET /api/military-units

**Purpose**: List units (paginated)

**Query Parameters**: `page`, `size`, `keyword`, `regionCode`

**Response item**:

```json
{
  "id": 7732553101674647,
  "regionCode": "QK2",
  "unitCode": "DV001",
  "unitName": "Đơn vị 1",
  "address": "So 1 Duong ABC, TP.HCM",
  "establishedDate": "1975-04-30",
  "description": "Don vi chu luc khu vuc phia Nam",
  "logoUrl": "/api/common/images/unit/xxx.jpg"
}
```

---

### POST /api/military-units

**Purpose**: Create unit

**Request**:

```json
{
  "regionCode": "string (max 50)",
  "unitCode": "string (max 50)",
  "unitName": "string (max 200)",
  "address": "string (max 500)",
  "establishedDate": "1975-04-30",
  "description": "string (max 1000)",
  "logoPath": "string (max 255)"
}
```

---

### GET /api/military-units/{id}

**Purpose**: Get unit details

---

### PUT /api/military-units/{id}

**Purpose**: Update unit

---

### DELETE /api/military-units/{id}

**Purpose**: Delete unit

---

## Vehicle APIs

> Feature added 2026-07-21 (BE commit `7db938c9`). A `Vehicle` is 1:1 with a `MilitaryPersonnel`. FE hook: `hooks/use-vehicle.ts`. Images are uploaded beforehand via `POST /api/common/upload-image?category=vehicle`, then referenced by filename in `imagePaths`.

### POST /api/vehicles?personnelId={id}

**Purpose**: Attach (create) a vehicle for a personnel

**Request** (`VehicleRequest`):

```json
{
  "vehicleType": "CAR | MOTORBIKE | OTHER",
  "brand": "string (required, max 100)",
  "model": "string (required, max 100)",
  "licensePlate": "string (required, max 20)",
  "imagePaths": ["filename.jpg (max 10 items)"]
}
```

**Response** (`VehicleResponse`): adds `id`, `personnelId`, and `imageUrls` (server-relative paths under `/api/common/images/vehicle/{filename}`).

> **Errors**: `MIL00054` — a vehicle already exists for that personnel (1:1 constraint).

---

### GET /api/vehicles

**Purpose**: List vehicles (paginated)

**Query Parameters**: `page`, `size`, `keyword` (matches license plate / brand / model)

**Response item**: `VehicleResponse` (see above).

---

### GET /api/vehicles/{id}

**Purpose**: Get vehicle details

---

### GET /api/vehicles/by-personnel/{personnelId}

**Purpose**: Get a personnel's vehicle by owner id

> Returns `404 VEHICLE_NOT_FOUND` (`MIL00050`) if the personnel has no vehicle.

---

### PUT /api/vehicles/{id}

**Purpose**: Update a vehicle

**Request**: same as `VehicleRequest`. Does **not** accept `personnelId` reassignment.

---

### DELETE /api/vehicles/{id}/images?imagePath={filename}

**Purpose**: Delete a single vehicle image

> The FE `VehicleImagesUpload` calls this immediately when a saved image is removed while editing a persisted vehicle.

---

### DELETE /api/vehicles/{id}

**Purpose**: Delete a vehicle and all its images

---

> **Error codes** `MIL00050`–`MIL00054` (not found, image not found / save failed / delete failed, already-exists-for-personnel) surface through the generic `apiClient` error toast — no special-case handling on the FE.

---

## Submission Group APIs

### GET /api/submission-groups

**Purpose**: List submission groups (paginated)

**Response item**:

```json
{
  "id": 123,
  "name": "Nhóm duyệt đơn vị",
  "description": "Mô tả nhóm",
  "userIds": [1, 2, 3]
}
```

---

### POST /api/submission-groups

**Purpose**: Create group

**Request**:

```json
{
  "name": "string (max 255)",
  "description": "string (max 1000)"
}
```

---

### PUT /api/submission-groups/{id}

**Purpose**: Update group

---

### DELETE /api/submission-groups/{id}

**Purpose**: Delete group (fails if used in a flow)

---

### POST /api/submission-groups/{id}/users

**Purpose**: Add users to group

**Request** (`SubmissionGroupUsersRequest`):

```json
{
  "userIds": [1, 2, 3]
}
```

> `userIds` is a **required array of integers** (not a single `userId`). Verified against live Swagger `/v3/api-docs`.

---

### DELETE /api/submission-groups/{id}/users

**Purpose**: Remove users from group

**Request**: same `SubmissionGroupUsersRequest` — `{ "userIds": [1, 2, 3] }`

---

## Submission Flow APIs

### GET /api/submission-flows

**Purpose**: List flows (paginated)

**Response item**:

```json
{
  "id": 123,
  "code": "LEAVE",
  "name": "Luồng phê duyệt nghỉ phép",
  "description": "Mô tả luồng",
  "groups": [
    { "orderNo": 1, "groupId": 10 },
    { "orderNo": 2, "groupId": 20 }
  ]
}
```

> **Note**: Swagger uses `groups` (not `steps`) for flow steps

---

### POST /api/submission-flows

**Purpose**: Create flow

**Request**:

```json
{
  "code": "string (max 100, unique, case-insensitive)",
  "name": "string (max 255)",
  "description": "string (max 1000)",
  "groups": [
    { "orderNo": 1, "groupId": 10 },
    { "orderNo": 2, "groupId": 20 }
  ]
}
```

**Validation**: No duplicate groups, orderNo must be continuous from 1

---

### PUT /api/submission-flows/{id}

**Purpose**: Update flow

---

### DELETE /api/submission-flows/{id}

**Purpose**: Delete flow

---

## Leave Approval Config APIs

### GET /api/leave-approval-configs

**Purpose**: List approval configs

**Response item**:

```json
{
  "id": 123,
  "militaryPosition": "TRUNG_DOI_TRUONG",
  "militaryPositionName": "Trung đội trưởng",
  "maxApprovalDays": 5,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "active": true
}
```

---

### POST /api/leave-approval-configs

**Purpose**: Create config

**Request**:

```json
{
  "militaryPosition": "TRUNG_DOI_TRUONG",
  "maxApprovalDays": 5,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "active": true
}
```

---

### PUT /api/leave-approval-configs/{id}

**Purpose**: Update config

---

### DELETE /api/leave-approval-configs/{id}

**Purpose**: Delete config

---

### PATCH /api/leave-approval-configs/{id}/active

**Purpose**: Toggle active status (empty body)

---

### GET /api/leave-approval-configs/applicable

**Purpose**: Get configs applicable for current user by position & date

---

## Leave Request APIs

### POST /api/leave-requests

**Purpose**: Create leave request

**Request**:

```json
{
  "leaveFrom": "2026-05-01",
  "leaveTo": "2026-05-05",
  "reason": "string",
  "allowedOutCount": 3
}
```

**Response**:

```json
{
  "id": 123,
  "militaryPersonnelId": 456,
  "userId": 789,
  "createdAt": "2026-04-22T10:00:00",
  "leaveFrom": "2026-05-01",
  "leaveTo": "2026-05-05",
  "status": "string",
  "flowId": 1,
  "currentOrderNo": 1,
  "currentRound": "1.0001",
  "currentAssignee": "username",
  "reason": "string",
  "allowedOutCount": 3,
  "usedOutCount": 0
}
```

---

### GET /api/leave-requests/my

**Purpose**: List user's own leave requests

---

### GET /api/leave-requests/pending

**Purpose**: List requests pending for current user's approval

**Frontend Usage**: Used by both `/requests` page (tab "Chờ tôi duyệt") and `/history` page (Lịch sử ra vào cổng)

---

### GET /api/leave-requests/{id}

**Purpose**: Get leave request details

---

### GET /api/leave-requests/{id}/histories

**Purpose**: Get approval history

**Response item**:

```json
{
  "id": 123,
  "round": "1.0001",
  "status": "TRINH | CHUA_XU_LY | DA_DUYET | TU_CHOI | TRA_VE",
  "assignee": "username",
  "order": 1,
  "reason": "string",
  "createdAt": "2026-04-22T10:00:00",
  "updatedAt": "2026-04-22T10:05:00"
}
```

---

### POST /api/leave-requests/{id}/accept

**Purpose**: Tiếp nhận đơn (accept for review). Empty body.

---

### POST /api/leave-requests/{id}/approve

**Purpose**: Duyệt đơn

**Request**:

```json
{
  "reason": "string (optional)"
}
```

---

### POST /api/leave-requests/{id}/return

**Purpose**: Trả về đơn

**Request**:

```json
{
  "reason": "string (required)"
}
```

---

### POST /api/leave-requests/{id}/submit-next

**Purpose**: Trình tiếp lên cấp trên. Empty body.

---

### PUT /api/leave-requests/{id}/edit

**Purpose**: Sửa đơn (khi đã bị trả về)

**Request**:

```json
{
  "leaveFrom": "date",
  "leaveTo": "date",
  "allowedOutCount": 3,
  "reason": "string"
}
```

---

### POST /api/leave-requests/{id}/resubmit

**Purpose**: Trình lại sau khi sửa. Empty body.

---

### POST /api/leave-requests/{id}/supplement

**Purpose**: Bổ sung đơn đã duyệt (mở vòng duyệt mới)

**Request**:

```json
{
  "leaveFrom": "date",
  "leaveTo": "date",
  "allowedOutCount": 3,
  "reason": "string"
}
```

---

### GET /api/leave-requests/approval-capability

**Purpose**: Check user's approval authority (quyền duyệt)

---

## QR Scan APIs

> **Note**: There is **no** `GET /api/qr-scan-logs` list endpoint in the live Swagger (`/v3/api-docs`) — only `scan`, `{id}`, `{id}/approve`, `{id}/reject`. The `useQRScan().getQRScanLogs` helper in `hooks/use-qr-scan.ts` calls `GET /api/qr-scan-logs` but that path does not exist server-side (would 404) — treat it as dead code until the BE adds it. The `/history` page renders `GET /api/leave-requests/pending` instead. Scan/approve/reject are used by the `/scan` gate-control page (camera scanning via `html5-qrcode`).

### POST /api/qr-scan-logs/scan

**Purpose**: Process QR scan at gate. Used by the `/scan` page.

**Request**:

```json
{
  "militaryPersonnel": {
    "id": 123,
    "code": "DV001-DAI-UY-TRUNG-DOI-TRUONG-00001",
    "fullName": "Hoàng Ngọc Chiến",
    "regionCode": "QK2",
    "rankCode": "DAI_UY",
    "unitCode": "DV001",
    "positionCode": "TRUNG_DOI_TRUONG"
  }
}
```

Or for civilian:

```json
{
  "citizen": {
    "name": "Nguyễn Văn B",
    "birthday": "1990-01-01",
    "address": "123 ABC, TP.HCM",
    "citizenId": "012345678901",
    "issueDate": "2020-01-01"
  }
}
```

**Response**:

```json
{
  "id": 123,
  "scanType": "MILITARY_PERSONNEL | CITIZEN",
  "scannedAt": "2026-04-22T10:00:00",
  "status": "DONG_Y | TU_CHOI | DANG_XU_LY",
  "reason": "string",
  "militaryPersonnelId": 456,
  "militaryPersonnelCode": "DV001-DAI-UY-...",
  "militaryPersonnelFullName": "Hoàng Ngọc Chiến",
  "citizenName": "string",
  "citizenBirthday": "date",
  "citizenAddress": "string",
  "citizenId": "string",
  "citizenIssueDate": "date",
  "leaveRequestId": 789,
  "approvedRoundNo": "1.0002"
}
```

---

### GET /api/qr-scan-logs/{id}

**Purpose**: Get scan log details

---

### POST /api/qr-scan-logs/{id}/approve

**Purpose**: Approve citizen entry. Empty body.

---

### POST /api/qr-scan-logs/{id}/reject

**Purpose**: Reject citizen entry

**Request**:

```json
{
  "reason": "string (optional)"
}
```

---

## Common/Upload APIs

### POST /api/common/upload-image?category={category}

**Purpose**: Upload image to S3. Single unified endpoint used for all image kinds.

**Query Parameter**: `category` — one of `personnel`, `region`, `unit`, `vehicle`

**Content-Type**: `multipart/form-data`

**Form field**: `multipartFile`

---

### GET /api/common/images/{category}/{filename}

**Purpose**: Retrieve image from S3

**URL examples**:

```
/api/common/images/personnel/xxx.jpg
/api/common/images/region/xxx.png
/api/common/images/unit/xxx.jpg
/api/common/images/vehicle/xxx.jpg
```

> **Note**: These paths are server-relative. Since the FE is a static export with no `/api/*` proxy, they must be prefixed with `NEXT_PUBLIC_BASE_API` to resolve — see `lib/image-url.ts`.

---

## Combobox APIs

All return `{ data: [{ code: string, name: string }] }`

### GET /api/common/combobox/ranks

Rank codes: `DAI_TUONG`, `THUONG_TUONG`, `TRUNG_TUONG`, `THIEU_TUONG`, `DAI_TA`, `THUONG_TA`, `TRUNG_TA`, `THIEU_TA`, `DAI_UY`, `THUONG_UY`, `TRUNG_UY`, `THIEU_UY`, etc.

### GET /api/common/combobox/positions

Position codes: `CHI_HUY_TRUONG`, `TRUNG_DOAN_TRUONG`, `TIEU_DOAN_TRUONG`, `DAI_DOI_TRUONG`, `TRUNG_DOI_TRUONG`, `TIEU_DOI_TRUONG`, etc.

### GET /api/common/combobox/regions

> ⚠️ Not in the live Swagger — this combobox endpoint does not exist in the current deployment and `use-combobox` no longer calls it.

### GET /api/common/combobox/units?regionCode=QK1

Returns units filtered by region and user role.

---

**Document End**
