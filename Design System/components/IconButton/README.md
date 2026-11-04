# IconButton

Nút chỉ có icon, khung 32px: mở menu, thông báo, thao tác trên hàng bảng.

## Khi nào dùng

- **Dùng khi:**
  - Nút trên AppHeader: mở menu (`bars`), thông báo (`bell`, kèm chấm báo mới).
  - Cột "Thao tác" của DataTable (`ellipsis-vertical`).
- **Không dùng khi:**
  - Hành động cần nhãn chữ để hiểu → `Button`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `size` | `sm` (mặc định) · icon 14px | Thao tác hàng trong bảng, trong card. |
|  | `md` · icon 16px | Nút trên AppHeader. |
| `badge` | `true` | Có mục mới chưa xem (chuông thông báo). |
| `active` | `true` | Đang bật: nút menu khi SidebarNav đang thu gọn. |
| `disabled` | `true` | Không thao tác được. |
| `state` | `hover` · `focus` | Chỉ để vẽ trong mockup. |

## Cách dùng

React:
```js
h(ECOMD.IconButton, { icon: 'bell', size: 'md', label: 'Thông báo', badge: true })
h(ECOMD.IconButton, { icon: 'ellipsis-vertical', label: 'Thao tác với giáo viên Nguyễn Thị Mai', onClick: openMenu })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.IconButton" icon="bell" size="md" label="Thông báo" badge="{{yes}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `icon` | tên icon | — | Icon hiển thị. |
| `label` | string | — | Bắt buộc: `aria-label` và tooltip. |
| `size` | `'sm' \| 'md'` | `'sm'` | Cỡ icon 14 / 16px; khung luôn 32px. |
| `badge` | boolean | `false` | Chấm `semantic-danger` góc trên phải. |
| `active` | boolean | — | Đang bật; đặt `aria-pressed`. |
| `disabled` | boolean | `false` | Chặn bấm. |
| `state` | `'default' \| 'hover' \| 'focus'` | `'default'` | Ép hiển thị trong mockup. |
| `href` | string | — | Render `<a>`. |
| `onClick` | function | — | Xử lý bấm. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- `label` nêu rõ đối tượng: "Thao tác với giáo viên Nguyễn Thị Mai", không chỉ "Thao tác".

**Không nên:**
- Dùng chấm báo mới để trang trí; chỉ bật khi thật sự có mục chưa xem.

## Thông số

- Khung `size-32`, bo `radius-8`, nền trong suốt; icon `text-subtle`.
- Hover và `active`: nền `bg-muted`, icon `text-body`. Focus: viền 2px `eco-blue-strong`. Disabled: icon `text-disabled`.
- Chấm báo mới: `size-8`, `semantic-danger`, vòng 2px `bg-surface`, cách góc `space-6`.
