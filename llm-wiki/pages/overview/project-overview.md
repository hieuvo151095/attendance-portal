---
title: Tổng quan Attendance Portal
type: overview
sources:
  - pages/sources/initial-requirements.md
updated: 2026-11-02
---

# Tổng quan Attendance Portal

## Tóm tắt
Hệ thống **Attendance Portal** (Cổng Quản trị Điểm danh & Chấm công) do Finviet phát triển là nền tảng quản trị sự hiện diện tự động hóa dành cho các cơ quan nhà nước / UBND xã phường, công ty xí nghiệp / nhà máy sản xuất, và bệnh viện. Hệ thống tích hợp camera Hikvision (Face ID, vân tay) và quẹt thẻ nhân viên vật lý để tự động ghi nhận điểm danh cuộc họp (trọng tâm P0) và chấm công vào ra cơ quan.

## Bản đồ

| Tiền tố | Phân hệ | Mô tả |
|---|---|---|
| `MTG` | [Điểm danh cuộc họp](module-meeting.md) | Quản lý hội họp, check-in/out phòng họp, chuyên cần thời gian thực |
| `CC` | [Chấm công vào ra](module-daily-attendance.md) | Ghi nhận giờ đến và giờ về trong ngày, tính tổng giờ làm việc |
| `TB` | [Thiết bị và tích hợp](module-device-integration.md) | Kết nối camera Hikvision (Face ID, vân tay) và đầu đọc thẻ vật lý |
| `NV` | [Tổ chức và nhân sự](module-organization.md) | Cơ cấu phòng ban, hồ sơ nhân sự và định danh thiết bị |

## Liên quan

- [Danh mục wiki](../../index.md)
- [SCHEMA](../../SCHEMA.md)
- [Nguồn yêu cầu khởi tạo](../sources/initial-requirements.md)
