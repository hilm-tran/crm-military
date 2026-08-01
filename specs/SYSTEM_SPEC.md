# Military Manager - Frontend System Specification

**Version:** 1.1  
**Last Updated:** 2026-07-21  
**Status:** In Development

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Module Specifications](#module-specifications)
4. [Pages & Routes](#pages--routes)
5. [API Integration](#api-integration)
6. [Data Models](#data-models)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Business Workflows](#business-workflows)
9. [Component Requirements](#component-requirements)
10. [State Management](#state-management)
11. [Error Handling](#error-handling)
12. [Security](#security)

---

## System Overview

**Military Manager** is a comprehensive military personnel management system with the following core responsibilities:

- **Personnel Management**: CRUD operations for military personnel with auto-generated QR codes
- **Organization Management**: Manage military regions and units with hierarchical structure
- **Leave Request Workflow**: Multi-level approval workflow for leave requests with round-based tracking
- **QR Gate Access Control**: QR code scanning for entrance/exit with automatic permission validation
- **Role-Based Access Control**: Fine-grained permissions based on military hierarchy

### Key Features

- ✅ JWT-based authentication with session persistence
- ✅ Multi-role authorization (SYSTEM_ADMIN, ADMIN_REGION, ADMIN_UNIT, USER, MODERATOR)
- ✅ Dynamic leave approval configuration by military position
- ✅ Multi-round leave request amendment workflow
- ✅ Real-time QR scan validation with DynamoDB
- ✅ File upload to S3 for personnel images and logos
- ✅ Bilingual support (English + Vietnamese)

---

## Architecture

### Tech Stack

```
Frontend: Next.js 15 (App Router, Turbopack dev)
UI Library: HeroUI 2.8 + Tailwind CSS 4
State Management: React Hooks (useCallback, useMemo)
HTTP Client: Custom apiClient with JWT auto-attach (cookie session via js-cookie)
Icons: Iconify
QR Code: qrcode (render) + html5-qrcode (camera scan on /scan)
Data Validation: react-hook-form
Database: DynamoDB (backend)
File Storage: AWS S3
```

### Folder Structure

```
military-fe/
├── app/
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (private)/
│   │   ├── dashboard/
│   │   ├── soldiers/
│   │   ├── add-soldier/
│   │   ├── vehicles/
│   │   ├── scan/
│   │   ├── requests/
│   │   ├── history/
│   │   ├── units/
│   │   ├── submission-groups/
│   │   ├── submission-flows/
│   │   └── leave-approval-configs/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── AuthGuard.tsx
│   ├── PageHeader.tsx
│   ├── SoldierTable.tsx
│   ├── AddSoldierModal.tsx
│   ├── ImageUpload.tsx
│   ├── QRModal.tsx
│   ├── SoldierVehicleModal.tsx
│   ├── VehicleFormFields.tsx
│   ├── VehicleImagesUpload.tsx
│   ├── VehicleDeleteModal.tsx
│   └── ...
├── hooks/
│   ├── use-auth.ts
│   ├── use-soldier.ts
│   ├── use-vehicle.ts
│   ├── use-unit.ts
│   ├── use-submission.ts
│   ├── use-leave-request.ts
│   ├── use-leave-approval-config.ts
│   ├── use-qr-scan.ts
│   ├── use-combobox.ts
│   └── use-debounce.ts
├── lib/
│   ├── api-client.ts
│   ├── image-url.ts
│   └── routes/
│       ├── routes.config.ts
│       ├── routes.type.ts
│       └── routes.util.ts
├── types/
│   ├── global.type.ts
│   ├── global.enum.ts
│   └── index.ts
├── config/
│   ├── fonts.ts
│   └── site.ts
├── specs/
│   ├── SYSTEM_SPEC.md (this file)
│   ├── API_SPEC.md
│   └── ...
└── package.json
```

---

## Module Specifications

### 1. Authentication Module

**Responsibility**: Manage user login/logout and session persistence

**Key Files**:

- `hooks/use-auth.ts`
- `app/(public)/login/page.tsx`

**Features**:

- Login with username/password
- JWT token storage in cookies with 7-day expiration
- Automatic token attachment to API headers
- Logout with session cleanup
- Error handling with user-friendly messages

**API Endpoints**:

- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

---

### 2. Personnel Management Module

**Responsibility**: CRUD operations for military personnel

**Key Files**:

- `hooks/use-soldier.ts`
- `components/SoldierTable.tsx`
- `components/AddSoldierModal.tsx`
- `components/ImageUpload.tsx`
- `app/(private)/soldiers/page.tsx`
- `app/(private)/add-soldier/page.tsx`

**Features**:

- View paginated list of personnel (10 per page)
- Search by name/code with 500ms debounce
- Display auto-generated QR codes
- Add new personnel with image upload
- Role-based visibility filtering
- Image caching with localStorage

**API Endpoints**:

- `POST /api/auth/signup` - Create personnel + user account (optional nested `vehicle`)
- `GET /api/personnel?page=0&size=10&keyword=...` - List with pagination
- `DELETE /api/personnel/{id}` - Delete personnel
- `POST /api/common/upload-image?category=personnel` - Upload personnel image (unified upload endpoint)
- `GET /api/common/images/personnel/{filename}` - Retrieve image

**Data Model** (actual, from `hooks/use-soldier.ts`):

```typescript
interface Soldier {
  id: number;
  fullName: string;
  rankCode: string | null;
  unitCode: string | null;
  positionCode: string | null;
  code: string; // Auto-generated: region|unit|rank|position|00001
  qrCode: string; // base64 PNG, system-generated
  qrSource: string;
  imageUrl: string | null;
  vehicle?: VehicleResponse | null; // nested 1:1 vehicle, see Vehicle module
}
```

---

### 3. Organization Management Module

**Responsibility**: Manage military units

> **Change (2026-07-21)**: The `use-region` hook and the regions management UI were **removed from the FE**. Regions still exist on the backend (and `regionCode` is still stored on units/personnel), but there is no FE screen or hook to CRUD them. Only units are managed through the UI (`/units`).

**Key Files**:

- `hooks/use-unit.ts`
- `app/(private)/units/page.tsx`

**Features**:

- Create/Update/Delete units
- Search + pagination
- The `/units` form UI captures **only `unitCode` + `unitName`** (simplified). The backend `CreateUnitParams` still supports `address`, `establishedDate`, `description`, `logoPath`, but these are no longer edited/shown in the UI (table columns Địa chỉ/Logo were also removed). `uploadLogo` remains in `use-unit` but is unused by the page.

**API Endpoints**:

- `CRUD /api/military-units`
- `POST /api/common/upload-image?category=unit`
- `GET /api/common/combobox/units?regionCode=...`

**Data Model**:

```typescript
interface MilitaryUnit {
  id: number;
  regionCode: string;
  unitCode: string; // Unique
  unitName: string;
  address?: string;
  establishedDate?: string;
  description?: string;
  logoUrl?: string; // response (request uses logoPath)
}
```

---

### 3b. Vehicle Management Module

**Responsibility**: Manage a personnel's vehicle (1:1). Added 2026-07-21.

**Key Files**:

- `hooks/use-vehicle.ts`
- `app/(private)/vehicles/page.tsx`
- `components/SoldierVehicleModal.tsx`, `components/VehicleFormFields.tsx`, `components/VehicleImagesUpload.tsx`, `components/VehicleDeleteModal.tsx`

**Features**:

- Attach a vehicle to a personnel (create), 1:1 constraint
- View/update/delete a personnel's vehicle + images
- Vehicle type is a fixed client-side enum (`CAR` = Ô tô, `MOTORBIKE` = Xe máy, `OTHER` = Khác) — no combobox endpoint
- Multi-image upload (≤10) via `POST /api/common/upload-image?category=vehicle`; removing a saved image deletes it server-side immediately
- Three entry points: Add-Soldier form section (switch-gated), per-soldier table action, standalone `/vehicles` page

**API Endpoints**:

- `POST /api/vehicles?personnelId={id}` - Attach
- `GET /api/vehicles?page&size&keyword` - List (keyword: plate/brand/model)
- `GET /api/vehicles/{id}` - Detail
- `GET /api/vehicles/by-personnel/{personnelId}` - Detail by owner
- `PUT /api/vehicles/{id}` - Update
- `DELETE /api/vehicles/{id}/images?imagePath=...` - Delete one image
- `DELETE /api/vehicles/{id}` - Delete vehicle + all images

**Data Model** (from `hooks/use-vehicle.ts`):

```typescript
type VehicleType = "CAR" | "MOTORBIKE" | "OTHER";

interface VehicleResponse {
  id: number;
  personnelId: number;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  licensePlate: string;
  imageUrls: string[]; // server-relative, prefix with NEXT_PUBLIC_BASE_API
}
```

---

### 4. Submission Flow Module

**Responsibility**: Manage approval workflow groups and sequences

**Key Files**:

- `hooks/use-submission.ts`

**Features**:

- Create/manage submission groups (collection of users)
- Add/remove users from groups
- Define submission flows with ordered steps
- Each flow step references a group
- Prevent deletion of groups used in active flows
- Code-based flow identification (LEAVE, NGHI_PHEP, etc.)

**API Endpoints**:

- `CRUD /api/submission-groups`
- `POST/DELETE /api/submission-groups/{id}/users`
- `CRUD /api/submission-flows`

**Data Model**:

```typescript
interface SubmissionGroup {
  id: string;
  name: string;
  description?: string;
  userIds?: string[]; // Users in this group
}

interface SubmissionFlow {
  id: string;
  code: string; // Unique, case-insensitive (LEAVE, NGHI_PHEP)
  name: string;
  steps: Array<{
    orderNo: number; // 1, 2, 3, ... (must be continuous)
    groupId: string; // Reference to SubmissionGroup
  }>;
}
```

---

### 5. Leave Request Module

**Responsibility**: Manage employee leave requests with multi-round approval workflow

**Key Files**:

- `hooks/use-leave-request.ts`
- `app/(private)/requests/page.tsx`

> ⚠️ **BE ACTION**: `LeaveRequestResponse` currently returns only `militaryPersonnelId` (no name). The `/requests` "NHÂN SỰ" column therefore shows the id. Backend should add the personnel **name** to the response (e.g. `militaryPersonnelFullName`). The FE `personnelLabel(req)` already renders that field the moment it appears — no per-row detail fetch is made (decision: don't call `/api/personnel/{id}` N times just for names).

**Features**:

- Create leave request (from/to dates, number of allowed exits)
- Fetch personal leave requests
- Fetch pending requests for approval
- Accept/Approve/Return/Submit to next level
- Edit and resubmit after rejection
- Supplement (amend) approved requests
- View approval history with round tracking

**Workflow Rounds**:

```
Round Format: major.minor (e.g., 1.0001, 1.0002, 2.0001)

Initial Submit:
  └─ Round 1.0001: Requestor (status=TRINH)
  └─ Round 1.0002: Next approver (status=CHUA_XU_LY)

If Approved → Process ends at DA_DUYET

If Returned:
  └─ Requestor edits & resubmit
  └─ Repeat from Round 1.0001

If Approved then Supplement:
  └─ Increment major round: 2.0001, 2.0002, ...
  └─ Repeat approval process
```

**API Endpoints**:

- `POST /api/leave-requests` - Create
- `GET /api/leave-requests/my` - My requests
- `GET /api/leave-requests/pending` - Pending for approval
- `GET /api/leave-requests/{id}` - Details
- `GET /api/leave-requests/{id}/histories` - Approval history
- `POST /api/leave-requests/{id}/accept` - Accept
- `POST /api/leave-requests/{id}/approve` - Approve
- `POST /api/leave-requests/{id}/return` - Return (reject)
- `PUT /api/leave-requests/{id}/edit` - Edit
- `POST /api/leave-requests/{id}/resubmit` - Resubmit after return
- `POST /api/leave-requests/{id}/supplement` - Request amendment
- `POST /api/leave-requests/{id}/submit-next` - Escalate to next level

**Data Model**:

```typescript
interface LeaveRequest {
  id: string;
  militaryPersonnelId: string;
  userId: string;
  leaveFrom: string; // ISO date
  leaveTo: string; // ISO date
  status: string; // PENDING, DA_DUYET, TU_CHOI, etc.
  flowId: string;
  currentOrderNo: number;
  currentRound: string; // e.g., "1.0001"
  currentAssignee: string; // Username
  allowedOutCount: number; // Authorized exits during leave
  usedOutCount?: number; // Actual exits (updated by QR scan)
}

interface LeaveRequestHistory {
  id: string;
  round: string;
  status: string;
  assignee: string;
  order: number;
  reason?: string;
  createdAt: string;
}
```

---

### 6. Leave Approval Configuration Module

**Responsibility**: Configure approval permissions by military position

**Key Files**:

- `hooks/use-leave-approval-config.ts`

**Features**:

- Define maximum approvable days per military position
- Set effective date ranges with no overlaps
- Toggle config active/inactive
- Query applicable configs for current user
- Validate date range constraints

**Constraints**:

- `effectiveFrom <= effectiveTo`
- For same position: no overlapping date ranges
- Composite unique key: `(militaryPosition, effectiveFrom, effectiveTo)`

**API Endpoints**:

- `CRUD /api/leave-approval-configs`
- `PATCH /api/leave-approval-configs/{id}/active`
- `GET /api/leave-approval-configs/applicable`

**Data Model**:

```typescript
interface LeaveApprovalConfig {
  id: string;
  militaryPosition: string; // e.g., "CAPTAIN", "MAJOR"
  maxApprovalDays: number; // Max days can approve
  effectiveFrom: string; // ISO date
  effectiveTo: string; // ISO date
  active: boolean;
}
```

---

### 7. QR Scan Module

**Responsibility**: Handle entrance/exit gate scanning

**Key Files**:

- `hooks/use-qr-scan.ts`
- `app/(private)/scan/page.tsx` (camera scanning via `html5-qrcode`)

**Features**:

- Two capture modes on `/scan`:
  - **Hardware barcode/QR scanner (keyboard wedge)** — an auto-focused input; the scanner "types" the value + Enter → submits. Primary at the gate.
  - **Device camera** (`html5-qrcode`) — decodes the QR image directly in the browser (bypasses keyboard-layout issues; best for Vietnamese CCCD names).
- Input parsing (`processQRData`):
  - JSON payload → military (`qrCode`/`unitCode`/`rankCode`/`code`) or citizen (`citizenId`).
  - **CCCD (`|`-delimited)** → parsed into `citizen` (`citizenId`, `name`, `birthday`, `address`, `issueDate`); dates `DDMMYYYY`→`YYYY-MM-DD`.
  - **Option+digit recovery**: a mis-configured HID scanner on macOS emits digits as Option-symbols (`º¡™£¢∞§¶•ª`); these are mapped back to `0–9` (deterministic, safe).
- For military personnel: auto-validate against leave requests
- For civilians: manual approval workflow (approve/reject on `/scan`)
- Automatic `usedOutCount` increment on successful scan

> **Known hardware limitation**: a USB barcode scanner is an HID keyboard, so Vietnamese diacritics in CCCD name/address can be corrupted by the scanner/OS keyboard layout before the browser receives them — not fixable in-app. Numbers (CCCD id, dates) are recovered reliably; for correct Vietnamese text use the **camera** mode or a scanner set to US-keyboard + UTF-8 output.

> **Note**: `/history` currently renders pending leave requests (`getPendingLeaveRequests`), not scan logs. There is **no** `GET /api/qr-scan-logs` list endpoint in the live Swagger; `getQRScanLogs` in `use-qr-scan.ts` targets a non-existent path (dead code, would 404) until the BE adds it.

**Scan Validation Logic (Military Personnel)**:

```
When QR scanned:
  1. Check if valid leave request exists
  2. Verify status = DA_DUYET
  3. Verify current date ∈ [leaveFrom, leaveTo]
  4. Verify usedOutCount < allowedOutCount

  If all pass:
    → Status = DONG_Y
    → usedOutCount++
  Else:
    → Status = TU_CHOI
    → reason = "Không có quyền ra"
```

**API Endpoints**:

- `POST /api/qr-scan-logs/scan` - Scan QR
- `POST /api/qr-scan-logs/{id}/approve` - Approve civilian
- `POST /api/qr-scan-logs/{id}/reject` - Reject civilian
- `GET /api/qr-scan-logs/{id}` - Get scan details

> No list endpoint (`GET /api/qr-scan-logs`) exists in the live API.

**Data Model**:

```typescript
interface QRScanLog {
  id: string;
  type: "MILITARY_PERSONNEL" | "CITIZEN";
  status: "DANG_XU_LY" | "DONG_Y" | "TU_CHOI";
  payload: Record<string, any>; // QR data
  reason?: string;
  createdAt: string;
}
```

---

### 8. Combobox / Dropdown Data Module

**Responsibility**: Provide dropdown data for forms

**Key Files**:

- `hooks/use-combobox.ts`

**Features**:

- Fetch ranks list (`getRanks`)
- Fetch positions list (`getPositions`)
- Fetch units list (`getUnits`, filtered by region + user role)

> **Change (2026-07-21)**: `getRegions` was removed from `use-combobox` along with the regions UI.

**API Endpoints**:

- `GET /api/common/combobox/ranks`
- `GET /api/common/combobox/positions`
- `GET /api/common/combobox/units?regionCode=...`

---

## Planned Modules (not yet implemented)

Derived from the initiative document *"Thuyết minh sáng kiến — Phần mềm quản lý ra vào doanh trại"* (Tiểu đoàn 5, Trường SQ Lục quân 1, 2026). These are in-scope for the product but have **no backend endpoint or FE screen yet** (verified against live Swagger `/v3/api-docs`, 2026-07-21). Listed here so the spec reflects full intended scope, clearly marked as roadmap.

### P1. Visitor / Guest Management (Quản lý khách)

- Manage a list of visitors (công dân/khách liên hệ công tác) with entry/exit timestamps, not just the inline citizen branch of `/scan`.
- Extend actor types to **công nhân viên chức quốc phòng** and **người lao động hợp đồng**.
- Needs: `GET/POST /api/visitors` (or reuse a `qr-scan-logs` list with `scanType=CITIZEN`), plus a `/visitors` page.

### P2. Statistics & Reports (Thống kê & báo cáo)

- Gate-traffic statistics by day / week / month / unit / subject; export reports for command staff.
- Powers the Dashboard chart + "trong/ngoài doanh trại" card (currently **mock** — no data source).
- Needs (suggested): `GET /api/statistics/gate-traffic?period=&unitCode=`, `GET /api/statistics/barracks`, and a report-export endpoint.

### P3. Scan-Log History & Search (Lịch sử & tra cứu)

- A real entry/exit **log list** with filters by name / unit / time / CCCD.
- Requires a `GET /api/qr-scan-logs` list endpoint (does not exist today; `getQRScanLogs` currently targets a non-existent path). Once available, repoint `/history` to it instead of pending leave requests.

### P4. Portrait Verification at Gate (Đối chiếu ảnh chân dung)

- On scan, display the person's portrait photo for the duty officer to visually confirm identity.
- Requires the scan response (`QRScanLog`) to include the personnel `imageUrl` (not present today).

### P5. Audit Log (Nhật ký thao tác)

- Operation/audit logging of sensitive actions (account management, approvals, deletions).
- Needs a backend audit endpoint + an admin log view.

> Hardware/deployment note from the initiative: gate uses a dedicated USB/Bluetooth QR scanner on a LAN/on-prem server. The current FE is a static export talking to AWS API Gateway and scans via device camera (`html5-qrcode`) — reconcile before field deployment.

---

## Pages & Routes

### Public Routes

```
/login                          → Login page (public)
```

### Private Routes (require authentication)

```
/dashboard                      → Overview with stats
/scan                           → QR gate scanning (camera)
/soldiers                       → List all personnel with search/pagination
/vehicles                       → Vehicle list / manage by personnel id
/add-soldier                    → Form to add new personnel (+ optional vehicle)
/requests                       → Leave request approval queue
/history                        → Ra/vào view (pending leave requests)
/units                          → Unit management
/submission-groups              → Approval groups (members)
/submission-flows               → Approval flows (ordered groups)
/leave-approval-configs         → Leave approval config by position
```

> Routes are auto-generated from the `app/(private)` folder tree by `lib/routes/scripts/generate-routes.ts` (`npx tsx`) — do not hand-edit `routes.config.ts` / `routes.util.ts`.

---

## API Integration

### Base Configuration

```typescript
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
// Example: https://xgour62062.execute-api.ap-southeast-2.amazonaws.com

// Proxy in next.config.mjs:
// /api/* → https://xgour62062.execute-api.ap-southeast-2.amazonaws.com/api/*
```

### Authentication Flow

1. User submits credentials on login page
2. Frontend calls `POST /api/auth/signin`
3. Backend returns JWT token in response
4. Frontend stores token + type in cookie: `{token, type}`
5. `apiClient` automatically attaches `Authorization: Bearer {token}` header

### Error Handling

- All API calls wrapped in try-catch
- Failed responses throw `Error` with backend message
- Toast notifications for user feedback (HeroUI toast)
- Console logging for debugging

---

## Data Models

### Common Interfaces

```typescript
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface PaginatedResponse<T> {
  data: {
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    content: T[];
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}
```

---

## User Roles & Permissions

### Role Hierarchy

```
SYSTEM_ADMIN (全权)
    ↓
ADMIN_REGION (quân khu)
    ↓
ADMIN_UNIT (đơn vị)
    ↓
USER (cá nhân)

MODERATOR (tính năng chưa rõ)
```

### Permission Matrix

| Permission         | SYSTEM_ADMIN | ADMIN_REGION    | ADMIN_UNIT    | USER                 |
| ------------------ | ------------ | --------------- | ------------- | -------------------- |
| View all personnel | ✅           | ✅ (own region) | ✅ (own unit) | ✅ (self)            |
| Create personnel   | ✅           | ✅ (own region) | ✅ (own unit) | ❌                   |
| Edit personnel     | ✅           | ✅ (own region) | ✅ (own unit) | ✅ (self image only) |
| Delete personnel   | ✅           | ✅ (own region) | ✅ (own unit) | ❌                   |
| Create regions     | ✅           | ❌              | ❌            | ❌                   |
| Create units       | ✅           | ✅              | ❌            | ❌                   |
| Approve leaves     | ✅           | ✅ (own region) | ✅ (own unit) | ❌                   |
| Create own leave   | ✅           | ✅              | ✅            | ✅                   |

---

## Account Types & Sidebar Menu Visibility

There are **two kinds of account**:

1. **Personnel account (quân nhân)** — permissions scoped by rank/level (SYSTEM_ADMIN / ADMIN_REGION / ADMIN_UNIT / USER) as in the Permission Matrix above.
2. **Scanner account (tài khoản quét QR)** — a gate/duty-officer login used only to scan QR at the gate; it should see **only the "Tổng quan" section**.

### Menu visibility rules

| Sidebar item | Admin¹ | Normal user (ROLE_USER) | Scanner account |
| --- | :---: | :---: | :---: |
| Tổng quan · Dashboard (`/dashboard`) | ✅ | ✅ | ✅ |
| Tổng quan · Quét QR cổng (`/scan`) | ✅ | ❌ | ✅ |
| Quân nhân · Danh sách (`/soldiers`), Phương tiện (`/vehicles`) | ✅ | ✅ | ❌ |
| Nghỉ phép · Đơn nghỉ phép (`/requests`) | ✅ | ✅ | ❌ |
| Lịch sử · Lịch sử ra vào (`/history`) | ✅ | ✅ | ❌ |
| Cấu hình hệ thống (`/units`, `/submission-groups`, `/submission-flows`, `/leave-approval-configs`) | ✅ | ❌ | ❌ |

¹ Admin = `ROLE_SYSTEM_ADMIN` ∪ `ROLE_ADMIN_REGION` ∪ `ROLE_ADMIN_UNIT`.

Summary:
- **Scanner** → only the *Tổng quan* section (Dashboard + Quét QR cổng).
- **Normal user** → everything **except** the *Quét QR cổng* item and the whole *Cấu hình hệ thống* group.
- **Admin** → everything.

### ⚠️ BE ACTION REQUIRED — define the scanner role

There is currently **no dedicated role** for the scanner account in the backend (live Swagger `/v3/api-docs` references only `ROLE_USER`; the known set is SYSTEM_ADMIN / ADMIN_REGION / ADMIN_UNIT / USER / MODERATOR, and `ROLE_MODERATOR` is unused/"dự bị").

**Backend must define and return a clear role for scanner accounts** (suggested: `ROLE_SCANNER` or `ROLE_GATE`, or repurpose `ROLE_MODERATOR` explicitly) so the FE can distinguish a scanner login from a normal `ROLE_USER`. The role must appear in the signin response `user.roles[]` (the FE reads roles from the session cookie — see `components/Header.tsx` `getSession()`).

Until this role is defined, the FE **cannot reliably implement** the scanner-only view — the menu-visibility logic in `components/Sidebar.tsx` is blocked on this decision. FE plan once defined: attach an allowed-roles predicate per nav item/group and filter `NAV_GROUPS` by the current user's roles.

---

## Business Workflows

### Workflow 1: Create & Approve Leave Request

```
Actor: Quân nhân (USER role)

1. Navigate to /requests or dedicated form
2. Fill form:
   - Select personnel
   - Choose leave from/to dates
   - Enter allowed exit count (e.g., 3)
   - Optional: add reason
3. Click Submit
   └─ POST /api/leave-requests
   └─ Backend creates:
      ├─ Round 1.0001: status=TRINH, assignee=requestor
      └─ Round 1.0002: status=CHUA_XU_LY, assignee=next_approver
4. Notification sent to next approver

---

Actor: Manager/Admin (ADMIN_UNIT or higher)

1. Navigate to /requests
2. See list of pending leave requests
3. For each request:
   └─ View details (dates, reason, requestor)
   └─ Check current round & status
   └─ Action buttons:
      ├─ Accept → POST /api/leave-requests/{id}/accept
      ├─ Approve → POST /api/leave-requests/{id}/approve
      ├─ Return → POST /api/leave-requests/{id}/return (with reason)
      └─ Submit-Next → POST /api/leave-requests/{id}/submit-next
4. Status updates in real-time

---

Actor: Requestor (after rejection)

1. See returned leave request in /requests
2. Review rejection reason
3. Click Edit/Resubmit
   └─ PUT /api/leave-requests/{id}/edit (modify dates/count)
   └─ POST /api/leave-requests/{id}/resubmit
   └─ Workflow restarts from Round 1.0001

---

Actor: Requestor (after approval, need amendment)

1. See approved leave request
2. Click Supplement
   └─ POST /api/leave-requests/{id}/supplement
   └─ Backend creates Major Round 2.0001, 2.0002, ...
   └─ Approval workflow repeats
```

### Workflow 2: QR Gate Scan

```
Actor: Quân nhân at gate

1. Scan QR code
2. Frontend decodes QR → extracts personnelId
3. POST /api/qr-scan-logs/scan {data: ...}
4. Backend validates:
   - Find valid approved leave request
   - Check date range & exit count
5. Response:
   - If valid: status=DONG_Y, usedOutCount++
   - If invalid: status=TU_CHOI, reason="No permission"
6. Log created & displayed on /history

---

Actor: Civilian at gate

1. Scan civilian ID QR
2. Frontend posts to /api/qr-scan-logs/scan
3. Backend creates log with status=DANG_XU_LY
4. Admin must manually approve:
   - POST /api/qr-scan-logs/{id}/approve → DONG_Y
   - POST /api/qr-scan-logs/{id}/reject → TU_CHOI
5. Log updated
```

---

## Component Requirements

### Layout Components

#### `Header`

- Search input
- User avatar
- Display current user info

#### `Sidebar`

- Navigation grouped into 5 sections:
  - **Tổng quan**: Dashboard, Quét QR cổng (`/scan`)
  - **Quân nhân**: Danh sách quân nhân (`/soldiers`), Phương tiện (`/vehicles`)
  - **Nghỉ phép**: Đơn nghỉ phép (`/requests`)
  - **Lịch sử**: Lịch sử ra vào (`/history`)
  - **Cấu hình hệ thống**: Đơn vị (`/units`), Nhóm trình (`/submission-groups`), Luồng trình (`/submission-flows`), Cấu hình phê duyệt (`/leave-approval-configs`)
- Active route highlight
- Sign out button
- Dark olive/tactical gradient theme

> "Add soldier" is a modal/action on `/soldiers`, not a sidebar item. Regions management is no longer in the FE.

#### `Layout` (wrapper)

- Combine Header + Sidebar
- Apply base styling
- Authentication guard

### Page Components

#### `/soldiers`

- Search input with debounce
- Pagination controls
- Table columns: Name, Rank, Unit, Position, Code, QR (image), Actions
- Modal: AddSoldierModal on "Add" button

#### `/add-soldier`

- Form fields:
  - Username, Email, Password (in Account section)
  - Full Name, Rank, Unit, Position, Image (in Personnel section)
- Form validation with react-hook-form
- Image upload component

#### `/requests`

- Table: Requestor, Dates, Status, Current Approver, Actions
- Filters: My Requests / Pending for Me / All
- Modal: View details with history timeline
- Action buttons: Accept, Approve, Return, Submit-Next
- Return form with required reason field

#### `/history`

- Table: Name, Unit, Entrance Time, Exit Time, Status, Reason
- Filters: Today / This Week / This Month
- Search by name

---

## State Management

### Using React Hooks

**Pattern**: Each module has a custom hook that manages API calls

```typescript
export const useModule = () => {
  const fetch = useCallback(async (...) => {...}, []);
  const create = useCallback(async (...) => {...}, []);
  // ...

  return useMemo(() => ({fetch, create, ...}), [fetch, create, ...]);
};
```

**Why this approach?**

- ✅ Simple & no external state management needed
- ✅ Easy to test (just call hook functions)
- ✅ Scales well for this project size
- ✅ Built-in React patterns

### Component State

- Use `useState` for form inputs
- Use `useRouter` for navigation (Next.js)
- Use `useSearchParams` for URL-based pagination/filtering

---

## Error Handling

### API Errors

```typescript
try {
  const result = await apiClient.post("/api/endpoint", data);
  return result;
} catch (error: any) {
  console.error("Error:", error);
  addToast({
    title: "Lỗi",
    description: error.message || "Có lỗi xảy ra",
    color: "danger",
  });
  throw error; // Re-throw for calling code to handle
}
```

### Toast Notifications (HeroUI)

- Success: Green toast with checkmark
- Error: Red toast with error details
- Auto-dismiss after 3-5 seconds
- User can close manually

### Form Validation

- react-hook-form for client-side validation
- Server validation errors mapped to field errors
- Error messages displayed below form fields

---

## Security

### Authentication

- ✅ JWT tokens with Bearer scheme
- ✅ Token stored in secure HTTP-only cookies
- ⚠️ **TODO**: Configure token expiration & refresh strategy

### Authorization

- ✅ Frontend checks user role before showing UI
- ✅ Backend enforces permissions on API calls
- ✅ Scope-based filtering (user can only see own data)

### Data Protection

- ✅ All API calls use HTTPS
- ✅ Passwords sent over encrypted connection
- ✅ Images stored on S3 with signed URLs
- ⚠️ **TODO**: CORS configuration
- ⚠️ **TODO**: Rate limiting on sensitive endpoints

### Input Validation

- ✅ Client-side: react-hook-form
- ✅ Server-side: Backend validation (assumed)
- ⚠️ **TODO**: Sanitize QR data input

---

## Known Issues & TODOs

### High Priority 🔴

- [ ] API key rotation strategy for JWT
- [ ] Rate limiting on auth endpoints
- [ ] CORS configuration
- [ ] Error response format standardization
- [ ] Backup & recovery procedures for DynamoDB

### Medium Priority 🟠

- [ ] Implement permission check API for leave approval
- [ ] Add audit logging for sensitive operations
- [ ] Implement role-based UI rendering
- [ ] Add loading skeletons for better UX
- [ ] Optimize image lazy-loading

### Low Priority 🟡

- [ ] Implement advanced search filters
- [ ] Add dark mode support
- [ ] Internationalization beyond Vietnamese
- [ ] Export reports (PDF/Excel)

---

## Testing Strategy

### Unit Tests

- Test custom hooks (use-soldier, use-leave-request, etc.)
- Test form validation
- Test utility functions

### Integration Tests

- Test page navigation flows
- Test form submission workflows
- Test API integration

### E2E Tests

- Test complete user journeys:
  - Login → Create leave request → Approve
  - Login → Scan QR → Verify access
  - Personnel management workflows

---

## Deployment

### Environment Variables

```env
NEXT_PUBLIC_BASE_API=https://api.military-manager.com
```

### Build & Run

```bash
npm run build
npm run start
```

### Monitoring

- Error tracking (Sentry, etc.)
- Performance monitoring (Web Vitals)
- User analytics

---

## References

- [NGHIEP_VU_HE_THONG_CHI_TIET.md](./NGHIEP_VU_HE_THONG_CHI_TIET.md) - Backend spec
- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Component Library](https://heroui.com)
- [AWS Lambda Deployment](https://aws.amazon.com/lambda/)

---

**Document End**
