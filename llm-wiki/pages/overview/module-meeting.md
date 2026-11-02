---
title: Điểm danh cuộc họp
type: overview
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
updated: 2026-11-02
---

# Điểm danh cuộc họp

## Tóm tắt
Phân hệ **Điểm danh cuộc họp** (mã spec `MTG-NN`) là trọng tâm ưu tiên cao nhất của hệ thống. Phân hệ quản lý tạo lịch họp, triệu tập danh sách đại biểu, màn hình lớn giám sát điểm danh trực tiếp tại phòng họp (Live roll-call hiển thị ngay ảnh Face ID và quẹt thẻ) và xuất biên bản chuyên cần sau họp.

## Bản đồ
| Nhóm | Trang |
|---|---|
| Nguồn | [Quyết định kiến trúc 2026-11-02](../sources/portal-architecture-decisions-2026-11-02.md) |
| Thực thể | [Cuộc họp](../entities/meeting.md) · [Bản ghi điểm danh](../entities/attendance-record.md) |
| Luồng | [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md) |
| Màn hình | [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md) |

## Liên quan
- [Tổng quan dự án](project-overview.md)
- [Phân hệ Tổ chức và nhân sự](module-organization.md)
- [Phân hệ Bảng điều khiển báo cáo](module-dashboard.md)
