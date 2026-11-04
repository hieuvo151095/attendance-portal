# DataTable

Bảng danh sách trong card: hàng tiêu đề, cột chọn hàng, ô người, Tag, StatusTag, ô trống, thao tác và footer đếm.

## Khi nào dùng

- **Dùng khi:**
  - Danh sách bản ghi cần so sánh theo cột: giáo viên, học sinh, lớp, khoản phí.
- **Không dùng khi:**
  - Vài dòng nhãn – giá trị của một bản ghi → trang chi tiết.
  - Chỉ số tóm tắt → `StatCard`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `selectable` | `true` | Có thao tác hàng loạt: cột checkbox đầu bảng, ô "chọn tất cả" có trạng thái chọn một phần. |
| `footer` | node | Đếm bản ghi, phân trang. |
| `emptyText` + `emptyIcon` | chữ, icon | Bảng không có hàng: hiện `EmptyState`. |
| `RowAction` `items` | danh sách mục | Cột "Thao tác" mở `DropdownMenu`. |
| `column.align` | `right` | Cột số, cột "Thao tác". |
| `hoverIndex` | số | Chỉ để vẽ hover trong mockup. |

Phần con: `DataTable.Person` (ô người), `DataTable.Tags` (nhóm Tag), `DataTable.RowAction` (nút thao tác hàng, có `items` thì mở `DropdownMenu`).

## Cách dùng

React:
```js
h(ECOMD.DataTable, {
  rowKey: 'id', selectable: true, selected: sel, onSelect: setSel,
  rowLabel: r => 'Chọn giáo viên ' + r.name,
  columns: [
    { key: 'code', title: 'Mã nhân viên', render: r => r.code ? h(ECOMD.Tag, { variant: 'code' }, r.code) : h(ECOMD.EmptyValue, { italic: true }, 'Chưa có mã nhân viên') },
    { key: 'name', title: 'Họ và tên', render: r => h(ECOMD.DataTable.Person, { name: r.name, meta: r.email, avatar: r.photo, href: r.url }) },
    { key: 'status', title: 'Trạng thái', render: r => h(ECOMD.StatusTag, { tone: 'success' }, r.status) },
    { key: 'act', title: 'Thao tác', align: 'right', actions: true, render: r => h(ECOMD.DataTable.RowAction, { label: 'Thao tác với giáo viên ' + r.name, items: menuFor(r) }) }
  ],
  rows: teachers, emptyText: 'Không tìm thấy giáo viên nào phù hợp', emptyIcon: 'user-tie',
  footer: h('div', null, 'Hiển thị ', h('b', null, teachers.length), ' giáo viên')
})
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.DataTable" columns="{{columns}}" rows="{{rows}}" selectable="{{yes}}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `columns` | `Array<{ key, title, align?, width?, render?, actions? }>` | — | Cột; `render(row, i)` trả về nội dung ô. Cột đầu là ô chính; `actions: true` (hoặc bỏ trống `title`) là cột thao tác — dùng cho bố cục tablet / mobile. |
| `rows` | array | — | Dữ liệu. |
| `rowKey` | string \| function | chỉ số | Khoá hàng. |
| `selectable` | boolean | `false` | Cột chọn hàng. |
| `selected` | array | `[]` | Khoá các hàng đang chọn. |
| `onSelect(keys)` | function | — | Nhận danh sách khoá mới. |
| `rowLabel(row)` | function | — | `aria-label` checkbox từng hàng. |
| `selectAllLabel` | string | `'Chọn tất cả'` | `aria-label` ô chọn tất cả. |
| `footer` | node | — | Nội dung footer. |
| `emptyText` | node | `'Không có dữ liệu'` | Chữ của EmptyState khi không có hàng. |
| `emptyIcon` | tên icon | `'magnifying-glass'` | Icon của EmptyState. |
| `empty` | node | — | Thay toàn bộ nội dung khi rỗng. |
| `hoverIndex` | number | — | Ép hover trong mockup. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

Tiêu đề cột viết hoa chữ đầu: "Mã nhân viên", "Lớp chủ nhiệm". Footer đếm bằng câu: "Hiển thị **7** giáo viên".

**Nên:**
- Ô thiếu dữ liệu dùng `EmptyValue` ("Chưa …"), không để trống.
- Cột "Thao tác" luôn ở cuối, căn phải.

**Không nên:**
- Đặt nút chữ trong mỗi hàng; gom vào `RowAction`.

## Responsive

- **Tablet (768–1279px)**: giữ dạng bảng, cuộn ngang trong card. Cột chọn + cột đầu (`is-primary`) ghim trái, cột thao tác (`is-actions`) ghim phải, có đường viền 1px `border-default` ngăn phần cuộn.
- **Mobile (< 768px)**: mỗi hàng là một thẻ. Hàng đầu thẻ: ô chọn, ô chính, nút thao tác; bên dưới mỗi cột còn lại là một dòng nhãn (`body-xs-medium` `text-subtle`) bên trái, giá trị bên phải. Thẻ đệm `space-14` `space-12`, các dòng cách nhau `space-8`.
- `DataTable` tự thêm class và nhãn. Bảng viết tay (`table.ecomd-table`) cần tự thêm:

```html
<th class="body-xs-bold is-primary">Giáo viên</th> … <th class="body-xs-bold is-right is-actions"><span class="ecomd-sr">Thao tác</span></th>
<td class="body-sm is-primary"><div class="ecomd-cell__value">…ô chính…</div></td>
<td class="body-sm"><span class="ecomd-cell__label body-xs-medium" aria-hidden="true">Chủ nhiệm</span><div class="ecomd-cell__value">Lớp 1A1</div></td>
<td class="body-sm is-right is-actions"><div class="ecomd-cell__value">…RowAction…</div></td>
```

## Thông số

- Card `bg-surface`, viền 1px `border-default`, bo `radius-12`; bảng tràn ngang thì cuộn trong card.
- Hàng tiêu đề: nền `bg-subtle`, viền dưới `border-default`; ô `body-xs-bold` `text-nav`, đệm `space-12` `space-16`.
- Ô dữ liệu: `body-sm` `text-body`, đệm `space-14` `space-16`; hàng cách nhau bằng 1px `border-subtle`; hover nền `bg-row-hover`.
- Bảng rỗng: một ô trải hết các cột chứa `EmptyState`; footer vẫn hiện ("Hiển thị **0** giáo viên").
- Cột chọn rộng `size-40`. Ô người: Avatar `md`, cách chữ `space-12`; tên `body-sm-medium` `text-heading` (hover `text-link`), dòng phụ `body-xs` `text-subtle`.
- Footer: đệm `space-12` `space-16`, nền `bg-subtle`, viền trên `border-default`, chữ `body-xs` `text-subtle`, số `text-body`.
