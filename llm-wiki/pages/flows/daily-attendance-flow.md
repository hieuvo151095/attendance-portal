---
title: Luồng chấm công vào ra cơ quan
type: flow
sources:
  - pages/sources/initial-requirements.md
spec_ids: [CC-01, CC-02, TB-01, TB-02]
updated: 2026-11-02
---

# Luồng chấm công vào ra cơ quan

## Mục tiêu
Quản lý chu trình vào và ra cơ quan, doanh nghiệp hoặc bệnh viện của nhân viên trong ngày làm việc, làm cơ sở tổng hợp ngày công và theo dõi kỷ luật lao động.

## Các bước
| # | Vai trò | App / màn | Hành động | Kết quả | Mã |
|---|---|---|---|---|---|
| 1 | Nhân viên | Cổng chính / Cửa văn phòng | Quẹt thẻ nhân viên hoặc nhận diện Face ID / Vân tay tại thiết bị Hikvision | Thiết bị xác nhận thông tin nhân sự | CC-01, TB-01, TB-02 |
| 2 | Hệ thống | Cổng dịch vụ nền | Tiếp nhận sự kiện, xác định đây là lần Check-in đầu tiên trong ngày | Ghi nhận giờ đến cơ quan, gắn ca làm việc tương ứng | CC-01 |
| 3 | Nhân viên | Cổng chính / Cửa văn phòng | Quẹt thẻ hoặc nhận diện Face ID khi ra về hết ca làm việc | Thiết bị xác nhận giờ rời cơ quan | CC-02, TB-01, TB-02 |
| 4 | Hệ thống | Cổng dịch vụ nền | Đối chiếu mốc Check-in và Check-out để tính tổng giờ làm việc thực tế | Cập nhật báo cáo chấm công ngày, ghi nhận về sớm/đủ giờ/tăng ca | CC-02 |

## Quy tắc chặn / validation
- Nhân viên vào/ra nhiều lần trong ngày: Mốc Check-in sớm nhất được tính là giờ vào ca; mốc Check-out trễ nhất được tính là giờ tan ca (hoặc ghi nhận từng lượt vào ra giữa giờ tùy cấu hình đơn vị).
- Thiết bị ngoại tuyến (offline): Khi mất kết nối internet/mạng nội bộ, thiết bị Hikvision lưu trữ bản ghi vào bộ nhớ đệm và tự động đồng bộ khi khôi phục mạng.

## Khác biệt spec ↔ code
| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|
| CC-01 | Ghi nhận Check-in đầu ngày gắn ca làm việc | Chưa triển khai | MISSING | - |
| CC-02 | Ghi nhận Check-out cuối ngày và tính giờ công | Chưa triển khai | MISSING | - |
| TB-01 | Thu nhận tín hiệu Face ID/Vân tay tại cổng cơ quan | Chưa triển khai | MISSING | - |
| TB-02 | Thu nhận tín hiệu quẹt thẻ vật lý tại cổng cơ quan | Chưa triển khai | MISSING | - |

## Liên quan
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Bảng điều khiển điểm danh](../screens/attendance-dashboard.md)
- [Thiết bị](../entities/device.md)
