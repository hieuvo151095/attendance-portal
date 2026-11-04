# [DS] TextField

Component nhập liệu văn bản cơ bản (họ tên, mã đơn vị, tên đăng nhập, email...), tuân thủ 100% token của hệ thống thiết kế ECO ME Dashboard.

## Quy ước sử dụng

- **Nhãn**: font `var(--font-sans)`, cỡ `13px`, trọng số `500` (class `.label-sm`), màu `var(--text-heading)`. Dấu sao bắt buộc màu `var(--semantic-danger)`.
- **Ô nhập**:
  - Chiều cao / khoảng cách trong: `padding: var(--space-10) var(--space-16)`
  - Nền mặc định: `var(--bg-subtle)`, khi focus: `var(--bg-surface)`
  - Viền: `1px solid var(--border-default)`, khi focus: `border-color: var(--eco-blue-strong)` và đổ bóng `0 0 0 2px rgba(0, 112, 206, 0.2)`
  - Bo góc: `var(--radius-8)`
  - Chữ: font `var(--font-sans)`, `14px`, `var(--text-body)`
- **Icon tiền tố**: Đặt cách lề trái `var(--space-12)`, màu `var(--text-subtle)`, ô input thụt lề trái `38px`.
- **Trạng thái lỗi**: Viền `var(--semantic-danger)`, thông điệp lỗi cỡ `12px` (`.body-xs`) bên dưới.

## Thuộc tính (Props)

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `label` | `ReactNode` | - | Nhãn trường nhập |
| `required` | `boolean` | `false` | Hiển thị dấu sao đỏ bắt buộc |
| `prefixIcon` | `IconName` | - | Icon biểu trưng bên trái |
| `placeholder` | `string` | - | Chữ gợi ý mờ |
| `error` | `string` | - | Thông báo lỗi xác thực |
| `helper` | `string` | - | Chú thích hướng dẫn dưới ô |
| `disabled` | `boolean` | `false` | Khóa không cho nhập |
