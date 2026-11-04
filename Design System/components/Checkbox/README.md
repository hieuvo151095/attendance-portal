# Checkbox

Ô tick native 13px để chọn hàng trong bảng; có thể kèm nhãn chữ.

## Khi nào dùng

- **Dùng khi:**
  - Chọn một hoặc nhiều hàng trong `DataTable` (cột đầu), chọn tất cả ở hàng tiêu đề.
  - Lựa chọn bật / tắt độc lập trong form.
- **Không dùng khi:**
  - Chọn một trong nhiều lựa chọn → `SelectField`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `checked` | `true` / `false` | Đã chọn / chưa chọn. |
| `indeterminate` | `true` | Chọn một phần: ô "Chọn tất cả" khi chỉ vài hàng được chọn. |
| `disabled` | `true` | Không cho chọn. |
| `label` | node | Có nhãn chữ bên phải; bỏ trống thì bắt buộc `aria-label`. |
| `description` | node | Tuỳ chọn cần giải thích: dòng mô tả dưới nhãn (trong PopupModal). |

## Cách dùng

React:
```js
h(ECOMD.Checkbox, { 'aria-label': 'Chọn giáo viên Nguyễn Thị Mai', checked: on, onChange: setOn })
h(ECOMD.Checkbox, { label: 'Đã đồng bộ CSDL Sở GD&ĐT', description: 'Chỉ lọc các giáo viên đã có mã định danh liên kết với Cơ sở dữ liệu ngành Giáo dục.' })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Checkbox" label="Đã đồng bộ CSDL Sở GD&ĐT" description="Chỉ lọc các giáo viên…"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `checked` | boolean | — | Có kiểm soát. |
| `defaultChecked` | boolean | — | Không kiểm soát. |
| `indeterminate` | boolean | `false` | Chọn một phần. |
| `disabled` | boolean | `false` | Vô hiệu. |
| `label` | node | — | Nhãn chữ. |
| `description` | node | — | Dòng mô tả dưới nhãn. |
| `aria-label` | string | — | Bắt buộc khi không có `label`. |
| `onChange(checked, e)` | function | — | Nhận trạng thái mới. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- `aria-label` nêu rõ đối tượng: "Chọn giáo viên Nguyễn Thị Mai".

**Không nên:**
- Dùng Checkbox để kích hoạt một hành động ngay; dùng `Button`.

## Thông số

- Checkbox native 13px, `accent-color: eco-blue-strong`. Nhãn `body-sm` `text-body`, cách ô `space-8`.
- Có `description`: checkbox căn đầu dòng (cách trên `space-2`), cách chữ `space-12`; nhãn `body-sm-medium` `text-heading`, mô tả `body-xs` `text-subtle`, cách nhãn `space-2`.
- Focus: viền 2px `eco-blue-strong`, cách 2px. Disabled: nhãn `text-disabled`.
