---
title: Bản ghi điểm danh
type: entity
sources:
  - pages/sources/initial-requirements.md
spec_ids: [MTG-02, MTG-03, CC-01, CC-02, TB-01, TB-02]
updated: 2026-11-02
---

# Bản ghi điểm danh

## Định nghĩa
Thực thể `Bản ghi điểm danh` (Attendance Record) là bản ghi dữ liệu sự kiện bất biến lưu trữ từng lần quẹt thẻ, nhận diện khuôn mặt Face ID hoặc quét vân tay của nhân sự.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| CC-01 | Ghi nhận thời điểm Check-in vào cơ quan đầu ngày, gắn nhãn ca làm việc và trạng thái đi làm đúng giờ / muộn. | Áp dụng cho toàn cơ quan/doanh nghiệp/bệnh viện |
| CC-02 | Ghi nhận thời điểm Check-out rời cơ quan cuối ngày, tính toán tổng số giờ làm việc thực tế. | Tự động ghép cặp với Check-in gần nhất trong ca |
| TB-01 | Bản ghi điểm danh qua Hikvision phải lưu kèm phương thức xác thực (Face ID / Vân tay), mã thiết bị và chỉ số tin cậy (confidence score). | Lưu vết nhật ký xác thực thiết bị |
| TB-02 | Bản ghi điểm danh qua thẻ vật lý phải lưu kèm mã định danh thẻ (Card UID/Badge ID) và mã thiết bị tiếp nhận. | Chống trùng lặp sự kiện trong khoảng thời gian ngắn |

## Quan hệ
- Thuộc về một [Nhân viên](employee.md).
- Được ghi nhận từ một [Thiết bị](device.md).
- Có thể gắn với một [Cuộc họp](meeting.md) nếu sự kiện diễn ra tại phòng họp trong khung giờ họp.

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| CC-01 | Ghi nhận Check-in vào cơ quan đầu ngày gắn với ca làm việc | Chưa triển khai | MISSING | - |
| CC-02 | Ghi nhận Check-out rời cơ quan cuối ngày và tổng hợp giờ công | Chưa triển khai | MISSING | - |
| TB-01 | Tiếp nhận sự kiện điểm danh từ camera Hikvision (Face ID / Vân tay) | Chưa triển khai | MISSING | - |
| TB-02 | Tiếp nhận sự kiện điểm danh từ quẹt thẻ nhân viên vật lý | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Chấm công vào ra](../overview/module-daily-attendance.md)
- [Phân hệ Thiết bị và tích hợp](../overview/module-device-integration.md)
- [Cuộc họp](meeting.md)
