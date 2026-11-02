---
title: Ca làm việc
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ATT-01]
updated: 2026-11-02
---

# Ca làm việc

## Định nghĩa
Thực thể `Ca làm việc` (Work Shift) đại diện cho khung thời gian làm việc chuẩn của cơ quan. Hệ thống cung cấp sẵn Ca hành chính mặc định tinh gọn và cho phép đơn vị tùy chỉnh thời gian vào/tan ca cùng số phút dung sai đi muộn cho phép.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| ATT-01 | Khung ca làm việc gồm: Giờ bắt đầu ca sáng (mặc định 07:30), giờ kết thúc ca sáng (11:30), giờ bắt đầu ca chiều (13:30), giờ tan ca chiều (17:00), và dung sai cho phép đi muộn (mặc định 10 phút). Nhân viên quét Check-in sau giờ bắt đầu + dung sai sẽ bị ghi nhận là Đi muộn kèm số phút muộn. | Áp dụng mặc định cho toàn cơ quan |

## Quan hệ
- Thuộc về [Tài khoản đơn vị](tenant-account.md).
- Dùng làm thước đo quy chiếu cho các [Bản ghi điểm danh](attendance-record.md) chấm công hàng ngày.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ATT-01 | P1 | Thiết lập khung giờ ca hành chính chuẩn và dung sai đi muộn | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Chấm công vào ra](../overview/module-attendance.md)
- [Bản ghi điểm danh](attendance-record.md)
- [Màn hình chấm công ngày](../screens/daily-attendance-screen.md)
