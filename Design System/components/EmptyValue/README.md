# EmptyValue

Chữ thay cho ô chưa có dữ liệu trong bảng, nói rõ điều gì chưa có.

## Khi nào dùng

- **Dùng khi:**
  - Ô bảng thiếu dữ liệu: "Chưa chủ nhiệm", "Chưa phân công".
  - Thiếu dữ liệu định danh (in nghiêng): "Chưa có mã nhân viên".
- **Không dùng khi:**
  - Cả bảng không có hàng → `emptyText` của `DataTable`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `italic` | `true` | Thiếu dữ liệu định danh của bản ghi (mã). |

## Cách dùng

React:
```js
h(ECOMD.EmptyValue, null, 'Chưa chủ nhiệm')
h(ECOMD.EmptyValue, { italic: true }, 'Chưa có mã nhân viên')
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.EmptyValue">Chưa phân công</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `label` | node | `'Chưa có'` | Chữ; có thể dùng `children`. |
| `italic` | boolean | `false` | In nghiêng. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Bắt đầu bằng "Chưa …" và nêu đúng thứ còn thiếu.

**Không nên:**
- Để ô trống hoặc dùng dấu gạch "—".

## Thông số

- Chữ `body-xs` `text-muted` (2.56:1 trên `bg-surface` — xem Quy ước dùng token › Cặp chưa đạt).
