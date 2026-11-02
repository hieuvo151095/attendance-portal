---
title: Màn hình điểm danh cuộc họp
type: screen
sources:
  - pages/sources/initial-requirements.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
apps: [web]
route_ids: [/meetings/attendance]
status: missing
updated: 2026-11-02
---

# Màn hình điểm danh cuộc họp

## Mục đích
Màn hình phục vụ người chủ trì cuộc họp, thư ký hoặc ban tổ chức theo dõi danh sách đại biểu hiện diện trực tiếp tại phòng họp theo thời gian thực (kèm ảnh chụp và phương thức xác thực), điểm danh bổ sung thủ công nếu cần và xuất biên bản chuyên cần ngay khi tan họp.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/meetings/attendance` | - |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| MTG-01 | Chọn cuộc họp đang diễn ra, hiển thị thông tin phòng họp và thời gian | MISSING |
| MTG-02 | Hiển thị bảng đại biểu tham dự, cập nhật trạng thái "Đã vào họp" kèm ảnh Face ID / phương thức thẻ ngay khi có sự kiện | MISSING |
| MTG-03 | Hiển thị trạng thái "Đã ra ngoài / Tan họp" khi đại biểu check-out | MISSING |
| MTG-04 | Widget thống kê trực quan tỷ lệ chuyên cần (% tham dự, số người vắng mặt, số người đi muộn) và nút xuất báo cáo Excel/PDF | MISSING |

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| MTG-01 | Giao diện chọn và theo dõi cuộc họp | Chưa triển khai | MISSING | - |
| MTG-02 | Widget hiển thị sự kiện check-in thời gian thực | Chưa triển khai | MISSING | - |
| MTG-03 | Widget hiển thị sự kiện check-out thời gian thực | Chưa triển khai | MISSING | - |
| MTG-04 | Widget thống kê tỷ lệ chuyên cần và xuất báo cáo | Chưa triển khai | MISSING | - |

## Liên quan
- [Cuộc họp](../entities/meeting.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Bảng điều khiển điểm danh](attendance-dashboard.md)
