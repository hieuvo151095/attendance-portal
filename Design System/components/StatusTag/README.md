# StatusTag

Nhãn trạng thái hoặc phân quyền của một bản ghi: nền nhạt, viền và chữ cùng tông.

## Khi nào dùng

- **Dùng khi:**
  - Trạng thái hiện tại của bản ghi: "Đang làm việc", "Tạm nghỉ", "Đã nghỉ việc".
  - Phân quyền / vai trò cần nhận ra nhanh trong bảng: "Giáo viên chính", "Giáo viên hỗ trợ".
- **Không dùng khi:**
  - Tên lớp, mã, nhãn không mang trạng thái → `Tag`.
  - Bộ lọc bấm được → `SelectField`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `tone` | `success` | Đang hoạt động: "Đang làm việc". |
|  | `warning` | Tạm dừng, chờ, vai trò hỗ trợ: "Tạm nghỉ", "Giáo viên hỗ trợ". |
|  | `danger` | Lỗi, bị khoá, đã huỷ. |
|  | `info` | Vai trò chính, đang xử lý: "Giáo viên chính". |
|  | `neutral` (mặc định) | Đã kết thúc, nháp: "Đã nghỉ việc". |
| `icon` | `true` | Thêm icon theo tone (`circle-check`, `clock`, `circle-xmark`, `circle-info`, `minus`) khi tag đứng ngoài bảng. |
|  | tên icon | Icon riêng. |

## Cách dùng

React:
```js
h(ECOMD.StatusTag, { tone: 'success' }, 'Đang làm việc')
h(ECOMD.StatusTag, { tone: 'info' }, 'Giáo viên chính')
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.StatusTag" tone="warning">Tạm nghỉ</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `tone` | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'neutral'` | Màu theo trạng thái. |
| `label` | node | — | Chữ; có thể dùng `children`. |
| `icon` | `boolean \| tên icon` | — | `true` = icon theo tone. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Chữ ngắn 1–3 từ, mô tả trạng thái hiện tại.
- Dùng cùng một chữ và tone cho cùng một trạng thái trên mọi màn.

**Không nên:**
- Dùng tag như nút bấm.
- Đặt nhiều tag trạng thái cho một bản ghi trong cùng một cột.

## Thông số

| Tone | Nền | Viền | Chữ | Tương phản chữ |
|---|---|---|---|---|
| `success` | `semantic-success-soft` | `border-success-soft` | `semantic-success-strong` | 5.21:1 |
| `warning` | `semantic-warning-soft` | `border-warning-soft` | `semantic-warning-strong` | 6.37:1 |
| `danger` | `semantic-danger-soft` | `border-danger-soft` | `semantic-danger-strong` | 5.91:1 |
| `info` | `semantic-info-soft` | `border-info-soft` | `semantic-info-strong` | 6.16:1 |
| `neutral` | `bg-muted` | `border-default` | `text-nav` | 6.92:1 |

Khung: đệm `space-4` `space-10`, viền 1px, bo `radius-full`, khoảng icon – chữ `space-4`. Chữ `body-xs-medium`, icon 12px.
