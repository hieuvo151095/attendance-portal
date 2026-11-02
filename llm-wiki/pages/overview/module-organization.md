---
title: Tổ chức và nhân sự
type: overview
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
updated: 2026-11-02
---

# Tổ chức và nhân sự

## Tóm tắt
Phân hệ **Tổ chức và nhân sự** (mã spec `ORG-NN`) đóng vai trò nền tảng dữ liệu phục vụ điểm danh hội họp và chấm công. Phân hệ quản lý cơ cấu phòng ban, danh sách cán bộ nhân viên (hỗ trợ import Excel và nạp ảnh chân dung Face ID) và quản lý cấp phát thẻ nhân viên vật lý (RFID/NFC).

## Bản đồ
| Nhóm | Trang |
|---|---|
| Nguồn | [Quyết định kiến trúc 2026-11-02](../sources/portal-architecture-decisions-2026-11-02.md) |
| Thực thể | [Nhân viên](../entities/employee.md) · [Phòng ban](../entities/department.md) · [Thẻ nhân viên](../entities/employee-card.md) |
| Luồng | [Luồng quản lý nhân sự](../flows/employee-management-flow.md) |
| Màn hình | [Màn hình quản lý nhân viên](../screens/employee-management-screen.md) |

## Liên quan
- [Tổng quan dự án](project-overview.md)
- [Phân hệ Xác thực và tài khoản](module-authentication.md)
- [Phân hệ Điểm danh cuộc họp](module-meeting.md)
