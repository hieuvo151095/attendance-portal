# InlineNotice

Thông báo nằm ngay trong nội dung trang: quy tắc áp dụng, giới hạn, cảnh báo.

## Khi nào dùng

- **Dùng khi:** cần nói một quy tắc ảnh hưởng tới thao tác trên trang ("Chỉ tạo trước được tối đa 8 tuần").
- **Không dùng khi:** phản hồi sau thao tác → toast; lỗi của một ô nhập → dòng lỗi dưới ô.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `tone` | `info` | Quy tắc, thông tin ngữ cảnh. |
| | `warning` | Giới hạn, việc cần chú ý. |
| | `success` | Đã hoàn tất. |
| | `danger` | Lỗi chặn thao tác (`role="alert"`). |

## Cách dùng

```html
<x-import component-from-global-scope="ECOMD.InlineNotice" tone="warning">Chỉ tạo trước được tối đa 8 tuần, tính từ tuần hiện tại.</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `tone` | `'info' \| 'warning' \| 'success' \| 'danger'` | `'info'` | |
| `icon` | tên icon | theo tone | |
| `action` | node | — | Nút hoặc link bên phải. |
| `children` | node | — | Nội dung, có thể in đậm một phần. |

## Thông số

- Đệm `space-12` `space-16`, bo `radius-8`, viền 1px; chữ `body-sm`.
- Màu theo tone: nền `semantic-*-soft`, viền `border-*-soft`, chữ và icon `semantic-*-strong`.
