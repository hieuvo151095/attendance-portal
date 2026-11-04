# Tabs

Chuyển nhanh giữa các nhóm dữ liệu trong cùng một trang, thường kèm số đếm.

## Khi nào dùng

- **Dùng khi:**
  - Lọc theo trạng thái ở đầu bảng (Tất cả / Đang làm việc / Tạm nghỉ…): kiểu gạch chân trong `ecomd-table-card`.
  - Chọn chế độ xem (Năm / Tháng / Danh sách), lọc nhỏ trong một khối: kiểu `segmented`.
- **Không dùng khi:**
  - Điều hướng sang trang khác → `SidebarNav`.
  - Thẻ số liệu chỉ để xem → `StatCard`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `variant` | `underline` (mặc định) | Đầu bảng, có đường kẻ dưới. |
| | `segmented` | Nhóm nút nền xám, mục đang chọn nền trắng. |
| `items[].count` | số | Hiện số đếm; luôn đúng với dữ liệu sau khi tìm kiếm và lọc. |
| `items[].icon` | tên icon | Chế độ xem có icon. |

## Cách dùng

React:
```js
h(ECOMD.Tabs, { items: [{ key: 'all', label: 'Tất cả', count: 7 }, { key: 'active', label: 'Đang làm việc', count: 5 }], value: tab, onChange: setTab, label: 'Lọc theo trạng thái' })
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.Tabs" items="{{tabs}}" value="{{tab}}" on-change="{{setTab}}" label="Lọc theo trạng thái"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `items` | `Array<string \| { key, label, count?, icon? }>` | — | Các tab. |
| `value` / `defaultValue` | string | mục đầu | Tab đang chọn. |
| `onChange` | `(key) => void` | — | |
| `variant` | `'underline' \| 'segmented'` | `'underline'` | |
| `label` | string | — | `aria-label` của `tablist`. |

## Nội dung & quy tắc

Nhãn ngắn, viết thường có hoa đầu câu. Tab đầu thường là "Tất cả".

**Không nên:** dùng thêm select "Trạng thái" trùng với tab, hoặc thẻ số liệu trùng số đếm của tab.

## Thông số

- Gạch chân: tab cách nhau `space-24`, đệm dọc `space-14` / `space-12`, chữ `body-sm-medium` `text-subtle`; đang chọn `body-sm-semibold` `eco-blue-strong`, gạch 2px. Số đếm `body-xs-semibold`, nền `bg-muted` (đang chọn `bg-info-tint`), bo `radius-full`.
- Segmented: nền `bg-muted`, đệm `space-4`, bo `radius-8`; mục đệm `space-6` `space-12`, bo `radius-6`; đang chọn nền `bg-surface`, `shadow-xs`.
