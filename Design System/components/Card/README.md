# Card

Khối nội dung nền trắng có tiêu đề, mô tả và hành động tuỳ chọn.

## Khi nào dùng

- **Dùng khi:** nội dung không phải bảng: cài đặt, bài viết, lịch, cây danh mục.
- **Không dùng khi:** bảng dữ liệu → `ecomd-table-card` (Tabs + toolbar + bảng + Pagination).

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `flush` | `true` | Thân không đệm (danh sách, lưới chạm mép). |

## Cách dùng

React:
```js
h(ECOMD.Card, { title: 'Thông tin trường', description: 'Hiển thị trên ứng dụng phụ huynh', actions: h(ECOMD.Button, { variant: 'secondary', icon: 'pen' }, 'Chỉnh sửa') }, nội dung)
```

Trên canvas: dùng class `ecomd-card` cho khung, hoặc `x-import` `ECOMD.Card` với `title`, `description`.

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `title`, `description` | node | — | |
| `actions` | node | — | Bên phải đầu khối. |
| `flush` | boolean | `false` | |
| `bodyStyle`, `className`, `style` | | | |

## Thông số

- Nền `bg-surface`, viền 1px `border-default`, bo `radius-12`.
- Đầu: đệm `space-16` (không đệm dưới), tiêu đề `title-md` `text-heading`, mô tả `body-xs` `text-subtle`. Thân đệm `space-16`.
