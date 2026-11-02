---
title: Quyết định Kiến trúc & Danh mục Tính năng 2026-11-02
type: source
sources:
  - raw/specs/initial-requirements.md
updated: 2026-11-02
---

# Quyết định Kiến trúc & Danh mục Tính năng 2026-11-02

## Thông tin nguồn
| Trường | Giá trị |
|---|---|
| Đường dẫn | Trao đổi trực tiếp với Product Owner |
| Người cung cấp | Product Owner |
| Ngày | 2026-11-02 |
| Loại | Quyết định kiến trúc & chốt phạm vi tính năng |

## Nội dung chính
- **Mục tiêu hệ thống**: Cổng chuyên biệt dành cho khách hàng là Cơ quan nhà nước/UBND, Doanh nghiệp/Nhà máy, Bệnh viện (loại trừ trường học).
- **Phân tách trách nhiệm hệ thống**:
  - Cổng ECO Card nội bộ: Finviet quản lý thiết bị camera Hikvision, cấu hình kết nối và nạp thẻ gốc.
  - Cổng Attendance Portal (Client-facing): Khách hàng đăng nhập quản trị nhân sự, điểm danh cuộc họp, theo dõi chấm công và xem báo cáo.
- **Quy chuẩn giao diện bắt buộc**: Toàn bộ hệ thống frontend bắt buộc áp dụng Design System chuẩn tại thư mục `Design System/` (biến CSS màu sắc, typography, dark/light mode, components, layout).
- **Tinh giản kiến trúc**: Bỏ phân hệ Nhật ký rời và phân hệ Thiết bị riêng; tích hợp nhật ký/báo cáo trực tiếp vào từng phân hệ; loại bỏ các tính năng bán hàng/POS/Ecopay của trường học.

## Quyết định
| Câu hỏi | Phương án chọn | Phương án bị loại | Người quyết | Cách chốt | Gỡ chặn |
|---|---|---|---|---|---|
| Bảng điều khiển (Dashboard) hiển thị những gì? | Chỉ tổng hợp báo cáo khi cuộc họp đã kết thúc và báo cáo hiện diện toàn cơ quan. | Hiển thị trạng thái camera Hikvision và cuộc họp đang diễn ra. | Product Owner | Trực tiếp | DASH-01, DASH-02 |
| Chấm công vào ra có cần xoay ca phức tạp không? | Áp dụng khung giờ hành chính mặc định (Sáng 07:30 - 11:30, Chiều 13:30 - 17:00, dung sai 10 phút), cho phép đơn vị chỉnh giờ. | Phân ca xoay ca đa kíp phức tạp. | Product Owner | Trực tiếp | ATT-01 |
| Tính năng đầu tiên cần phát triển là gì? | Đăng nhập bằng tên đăng nhập và mật khẩu do Finviet cấp phát riêng cho từng đơn vị. | Làm ngay màn hình điểm danh hoặc import nhân sự khi chưa có auth. | Product Owner | Trực tiếp | AUTH-01 |
| Nguồn quy chuẩn thiết kế UI/UX? | Bắt buộc tuân thủ token và component trong thư mục `Design System/`. | Tự ý dùng thư viện UI bên ngoài lệch chuẩn. | Product Owner | Trực tiếp | Toàn bộ Screens |

## Mã yêu cầu được định nghĩa
| Mã | Ưu tiên | Quy tắc (kiểm được) | Nguồn (dòng/mục) |
|---|---|---|---|
| AUTH-01 | P0 | Đăng nhập tài khoản đơn vị với username và mật khẩu do Finviet cấp; cô lập dữ liệu đa khách hàng (multi-tenant) | Quyết định PO |
| AUTH-02 | P0 | Quản trị phiên làm việc, đổi mật khẩu lần đầu và hiển thị thông tin hồ sơ cơ quan | Quyết định PO |
| ORG-01 | P0 | Quản lý cơ cấu phòng ban / đơn vị (Khối/Phòng/Ban, Phân xưởng/Tổ đội, Khoa/Phòng khám) | Quyết định PO |
| ORG-02 | P0 | Quản lý danh sách nhân sự, gắn phòng ban, chức vụ, import Excel và nạp ảnh chân dung Face ID | Quyết định PO |
| ORG-03 | P0 | Quản lý cấp phát và liên kết mã thẻ nhân viên vật lý (RFID/NFC) vào hồ sơ nhân sự | Quyết định PO |
| MTG-01 | P0 | Lên lịch cuộc họp, chọn phòng họp, thời gian và triệu tập danh sách đại biểu bắt buộc/tùy chọn | Quyết định PO |
| MTG-02 | P0 | Màn hình Điểm danh Trực tiếp tại phòng họp (Live roll-call qua camera Face ID / Thẻ với ảnh đối soát tức thì) | Quyết định PO |
| MTG-03 | P0 | Điểm danh Check-out rời phòng họp, chốt kết thúc cuộc họp và tính thời gian tham gia thực tế | Quyết định PO |
| MTG-04 | P0 | Tổng hợp chuyên cần cuộc họp (% tham gia, muộn, vắng) và xuất file PDF/Excel biên bản cuộc họp | Quyết định PO |
| ATT-01 | P1 | Cấu hình khung giờ ca làm việc chuẩn (mặc định giờ hành chính, số phút dung sai đi muộn cho phép) | Quyết định PO |
| ATT-02 | P1 | Tiếp nhận sự kiện Check-in đầu ngày và Check-out tan ca từ cổng cơ quan qua camera / thẻ | Quyết định PO |
| ATT-03 | P1 | Bảng theo dõi Chấm công Ngày và phân loại Đúng giờ / Đi muộn / Về sớm / Vắng mặt | Quyết định PO |
| DASH-01 | P2 | Báo cáo tổng hợp danh sách các cuộc họp đã kết thúc và tỷ lệ chuyên cần trung bình | Quyết định PO |
| DASH-02 | P2 | Báo cáo tổng hợp xu hướng hiện diện và tỷ lệ đi làm chuyên cần toàn cơ quan theo ngày/tuần/tháng | Quyết định PO |

## Điểm đáng chú ý / mâu thuẫn
- Nguồn quyết định này thay thế và định hình lại toàn bộ danh mục tính năng ban đầu, chuyển từ tiền tố CC, TB, NV sang hệ thống 5 phân hệ chuẩn: `AUTH`, `ORG`, `MTG`, `ATT`, `DASH`.

## Trang chịu ảnh hưởng
- [Tổng quan Attendance Portal](../overview/project-overview.md)
- [Xác thực và tài khoản](../overview/module-authentication.md)
- [Tổ chức và nhân sự](../overview/module-organization.md)
- [Điểm danh cuộc họp](../overview/module-meeting.md)
- [Chấm công vào ra](../overview/module-attendance.md)
- [Bảng điều khiển báo cáo](../overview/module-dashboard.md)
