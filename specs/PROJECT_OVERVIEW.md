# Military Manager - Project Overview & Business Context

**Version:** 1.0  
**Date:** 2026-04-21  
**Status:** In Development

---

## 🎖️ Military Manager - Hệ Thống Quản Lý Cổng Quân Đội

### 🎯 Mục Đích Chính

Quản lý nhân sự quân đội, kiểm soát ra vào cổng bằng QR, và xử lý luồng duyệt nghỉ phép theo phân cấp.

---

## 📱 Các Module & Pages

### 1️⃣ Trang Đăng Nhập (Public)

- Login với `username` & `password`
- JWT token lưu vào cookies
- Support 5 vai trò:
  - `ROLE_SYSTEM_ADMIN` - Toàn quyền
  - `ROLE_ADMIN_REGION` - Quản lý quân khu
  - `ROLE_ADMIN_UNIT` - Quản lý đơn vị
  - `ROLE_USER` - Người dùng thường
  - `ROLE_MODERATOR` - Vai trò dự bị

### 2️⃣ Dashboard

- Hiển thị stats:
  - 📊 Tổng quân nhân
  - 🟢 Số người trong doanh trại
  - 🔴 Số người đã ra

### 3️⃣ Danh Sách Quân Nhân

- **Tính năng:**

  - ✅ Xem danh sách phân trang (10 người/trang)
  - ✅ Tìm kiếm theo tên/số hiệu
  - ✅ Hiển thị QR code của từng quân nhân (tự sinh từ backend)
  - ✅ Thêm quân nhân mới via modal
  - ✅ Xem ảnh của quân nhân

- **Quyền truy cập theo role:**
  - `SYSTEM_ADMIN`: Xem toàn bộ
  - `ADMIN_REGION`: Xem quân nhân trong quân khu
  - `ADMIN_UNIT`: Xem quân nhân trong đơn vị
  - `ROLE_USER`: Chỉ xem info của chính mình

### 4️⃣ Thêm Quân Nhân

- Form modal với:
  - Username, Email, Password
  - Họ tên, Cấp bậc, Đơn vị, Chức vụ
  - Upload ảnh
- Backend tự sinh:
  - **Code**: `VN_HCMC_SOLDIER_CAPTAIN_0001`
  - **QR**: Mã QR để scan tại cổng

### 5️⃣ Lịch Sử Ra Vào

- Bảng hiển thị log quét QR:
  - Tên quân nhân
  - Đơn vị
  - Giờ vào / Giờ ra
  - Trạng thái

### 6️⃣ Duyệt Yêu Cầu (Leave Request Management)

- Bảng danh sách đơn nghỉ phép chờ duyệt:
  - Người tạo, Thời gian nghỉ, Số lần được ra
  - Actions: **Duyệt** / **Trả về** / **Trình cấp cao hơn**
- Luồng xử lý:
  - Round 1.0001: Người tạo trình
  - Round 1.0002: Cấp duyệt nhận & xử lý
  - Nếu bị trả về → Người tạo chỉnh sửa & trình lại
  - Nếu đã duyệt mà cần bổ sung → Tăng major round (2.0001, 3.0001, v.v.)

---

## 🔄 Quy Trình Nghiệp Vụ Chính

### Kịch Bản 1: Quân Nhân Xin Nghỉ Phép

**Bước 1: Tạo Đơn**

```
1. Quân nhân (ROLE_USER) tạo đơn:
   ├─ Chọn ngày từ - đến
   ├─ Nhập số lần được phép ra (ví dụ: 3 lần)
   ├─ Trình lên cấp duyệt (Round 1.0001)
   └─ Hệ thống tự động tạo Round 1.0002 cho cấp tiếp theo
```

**Bước 2: Duyệt Đơn**

```
2. Cấp duyệt (ADMIN_UNIT/ADMIN_REGION):
   ├─ Nhận yêu cầu
   ├─ Chọn: Tiếp nhận → Duyệt → Trình cấp cao hơn
   └─ Nếu không được (trả về + lý do)
```

**Bước 3: Người Tạo Nhận Trả Về**

```
3. Người tạo nhận được đơn bị trả về:
   ├─ Sửa đổi & Trình lại (resubmit)
   └─ Đi lại luồng từ đầu
```

**Bước 4: Bổ Sung (Nếu Cần)**

```
4. Khi đã DUYỆT nhưng cần bổ sung:
   ├─ Click "Bổ sung" (supplement)
   ├─ Hệ thống tăng major round (2.0001)
   └─ Đi duyệt lại từ đầu
```

---

### Kịch Bản 2: Quét QR Ra Cổng

**Bước 1: Quân Nhân Quét QR**

```
1. Quân nhân quét QR tại cổng:
   ├─ Frontend quét → gửi `/api/qr-scan-logs/scan`
   └─ Backend kiểm tra:
      ├─ ✅ Có đơn đã duyệt + ngày hợp lệ + usedOutCount < allowedOutCount
      │   └─ → Trạng thái DONG_Y, tăng usedOutCount
      └─ ❌ Không thỏa điều kiện
          └─ → Trạng thái TU_CHOI
```

**Bước 2: Xử Lý Người Dân (Nếu Không Phải Quân Nhân)**

```
2. Nếu là người dân (không phải quân nhân):
   ├─ Quét QR → Trạng thái DANG_XU_LY
   ├─ Admin nhấn Duyệt/Từ chối → DONG_Y / TU_CHOI
   └─ Log được lưu để audit
```

---

## 🏗️ Cấu Trúc Dữ Liệu (DynamoDB)

### Các Bảng Chính

```
📊 Hệ Thống Nhân Sự:
├─ users                      → Tài khoản + Role
├─ roles                       → Danh sách vai trò

📍 Tổ Chức:
├─ military_regions           → Quân khu (code, name, logo)
├─ military_units             → Đơn vị (code, name, regionCode, logo)

👤 Quân Nhân:
├─ military_personnel         → Quân nhân (code, qrCode, fullName, imagePath)

📋 Luồng Trình:
├─ submission_groups          → Nhóm trình duyệt (users list)
├─ submission_flows           → Luồng trình (orderNo, groupId)

🏖️ Nghỉ Phép:
├─ leave_approval_configs     → Cấu hình ai được duyệt bao nhiêu ngày
├─ leave_requests             → Đơn nghỉ phép
├─ leave_request_histories    → Chi tiết từng round duyệt

🚪 Cổng Ra Vào:
└─ qr_scan_logs               → Log quét QR + status
```

---

## 🔐 Phân Quyền (Role-Based)

### Permission Matrix

| **Quyền**          | **SYSTEM_ADMIN** | **ADMIN_REGION** | **ADMIN_UNIT** | **USER**             |
| ------------------ | ---------------- | ---------------- | -------------- | -------------------- |
| **Quân Nhân**      |                  |                  |                |                      |
| - Xem tất cả       | ✅               | ✅ (own region)  | ✅ (own unit)  | ✅ (self)            |
| - Thêm mới         | ✅               | ✅ (own region)  | ✅ (own unit)  | ❌                   |
| - Sửa              | ✅               | ✅ (own region)  | ✅ (own unit)  | ✅ (self image only) |
| - Xóa              | ✅               | ✅ (own region)  | ✅ (own unit)  | ❌                   |
| **Tổ Chức**        |                  |                  |                |                      |
| - Tạo quân khu     | ✅               | ❌               | ❌             | ❌                   |
| - Tạo đơn vị       | ✅               | ✅               | ❌             | ❌                   |
| **Duyệt**          |                  |                  |                |                      |
| - Duyệt đơn        | ✅               | ✅ (own region)  | ✅ (own unit)  | ❌                   |
| - Tạo đơn của mình | ✅               | ✅               | ✅             | ✅                   |

---

## 🎨 UI Layout

### Tổng Quan Giao Diện

```
┌─────────────────────────────────────────────────┐
│ Header: [Search] ......................... [Avatar] │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │                                      │
│          │          Main Content                │
│ Military │  ┌────────────────────────────────┐  │
│ Gate     │  │ Dashboard / Soldiers / History │  │
│          │  │ Requests / Add-soldier        │  │
│          │  └────────────────────────────────┘  │
│ ☐ Danh sách├──────────────────────────────────────┤
│ ☐ Lịch sử │                                      │
│ ☐ Duyệt   │                                      │
│ ☐ Thêm    │                                      │
│          │                                      │
│ [Đăng xuất]                                      │
└──────────┴──────────────────────────────────────┘
```

### Menu Sidebar

```
🏠 Dashboard           → /dashboard
👥 Danh sách quân nhân → /soldiers
📋 Lịch sử ra vào      → /history
✉️ Duyệt yêu cầu      → /requests
➕ Thêm quân nhân      → /add-soldier
[Đăng xuất]
```

---

## ⚙️ Custom Hooks Hiện Có

Đã tạo 9 custom hooks theo pattern của `use-soldier.ts`:

| **Hook**                    | **Dùng Cho**               | **Các Hàm Chính**                                                                                                   |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `use-auth`                  | Login/Logout               | `signIn`, `signOut`                                                                                                 |
| `use-soldier`               | CRUD quân nhân, upload ảnh | `createSoldier`, `uploadImage`, `getSoldiers`                                                                       |
| `use-region`                | CRUD quân khu              | `createRegion`, `updateRegion`, `deleteRegion`, `getRegions`, `uploadLogo`                                          |
| `use-unit`                  | CRUD đơn vị                | `createUnit`, `updateUnit`, `deleteUnit`, `getUnits`, `uploadLogo`                                                  |
| `use-submission`            | Nhóm trình & Luồng trình   | `createGroup`, `addUserToGroup`, `createFlow`, `updateFlow`, `deleteFlow`                                           |
| `use-leave-request`         | Yêu cầu nghỉ phép          | `createLeaveRequest`, `approveLeaveRequest`, `returnLeaveRequest`, `supplementLeaveRequest`, `resubmitLeaveRequest` |
| `use-leave-approval-config` | Cấu hình phê duyệt         | `createConfig`, `getApplicableConfigs`, `toggleConfigActive`                                                        |
| `use-qr-scan`               | Quét QR                    | `scanQR`, `approveQRScan`, `rejectQRScan`                                                                           |
| `use-combobox`              | Dropdown data              | `getRanks`, `getPositions`, `getRegions`, `getUnits`                                                                |

**Đặc điểm chung:**

- ✅ Type definitions đầy đủ
- ✅ Error handling & toast notifications
- ✅ useCallback + useMemo tối ưu
- ✅ Consistent pattern
- ✅ Support file upload (region, unit logo)

---

## ✅ Tóm Lại: Web App Này Làm Gì?

🎯 **Nó là một hệ thống kiểm soát ra vào + duyệt nghỉ phép cho quân đội** với:

### Core Features

- ✅ **Quản lý quân nhân** + QR tự sinh
- ✅ **Luồng duyệt nghỉ phép** theo phân cấp (Unit → Region → System)
- ✅ **Quét QR tự động** kiểm tra quyền ra cổng
- ✅ **Hỗ trợ bổ sung** đơn (tăng round)
- ✅ **Phân quyền chi tiết** theo vai trò
- ✅ **Log audit** đầy đủ

### User Workflows

1. 👤 **Admin login** → xem dashboard
2. 📝 **Quân nhân xin nghỉ** → tạo đơn
3. ✅ **Manager duyệt** → approve/reject/submit-next
4. 🚪 **Quân nhân quét QR** cổng → tự động kiểm tra quyền
5. 📊 **Log lại** tất cả hoạt động

### Technical Highlights

- 🔐 JWT authentication with session persistence
- 🌍 Multi-role authorization (5 roles)
- 📊 DynamoDB for scalability
- 🖼️ S3 for file storage
- 🎨 HeroUI + Tailwind for UI
- ⚡ React Hooks for state management
- 📱 Responsive design

---

## 🚀 Deployment Ready

### Khi Deploy, Nó Sẽ:

1. **Login Phase**

   - Admin/Manager login với credentials
   - JWT token được cấp & lưu vào cookies

2. **Management Phase**

   - Xem dashboard with statistics
   - Quản lý quân nhân (add/edit/delete)
   - Duyệt yêu cầu nghỉ phép theo luồng

3. **Gate Control Phase**

   - Quân nhân quét QR tại cổng
   - Hệ thống tự động xác nhận quyền ra
   - Tăng counter `usedOutCount`

4. **Audit Phase**
   - Log tất cả hành động
   - Lịch sử ra vào chi tiết
   - Report có thể xuất

---

## 📚 Documentation Structure

Tài liệu đã được tổ chức trong `specs/` folder:

```
specs/
├── README.md                    (Index & Navigation)
├── SYSTEM_SPEC.md              (Architecture & Design)
├── API_SPEC.md                 (50+ Endpoints)
├── COMPONENT_UI_SPEC.md        (Components & UI)
└── PROJECT_OVERVIEW.md         (This file - Business Context)
```

---

## 🎓 Để Hiểu Rõ Hơn

### Frontend Developer

1. Đọc **PROJECT_OVERVIEW.md** (file này) - Hiểu business
2. Đọc **SYSTEM_SPEC.md** - Kiến trúc
3. Đọc **COMPONENT_UI_SPEC.md** - Components
4. Dùng **API_SPEC.md** - Integration

### Backend Developer

1. Đọc **PROJECT_OVERVIEW.md** - Business context
2. Đọc **API_SPEC.md** - Implement all endpoints
3. Check **SYSTEM_SPEC.md** - Data models

### QA / Tester

1. Đọc **PROJECT_OVERVIEW.md** - Business workflows
2. Check **SYSTEM_SPEC.md** - Test scenarios
3. Verify **COMPONENT_UI_SPEC.md** - UI acceptance

---

## 🔗 Quick Links

- **System Architecture**: [SYSTEM_SPEC.md](./SYSTEM_SPEC.md)
- **API Endpoints**: [API_SPEC.md](./API_SPEC.md)
- **UI Components**: [COMPONENT_UI_SPEC.md](./COMPONENT_UI_SPEC.md)
- **Spec Navigation**: [README.md](./README.md)

---

**Project Status**: ✅ Fully Documented  
**Last Updated**: 2026-04-21  
**Ready for Development**: YES ✅
