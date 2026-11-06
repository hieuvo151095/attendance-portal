---
title: Báo cáo chuyên cần
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [DASH-01, DASH-02]
updated: 2026-11-04
---

# Báo cáo chuyên cần

## Định nghĩa
Thực thể `Báo cáo chuyên cần` (Attendance Summary) là tập hợp các chỉ số thống kê tổng hợp phục vụ lãnh đạo cơ quan, chỉ tính toán sau khi các cuộc họp đã kết thúc và tổng kết dữ liệu hiện diện theo ngày, tuần hoặc tháng.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| DASH-01 | Tổng hợp danh mục các cuộc họp đã kết thúc trong kỳ: Tên cuộc họp, thời gian thực tế, tỷ lệ đại biểu có mặt (% chuyên cần), số đại biểu vắng, liên kết tải nhanh biên bản họp. | Không hiển thị cuộc họp đang diễn ra |
| DASH-02 | Thống kê xu hướng hiện diện toàn cơ quan: Tổng số nhân sự, tỷ lệ đúng giờ, tỷ lệ đi muộn, tỷ lệ vắng mặt; biểu đồ chuyên cần so sánh giữa các phòng ban. | Cập nhật theo chu kỳ ngày, tuần, tháng |

## Quan hệ
- Thuộc về [Tài khoản đơn vị](tenant-account.md).
- Tổng hợp dữ liệu từ các [Cuộc họp](meeting.md) đã hoàn tất và các [Bản ghi điểm danh](attendance-record.md).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| DASH-01 | P2 | Thống kê tổng hợp các cuộc họp đã kết thúc và tỷ lệ chuyên cần | Đã triển khai đầy đủ màn hình lưu trữ, thẻ tổng hợp và tải nhanh biên bản | MATCH | [MeetingReportArchive.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/report/MeetingReportArchive.tsx#L25-L100) |
| DASH-02 | P2 | Biểu đồ xu hướng hiện diện cơ quan theo ngày/tuần/tháng | Đã xây dựng hoàn tất bảng điều khiển Dashboard, biểu đồ xu hướng SVG, so sánh Meter phòng ban và cơ cấu điểm danh | MATCH | [AttendanceDashboard.tsx](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/src/pages/dashboard/AttendanceDashboard.tsx#L1-L150) |

## Liên quan
- [Phân hệ Bảng điều khiển báo cáo](../overview/module-dashboard.md)
- [Bảng điều khiển báo cáo](../screens/attendance-dashboard.md)
- [Cuộc họp](meeting.md)
