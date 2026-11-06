---
title: Luồng chấm công vào ra cơ quan
type: flow
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ATT-01, ATT-02, ATT-03]
updated: 2026-11-04
---

# Luồng chấm công vào ra cơ quan

## Mục tiêu
Quản lý chu trình vào cơ quan đầu ngày và tan ca ra về cuối ngày của nhân sự; áp dụng khung giờ hành chính chuẩn tinh gọn để tự động xác định trạng thái đúng giờ, đi muộn, về sớm hoặc vắng mặt.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Quản trị đơn vị | [Màn hình chấm công ngày](../screens/daily-attendance-screen.md) | Cấu hình hoặc giữ nguyên Khung ca hành chính chuẩn (Sáng 07:30 - 11:30, Chiều 13:30 - 17:00, dung sai 10 phút) | Thiết lập mốc giờ chuẩn làm căn cứ chấm công | ATT-01 |
| 2 | Nhân viên | Cổng cơ quan | Quẹt thẻ hoặc nhận diện khuôn mặt Face ID khi đến cơ quan | Thiết bị ghi nhận và gửi sự kiện về hệ thống | ATT-02 |
| 3 | Hệ thống | Cổng dịch vụ nền | Tiếp nhận sự kiện Check-in đầu tiên trong ngày, đối chiếu với giờ bắt đầu ca | Tự động phân loại: Đúng giờ (nếu trước 07:40) hoặc Đi muộn (kèm số phút) | ATT-02, ATT-03 |
| 4 | Nhân viên | Cổng cơ quan | Quẹt thẻ hoặc nhận diện khuôn mặt khi tan làm ra về | Ghi nhận thời điểm Check-out cuối ngày | ATT-02 |
| 5 | Quản trị nhân sự | [Màn hình chấm công ngày](../screens/daily-attendance-screen.md) | Mở bảng theo dõi chấm công ngày | Xem danh sách cán bộ nhân viên đã đến, ai chưa đến, ai đi muộn | ATT-03 |

## Quy tắc chặn / validation
- Nhân viên vào/ra nhiều lần trong ngày: Mốc quét sớm nhất được tính là Check-in đầu ngày; mốc quét muộn nhất được tính là Check-out tan ca.
- Nhân viên không có bất kỳ lượt quét nào trong ngày làm việc sẽ được hệ thống gắn nhãn "Chưa đến / Vắng mặt".

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ATT-01 | P1 | Cấu hình khung giờ ca hành chính chuẩn và dung sai đi muộn | Đã hoàn thành cấu hình ca sáng, ca chiều, dung sai vào trễ/ra sớm và hàm tính số phút muộn | MATCH | repo:src/types/setting.ts:1, repo:src/services/setting.ts:1, repo:src/pages/setting/AttendanceSettingsModal.tsx:1 |
| ATT-02 | P1 | Tiếp nhận sự kiện Check-in/Check-out hàng ngày từ cổng cơ quan | Đã hoàn thành tiếp nhận sự kiện quét cổng, phân loại Check-in/Check-out và lưu vết chi tiết | MATCH | repo:src/services/attendance.ts:1, repo:src/pages/attendance/QuickScanModal.tsx:1 |
| ATT-03 | P1 | Bảng theo dõi Chấm công Ngày và phân loại Đúng giờ / Muộn / Vắng | Đã hoàn thành bảng theo dõi chấm công ngày, lọc phòng ban, trạng thái, thẻ chỉ số và xuất file Excel | MATCH | repo:src/pages/attendance/DailyAttendance.tsx:1, repo:src/services/attendance.ts:1 |

## Liên quan
- [Ca làm việc](../entities/work-shift.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Màn hình chấm công ngày](../screens/daily-attendance-screen.md)
