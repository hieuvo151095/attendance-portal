# AppHeader

Thanh trên cùng của vùng nội dung: vị trí trang (breadcrumb), thông báo và tài khoản.

## Khi nào dùng

- **Dùng khi:**
  - Đầu vùng nội dung của mọi màn quản trị, bên phải `SidebarNav`. Thường dùng qua `AppShell`.
- **Không dùng khi:**
  - Tiêu đề và hành động của trang → `PageHeader`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `breadcrumb` | mảng chuỗi hoặc `{ label, href }` | Vị trí trang, ví dụ `['Nhà trường', 'Giáo viên']`; mục cuối là trang hiện tại. |
| `notification` | `true` | Có thông báo chưa đọc: chấm đỏ trên chuông. |
| `user` | `{ name, role, avatar }` | Người đang đăng nhập. |
| `search` | props SearchField | Ô tìm chức năng (ẩn nếu bỏ trống). |
| `actions` | node | Nút phụ đặt trước chuông. |

## Cách dùng

React:
```js
h(ECOMD.AppHeader, { breadcrumb: ['Nhà trường', 'Giáo viên'], notification: true, user: { name: 'Nguyễn Thị Mai', role: 'GVCN Lớp 1A1' } })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.AppHeader" breadcrumb="{{crumbs}}" notification="{{yes}}" user="{{user}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `breadcrumb` | `Array<string \| { label, href? }>` | — | Vị trí trang. |
| `title` | string | — | Dùng khi không có breadcrumb. |
| `notification` | boolean | `false` | Chấm báo mới. |
| `onNotification` | function hoặc `false` | — | `false` ẩn chuông. |
| `user` | `{ name, role?, avatar? }` | — | Tài khoản. |
| `search` | SearchFieldProps | — | Ô tìm chức năng cỡ sm. |
| `actions` | node | — | Nút phụ. |
| `onMenu` | function | — | Hiện nút ☰ "Mở menu" bên trái. AppShell tự truyền ở mobile. |
| `className`, `style` | | | |

## Nội dung & quy tắc

Breadcrumb là tên nhóm menu rồi tên trang ("Nhà trường › Giáo viên"); màn chi tiết thêm cấp thứ ba là tên đối tượng.

**Nên:** để tên sản phẩm, logo và ngữ cảnh lớp trong `SidebarNav`.

**Không nên:** đặt nút thu gọn menu hay tagline sản phẩm trên thanh này.

## Thông số

- Cao `size-header-h`, đệm ngang `space-32`, nền `bg-surface`, viền dưới 1px `border-default`.
- Breadcrumb `body-sm` `text-subtle`, mục cuối `body-sm-medium` `text-heading`, ngăn bằng chevron 12px `text-muted`, khoảng `space-8`.
- Tài khoản: Avatar sm, tên `body-sm-medium`, vai trò `body-2xs` `text-subtle`, chevron 12px; hover nền `bg-muted`, bo `radius-8`.
