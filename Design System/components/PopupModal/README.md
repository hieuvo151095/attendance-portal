# PopupModal

Hộp thoại giữa màn có lớp phủ: đầu có icon, tiêu đề, mô tả và nút đóng; thân chứa nội dung; chân có hành động chính, nút đóng và hành động phụ bên trái.

## Khi nào dùng

- **Dùng khi:**
  - Thiết lập thêm trước khi áp dụng: "Bộ lọc nâng cao".
  - Xác nhận một hành động cần chú ý (xoá, hạ quyền).
- **Không dùng khi:**
  - Nội dung dài hoặc nhiều bước → trang riêng.
  - Danh sách hành động trên một hàng → `DropdownMenu`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `icon` | tên icon | Nhận diện loại hộp thoại: `filter` cho bộ lọc. |
| `description` | chuỗi | Một dòng nói rõ phạm vi dưới tiêu đề. |
| `primaryAction` | `{ label, icon? }` | Hành động chính: "Áp dụng" + `check`. |
| `secondaryAction` | mặc định "Đóng" | Nút ghost cạnh hành động chính; `null` để ẩn. |
| `extraAction` | `{ label, icon? }` | Hành động phụ nhẹ bên trái chân: "Đặt lại bộ lọc" + `arrow-rotate-right`. |
| `PopupModal.Section` | `label` | Nhóm tuỳ chọn có nhãn VIẾT HOA: "DỮ LIỆU LIÊN NGÀNH". |
| `inline` | `true` | Vẽ trong khung cha thay vì phủ cả màn — chỉ cho mockup. |

## Cách dùng

React:
```js
h(ECOMD.PopupModal, {
  open: isOpen, icon: 'filter', title: 'Bộ lọc nâng cao', description: 'Tùy chọn lọc nâng cao cho danh sách giáo viên',
  onClose: close,
  extraAction: { label: 'Đặt lại bộ lọc', icon: 'arrow-rotate-right', onClick: reset },
  primaryAction: { label: 'Áp dụng', icon: 'check', onClick: apply }
},
  h(ECOMD.PopupModal.Section, { label: 'Dữ liệu liên ngành' },
    h(ECOMD.Checkbox, { label: 'Đã đồng bộ CSDL Sở GD&ĐT', description: 'Chỉ lọc các giáo viên đã có mã định danh liên kết với Cơ sở dữ liệu ngành Giáo dục.', checked: synced, onChange: setSynced })))
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.PopupModal" icon="filter" title="Bộ lọc nâng cao" inline="{{yes}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `open` | boolean | `true` | Hiện / ẩn. |
| `icon` | tên icon | — | Icon cạnh tiêu đề. |
| `title` | node | — | Tiêu đề (`h3`, gắn `aria-labelledby`). |
| `description` | node | — | Mô tả một dòng. |
| `onClose` | function \| `false` | — | Nút X, phím Esc, bấm lớp phủ; `false` = ẩn nút X. |
| `primaryAction` | `{ label, icon?, onClick?, disabled? }` | — | Nút primary. |
| `secondaryAction` | `{ label, onClick? } \| null` | `{ label: 'Đóng', onClick: onClose }` | Nút ghost. |
| `extraAction` | `{ label, icon?, onClick? }` | — | Nút text bên trái. |
| `footer` | node | — | Thay toàn bộ chân. |
| `width` | number \| string | `448` | Rộng tối đa. |
| `closeOnOverlay` | boolean | `true` | Bấm lớp phủ để đóng. |
| `inline` | boolean | `false` | Vẽ trong khung cha. |
| `children` | node | — | Nội dung thân. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Tiêu đề trùng nhãn nút đã mở hộp thoại ("Bộ lọc nâng cao"). Nhãn hành động chính là động từ ngắn: "Áp dụng", "Lưu", "Xóa".

**Nên:**
- Một hành động chính bên phải, "Đóng" ngay bên trái nó.
- Thay đổi chỉ có hiệu lực khi bấm hành động chính; "Đóng" huỷ thay đổi chưa áp dụng.

**Không nên:**
- Mở hộp thoại chồng lên hộp thoại.
- Đặt nhiều hơn một nút primary.

## Thông số

- Lớp phủ: `bg-overlay`, làm mờ nền 4px, đệm `space-16`.
- Khung: rộng tối đa 448px, nền `bg-surface`, viền 1px `border-default`, bo `radius-16`, bóng `shadow-2xl`.
- Đầu: đệm `space-16` `space-24`, nền `bg-subtle`, viền dưới `border-subtle`; ô icon `size-40` bo `radius-12` nền `semantic-info-soft`, icon 16px `eco-blue-strong`; tiêu đề `title-md` `text-heading`; mô tả `body-xs` `text-subtle`; nút đóng `IconButton` `md`.
- Thân: đệm `space-24`, các khối cách nhau `space-20`.
- `Section`: đệm `space-16`, nền `bg-subtle`, viền 1px `border-default`, bo `radius-12`, cách nhau `space-12`; nhãn `overline-xs` `text-body` viết HOA.
- Chân: viền trên 1px `border-subtle`, đệm trên `space-16`; nút cách nhau `space-8`.
