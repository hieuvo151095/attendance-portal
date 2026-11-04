---
title: Luồng quản lý nhân sự
type: flow
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ORG-01, ORG-02, ORG-03]
updated: 2026-11-02
---

# Luồng quản lý nhân sự

## Mục tiêu
Thiết lập toàn bộ dữ liệu nền tảng gồm cơ cấu phòng ban, danh sách nhân viên kèm ảnh chân dung nhận diện Face ID và mã thẻ vật lý, làm căn cứ triệu tập đại biểu hội họp và chấm công hàng ngày.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Quản trị nhân sự | [Màn hình quản lý nhân viên](../screens/employee-management-screen.md) | Tạo mới hoặc import cơ cấu phòng ban từ file Excel | Cây phòng ban được cập nhật vào hệ thống | ORG-01 |
| 2 | Quản trị nhân sự | [Màn hình quản lý nhân viên](../screens/employee-management-screen.md) | Thêm nhân viên hoặc tải file Excel danh sách nhân viên | Danh sách nhân viên được tạo, gắn vào phòng ban tương ứng | ORG-02 |
| 3 | Nhân sự & Camera | [Màn hình quản lý nhân viên](../screens/employee-management-screen.md) | Thiết lập Face ID tại camera Hikvision; ảnh chân dung và trạng thái được đồng bộ và lưu trữ về Portal | Dữ liệu Face ID và ảnh chân dung sẵn sàng phục vụ điểm danh và đối soát | ORG-02 |
| 4 | Quản trị nhân sự | [Màn hình quản lý nhân viên](../screens/employee-management-screen.md) | Nhập hoặc quẹt mã UID thẻ vật lý để gán vào nhân viên | Thẻ nhân viên được kích hoạt, liên kết với nhân sự | ORG-03 |

## Quy tắc chặn / validation
- Mã nhân viên và số CCCD không được trùng lặp trong phạm vi cùng một đơn vị.
- Mã thẻ vật lý (Card UID) tại một thời điểm chỉ được phép liên kết với duy nhất một nhân viên.
- Ảnh chân dung tải lên phải đạt chuẩn nhận diện khuôn mặt (định dạng JPG/PNG, dung lượng dưới 2MB, tỷ lệ khuôn mặt chiếm tối thiểu 50% khung hình).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ORG-01 | P0 | Thiết lập và quản lý cơ cấu phòng ban | Đã hoàn thành quản lý cơ cấu phòng ban và phân cấp trực thuộc | MATCH | repo:src/pages/organization/DepartmentManagement.tsx:1 |
| ORG-02 | P0 | Quản lý danh sách nhân viên, import Excel và tải ảnh chân dung | Đã hoàn thành quản lý nhân viên, đồng bộ ảnh chân dung Face ID từ Camera Hikvision và import Excel | MATCH | repo:src/services/employee.ts:1, repo:src/pages/organization/EmployeeManagement.tsx:1 |
| ORG-03 | P0 | Cấp phát và quản lý liên kết thẻ nhân viên vật lý | Đã hoàn thành quản lý mã thẻ UID, liên kết nhân sự, tạm khóa và cấp đổi thẻ mới khi báo mất | MATCH | repo:src/services/card.ts:1, repo:src/pages/organization/CardManagementModal.tsx:1 |

## Liên quan
- [Nhân viên](../entities/employee.md)
- [Phòng ban](../entities/department.md)
- [Thẻ nhân viên](../entities/employee-card.md)
- [Màn hình quản lý nhân viên](../screens/employee-management-screen.md)
