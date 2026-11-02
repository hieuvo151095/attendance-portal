---
title: Chấm công vào ra
type: overview
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
updated: 2026-11-02
---

# Chấm công vào ra

## Tóm tắt
Phân hệ **Chấm công vào ra** (mã spec `ATT-NN`) quản lý việc theo dõi giờ đến và giờ về trong ngày của cán bộ nhân viên cơ quan. Phân hệ áp dụng khung giờ hành chính mặc định tinh gọn (kèm số phút dung sai đi muộn cho phép) để tự động phân loại đúng giờ, đi muộn, về sớm hoặc vắng mặt.

## Bản đồ
| Nhóm | Trang |
|---|---|
| Nguồn | [Quyết định kiến trúc 2026-11-02](../sources/portal-architecture-decisions-2026-11-02.md) |
| Thực thể | [Bản ghi điểm danh](../entities/attendance-record.md) · [Ca làm việc](../entities/work-shift.md) |
| Luồng | [Luồng chấm công vào ra cơ quan](../flows/daily-attendance-flow.md) |
| Màn hình | [Màn hình chấm công ngày](../screens/daily-attendance-screen.md) |

## Liên quan
- [Tổng quan dự án](project-overview.md)
- [Phân hệ Tổ chức và nhân sự](module-organization.md)
- [Phân hệ Bảng điều khiển báo cáo](module-dashboard.md)
