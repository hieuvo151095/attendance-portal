# SearchField

Ô tìm kiếm có kính lúp bên trái: cỡ `md` trong trang (đầu FilterBar), cỡ `sm` trên AppHeader.

## Khi nào dùng

- **Dùng khi:**
  - Tìm bản ghi trong danh sách (giáo viên, học sinh, lớp).
  - Tìm chức năng trên AppHeader.
- **Không dùng khi:**
  - Chọn từ danh sách cố định → `SelectField`.
  - Nhập dữ liệu của form → ô nhập của form.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `size` | `md` (mặc định) | Trong trang; chữ `body-sm`, rộng tối thiểu 240px. |
|  | `sm` | Trên AppHeader; chữ `body-xs`, rộng 224px. |
| `block` | `true` | Rộng 100% khung chứa. |
| `state` | `focus` | Chỉ để vẽ trong mockup. |

## Cách dùng

React:
```js
h(ECOMD.SearchField, { placeholder: 'Tìm theo tên, mã NV, email, SĐT, CCCD...', value: q, onChange: setQ })
h(ECOMD.SearchField, { size: 'sm', placeholder: 'Tìm kiếm chức năng...' })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.SearchField" placeholder="Tìm theo tên, mã NV, email, SĐT, CCCD..."></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `size` | `'md' \| 'sm'` | `'md'` | Cỡ ô. |
| `placeholder` | string | `'Tìm kiếm...'` | Liệt kê trường tìm được. |
| `value` | string | — | Có kiểm soát (đi kèm `onChange`). |
| `defaultValue` | string | — | Không kiểm soát. |
| `onChange(value, e)` | function | — | Nhận chuỗi mới và event. |
| `label` | string | = `placeholder` | `aria-label` của ô. |
| `block` | boolean | `false` | Rộng 100%. |
| `state` | `'default' \| 'focus'` | `'default'` | Ép hiển thị trong mockup. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Màn dùng cung cấp: logic lọc và kết quả.

**Nên:**
- Placeholder liệt kê trường tìm được: "Tìm theo tên, mã NV, email, SĐT, CCCD...".

**Không nên:**
- Thêm nút xoá riêng; `type="search"` đã có sẵn.

## Thông số

- `md`: nền `bg-subtle`, viền 1px `border-default`, bo `radius-8`, đệm `space-8` `space-16`, đệm trái 36px chừa icon; icon 14px `text-muted` cách trái `space-14`.
- `sm`: nền `bg-muted`, đệm `space-6` `space-12`, icon cách trái `space-12`.
- Placeholder `text-muted`, chữ nhập `text-body`. Focus: nền `bg-surface`, viền 2px `eco-blue-strong`.
