# [DS] ECO ME DASHBOARD

Design system cho giao diện quản trị web của ECO (ECO School Portal): token, component React và tài sản dùng chung cho các màn quản trị trên trình duyệt.

## Nền tảng

- **Màu**: màu thương hiệu ECO, chữ, nền, viền, trạng thái và màu nhấn dữ liệu.
- **Chữ**: Inter 4.1, độ đậm 400 / 500 / 600 / 700 / 900.
- **Khoảng cách**: thang 4px, kèm các bước 2 / 6 / 10 / 14px dùng trong bảng và control.
- **Kích thước**: thang `size-*` cho icon, nút, avatar, vùng chạm; `size-header-h`, `size-sidebar-w`, `size-sidebar-rail-w` cho khung app.
- **Bo góc** và **đổ bóng**: mỗi loại một thang cố định.
- **Icon**: Font Awesome 6 Free, bộ Solid.

Component và màn hình chỉ dùng giá trị qua token (`var(--<token>)`) và class kiểu chữ (`.body-sm`, `.h4`…), không viết giá trị trực tiếp.

## Giấy phép

- Inter phát hành theo SIL Open Font License 1.1, dùng miễn phí cho sản phẩm thương mại. Quy tắc sử dụng: `assets/Fonts/README.md`.
- Icon Font Awesome Free phát hành theo CC BY 4.0: ghi nguồn trong màn giấy phép của sản phẩm.
- Không dùng SF Pro: giấy phép của Apple chỉ cho dùng trên nền tảng Apple.

## Tài liệu

Phiên bản hiện tại: **v2.5.1** (02/11/2026), xem mục **Lịch sử thay đổi**. Quy tắc dùng token: mục **Quy ước dùng token**. Cách viết số và tiền: mục **Quy ước hiển thị số**. Giá trị token, component và tài sản xem ở các mục tương ứng của trang này; mỗi component có README riêng.
