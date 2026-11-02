---
title: Luồng điểm danh cuộc họp
type: flow
sources:
  - pages/sources/initial-requirements.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
updated: 2026-11-02
---

# Luồng điểm danh cuộc họp

## Mục tiêu
Tự động hóa toàn bộ quy trình ghi nhận đại biểu tham gia cuộc họp bằng camera nhận diện khuôn mặt Hikvision, vân tay hoặc thẻ nhân viên vật lý; giám sát trạng thái hiện diện và xuất báo cáo chuyên cần thời gian thực.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Thư ký / Quản trị | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) | Tạo cuộc họp, chọn phòng họp, nhập danh sách đại biểu tham dự | Cuộc họp ở trạng thái sẵn sàng đón đại biểu | MTG-01 |
| 2 | Đại biểu / Nhân viên | Thiết bị Hikvision / Đầu đọc thẻ tại phòng họp | Đứng trước camera (Face ID), quét vân tay hoặc chạm thẻ nhân viên | Thiết bị nhận diện và phát âm thanh/đèn báo thành công | MTG-02 |
| 3 | Hệ thống | Cổng dịch vụ nền | Nhận diện dữ liệu, đối soát với danh sách đại biểu, ghi nhận thời gian vào | Tạo bản ghi Check-in cuộc họp, cập nhật trạng thái đúng giờ/muộn | MTG-02 |
| 4 | Đại biểu / Nhân viên | Thiết bị Hikvision tại cửa ra phòng họp | Xác thực khi tan họp hoặc ra ngoài phòng họp | Thiết bị ghi nhận mốc thời gian rời đi | MTG-03 |
| 5 | Hệ thống / Quản trị | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) | Kết thúc cuộc họp và xem tổng kết | Hiển thị bảng thống kê: có mặt, vắng mặt, muộn, thời lượng tham gia | MTG-04 |

## Quy tắc chặn / validation
- Nhân viên không nằm trong danh sách triệu tập khi quét thẻ/khuôn mặt vẫn được lưu nhận diện nhưng đánh dấu trạng thái "Khách mời / Đại biểu ngoài danh sách".
- Ngăn chặn ghi nhận trùng lặp: Nếu cùng 1 nhân viên quét liên tiếp trong vòng 60 giây tại cùng 1 thiết bị, hệ thống chỉ giữ bản ghi đầu tiên.
- Khung thời gian Check-in hợp lệ: Mở trước giờ họp 30 phút cho đến khi kết thúc cuộc họp.

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| MTG-01 | Thiết lập cuộc họp và danh sách đại biểu tham dự | Chưa triển khai | MISSING | - |
| MTG-02 | Xử lý sự kiện Check-in phòng họp từ Hikvision / Thẻ | Chưa triển khai | MISSING | - |
| MTG-03 | Xử lý sự kiện Check-out phòng họp và tính thời gian tham gia | Chưa triển khai | MISSING | - |
| MTG-04 | Tổng hợp dữ liệu chuyên cần và xuất báo cáo cuộc họp | Chưa triển khai | MISSING | - |

## Liên quan
- [Cuộc họp](../entities/meeting.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
