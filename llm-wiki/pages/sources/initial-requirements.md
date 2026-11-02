---
title: Yêu cầu khởi tạo Attendance Portal
type: source
sources:
  - raw/specs/initial-requirements.md
updated: 2026-11-02
---

# Yêu cầu khởi tạo Attendance Portal

## Thông tin nguồn
| Trường | Giá trị |
|---|---|
| Đường dẫn | `raw/specs/initial-requirements.md` |
| Người cung cấp | Product Owner |
| Ngày | 2026-11-02 |
| Loại | PRD / Yêu cầu khởi tạo |

## Nội dung chính
- Xác định phạm vi nghiệp vụ của Attendance Portal áp dụng cho: Uỷ ban nhân dân cấp phường, cơ quan hành chính nhà nước; công ty doanh nghiệp, nhà máy; bệnh viện (loại trừ trường học).
- Xác lập 2 phân hệ chấm công:
  1. Điểm danh cuộc họp trong giờ làm việc (ưu tiên triển khai trước).
  2. Chấm công vào/ra cơ quan hàng ngày.
- Tích hợp thiết bị thu thập dữ liệu phần cứng: Camera Hikvision (Face ID, Vân tay) và Thẻ nhân viên vật lý.

## Mã yêu cầu được định nghĩa
| Mã | Ưu tiên | Quy tắc (kiểm được) | Nguồn (dòng/mục) |
|---|---|---|---|
| MTG-01 | P0 | Quản lý thiết lập thông tin cuộc họp (chủ đề, phòng họp, thời gian bắt đầu, kết thúc, danh sách đại biểu dự kiến) | §2 |
| MTG-02 | P0 | Ghi nhận Check-in vào cuộc họp qua Face ID, Vân tay hoặc Thẻ vật lý, lưu vết mốc thời gian và độ tin cậy | §2, §3 |
| MTG-03 | P0 | Ghi nhận Check-out rời phòng họp khi tan họp hoặc ra ngoài giữa giờ | §2 |
| MTG-04 | P0 | Tổng hợp báo cáo hiện diện cuộc họp thời gian thực (đúng giờ, muộn, vắng mặt không phép/có phép) | §2 |

## Điểm đáng chú ý / mâu thuẫn
- Toàn bộ danh mục tính năng chi tiết, phân hệ và quy chuẩn Design System đã được chuẩn hóa chính thức tại [Quyết định kiến trúc 2026-11-02](portal-architecture-decisions-2026-11-02.md).

## Trang chịu ảnh hưởng
- [Cuộc họp](../entities/meeting.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Nhân viên](../entities/employee.md)
- [Tài khoản đơn vị](../entities/tenant-account.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Luồng chấm công hàng ngày](../flows/daily-attendance-flow.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
- [Bảng điều khiển điểm danh](../screens/attendance-dashboard.md)
