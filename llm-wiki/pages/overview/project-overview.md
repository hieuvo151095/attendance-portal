---
title: Tổng quan Attendance Portal
type: overview
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
updated: 2026-11-02
---

# Tổng quan Attendance Portal

## Tóm tắt
Hệ thống **Attendance Portal** (Cổng Quản trị Điểm danh & Chấm công) do Finviet phát triển là giải pháp quản lý hiện diện trực quan dành riêng cho các khách hàng là Cơ quan nhà nước / UBND xã phường, Doanh nghiệp / Nhà máy sản xuất, và Bệnh viện. Toàn bộ giao diện hệ thống tuân thủ nghiêm ngặt theo **Design System** tokenized tại `Design System/src/css.css`.

## Bản đồ

| Tiền tố | Phân hệ | Mô tả |
|---|---|---|
| `AUTH` | [Xác thực và tài khoản](module-authentication.md) | Đăng nhập tài khoản Finviet cấp, cô lập dữ liệu đơn vị, đổi mật khẩu |
| `ORG` | [Tổ chức và nhân sự](module-organization.md) | Cơ cấu phòng ban, danh sách nhân viên (Excel/Face ID) và quản lý thẻ vật lý |
| `MTG` | [Điểm danh cuộc họp](module-meeting.md) | Tạo cuộc họp, màn hình Live roll-call phòng họp và xuất biên bản chuyên cần |
| `ATT` | [Chấm công vào ra](module-attendance.md) | Khung giờ hành chính chuẩn, theo dõi giờ đến/về và thống kê đi muộn |
| `DASH` | [Bảng điều khiển báo cáo](module-dashboard.md) | Báo cáo sau họp và xu hướng chuyên cần toàn cơ quan theo ngày/tuần/tháng |

## Liên quan

- [Danh mục wiki](../../index.md)
- [SCHEMA](../../SCHEMA.md)
- [Quyết định kiến trúc 2026-11-02](../sources/portal-architecture-decisions-2026-11-02.md)
- [Quy chuẩn thiết kế phản hồi](user-feedback-guidelines.md)
