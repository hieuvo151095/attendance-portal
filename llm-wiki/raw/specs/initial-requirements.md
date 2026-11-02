# Yêu cầu Khởi tạo Hệ thống Điểm danh — Attendance Portal

- **Thời gian**: 2026-11-02
- **Đơn vị phát triển**: Finviet
- **Nguồn cung cấp**: Product Owner

---

## 1. Mục tiêu và Phạm vi ứng dụng
Hệ thống **Attendance Portal** là giải pháp phần mềm quản trị điểm danh và chấm công chuyên biệt, được thiết kế để áp dụng cho mọi loại hình tổ chức và doanh nghiệp (ngoại trừ trường học):
- **Cơ quan nhà nước, chính quyền địa phương**: Uỷ ban nhân dân cấp phường, xã, cơ quan hành chính sự nghiệp.
- **Doanh nghiệp & Sản xuất**: Công ty văn phòng, tập đoàn, xí nghiệp, nhà máy khu công nghiệp.
- **Y tế**: Bệnh viện, trạm y tế, viện nghiên cứu y khoa.

## 2. Hai Hình thức Điểm danh & Chấm công
Hệ thống quản lý 2 hình thức ghi nhận vào ra:
1. **Chấm công vào ra cơ quan (Daily / Office In-Out)**:
   - Ghi nhận thời điểm nhân viên đến cơ quan lần đầu trong ngày (Check-in) và thời điểm rời cơ quan khi hết giờ làm việc (Check-out).
2. **Điểm danh cuộc họp trong giờ làm việc (Meeting Attendance - Ưu tiên thực hiện trước)**:
   - Điểm danh ghi nhận thành viên tham gia các cuộc họp, hội nghị diễn ra trong giờ làm việc.
   - Ghi nhận Check-in khi vào phòng họp và Check-out khi kết thúc / rời khỏi cuộc họp.

## 3. Phương thức Thu thập Dữ liệu & Thiết bị Tích hợp
Hệ thống kết nối và thu thập dữ liệu xác thực từ các thiết bị phần cứng:
- **Camera nhận diện & Thiết bị đầu cuối HIKVision**:
  - Nhận diện khuôn mặt (Face ID).
  - Quét vân tay (Fingerprint).
- **Thẻ nhân viên vật lý (Physical Employee Card)**:
  - Thẻ nhân viên vật lý (RFID/NFC/thẻ từ) quẹt hoặc chạm trực tiếp vào đầu đọc/camera chuyên dụng.
