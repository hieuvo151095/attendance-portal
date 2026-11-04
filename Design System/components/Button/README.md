# Button

Nút hành động có nhãn chữ: CTA chính của trang ("Thêm giáo viên mới"), công cụ phụ ("Bộ lọc nâng cao"), nút đóng và hành động phụ nhẹ trong hộp thoại ("Đóng", "Đặt lại bộ lọc").

## Khi nào dùng

- **Dùng khi:**
  - Hành động chính của trang, đặt bên phải `FilterBar`.
  - Công cụ phụ cạnh bộ lọc, hoặc nút trong form, popup.
- **Không dùng khi:**
  - Nút chỉ có icon (menu, chuông, thao tác hàng) → `IconButton`.
  - Chuyển trang trong điều hướng chính → mục `SidebarNav`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `variant` | `primary` (mặc định) | Hành động chính, mỗi trang một nút: "Thêm giáo viên mới". |
|  | `secondary` | Công cụ phụ cạnh bộ lọc: "Bộ lọc nâng cao". |
|  | `ghost` | Nút đóng / huỷ cạnh hành động chính trong hộp thoại: "Đóng". |
|  | `text` | Hành động phụ nhẹ, ít dùng: "Đặt lại bộ lọc". |
| `active` + `indicator` | `true` (chỉ `secondary`) | Công cụ đang có giá trị áp dụng: "Bộ lọc nâng cao" khi đang lọc — nền xanh nhạt, chấm xanh sau nhãn. |
| `icon` + `iconPosition` | `left` (mặc định) | Icon cho hành động: `plus`, `filter`, `download`. |
|  | `right` | Icon cho mở tiếp / điều hướng: `chevron-right`, `arrow-up-right-from-square`. |
| `disabled` | `true` | Chưa đủ điều kiện thực hiện. |
| `block` | `true` | Nút rộng 100% khung chứa (form hẹp, popup). |
| `state` | `hover` · `focus` | Chỉ để vẽ trạng thái trong mockup; khi dùng thật đã tự có. |
| `href` | url | Nút chuyển trang; render `<a>`. |

## Cách dùng

React:
```js
h(ECOMD.Button, { icon: 'plus', href: '/teacher/create' }, 'Thêm giáo viên mới')
h(ECOMD.Button, { variant: 'secondary', icon: 'filter', onClick: openFilter }, 'Bộ lọc nâng cao')
h(ECOMD.Button, { variant: 'secondary', icon: 'filter', active: true, indicator: true }, 'Bộ lọc nâng cao')   // đang lọc
h(ECOMD.Button, { variant: 'ghost', onClick: close }, 'Đóng')
h(ECOMD.Button, { variant: 'text', icon: 'arrow-rotate-right', onClick: reset }, 'Đặt lại bộ lọc')
h(ECOMD.Button, { disabled: true }, 'Lưu')
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Button" icon="plus">Thêm giáo viên mới</x-import>
<x-import component-from-global-scope="ECOMD.Button" variant="secondary" icon="filter">Bộ lọc nâng cao</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'text'` | `'primary'` | Thứ bậc. Giá trị lạ về `primary`. |
| `active` | boolean | `false` | Chỉ `secondary`: đang bật; đặt `aria-pressed`. |
| `indicator` | boolean | `false` | Chấm 8px sau nhãn. |
| `icon` | tên icon | — | Icon 12px. |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Vị trí icon. |
| `block` | boolean | `false` | Rộng 100%. |
| `disabled` | boolean | `false` | Chặn bấm, đặt `disabled` + `aria-disabled`. |
| `state` | `'default' \| 'hover' \| 'focus'` | `'default'` | Ép hiển thị trong mockup. |
| `href` | string | — | Render `<a>` (bỏ qua khi `disabled`). |
| `onClick` | function | — | Xử lý bấm. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Kiểu `<button>`. |
| `aria-label` | string | — | Khi nhãn chữ chưa đủ rõ. |
| `children` | node | — | Nhãn nút. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Nhãn bắt đầu bằng động từ, viết hoa chữ đầu: "Thêm giáo viên mới", "Bộ lọc nâng cao".

**Nên:**
- Mỗi trang (và mỗi hộp thoại) một nút `primary`.
- Trong hộp thoại: `ghost` "Đóng" ngay bên trái `primary`; `text` ở mép trái chân.
- Icon trái cho hành động, icon phải cho mở tiếp.

**Không nên:**
- Đặt `primary` trên AppHeader; hành động thuộc về trang.
- Thêm màu nút mới cho một chỗ dùng.
- Dùng Button cho nút chỉ có icon.

## Thông số

- `primary`: nền `eco-blue-strong`, hover `eco-blue-hover`, chữ `text-inverse` `body-sm-semibold`, đệm `space-8` `space-16`.
- `secondary`: nền `bg-subtle`, viền 1px `border-default`, hover `bg-muted`, chữ `text-body` `body-sm-medium`, đệm `space-8` `space-12`.
- `ghost`: không nền, chữ `text-nav` `body-sm-medium`, đệm `space-8` `space-16`; hover nền `bg-muted`, chữ `text-heading`.
- `text`: không nền, chữ `text-subtle` `body-xs-medium`, đệm `space-8` `space-12`, khoảng icon – chữ `space-6`; hover chữ `text-heading`.
- `secondary` `active`: nền `semantic-info-soft`, viền `border-info-soft`, chữ `eco-blue-strong` (4.58:1). Chấm `indicator`: `size-8`, `eco-blue-strong`.
- `disabled`: nền `bg-muted`, chữ `text-disabled`, không viền.
- Bo `radius-8`, khoảng icon – chữ `space-8`, icon 12px. Focus: viền 2px `eco-blue-strong`. Đổi màu 150ms.
