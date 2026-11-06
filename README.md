# Cổng Điểm Danh Đơn Vị — Finviet Attendance Portal

Hệ thống quản lý điểm danh, chấm công cán bộ nhân sự, điểm danh cuộc họp kỳ và quản trị thẻ vật lý (RFID/NFC) chuyên biệt cho cơ quan nhà nước, ủy ban nhân dân và doanh nghiệp.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-186%20Passed-22C55E?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Design System](https://img.shields.io/badge/Design%20System-ECO%20ME%20v2.5.1-0052CC)](./src/design-system/)

---

## 🌟 Các phân hệ cốt lõi

### 1. Phân hệ Chấm Công & Điểm Danh Hằng Ngày
- **Bảng Theo Dõi Chấm Công Ngày:** Kiểm tra lịch sử vào/ra, phân loại tự động đúng giờ, đi muộn, về sớm theo ca làm việc đã thiết lập.
- **Quét Điểm Danh Nhanh:** Hỗ trợ mô phỏng quẹt thẻ RFID/NFC hoặc nhận diện Camera Face ID với độ trễ thấp và phản hồi âm thanh/hình ảnh tức thì.
- **Cấu hình ca làm việc:** Tùy biến khung giờ check-in, check-out và thời gian ân hạn cho từng đơn vị.

### 2. Phân hệ Cuộc Họp & Điểm Danh Hội Nghị
- **Điều phối cuộc họp:** Thiết lập phòng họp từ danh mục Master Data, khung giờ họp, chọn nhanh đại biểu bắt buộc / tùy chọn theo từng phòng ban.
- **Màn hình Live Screen:** Giao diện toàn màn hình hiển thị trực tiếp danh sách đại biểu đã đến, thời gian vào/ra và thống kê chuyên cần thời gian thực.
- **Báo cáo & Biên bản điện tử:** Kết xuất biên bản họp có gắn chứng thực mã băm số (Digital Seal Hash) đảm bảo tính toàn vẹn dữ liệu.

### 3. Phân hệ Báo Cáo & Tổng Quan Chuyên Cần
- **Executive Attendance Dashboard:** Bảng điều khiển phân tích xu hướng hiện diện, tỷ lệ đúng giờ theo ngày, tuần, tháng và quý.
- **So sánh chuyên cần liên phòng ban:** Đo lường và xếp hạng mức độ chấp hành nội quy giữa các đơn vị trực thuộc.
- **Meeting Dashboard:** Thống kê tổng hợp số lượng cuộc họp, tỷ lệ tham dự đại biểu và thời lượng thực tế.

### 4. Phân hệ Tổ Chức, Nhân Sự & Thẻ Vật Lý
- **Cơ cấu phòng ban:** Quản lý sơ đồ cây phân cấp trực thuộc đa tầng với bộ chọn `DepartmentTreeSelector`.
- **Hồ sơ nhân sự:** Quản lý thông tin định danh, CCCD, chức vụ, trạng thái sinh trắc học Face ID và Vân tay.
- **Quản lý thẻ nhân viên (RFID/NFC):** Cấp phát, liên kết mã UID vật lý, tạm khóa/mở khóa thẻ với pop-up xác nhận chuẩn Design System và thông báo Toast góc trên bên phải.
- **Nhập danh sách từ Excel:** Hỗ trợ nạp hàng loạt nhân sự bằng tệp bảng tính Excel (`.xlsx`) chuẩn OpenXML hoặc `.csv` Unicode với quy trình 3 bước kiểm tra và đối chiếu trùng lặp.

### 5. Thiết Lập Hệ Thống & Quản Trị Cơ Quan
- **Thời gian & Chấm công:** Cài đặt thông số ca hành chính, ca sáng/chiều, thời gian cho phép đến muộn/về sớm.
- **Danh mục phòng họp:** Quản lý số phòng, vị trí tầng/tòa nhà, sức chứa và thiết bị hội nghị.

---

## 🚀 Khởi chạy dự án

### Yêu cầu môi trường
- **Node.js:** phiên bản `>= 18.x`
- **Trình quản lý gói:** `npm` (khuyến nghị phiên bản đi kèm Node 18+)

### Cài đặt và chạy thử nghiệm
```bash
# 1. Tải mã nguồn về máy
git clone https://github.com/hieuvo151095/attendance-portal.git
cd attendance-portal

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt web và truy cập: **`http://localhost:3000`**

### Tài khoản trải nghiệm (Demo)
- **Tên đăng nhập:** `ubnd-ben-nghe`
- **Mật khẩu:** Bấm vào nút tài khoản mẫu trên màn hình đăng nhập hoặc nhập `Finviet@2026`
- **Đơn vị mẫu:** Ủy Ban Nhân Dân Phường Bến Nghé (Quận 1, TP. Hồ Chí Minh)

---

## 🧪 Kiểm thử & Đóng gói sản xuất

Dự án áp dụng quy chuẩn kỷ luật **Verify Gate**, mọi thay đổi mã nguồn bắt buộc vượt qua 100% các bộ kiểm thử tự động:

```bash
# Chạy toàn bộ 30 bộ kiểm thử Vitest
npm run test -- --run

# Kiểm tra đóng gói build sản xuất
npm run build
```

---

## 📁 Cấu trúc thư mục

```
attendance-portal/
├── public/                 # Tệp tĩnh, phông chữ Inter và tệp mẫu Mau_nhap_lieu_nhan_su_Finviet.xlsx
├── llm-wiki/               # Đặc tả nghiệp vụ và kiến trúc hệ thống (Karpathy-style spec wiki)
├── src/
│   ├── design-system/      # Bộ thành phần giao diện chuẩn ECO ME Dashboard v2.5.1
│   │   ├── Button.tsx, DataTable.tsx, DropdownMenu.tsx, Meter.tsx,
│   │   ├── Pagination.tsx, PopupModal.tsx, SideSheet.tsx, SidebarNav.tsx,
│   │   └── Toast.tsx, ...
│   ├── pages/
│   │   ├── attendance/     # Bảng chấm công ngày & quét điểm danh nhanh
│   │   ├── auth/           # Màn hình đăng nhập & đổi mật khẩu lần đầu
│   │   ├── dashboard/      # Dashboards chuyên cần & tổng hợp cuộc họp
│   │   ├── meeting/        # Điều phối cuộc họp, Live Screen & báo cáo
│   │   ├── organization/   # Cơ cấu phòng ban, hồ sơ nhân sự, nạp Excel & thẻ
│   │   ├── report/         # Báo cáo lưu trữ biên bản cuộc họp kỳ
│   │   └── setting/        # Thiết lập ca làm việc & danh mục phòng họp
│   ├── services/           # Lớp nghiệp vụ và lưu trữ dữ liệu State
│   ├── types/              # Định nghĩa kiểu dữ liệu TypeScript
│   ├── utils/              # Tiện ích tạo và giải nén bảng tính Excel OpenXML
│   └── test/               # 30 bộ kiểm thử tự động Vitest
├── package.json
└── vite.config.ts
```

---

## 📄 Bản quyền & Sở hữu
Bản quyền thuộc về **Finviet Technology**, phát triển phục vụ Cổng Điểm Danh Đơn Vị & Cơ Quan Hành Chính.
