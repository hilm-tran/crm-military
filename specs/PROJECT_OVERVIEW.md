# Military Manager - Project Overview & Business Context

**Version:** 1.1  
**Date:** 2026-07-21  
**Status:** In Development

---

## 🎖️ Military Manager - Hệ Thống Quản Lý Cổng Quân Đội

### 🎯 Mục Đích Chính

Quản lý nhân sự quân đội, kiểm soát ra vào cổng bằng QR, và xử lý luồng duyệt nghỉ phép theo phân cấp.

---

## 📜 Bối Cảnh & Mục Tiêu (theo Thuyết minh sáng kiến)

> Nguồn: *"Thuyết minh sáng kiến — Phần mềm quản lý ra vào doanh trại"*, Tiểu đoàn 5, Trường Sĩ quan Lục quân 1 (Hà Nội, 2026). Tác giả: Trung sĩ Trịnh Tuấn Tú.

**Vấn đề:** Quản lý người & phương tiện ra vào doanh trại đang làm **thủ công bằng sổ sách** → chậm, dễ sai sót, khó tra cứu/thống kê, không đồng bộ, không đáp ứng chuyển đổi số.

**Mục tiêu:** Số hóa toàn bộ quy trình đăng ký — kiểm soát — lưu trữ — tra cứu ra vào; tự động tạo/kiểm mã QR; thống kê, xuất báo cáo phục vụ chỉ huy; bảo đảm an ninh, an toàn doanh trại.

**Đối tượng quản lý (theo sáng kiến):** quân nhân, **công nhân viên chức quốc phòng, người lao động hợp đồng, khách đến liên hệ công tác (công dân)**, và phương tiện.

**Phần cứng & triển khai:** máy quét QR đầu cuối tại cổng (kết nối USB/Bluetooth); mô hình dữ liệu tập trung trên máy chủ, máy trạm truy cập qua **mạng LAN/Wifi nội bộ**. Quy mô áp dụng: tiểu đoàn → trung đoàn → nhà trường → toàn quân. Giá thành tham chiếu: phần mềm 10.000.000đ + máy quét QR 400.000đ/cổng.

> ⚠️ **Lưu ý khác biệt triển khai thực tế:** bản FE hiện tại là **Next.js static export (S3/CloudFront)** gọi backend AWS API Gateway + Lambda, và trang `/scan` quét bằng **camera (`html5-qrcode`)** — khác với mô hình LAN + máy quét USB/Bluetooth trong sáng kiến. Cần thống nhất khi triển khai thực địa.

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
  - **Phương tiện (tuỳ chọn)**: switch bật/tắt section — Loại xe (Ô tô/Xe máy/Khác), Hãng, Dòng, Biển số, ảnh xe (≤10). Tạo cùng lúc với quân nhân.
- Backend tự sinh:
  - **Code**: `VN_HCMC_SOLDIER_CAPTAIN_0001`
  - **QR**: Mã QR để scan tại cổng

### 4️⃣b Phương Tiện (Vehicle)

- **Quản lý phương tiện cá nhân** (1 quân nhân ↔ tối đa 1 phương tiện):
  - Trên bảng quân nhân: action "Phương tiện" để xem/tạo/sửa/xoá phương tiện + ảnh của từng quân nhân
  - Trang độc lập `/vehicles`: tìm kiếm (biển số/hãng/dòng), phân trang, thêm/sửa/xoá theo `personnelId`
- Ảnh xe upload trước qua `POST /api/common/upload-image?category=vehicle`

### 4️⃣c Quét QR Cổng (Scan)

- Trang `/scan`: dùng camera (`html5-qrcode`) quét QR quân nhân / người dân → gọi `POST /api/qr-scan-logs/scan`
- Với người dân: admin Duyệt/Từ chối ngay trên trang

### 4️⃣d Cấu Hình Hệ Thống

- `/units` — Đơn vị (CRUD + logo)
- `/submission-groups` — Nhóm trình (thành viên)
- `/submission-flows` — Luồng trình (thứ tự nhóm duyệt)
- `/leave-approval-configs` — Cấu hình phê duyệt nghỉ phép theo chức vụ

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
├─ military_vehicles          → Phương tiện 1:1 với quân nhân (vehicleType, brand, model, licensePlate, imagePaths)

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

> **2 loại tài khoản & phân quyền menu (chờ BE định nghĩa role quét):** (1) TK quân nhân — phân quyền theo cấp; (2) TK quét QR — chỉ thấy "Tổng quan". Chi tiết ma trận hiển thị menu + yêu cầu BE định nghĩa `ROLE_SCANNER`/`ROLE_GATE`: xem [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) → "Account Types & Sidebar Menu Visibility".

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

Sidebar được nhóm theo 5 mục:

```
▸ Tổng quan
  🏠 Dashboard            → /dashboard
  🔳 Quét QR cổng         → /scan
▸ Quân nhân
  🛡️ Danh sách quân nhân  → /soldiers
  🚗 Phương tiện          → /vehicles
▸ Nghỉ phép
  📄 Đơn nghỉ phép        → /requests
▸ Lịch sử
  🕘 Lịch sử ra vào       → /history
▸ Cấu hình hệ thống
  🏢 Đơn vị               → /units
  👥 Nhóm trình           → /submission-groups
  🗺️ Luồng trình          → /submission-flows
  ⚙️ Cấu hình phê duyệt   → /leave-approval-configs
[Đăng xuất]
```

> Lưu ý: "Thêm quân nhân" giờ là modal/action trên trang `/soldiers` (không còn là mục sidebar riêng). Mục quản lý Quân khu (regions) đã được gỡ khỏi FE.

---

## ⚙️ Custom Hooks Hiện Có

Đã tạo 10 custom hooks theo pattern của `use-soldier.ts`:

| **Hook**                    | **Dùng Cho**               | **Các Hàm Chính**                                                                                                                          |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `use-auth`                  | Login/Logout               | `signIn`, `signOut`                                                                                                                        |
| `use-soldier`               | CRUD quân nhân, upload ảnh | `createSoldier`, `uploadImage`, `getSoldiers`, `deleteSoldier`                                                                             |
| `use-vehicle`               | CRUD phương tiện           | `attachVehicle`, `updateVehicle`, `getVehicles`, `getVehicleById`, `getVehicleByPersonnelId`, `deleteVehicle`, `deleteVehicleImage`, `uploadVehicleImage` |
| `use-unit`                  | CRUD đơn vị                | `createUnit`, `updateUnit`, `deleteUnit`, `getUnits`, `getUnitById`, `uploadLogo`                                                          |
| `use-submission`            | Nhóm trình & Luồng trình   | `createGroup`, `updateGroup`, `deleteGroup`, `getGroups`, `addUserToGroup`, `removeUserFromGroup`, `createFlow`, `updateFlow`, `deleteFlow`, `getFlows`, `getFlowById` |
| `use-leave-request`         | Yêu cầu nghỉ phép          | `createLeaveRequest`, `getMyLeaveRequests`, `getPendingLeaveRequests`, `acceptLeaveRequest`, `approveLeaveRequest`, `returnLeaveRequest`, `editLeaveRequest`, `resubmitLeaveRequest`, `supplementLeaveRequest`, `submitNextLeaveRequest` |
| `use-leave-approval-config` | Cấu hình phê duyệt         | `createConfig`, `updateConfig`, `deleteConfig`, `getConfigs`, `getConfigById`, `toggleConfigActive`, `getApplicableConfigs`               |
| `use-qr-scan`               | Quét QR                    | `scanQR`, `approveQRScan`, `rejectQRScan`, `getQRScanLog`, `getQRScanLogs`                                                                 |
| `use-combobox`              | Dropdown data              | `getRanks`, `getPositions`, `getUnits`                                                                                                     |
| `use-debounce`              | Debounce input             | (utility hook)                                                                                                                             |

**Đặc điểm chung:**

- ✅ Type definitions đầy đủ
- ✅ Error handling & toast notifications
- ✅ useCallback + useMemo tối ưu
- ✅ Consistent pattern
- ✅ Support file upload (unit logo, vehicle images)

> Lưu ý: `use-region` đã bị gỡ khỏi FE; `use-combobox` không còn `getRegions`.

---

## 📊 Ma Trận Trạng Thái Tính Năng (Sáng kiến ↔ Hiện trạng)

Đối chiếu các tính năng nêu trong Thuyết minh sáng kiến với hiện trạng code/API (2026-07-21):

| Tính năng (theo sáng kiến) | Trạng thái | Ghi chú |
| --- | --- | --- |
| Tự động tạo mã QR định danh quân nhân | ✅ Đã có | QR base64 do backend sinh |
| Quét QR quân nhân xác nhận ra/vào | ✅ Đã có | `/scan` + `POST /api/qr-scan-logs/scan` |
| Quét QR/CCCD khách (công dân) | ✅ Đã có | Nhánh `citizen` inline ở `/scan` |
| Kiểm tra quyền ra vào (đối chiếu đơn nghỉ) | ✅ Đã có | Backend kiểm `allowedOutCount`/ngày |
| Quản lý hồ sơ quân nhân (cấp bậc, chức vụ, đơn vị) | ✅ Đã có | `/soldiers`, `/add-soldier` |
| Quản lý phương tiện ra vào | ✅ Đã có | `/vehicles`, 1:1 với quân nhân |
| Quản lý đơn vị | ✅ Đã có | `/units` |
| Lưu lịch sử ra vào | 🟠 Một phần | `/history` đang hiển thị đơn chờ duyệt, **chưa** phải log scan; chưa có API list `qr-scan-logs` |
| Tìm kiếm theo tên/đơn vị/thời gian/CCCD | 🟠 Một phần | Có tìm theo tên/đơn vị; **chưa** lọc theo thời gian/CCCD |
| **Quản lý danh sách khách + thời gian ra vào** | ❌ Chưa có | Chưa có module/API quản lý khách (chỉ quét inline) |
| **Thống kê số lượt ra vào (ngày/tuần/tháng/đơn vị/đối tượng)** | ❌ Chưa có | Dashboard đang **mock**; không có API thống kê |
| **Xuất báo cáo phục vụ chỉ huy** | ❌ Chưa có | Chưa có API/UI export |
| **Hiển thị ảnh chân dung để đối chiếu khi quét** | ❌ Chưa có | `QRScanLog` không trả `imageUrl` |
| **Nhật ký thao tác (audit log)** | ❌ Chưa có | Chưa có API/UI |
| Đối tượng: CNV quốc phòng, lao động hợp đồng | ❌ Chưa có | Mới hỗ trợ quân nhân + công dân |
| Phân quyền người dùng theo cấp | ✅ Đã có | 5 role, scope theo region/unit |

> Các mục ❌/🟠 là **định hướng/roadmap** — cần backend bổ sung endpoint tương ứng (xem [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) → "Module dự kiến (chưa triển khai)").

---

## ✅ Tóm Lại: Web App Này Làm Gì?

🎯 **Nó là một hệ thống kiểm soát ra vào + duyệt nghỉ phép cho quân đội** với:

### Core Features

- ✅ **Quản lý quân nhân** + QR tự sinh
- ✅ **Quản lý phương tiện** (1:1 với quân nhân, nhiều ảnh)
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
**Last Updated**: 2026-07-21  
**Ready for Development**: YES ✅
