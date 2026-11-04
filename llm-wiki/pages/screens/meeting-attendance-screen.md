---
title: Màn hình điểm danh cuộc họp
type: screen
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
apps: [web]
route_ids: [/meetings/attendance]
status: partial
updated: 2026-11-04
---

# Màn hình điểm danh cuộc họp

## Mục đích
Màn hình phục vụ người chủ trì cuộc họp, thư ký hoặc ban tổ chức lên lịch họp, chiếu màn hình Live roll-call tại phòng họp hiển thị ngay ảnh chân dung khi đại biểu nhận diện Face ID / quẹt thẻ và xuất biên bản chuyên cần sau họp. Áp dụng split-view panel và các thẻ đại biểu theo Design System.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/meetings/attendance` | repo:src/pages/meeting/MeetingManagement.tsx:1, repo:src/pages/meeting/MeetingModal.tsx:1 |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| MTG-01 | Form tạo cuộc họp, chọn phòng họp, thời gian và chọn đại biểu theo phòng ban | BUILT |
| MTG-02 | Chế độ Màn hình Live (Live roll-call): Hiển thị ảnh chân dung Face ID / phương thức thẻ của đại biểu vừa bước vào, cập nhật tức thì danh sách ai đã đến, ai chưa đến | MISSING |
| MTG-03 | Nút Check-out và nút "Kết thúc cuộc họp", chuyển trạng thái cuộc họp sang Đã đóng | MISSING |
| MTG-04 | Khung tổng hợp chuyên cần (% có mặt, số người đi muộn, vắng mặt) và nút xuất file PDF/Excel biên bản họp | MISSING |

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| MTG-01 | P0 | Giao diện tạo lịch họp và chọn đại biểu | Đã hoàn thành giao diện thiết lập cuộc họp, phòng họp, thời gian và chọn đại biểu theo phòng ban | MATCH | repo:src/pages/meeting/MeetingModal.tsx:1, repo:src/pages/meeting/MeetingManagement.tsx:1 |
| MTG-02 | P0 | Màn hình Live roll-call điểm danh thời gian thực kèm ảnh Face ID | Chưa triển khai | MISSING | - |
| MTG-03 | P0 | Chức năng chốt kết thúc cuộc họp | Chưa triển khai | MISSING | - |
| MTG-04 | P0 | Khung báo cáo chuyên cần và xuất biên bản cuộc họp | Chưa triển khai | MISSING | - |

## Liên quan
- [Cuộc họp](../entities/meeting.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Bảng điều khiển báo cáo](attendance-dashboard.md)
