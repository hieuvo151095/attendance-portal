# DropdownMenu

Menu thả xuống gồm các hành động trên một bản ghi: mục có icon, đường kẻ ngăn, và mục phá huỷ ở cuối. Dùng cho cột "Thao tác" của DataTable.

## Khi nào dùng

- **Dùng khi:**
  - Nhiều hành động trên một hàng bảng: "Xem chi tiết hồ sơ", "Phân công lớp học", "Xóa giáo viên".
  - Hành động phụ cần gom gọn sau một nút icon.
- **Không dùng khi:**
  - Chọn một giá trị để lọc → `SelectField`.
  - Chỉ có một hành động → `Button` hoặc `IconButton` riêng.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `trigger` | phần tử | Menu mở khi bấm trigger (thường `IconButton`); đóng khi bấm ra ngoài, nhấn Esc hoặc chọn mục. |
|  | bỏ trống | Chỉ vẽ khung menu, dùng trong mockup. |
| `item.tone` | `danger` | Hành động phá huỷ: "Xóa giáo viên". |
| `item.divider` | `true` | Đường kẻ tách nhóm, đặt trước mục phá huỷ. |
| `align` | `right` (mặc định) · `left` | Mép căn với trigger. |
| `hoverIndex` | số | Chỉ để vẽ hover trong mockup. |

Trong DataTable, truyền thẳng `items` cho `DataTable.RowAction`.

## Cách dùng

React:
```js
h(ECOMD.DataTable.RowAction, {
  label: 'Thao tác với giáo viên Nguyễn Thị Mai',
  items: [
    { icon: 'eye', label: 'Xem chi tiết hồ sơ', href: '/teacher/info/gv-001' },
    { icon: 'chalkboard-user', label: 'Phân công lớp học', onClick: assign },
    { icon: 'envelope', label: 'Đổi email đăng nhập', onClick: changeEmail },
    { icon: 'shield-halved', label: 'Hạ quyền: Giáo viên hỗ trợ', onClick: demote },
    { icon: 'user-clock', label: 'Chuyển sang Tạm nghỉ', onClick: pause },
    { divider: true },
    { icon: 'trash-can', label: 'Xóa giáo viên', tone: 'danger', onClick: confirmDelete }
  ]
})
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.DropdownMenu" items="{{items}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `items` | `Array<{ icon?, label, onClick?, href?, disabled?, tone? } \| { divider: true }>` | — | Các mục. |
| `trigger` | element | — | Phần tử mở menu; nhận thêm `aria-haspopup`, `aria-expanded`. |
| `align` | `'right' \| 'left'` | `'right'` | Mép căn. |
| `open` | boolean | — | Có kiểm soát. |
| `defaultOpen` | boolean | `false` | Không kiểm soát. |
| `onOpenChange(open)` | function | — | Nhận trạng thái mở mới. |
| `hoverIndex` | number | — | Ép hover trong mockup. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Nhãn bắt đầu bằng động từ, viết hoa chữ đầu. Mục đổi trạng thái nêu rõ kết quả: "Hạ quyền: Giáo viên hỗ trợ", "Chuyển sang Tạm nghỉ"; nhãn đổi theo trạng thái hiện tại của hàng ("Nâng quyền: Giáo viên chính", "Kích hoạt Đang làm việc").

**Nên:**
- Thứ tự: xem → chỉnh sửa → đổi quyền / trạng thái → (đường kẻ) → xoá.
- Mục phá huỷ luôn ở cuối, sau đường kẻ, và mở bước xác nhận trước khi xoá.

**Không nên:**
- Đặt quá 7 mục; tách bớt sang trang chi tiết.
- Dùng tone `danger` cho hành động không phá huỷ.

## Thông số

- Khung rộng 224px, nền `bg-surface`, viền 1px `border-default`, bo `radius-12`, bóng `shadow-xl`, đệm dọc `space-6`; cách trigger `space-4`.
- Mục: đệm `space-8` `space-16`, khoảng icon – chữ `space-10`, chữ `body-xs-medium` `text-body`, icon 14px `text-muted`. Hover: nền `bg-subtle`, chữ `text-link`.
- Mục `danger`: chữ và icon `text-danger`; hover nền `semantic-danger-soft`.
- Đường kẻ: 1px `border-subtle`, cách trên dưới `space-4`.
