---
title: Màn hình quản lý nhân viên
type: screen
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ORG-01, ORG-02, ORG-03]
apps: [web]
route_ids: [/employees]
status: complete
updated: 2026-11-04
---

# Màn hình quản lý nhân viên

## Mục đích
Màn hình quản lý danh mục phòng ban, danh sách nhân sự của cơ quan, phục vụ import danh sách từ Excel, nạp ảnh chân dung Face ID và quản lý cấp phát thẻ nhân viên vật lý. Áp dụng bảng dữ liệu, tab và modal theo chuẩn Design System.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/employees` | repo:src/pages/organization/DepartmentManagement.tsx:1, repo:src/pages/organization/EmployeeManagement.tsx:1, repo:src/pages/organization/CardManagementModal.tsx:1 |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| ORG-01 | Cây chọn và bộ lọc theo Phòng ban / Phân xưởng / Khoa phòng | BUILT |
| ORG-02 | Bảng danh sách nhân viên, nút Import Excel, nút nạp ảnh chân dung Face ID và xem trước ảnh | BUILT |
| ORG-03 | Modal gán mã thẻ vật lý (RFID/NFC) cho nhân viên và thao tác thu hồi / hủy thẻ khi mất | BUILT |

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ORG-01 | P0 | Giao diện quản lý cây cơ cấu phòng ban | Đã hoàn thành cây phân cấp và giao diện quản lý phòng ban | MATCH | repo:src/pages/organization/DepartmentManagement.tsx:1 |
| ORG-02 | P0 | Bảng nhân viên, chức năng import Excel và nạp ảnh Face ID | Đã hoàn thành bảng danh sách nhân viên, modal đồng bộ Face ID từ Camera và import Excel | MATCH | repo:src/pages/organization/EmployeeManagement.tsx:1 |
| ORG-03 | P0 | Giao diện cấp phát, đổi thẻ và thu hồi thẻ vật lý | Đã hoàn thành modal quản lý thẻ RFID/NFC, gán thẻ mới, tạm khóa/mở khóa và cấp đổi thẻ khi báo mất | MATCH | repo:src/pages/organization/CardManagementModal.tsx:1, repo:src/pages/organization/EmployeeManagement.tsx:1 |

## Liên quan
- [Nhân viên](../entities/employee.md)
- [Phòng ban](../entities/department.md)
- [Thẻ nhân viên](../entities/employee-card.md)
- [Luồng quản lý nhân sự](../flows/employee-management-flow.md)
