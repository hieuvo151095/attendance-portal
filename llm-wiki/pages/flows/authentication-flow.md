---
title: Luồng đăng nhập và quản lý phiên
type: flow
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [AUTH-01, AUTH-02]
updated: 2026-11-02
---

# Luồng đăng nhập và quản lý phiên

## Mục tiêu
Cung cấp cổng xác thực an toàn cho người quản trị cơ quan khách hàng truy cập vào hệ thống Attendance Portal với tài khoản do Finviet cấp phát, bảo đảm dữ liệu được cô lập hoàn toàn giữa các khách hàng (multi-tenancy).

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Quản trị đơn vị | [Màn hình đăng nhập](../screens/login-screen.md) | Nhập tên đăng nhập (Username/Mã đơn vị) và mật khẩu do Finviet cấp | Gửi yêu cầu xác thực tới máy chủ | AUTH-01 |
| 2 | Hệ thống | Cổng xác thực | Kiểm tra thông tin đăng nhập, xác định đơn vị khách hàng | Cấp mã token phiên làm việc, thiết lập quyền hạn | AUTH-01 |
| 3 | Quản trị đơn vị | [Màn hình đăng nhập](../screens/login-screen.md) | Nếu đăng nhập lần đầu với mật khẩu mặc định, hiển thị form đổi mật khẩu | Cập nhật mật khẩu mới và chuyển tiếp vào hệ thống | AUTH-02 |
| 4 | Hệ thống | Toàn hệ thống | Điều hướng người dùng vào trang Bảng điều khiển hoặc Lịch cuộc họp | Chỉ hiển thị dữ liệu thuộc đơn vị quản trị | AUTH-01 |

## Quy tắc chặn / validation
- Khóa tài khoản tạm thời 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp.
- Mật khẩu mới bắt buộc tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số.
- Không cho phép người dùng từ đơn vị này xem hoặc sửa đổi bất kỳ tài nguyên nào thuộc đơn vị khác.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| AUTH-01 | P0 | Xác thực tài khoản đơn vị do Finviet cấp và cô lập dữ liệu | Chưa triển khai | MISSING | - |
| AUTH-02 | P0 | Quản lý phiên làm việc, bắt buộc đổi mật khẩu lần đầu | Chưa triển khai | MISSING | - |

## Liên quan
- [Tài khoản đơn vị](../entities/tenant-account.md)
- [Màn hình đăng nhập](../screens/login-screen.md)
- [Phân hệ Xác thực và tài khoản](../overview/module-authentication.md)
