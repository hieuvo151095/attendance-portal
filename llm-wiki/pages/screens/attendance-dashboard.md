---
title: Bảng điều khiển báo cáo
type: screen
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [DASH-01, DASH-02]
apps: [web]
route_ids: [/dashboard]
status: built
updated: 2026-11-04
---

# Bảng điều khiển báo cáo

## Mục đích
Màn hình trung tâm dành cho lãnh đạo và quản lý cơ quan theo dõi báo cáo phân tích tổng thể: danh sách các cuộc họp đã kết thúc trong kỳ và xu hướng hiện diện, tỷ lệ chuyên cần của toàn cơ quan theo ngày, tuần, tháng. Tuyệt đối không hiển thị cuộc họp đang diễn ra hay trạng thái thiết bị ngoại vi. Áp dụng các thẻ thống kê (`.stats`, `.banner`) và bảng dữ liệu theo Design System.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/dashboard` | `src/pages/dashboard/AttendanceDashboard.tsx` |
| web | `/reports` | `src/pages/report/MeetingReportArchive.tsx` |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| DASH-01 | Widget danh mục các cuộc họp đã kết thúc: Tên cuộc họp, thời gian, tỷ lệ chuyên cần trung bình, số người vắng mặt, liên kết tải nhanh biên bản họp | BUILT |
| DASH-02 | Widget biểu đồ xu hướng hiện diện toàn cơ quan theo ngày/tuần/tháng: Tỷ lệ đúng giờ, tỷ lệ đi muộn, tỷ lệ vắng mặt và so sánh giữa các phòng ban | BUILT |

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| DASH-01 | P2 | Widget thống kê tổng hợp các cuộc họp đã kết thúc | Đã triển khai bảng tổng hợp cuộc họp đã hoàn tất, thẻ chuyên cần và xuất biên bản | MATCH | [MeetingReportArchive.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/report/MeetingReportArchive.tsx#L1-L150) |
| DASH-02 | P2 | Biểu đồ xu hướng hiện diện và chuyên cần toàn cơ quan | Đã triển khai đầy đủ Dashboard với các thẻ KPI, biểu đồ cột/đường xu hướng SVG, so sánh các phòng ban và cơ cấu điểm danh | MATCH | [AttendanceDashboard.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/dashboard/AttendanceDashboard.tsx#L1-L150) |

## Liên quan
- [Báo cáo chuyên cần](../entities/attendance-summary.md)
- [Luồng xem báo cáo tổng hợp](../flows/dashboard-reporting-flow.md)
- [Phân hệ Bảng điều khiển báo cáo](../overview/module-dashboard.md)
