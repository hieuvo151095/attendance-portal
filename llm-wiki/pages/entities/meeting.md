---
title: Cuộc họp
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [MTG-01, MTG-02, MTG-03, MTG-04]
updated: 2026-11-04
---

# Cuộc họp

## Định nghĩa
Thực thể `Cuộc họp` (Meeting) đại diện cho một sự kiện hội nghị, họp giao ban hoặc tọa đàm do cơ quan tổ chức tại một phòng họp chỉ định.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| MTG-01 | Cuộc họp bắt buộc có tiêu đề, tên phòng họp, thời điểm bắt đầu - kết thúc dự kiến và danh sách đại biểu được triệu tập (đại biểu bắt buộc, đại biểu tùy chọn). | Hỗ trợ chọn nhanh đại biểu theo phòng ban |
| MTG-02 | Khi đại biểu thực hiện Check-in tại phòng họp qua Face ID hoặc quẹt thẻ, hệ thống đối soát tức thì với danh sách triệu tập, ghi nhận thời điểm và hiển thị ảnh đối soát. | Cập nhật ngay trên màn hình Live roll-call |
| MTG-03 | Khi đại biểu thực hiện Check-out hoặc khi người chủ trì bấm kết thúc cuộc họp, hệ thống chốt danh sách và tính thời lượng tham dự thực tế. | Đánh dấu các trường hợp về sớm trước khi tan họp |
| MTG-04 | Biên bản và báo cáo chuyên cần tự động tổng hợp tỷ lệ tham dự (% có mặt, số người đi muộn, số người vắng mặt); hỗ trợ xuất file PDF và Excel có chữ ký số hoặc dấu mộc lưu hồ sơ. | Báo cáo chốt dữ liệu bất biến sau khi kết thúc họp |

## Quan hệ
- Thuộc về [Tài khoản đơn vị](tenant-account.md).
- Triệu tập danh sách các [Nhân viên](employee.md).
- Sinh ra danh sách các [Bản ghi điểm danh](attendance-record.md).
- Cung cấp dữ liệu đã kết thúc cho [Báo cáo chuyên cần](attendance-summary.md).

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| MTG-01 | P0 | Thiết lập lịch họp, phòng họp, triệu tập danh sách đại biểu | Đã hoàn thành lên lịch họp, phòng họp, thời gian và triệu tập đại biểu theo phòng ban | MATCH | repo:src/services/meeting.ts:1, repo:src/pages/meeting/MeetingModal.tsx:1 |
| MTG-02 | P0 | Điểm danh trực tiếp tại phòng họp qua Face ID / Thẻ vật lý | Đã hoàn thành màn hình Live roll-call đối soát ảnh Face ID/thẻ và tính dung sai trễ/về sớm | MATCH | repo:src/services/meeting.ts:446, repo:src/pages/meeting/MeetingLiveScreen.tsx:1 |
| MTG-03 | P0 | Ghi nhận Check-out rời phòng họp và tính toán thời gian tham dự | Đã hoàn thành ghi nhận Check-out, tính thời lượng (durationMinutes), phát hiện về sớm và chốt cuộc họp (closeMeeting) | MATCH | repo:src/services/meeting.ts:580, repo:src/pages/meeting/MeetingLiveScreen.tsx:1 |
| MTG-04 | P0 | Báo cáo chuyên cần và xuất biên bản cuộc họp PDF/Excel | Đã hoàn thành tổng hợp chuyên cần, niêm phong dấu mộc số Finviet SHA-256, xuất Excel (.csv UTF-8 BOM) và in PDF chuẩn NĐ 30/2020 | MATCH | repo:src/services/report.ts:1, repo:src/pages/meeting/MeetingReportModal.tsx:1 |

## Liên quan
- [Phân hệ Điểm danh cuộc họp](../overview/module-meeting.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
