# Pagination

Chân bảng: đang hiển thị dòng nào, số dòng mỗi trang và chuyển trang.

## Khi nào dùng

- **Dùng khi:** cuối mọi bảng danh sách trong `ecomd-table-card`, kể cả khi chỉ có một trang.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `pageSizes` | mảng số / `false` | Tuỳ chọn số dòng; `false` ẩn ô chọn. |
| `unit` | chuỗi | Đơn vị đếm: "giáo viên", "học sinh"… |

## Cách dùng

React:
```js
h(ECOMD.Pagination, { total: 48, page: 1, pageSize: 20, unit: 'giáo viên', onChange: setPage })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Pagination" total="{{total}}" page="{{page}}" page-size="{{size}}" unit="giáo viên"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `total` | number | `0` | Tổng số dòng sau khi lọc. |
| `page` | number | `1` | |
| `pageSize` | number | `20` | |
| `pageSizes` | `number[] \| false` | `[20, 50, 100]` | |
| `unit` | string | `'mục'` | |
| `onChange`, `onPageSizeChange` | function | — | |

## Thông số

- Đệm `space-12` `space-16`, viền trên `border-default`, chữ `body-sm` `text-subtle`, số `text-heading`.
- Nút trang `size-32`, bo `radius-8`, viền `border-default`; trang hiện tại viền và chữ `eco-blue-strong`.
