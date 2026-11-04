---
title: Màn hình đăng nhập
type: screen
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [AUTH-01, AUTH-02]
apps: [web]
route_ids: [/login]
status: partial
updated: 2026-11-04
---

# Màn hình đăng nhập

## Mục đích
Màn hình xác thực danh tính dành cho quản trị viên cơ quan khách hàng (UBND phường, Doanh nghiệp/Nhà máy, Bệnh viện) truy cập vào Attendance Portal bằng tài khoản Finviet cấp phát. Giao diện áp dụng bố cục form đăng nhập và màu sắc từ Design System.

## App / route / file code
| App | Route | File |
|---|---|---|
| web | `/login` | repo:src/pages/auth/Login.tsx:1 |

## Yêu cầu spec
| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| AUTH-01 | Form đăng nhập gồm ô nhập Username (hoặc Mã đơn vị) và Mật khẩu; nút "Đăng nhập" theo biến màu `--bl-bg`/`--focus` của Design System | BUILT |
| AUTH-02 | Modal yêu cầu đổi mật khẩu lần đầu khi phát hiện tài khoản dùng mật khẩu mặc định của Finviet | MISSING |

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| AUTH-01 | P0 | Giao diện đăng nhập tài khoản đơn vị và quản lý token | Đã hoàn thành màn hình đăng nhập chuẩn Design System | MATCH | repo:src/pages/auth/Login.tsx:1 |
| AUTH-02 | P0 | Modal bắt buộc đổi mật khẩu lần đầu | Chưa triển khai | MISSING | - |

## Liên quan
- [Tài khoản đơn vị](../entities/tenant-account.md)
- [Luồng đăng nhập và quản lý phiên](../flows/authentication-flow.md)
- [Bảng điều khiển báo cáo](attendance-dashboard.md)
