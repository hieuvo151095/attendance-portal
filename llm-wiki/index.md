# Danh mục — LLM Wiki Attendance Portal

> Mỗi dòng: `- [Tiêu đề](pages/...md) — mô tả một dòng`. Cập nhật mỗi lần ingest (SCHEMA §7).

## Điều hướng

- [SCHEMA](SCHEMA.md) — quy ước của wiki
- [Mở bằng Obsidian](OBSIDIAN.md) — xem graph
- [Nhật ký](log.md) — ingest/query/lint/decide

## Overview

- [Tổng quan Attendance Portal](pages/overview/project-overview.md) — bức tranh tổng quan hệ thống
- [Quy chuẩn thiết kế phản hồi](pages/overview/user-feedback-guidelines.md) — các quy chuẩn nghiệp vụ bảo toàn phản hồi người dùng
- [Xác thực và tài khoản](pages/overview/module-authentication.md) — phân hệ xác thực và tài khoản đơn vị
- [Tổ chức và nhân sự](pages/overview/module-organization.md) — phân hệ cơ cấu phòng ban và hồ sơ nhân sự
- [Điểm danh cuộc họp](pages/overview/module-meeting.md) — phân hệ điểm danh cuộc họp
- [Chấm công vào ra](pages/overview/module-attendance.md) — phân hệ chấm công vào ra cơ quan
- [Bảng điều khiển báo cáo](pages/overview/module-dashboard.md) — phân hệ bảng điều khiển báo cáo

## Sources

- [Yêu cầu khởi tạo Attendance Portal](pages/sources/initial-requirements.md) — yêu cầu khởi tạo từ Product Owner
- [Quyết định Kiến trúc & Danh mục Tính năng 2026-11-02](pages/sources/portal-architecture-decisions-2026-11-02.md) — quyết định chốt kiến trúc và danh mục tính năng

## Entities

- [Tài khoản đơn vị](pages/entities/tenant-account.md) — tài khoản đơn vị do Finviet cấp phát
- [Phòng ban](pages/entities/department.md) — cây cơ cấu tổ chức và phòng ban
- [Nhân viên](pages/entities/employee.md) — hồ sơ nhân sự, mã nhân viên và ảnh Face ID
- [Thẻ nhân viên](pages/entities/employee-card.md) — thẻ nhân viên vật lý RFID/NFC
- [Cuộc họp](pages/entities/meeting.md) — cuộc họp, phòng họp và danh sách đại biểu
- [Bản ghi điểm danh](pages/entities/attendance-record.md) — sự kiện quét Face ID và quẹt thẻ vật lý
- [Ca làm việc](pages/entities/work-shift.md) — khung ca hành chính chuẩn và dung sai đi muộn
- [Báo cáo chuyên cần](pages/entities/attendance-summary.md) — báo cáo chuyên cần tổng hợp sau họp và toàn cơ quan

## Flows

- [Luồng đăng nhập và quản lý phiên](pages/flows/authentication-flow.md) — quy trình đăng nhập tài khoản đơn vị
- [Luồng quản lý nhân sự](pages/flows/employee-management-flow.md) — quy trình quản lý phòng ban, nhân viên và thẻ
- [Luồng điểm danh cuộc họp](pages/flows/meeting-attendance-flow.md) — quy trình lên lịch họp, Live roll-call và xuất biên bản
- [Luồng chấm công vào ra cơ quan](pages/flows/daily-attendance-flow.md) — quy trình chấm công vào ra hàng ngày
- [Luồng xem báo cáo tổng hợp](pages/flows/dashboard-reporting-flow.md) — quy trình xem báo cáo sau họp và chuyên cần

## Screens

- [Màn hình đăng nhập](pages/screens/login-screen.md) — giao diện đăng nhập và đổi mật khẩu lần đầu
- [Màn hình quản lý nhân viên](pages/screens/employee-management-screen.md) — giao diện quản lý phòng ban, nhân viên và thẻ
- [Màn hình điểm danh cuộc họp](pages/screens/meeting-attendance-screen.md) — giao diện tạo họp và Live roll-call phòng họp
- [Màn hình chấm công ngày](pages/screens/daily-attendance-screen.md) — giao diện chấm công ngày và cấu hình ca chuẩn
- [Bảng điều khiển báo cáo](pages/screens/attendance-dashboard.md) — giao diện báo cáo tổng hợp sau họp và chuyên cần
