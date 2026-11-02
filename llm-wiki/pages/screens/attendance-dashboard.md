---
title: Bảng điều khiển điểm danh
type: screen
sources:
  - pages/sources/initial-requirements.md
spec_ids: [CC-01, CC-02, MTG-04, TB-01]
apps: [web]
route_ids: [/dashboard]
status: missing
updated: 2026-11-02
---

# Bảng điều khiển điểm danh

## Mục đích
Màn hình trung tâm dành cho Quản lý nhân sự, Ban giám đốc hoặc Trực ban cơ quan theo dõi toàn bộ tình hình hiện diện của cơ quan: số lượng nhân viên đã vào cơ quan trong ngày, các cuộc họp đang diễn ra và trạng thái kết nối của các thiết bị Hikvision.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/dashboard` | - |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| CC-01 | Thống kê số lượng nhân viên đã Check-in trong ngày theo phòng ban | MISSING |
| CC-02 | Thống kê số lượng nhân viên đã Check-out tan ca hoặc đang trong cơ quan | MISSING |
| MTG-04 | Widget danh sách các cuộc họp đang diễn ra trong ngày kèm tỷ lệ hiện diện | MISSING |
| TB-01 | Widget theo dõi trạng thái online/offline của các camera Hikvision và đầu đọc thẻ | MISSING |

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| CC-01 | Widget thống kê check-in đầu ngày theo phòng ban | Chưa triển khai | MISSING | - |
| CC-02 | Widget thống kê check-out và tổng quan hiện diện | Chưa triển khai | MISSING | - |
| MTG-04 | Widget hiển thị các cuộc họp đang diễn ra | Chưa triển khai | MISSING | - |
| TB-01 | Giám sát trạng thái thiết bị ngoại vi | Chưa triển khai | MISSING | - |

## Liên quan
- [Luồng chấm công vào ra cơ quan](../flows/daily-attendance-flow.md)
- [Màn hình điểm danh cuộc họp](meeting-attendance-screen.md)
- [Thiết bị](../entities/device.md)
