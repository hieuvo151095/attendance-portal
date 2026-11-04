# EmptyState

Khối báo không có kết quả: icon mờ và một câu, đặt giữa vùng nội dung trống.

## Khi nào dùng

- **Dùng khi:**
  - Bảng hoặc danh sách không có hàng nào sau khi tìm kiếm / lọc (DataTable tự dùng qua `emptyText`, `emptyIcon`).
- **Không dùng khi:**
  - Một ô trong bảng thiếu dữ liệu → `EmptyValue`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `icon` | tên icon | Icon theo đối tượng của danh sách: `user-tie` cho giáo viên. |
|  | `false` | Vùng quá thấp, chỉ cần chữ. |

## Cách dùng

React:
```js
h(ECOMD.EmptyState, { icon: 'user-tie' }, 'Không tìm thấy giáo viên nào phù hợp')
h(ECOMD.DataTable, { columns, rows, emptyText: 'Không tìm thấy giáo viên nào phù hợp', emptyIcon: 'user-tie' })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.EmptyState" icon="user-tie">Không tìm thấy giáo viên nào phù hợp</x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `icon` | tên icon \| `false` | `'magnifying-glass'` | Icon 30px. |
| `label` | node | — | Câu thông báo; có thể dùng `children`. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Một câu nêu đúng điều không có: "Không tìm thấy giáo viên nào phù hợp".

**Không nên:**
- Dùng minh hoạ màu hoặc emoji.

## Thông số

- Căn giữa, đệm `space-48` `space-16`, khoảng icon – chữ `space-8`.
- Icon `size-30` màu `border-strong`; chữ `body-sm` `text-muted`.
