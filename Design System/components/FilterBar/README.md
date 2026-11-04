# FilterBar

Card công cụ phía trên bảng: ô tìm kiếm, các bộ lọc nhanh, nút bộ lọc nâng cao bên trái và CTA chính bên phải.

## Khi nào dùng

- **Dùng khi:**
  - Đầu mọi trang danh sách, ngay trên `DataTable`.
- **Không dùng khi:**
  - Trang không có danh sách → đặt hành động ở `PageHeader` `actions`.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `search` | props / `false` | Có / không có ô tìm (SearchField `md`). |
| `filters` | danh sách props SelectField | Bộ lọc nhanh theo thuộc tính. |
| `advanced` | `{ label?, active?, onClick }` / `false` | Có bộ lọc nhiều điều kiện, mở `PopupModal`; `active` khi đang có bộ lọc nâng cao áp dụng. |
| `action` | `{ label, icon?, href?, onClick? }` | CTA chính của trang (Button primary, icon mặc định `plus`). |

## Cách dùng

React:
```js
h(ECOMD.FilterBar, {
  search: { placeholder: 'Tìm theo tên, mã NV, email, SĐT, CCCD...', value: q, onChange: setQ },
  filters: [{ options: ['Tất cả lớp học', 'Lớp 1A1'] }, { options: ['Tất cả trạng thái', 'Đang làm việc'] }],
  advanced: { onClick: openFilter },
  action: { label: 'Thêm giáo viên mới', href: '/teacher/create' }
})
```

Trên canvas:
```html
<x-import component-from-global-scope="ECOMD.FilterBar" action="{{ {label:'Thêm giáo viên mới'} }}" advanced="{{ {} }}"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `search` | `SearchFieldProps \| false` | `{}` | Ô tìm. |
| `filters` | `SelectFieldProps[]` | `[]` | Bộ lọc nhanh. |
| `advanced` | `{ label?, active?, onClick? } \| false` | — | Nút "Bộ lọc nâng cao" (Button secondary, `active` + `indicator`). |
| `action` | `{ label, icon?, href?, onClick? }` | — | CTA chính. |
| `children` | node | — | Control thêm, đặt sau bộ lọc. |
| `className`, `style` | | | Tuỳ biến bên ngoài. |

## Nội dung & quy tắc

**Nên:**
- Thứ tự: tìm kiếm → bộ lọc nhanh → bộ lọc nâng cao; CTA luôn bên phải.

**Không nên:**
- Đặt quá 3 bộ lọc nhanh; thêm vào "Bộ lọc nâng cao".
- Đặt hai nút `primary`.

## Thông số

- Card `bg-surface`, viền 1px `border-default`, bo `radius-12`, đệm `space-16`.
- Control cách nhau `space-12`, tự xuống dòng khi thiếu chỗ; ô tìm co giãn, tối đa 448px. CTA cách nhóm lọc `space-16`.
- Cách `DataTable` bên dưới `space-16`.
