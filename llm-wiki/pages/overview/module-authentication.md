---
title: Xác thực và tài khoản
type: overview
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
updated: 2026-11-02
---

# Xác thực và tài khoản

## Tóm tắt
Phân hệ **Xác thực và tài khoản** (mã spec `AUTH-NN`) là tính năng số 1 trong lộ trình phát triển. Phân hệ quản lý việc đăng nhập của các cơ quan khách hàng (UBND phường, Doanh nghiệp/Nhà máy, Bệnh viện) bằng tài khoản do Finviet cấp phát, bảo đảm cô lập dữ liệu đa khách hàng (multi-tenancy) và hỗ trợ đổi mật khẩu.

## Bản đồ
| Nhóm | Trang |
|---|---|
| Nguồn | [Quyết định kiến trúc 2026-11-02](../sources/portal-architecture-decisions-2026-11-02.md) |
| Thực thể | [Tài khoản đơn vị](../entities/tenant-account.md) |
| Luồng | [Luồng đăng nhập và quản lý phiên](../flows/authentication-flow.md) |
| Màn hình | [Màn hình đăng nhập](../screens/login-screen.md) |

## Liên quan
- [Tổng quan dự án](project-overview.md)
- [Phân hệ Tổ chức và nhân sự](module-organization.md)
