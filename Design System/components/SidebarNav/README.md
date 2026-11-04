# SidebarNav

Điều hướng dọc của portal: logo, lớp đang xem, đủ các nhóm chức năng, niên khóa / học kỳ và nút thu gọn.

## Khi nào dùng

- **Dùng khi:**
  - Điều hướng chính bên trái mọi màn quản trị. Thường dùng qua `AppShell`, không cần gắn tay.
- **Không dùng khi:**
  - Chuyển giữa các phần trong một trang → `Tabs`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `groups` | bỏ trống | Dùng menu chuẩn `ECOMD.PORTAL_NAV` (5 nhóm, 42 mục). |
| `activeKey` | key hoặc label | Mục của trang hiện tại, ví dụ `'teacher'` hoặc `'Giáo viên'`. |
| `context` | `{ label, value, short, options, onChange }` | Ô chọn lớp đang xem dưới logo; khi thu gọn còn ô `short` ("1A1"). |
| `term` | `{ year, term }` | Niên khóa và học kỳ đang áp dụng ở chân sidebar. |
| `collapsed` | `true` | Thu gọn thành thanh 72px chỉ còn icon. Bỏ trống để component tự giữ trạng thái. |
| `hoverKey` | key hoặc label | Chỉ để vẽ hover trong mockup. |

## Cách dùng

React:
```js
h(ECOMD.SidebarNav, {
  activeKey: 'teacher',
  context: { label: 'Lớp đang xem', value: 'Lớp 1A1', short: '1A1', options: ['Lớp 1A1', 'Lớp 1A2'] },
  term: { year: '2026 – 2027', term: 'Học kỳ I' }
})
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.SidebarNav" active-key="teacher" context="{{ctx}}" term="{{term}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `groups` | `Array<{ label, items }>` | `PORTAL_NAV` | Mục `{ key?, icon, label, href?, onClick? }`. |
| `activeKey` | string | — | Mục đang chọn (theo `key` hoặc `label`). |
| `brand` | `{ name, icon?, logoSrc?, href? }` | `{ name: 'ECO School' }` | Logo và tên sản phẩm. |
| `context` | object | — | Ô chọn ngữ cảnh (lớp đang xem). |
| `term` | `{ year, term? }` | — | Dòng niên khóa, học kỳ ở chân. |
| `collapsed` / `defaultCollapsed` | boolean | `false` | Trạng thái thu gọn (có / không điều khiển). |
| `onToggleCollapse` | `(collapsed) => void` hoặc `false` | — | Bấm nút thu gọn; `false` ẩn nút. |
| `mode` | `'inline' \| 'drawer'` | `'inline'` | `'drawer'`: ngăn kéo trên mobile, nút cuối thành "Đóng menu". AppShell tự đặt. |
| `hoverKey`, `label`, `className`, `style` | | | |

## Nội dung & quy tắc

Nhãn nhóm viết thường có hoa đầu câu ("Vận hành", "Học tập", "Tài chính", "Nhà trường", "Cấu hình"). Nhãn mục ngắn một dòng; được dùng viết tắt quen thuộc ("BC Điểm danh", "Sổ tay PH").

**Nên:**
- Giữ đủ mục theo phân quyền người dùng; chỉ danh sách mục cuộn, đầu và chân sidebar đứng yên.
- Nút thu gọn / mở rộng luôn ở một chỗ: dòng cuối sidebar.

**Không nên:**
- Chọn nhiều mục cùng lúc, lồng mục con nhiều cấp.
- Đặt thêm nút thu gọn ở chỗ khác (header, cạnh logo).

## Thông số

- Rộng `size-sidebar-w`; thu gọn `size-sidebar-rail-w`, chuyển động 200ms. Cao bằng màn hình, ghim khi cuộn. Nền `bg-surface`, viền phải 1px `border-default`.
- Đầu: đệm `space-16` `space-12` `space-12`; logo `size-32` bo `radius-8`, tên `title-md`; ô lớp cao `size-40`, viền `border-default`, bo `radius-8`, chữ `body-sm-semibold`.
- Mục: cao `size-40`, đệm ngang `space-16`, bo `radius-8`, icon 16px `text-subtle`, chữ `body-sm-medium` `text-body`. Hover: nền `bg-muted`. Đang chọn: nền `bg-selected`, chữ + icon `eco-blue-strong`, vạch 3px ở mép trái sidebar.
- Mọi icon (logo, ô lớp, mục, lịch, nút thu gọn) cùng một cột dọc ở cả hai trạng thái: khi thu gọn chỉ chữ biến mất.
- Chân: viền trên `border-default`, đệm `space-12`; dòng năm học `body-xs-semibold` + "Đang trong Học kỳ I" `body-xs` có chấm `semantic-success`.
