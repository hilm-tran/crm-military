# Military Manager - API Integration Specification

**Version:** 2.0  
**Last Updated:** 2026-04-22  
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
    "imagePath": "string (optional)"
  }
}
```

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
  "imageUrl": "/api/common/images/personnel/xxx.jpg"
}
```

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

**Request**:

```json
{
  "userId": "integer"
}
```

---

### DELETE /api/submission-groups/{id}/users

**Purpose**: Remove users from group

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

### POST /api/qr-scan-logs/scan

**Purpose**: Process QR scan at gate

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

### POST /api/common/upload-image

**Purpose**: Upload image to S3 (personnel photo, region/unit logo)

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
```

---

## Combobox APIs

All return `{ data: [{ code: string, name: string }] }`

### GET /api/common/combobox/ranks

Rank codes: `DAI_TUONG`, `THUONG_TUONG`, `TRUNG_TUONG`, `THIEU_TUONG`, `DAI_TA`, `THUONG_TA`, `TRUNG_TA`, `THIEU_TA`, `DAI_UY`, `THUONG_UY`, `TRUNG_UY`, `THIEU_UY`, etc.

### GET /api/common/combobox/positions

Position codes: `CHI_HUY_TRUONG`, `TRUNG_DOAN_TRUONG`, `TIEU_DOAN_TRUONG`, `DAI_DOI_TRUONG`, `TRUNG_DOI_TRUONG`, `TIEU_DOI_TRUONG`, etc.

### GET /api/common/combobox/regions

Returns regions filtered by user role.

### GET /api/common/combobox/units?regionCode=QK1

Returns units filtered by region and user role.

---

**Document End**
