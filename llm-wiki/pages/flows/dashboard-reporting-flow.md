---
title: Luồng xem báo cáo tổng hợp
type: flow
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [DASH-01, DASH-02]
updated: 2026-11-04
---

# Luồng xem báo cáo tổng hợp

## Mục tiêu
Cung cấp bức tranh toàn cảnh về tình hình hội họp và mức độ chuyên cần của toàn cơ quan cho lãnh đạo đơn vị, chỉ tổng hợp khi cuộc họp đã hoàn tất.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Lãnh đạo / Quản trị | [Bảng điều khiển báo cáo](../screens/attendance-dashboard.md) | Truy cập Bảng điều khiển (Dashboard) | Hiển thị các chỉ số chuyên cần tổng hợp của toàn cơ quan | DASH-01, DASH-02 |
| 2 | Lãnh đạo / Quản trị | [Bảng điều khiển báo cáo](../screens/attendance-dashboard.md) | Xem danh mục các cuộc họp đã kết thúc trong kỳ | Thống kê số lượng cuộc họp, tỷ lệ tham gia trung bình, xem chi tiết và tải nhanh biên bản | DASH-01 |
| 3 | Lãnh đạo / Quản trị | [Bảng điều khiển báo cáo](../screens/attendance-dashboard.md) | Chọn khoảng thời gian (Hôm nay, Tuần này, Tháng này) hoặc lọc theo phòng ban | Biểu đồ xu hướng cập nhật: tỷ lệ đi làm đúng giờ, đi muộn, vắng mặt | DASH-02 |

## Quy tắc chặn / validation
- Bảng điều khiển tuyệt đối không hiển thị các cuộc họp đang diễn ra hay tỷ lệ thiếu người dang dở; chỉ tổng hợp các cuộc họp đã kết thúc.
- Toàn bộ giao diện thẻ thống kê, biểu đồ và widget phải áp dụng đúng biến CSS và token màu từ `Design System/src/css.css`.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| DASH-01 | P2 | Tổng hợp danh mục các cuộc họp đã kết thúc và tỷ lệ chuyên cần | Đã hoàn thành bộ lọc kỳ, thống kê chuyên cần và lưu trữ biên bản cuộc họp | MATCH | [MeetingReportArchive.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/report/MeetingReportArchive.tsx#L1-L150) |
| DASH-02 | P2 | Biểu đồ xu hướng hiện diện cơ quan theo ngày/tuần/tháng | Đã triển khai đầy đủ Dashboard với các thẻ KPI, biểu đồ cột/đường xu hướng SVG, so sánh các phòng ban và cơ cấu điểm danh | MATCH | [AttendanceDashboard.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/dashboard/AttendanceDashboard.tsx#L1-L150) |

## Liên quan
- [Báo cáo chuyên cần](../entities/attendance-summary.md)
- [Bảng điều khiển báo cáo](../screens/attendance-dashboard.md)
- [Phân hệ Bảng điều khiển báo cáo](../overview/module-dashboard.md)
