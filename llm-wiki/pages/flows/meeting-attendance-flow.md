---
title: Luồng điểm danh cuộc họp
type: flow
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
updated: 2026-11-02
---

# Luồng điểm danh cuộc họp

## Mục tiêu
Tự động hóa hoàn toàn quy trình tổ chức và điểm danh cuộc họp: Lên lịch họp, triệu tập đại biểu, màn hình Live roll-call trực tiếp tại phòng họp hiển thị ngay ảnh khi đại biểu nhận diện Face ID / quẹt thẻ, và xuất biên bản chuyên cần sau họp.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Thư ký / Chủ trì | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) | Tạo cuộc họp: nhập tiêu đề, chọn phòng họp, thời gian và chọn đại biểu từ danh sách nhân sự | Cuộc họp ở trạng thái Sẵn sàng đón tiếp | MTG-01 |
| 2 | Đại biểu | Cửa phòng họp | Nhận diện khuôn mặt Face ID hoặc quẹt thẻ nhân viên tại thiết bị phòng họp | Thiết bị phát tín hiệu xác nhận thành công | MTG-02 |
| 3 | Màn hình Live | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) | Tiếp nhận sự kiện, hiển thị ngay ảnh chân dung, tên, chức danh và chuyển trạng thái đại biểu sang "Đã vào họp" | Màn hình Live cập nhật tức thì theo thời gian thực | MTG-02 |
| 4 | Đại biểu | Cửa phòng họp | Xác thực khi ra ngoài giữa giờ hoặc khi cuộc họp kết thúc | Ghi nhận thời điểm rời phòng họp | MTG-03 |
| 5 | Thư ký / Chủ trì | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) | Bấm "Kết thúc cuộc họp" | Chốt dữ liệu chuyên cần, hiển thị tổng hợp và nút xuất file PDF/Excel | MTG-04 |

## Quy tắc chặn / validation
- Đại biểu ngoài danh sách triệu tập khi quét thẻ vẫn được ghi nhận nhưng xếp vào nhóm "Đại biểu bổ sung / Khách mời".
- Chống quét trùng lặp: Giữ bản ghi đầu tiên nếu cùng một đại biểu quét liên tiếp trong 60 giây tại phòng họp.
- Cuộc họp sau khi đã bấm Kết thúc sẽ chuyển sang trạng thái Đã đóng (Closed), dữ liệu trở thành bất biến và tự động đồng bộ sang Bảng điều khiển báo cáo.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| MTG-01 | P0 | Thiết lập lịch họp, phòng họp và triệu tập danh sách đại biểu | Đã hoàn thành lên lịch họp, phòng họp, thời gian và triệu tập đại biểu theo phòng ban | MATCH | repo:src/services/meeting.ts:1, repo:src/pages/meeting/MeetingModal.tsx:1 |
| MTG-02 | P0 | Màn hình Live roll-call điểm danh thời gian thực tại phòng họp | Chưa triển khai | MISSING | - |
| MTG-03 | P0 | Điểm danh Check-out và chốt kết thúc cuộc họp | Chưa triển khai | MISSING | - |
| MTG-04 | P0 | Xuất biên bản và báo cáo chuyên cần cuộc họp dạng PDF/Excel | Chưa triển khai | MISSING | - |

## Liên quan
- [Cuộc họp](../entities/meeting.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
