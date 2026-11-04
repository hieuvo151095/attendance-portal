# Lịch sử thay đổi

Phiên bản ghi theo dạng `vX.Y.Z`:

- **Z — sửa**: sửa chữ, tài liệu, lỗi hiển thị. Không đổi tên hay giá trị token, component, prop.
- **Y — thêm**: thêm token, component, prop mới. Mọi thứ đang dùng vẫn chạy như cũ.
- **X — thay đổi lớn**: đổi tên, xoá hoặc đổi giá trị token, component, prop. Thiết kế và code đang dùng phải sửa theo.

Mỗi lần cập nhật DS: thêm một mục mới ở đầu danh sách dưới đây, và đặt nhãn của lần cập nhật đúng bằng số phiên bản.

## v2.5.1 — 02/11/2026

- **Sửa**: ô số có đơn vị (`ecomd-affix` + `.is-num`) chừa `size-40` bên phải để chữ đơn vị 2 ký tự (`cm`, `kg`) không dính vào số.

## v2.5.0 — 02/11/2026

Bổ sung cho các màn con nhóm Tài chính (hóa đơn, phiếu chi, đối soát, khoản phí, miễn giảm). Không có thay đổi lớn.

- **Ô nhập có đơn vị**: `ecomd-affix__suffix` đặt chữ đơn vị (`đ`, `%`) ở mép phải ô; ô `.is-num` trong `ecomd-affix` canh phải.
- **Chip** `ecomd-chip` (+ `__meta`): thẻ tròn nền `bg-muted` cho lớp hoặc học sinh đã chọn, kèm nút bỏ.
- **Tiến trình** `ecomd-timeline` (+ `__item`, `.is-done`, `__dot`, `__text`, `__title`, `__meta`): các bước duyệt nối bằng đường dọc `border-default`; bước xong chấm `semantic-success-soft`.
- **Bảng** `ecomd-table.is-fit`: tablet không giãn cột tối thiểu, dùng cho bảng ít cột ở trang chi tiết.
- **Bảng nhập liệu** `is-dense`: trên mobile ô chính và nút xóa chung một dòng; ô nhập trong cột chính rộng tối thiểu `size-sidebar-w × 5/4` trên màn lớn.
- **Tabs** `ecomd-tabs--segmented.is-block`: các mục co được để vừa màn hình hẹp.

## v2.4.0 — 02/11/2026

Bổ sung cho các màn con (biểu mẫu tạo mới, trang chi tiết, hộp thoại). Không có thay đổi lớn.

- **Biểu mẫu** (class trên thẻ HTML):
  - `ecomd-form`: xếp các field dọc, cách `space-16`.
  - `ecomd-field__req` (dấu * màu `text-danger`), `ecomd-field__meta` + `ecomd-field__count` (gợi ý bên trái, bộ đếm ký tự bên phải).
  - `SelectField` đặt trong `ecomd-field` tự giãn đủ bề rộng, cao `size-40`, nền `bg-surface`.
  - `ecomd-affix`: ô nhập kèm biểu tượng bên phải (ngày, giờ), ô nhập chừa `size-40` bên phải.
  - `ecomd-text.is-sm` (cao `size-32`), `.is-num` (canh giữa, số đều cột), `.is-invalid` (viền `semantic-danger`, nền `semantic-danger-soft`).
  - `ecomd-radio` / `ecomd-radios`: nút chọn một trong nhiều, hàng ngang.
  - `ecomd-choices` + `ecomd-choice` (+ `__icon`, `__text`, `__title`, `__desc`): thẻ lựa chọn có radio; đang chọn viền `eco-blue-strong`, nền `bg-selected`; mobile 1 cột.
  - `ecomd-dropzone` (+ `__icon`, `__title`): vùng kéo thả tệp, viền nét đứt `border-strong`.
  - `ecomd-file` (+ `__icon`, `__text`, `__name`, `__meta`): một dòng tệp đã đính kèm.
  - `ecomd-pick` (+ `.is-checked`, `__check`): ô chọn ảnh tỉ lệ 4 : 3.
  - `ecomd-form-footer` (+ `__note`, `__actions`): thanh lưu dính đáy trang; mobile trải sát mép, nút chia đều.
- **Lưới tiết học**: `ecomd-timetable` (cột tiết ghim trái khi cuộn ngang, `th.is-today`) và ô `ecomd-slot` (+ `__subject`, `__meta`, `.is-empty`, `.is-edit`).
- **Bảng nhập liệu**: `ecomd-table.is-dense` — tablet không giãn cột; mobile các ô xếp lưới 3 cột, ô `td.is-wide` chiếm cả dòng.
- **Tabs**: `ecomd-tabs--segmented.is-block` — các mục chia đều bề rộng.
- **Hiển thị theo màn hình**: `ecomd-only-mobile` / `ecomd-hide-mobile` (< 768px), `ecomd-only-compact` / `ecomd-hide-compact` (< 1280px).
- **PopupModal**: cao tối đa theo màn hình, phần thân tự cuộn (thanh cuộn chỉ hiện khi rê chuột), chân hộp thoại dính đáy; mobile thu lề `space-16`.

## v2.3.0 — 02/11/2026

Bổ sung cho nhóm màn Cấu hình. Không có thay đổi lớn.

- **Class biểu mẫu mới** (dùng trên thẻ HTML, chưa có component React):
  - `ecomd-field` + `ecomd-field__label` (`body-sm-medium`) + `ecomd-field__hint` (`body-xs`): nhãn, ô nhập, gợi ý xếp dọc, cách nhau `space-6`.
  - `ecomd-text`: ô nhập một dòng cao `size-40`, viền `border-default`, bo `radius-8`; `readonly` nền `bg-subtle`.
  - `ecomd-switch`: công tắc bật/tắt trên `input type="checkbox" role="switch"`, rộng `size-36`, cao `size-20`, bật màu `eco-blue-strong`.
  - `ecomd-setting` (+ `__text`, `__title`, `__desc`, `__control`): một dòng cài đặt gồm tên, mô tả bên trái, điều khiển bên phải; mobile xếp chồng.
  - `ecomd-dl`: danh sách nhãn – giá trị 2 cột (1 : 2) cho trang thông tin; mobile thành 1 cột.

## v2.2.1 — 02/11/2026

- **Thêm**: hàng tổng cộng cuối bảng `tr.is-total` (nền `bg-subtle`, viền trên `border-default`), dùng cho báo cáo học phí.

## v2.2.0 — 02/11/2026

Bổ sung cho nhóm màn Vận hành (điểm danh, hoạt động, thư viện ảnh, trao đổi, báo cáo). Không có thay đổi lớn.

- **Class bố cục mới**:
  - `ecomd-split is-aside`: cột nội dung chính 2 phần + cột phụ 1 phần (dòng hoạt động + bài học hôm nay); từ tablet trở xuống xếp chồng.
  - `ecomd-panes` + `ecomd-panes__pane`: khung danh sách + chi tiết cao bằng màn hình, có viền và bo `radius-12` (hộp thư, trao đổi); từ tablet trở xuống xếp chồng, cao theo nội dung.
  - `ecomd-scroll`: vùng cuộn dọc trong khung, thanh cuộn chỉ hiện khi rê chuột.
  - `ecomd-textarea`: ô nhập nhiều dòng cùng kiểu với SearchField (nền `bg-subtle`, viền `border-default`, focus viền `eco-blue-strong` 2px).
- **Sửa**: tên trong ô người của bảng (`DataTable.Person`) không xuống dòng.
- **Icon mới (15)**: `circle-minus`, `circle`, `image`, `user-group`, `face-smile`, `heart`, `quote-left`, `temperature-half`, `stethoscope`, `notes-medical`, `heart-pulse`, `capsules`, `grip`, `comments-dollar`, `circle-half-stroke`. Bộ `ECOMD.Icon` nay có 161 tên.

## v2.1.1 — 30/10/2026

- **Sửa**: thanh cuộn của bảng (cuộn ngang) và của menu SidebarNav mặc định trong suốt, chỉ hiện mảnh màu `border-strong` khi rê chuột hoặc focus vào vùng cuộn. Trước đây thanh cuộn mặc định của trình duyệt hiện thô dưới bảng ở tablet.

## v2.1.0 — 30/10/2026

Thêm responsive cho khung trang và các component danh sách. Không có thay đổi lớn: màn desktop (≥ 1280px) giữ nguyên.

- **Breakpoint**: desktop ≥ 1280px · tablet 768–1279px · mobile < 768px. Token mới `size-bp-tablet` (768px), `size-bp-desktop` (1280px); trong code dùng `ECOMD.BREAKPOINTS` và hook `ECOMD.useViewport()`.
- **AppShell** tự đổi bố cục theo bề rộng:
  - Tablet: menu luôn là thanh icon 72px; bấm mở rộng thì menu đè lên nội dung, có lớp phủ `bg-overlay`; thanh trên dính khi cuộn.
  - Mobile: menu ẩn vào ngăn kéo, mở bằng nút ☰ trên thanh trên; thanh trên chỉ còn tên trang, chuông, avatar.
  - Prop mới: `viewport`, `navOpen`, `defaultNavOpen`, `onNavOpenChange`.
- **AppHeader**: prop mới `onMenu` (nút ☰ "Mở menu").
- **SidebarNav**: prop mới `mode: 'drawer'` (nút cuối thành "Đóng menu"); tự cuộn tới mục đang chọn.
- **DataTable / bảng trong `ecomd-table-card`**:
  - Tablet: giữ dạng bảng, cuộn ngang; cột chọn và cột chính ghim trái, cột thao tác ghim phải.
  - Mobile: mỗi hàng thành một thẻ: ô chính ở trên, các cột còn lại thành cặp nhãn – giá trị.
  - Class mới cho ô: `is-primary`, `is-actions`, `ecomd-cell__label`, `ecomd-cell__value` (DataTable tự thêm; bảng viết tay cần thêm, xem README DataTable). Cột prop mới `actions`.
- **Class bố cục mới**: `ecomd-grid` (lưới `--ecomd-cols` cột; tablet dùng `--ecomd-cols-tablet`, mobile `--ecomd-cols-mobile`, mặc định 1) và `ecomd-split` (cột danh sách 2 phần + cột nội dung 3 phần; từ tablet trở xuống xếp chồng).
- **Mobile, các component khác**: PageHeader đưa nút xuống dòng và trải đủ bề rộng; thanh lọc tách ô tìm kiếm thành một dòng; Pagination bỏ chọn số dòng; StatCard 2 cột; PopupModal thành tấm trượt từ dưới lên.

## v2.0.0 — 30/10/2026

Đổi khung trang theo hướng "Portal trung tính" đã duyệt (bản 8): sidebar trắng chứa logo, lớp đang xem, đủ 42 mục, niên khóa và nút thu gọn; thanh trên mảnh chỉ còn vị trí trang, thông báo, tài khoản. Có thay đổi lớn: màn đang dùng `AppHeader` / `SidebarNav` bản cũ phải sửa theo mục **Cách chuyển**.

- **Component mới**:
  - `AppShell`: khung trang SidebarNav + AppHeader + vùng nội dung.
  - `Tabs`: lọc theo trạng thái có số đếm (gạch chân) và chế độ xem (`segmented`).
  - `Pagination`: chân bảng, số dòng mỗi trang, chuyển trang.
  - `Card`: khối nội dung có tiêu đề, mô tả, hành động.
  - `InlineNotice`: thông báo trong nội dung (info, warning, success, danger).
  - `Meter`: thanh tỉ lệ nhỏ trong bảng (sĩ số, tỉ lệ đã gán).
  - `PORTAL_NAV`: menu chuẩn 5 nhóm, 42 mục của ECO School Portal.
- **Thay đổi lớn**:
  - `SidebarNav`: thêm `brand`, `context`, `term`, `onToggleCollapse`, `defaultCollapsed`; `groups` không bắt buộc (mặc định `PORTAL_NAV`); bỏ `footer` (thay bằng `term`). Thu gọn giờ là thanh icon `size-sidebar-rail-w` thay vì ẩn hẳn; nút thu gọn nằm cố định ở cuối sidebar. Nhãn nhóm viết thường có hoa đầu câu.
  - `AppHeader`: chỉ còn `breadcrumb` / `title`, `notification`, `user`, `search`, `actions`. Bỏ `productName`, `context`, `tagline`, `logoIcon`, `onMenu`, `menuActive` (logo và lớp đang xem chuyển sang `SidebarNav`).
  - `SelectField` bọc trong `ecomd-select-wrap`, mũi tên là icon trong phần đệm phải (sửa mũi tên mặc định bị lệch sát mép).
  - Token `size-header-h` 64px → 56px, `size-sidebar-w` 256px → 240px.
- **Prop mới**: `FilterBar` `flush` (đặt trong card không viền).
- **Token mới**: `size-12`, `size-20`, `size-24`, `size-36`, `size-44`, `size-sidebar-rail-w`.
- **Class mới**: `ecomd-table-card__toolbar`, `ecomd-table-card__bulk`, `tr.is-selected`, `ecomd-sr` (chữ chỉ cho trình đọc màn hình).
- **Icon mới**: 65 icon (146 icon), gồm `angles-left`, `angles-right`, `thumbtack`, `paper-plane`, `file-pdf`, `file-excel`, `folder`, `table-cells`, `arrow-right-to-bracket`, `arrow-right-from-bracket`, `calendar-week`, `eye-slash`, `rotate-left`, `reply`, `flag`.

**Cách chuyển:** thay cặp `AppHeader` + `SidebarNav` bằng `AppShell` (truyền `activeKey`, `breadcrumb`, `user`, `context` = lớp đang xem, `term` = niên khóa / học kỳ). Thẻ số liệu trùng với trạng thái chuyển thành `Tabs` có số đếm trong `ecomd-table-card`.

## v1.1.0 — 28/10/2026

Bổ sung các phần chỉ hiện ra khi thao tác trên màn Danh sách giáo viên. Mọi thứ đang dùng vẫn chạy như cũ.

- **Component mới**:
  - `DropdownMenu`: menu thao tác hàng (Xem chi tiết hồ sơ, Phân công lớp học, Đổi email đăng nhập, đổi quyền, đổi trạng thái, Xóa giáo viên). `DataTable.RowAction` nhận `items` để mở menu.
  - `PopupModal`: hộp thoại "Bộ lọc nâng cao" — đầu có icon, tiêu đề, mô tả, nút đóng; `PopupModal.Section` cho nhóm tuỳ chọn; chân có `primaryAction`, `secondaryAction`, `extraAction`.
  - `EmptyState`: bảng không có kết quả ("Không tìm thấy giáo viên nào phù hợp"). `DataTable` thêm `emptyIcon`, `empty`.
- **Prop mới**: `Button` `variant` `ghost` ("Đóng") và `text` ("Đặt lại bộ lọc"), `active` + `indicator` (bộ lọc đang bật); `IconButton` `active`; `Checkbox` `description`; `FilterBar` `advanced.active`; `SidebarNav` `collapsed`; `AppHeader` `menuActive`.
- **Token mới**: `text-danger`, `title-md`, `overline-xs`, `space-20`, `size-30`, `radius-16`, `shadow-xl`, `shadow-2xl`.
- **Icon mới**: `shield-halved`, `trash-can`, `arrow-rotate-right` (81 icon).
- **Đổi giá trị** `bg-overlay`: `rgba(0,0,0,0.45)` → `rgba(15,23,42,0.5)` theo lớp phủ đang render. Trước bản này chưa component hay màn nào dùng token này, nên không có chỗ nào phải sửa.

## v1.0.0 — 28/10/2026

Phiên bản chính thức đầu tiên, chuẩn hoá cấu trúc theo [DS] ECO MERCHANT.

- **Token**: đặt tên lại theo quy ước chung của ECO (bảng bên dưới); 47 màu, 20 kiểu chữ, 2 font, 11 khoảng cách, 7 kích thước, 5 bo góc, 4 đổ bóng.
- **Font**: Inter 4.1 kèm file font (400 / 500 / 600 / 700 / 900) và giấy phép OFL; bỏ SF Pro và Be Vietnam Pro.
- **Component**: chuyển sang React (`window.ECOMD`), 16 component, có `index.d.ts`; preview chỉnh được thuộc tính.
- **Badge → StatusTag**: nền nhạt, viền và chữ đậm cùng tông, chữ đạt 4.5:1 ở mọi tone. Thêm tone `danger`.
- **Thêm**: `EmptyValue` (ô chưa có dữ liệu, tách từ Tag), `IconButton` (tách từ Button), `Button` `disabled`, `Checkbox` `indeterminate`, `DataTable` chọn hàng và `emptyText`, bộ icon 78 tên.
- **Tài liệu**: Quy ước dùng token, Quy ước hiển thị số, Lịch sử thay đổi; mục Accessibility gộp vào Quy ước dùng token › Cặp chữ và nền; README component theo một khung.

### Tên cũ → tên mới

Dành cho thiết kế và code dựng theo bản nháp trước 28/10/2026.

| Nhóm | Tên cũ | Tên mới |
|---|---|---|
| Màu ECO | `brand-blue` | `eco-blue-strong` |
|  | `brand-blue-hover` · `brand-blue-deep` | `eco-blue-hover` · `eco-blue-deep` |
|  | `brand-gold` · `brand-glyph` | `eco-yellow-strong` · `eco-yellow-light` |
|  | `artic-blue` · `deep-aqua` · `orange-citrus` | `eco-artic-blue` · `eco-deep-aqua` · `eco-orange-citrus` |
| Màu trạng thái | `success` · `success-ink` · `success-tint` · `success-line` | `semantic-success` · `semantic-success-strong` · `semantic-success-soft` · `border-success-soft` |
|  | `warning` · `warning-ink` · `warning-tint` · `warning-line` | `semantic-warning` · `semantic-warning-strong` · `semantic-warning-soft` · `border-warning-soft` |
|  | `info` · `info-line` | `semantic-info` · `border-info-soft` |
|  | `danger` | `semantic-danger` |
|  | `accent-purple-line` | `accent-purple-soft` |
| Chữ | `text-strong`, `text-ink` (`#1f1f1f`), `text-default` (`#1e293b`) | `text-heading` (`#0f172a`) — chữ nhập trong ô dùng `text-body` |
|  | `text-muted` (`#64748b`) | `text-subtle` |
|  | `text-subtle` (`#94a3b8`) | `text-muted` |
|  | `text-on-brand` | `text-inverse` |
| Nền | `surface-canvas` · `surface` · `surface-subtle` · `surface-muted` | `bg-canvas` · `bg-surface` · `bg-subtle` · `bg-muted` |
|  | `surface-row-hover` · `brand-blue-tint` · `info-tint` | `bg-row-hover` · `bg-selected` · `bg-info-tint` |
| Viền | `border` | `border-default` |
| Kiểu chữ | `page-title` · `brand-name` · `stat-value` | `h4` · `body-lg-bold` · `amount-sm` |
|  | `body` · `body-medium` · `label-strong` | `body-sm` · `body-sm-medium` · `body-sm-semibold` |
|  | `caption` · `caption-medium` · `caption-strong` · `table-head` | `body-xs` · `body-xs-medium` · `body-xs-semibold` · `body-xs-bold` |
|  | `micro` · `body-l` · `body-m` · `body-s` · `body-xs` (cũ) | `body-2xs` · `body-lg` · `body-md` · `body-sm` · `body-xs` |
| Font | `heading` | `sans` |
| Kích thước | `header-height` · `sidebar-width` | `size-header-h` · `size-sidebar-w` |
|  | `avatar-md` · `avatar-sm` · `icon-md` · `icon-sm` · `dot` | `size-40` · `size-32` · `size-16` · `size-14` · `size-8` |
| Đổ bóng | `shadow-hairline` | `shadow-xs` |
| Component | `Badge` | `StatusTag` |
|  | `Select` | `SelectField` |
|  | class `eco-*` | `window.ECOMD.<Comp>` (class `ecomd-*`) |

Chú ý hai tên đổi chiều: `text-muted` và `text-subtle` hoán đổi giá trị để khớp nghĩa với MERCHANT (`text-subtle` = nhãn, thông tin phụ; `text-muted` = thông tin không bắt buộc phải đọc).

### Đã bỏ

- Token không dùng: `primary-blue-hover`, `primary-yellow-hover`, `primary-yellow-active`, `eco-gold`, `semantic-green`, `color-danger`, `danger-bright`, `warning-text`, `border-neutral`, `pill-blue`, `pill-green`, `pill-amber`, `pill-amber-strong`, `pill-slate`, `shadow-xl`, `ring-focus`, `ring-avatar`, `ring-dot` (viền 2px viết trong component), `z-header`, `z-sidebar`.
- Thay đổi giá trị nhỏ khi gộp: `text-ink` `#1f1f1f` và `text-default` `#1e293b` → `#0f172a`; `shadow-hairline` → `shadow-xs`; `body-lg` 18/24 → 18/28; `h4` 24/30 · 700 (bản khai báo) → 24/32 · 900 (đúng tiêu đề trang đang render).
