# StatCard

Thẻ số liệu tóm tắt: nhãn, con số và icon mờ cùng tone. Xếp theo lưới bằng `StatCard.Group`.

## Khi nào dùng

- **Dùng khi:**
  - Tóm tắt 3–5 chỉ số của danh sách ngay dưới `PageHeader`: tổng, đang hoạt động, theo vai trò.
- **Không dùng khi:**
  - Số tiền nổi bật nhất màn → kiểu chữ `amount`.
  - Trạng thái của một bản ghi → `StatusTag`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `tone` | `neutral` (mặc định) | Tổng số. |
|  | `success` | Nhóm đang hoạt động: "Đang làm việc". |
|  | `info` | Nhóm vai trò chính: "Giáo viên chính". |
|  | `warning` | Nhóm vai trò hỗ trợ / tạm dừng: "Giáo viên hỗ trợ". |
|  | `purple` | Nhóm phân công không mang nghĩa trạng thái: "Đang chủ nhiệm". |
| `StatCard.Group` `columns` | số, mặc định 5 | Số cột của lưới; dưới 640px luôn 2 cột. |

## Cách dùng

React:
```js
h(ECOMD.StatCard.Group, null,
  h(ECOMD.StatCard, { label: 'Tổng giáo viên', value: 7, icon: 'user-tie' }),
  h(ECOMD.StatCard, { label: 'Đang làm việc', value: 5, icon: 'user-clock', tone: 'success' }))
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.StatCard" label="Đang làm việc" value="5" icon="user-clock" tone="success"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `label` | node | — | Nhãn chỉ số. |
| `value` | node | — | Con số. |
| `icon` | tên icon | — | Icon 14px bên phải số. |
| `tone` | `'neutral' \| 'success' \| 'info' \| 'warning' \| 'purple'` | `'neutral'` | Màu số và icon. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

`StatCard.Group`: `columns` (number, mặc định 5), `children`, `className`, `style`.

## Nội dung & quy tắc

Nhãn ngắn, hoa chữ đầu: "Tổng giáo viên". Số theo **Quy ước hiển thị số**.

**Nên:**
- Giữ cùng một tone cho cùng một ý nghĩa trên mọi trang.

**Không nên:**
- Dùng tone `danger` cho StatCard.
- Đặt quá 5 thẻ một hàng.

## Thông số

- Nền `bg-surface`, viền 1px `border-default`, bo `radius-12`, đệm `space-14`, không bóng.
- Nhãn `body-xs-medium` `text-subtle`; số `amount-sm`, chữ số đều độ rộng, cách nhãn `space-4`.
- Màu số / icon: neutral `text-heading` / `border-strong` · success `semantic-success` / `border-success-soft` · info `semantic-info` / `border-info-soft` · warning `semantic-warning` / `border-warning-soft` · purple `accent-purple` / `accent-purple-soft`.
- Lưới: gap `space-12`.
