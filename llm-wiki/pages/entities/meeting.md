---
title: Cuộc họp
type: entity
sources:
  - pages/sources/initial-requirements.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
updated: 2026-11-02
---

# Cuộc họp

## Định nghĩa
Thực thể `Cuộc họp` (Meeting) đại diện cho một sự kiện hội họp, hội nghị hoặc buổi giao ban được tổ chức tại một phòng họp cụ thể trong phạm vi cơ quan, xí nghiệp hoặc bệnh viện.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| MTG-01 | Cuộc họp bắt buộc có tiêu đề, phòng họp chỉ định, thời điểm bắt đầu - kết thúc dự kiến và danh sách thành viên được triệu tập. | Hỗ trợ thiết lập người bắt buộc và người tùy chọn |
| MTG-02 | Khi đại biểu thực hiện Check-in tại phòng họp, hệ thống tự động đối chiếu thời điểm ghi nhận với mốc bắt đầu cuộc họp để gắn nhãn đúng giờ hoặc đi muộn. | Áp dụng ngưỡng dung sai cho phép (ví dụ: trong vòng 5 phút) |
| MTG-03 | Khi đại biểu thực hiện Check-out hoặc khi cuộc họp kết thúc, hệ thống ghi nhận thời điểm rời phòng họp để tính thời lượng tham gia thực tế. | Kiểm tra về sớm nếu check-out trước khi kết thúc cuộc họp |
| MTG-04 | Báo cáo chuyên cần cuộc họp tự động tổng hợp danh sách: có mặt đúng giờ, đi muộn, vắng mặt có phép, vắng mặt không phép. | Cập nhật thời gian thực ngay trên màn hình giám sát |

## Quan hệ
- Thuộc về cơ cấu tổ chức quản lý bởi [Nhân viên](employee.md).
- Gắn với phòng họp và tiếp nhận dữ liệu từ [Thiết bị](device.md) đặt tại phòng họp.
- Sinh ra danh sách các [Bản ghi điểm danh](attendance-record.md) loại cuộc họp.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| MTG-01 | P0 | Thiết lập và quản lý danh sách cuộc họp, phòng họp, danh sách đại biểu | Chưa triển khai | MISSING | - |
| MTG-02 | P0 | Ghi nhận Check-in cuộc họp qua Face ID, vân tay hoặc thẻ nhân viên | Chưa triển khai | MISSING | - |
| MTG-03 | P0 | Ghi nhận Check-out rời phòng họp và tính toán thời lượng tham dự | Chưa triển khai | MISSING | - |
| MTG-04 | P0 | Báo cáo thống kê chuyên cần cuộc họp thời gian thực | Chưa triển khai | MISSING | - |

## Liên quan
- [Phân hệ Điểm danh cuộc họp](../overview/module-meeting.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
