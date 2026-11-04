# PageHeader

Tiêu đề trang và một câu mô tả phạm vi, đặt đầu vùng nội dung.

## Khi nào dùng

- **Dùng khi:**
  - Đầu mọi trang trong vùng nội dung chính.
- **Không dùng khi:**
  - Tiêu đề một khối trong trang → tiêu đề của card / khối đó.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `description` | chuỗi | Trang cần một câu nói rõ phạm vi quản lý. |
| `actions` | node | Ít dùng; hành động chính thường nằm ở `FilterBar`. |

## Cách dùng

React:
```js
h(ECOMD.PageHeader, { title: 'Danh Sách Giáo Viên', description: 'Quản lý đội ngũ giảng dạy, phân công chủ nhiệm, tài khoản đăng nhập và phân quyền kiểm duyệt.' })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.PageHeader" title="Danh Sách Giáo Viên" description="Quản lý đội ngũ giảng dạy…"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `title` | node | — | Tiêu đề trang (`h1`). |
| `description` | node | — | Một câu mô tả. |
| `actions` | node | — | Nút bên phải. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Tiêu đề viết Hoa Mỗi Chữ: "Danh Sách Giáo Viên". Mô tả một câu, nêu những gì quản lý trên trang.

**Không nên:**
- Viết mô tả nhiều câu hoặc hướng dẫn thao tác.

## Thông số

- Tiêu đề `h4` `text-heading`; mô tả `body-sm` `text-subtle`, cách tiêu đề `space-4`. Khối kế tiếp cách `space-24`.
