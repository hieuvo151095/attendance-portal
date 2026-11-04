# AppShell

Khung trang chuẩn của portal: `SidebarNav` bên trái, `AppHeader` phía trên, vùng nội dung bên dưới.

## Khi nào dùng

- **Dùng khi:**
  - Dựng bất kỳ màn quản trị nào. Nội dung trang truyền vào làm `children`.
- **Không dùng khi:**
  - Màn đăng nhập, màn in, popup → không cần khung.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `activeKey` | key mục menu | Trang hiện tại, ví dụ `'kid'` cho Học sinh. |
| `collapsed` | `true` | Mở trang với menu đã thu gọn. |

## Cách dùng

React:
```js
h(ECOMD.AppShell, { activeKey: 'teacher', breadcrumb: ['Nhà trường', 'Giáo viên'], user: user, notification: true, context: ctx, term: term },
  h(ECOMD.PageHeader, { title: 'Giáo viên', description: '…' }),
  /* nội dung */)
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.AppShell" active-key="teacher" breadcrumb="{{crumbs}}" user="{{user}}" context="{{ctx}}" term="{{term}}">
  …nội dung trang…
</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `activeKey`, `nav`, `brand`, `context`, `term` | | | Chuyển cho `SidebarNav` (`nav` = `groups`). |
| `collapsed`, `defaultCollapsed`, `onToggleCollapse` | | | Trạng thái thu gọn menu. |
| `viewport` | `'desktop' \| 'tablet' \| 'mobile'` | tự động | Ép bố cục; bỏ trống thì theo bề rộng màn hình. |
| `navOpen`, `defaultNavOpen`, `onNavOpenChange` | boolean, function | `false` | Menu mở đè (tablet) hoặc ngăn kéo (mobile). |
| `breadcrumb`, `user`, `notification`, `search`, `headerActions` | | | Chuyển cho `AppHeader`. |
| `children` | node | — | Nội dung trang. |
| `contentStyle`, `className`, `style` | | | |

## Responsive

| Bề rộng | Menu | Thanh trên | Vùng nội dung |
|---|---|---|---|
| Desktop ≥ 1280px | Mở cạnh nội dung (240px), thu gọn được thành thanh icon 72px | Vị trí trang đầy đủ, tên + vai trò tài khoản | Đệm `space-24` `space-32` `space-32` |
| Tablet 768–1279px | Luôn là thanh icon 72px; bấm mở rộng thì đè lên nội dung, có lớp phủ | Như desktop, dính khi cuộn | Đệm `space-24` |
| Mobile < 768px | Ẩn; nút ☰ mở ngăn kéo 240px, nút cuối là "Đóng menu" | Nút ☰, tên trang, chuông, avatar | Đệm `space-16`, khối cách nhau `space-16` |

Không cần làm gì thêm: AppShell tự đổi theo bề rộng màn hình. Muốn ép một bố cục (ví dụ trong mockup) thì truyền `viewport`. `navOpen` / `defaultNavOpen` mở sẵn menu đè (tablet) hoặc ngăn kéo (mobile).

## Nội dung & quy tắc

Thứ tự nội dung chuẩn: `PageHeader` → (InlineNotice nếu cần) → khối chính (`ecomd-table-card` hoặc `Card`).

## Thông số

- Nền `bg-canvas`, cao tối thiểu một màn hình.
- Vùng nội dung: đệm `space-24` `space-32` `space-32`, các khối cách nhau `space-20`.
