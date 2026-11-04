---
title: Tài khoản đơn vị
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [AUTH-01, AUTH-02]
updated: 2026-11-02
---

# Tài khoản đơn vị

## Định nghĩa
Thực thể `Tài khoản đơn vị` (Tenant Account) đại diện cho tài khoản quản trị của cơ quan khách hàng (UBND phường, Doanh nghiệp/Nhà máy, Bệnh viện) được Finviet cấp phát trực tiếp. Tài khoản xác thực danh tính đơn vị và thực thi phân quyền cô lập dữ liệu.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| AUTH-01 | Tài khoản đơn vị gồm tên đăng nhập (username/mã đơn vị), mật khẩu mã hóa, tên cơ quan và loại hình đơn vị. Đăng nhập thành công cấp mã token phiên làm việc, giới hạn dữ liệu xem và chỉnh sửa duy nhất trong phạm vi đơn vị đó. | Bảo đảm nguyên tắc đa khách hàng (multi-tenancy) |
| AUTH-02 | Khi đăng nhập lần đầu với mật khẩu mặc định của Finviet, hệ thống yêu cầu đổi mật khẩu mới. Hỗ trợ cập nhật thông tin người đại diện và hotline hỗ trợ của đơn vị. | Tự động hết hạn phiên sau thời gian không hoạt động |

## Quan hệ
- Sở hữu toàn bộ cây [Phòng ban](department.md) và danh sách [Nhân viên](employee.md).
- Quản lý các [Cuộc họp](meeting.md) và cấu hình [Ca làm việc](work-shift.md).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| AUTH-01 | P0 | Đăng nhập tài khoản đơn vị với username/password do Finviet cấp, cô lập dữ liệu | Đã hoàn thành đăng nhập đa đơn vị, token phiên và cô lập dữ liệu | MATCH | repo:src/services/auth.ts:1 |
| AUTH-02 | P0 | Quản lý phiên làm việc, đổi mật khẩu và hồ sơ đơn vị | Đã hoàn thành modal đổi mật khẩu lần đầu và quản lý hồ sơ | MATCH | repo:src/services/auth.ts:275 |

## Liên quan
- [Phân hệ Xác thực và tài khoản](../overview/module-authentication.md)
- [Luồng đăng nhập và quản lý phiên](../flows/authentication-flow.md)
- [Màn hình đăng nhập](../screens/login-screen.md)
