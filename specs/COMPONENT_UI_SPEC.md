# Military Manager - Component & UI Specification

**Version:** 1.0  
**Last Updated:** 2026-04-21

---

## Component Architecture

### Component Hierarchy

```
App Root (layout.tsx)
├── AuthProvider
├── ThemeProvider (HeroUI)
└── Router (Next.js App Router)
    ├── (public)
    │   └── login/
    │       └── LoginPage
    │           ├── LoginForm
    │           └── [Unauthenticated]
    │
    └── (private)
        ├── Layout
        │   ├── Header
        │   ├── Sidebar
        │   └── Main Content Area
        │
        ├── dashboard/
        │   └── DashboardPage
        │       ├── StatsCard (x3)
        │       ├── ActivityChart
        │       └── RecentActivity
        │
        ├── soldiers/
        │   └── SoldiersPage
        │       ├── SearchInput
        │       ├── AddButton
        │       ├── SoldierTable
        │       │   ├── TableRow (Soldier)
        │       │   ├── QRCodeCell
        │       │   ├── NameCell
        │       │   └── ActionCell (Edit/Delete)
        │       ├── Pagination
        │       └── AddSoldierModal
        │           ├── Form
        │           ├── ImageUpload
        │           └── SubmitButton
        │
        ├── add-soldier/
        │   └── AddSoldierPage
        │       └── [Redirect to soldiers with modal]
        │
        ├── history/
        │   └── HistoryPage
        │       ├── DateRangeFilter
        │       ├── SearchInput
        │       ├── ScanLogTable
        │       │   ├── ScanLogRow
        │       │   └── StatusBadge
        │       └── Pagination
        │
        └── requests/
            └── RequestsPage
                ├── TabSwitcher (My / Pending / All)
                ├── LeaveRequestTable
                │   ├── LeaveRequestRow
                │   ├── StatusBadge
                │   └── ActionButtons
                │       ├── AcceptBtn
                │       ├── ApproveBtn
                │       ├── ReturnBtn
                │       └── SubmitNextBtn
                ├── RequestDetailModal
                │   ├── RequestInfo
                │   ├── ApprovalHistory
                │   │   └── HistoryTimeline
                │   └── ActionForm
                │
                └── Modals
                    ├── ApproveRequestModal
                    ├── ReturnRequestModal
                    └── SupplementRequestModal
```

---

## Layout Components

### Header Component

**Location**: `components/Header.tsx`

**Props**:

```typescript
interface HeaderProps {
  onMenuClick?: () => void;
}
```

**Features**:

- Search input (debounced, searches soldiers + requests)
- User avatar with dropdown (Profile, Settings, Logout)
- Responsive design
- Sticky top positioning

**Styling**:

- Background: White with border-bottom
- Padding: 16px
- Height: 64px

**Interactions**:

- Search: Trigger global search (debounce 300ms)
- Avatar: Open dropdown menu

---

### Sidebar Component

**Location**: `components/Sidebar.tsx`

**Features**:

- Navigation menu
- Active page highlight
- Logout button
- Responsive (collapsible on mobile)

**Menu Items**:

```
🏠 Dashboard           → /dashboard
👥 Danh sách quân nhân → /soldiers
📋 Lịch sử ra vào      → /history
✉️ Duyệt yêu cầu      → /requests
➕ Thêm quân nhân      → /add-soldier
```

**Styling**:

- Background: Blue-900 (#1e3a8a)
- Text: White
- Width: 256px (fixed)
- Height: 100vh (full screen)
- Hover: Darker blue highlight

**Logic**:

- Use `useRouter()` for current route detection
- Show active indicator on current page
- Close on mobile after navigation

---

### Layout Wrapper

**Location**: `app/(private)/layout.tsx`

**Responsibility**:

- Guard private routes (redirect to login if not authenticated)
- Combine Header + Sidebar + Main content
- Apply global styling

**Props**:

```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

---

## Page Components

### 1. Login Page

**Location**: `app/(public)/login/page.tsx`

**Features**:

- Username & password input
- Remember me checkbox (optional)
- Login button
- Error messages
- Loading state

**Form Fields**:

```
┌─────────────────────────┐
│                         │
│  Military Manager       │
│  Version 1.0            │
│                         │
│  Username: [_________]  │
│  Password: [_________]  │
│  ☑ Nhớ mật khẩu        │
│                         │
│  [    Đăng nhập    ]    │
│                         │
│  ❌ Lỗi: ...            │
│                         │
└─────────────────────────┘
```

**Validation**:

- Both fields required
- Password min 6 characters (validation on backend)

**Behavior**:

- Redirect to `/dashboard` on success
- Show error toast on failure
- Disable submit while loading

---

### 2. Dashboard Page

**Location**: `app/(private)/dashboard/page.tsx`

**Components**:

- Header title: "Dashboard"
- Three stat cards in grid:
  - Total Personnel
  - Currently In Base
  - Already Out

**Stat Card Component**:

```typescript
interface StatCardProps {
  title: string;
  value: number;
  color?: "green" | "gray" | "blue";
}
```

**Design**:

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Tổng quân nhân     │  Trong doanh trại    │  Đã ra              │
│  125                │  83                 │  42                 │
│  (Gray)             │  (Green)            │  (Gray)             │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Future Enhancements**:

- Charts (daily entry/exit graph)
- Recent activity log
- Approval queue summary

---

### 3. Soldiers Page

**Location**: `app/(private)/soldiers/page.tsx`

**Layout**:

```
┌─────────────────────────────────────────────────┐
│ Danh sách quân nhân                [+ Thêm]    │
├─────────────────────────────────────────────────┤
│ 🔍 Tìm kiếm theo tên, số hiệu...   [✕]       │
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐│
│ │ STT │ Tên │ Cấp │ Đơn vị │ Chức vụ │ QR │ │
│ ├──────────────────────────────────────────────┤│
│ │ 1   │ Nguyễn Văn A │ Đại úy │... │[QR]│ │
│ │ 2   │ Trần Thị B   │ Trung úy │... │[QR]│ │
│ │ ... │              │        │    │    │ │
│ └──────────────────────────────────────────────┘│
│                  < 1 | 2 | 3 >                  │
└─────────────────────────────────────────────────┘
```

**Sub-Components**:

- **SearchInput**: Debounced 500ms, auto-clears URL param on empty
- **SoldierTable**: Paginated table with columns:

  - STT (index)
  - Tên (name)
  - Cấp (rank)
  - Đơn vị (unit)
  - Chức vụ (position)
  - QR Code (image)
  - Actions (view, edit, delete)

- **SoldierTableRow**: Individual row, columns:

  - QRCodeCell: Generates QR from `qrCode` string using `qrcode` library
  - NameCell: Full name, clickable for details modal
  - ActionCell: Edit/Delete buttons

- **Pagination**: Show page numbers 1, 2, 3, ...

  - Update URL param on click: `?page=2&size=10`

- **AddSoldierModal**: Modal to add new soldier

---

### 4. Add Soldier Modal

**Location**: `components/AddSoldierModal.tsx`

**Trigger**: "Thêm" button on soldiers page

**Form Structure**:

```
┌────────────────────────────────────────────┐
│ Thêm quân nhân mới                    [×]  │
├────────────────────────────────────────────┤
│ THÔNG TIN TÀI KHOẢN                        │
│ Username*    [________________]             │
│ Email*       [________________]             │
│ Password*    [________________] [👁 show]  │
│                                            │
│ THÔNG TIN QUÂN NHÂN                        │
│ Họ tên*      [________________]             │
│ Cấp bậc*     [▼ Select rank ...]          │
│ Đơn vị*      [▼ Select unit ...]          │
│ Chức vụ*     [▼ Select position...]       │
│ Ảnh          [📷 Upload] [Preview]        │
│                                            │
│                      [Hủy]  [Thêm]        │
└────────────────────────────────────────────┘
```

**Features**:

- Form validation with react-hook-form
- Dropdown for rank, unit, position (populated from `/api/common/combobox/*`)
- Image upload component with preview
- Loading state on submit button
- Close on success

**Form Submission**:

1. Validate all required fields
2. Upload image if present
3. Call `useSoldier().createSoldier()` with form data
4. Toast success message
5. Close modal & refresh table

---

### 5. History Page

**Location**: `app/(private)/history/page.tsx`

**Purpose**: Display QR scan logs (entrance/exit)

**Layout**:

```
┌──────────────────────────────────────────────┐
│ Lịch sử ra vào                               │
├──────────────────────────────────────────────┤
│ [Hôm nay ▼] 🔍 Tìm kiếm...     [✕]        │
├──────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐│
│ │ STT │ Tên │ Đơn vị │ Giờ vào │ Giờ ra │ │
│ ├────────────────────────────────────────────┤│
│ │ 1   │ Nguyễn Văn A │ Tiểu đoàn 1 │ 08:00 │ │
│ │ 2   │ Trần Thị B   │ Tiểu đoàn 2 │ 08:15 │ │
│ │ ... │              │            │       │ │
│ └────────────────────────────────────────────┘│
│                < 1 | 2 | 3 >                 │
└──────────────────────────────────────────────┘
```

**Features**:

- Date range filter (Today / This week / This month / Custom)
- Search by soldier name
- Table columns:
  - STT
  - Tên (Name)
  - Đơn vị (Unit)
  - Giờ vào (Entry time)
  - Giờ ra (Exit time) - empty if not exited yet
  - Trạng thái (Status: DONG_Y, TU_CHOI, etc.)

**Data Source**: `useQRScan().getQRScanLog()` or list endpoint (if available)

**Pagination**: Show 20 entries per page

---

### 6. Requests Page (Leave Request Management)

**Location**: `app/(private)/requests/page.tsx`

**Purpose**: Manage leave requests with approval workflow

**Layout**:

```
┌────────────────────────────────────────────────────┐
│ Danh sách yêu cầu                                  │
├────────────────────────────────────────────────────┤
│ [Chờ duyệt ▼]  🔍 Tìm kiếm...       [+Tạo mới]   │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐│
│ │  □  STT │ Người tạo │ Ngày │ Trạng thái │ HĐ  │ │
│ ├──────────────────────────────────────────────────┤│
│ │  ☑  1   │ Nguyễn A  │ 5/1-5/5 │ TRINH  │ ⋯ │ │
│ │  ☐  2   │ Trần B    │ 5/10-5/12 │ CHUA_XU_LY │ │
│ │  ☐  3   │ Lê C      │ 5/15-5/20 │ DA_DUYET │ │
│ └──────────────────────────────────────────────────┘│
│                   < 1 | 2 | 3 >                    │
│ [✓ Duyệt] [↩ Trả về] [⬆ Trình cấp cao]           │
└────────────────────────────────────────────────────┘
```

**Sub-Components**:

#### Tab Filter

```
[Chờ duyệt ▼]  // Filters:
               // - Chờ duyệt (pending for me)
               // - Của tôi (my requests)
               // - Tất cả (all - admin only)
```

#### LeaveRequestTable

- Columns:

  - Checkbox (for multi-select)
  - STT
  - Người tạo (Requestor name)
  - Ngày (Leave from-to dates)
  - Trạng thái (Status badge)
  - Hành động (Actions dropdown)

- Expandable rows to show:
  - Reason
  - Allowed exit count
  - Current round number
  - Approval history

#### Status Badges

```
TRINH        → Blue (In submission)
CHUA_XU_LY   → Yellow (Awaiting approval)
DA_DUYET     → Green (Approved)
TU_CHOI      → Red (Rejected)
TRA_VE       → Orange (Returned)
```

#### Action Buttons

- Accept (Tiếp nhận): Only if status = CHUA_XU_LY
- Approve (Duyệt): With optional reason input
- Return (Trả về): With mandatory reason input (modal)
- Submit-Next (Trình cấp cao): If insufficient permissions
- Edit (Sửa): If owner & status = TRA_VE
- Supplement (Bổ sung): If owner & status = DA_DUYET
- View Details (Xem): Show approval history

---

### Request Detail Modal

**Trigger**: Click row or "Xem" button

**Content**:

```
┌────────────────────────────────────────────┐
│ Chi tiết yêu cầu nghỉ phép          [×]  │
├────────────────────────────────────────────┤
│                                            │
│ Người tạo: Nguyễn Văn A                  │
│ Thời gian:  5/1/2026 - 5/5/2026          │
│ Lý do:      Nghỉ gia đình                 │
│ Số lần ra:  3/3                           │
│                                            │
│ ─── LỊCH SỬ DUYỆT ───                     │
│                                            │
│ Round 1.0001 [✓ TRINH]      2026-04-21   │
│   Người tạo: Nguyễn Văn A                │
│   Lý do: Xin nghỉ gia đình                │
│                                            │
│ Round 1.0002 [⏳ CHUA_XU_LY] 2026-04-21   │
│   Chờ duyệt: Trần Văn B (Trưởng đơn vị) │
│   Lý do: (chưa có)                        │
│                                            │
│ ─── HÀNH ĐỘNG ───                         │
│                                            │
│ [Tiếp nhận] [Duyệt] [Trả về] [Trình ⬆]   │
│                                            │
└────────────────────────────────────────────┘
```

---

### Approval Action Modals

#### Approve Modal

```
┌───────────────────────────────────┐
│ Duyệt yêu cầu                [×] │
├───────────────────────────────────┤
│ Lý do (tuỳ chọn):                 │
│ [_________________________]        │
│                                   │
│          [Hủy] [Duyệt]            │
└───────────────────────────────────┘
```

#### Return Modal

```
┌───────────────────────────────────┐
│ Trả về yêu cầu                [×] │
├───────────────────────────────────┤
│ Lý do (bắt buộc) *:               │
│ [_________________________]        │
│ (Yêu cầu phải nhập lý do)         │
│                                   │
│          [Hủy] [Trả về]           │
└───────────────────────────────────┘
```

#### Supplement Modal

```
┌───────────────────────────────────┐
│ Bổ sung yêu cầu               [×] │
├───────────────────────────────────┤
│ Ngày từ: [2026-05-01]             │
│ Ngày đến: [2026-05-05]            │
│ Số lần được ra: [3]               │
│ Lý do (tuỳ chọn):                 │
│ [_________________________]        │
│                                   │
│       [Hủy] [Bổ sung]             │
└───────────────────────────────────┘
```

---

## Reusable Components

### StatusBadge Component

```typescript
interface StatusBadgeProps {
  status: "TRINH" | "CHUA_XU_LY" | "DA_DUYET" | "TU_CHOI" | "TRA_VE" | "DONG_Y";
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({status, size = "md"}) => {
  const statusConfig = {
    TRINH: {color: "primary", label: "Đang trình"},
    CHUA_XU_LY: {color: "warning", label: "Chờ xử lý"},
    DA_DUYET: {color: "success", label: "Đã duyệt"},
    TU_CHOI: {color: "danger", label: "Từ chối"},
    TRA_VE: {color: "warning", label: "Trả về"},
    DONG_Y: {color: "success", label: "Đồng ý"},
  };
  return <Chip color={statusConfig[status].color} size={size}>
    {statusConfig[status].label}
  </Chip>;
};
```

### ImageUpload Component

```typescript
interface ImageUploadProps {
  onUpload: (imagePath: string) => void;
  category?: "personnel" | "region" | "unit";
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  category = "personnel",
  maxSizeMB = 5,
}) => {
  // Features:
  // - File type validation (jpg, png, webp)
  // - File size validation
  // - Progress indicator
  // - Preview image
  // - Cancel upload
};
```

### QRCodeCell Component

```typescript
interface QRCodeCellProps {
  value: string; // QR code data
  size?: number; // Image size in px
}

export const QRCodeCell: React.FC<QRCodeCellProps> = ({
  value,
  size = 100,
}) => {
  // Uses 'qrcode' library to generate QR image
  // Displays 100x100px image by default
  // Shows loading spinner while generating
};
```

### ConfirmModal Component

```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean; // Red button
}
```

---

## Form Patterns

### Using react-hook-form

```typescript
import {useForm} from "react-hook-form";

const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm({
  defaultValues: {...},
});

const onSubmit = handleSubmit(async (data) => {
  try {
    await apiCall(data);
    toast.success("Success");
  } catch (error) {
    toast.error(error.message);
  }
});

return (
  <form onSubmit={onSubmit}>
    <Input
      {...register("username", {required: "Required"})}
      errorMessage={errors.username?.message}
      isInvalid={!!errors.username}
    />
    <Button type="submit" isLoading={isSubmitting}>
      Submit
    </Button>
  </form>
);
```

---

## Styling Guidelines

### Color Scheme (Tailwind)

```
Primary:        Blue-600     (#2563eb)
Secondary:      Gray-600     (#4b5563)
Success:        Green-600    (#16a34a)
Warning:        Yellow-500   (#eab308)
Danger:         Red-600      (#dc2626)
Background:     Gray-50      (#f9fafb)
Border:         Gray-200     (#e5e7eb)
Text Primary:   Gray-900     (#111827)
Text Secondary: Gray-600     (#4b5563)
```

### Spacing

```
Padding:        8, 12, 16, 24, 32, 40
Margin:         8, 12, 16, 24, 32
Border Radius:  4, 6, 8, 12, 16
```

### Typography

```
H1:  32px bold      (page title)
H2:  24px semibold  (section title)
H3:  18px semibold  (subsection)
Body: 14px regular  (default)
Small: 12px regular (labels, hints)
```

---

## Responsive Design

### Breakpoints

```
Mobile:   < 640px   (default)
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Sidebar Behavior

```
Desktop:  Fixed left sidebar (256px)
Tablet:   Collapsible sidebar
Mobile:   Hidden, accessible via hamburger menu
```

### Table Behavior

```
Desktop:  Show all columns
Tablet:   Hide non-essential columns, show in expanded row
Mobile:   Show only name + status + action button (drawer for details)
```

---

## Accessibility

### ARIA Labels

- Buttons: Add `aria-label` for icon-only buttons
- Tables: Add `aria-label` to table
- Forms: Link `label` with `htmlFor` to input `id`
- Modals: Add `role="dialog"` and `aria-labelledby`

### Keyboard Navigation

- Tab through form inputs
- Enter to submit forms
- Escape to close modals
- Arrow keys for menu navigation

### Color Contrast

- Text: Minimum 4.5:1 ratio
- UI Components: Minimum 3:1 ratio

---

**Document End**
