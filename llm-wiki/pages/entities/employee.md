---
title: Nhân viên
type: entity
sources:
  - pages/sources/initial-requirements.md
spec_ids: [NV-01, NV-02]
updated: 2026-11-02
---

# Nhân viên

## Định nghĩa
Thực thể `Nhân viên` (Employee) đại diện cho cán bộ, công chức, công nhân viên, bác sĩ, y tá hoặc người lao động thuộc tổ chức, có thông tin định danh sinh trắc học và thẻ vật lý trong hệ thống.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| NV-01 | Mỗi nhân viên có mã định danh duy nhất (Employee ID), họ tên, chức danh, phòng ban và các dữ liệu định danh phần cứng (mã thẻ vật lý, Face token Hikvision, mẫu vân tay). | Dữ liệu sinh trắc học được mã hóa an toàn |
| NV-02 | Cơ cấu tổ chức linh hoạt cho 3 mô hình hoạt động: Cơ quan nhà nước/Uỷ ban phường (Khối/Phòng/Ban), Doanh nghiệp/Nhà máy (Phân xưởng/Tổ đội/Văn phòng), Bệnh viện (Khoa/Phòng khám/Kíp trực). | Hỗ trợ phân quyền đại biểu theo đơn vị |

## Quan hệ
- Thuộc về phòng ban, đơn vị trong cơ cấu tổ chức.
- Là chủ thể thực hiện tạo ra [Bản ghi điểm danh](attendance-record.md).
- Có thể được triệu tập tham dự một hoặc nhiều [Cuộc họp](meeting.md).

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| NV-01 | Quản lý hồ sơ nhân viên, mã thẻ và dữ liệu nhận diện thiết bị | Chưa triển khai | MISSING | - |
| NV-02 | Thiết lập cơ cấu tổ chức đa mô hình (Uỷ ban, Doanh nghiệp/Nhà máy, Bệnh viện) | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Tổ chức và nhân sự](../overview/module-organization.md)
- [Bản ghi điểm danh](attendance-record.md)
- [Cuộc họp](meeting.md)
