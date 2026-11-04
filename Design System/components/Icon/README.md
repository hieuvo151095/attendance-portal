# Icon

Một component cho mọi icon UI đơn sắc của Dashboard: Font Awesome 6 Free, bộ Solid, tô bằng màu chữ đi kèm.

## Khi nào dùng

- **Dùng khi:**
  - Icon trong mục SidebarNav, nút, ô tìm kiếm, StatCard, thao tác hàng.
  - Cần một icon đứng riêng trong nội dung, có hoặc không có nhãn trợ năng.
- **Không dùng khi:**
  - Nút chỉ có icon → `IconButton` (đã gồm Icon, vùng bấm, hover, focus).
  - Ảnh minh hoạ, logo → asset.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `size` | `12` | Icon trong Button, StatusTag, mũi tên menu người dùng. |
|  | `14` | Icon ô tìm kiếm, StatCard, IconButton cỡ sm. |
|  | `16` (mặc định) | Mục SidebarNav, IconButton cỡ md. |
|  | `20` | Icon trên ô logo AppHeader. |
| `color` | token màu | Mặc định theo màu chữ; chỉ đặt khi icon cần màu khác chữ bên cạnh. |

## Cách dùng

React:
```js
h(ECOMD.Icon, { name: 'chalkboard-user' })                               // 16px, theo màu chữ
h(ECOMD.Icon, { name: 'circle-check', size: 14, color: 'var(--semantic-success)', title: 'Hoàn tất' })
ECOMD.Icon.names()                                                        // danh sách tên có sẵn
ECOMD.Icon.register({ 'star': [576, 512, 'M316.9 18…'] })                // thêm icon Font Awesome Free
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Icon" name="magnifying-glass" size="14"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `name` | tên icon | — | Tên Font Awesome (`magnifying-glass`) hoặc alias: `search`, `close`, `menu`, `more`, `add`, `edit`, `delete`, `success`, `error`, `info`, `warning`. Tên không có: ô giữ chỗ nét đứt cùng cỡ. |
| `size` | number | `16` | Khung size × size px. |
| `color` | string | `currentColor` | Ưu tiên token: `'var(--text-subtle)'`. |
| `title` | string | — | Nhãn trợ năng; bỏ trống = icon trang trí (`aria-hidden`). |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

Hàm tĩnh: `has(name)`, `names()`, `aliases()`, `register(map)`, `source`.

## Nội dung & quy tắc

**Nên:**
- Mỗi mục SidebarNav một icon riêng theo chức năng (Điểm danh `calendar-check`, Học phí `receipt`, Giáo viên `chalkboard-user`).
- Đặt `title` khi icon đứng một mình và mang nghĩa.

**Không nên:**
- Dùng emoji thay icon.
- Trộn bộ icon khác (outline, duotone) với Solid.
- Vẽ lại icon bằng tay khi tên đã có trong bộ.

## Thông số

- Bộ: Font Awesome 6 Free, Solid, v6.7.2 — 81 icon có sẵn (icon dùng trên màn Giáo viên, kể cả menu và hộp thoại, + icon UI chung). Icon phát hành theo CC BY 4.0: ghi nguồn "Font Awesome Free" trong màn giấy phép của sản phẩm.
- Tô `currentColor`, căn giữa dòng chữ (`vertical-align: -0.125em`). Ô giữ chỗ: viền 1px nét đứt `border-strong`, bo `radius-4`.
