# SelectField

Select native dùng làm bộ lọc nhanh; lựa chọn đầu tiên là "Tất cả …".

## Khi nào dùng

- **Dùng khi:**
  - Lọc danh sách theo một thuộc tính có ít giá trị: lớp, phân quyền, trạng thái.
- **Không dùng khi:**
  - Tìm theo chữ tự do → `SearchField`.
  - Lọc nhiều điều kiện cùng lúc → nút "Bộ lọc nâng cao" (`Button` secondary).

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `disabled` | `true` | Bộ lọc chưa áp dụng được. |
| `state` | `focus` | Chỉ để vẽ trong mockup. |

## Cách dùng

React:
```js
h(ECOMD.SelectField, { options: ['Tất cả trạng thái', 'Đang làm việc', 'Tạm nghỉ', 'Đã nghỉ việc'], value: status, onChange: setStatus })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.SelectField" options="{{['Tất cả lớp học','Lớp 1A1','Lớp 1A2']}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `options` | `Array<string \| {value, label}>` | — | Lựa chọn; phần tử đầu là mặc định. |
| `value` | string | — | Có kiểm soát. |
| `defaultValue` | string | — | Không kiểm soát. |
| `onChange(value, e)` | function | — | Nhận giá trị mới. |
| `label` | string | nhãn lựa chọn đầu | `aria-label`. |
| `disabled` | boolean | `false` | Vô hiệu. |
| `state` | `'default' \| 'focus'` | `'default'` | Ép hiển thị trong mockup. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Lựa chọn mặc định viết "Tất cả …": "Tất cả lớp học", "Tất cả phân quyền", "Tất cả trạng thái".

**Không nên:**
- Dùng cho danh sách dài cần tìm kiếm.

## Thông số

- Nền `bg-subtle`, viền 1px `border-default`, bo `radius-8`, đệm `space-8` `space-12`; chữ `body-sm-medium` `text-body`.
- Focus: viền 2px `eco-blue-strong`. Disabled: chữ `text-disabled`.
- Mũi tên là icon `chevron-down` 12px `text-subtle`, đặt trong phần đệm phải `space-32`, cách mép `space-12` (từ v2.0.0; trước đó dùng mũi tên mặc định của trình duyệt nên lệch theo từng trình duyệt).
