---
title: Nhân viên
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ORG-02]
updated: 2026-11-02
---

# Nhân viên

## Định nghĩa
Thực thể `Nhân viên` (Employee) đại diện cho một cán bộ, công chức, công nhân viên, bác sĩ hoặc nhân sự thuộc biên chế của cơ quan khách hàng. Nhân viên lưu giữ thông tin cá nhân, chức vụ, liên kết phòng ban và dữ liệu nhận diện khuôn mặt (Face ID).

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| ORG-02 | Mỗi nhân viên có mã nhân viên duy nhất (Employee ID), họ tên, số CCCD/hộ chiếu, chức danh/vị trí công tác, phòng ban trực thuộc, email, số điện thoại và ảnh chân dung nhận diện khuôn mặt (Face ID). Hỗ trợ import danh sách từ Excel và tải ảnh chân dung hàng loạt. | Tự động đồng bộ sang hệ sinh thái nhận diện Face ID |

## Quan hệ
- Thuộc về một [Phòng ban](department.md).
- Được cấp phát một hoặc nhiều [Thẻ nhân viên](employee-card.md).
- Có thể được triệu tập tham dự các [Cuộc họp](meeting.md).
- Sinh ra các [Bản ghi điểm danh](attendance-record.md).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ORG-02 | P0 | Quản lý hồ sơ nhân sự, import Excel và nạp ảnh Face ID | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Tổ chức và nhân sự](../overview/module-organization.md)
- [Thẻ nhân viên](employee-card.md)
- [Màn hình quản lý nhân viên](../screens/employee-management-screen.md)
