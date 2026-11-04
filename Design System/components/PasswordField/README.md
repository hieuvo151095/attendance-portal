# [DS] PasswordField

Component nhập mật khẩu kế thừa từ `TextField`, tích hợp sẵn nút bật/tắt hiển thị mật khẩu bằng icon `eye` và `eye-slash`.

## Quy ước sử dụng

- Kế thừa toàn bộ token hình thức của `TextField`.
- Icon tiền tố mặc định: `lock`.
- Nút hậu tố: Nút bấm trong suốt `var(--size-24)` chứa icon `eye` (khi đang ẩn) hoặc `eye-slash` (khi đang hiện), hover chuyển sang `var(--text-heading)`.
- Chuyển đổi thuộc tính `type` của thẻ input giữa `"password"` và `"text"`.

## Thuộc tính (Props)

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `showToggle` | `boolean` | `true` | Bật/tắt nút mắt ẩn hiện mật khẩu |
| `prefixIcon` | `IconName` | `'lock'` | Icon đầu dòng |
| ...các props khác kế thừa từ `TextField` | | | |
