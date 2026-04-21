# Military Manager - API Integration Specification

**Version:** 1.0  
**Last Updated:** 2026-04-21

---

## API Client Configuration

### Base Setup

```typescript
// lib/api-client.ts
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export const apiClient = {
  fetch: async <T = any>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    // 1. Extract JWT from session cookie
    // 2. Auto-attach Authorization header
    // 3. Handle FormData for file uploads
    // 4. Parse response as JSON
    // 5. Throw on non-OK status
  },

  post: <T = any>(path: string, body: any) => {...},
  get: <T = any>(path: string) => {...},
};
```

### Request/Response Format

```
Request Header:
  Authorization: Bearer {token}
  Content-Type: application/json

Response Format (all endpoints):
  {
    "data": {...},
    "message": "Optional message",
    "status": 200
  }

Error Response:
  {
    "message": "Error description",
    "status": 400|401|403|500
  }
```

---

## Authentication APIs

### POST /api/auth/signin

**Purpose**: User login

**Request**:

```typescript
{
  username: string;
  password: string;
}
```

**Response**:

```typescript
{
  data: {
    token: string;              // JWT token
    type: "Bearer";
    user: {
      id: string;
      username: string;
      email: string;
      roles: string[];          // ["ROLE_SYSTEM_ADMIN"]
    };
  }
}
```

**Frontend Implementation**:

```typescript
// hooks/use-auth.ts
const signIn = async (data: SignInParams) => {
  const response = await fetch(`${BASE_API}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  Cookies.set(CookieNames.Session, JSON.stringify(result.data), {
    expires: 7,
    path: "/",
  });
  return result;
};
```

---

### POST /api/auth/signup

**Purpose**: Create new user + military personnel

**Requires**: JWT token (must be logged in first)

**Authorization**: Role-based

- `ROLE_USER`: ❌ Cannot create
- `ROLE_ADMIN_UNIT`: ✅ Can create in own unit
- `ROLE_ADMIN_REGION`: ✅ Can create in own region
- `ROLE_SYSTEM_ADMIN`: ✅ Can create anywhere

**Request**:

```typescript
{
  username: string;
  email: string;
  password?: string;
  role: string[];          // ["ROLE_USER"], ["ROLE_ADMIN_UNIT"], etc.
  militaryPersonnel: {
    fullName: string;
    rankCode: string;      // Reference to rank combobox
    unitCode: string;      // Reference to unit combobox
    positionCode: string;  // Reference to position combobox
    imagePath?: string;    // S3 path (from upload)
  }
}
```

**Response**:

```typescript
{
  data: {
    id: string;
    username: string;
    militaryPersonnel: {
      id: string;
      code: string; // Auto-generated: region|unit|rank|pos|00001
      qrCode: string; // Auto-generated QR
      fullName: string;
      // ...
    }
  }
}
```

**Frontend Implementation**:

```typescript
// hooks/use-soldier.ts
const createSoldier = useCallback(async (data: CreateSoldierParams) => {
  const result = await apiClient.post("/api/auth/signup", data);
  addToast({
    title: "Thành công",
    description: "Đã thêm quân nhân mới",
    color: "success",
  });
  return result;
}, []);
```

---

### POST /api/auth/signout

**Purpose**: User logout

**Response**:

```typescript
{
  data: null,
  message: "Signed out successfully"
}
```

---

## Personnel APIs

### GET /api/personnel

**Purpose**: List military personnel with pagination & search

**Query Parameters**:

```
page=0          // 0-indexed
size=10         // Items per page
keyword=abc     // Search by name/code (optional)
```

**Response**:

```typescript
{
  data: {
    content: Soldier[];
    totalPages: number;
    totalElements: number;
    number: number;         // Current page (0-indexed)
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }
}
```

**Frontend Usage**:

```typescript
const { getSoldiers } = useSoldier();
const response = await getSoldiers({ page: 0, size: 10, keyword: "" });
```

---

### POST /api/personnel/upload-image

**Purpose**: Upload personnel photo

**Content-Type**: `multipart/form-data`

**Request Body**:

```
multipartFile: File  // Binary file data
```

**Response**:

```typescript
{
  data: {
    filename: string; // "personnel_20260421_xyz.jpg"
    path: string; // "/api/common/images/personnel/personnel_20260421_xyz.jpg"
    url: string; // Full S3 URL
  }
}
```

**Frontend Implementation**:

```typescript
const uploadImage = useCallback(async (file: File) => {
  const formData = new FormData();
  formData.append("multipartFile", file);

  const result = await apiClient.fetch("/api/personnel/upload-image", {
    method: "POST",
    body: formData,
  });
  return result;
}, []);
```

---

## Region APIs

### GET /api/military-regions

**Purpose**: List all military regions

**Response**:

```typescript
{
  data: [
    {
      id: string;
      code: string;        // "VN_HCM" (unique)
      name: string;        // "Ho Chi Minh Region"
      logoPath?: string;   // S3 path
    }
  ]
}
```

---

### POST /api/military-regions

**Purpose**: Create new region

**Request**:

```typescript
{
  code: string;        // Must be unique
  name: string;
  logoPath?: string;   // From upload
}
```

---

### PUT /api/military-regions/{id}

**Purpose**: Update region

---

### DELETE /api/military-regions/{id}

**Purpose**: Delete region

---

## Unit APIs

### GET /api/military-units

**Purpose**: List all units (optionally filtered by region)

**Query Parameters**:

```
regionCode=VN_HCM  // Optional filter
```

---

### POST /api/military-units

**Purpose**: Create new unit

**Request**:

```typescript
{
  code: string;
  name: string;
  regionCode: string;   // Must reference existing region
  logoPath?: string;
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

**Purpose**: List all submission groups

**Response**:

```typescript
{
  data: [
    {
      id: string;
      name: string;        // "Unit Approvers"
      description?: string;
      userIds?: string[];  // Users in this group
    }
  ]
}
```

---

### POST /api/submission-groups

**Purpose**: Create new group

**Request**:

```typescript
{
  name: string;
  description?: string;
}
```

---

### POST /api/submission-groups/{id}/users

**Purpose**: Add user to group

**Request**:

```typescript
{
  userId: string;
}
```

---

### DELETE /api/submission-groups/{id}/users/{userId}

**Purpose**: Remove user from group

---

### DELETE /api/submission-groups/{id}

**Purpose**: Delete group (only if not used in any flow)

---

## Submission Flow APIs

### GET /api/submission-flows

**Purpose**: List all submission flows

**Response**:

```typescript
{
  data: [
    {
      id: string;
      code: string;        // "LEAVE" or "NGHI_PHEP" (unique, case-insensitive)
      name: string;
      steps: Array<{
        orderNo: number;   // 1, 2, 3, ...
        groupId: string;
      }>;
    }
  ]
}
```

---

### POST /api/submission-flows

**Purpose**: Create new flow

**Request**:

```typescript
{
  code: string; // Unique, will be normalized to uppercase
  name: string;
  steps: Array<{
    orderNo: number; // Must be 1, 2, 3, ... (continuous)
    groupId: string; // Must reference existing group
  }>;
}
```

**Validation**:

- Code must be unique (case-insensitive)
- OrderNo must start from 1 and be continuous
- No duplicate groups in same flow
- GroupId must exist

---

### PUT /api/submission-flows/{id}

**Purpose**: Update flow

---

### DELETE /api/submission-flows/{id}

**Purpose**: Delete flow

---

## Leave Approval Config APIs

### GET /api/leave-approval-configs

**Purpose**: List all approval configs

**Response**:

```typescript
{
  data: [
    {
      id: string;
      militaryPosition: string;   // "CAPTAIN", "MAJOR", etc.
      maxApprovalDays: number;    // 5, 10, 30, etc.
      effectiveFrom: string;      // "2026-01-01"
      effectiveTo: string;        // "2026-12-31"
      active: boolean;
    }
  ]
}
```

---

### POST /api/leave-approval-configs

**Purpose**: Create new config

**Request**:

```typescript
{
  militaryPosition: string;
  maxApprovalDays: number;
  effectiveFrom: string;   // ISO date
  effectiveTo: string;     // ISO date
  active?: boolean;        // Default: true
}
```

**Validation**:

- `effectiveFrom <= effectiveTo`
- For same position: no overlapping date ranges
- Unique constraint: `(militaryPosition, effectiveFrom, effectiveTo)`

---

### PUT /api/leave-approval-configs/{id}

**Purpose**: Update config

---

### PATCH /api/leave-approval-configs/{id}/active

**Purpose**: Toggle active status

**Request Body**:

```typescript
{
} // Empty, just toggle current state
```

---

### DELETE /api/leave-approval-configs/{id}

**Purpose**: Delete config

---

### GET /api/leave-approval-configs/applicable

**Purpose**: Get configs applicable for current logged-in user

**Response**:

```typescript
{
  data: [
    {
      id: string;
      militaryPosition: string;
      maxApprovalDays: number;
      // ...
    }
  ]
}
```

---

## Leave Request APIs

### POST /api/leave-requests

**Purpose**: Create new leave request

**Request**:

```typescript
{
  militaryPersonnelId: string;
  leaveFrom: string;           // ISO date "2026-05-01"
  leaveTo: string;             // ISO date "2026-05-05"
  allowedOutCount: number;     // 3
  reason?: string;
}
```

**Backend Processing**:

1. Find default flow (code = "LEAVE" or "NGHI_PHEP")
2. Create LeaveRequest record
3. Create Round 1.0001: assignee=requestor, status=TRINH
4. Create Round 1.0002: assignee=next_in_flow, status=CHUA_XU_LY
5. Return created request

**Response**:

```typescript
{
  data: {
    id: string;
    militaryPersonnelId: string;
    userId: string;
    leaveFrom: string;
    leaveTo: string;
    status: string;
    flowId: string;
    currentOrderNo: number;
    currentRound: string;
    currentAssignee: string;
    allowedOutCount: number;
    usedOutCount?: null;
  }
}
```

---

### GET /api/leave-requests/my

**Purpose**: Get current user's leave requests

**Response**:

```typescript
{
  data: LeaveRequest[]
}
```

---

### GET /api/leave-requests/pending

**Purpose**: Get leave requests pending for current user's approval

**Response**:

```typescript
{
  data: LeaveRequest[]
}
```

---

### GET /api/leave-requests/{id}

**Purpose**: Get specific leave request details

---

### GET /api/leave-requests/{id}/histories

**Purpose**: Get approval history for a leave request

**Response**:

```typescript
{
  data: [
    {
      id: string;
      round: string;       // "1.0001", "1.0002", "2.0001", etc.
      status: string;      // "TRINH", "CHUA_XU_LY", "DA_DUYET", "TU_CHOI", "TRA_VE"
      assignee: string;    // Username
      order: number;       // Flow step
      reason?: string;
      createdAt: string;
      updatedAt: string;
    }
  ]
}
```

---

### POST /api/leave-requests/{id}/accept

**Purpose**: Accept (tiếp nhận) a leave request

**Request Body**:

```typescript
{
} // Empty
```

**Result**: Round status changes from CHUA_XU_LY to TRINH (in review)

---

### POST /api/leave-requests/{id}/approve

**Purpose**: Approve leave request

**Request Body**:

```typescript
{
  reason?: string;  // Optional approval note
}
```

**Result**:

- Current round marked as DA_DUYET
- Move to next round or complete if last step
- User can now pass QR validation

---

### POST /api/leave-requests/{id}/return

**Purpose**: Return (reject) leave request

**Request Body**:

```typescript
{
  reason: string; // Mandatory rejection reason
}
```

**Result**:

- Current round marked as TRA_VE
- Status reverts to pending requestor action
- Requestor must edit and resubmit

---

### POST /api/leave-requests/{id}/submit-next

**Purpose**: Escalate to next approval level

**Request Body**:

```typescript
{
} // Empty
```

**Scenario**:

- Current approver doesn't have enough `maxApprovalDays`
- Forward to next level in flow
- Creates new round with higher authority

---

### PUT /api/leave-requests/{id}/edit

**Purpose**: Edit leave request details

**Requires**: Must be creator and in returned state

**Request Body**:

```typescript
{
  leaveFrom?: string;
  leaveTo?: string;
  allowedOutCount?: number;
  reason?: string;
}
```

---

### POST /api/leave-requests/{id}/resubmit

**Purpose**: Resubmit after rejection

**Result**:

- Create new Round 1.0001 (restart workflow)
- Previous rounds preserved in history

---

### POST /api/leave-requests/{id}/supplement

**Purpose**: Request amendment to approved leave

**Request Body**:

```typescript
{
  leaveFrom?: string;
  leaveTo?: string;
  allowedOutCount?: number;
  reason?: string;
}
```

**Backend Processing**:

1. Increment major round number (1 → 2, 2 → 3, etc.)
2. Create new Round 2.0001 (for requestor to submit)
3. Create new Round 2.0002 (for next approver)
4. Restart approval workflow

---

## QR Scan APIs

### POST /api/qr-scan-logs/scan

**Purpose**: Process QR scan

**Request**:

```typescript
{
  data:
    | {  // Military Personnel
        id: string;
        fullName: string;
        rankCode: string;
        unitCode: string;
        positionCode: string;
        qrCode: string;
      }
    | {  // Civilian
        name: string;
        birthday: string;
        address: string;
        citizenId: string;
        issueDate: string;
      }
}
```

**Backend Validation (Military Personnel)**:

```
IF type = MILITARY:
  1. Find valid approved leave request for this person
  2. Check: status = DA_DUYET
  3. Check: today ∈ [leaveFrom, leaveTo]
  4. Check: usedOutCount < allowedOutCount

  IF all pass:
    → status = DONG_Y
    → usedOutCount = usedOutCount + 1
  ELSE:
    → status = TU_CHOI
    → reason = "Không có quyền ra"

IF type = CIVILIAN:
  → status = DANG_XU_LY (manual approval required)
```

**Response**:

```typescript
{
  data: {
    id: string;
    type: "MILITARY_PERSONNEL" | "CITIZEN";
    status: "DANG_XU_LY" | "DONG_Y" | "TU_CHOI";
    payload: {...};  // Original QR data
    reason?: string;
    createdAt: string;
  }
}
```

---

### POST /api/qr-scan-logs/{id}/approve

**Purpose**: Approve civilian entry

**Request Body**:

```typescript
{
} // Empty
```

**Result**: status changes from DANG_XU_LY to DONG_Y

---

### POST /api/qr-scan-logs/{id}/reject

**Purpose**: Reject civilian entry

**Request Body**:

```typescript
{
  reason?: string;  // Optional rejection reason
}
```

**Result**: status changes from DANG_XU_LY to TU_CHOI

---

### GET /api/qr-scan-logs/{id}

**Purpose**: Get specific scan log details

---

## Common/Upload APIs

### POST /api/common/upload-image

**Purpose**: Upload file (personnel photo, region/unit logo)

**Query Parameters**:

```
category=personnel|region|unit
```

**Content-Type**: `multipart/form-data`

**Request Body**:

```
multipartFile: File
```

**Response**:

```typescript
{
  data: {
    filename: string;
    path: string;
    url: string;
  }
}
```

---

### GET /api/common/images/{category}/{filename}

**Purpose**: Retrieve image from S3

**URL Format**:

```
/api/common/images/personnel/xyz_photo.jpg
/api/common/images/region/logo_hcm.png
/api/common/images/unit/logo_unit_1.png
```

---

## Combobox APIs

### GET /api/common/combobox/ranks

**Purpose**: Get list of ranks for dropdowns

**Response**:

```typescript
{
  data: [
    { code: "SOLDIER", name: "Binh nhất" },
    { code: "CORPORAL", name: "Hạ sĩ" },
    { code: "SERGEANT", name: "Trung sĩ" },
    // ...
  ];
}
```

---

### GET /api/common/combobox/positions

**Purpose**: Get list of positions

**Response**:

```typescript
{
  data: [
    { code: "RECRUIT", name: "Tân binh" },
    { code: "STAFF", name: "Nhân viên" },
    { code: "OFFICER", name: "Sĩ quan" },
    // ...
  ];
}
```

---

### GET /api/common/combobox/regions

**Purpose**: Get list of regions (filtered by user role)

**Response**:

```typescript
{
  data: [
    { code: "VN_HCM", name: "Ho Chi Minh Region" },
    { code: "VN_HN", name: "Hanoi Region" },
    // ...
  ];
}
```

---

### GET /api/common/combobox/units?regionCode=VN_HCM

**Purpose**: Get units in specific region (filtered by user role)

**Query Parameters**:

```
regionCode=VN_HCM  // Optional
```

**Response**:

```typescript
{
  data: [
    { code: "UNIT_001", name: "Tiểu đoàn 1" },
    { code: "UNIT_002", name: "Tiểu đoàn 2" },
    // ...
  ];
}
```

---

## Error Response Examples

### 400 Bad Request

```json
{
  "message": "Invalid request: effectiveFrom must be before effectiveTo",
  "status": 400
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized: Invalid or expired token",
  "status": 401
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden: Insufficient permissions to approve leave",
  "status": 403
}
```

### 404 Not Found

```json
{
  "message": "Leave request not found",
  "status": 404
}
```

### 409 Conflict

```json
{
  "message": "Conflict: Region code already exists",
  "status": 409
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error: Database connection failed",
  "status": 500
}
```

---

## Rate Limiting & Throttling

⚠️ **TODO**: Implement rate limiting

Suggested:

- Login: 5 attempts per minute
- General API: 100 requests per minute per user
- File upload: 10 MB per file, 100 MB per day

---

## CORS Configuration

⚠️ **TODO**: Configure CORS headers

Expected:

```
Access-Control-Allow-Origin: https://military-manager.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

**Document End**
