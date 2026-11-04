# Tag

Nhãn chữ nhỏ cho tên lớp, mã và ngữ cảnh.

## Khi nào dùng

- **Dùng khi:**
  - Lớp phụ trách (`default`), nhiều tag xếp trong `DataTable.Tags`.
  - Mã nhân viên, mã bản ghi (`code`).
  - Lớp chủ nhiệm (`success`).
  - Chip ngữ cảnh cạnh tên sản phẩm trên AppHeader (`warning` + `pill`).
- **Không dùng khi:**
  - Trạng thái, phân quyền → `StatusTag`.
  - Ô chưa có dữ liệu → `EmptyValue`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `variant` | `default` (mặc định) | Tên lớp, nhãn ngắn trung tính. |
|  | `code` | Mã: "GV-2024-001". |
|  | `success` | Lớp chủ nhiệm. |
|  | `warning` | Ngữ cảnh đang làm việc (lớp hiện tại). |
| `pill` | `true` | Bo tròn hoàn toàn: chip ngữ cảnh trên AppHeader. |

## Cách dùng

React:
```js
h(ECOMD.DataTable.Tags, null, h(ECOMD.Tag, null, 'Lớp 1A1'), h(ECOMD.Tag, null, 'Lớp 1A2'))
h(ECOMD.Tag, { variant: 'code' }, 'GV-2024-001')
h(ECOMD.Tag, { variant: 'success' }, 'Lớp 1A1')
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Tag" variant="code">GV-2024-001</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `variant` | `'default' \| 'code' \| 'success' \| 'warning'` | `'default'` | Kiểu tag. |
| `pill` | boolean | `false` | Bo `radius-full`. |
| `label` | node | — | Chữ; có thể dùng `children`. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Chữ là tên riêng hoặc mã, không viết câu.

**Không nên:**
- Dùng màu `success` / `warning` cho nhãn không mang ý nghĩa đó.

## Thông số

- `default`: nền `bg-muted`, viền 1px `border-default`, chữ `body-xs` `text-body`, đệm `space-2` `space-8`, bo `radius-4`.
- `code`: như `default`, chữ `code` (mono 600).
- `success`: nền `semantic-success-soft`, viền `border-success-soft`, chữ `body-xs-semibold` `semantic-success-strong`, đệm `space-4` `space-10`, bo `radius-6`.
- `warning`: nền `semantic-warning-soft`, viền `border-warning-soft`, chữ `body-xs-semibold` `semantic-warning-strong`.
- `pill`: bo `radius-full`, đệm `space-2` `space-8`. Nhóm tag: gap `space-4`, rộng tối đa 200px.
