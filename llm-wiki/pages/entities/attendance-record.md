---
title: Bản ghi điểm danh
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [MTG-02, MTG-03, ATT-02]
updated: 2026-11-02
---

# Bản ghi điểm danh

## Định nghĩa
Thực thể `Bản ghi điểm danh` (Attendance Record) lưu trữ bất biến từng sự kiện nhận diện khuôn mặt Face ID hoặc quẹt thẻ vật lý của nhân sự, phục vụ điểm danh cuộc họp hoặc chấm công vào ra cơ quan.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| MTG-02 | Bản ghi điểm danh cuộc họp lưu kèm mã cuộc họp, thời điểm quét, phương thức (Face ID / Thẻ), ảnh chụp đối soát và trạng thái đúng giờ/muộn so với giờ họp. | Hiển thị tức thì trên màn hình Live roll-call |
| MTG-03 | Bản ghi rời cuộc họp lưu thời điểm check-out, làm cơ sở tính thời lượng tham dự thực tế. | Chống trùng lặp nếu quét liên tiếp trong 60 giây |
| ATT-02 | Bản ghi chấm công cơ quan lưu thời điểm quét tại cổng, phương thức và tự động phân loại là Check-in đầu ngày hoặc Check-out tan ca. | Đối chiếu với khung ca làm việc chuẩn |

## Quan hệ
- Thuộc về một [Nhân viên](employee.md).
- Có thể gắn với một [Cuộc họp](meeting.md) nếu sự kiện diễn ra tại phòng họp.
- Được đối soát với [Ca làm việc](work-shift.md) trong chấm công hàng ngày.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| MTG-02 | P0 | Xử lý sự kiện điểm danh vào cuộc họp qua Face ID / Thẻ | Chưa triển khai | MISSING | - |
| MTG-03 | P0 | Xử lý sự kiện điểm danh ra khỏi cuộc họp | Chưa triển khai | MISSING | - |
| ATT-02 | P1 | Tiếp nhận sự kiện Check-in/Check-out hàng ngày từ cổng cơ quan | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Điểm danh cuộc họp](../overview/module-meeting.md)
- [Phân hệ Chấm công vào ra](../overview/module-attendance.md)
- [Cuộc họp](meeting.md)
