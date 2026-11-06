---
title: Màn hình chấm công ngày
type: screen
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ATT-01, ATT-02, ATT-03]
apps: [web]
route_ids: [/attendance/daily]
status: complete
updated: 2026-11-04
---

# Màn hình chấm công ngày

## Mục đích
Màn hình phục vụ nhân sự theo dõi tình hình vào/ra cơ quan hàng ngày của cán bộ nhân viên, xem giờ đến, giờ về, phân loại đúng giờ, đi muộn, về sớm và tùy chỉnh khung giờ hành chính chuẩn. Áp dụng bảng dữ liệu và bộ lọc theo Design System.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/attendance/daily` | repo:src/pages/attendance/DailyAttendance.tsx:1, repo:src/services/attendance.ts:1, repo:src/pages/setting/AttendanceSettingsModal.tsx:1, repo:src/services/setting.ts:1 |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| ATT-01 | Khung cấu hình Khung ca hành chính chuẩn (Giờ vào ca, tan ca, số phút dung sai đi muộn cho phép) | BUILT |
| ATT-02 | Bảng hiển thị các lượt quét Check-in / Check-out trong ngày từ cổng cơ quan kèm phương thức (Face ID / Thẻ) | BUILT |
| ATT-03 | Bảng theo dõi chấm công ngày: Danh sách nhân viên, giờ đến, giờ về, số phút đi muộn và nhãn trạng thái (Đúng giờ / Muộn / Vắng) | BUILT |

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ATT-01 | P1 | Giao diện cấu hình khung giờ ca hành chính chuẩn | Đã hoàn thành modal cấu hình khung giờ làm việc cơ quan (ca sáng, ca chiều) và dung sai đi muộn | MATCH | repo:src/pages/setting/AttendanceSettingsModal.tsx:1, repo:src/services/setting.ts:1 |
| ATT-02 | P1 | Danh sách tiếp nhận sự kiện Check-in/Check-out hàng ngày | Đã hoàn thành tiếp nhận sự kiện quét cổng, phân loại Check-in/Check-out và lưu vết chi tiết | MATCH | repo:src/services/attendance.ts:1, repo:src/pages/attendance/QuickScanModal.tsx:1 |
| ATT-03 | P1 | Bảng theo dõi chấm công ngày và phân loại chuyên cần | Đã hoàn thành bảng theo dõi chấm công ngày, lọc phòng ban, trạng thái, thẻ chỉ số và xuất file Excel | MATCH | repo:src/pages/attendance/DailyAttendance.tsx:1, repo:src/services/attendance.ts:1 |

## Liên quan
- [Ca làm việc](../entities/work-shift.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Luồng chấm công vào ra cơ quan](../flows/daily-attendance-flow.md)
