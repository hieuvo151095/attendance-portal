---
title: Thiết bị
type: entity
sources:
  - pages/sources/initial-requirements.md
spec_ids: [TB-01, TB-02]
updated: 2026-11-02
---

# Thiết bị

## Định nghĩa
Thực thể `Thiết bị` (Device) đại diện cho các thiết bị phần cứng đầu cuối thu thập dữ liệu điểm danh, bao gồm camera nhận diện khuôn mặt Hikvision, máy quét vân tay và đầu đọc thẻ thông minh.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| TB-01 | Thiết bị Hikvision truyền tải sự kiện nhận diện qua giao thức ISAPI hoặc webhook thời gian thực kèm mã nhân viên, độ chính xác nhận diện và ảnh chụp log. | Cần cơ chế buffer lưu tạm khi mất kết nối mạng |
| TB-02 | Đầu đọc thẻ vật lý truyền mã UID thẻ ngay khi nhân viên chạm thẻ vào vùng nhận diện trên thiết bị hoặc camera. | Thời gian phản hồi xác thực dưới 0.5 giây |

## Quan hệ
- Được lắp đặt tại vị trí cụ thể (Cổng vào cơ quan, cửa phòng họp, cửa xưởng sản xuất).
- Ghi nhận và gửi về các [Bản ghi điểm danh](attendance-record.md).
- Kết nối tới phòng họp của [Cuộc họp](meeting.md).

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| TB-01 | Tích hợp cổng nhận dữ liệu sự kiện từ Camera / Terminal Hikvision | Chưa triển khai | MISSING | - |
| TB-02 | Tiếp nhận và giải mã thẻ nhân viên vật lý chạm vào thiết bị | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Thiết bị và tích hợp](../overview/module-device-integration.md)
- [Bản ghi điểm danh](attendance-record.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
