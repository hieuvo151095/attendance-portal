---
title: Phòng ban
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ORG-01]
updated: 2026-11-02
---

# Phòng ban

## Định nghĩa
Thực thể `Phòng ban` (Department / Division) đại diện cho một đơn vị cấu thành cơ cấu tổ chức của cơ quan khách hàng (Khối/Phòng/Ban đối với UBND; Phòng/Phân xưởng/Tổ sản xuất đối với Nhà máy; Khoa/Phòng khám/Tổ điều dưỡng đối với Bệnh viện).

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| ORG-01 | Mỗi phòng ban có mã định danh, tên phòng ban, cấp quản lý trực thuộc và người phụ trách phòng ban. Cho phép thiết lập cây phân cấp cha - con linh hoạt. | Dùng làm tiêu chí lọc báo cáo và triệu tập đại biểu họp |

## Quan hệ
- Thuộc về một [Tài khoản đơn vị](tenant-account.md).
- Chứa danh sách các [Nhân viên](employee.md).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ORG-01 | P0 | Quản lý cây cơ cấu phòng ban / đơn vị đa mô hình | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Tổ chức và nhân sự](../overview/module-organization.md)
- [Nhân viên](employee.md)
- [Màn hình quản lý nhân viên](../screens/employee-management-screen.md)
