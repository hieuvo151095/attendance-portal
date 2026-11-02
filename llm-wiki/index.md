# Danh mục — LLM Wiki Attendance Portal

> Mỗi dòng: `- [Tiêu đề](pages/...md) — mô tả một dòng`. Cập nhật mỗi lần ingest (SCHEMA §7).

## Điều hướng

- [SCHEMA](SCHEMA.md) — quy ước của wiki
- [Mở bằng Obsidian](OBSIDIAN.md) — xem graph
- [Nhật ký](log.md) — ingest/query/lint/decide

## Overview

- [Tổng quan Attendance Portal](pages/overview/project-overview.md) — bức tranh tổng quan hệ thống
- [Điểm danh cuộc họp](pages/overview/module-meeting.md) — phân hệ điểm danh cuộc họp
- [Chấm công vào ra](pages/overview/module-daily-attendance.md) — phân hệ chấm công vào ra cơ quan
- [Thiết bị và tích hợp](pages/overview/module-device-integration.md) — phân hệ thiết bị và tích hợp
- [Tổ chức và nhân sự](pages/overview/module-organization.md) — phân hệ tổ chức và nhân sự

## Sources

- [Yêu cầu khởi tạo Attendance Portal](pages/sources/initial-requirements.md) — yêu cầu khởi tạo từ Product Owner

## Entities

- [Cuộc họp](pages/entities/meeting.md) — cuộc họp, phòng họp và danh sách đại biểu
- [Bản ghi điểm danh](pages/entities/attendance-record.md) — sự kiện điểm danh qua camera Hikvision và thẻ vật lý
- [Nhân viên](pages/entities/employee.md) — hồ sơ nhân sự, mã thẻ và mẫu sinh trắc học
- [Thiết bị](pages/entities/device.md) — camera nhận diện khuôn mặt Hikvision và đầu đọc thẻ

## Flows

- [Luồng điểm danh cuộc họp](pages/flows/meeting-attendance-flow.md) — quy trình điểm danh check-in/out cuộc họp
- [Luồng chấm công vào ra cơ quan](pages/flows/daily-attendance-flow.md) — quy trình chấm công đầu/cuối ngày

## Screens

- [Màn hình điểm danh cuộc họp](pages/screens/meeting-attendance-screen.md) — màn hình giám sát và xuất biên bản cuộc họp
- [Bảng điều khiển điểm danh](pages/screens/attendance-dashboard.md) — bảng điều khiển tổng quan hiện diện cơ quan
