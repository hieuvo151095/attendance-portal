# Avatar

Ảnh đại diện tròn của người; chưa có ảnh thì hiện chữ cái đầu của họ tên.

## Khi nào dùng

- **Dùng khi:**
  - Ô người trong `DataTable` (qua `DataTable.Person`), cỡ `md`.
  - Người đang đăng nhập trên `AppHeader`, cỡ `sm` có vòng.
- **Không dùng khi:**
  - Logo trường, logo sản phẩm → asset.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `size` | `md` (mặc định) · 40px | Trong bảng, danh sách. |
|  | `sm` · 32px | Trên AppHeader. |
| `ring` | `true` | Chỉ cho người đang đăng nhập. |
| `src` | url | Có ảnh; không có thì hiện chữ cái đầu. |

## Cách dùng

React:
```js
h(ECOMD.Avatar, { name: 'Nguyễn Thị Mai', src: url })
h(ECOMD.Avatar, { name: 'Đặng Hoài An' })                        // chữ "Đ"
h(ECOMD.Avatar, { name: 'Cô Nguyễn Thị Mai', size: 'sm', ring: true })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Avatar" name="Đặng Hoài An"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `src` | string | — | Ảnh vuông, ưu tiên khuôn mặt. |
| `name` | string | — | Họ tên: alt và nguồn chữ cái đầu. |
| `initials` | string | chữ đầu của `name` | Ghi đè chữ cái đầu. |
| `size` | `'md' \| 'sm'` | `'md'` | 40 / 32px. |
| `ring` | boolean | `false` | Vòng `eco-yellow-strong`. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Luôn truyền `name` để có alt và chữ cái đầu.

**Không nên:**
- Dùng `ring` cho người khác ngoài người đang đăng nhập.

## Thông số

- Bo `radius-full`, viền 1px `border-default`, nền chờ `bg-muted`; `md` `size-40`, `sm` `size-32`.
- Chữ cái đầu: nền `bg-info-tint`, chữ `eco-blue-strong`, `body-sm-bold` (`md`) / `body-xs-bold` (`sm`).
- `ring`: không viền, vòng 2px `eco-yellow-strong`.
