# Log — LLM Wiki Attendance Portal

> Append-only, mới nhất ở cuối. Định dạng: `## [YYYY-MM-DD] ingest|query|lint|decide | Tiêu đề` (SCHEMA §7).
> `grep "^## \[" log.md | tail -5`

## [2026-11-02] lint | Khởi tạo wiki (skill llm-wiki, chế độ new)

- Tạo SCHEMA.md, wiki.json, index.md, log.md, OBSIDIAN.md, tools/ (lint, graph, viewer), .obsidian/, khung raw/ và pages/.
- Tiền tố: chưa có. Code: —. Tài liệu: —.

## [2026-11-02] ingest | raw/specs/initial-requirements.md

- Nạp yêu cầu khởi tạo hệ thống Attendance Portal từ Product Owner.
- Định nghĩa 10 mã spec thuộc 4 phân hệ: MTG (Điểm danh cuộc họp), CC (Chấm công vào ra), TB (Thiết bị và tích hợp), NV (Tổ chức và nhân sự).
- Tạo các trang entities (meeting, attendance-record, employee, device), flows (meeting-attendance-flow, daily-attendance-flow), screens (meeting-attendance-screen, attendance-dashboard) và 4 module overview.

## [2026-11-02] decide | Quyết định tinh giản kiến trúc & chốt danh mục 14 tính năng

- Chốt kiến trúc 4 phân hệ nghiệp vụ chính (Bảng điều khiển báo cáo, Điểm danh cuộc họp, Chấm công vào ra, Tổ chức và nhân sự) và phân hệ nền tảng Xác thực & tài khoản.
- Định nghĩa 14 mã spec qua 5 tiền tố chuẩn: AUTH, ORG, MTG, ATT, DASH.
- Ghim quy chuẩn giao diện bắt buộc: Toàn bộ frontend tuân thủ token và CSS variables từ Design System/src/css.css.
- Bỏ phân hệ Nhật ký rời và phân hệ Thiết bị riêng; tích hợp báo cáo trực tiếp vào từng phân hệ.

## [2026-11-04] decide | Triển khai và khớp mã MTG-04 Biên bản cuộc họp & báo cáo chuyên cần

- Hoàn thành đặc tả MTG-04: Tự động tổng hợp chuyên cần (% có mặt, đi muộn, về sớm, vắng mặt), xuất file Excel (.csv UTF-8 BOM) và in/xuất PDF chuẩn Nghị định 30/2020/NĐ-CP.
- Tích hợp dấu mộc số Finviet (Digital Seal) bảo đảm tính bất biến của biên bản họp.
- Cập nhật gap tables của meeting.md, meeting-attendance-flow.md và meeting-attendance-screen.md sang MATCH.

## [2026-11-04] decide | Triển khai và khớp mã ATT-01 Khung giờ ca làm việc chuẩn & dung sai đi muộn

- Hoàn thành đặc tả ATT-01: Thiết lập khung giờ ca hành chính chuẩn gồm Ca sáng (07:30 - 11:30) và Ca chiều (13:30 - 17:00), dung sai đi muộn (10 phút hoặc cấu hình động theo cơ quan).
- Bổ sung hàm đánh giá Check-in/Check-out ngày: tự động tính số phút đi muộn và phát hiện về sớm.
- Cập nhật gap tables của work-shift.md, daily-attendance-flow.md và daily-attendance-screen.md sang MATCH.

## [2026-11-04] decide | Triển khai và khớp mã DASH-01 & DASH-02 Bảng điều khiển Tổng Quan Điểm Danh & Chuyên Cần

- Hoàn thành DASH-01: Tổng hợp danh mục các cuộc họp đã kết thúc trong kỳ, tỷ lệ chuyên cần, liên kết tải nhanh biên bản họp (MeetingReportArchive.tsx).
- Hoàn thành DASH-02: Xây dựng hoàn tất Bảng điều khiển Tổng Quan Điểm Danh & Chuyên Cần (AttendanceDashboard.tsx), hỗ trợ chọn kỳ hôm nay / 7 ngày qua / 30 ngày qua, bộ lọc theo phòng ban, các thẻ chỉ số KPI tổng hợp, biểu đồ xu hướng hiện diện trực quan SVG, ma trận so sánh Meter phòng ban, cơ cấu phương thức điểm danh thực tế (Camera Face ID, Thẻ RFID, Vân tay) và xuất file Excel/CSV UTF-8 BOM.
- Cập nhật gap tables của attendance-summary.md, attendance-dashboard.md và dashboard-reporting-flow.md sang MATCH.


