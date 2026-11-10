# HƯỚNG DẪN QUY CHUẨN THIẾT KẾ & BẢO TOÀN PHẢN HỒI NGƯỜI DÙNG
## (Finviet Attendance Portal — Mandatory User Feedback & UI/UX Guidelines)

> **QUY TẮC BẮT BUỘC ĐỐI VỚI MỌI AGENT VÀ LẬP TRÌNH VIÊN:**  
> Toàn bộ các quy tắc dưới đây được đúc kết trực tiếp từ phản hồi thực tế của người dùng/chủ quản hệ thống.  
> Khi sửa lỗi hiện tại hoặc phát triển bất kỳ tính năng mới nào, **BẮT BUỘC PHẢI ĐỌC VÀ TUÂN THỦ 100% CÁC QUY CHUẨN NÀY**. Tuyệt đối không vi phạm hoặc làm tái phát các lỗi đã được người dùng chấn chỉnh.

---

### 1. Nguyên Tắc Ổn Định Giao Diện Tuyệt Đối (Zero Layout Shift / Không Giật Hay Dịch Chuyển Màn Hình)
* **Khi chuyển đổi giữa các tab lọc (Pills / KPI Cards):**  
  * Ví dụ: Chuyển qua lại giữa *"Tất cả"*, *"Đang có mặt"*, *"Nghỉ phép có đơn"*, *"Chưa đến / Vắng"*, *"Đơn chờ duyệt"*, v.v.
  * **Toàn bộ khung thẻ (Card) và màn hình PHẢI ĐƯỢC GIỮ CỐ ĐỊNH, KHÔNG ĐƯỢC CO DÃN HAY XÊ DỊCH MÀN HÌNH** (*"the whole screen is moving - don't, keep it still when I switch"*).
  * Khung danh sách cuộn phải có chiều cao cố định (`height: 380px`, `minHeight: 380px`, `maxHeight: 380px`, `overflowY: 'auto'`).
  * Sử dụng thuộc tính `scrollbarGutter: 'stable'` để khi danh sách xuất hiện hoặc mất thanh cuộn không gây giật thụt lề ngang.
  * Khi danh sách chỉ có 1 cán bộ, 2 cán bộ, hay 0 cán bộ (Trạng thái rỗng - Empty State), khu vực nội dung vẫn giữ nguyên chiều cao 380px chuẩn, không co ngắn lại làm sập hàng lưới hay kéo giật thanh cuộn của trình duyệt.
* **Các luồng nhiều bước (Multi-step flows):**  
  * Kích thước khung chứa (Right-Sheet / Modal) phải giữ nguyên kích thước không đổi từ Bước 1 sang Bước 2 và Bước 3 (Kết quả).

---

### 2. Cổng Xác Nhận Kép Cho Mọi Hành Động Nghiệp Vụ (Double Confirmation / Safety Gates)
* **Không bao giờ thực thi hành động nhạy cảm hoặc thay đổi dữ liệu chỉ bằng 1 cú nhấp chuột đơn thuần:**
  * **Khóa / Mở khóa thiết bị:** Bắt buộc hiển thị pop-up xác nhận (`PopupModal`) trước khi gửi lệnh.
  * **Chấm công bổ sung giờ về (Quên check-out):**  
    * Bên cạnh chữ *"Chưa về"*, hiển thị nút *"Chấm công"*.
    * Bấm *"Chấm công"* -> chữ *"Chưa về"* chuyển thành ô nhập giờ (`<input type="time" ... />`) và nút đổi thành *"Xác nhận"*.
    * Bấm *"Xác nhận"* -> Hiển thị pop-up modal xác nhận lần cuối trước khi cập nhật dữ liệu.
    * Xóa bỏ hoàn toàn các khung cảnh báo rườm rà chiếm diện tích.
  * **Xác nhận nghỉ phép:**  
    * Bấm chọn checkbox *"Xác nhận nghỉ phép ngày..."* **KHÔNG ĐƯỢC gọi API ngay lập tức**.
    * Giữ nguyên form chọn (cả ngày / buổi sáng / buổi chiều, dropdown lý do).
    * Hiển thị nút *"Xác nhận"* bên trong khối nghỉ phép.
    * Bấm *"Xác nhận"* -> Hiển thị pop-up modal xác nhận lần cuối rồi mới lưu.
  * **Xóa cuộc họp / Hủy cán bộ / Đóng băng dữ liệu:** Luôn có pop-up cảnh báo xác nhận rõ ràng hậu quả thao tác.

---

### 3. Chuẩn Hóa Right-Sheet (Bảng Trượt Bên Phải) Cho Quy Trình Phức Tạp
* Các quy trình quản trị chuyên sâu (như *"Đồng bộ dữ liệu đến Camera AI"*, *"Nhập danh sách từ Excel"*, *"Chi tiết chấm công cán bộ"*):
  * **Bắt buộc sử dụng Right-Sheet** (bảng trượt từ mép phải màn hình vào với nền mờ backdrop), không dùng hộp thoại popup nổi co giãn ở giữa màn hình.
  * **Quy trình chuẩn 3 bước:**
    * **Bước 1:** Chọn lọc đối tượng / Tải file / Kiểm tra điều kiện (hiển thị rõ cán bộ đủ điều kiện vs chưa đủ điều kiện).
    * **Bước 2:** Xem lại danh sách & Xác nhận đồng bộ đến các thiết bị camera.
    * **Bước 3 (Kết quả - Result Step):** Báo cáo kết quả đồng bộ chi tiết, hiển thị rõ số lượng thành công và danh sách thất bại/lỗi (kèm nút thử lại).

---

### 4. Quy Tắc Thông Báo Đơn Nhất (Single Toast Rule)
* **Chỉ hiển thị đúng 1 thông báo Toast duy nhất cho mỗi thao tác người dùng:**
  * Tuyệt đối không để xảy ra tình trạng bắn đồng thời 2 Toast (ví dụ vừa toast ở modal vừa toast ở màn hình chính).
  * Toast sử dụng ngôn ngữ tiếng Việt nghiệp vụ chuẩn mực, không kèm mã lỗi hay thuật ngữ kỹ thuật thô.

---

### 5. Tuân Thủ Nghiêm Ngặt Hệ Thống Thiết Kế (Design System Adherence)
* **Luôn sử dụng component chuẩn của Design System:**
  * Dropdown chọn lý do, chọn phòng ban, chọn thiết bị: Bắt buộc dùng `<SelectField>` từ Design System, tuyệt đối không dùng thẻ `<select>` thô của HTML.
  * Nút bấm (`Button`), Nhãn trạng thái (`StatusTag`, `Tag`), Biểu tượng (`Icon`), Thước đo (`Meter`), Thẻ thống kê (`StatCard`).
* **Trạng thái bật/tắt (Checkbox / Toggle):**
  * Khi bỏ chọn (untick), dòng trạng thái ghi chú (ví dụ *"Đang tạm tắt"*) **phải nằm ở dòng tiếp theo bên dưới tiêu đề**.
  * **Tuyệt đối không làm xê dịch vị trí của icon** hay các phần tử xung quanh.

---

### 6. Phân Khung Trực Quan & Vị Trí Chấm Trạng Thái (Visual Framing & Dot Placement)
* **Khối danh sách nhóm (Roster Cards):**
  * Ở chế độ *"Tất cả"* (mặc định), các phân nhóm (Có mặt, Nghỉ phép, Chưa đến...) phải có khung riêng phân tách rõ ràng (`border: 1px solid var(--border-default)`, `backgroundColor: var(--bg-subtle)`).
  * **Dấu chấm tròn màu sắc (dot) BẮT BUỘC đặt ở TRƯỚC tiêu đề của khung** (Ví dụ: `[●] Có mặt (23)`).
* **Nút lọc danh mục (Pill tabs):**
  * Tất cả các tab/pill lọc (*"Tất cả"*, *"Đơn chờ duyệt"*, *"Nghỉ phép"*, *"Thiết bị"*...) phải có kích thước, font chữ, đệm viền (padding) đồng nhất, không được để tab này khác tab kia.

---

### 7. Điều Hướng Liên Kết Sâu Giữa Các Module (Deep Linking)
* Các nút tác vụ kiểm tra nhanh từ Trung tâm Cảnh báo (Action Center):
  * Bấm nút *"Kiểm tra"* trên thẻ Thiết bị phải điều hướng trực tiếp đến tab *"Quản trị thiết bị"* bên trong module *"Thiết Lập"*, không để người dùng phải tự tìm đường dẫn.

---

### 8. Chuẩn Mực Bảng Điều Khiển Cuộc Họp & Báo Cáo Chuyên Cần Lãnh Đạo
* **Bộ lọc số lượng cuộc họp trong Bảng điều khiển Cuộc họp:**
  * Chỉ gồm đúng 4 tùy chọn cố định (bước nhảy 3 cuộc họp):
    * **6 cuộc họp gần nhất** (mặc định)
    * **9 cuộc họp gần nhất**
    * **12 cuộc họp gần nhất**
    * **15 cuộc họp gần nhất**
  * Không dùng danh sách dài vô tận từ 5 đến 15.
* **Khối "Cuộc họp gần đây" trong Bảng điều khiển Cuộc họp:**
  * Tiêu đề chuẩn: **"Cuộc Họp Gần Đây"**.
  * Cố định hiển thị tối đa **4 cuộc họp** theo đúng thứ tự ưu tiên:
    1. ⏳ **Sắp diễn ra** (`scheduled`)
    2. 🔴 **Đang diễn ra** (`in_progress`)
    3. 🟢 **Đã kết thúc** (`completed`)
  * Nếu loại hình nào không có trong kỳ, tự động bỏ qua loại đó mà không làm vỡ giao diện.
* **Khối bên phải: "Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần Khối Phòng Ban":**
  * Thay thế hoàn toàn thẻ *"Cuộc Họp Đang Diễn Ra"* (tránh trùng lặp nội dung).
  * Cung cấp góc nhìn giám sát hành chính công vụ thực tiễn cho Chủ tịch & Thường trực UBND:
    1. **Chỉ số Kỷ luật Hành chính trong kỳ**: Tỷ lệ chấp hành triệu tập, Số lượt vắng có phép, Số lượt vắng không phép, Số lượt đi muộn.
    2. **Đơn vị cần chấn chỉnh kỷ luật**: Cảnh báo các phòng ban có đại biểu đi muộn hoặc vắng trong các kỳ họp gần nhất (kèm nhãn *"Cần lưu ý"*, *"Cần chấn chỉnh"*).
    3. **Danh sách đại biểu vắng/muộn gần nhất**: Chi tiết cán bộ, chức vụ, lý do (công tác cơ sở / có đơn / vắng không phép), kèm nút thao tác nhanh *“Nhắc nhở”* hoặc *“Yêu cầu giải trình”*.
    4. **Cổng xác nhận kép**: Bấm nút mở Pop-up xác nhận (`PopupModal`) trước khi gửi thông báo và hiển thị đúng 1 Toast thành công.
* **Loại bỏ các thành phần dư thừa, không mang lại giá trị thực tế:**
  * Đã xóa nút *"Xem chi tiết"* tại từng thẻ cuộc họp trong khối *"Cuộc Họp Gần Đây"*. Các thẻ hiển thị thông tin cuộc họp và số lượng đại biểu gọn gàng, đồng bộ (đối với cuộc họp đã kết thúc, vẫn giữ nút *"Biên bản & Báo cáo"* để tra cứu nhanh).
  * Đã xóa thẻ PDF tổng quan không cần thiết trong menu tài khoản.
  * Đã xóa hoàn toàn thanh chân trang (footer) ở cuối modal *"Biên bản cuộc họp & Báo cáo chuyên cần"* (gồm các nút trùng lặp: *"Tải file Excel (.csv)"*, *"In / Lưu PDF"*, *"Đóng"*) vì thanh công cụ trên đầu modal đã có đầy đủ chức năng xuất Excel và in/xuất PDF, và góc trên đã có nút đóng (X).
  * Đã xóa tác vụ *"Tải nhanh file Excel (.csv)"* trong menu thao tác dòng của tab *"Báo Cáo & Lưu Trữ Biên Bản"*, chỉ giữ lại *"Xem biên bản họp"*.
  * Đã xóa khối đếm giờ thừa, giữ lại nút *"Biên bản & Báo cáo"* nằm cùng hàng với trạng thái chốt.
* **Ngữ nghĩa chuẩn hóa:**
  * Đổi *"Màn hình điểm danh"* thành *"Thống kê điểm danh"*.
  * Đổi *"Chưa đến"* thành *"Chưa đến/ Không tham dự"* đồng bộ ở cả thẻ thống kê (StatCard) lẫn tab bộ lọc (pill tab) trong giao diện Thống kê điểm danh cuộc họp.
  * Đổi *"Biên bản cuộc họp đã được chốt và đóng băng dữ liệu bất biến (MTG-03)"* thành *"Biên bản cuộc họp đã được chốt"*.
* **Hiển thị mô tả cuộc họp:**
  * Bổ sung dòng mô tả chi tiết nội dung cuộc họp (`description`) tại phần tiêu đề (Header) của màn hình *"Thống kê điểm danh"* (ngay dưới dòng thông tin phòng họp, thời gian và chủ trì), đồng bộ đầy đủ dữ liệu nghiệp vụ như tại bảng danh sách cuộc họp.
* **Chuẩn hóa nút thao tác Header theo trạng thái cuộc họp:**
  * **Sắp diễn ra (`scheduled`)**: Ẩn cả 2 nút *"Biên bản & Báo cáo"* và *"Kết thúc cuộc họp"* (cuộc họp chưa bắt đầu).
  * **Đang diễn ra (`in_progress`)**: Chỉ hiển thị duy nhất nút *"Kết thúc cuộc họp"*, ẩn nút *"Biên bản & Báo cáo"* (chưa có biên bản kết luận khi phiên họp đang chạy).
  * **Đã kết thúc (`completed`)**: Hiển thị đầy đủ cả 2 nút *"Biên bản & Báo cáo"* và *"Kết thúc cuộc họp"* trên thanh tiêu đề Header.
* **Bố cục thanh điều khiển danh sách đại biểu:**
  * Dời toàn bộ cụm nút lọc trạng thái (`[Tất cả]`, `[Đã đến]`, `[Đi muộn]`, `[Về sớm]`, `[Chưa đến/ Không tham dự]`, `[Đã về]`) về nằm ngay bên cạnh ô tìm kiếm (SearchField) ở bên trái cho tất cả các loại hình cuộc họp, loại bỏ khoảng trống trắng dư thừa và giữ cụm chuyển đổi chế độ xem (Cards/Table) ở góc phải.

---

### 9. Chuẩn Mực Hiển Thị Giờ Check-out & Xử Lý Nghỉ Phép Kèm Dữ Liệu Vào Ca (Consistent Check-out & Leave Display)
* **Xóa bỏ hoàn toàn nhãn `(Admin bổ sung)`:**
  * Tại khu vực thông tin Giờ về (Check-out) trong chi tiết chấm công (`AttendanceLogModal`), chỉ hiển thị giờ về thực tế (ví dụ: `17:00`) kèm nút *"Chỉnh sửa"* (hoặc nhãn `Chưa về` kèm nút *"Chấm công"*). Tuyệt đối không hiển thị kèm chữ `(Admin bổ sung)` hay biểu tượng ô vuông đứt nét bên cạnh giờ về.
  * Chi tiết người bổ sung đã được ghi nhận ở dòng phụ bên dưới (*"Thông tin check-out được bổ sung bởi..."*) và trong Nhật ký kiểm toán (*Audit Log*).
* **Không bao giờ dùng nhãn nghỉ phép đè lên thông tin Check-out (Tách 2 dòng độc lập):**
  * Tại cột Giờ về (Check-out) của bảng chấm công hàng ngày (`DailyAttendance`) và trong SideSheet chi tiết chấm công (`AttendanceLogModal`), tuyệt đối không thay thế dữ liệu giờ về bằng chữ *"Nghỉ buổi chiều"*, *"Nghỉ buổi sáng"* hay *"Nghỉ cả ngày"*.
  * **Quy chuẩn 2 dòng độc lập:**
    * **Dòng 1:** Hiển thị giờ về thực tế (nếu có) hoặc dấu gạch ngang `—` / `Chưa về`.
    * **Dòng 2:** Hiển thị nhãn nghỉ phép kèm biểu tượng lịch (`<Icon name="calendar-check" />`) giải thích rõ ràng và ngắn gọn phạm vi nghỉ phép:
      * Nghỉ buổi chiều: `[icon] Nghỉ buổi chiều`
      * Nghỉ cả ngày: `[icon] Nghỉ cả ngày`
      * Nghỉ buổi sáng: `[icon] Nghỉ buổi sáng`
* **Xử lý nhất quán trường hợp Cán bộ đã Check-in buổi sáng nhưng xin Nghỉ cả ngày đột xuất:**
  * Giữ nguyên dữ liệu check-in thực tế của cán bộ để bảo toàn dữ liệu kiểm toán thiết bị và minh bạch thời gian thực tế cán bộ có mặt tại cơ quan:
    * **Cột Check-in (Giờ đến):**
      * Dòng 1: Giờ quét vân tay / Face ID thực tế (ví dụ: `07:05` kèm biểu tượng Face ID).
      * Dòng 2: Hiển thị nhãn làm rõ trạng thái: `<Icon name="calendar-check" /> Nghỉ cả ngày (đã vào ca)`.
    * **Cột Check-out (Giờ về):**
      * Dòng 1: Giờ về thực tế nếu đã quét tan ca, hoặc `—` nếu chưa có lượt quét.
      * Dòng 2: `<Icon name="calendar-check" /> Nghỉ cả ngày`.
    * **Chi tiết chấm công (SideSheet):**
      * Giờ đến: `07:05 (Face ID)` và Dòng 2: `[icon] Đã duyệt nghỉ cả ngày (đã vào ca)`.
      * Giờ về: `Chưa về` (kèm nút Chấm công) hoặc giờ về thực tế (kèm nút Chỉnh sửa), và Dòng 2: `[icon] Nghỉ cả ngày`.
      * Hộp cảnh báo nghiệp vụ: Hiển thị thông báo *"Cán bộ đã có dữ liệu check-in lúc 07:05. Hệ thống ghi nhận nghỉ phép đột xuất (việc khẩn cấp về sớm) và bảo lưu dữ liệu vào ca."*
  * Đảm bảo giao diện bảng dữ liệu và SideSheet luôn sạch sẽ, rõ ràng, nhất quán và không làm mất dữ liệu quét cổng.

---

### 10. Loại Bỏ Khối "Đơn Chờ Duyệt" & Đổi "Nghỉ Phép Có Đơn" Thành "Nghỉ Phép" (Action Center & Roster Alignment)
* **Xóa bỏ hoàn toàn tab *"Đơn chờ duyệt"* và phân mục *"Đơn nghỉ phép / công tác chờ duyệt trong ngày"* tại Action Center:**
  * Do hệ thống hiện tại chưa có nguồn dữ liệu đầu vào (input resource) để tích hợp quy trình tạo và duyệt đơn nghỉ phép/công tác trực tuyến, tính năng này được loại bỏ hoàn toàn để tránh hiển thị thông tin không có nguồn đối chiếu.
  * Thanh bộ lọc tại Action Center chỉ giữ lại 4 nhóm nghiệp vụ thực tế: *"Tất cả"*, *"Quên check-out"*, *"Chuyên cần đột biến"* và *"Thiết bị"*.
  * Dòng tiêu đề phụ rút gọn chuẩn mực: *"Trung tâm giải quyết các vấn đề chuyên cần & cảnh báo thiết bị"*.
  * Tổng số việc cần xử lý (`totalTasks`) phản ánh chính xác các việc thực tế cần giải quyết.
* **Đổi chữ *"Nghỉ phép có đơn"* thành *"Nghỉ phép"*:**
  * Tại thẻ theo dõi quân số hôm nay (`TodayAttendanceRosterCard`), toàn bộ các vị trí hiển thị *"Nghỉ phép có đơn"* (thẻ thống kê KPI trên cùng, tiêu đề khung phân nhóm cán bộ nghỉ, dòng mô tả) được chuyển đổi đồng bộ thành *"Nghỉ phép"*.
  * Thống nhất câu chữ ngắn gọn, thực tế và đồng bộ với tab lọc *"Nghỉ phép"*.

---

### 11. Cơ Chế Tính Kỷ Luật Phòng Ban, Tinh Gọn Thao Tác & Quy Tắc Vắng Có Phép / Không Phép Trong Cuộc Họp
* **Cơ chế tính số lượt trễ/vắng tại "Đơn vị cần chấn chỉnh kỷ luật":**
  * Số liệu vi phạm (ví dụ: *"3 lượt trễ >15p"* của Bộ phận Địa chính - Xây dựng - Đô thị) được **tổng hợp lũy kế trên tập N cuộc họp gần nhất đang chọn** tại bộ lọc Bảng điều khiển (mặc định 6 cuộc họp; hoặc 9, 12, 15 cuộc họp gần nhất).
  * Không tính đơn lẻ chỉ cho 1 cuộc họp gần nhất (vì là sự cố cá biệt không phản ánh xu hướng) và không cộng dồn cả năm (vì làm loãng các cảnh báo đột biến gần đây). Khi người dùng đổi bộ lọc (ví dụ 6 -> 9 cuộc họp), dữ liệu tổng hợp sẽ tự động tính toán lại theo phạm vi cuộc họp tương ứng.
* **Xóa bỏ nhãn cảnh báo thừa & nút thao tác đôn đốc:**
  * Tại mục *"Đơn vị cần chấn chỉnh kỷ luật"*: Xóa bỏ hoàn toàn các nhãn/tag phụ như `"Cần lưu ý"` và `"Cần chấn chỉnh"`. Nội dung vi phạm (ví dụ: `3 lượt trễ >15p`, `1 lượt vắng`) đã đầy đủ, rõ ràng và mạch lạc.
  * Tại mục *"Danh sách đại biểu vắng / muộn gần nhất"*: Xóa bỏ dòng tiêu đề phụ *"Thao tác đôn đốc"* và hai nút thao tác *"Nhắc nhở"*, *"Yêu cầu giải trình"* kèm pop-up xác nhận. Giữ thẻ hiển thị cô đọng, tập trung vào dữ liệu giám sát và phản ánh trung thực tình hình chấp hành.
* **Quy tắc phân định "Có phép" và "Không phép" trong điểm danh cuộc họp:**
  * **Vắng có phép (Excused Absence):** Cán bộ được xác định là vắng có phép khi có thông tin nghỉ phép/công tác đã được Admin phê duyệt hoặc xác nhận trong hệ thống Chấm công hàng ngày (`dailyAttendance`) với khoảng thời gian bao hàm giờ diễn ra cuộc họp:
    * `full_day` (Nghỉ cả ngày): Áp dụng cho mọi cuộc họp diễn ra trong ngày.
    * `morning` (Nghỉ buổi sáng): Áp dụng cho các cuộc họp diễn ra trong buổi sáng (bắt đầu trước 12:00).
    * `afternoon` (Nghỉ buổi chiều): Áp dụng cho các cuộc họp diễn ra trong buổi chiều (bắt đầu từ 12:00 trở đi).
    * Lý do nghỉ phép trong hồ sơ chấm công (ví dụ: *"Đi công tác cơ sở"*, *"Việc gia đình"*) được tự động hiển thị đi kèm làm căn cứ chứng minh.
  * **Vắng không phép (Unexcused Absence):** Cán bộ không tham dự/không điểm danh cuộc họp và **không có** bất kỳ bản ghi xác nhận nghỉ phép nào từ Admin bao hàm khung giờ cuộc họp (kể cả trường hợp cán bộ đã có mặt check-in chấm công đầu ngày nhưng không tham gia cuộc họp).
* **Quy trình đóng/kết thúc cuộc họp dành cho Admin (Close Modal Workflow):**
  * Khi Admin bấm *"Kết thúc cuộc họp"*, pop-up xác nhận sẽ tự động phân tích và đối soát danh sách đại biểu chưa đến theo 2 nhóm độc lập:
    * **Vắng có phép ({count}):** Liệt kê chi tiết tên, chức vụ, đơn vị và lý do xin nghỉ.
    * **Vắng không phép ({count}):** Liệt kê chi tiết các đại biểu vắng mặt chưa rõ lý do.
  * **Luồng hỗ trợ linh hoạt cho Admin:** Nếu trong danh sách vắng không phép có đại biểu đã báo cáo trước với Admin (qua điện thoại/tin nhắn), Admin có thể bấm **"Hủy"** trên pop-up kết thúc, chuyển sang màn hình Chấm công để xác nhận trạng thái nghỉ phép/công tác trong ngày của cán bộ, sau đó quay lại màn hình cuộc họp. Hệ thống sẽ tự động đối soát và cập nhật đại biểu đó sang nhóm **"Có phép"** ngay lập tức trước khi Admin chốt kết thúc cuộc họp.

---

### 12. Chuẩn Mực Màu Sắc Biểu Đồ & Đánh Giá "Cần Lưu Ý" Tại Thẻ So Sánh Chuyên Cần Phòng Ban
* **Đồng bộ màu sắc thanh biểu đồ (Xanh lá & Xanh dương) với phần giải thích (Legend):**
  * Thanh 1 (Tỷ lệ hiện diện / Tỷ lệ tham dự): Luôn giữ màu **Xanh lá (`#10B981`)**, khớp 100% với biểu tượng vuông xanh lá trong chú thích.
  * Thanh 2 (Tỷ lệ đúng giờ): Luôn giữ màu **Xanh dương (`#0070CE`)**, khớp 100% với biểu tượng vuông xanh dương trong chú thích.
  * Không đổi màu thanh biểu đồ sang màu cam (`#F59E0B`) khi dưới mục tiêu, tránh gây khó hiểu cho người dùng do phần chú thích không có định nghĩa màu cam.
* **Đổi nhãn mục tiêu trong tab "Chấm Công":**
  * Đổi câu chú thích `"Mục tiêu chuẩn cơ quan: "` thành `"Mục tiêu tỷ lệ đúng giờ: "` (kèm giá trị mục tiêu, ví dụ `90%`).
* **Quy chuẩn đánh giá trạng thái phòng ban ("Cần lưu ý" màu đỏ vs "Tốt" màu xanh):**
  * **Tại tab Chấm Công:**
    * Nếu Tỷ lệ đúng giờ của phòng ban chưa đạt mục tiêu (`onTimeRate < targetOnTimeRate`): Hiển thị nhãn **"Cần lưu ý"** bằng chữ màu đỏ (`#EF4444`).
    * Nếu đạt hoặc vượt mục tiêu: Hiển thị nhãn **"Tốt"** bằng chữ màu xanh (`var(--semantic-success)`).
  * **Tại tab Cuộc Họp:**
    * Nếu một trong hai chỉ số (Tỷ lệ tham dự hoặc Tỷ lệ đúng giờ) chưa đạt mục tiêu tương ứng (`attendanceRate < targetAttendanceRate || onTimeRate < targetOnTimeRate`): Hiển thị nhãn **"Cần lưu ý"** bằng chữ màu đỏ (`#EF4444`).
    * Nếu cả hai chỉ số đều đạt hoặc vượt mục tiêu: Hiển thị nhãn **"Tốt"** bằng chữ màu xanh (`var(--semantic-success)`).

---

### 13. Trạng Thái Đã Xác Nhận Nghỉ Phép & Tinh Gọn Khu Vực Tóm Tắt Trong SideSheet Chấm Công
* **Khối "Xác nhận nghỉ phép" ở giai đoạn Đã xác nhận (Confirmed Stage):**
  * Sau khi Quản trị viên xác nhận nghỉ phép cho cán bộ (hoặc khi mở SideSheet của cán bộ đã ở trạng thái nghỉ phép), khối quản trị hiển thị ở trạng thái đã xác nhận:
    * Tiêu đề: *“Xác nhận nghỉ phép ngày {date}”* kèm nhãn trạng thái (ví dụ: `Nghỉ buổi chiều`, `Nghỉ buổi sáng`, `Nghỉ cả ngày`).
    * Khung tóm tắt thông tin: Hiển thị rõ ràng Thời gian nghỉ, Lý do nghỉ phép, và ghi chú bảo lưu dữ liệu check-in (nếu cán bộ đã vào ca).
    * Nút hành động: Có nút **"Điều chỉnh"** ở góc phải cho phép Quản trị viên linh hoạt chuyển sang chế độ chỉnh sửa để thay đổi phạm vi nghỉ, cập nhật lý do hoặc hủy bỏ ghi nhận khi cần.
* **Xóa bỏ các dòng chữ "Nghỉ buổi chiều" trùng lặp tại khu vực tóm tắt đầu tiên:**
  * Tại khu vực tóm tắt thông tin trên cùng của SideSheet chi tiết chấm công:
    * **Trạng thái chấm công** đã hiển thị đầy đủ nhãn trạng thái (ví dụ: `[icon] Nghỉ buổi chiều`).
    * Do đó, xóa bỏ hoàn toàn các dòng chữ phụ *"Nghỉ buổi chiều"* / *"Nghỉ buổi sáng"* / *"Nghỉ cả ngày"* hiển thị dư thừa bên dưới mục **Giờ đến (Check-in)** và **Giờ về (Check-out)**.
    * Giờ đến chỉ hiển thị giờ quét thực tế (ví dụ: `06:55 (Vân tay)`) hoặc dấu gạch `—`.
    * Giờ về chỉ hiển thị trạng thái giờ về (ví dụ: `Chưa về [Chấm công]` hoặc giờ quét thực tế `[Chỉnh sửa]`), giữ giao diện luôn thoáng đãng, mạch lạc và sạch sẽ.
* **Xóa bỏ tác vụ "Bổ sung giờ về (Check-out bù)" trong menu thao tác dòng (3 chấm):**
  * Tại cột *Thao tác* của bảng chấm công hàng ngày (`DailyAttendance`), loại bỏ hoàn toàn hành động *"Bổ sung giờ về (Check-out bù)"* trong menu popover 3 chấm.
  * Menu 3 chấm chỉ giữ lại duy nhất tác vụ **"Chi tiết chấm công"**.
  * Quy trình bổ sung hoặc điều chỉnh giờ về của Quản trị viên được thực hiện tập trung, an toàn và có kiểm soát ngay bên trong SideSheet Chi tiết chấm công (kèm nhật ký kiểm toán Audit Log).

---

### 14. Phương Thức Xác Thực Trong Quét Điểm Danh Nhanh
* **Chỉ hỗ trợ 1 phương thức duy nhất trong modal "Quét Điểm Danh Nhanh":**
  * Trường *Phương thức xác thực* (`scanMethod`) trong modal *Quét Điểm Danh Nhanh* (`QuickScanModal`) chỉ có duy nhất một lựa chọn: **"Ghi nhận thủ công từ Quản trị viên"** (`manual`).
  * Loại bỏ các lựa chọn thiết bị tự động (Camera AI Face ID, Vân tay, Thẻ RFID) khỏi modal này, phản ánh đúng bản chất tác vụ can thiệp thủ công từ Quản trị viên.

---

### 15. Chuẩn Hóa Danh Mục Lý Do Nghỉ Phép Đồng Bộ Giữa Mô-Đun Chấm Công & Thẻ Quân Số
* **Danh mục lý do nghỉ phép chuẩn hóa duy nhất (`STANDARD_LEAVE_REASONS`):**
  * Trong toàn hệ thống, danh mục lý do nghỉ phép khi Quản trị viên ghi nhận nghỉ đột xuất/nghỉ phép cho cán bộ được quy định thống nhất gồm đúng 5 lựa chọn nghiệp vụ:
    1. `Nghỉ việc riêng / Khẩn cấp`
    2. `Nghỉ phép năm`
    3. `Nghỉ ốm / Khám sức khỏe`
    4. `Nghỉ chế độ / Thai sản`
    5. `Đi công tác đột xuất`
* **Đồng bộ hiển thị 1:1 tại thẻ "Chấm công hôm nay và Nghỉ phép":**
  * Khi hiển thị thông tin nghỉ phép tại thẻ *Chấm công hôm nay và Nghỉ phép* (`TodayAttendanceRosterCard`), lý do nghỉ phép hiển thị ở dòng trên góc phải phải khớp 100% với danh mục chuẩn trên (ví dụ: hiển thị chuẩn hóa `Đi công tác đột xuất` hoặc `Nghỉ phép năm`).
  * Loại bỏ hoàn toàn các chuỗi ký tự tự do, dài dòng hay chứa thông tin văn bản nội bộ cũ (như *"Đi công tác theo kế hoạch (Kế hoạch số 48/KH-CAP đã phê duyệt)"*).
  * Cơ chế chuẩn hóa tự động (`normalizeLeaveReason`) tự động ánh xạ dữ liệu lưu trữ cục bộ (`localStorage`) và dữ liệu khởi tạo về đúng 5 danh mục chuẩn, đảm bảo tính nhất quán dữ liệu xuyên suốt giữa màn hình Tổng quan và mô-đun Chấm công.

---

### 16. Đồng Bộ Số Liệu Thiết Bị Giữa Quản Trị Thiết Bị & Trung Tâm Cảnh Báo (Action Center)
* **Số liệu hoạt động (`{activeCount}/{totalCount} đang hoạt động`) và số lượng cảnh báo (`Thiết bị ({deviceCount})`) tại thẻ Action Center PHẢI ĐỒNG BỘ 100% VỚI TAB QUẢN TRỊ THIẾT BỊ:**
  * Thẻ *Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày* (`ActionCenterCard`) đọc trực tiếp dữ liệu danh sách thiết bị từ `cameraDeviceService.getDevicesByTenant(tenantId)`.
  * Tuyệt đối không hardcode tỷ lệ (như `4/5 đang hoạt động`) hoặc số lượng `deviceCount = 1`.
  * **Tỷ lệ hiển thị:** `${activeDevices.length}/${totalDevices.length} đang hoạt động` (ví dụ: khi có 3 thiết bị hoạt động và 2 thiết bị tạm khóa trong danh mục thì hiển thị chuẩn xác `3/5 đang hoạt động`).
  * **Danh sách cảnh báo thiết bị:** Hiển thị toàn bộ các thiết bị đang ở trạng thái tạm khóa/bảo trì (`status !== 'active'`) với đầy đủ tên, mã định danh, vị trí và nút **"Kiểm tra"** dẫn trực tiếp đến tab Quản trị thiết bị.
  * **Cơ chế phản ứng thời gian thực (Real-time reactivity):** Lắng nghe sự kiện `finviet_devices_changed` và `storage` để khi Quản trị viên thay đổi trạng thái thiết bị (tạm khóa hoặc mở khóa) trong mô-đun Thiết lập, thẻ cảnh báo trên màn hình Tổng quan lập tức cập nhật lại số liệu tương ứng.

---

### 17. Trình Bày Tiêu Đề Khối Nghỉ Phép Trên Một Dòng & Nhất Quán Dữ Liệu Lịch Sử Quét Thiết Bị
* **Tiêu đề khối nghỉ phép hiển thị trọn vẹn trên 1 dòng duy nhất:**
  * Tại SideSheet *Chi tiết chấm công* (`AttendanceLogModal`), xóa bỏ hoàn toàn nhãn đóng khung màu xanh (như `[Nghỉ buổi chiều]`, `[Nghỉ cả ngày]`) đặt cạnh tiêu đề *“Xác nhận nghỉ phép ngày {date}”* ở cả hai trạng thái Đã xác nhận (Confirmed Stage) và Chỉnh sửa (Edit Stage).
  * Tiêu đề *“Xác nhận nghỉ phép ngày {date}”* được thiết lập `whiteSpace: 'nowrap'` giúp hiển thị liền mạch, thanh thoát trên đúng một dòng duy nhất, không bao giờ bị bẻ dòng.
  * Thông tin phạm vi nghỉ phép đã được trình bày mạch lạc và đầy đủ ở mục *“Thời gian nghỉ: Buổi chiều / Buổi sáng / Cả ngày”* ngay trong nội dung chi tiết.
  * **Làm sạch lý do nghỉ phép:** Hàm chuẩn hóa `normalizeLeaveReason` loại bỏ triệt để các hậu tố lặp dư thừa dạng `(Buổi chiều) (Buổi chiều)...`, giữ nội dung lý do luôn chuẩn mực theo danh mục nghiệp vụ.
* **Nhất quán dữ liệu điểm danh và lịch sử quét thiết bị (Scan Logs):**
  * **Khắc phục lỗi lệch múi giờ (+7h):** Sử dụng hàm chuyên dụng `formatScanLogTime` trích xuất trực tiếp giờ `HH:mm:ss` từ chuỗi timestamp ISO, loại bỏ việc chuyển đổi qua `Date.toLocaleTimeString()` của trình duyệt khiến giờ vào ca `06:55` bị hiển thị nhầm thành `13:55:00` và `15:05` thành `22:05:00`.
  * **Loại bỏ dữ liệu quét tan ca ảo (`sanitizeRecordConsistency`):**
    * Khi cán bộ đã check-in buổi sáng và sau đó được Quản trị viên xác nhận nghỉ buổi chiều, hệ thống chỉ bảo lưu bản ghi vào ca (`check_in`).
    * Giờ về ở khu vực tóm tắt trên cùng hiển thị chính xác `Chưa về [Chấm công]`, không phát sinh bản ghi tan ca giả lập trong lịch sử quét thiết bị.
    * Đảm bảo tính nhất quán 100% giữa giờ vào/ra tóm tắt và danh sách các lần quét thiết bị bên dưới.

---

### 18. Theo Dõi Dữ Liệu Kỷ Luật Cuộc Họp Theo Từng Tháng & Bộ Chọn Lịch Năm (Year Calendar Month Picker)
* **Theo dõi kỷ luật chuyên cần cuộc họp theo chu kỳ từng tháng:**
  * Khối *"Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần"* (`MeetingDisciplineWatch`) chuyển đổi hoàn toàn cơ chế lấy dữ liệu sang **chu kỳ hàng tháng** thay vì chỉ lấy các kỳ họp gần nhất không rõ mốc thời gian.
  * **Mặc định tháng hiện tại:** Hệ thống tự động chọn và tổng hợp dữ liệu các kỳ họp trong **Tháng 11/2026 (Tháng hiện tại)** ngay khi Quản trị viên truy cập màn hình Báo cáo cuộc họp.
* **Ghi chú thông tin minh bạch cho người dùng (Informational Note Banner):**
  * Hiển thị biểu ngữ ghi chú trực quan ngay dưới phần chỉ số tổng quan với tông màu xanh nhạt (`bg: #eff6ff`, `border: #bfdbfe`, `icon: circle-info`):
    * *Ở tháng hiện tại:* `"Lưu ý: Dữ liệu kỳ họp được thu thập theo từng tháng (mặc định: Tháng 11/2026 — tháng hiện tại). Quản trị viên có thể bấm chọn tháng trên lịch năm để tra cứu các tháng đã qua."*
    * *Khi chọn tháng lịch sử (ví dụ Tháng 10/2026):* Hiển thị nhãn thông báo đang xem dữ liệu lịch sử kèm nút bấm nhanh quay lại tháng hiện tại.
* **Bộ chọn tháng dạng Lịch Năm (Year Calendar Month Picker):**
  * Nút kích hoạt trên tiêu đề hiển thị tháng đang chọn (ví dụ: `Tháng 11/2026 (Hiện tại) ▼`) mở popover lịch dạng bảng 12 tháng chuyên nghiệp.
  * Cho phép điều hướng qua các năm và chọn bất kỳ tháng nào trong quá khứ (`Tháng 01` đến `Tháng 11/2026`).
  * Khóa các tháng trong tương lai chưa diễn ra (`Tháng 12/2026` disabled).
  * Chân popover tích hợp nút bấm nhanh: *"Về tháng hiện tại (Tháng 11/2026)"*.
* **Cập nhật tiêu đề phụ & trạng thái dữ liệu trống (Empty State):**
  * Tiêu đề phụ của danh sách đơn vị và đại biểu cập nhật động: `"Dựa trên các kỳ họp trong {monthLabel} (Tháng hiện tại)"` hoặc `"Dựa trên các kỳ họp trong {monthLabel}"`.
  * Khi tháng được chọn không có vi phạm, hệ thống hiển thị khối thông báo tích cực: *"Tất cả các đơn vị đều tuân thủ tốt kỷ luật tham gia cuộc họp"* và *"Không ghi nhận đại biểu vắng hoặc trễ giờ trong tháng này"*.


