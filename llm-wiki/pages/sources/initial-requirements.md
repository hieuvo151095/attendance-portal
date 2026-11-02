---
title: Yêu cầu khởi tạo Attendance Portal
type: source
sources:
  - raw/specs/initial-requirements.md
updated: 2026-11-02
---

# Yêu cầu khởi tạo Attendance Portal

## Thông tin nguồn
| Trường | Giá trị |
|---|---|
| Đường dẫn | `raw/specs/initial-requirements.md` |
| Người cung cấp | Product Owner |
| Ngày | 2026-11-02 |
| Loại | PRD / Yêu cầu khởi tạo |

## Nội dung chính
- Xác định phạm vi nghiệp vụ của Attendance Portal áp dụng cho: Uỷ ban nhân dân cấp phường, cơ quan hành chính nhà nước; công ty doanh nghiệp, nhà máy; bệnh viện (loại trừ trường học).
- Xác lập 2 phân hệ chấm công:
  1. Điểm danh cuộc họp trong giờ làm việc (ưu tiên triển khai trước).
  2. Chấm công vào/ra cơ quan hàng ngày.
- Tích hợp thiết bị thu thập dữ liệu phần cứng: Camera Hikvision (Face ID, Vân tay) và Thẻ nhân viên vật lý.

## Mã yêu cầu được định nghĩa
| Mã | Ưu tiên | Quy tắc (kiểm được) | Nguồn (dòng/mục) |
|---|---|---|---|
| MTG-01 | P0 | Quản lý thiết lập thông tin cuộc họp (chủ đề, phòng họp, thời gian bắt đầu, kết thúc, danh sách đại biểu dự kiến) | §2 |
| MTG-02 | P0 | Ghi nhận Check-in vào cuộc họp qua Face ID, Vân tay hoặc Thẻ vật lý, lưu vết mốc thời gian và độ tin cậy | §2, §3 |
| MTG-03 | P0 | Ghi nhận Check-out rời phòng họp khi tan họp hoặc ra ngoài giữa giờ | §2 |
| MTG-04 | P0 | Tổng hợp báo cáo hiện diện cuộc họp thời gian thực (đúng giờ, muộn, vắng mặt không phép/có phép) | §2 |
| CC-01 | P1 | Ghi nhận Check-in vào cơ quan đầu ngày qua thiết bị phần cứng gắn với ca làm việc | §2, §3 |
| CC-02 | P1 | Ghi nhận Check-out rời cơ quan tan ca làm việc và đối soát tổng thời gian hiện diện | §2, §3 |
| TB-01 | P1 | Tiếp nhận và xử lý tín hiệu điểm danh từ Camera Hikvision (nhận diện khuôn mặt Face ID và Vân tay) | §3 |
| TB-02 | P1 | Tiếp nhận và xác thực mã định danh thẻ nhân viên vật lý (RFID/NFC) quẹt tại thiết bị | §3 |
| NV-01 | P1 | Quản lý hồ sơ nhân viên cùng thông tin ánh xạ nhận diện (mã thẻ, khuôn mặt, mẫu vân tay) | §1, §3 |
| NV-02 | P1 | Quản lý cơ cấu phòng ban và loại hình đơn vị (Cơ quan hành chính, Doanh nghiệp/Nhà máy, Bệnh viện) | §1 |

## Điểm đáng chú ý / mâu thuẫn
- Không mâu thuẫn. Phân hệ Điểm danh cuộc họp (`MTG`) là trọng tâm ưu tiên số 1 cần thi công và hoàn thiện trước phân hệ Chấm công vào ra hàng ngày (`CC`).

## Trang chịu ảnh hưởng
- [Cuộc họp](../entities/meeting.md)
- [Bản ghi điểm danh](../entities/attendance-record.md)
- [Nhân viên](../entities/employee.md)
- [Thiết bị](../entities/device.md)
- [Luồng điểm danh cuộc họp](../flows/meeting-attendance-flow.md)
- [Luồng chấm công hàng ngày](../flows/daily-attendance-flow.md)
- [Màn hình điểm danh cuộc họp](../screens/meeting-attendance-screen.md)
- [Bảng điều khiển điểm danh](../screens/attendance-dashboard.md)
