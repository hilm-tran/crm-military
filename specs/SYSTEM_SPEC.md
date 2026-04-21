# Military Manager - Frontend System Specification

**Version:** 1.0  
**Last Updated:** 2026-04-21  
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
Frontend: Next.js 14 (App Router)
UI Library: HeroUI + Tailwind CSS
State Management: React Hooks (useCallback, useMemo)
HTTP Client: Custom apiClient with JWT auto-attach
Icons: Iconify
QR Code: qrcode library
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
│   │   ├── history/
│   │   └── requests/
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SoldierTable.tsx
│   ├── AddSoldierModal.tsx
│   ├── ImageUpload.tsx
│   ├── QRModal.tsx
│   └── ...
├── hooks/
│   ├── use-auth.ts
│   ├── use-soldier.ts
│   ├── use-region.ts
│   ├── use-unit.ts
│   ├── use-submission.ts
│   ├── use-leave-request.ts
│   ├── use-leave-approval-config.ts
│   ├── use-qr-scan.ts
│   ├── use-combobox.ts
│   ├── use-debounce.ts
│   └── ...
├── lib/
│   ├── api-client.ts
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

- `POST /api/auth/signup` - Create personnel + user account
- `GET /api/personnel?page=0&size=10&keyword=...` - List with pagination
- `POST /api/personnel/upload-image` - Upload personnel image
- `GET /api/common/images/personnel/{filename}` - Retrieve image

**Data Model**:

```typescript
interface Soldier {
  id: string;
  fullName: string;
  rank: string;
  unitName: string;
  position: string;
  code: string; // Auto-generated: region|unit|rank|position|00001
  qrCode: string; // System-generated
  imageUrl?: string;
}
```

---

### 3. Organization Management Module

**Responsibility**: Manage military regions and units

**Key Files**:

- `hooks/use-region.ts`
- `hooks/use-unit.ts`

**Features**:

- Create/Update/Delete regions (code + name must be unique)
- Create/Update/Delete units (linked to regions)
- Upload logos for regions/units to S3
- Hierarchical region → unit structure
- Support filtering units by region

**API Endpoints**:

- `CRUD /api/military-regions`
- `CRUD /api/military-units`
- `GET /api/common/combobox/regions`
- `GET /api/common/combobox/units?regionCode=...`

**Data Model**:

```typescript
interface MilitaryRegion {
  id: string;
  code: string; // Unique
  name: string;
  logoPath?: string; // S3 path
}

interface MilitaryUnit {
  id: string;
  code: string; // Unique
  name: string;
  regionCode: string; // Foreign key to region
  logoPath?: string;
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
- `app/(private)/history/page.tsx`

**Features**:

- Scan QR codes (military personnel or civilian)
- For military personnel: auto-validate against leave requests
- For civilians: manual approval workflow
- Automatic `usedOutCount` increment on successful scan
- Log all scans with timestamps and status

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

- Fetch ranks list
- Fetch positions list
- Fetch regions list (filtered by user role)
- Fetch units list (filtered by region + user role)

**API Endpoints**:

- `GET /api/common/combobox/ranks`
- `GET /api/common/combobox/positions`
- `GET /api/common/combobox/regions`
- `GET /api/common/combobox/units?regionCode=...`

---

## Pages & Routes

### Public Routes

```
/login                          → Login page (public)
```

### Private Routes (require authentication)

```
/dashboard                      → Overview with stats
/soldiers                       → List all personnel with search/pagination
/add-soldier                    → Form to add new personnel
/history                        → QR scan logs (entrance/exit)
/requests                       → Leave request approval queue
```

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

- Navigation links
  - Dashboard
  - Soldiers
  - History
  - Requests
  - Add Soldier
- Sign out button

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
