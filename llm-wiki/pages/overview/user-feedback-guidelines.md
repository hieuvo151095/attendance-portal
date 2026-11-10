---
title: Quy chuẩn Thiết kế & Bảo toàn Phản hồi Người dùng
type: overview
sources:
  - docs/USER_FEEDBACK_GUIDELINES.md
updated: 2026-11-10
---

# Quy chuẩn Thiết kế & Bảo toàn Phản hồi Người dùng

## Tóm tắt
Tài liệu quy định các nguyên tắc thiết kế bắt buộc được đúc kết từ toàn bộ phản hồi của chủ quản hệ thống trong quá trình phát triển Finviet Attendance Portal. Mọi chỉnh sửa tính năng hiện tại và phát triển tính năng mới bắt buộc phải tuân thủ nghiêm ngặt các quy chuẩn này.

## Bản đồ

- Thư mục cha: [Tổng quan Attendance Portal](project-overview.md)
- Phân hệ liên quan: [Chấm công vào ra](module-attendance.md) · [Bảng điều khiển báo cáo](module-dashboard.md) · [Điểm danh cuộc họp](module-meeting.md)

## Các nguyên tắc cốt lõi

### 1. Ổn định giao diện tuyệt đối (Zero Layout Shift)
- Khi chuyển đổi giữa các tab hoặc bộ lọc (ví dụ: "Tất cả", "Đang có mặt", "Nghỉ phép có đơn", "Chưa đến / Vắng"):
  - Toàn bộ khung thẻ và màn hình phải giữ cố định, không được co dãn hay giật trượt màn hình (*"the whole screen is moving - don't, keep it still when I switch"*).
  - Khung danh sách cuộn có chiều cao cố định (`height: 380px`, `minHeight: 380px`, `maxHeight: 380px`, `overflowY: 'auto'`).
  - Sử dụng `scrollbarGutter: 'stable'` để tránh giật lề khi xuất hiện thanh cuộn.
  - Các trạng thái ít phần tử (1-2 người) hoặc rỗng (`EmptyValue`) phải giữ nguyên chiều cao chuẩn 380px.
- Các luồng nhiều bước (Multi-step flows): Giữ nguyên kích thước khung chứa khi chuyển bước.

### 2. Cổng xác nhận kép (Double Confirmation / Safety Gates)
- Không bao giờ thực thi trực tiếp hành động làm thay đổi dữ liệu hoặc trạng thái nhạy cảm mà không qua xác nhận:
  - Khóa / Mở khóa thiết bị: Phải bật pop-up xác nhận (`PopupModal`).
  - Chấm công bổ sung giờ về: Nút "Chấm công" -> Ô nhập giờ + nút "Xác nhận" -> Bấm "Xác nhận" mở pop-up xác nhận lần cuối mới lưu.
  - Nghỉ phép ngày: Chọn checkbox không gọi API ngay; chọn ca + lý do -> bấm "Xác nhận" bật pop-up xác nhận.
  - Xóa cuộc họp / Hủy nhân sự: Bắt buộc qua pop-up xác nhận rõ ràng hậu quả.

### 3. Quy chuẩn Right-Sheet (Bảng trượt bên phải)
- Áp dụng cho các tác vụ quản trị chuyên sâu (Đồng bộ Camera AI, Nhập Excel, Chi tiết chấm công).
- Quy trình 3 bước chuẩn: Chọn đối tượng -> Xem lại & Xác nhận -> Kết quả đồng bộ chi tiết.

### 4. Thông báo Toast đơn nhất (Single Toast Rule)
- Đúng 1 thông báo Toast cho mỗi thao tác, không bắn trùng lặp giữa modal và màn hình cha.

### 5. Tuân thủ Hệ thống Thiết kế (Design System)
- Bắt buộc dùng component Design System (`SelectField`, `Button`, `StatusTag`, `Tag`, `Icon`, `Meter`).
- Trạng thái bỏ chọn (untick): Dòng ghi chú (ví dụ "Đang tạm tắt") phải nằm ở dòng tiếp theo bên dưới tiêu đề, không làm dịch chuyển icon.

### 6. Phân khung trực quan & vị trí chấm trạng thái
- Ở chế độ xem "Tất cả", các nhóm phải được đóng khung riêng biệt.
- Dấu chấm màu sắc trạng thái bắt buộc đặt trước tiêu đề của khung (`[●] Có mặt (23)`).
- Nút lọc danh mục (pill tabs) phải đồng nhất về kiểu dáng trên toàn bộ các tab.

### 7. Điều hướng liên kết sâu (Deep Linking)
- Nút tác vụ nhanh tại Action Center dẫn trực tiếp đến tab con mục tiêu (ví dụ nút "Kiểm tra" dẫn thẳng đến tab "Quản trị thiết bị" trong module "Thiết Lập").

### 8. Chuẩn mực Bảng điều khiển Cuộc họp
- Bộ lọc số lượng cuộc họp: Chỉ gồm 4 tùy chọn cố định: 6 cuộc họp gần nhất (mặc định), 9 cuộc họp gần nhất, 12 cuộc họp gần nhất, 15 cuộc họp gần nhất.
- "Cuộc Họp Gần Đây": Cố định hiển thị 4 cuộc họp theo thứ tự: Sắp diễn ra -> Đang diễn ra -> Đã kết thúc.
- Thay thế "Cuộc Họp Đang Diễn Ra" bằng thẻ "Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần Khối Phòng Ban": Theo dõi tỷ lệ chấp hành triệu tập, các đơn vị cần chấn chỉnh (Địa chính, Quân sự...), danh sách đại biểu vắng/muộn.
- Không trùng lặp dữ liệu giữa các card liền kề.
- Đồng bộ nhãn "Chưa đến/ Không tham dự" ở cả thẻ chỉ số (StatCard) và tab lọc (pill tabs) trong màn hình Thống kê điểm danh cuộc họp.
- Bổ sung hiển thị dòng mô tả cuộc họp (`description`) tại Header màn hình Thống kê điểm danh để đồng bộ với danh sách quản lý.
- Phân định các nút thao tác Header: Sắp diễn ra ẩn cả 2 nút; Đang diễn ra chỉ hiển thị "Kết thúc cuộc họp"; Đã kết thúc hiển thị cả "Biên bản & Báo cáo" và "Kết thúc cuộc họp".
- Dời các nút lọc trạng thái đại biểu (Tất cả, Đã đến...) về nằm liền kề bên phải ô tìm kiếm trên thanh điều khiển.
- Loại bỏ các thành phần rườm rà không giá trị (xóa nút "Xem chi tiết" tại từng thẻ cuộc họp trong khối "Cuộc Họp Gần Đây", xóa tác vụ "Tải nhanh file Excel (.csv)" trong menu thao tác dòng lưu trữ, xóa thanh chân trang trùng lặp ở cuối modal biên bản cuộc họp, đồng hồ đếm giờ thừa, nút PDF tổng quan trong menu tài khoản).

### 9. Chuẩn mực Hiển thị Check-out & Xử lý Nghỉ phép kèm Vào ca
- Xóa bỏ hoàn toàn nhãn `(Admin bổ sung)` tại khu vực Giờ về (Check-out) của SideSheet chi tiết chấm công; chỉ hiển thị giờ về và nút Chỉnh sửa (hoặc "Chưa về" và nút Chấm công); thông tin người bổ sung chuyển xuống dòng phụ và Audit Log.
- Không thay thế dữ liệu Giờ về bằng nhãn nghỉ phép; áp dụng quy tắc 2 dòng độc lập tại cả bảng điểm danh và SideSheet:
  - Dòng 1: Giờ về thực tế (hoặc `—` / `Chưa về`).
  - Dòng 2: Nhãn nghỉ phép kèm icon `calendar-check` (Nghỉ buổi chiều / Nghỉ buổi sáng / Nghỉ cả ngày).
- Xử lý nhất quán trường hợp đã Check-in sáng nhưng xin Nghỉ cả ngày:
  - Cột Check-in: Dòng 1 giữ giờ quét vân tay/Face ID thực tế; Dòng 2 hiển thị `[icon] Nghỉ cả ngày (đã vào ca)`.
  - Cột Check-out: Dòng 1 hiển thị giờ về thực tế hoặc `—`; Dòng 2 hiển thị `[icon] Nghỉ cả ngày`.
  - SideSheet: Giờ đến hiển thị giờ quét + `[icon] Đã duyệt nghỉ cả ngày (đã vào ca)`; Giờ về hiển thị Chưa về/giờ quét + `[icon] Nghỉ cả ngày`; hiển thị cảnh báo bảo lưu dữ liệu vào ca.

### 10. Loại bỏ Khối "Đơn Chờ Duyệt" & Đổi "Nghỉ Phép Có Đơn" thành "Nghỉ Phép"
- Xóa bỏ hoàn toàn tab "Đơn chờ duyệt" và khối "Đơn nghỉ phép / công tác chờ duyệt trong ngày" tại Action Center do hệ thống hiện tại chưa có nguồn dữ liệu tích hợp quy trình tạo và duyệt đơn trực tuyến.
- Thanh bộ lọc Action Center chỉ giữ lại 4 nhóm thực tế: "Tất cả", "Quên check-out", "Chuyên cần đột biến" và "Thiết bị". Dòng mô tả rút gọn thành "Trung tâm giải quyết các vấn đề chuyên cần & cảnh báo thiết bị".
- Tại thẻ theo dõi quân số hôm nay (`TodayAttendanceRosterCard`), đổi toàn bộ các nhãn "Nghỉ phép có đơn" thành "Nghỉ phép" để ngắn gọn, thực tế và đồng bộ.

### 11. Cơ chế Tính Kỷ Luật Phòng Ban & Quy tắc Vắng Có Phép / Không Phép Trong Cuộc Họp
- **Cơ chế tính số lượt trễ/vắng tại "Đơn vị cần chấn chỉnh kỷ luật":** Lũy kế trên tập **N cuộc họp gần nhất đang chọn** tại bộ lọc Dashboard (6, 9, 12 hoặc 15 cuộc họp gần nhất), không tính đơn lẻ 1 cuộc họp và không cộng dồn cả năm để đảm bảo tính thời sự và cảnh báo kịp thời.
- **Xóa bỏ nhãn cảnh báo thừa & nút thao tác đôn đốc:**
  - Xóa nhãn `Cần lưu ý` và `Cần chấn chỉnh` tại khối "Đơn vị cần chấn chỉnh kỷ luật".
  - Xóa dòng tiêu đề phụ `Thao tác đôn đốc` và hai nút `Nhắc nhở`, `Yêu cầu giải trình` tại khối "Danh sách đại biểu vắng / muộn gần nhất".
- **Quy tắc phân định Có phép vs Không phép:**
  - **Có phép:** Đại biểu chưa tham gia cuộc họp nhưng có thông tin nghỉ phép/công tác đã được Admin xác nhận trong hồ sơ chấm công ngày (`dailyAttendance`) bao hàm khung giờ cuộc họp (`full_day`, `morning` trước 12:00, hoặc `afternoon` từ 12:00 trở đi). Hiển thị kèm lý do nghỉ phép.
  - **Không phép:** Đại biểu không tham gia cuộc họp và không có xác nhận nghỉ phép nào bao hàm khung giờ cuộc họp từ Admin (dù có thể đã check-in cơ quan sáng nay).
- **Quy trình kết thúc cuộc họp:** Modal xác nhận kết thúc phân loại chi tiết "Vắng có phép" và "Vắng không phép". Nếu có cán bộ đã xin phép trước nhưng chưa kịp nhập, Admin có thể bấm "Hủy", sang module Chấm công xác nhận nghỉ phép trong ngày của cán bộ đó, rồi quay lại đóng cuộc họp; hệ thống tự động cập nhật cán bộ đó thành "Có phép" ngay lập tức.

### 12. Chuẩn Mực Màu Sắc Biểu Đồ & Đánh Giá "Cần Lưu Ý" Tại Thẻ So Sánh Chuyên Cần Phòng Ban
- **Màu sắc biểu đồ đồng bộ với chú thích:** Thanh 1 (Tỷ lệ hiện diện / tham dự) luôn giữ màu Xanh lá (`#10B981`), Thanh 2 (Tỷ lệ đúng giờ) luôn giữ màu Xanh dương (`#0070CE`), không chuyển sang màu cam khi chưa đạt mục tiêu để tránh làm người dùng khó hiểu.
- **Đổi nhãn mục tiêu:** Trong tab "Chấm Công", đổi `"Mục tiêu chuẩn cơ quan: "` thành `"Mục tiêu tỷ lệ đúng giờ: "`.
- **Đánh giá "Cần lưu ý" (chữ màu đỏ):**
  - Tab Chấm công: Nếu tỷ lệ đúng giờ của phòng ban < mục tiêu đúng giờ -> hiển thị `"Cần lưu ý"` màu đỏ (ngược lại hiển thị `"Tốt"` màu xanh).
  - Tab Cuộc họp: Nếu một trong hai chỉ số (Tỷ lệ tham dự hoặc Tỷ lệ đúng giờ) < mục tiêu tương ứng -> hiển thị `"Cần lưu ý"` màu đỏ (ngược lại hiển thị `"Tốt"` màu xanh).

### 13. Trạng Thái Đã Xác Nhận Nghỉ Phép & Tinh Gọn Khu Vực Tóm Tắt SideSheet
- **Khối nghỉ phép ở trạng thái Đã xác nhận:** Sau khi xác nhận nghỉ phép, hiển thị thẻ thông tin đã xác nhận kèm nút "Điều chỉnh". Bấm "Điều chỉnh" mới mở lại các tùy chọn thời gian và lý do để Quản trị viên sửa đổi.
- **Xóa nhãn nghỉ phép thừa tại khu vực tóm tắt đầu tiên:** Xóa các dòng chữ "Nghỉ buổi chiều" / "Nghỉ cả ngày" / "Nghỉ buổi sáng" bên dưới mục Giờ đến (Check-in) và Giờ về (Check-out) do ô Trạng thái chấm công trên cùng đã hiển thị đầy đủ nhãn trạng thái này.
- **Xóa tác vụ "Bổ sung giờ về (Check-out bù)" trong menu 3 chấm:** Menu thao tác dòng chỉ giữ duy nhất "Chi tiết chấm công"; quy trình bổ sung hoặc điều chỉnh giờ về được thực hiện tập trung bên trong SideSheet Chi tiết chấm công.

### 14. Phương Thức Xác Thực Trong Quét Điểm Danh Nhanh
- Trường "Phương thức xác thực" trong modal Quét Điểm Danh Nhanh chỉ gồm duy nhất một lựa chọn: **"Ghi nhận thủ công từ Quản trị viên"** (`manual`). Phản ánh đúng nghiệp vụ can thiệp thủ công từ quản trị viên.

### 15. Chuẩn Hóa Danh Mục Lý Do Nghỉ Phép Đồng Bộ Giữa Mô-Đun Chấm Công & Thẻ Quân Số
- **Danh mục lý do nghỉ phép chuẩn hóa duy nhất (`STANDARD_LEAVE_REASONS`):** Danh mục lý do nghỉ phép trong hệ thống gồm đúng 5 lựa chọn: `Nghỉ việc riêng / Khẩn cấp`, `Nghỉ phép năm`, `Nghỉ ốm / Khám sức khỏe`, `Nghỉ chế độ / Thai sản`, `Đi công tác đột xuất`.
- **Đồng bộ hiển thị 1:1 tại thẻ "Chấm công hôm nay và Nghỉ phép":** Thông tin lý do nghỉ phép tại thẻ quân số hiển thị khớp 100% với danh mục chuẩn (ví dụ: `Đi công tác đột xuất`, `Nghỉ phép năm`), loại bỏ các chuỗi dài dòng ghi chú nội bộ cũ. Tự động chuẩn hóa dữ liệu cũ trong `localStorage` và mock data.

### 16. Đồng Bộ Số Liệu Thiết Bị Giữa Quản Trị Thiết Bị & Trung Tâm Cảnh Báo
- Thẻ Action Center đọc dữ liệu thiết bị trực tiếp từ `cameraDeviceService` thay vì hardcode số lượng.
- Tỷ lệ hiển thị đúng theo thực tế: `${activeCount}/${totalCount} đang hoạt động` (hiển thị chuẩn xác `3/5 đang hoạt động` khi có 3 thiết bị hoạt động và 2 thiết bị tạm khóa).
- Nút lọc `Thiết bị ({count})` và danh sách cảnh báo hiển thị đầy đủ các thiết bị đang tạm khóa kèm nút "Kiểm tra" chuyển tiếp đến tab Quản trị thiết bị. Lắng nghe sự kiện cập nhật để phản ánh trạng thái tức thì.

### 17. Trình Bày Tiêu Đề Khối Nghỉ Phép Trên Một Dòng & Nhất Quán Dữ Liệu Lịch Sử Quét Thiết Bị
- **Tiêu đề trên một dòng (Single-line):** Xóa bỏ nhãn đóng khung màu xanh (`[Nghỉ buổi chiều]`, `[Nghỉ cả ngày]`) cạnh tiêu đề "Xác nhận nghỉ phép ngày {date}" ở cả hai giai đoạn Đã xác nhận và Chỉnh sửa, bảo đảm tiêu đề nằm trọn vẹn trên đúng một dòng duy nhất (`whiteSpace: 'nowrap'`). Phạm vi nghỉ phép đã được hiển thị rõ ràng tại dòng "Thời gian nghỉ: {Buổi chiều / Buổi sáng / Cả ngày}" bên dưới.
- **Làm sạch lý do nghỉ phép:** Tự động loại bỏ các chuỗi lặp hậu tố dạng `(Buổi chiều) (Buổi chiều)...`, giữ lý do sạch đẹp đúng theo danh mục chuẩn.
- **Khắc phục lệch múi giờ (+7h):** Sử dụng `formatScanLogTime` trích xuất trực tiếp giờ `HH:mm:ss` từ timestamp ISO, giải quyết triệt để lỗi giờ vào ca `06:55` bị hiển thị nhầm thành `13:55:00` và `15:05` thành `22:05:00`.
- **Nhất quán dữ liệu quét thiết bị (`sanitizeRecordConsistency`):** Khi cán bộ đã check-in sáng và sau đó được xác nhận nghỉ buổi chiều, lịch sử quét chỉ lưu bản ghi vào ca, giờ về hiển thị `Chưa về [Chấm công]`, loại bỏ bản ghi quét tan ca giả lập trong ngày làm việc.

### 18. Theo Dõi Dữ Liệu Kỷ Luật Cuộc Họp Theo Từng Tháng & Bộ Chọn Lịch Năm
- **Chu kỳ thu thập theo tháng:** Khối "Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần" theo dõi dữ liệu chuyên cần theo chu kỳ từng tháng, mặc định hiển thị dữ liệu tháng hiện tại (`Tháng 11/2026`).
- **Ghi chú minh bạch (Informational Note):** Hiển thị banner lưu ý trực quan thông báo cho người dùng dữ liệu được thu thập theo từng tháng và quản trị viên có thể tra cứu các tháng lịch sử bằng cách chọn trên lịch năm.
- **Bộ chọn lịch năm (Year Calendar Month Picker):** Nút mở popover lịch 12 tháng chuyên nghiệp, hỗ trợ xem dữ liệu bất kỳ tháng nào trong quá khứ (`Tháng 01` - `Tháng 11/2026`), vô hiệu hóa các tháng tương lai chưa diễn ra, kèm nút quay về tháng hiện tại.
- **Cập nhật tiêu đề phụ & trạng thái trống:** Tiêu đề danh sách cập nhật động theo tháng (`Dựa trên các kỳ họp trong Tháng 11/2026 (Tháng hiện tại)`), hiển thị giao diện chúc mừng tích cực khi tháng không phát sinh vi phạm.

### 19. Chuẩn Hóa Xuất Báo Cáo Định Dạng Excel (.xlsx) Thay Thế CSV
- **Chuyển đổi triệt để sang file Excel chuẩn OpenXML (.xlsx):** Toàn bộ các chức năng xuất dữ liệu (Bảng chấm công ngày, Dashboard chấm công, Dashboard cuộc họp, Biên bản chuyên cần cuộc họp, Lưu trữ tổng hợp kỳ họp, Quản trị thiết bị) chuyển sang tạo tệp `.xlsx` thật, mở trực tiếp trên Excel/Google Sheets không bao giờ bị lỗi font tiếng Việt.
- **Bộ sinh OpenXML thuần TypeScript (`src/utils/excelExport.ts`):** Tự sinh tệp nhị phân ZIP OpenXML không cần thêm thư viện npm ngoài, bảo đảm an toàn vận hành 100%.
- **Thiết kế định dạng đồng bộ giao diện bảng:** Tiêu đề Quốc hiệu, đơn vị, tiêu đề bảng nền xanh Finviet Primary Blue (`#0070CE`) chữ trắng đậm, viền mỏng `#CBD5E1`, phân canh lề và các huy hiệu trạng thái màu mềm (xanh lá, vàng cam, đỏ, xanh dương) đồng bộ 100% với giao diện người dùng.

## Liên quan
- [Tài liệu hướng dẫn chi tiết](file:///Users/hieuvo/Desktop/Finviet/Attendance%20Portal/docs/USER_FEEDBACK_GUIDELINES.md)
- [Tổng quan Attendance Portal](project-overview.md)
- [Bảng điều khiển báo cáo](module-dashboard.md)
