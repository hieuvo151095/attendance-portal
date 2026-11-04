# Quy ước dùng token

## Nguyên tắc chung

- Component và màn hình chỉ lấy giá trị qua token (`var(--<token>)`) và class kiểu chữ. Không viết mã hex, cỡ chữ hay khoảng cách bằng số trực tiếp.
- Chọn token theo **vai trò** (chữ, nền, viền, trạng thái), không chọn theo màu trông giống.
- Chưa có token phù hợp thì đề xuất thêm vào DS (xem mục cuối), không tự đặt giá trị riêng trong màn hình.

## Đặt tên

Cùng quy ước với [DS] ECO MERCHANT.

| Nhóm | Mẫu tên | Ví dụ |
|---|---|---|
| Màu ECO | `eco-<tên màu>`, thêm `-strong` / `-hover` / `-deep` / `-light` cho biến thể | `eco-blue`, `eco-blue-strong` |
| Màu trạng thái | `semantic-<trạng thái>`; `-strong` cho chữ trên nền nhạt; `-soft` cho nền nhạt | `semantic-success`, `semantic-success-strong`, `semantic-success-soft` |
| Màu nhấn dữ liệu | `accent-<màu>`, thêm `-soft` | `accent-purple` |
| Màu chữ, nền, viền | `text-<vai trò>`, `bg-<vai trò>`, `border-<vai trò>` | `text-subtle`, `bg-canvas`, `border-default` |
| Font | `font-<họ font>` | `font-sans`, `font-mono` |
| Kiểu chữ | `<vai trò>-<cỡ>`, thêm độ đậm `-medium` / `-semibold` / `-bold` | `body-sm`, `body-sm-semibold`, `h4` |
| Khoảng cách | `space-<px>` | `space-16` |
| Kích thước | `size-<px>`; khung app là `size-header-h`, `size-sidebar-w` | `size-32` |
| Bo góc | `radius-<px>`, `radius-full` | `radius-8` |
| Đổ bóng | `shadow-<cỡ>` | `shadow-sm` |

- Cỡ dùng chung một bộ: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.
- `text-body` là **màu** chữ; `body-sm` là **kiểu** chữ.

## Màu

### Màu ECO

| Token | Dùng cho |
|---|---|
| `eco-blue` | Màu thương hiệu: logo, icon thương hiệu |
| `eco-blue-strong` | Hành động chính và trạng thái đang chọn: nền nút chính, mục điều hướng đang chọn, viền focus, ô đã tick |
| `eco-blue-hover` | Nền nút chính khi hover |
| `eco-blue-deep` | Điểm cuối gradient của ô logo |
| `eco-yellow`, `eco-yellow-strong`, `eco-yellow-light` | Điểm nhấn thương hiệu: vòng avatar người đăng nhập, icon trên ô logo |
| `eco-artic-blue`, `eco-deep-aqua`, `eco-orange-citrus` | Màu phụ: khối màu, minh hoạ |

Màu ECO không dùng để báo trạng thái.

### Màu trạng thái

| Trạng thái | Màu chính | Chữ trên nền nhạt | Nền nhạt | Viền nhạt | Dùng khi |
|---|---|---|---|---|---|
| Thành công | `semantic-success` | `semantic-success-strong` | `semantic-success-soft` | `border-success-soft` | Đang hoạt động, hoàn tất |
| Cảnh báo, chờ | `semantic-warning` | `semantic-warning-strong` | `semantic-warning-soft` | `border-warning-soft` | Tạm dừng, chờ xử lý, cần chú ý |
| Thông tin | `semantic-info` | `semantic-info-strong` | `semantic-info-soft` | `border-info-soft` | Vai trò chính, đang xử lý |
| Lỗi, huỷ | `semantic-danger` | `semantic-danger-strong` | `semantic-danger-soft` | `border-danger-soft` | Lỗi, bị khoá, đã huỷ, báo mới |

- Màu chính dùng cho số liệu lớn (StatCard), icon, dấu hiệu; chữ nhỏ dùng bản `-strong` trên nền `-soft`.
- Không báo trạng thái chỉ bằng màu: luôn kèm chữ hoặc icon.
- Không dùng màu trạng thái để trang trí. Nhóm số liệu không mang nghĩa trạng thái dùng `accent-*`.
- Nhãn trạng thái của bản ghi: dùng component `StatusTag`.

### Màu chữ

| Token | Dùng cho |
|---|---|
| `text-heading` | Tiêu đề, tên sản phẩm, tên người, số liệu trung tính |
| `text-body` | Nội dung chính: ô bảng, chữ nhập, control |
| `text-nav` | Mục điều hướng, tiêu đề cột bảng |
| `text-subtle` | Nhãn, mô tả, thông tin phụ |
| `text-muted` | Thông tin phụ không bắt buộc phải đọc: placeholder, nhãn nhóm điều hướng, ô trống |
| `text-link` | Liên kết; mục menu khi hover |
| `text-danger` | Chữ và icon của hành động phá huỷ trong menu |
| `text-inverse` | Chữ và icon trên nền đậm |
| `text-disabled` | Chữ và icon của thành phần bị vô hiệu |

### Màu nền

| Token | Dùng cho |
|---|---|
| `bg-canvas` | Nền trang, nằm dưới header, sidebar và card |
| `bg-surface` | Nền khối nội dung: header, sidebar, card, ô nhập khi focus |
| `bg-subtle` | Nền phụ bên trong card: hàng tiêu đề và footer bảng, ô nhập, nút phụ |
| `bg-muted` | Hover trên nền trắng; nền tag, avatar chưa có ảnh |
| `bg-row-hover` | Hàng bảng khi hover |
| `bg-selected` | Mục điều hướng đang chọn |
| `bg-info-tint` | Nền avatar chữ cái đầu |
| `bg-overlay` | Lớp phủ mờ sau popup (kèm làm mờ nền 4px) |

### Màu viền

| Token | Dùng cho |
|---|---|
| `border-default` | Viền card, ô nhập, nút phụ, tag; đường ngăn header, sidebar, hàng tiêu đề bảng |
| `border-subtle` | Đường kẻ mảnh giữa các hàng bảng |
| `border-strong` | Viền checkbox chưa tick; icon trung tính mờ |
| `border-<trạng thái>-soft` | Viền tag và nhãn tông trạng thái; icon mờ trên StatCard |

### Cặp chữ và nền

Thông tin cần đọc phải đạt tương phản tối thiểu 4.5:1 (chữ từ 18px đậm trở lên: 3:1). Các cặp đạt:

| Nền | Chữ dùng được |
|---|---|
| `bg-surface` | `text-heading`, `text-body`, `text-nav`, `text-subtle`, `text-link`, `text-danger`, `semantic-info`, `accent-purple` |
| `bg-canvas`, `bg-subtle` | `text-heading`, `text-body`, `text-nav`, `text-subtle`, `text-link` |
| `bg-muted` | `text-heading`, `text-body`, `text-nav` |
| `semantic-*-soft` | `semantic-*-strong` cùng tông; `eco-blue-strong` trên `semantic-info-soft` (nút bộ lọc đang bật) |
| `eco-blue-strong`, `eco-blue-hover` | `text-inverse` |

- `semantic-success` và `semantic-warning` chỉ đạt mức chữ lớn (3.77:1 và 3.19:1): dùng cho số StatCard (20px đậm), không dùng cho chữ nhỏ.
- Icon và viền mang nghĩa cần tối thiểu 3:1 so với nền.

#### Cặp chưa đạt (giữ theo màn gốc)

| Chỗ dùng | Cặp hiện tại | Tỷ lệ | Mức cần | Hướng sửa |
|---|---|---|---|---|
| Placeholder, nhãn nhóm điều hướng, ô trống | `text-muted` trên `bg-surface` / `bg-subtle` | 2.56 / 2.45:1 | 4.5:1 | `text-subtle` |
| Icon mục điều hướng | `text-muted` trên `bg-surface` | 2.56:1 | 3:1 | `text-subtle` |
| Mục điều hướng đang chọn | `eco-blue-strong` trên `bg-selected` | 4.35:1 | 4.5:1 | chữ `eco-blue-hover` |
| Chữ cái đầu Avatar | `eco-blue-strong` trên `bg-info-tint` | 4.09:1 | 4.5:1 | chữ `eco-blue-hover` |
| `text-subtle` trên `bg-muted` | — | 4.34:1 | 4.5:1 | tránh cặp này, hoặc `text-nav` |
| Viền ô nhập, select, nút phụ | `border-default` trên `bg-surface` | 1.23:1 | 3:1 | viền `border-strong` hoặc đậm hơn cho control |
| Mục "Xóa" của menu khi hover | `text-danger` trên `semantic-danger-soft` | 4.41:1 | 4.5:1 | chữ `semantic-danger-strong` |
| Chữ EmptyState | `text-muted` trên `bg-surface` | 2.56:1 | 4.5:1 | `text-subtle` |

## Chữ

### Font

| Token | Dùng cho |
|---|---|
| `font-sans` | Font của mọi kiểu chữ: Inter, dự phòng bằng font hệ thống của máy |
| `font-mono` | Mã (kiểu `code`): font monospace của hệ thống |

Kiểu chữ đã gồm sẵn font; chỉ dùng `font-sans` riêng khi cần đặt họ font mà không đặt cỡ chữ.

### Kiểu chữ

| Token | Cỡ / line-height | Dùng cho |
|---|---|---|
| `h1` | 64 / 76 · 700 | Tiêu đề lớn nhất của trang |
| `h2` | 48 / 58 · 700 | Tiêu đề lớn |
| `h3` | 36 / 44 · 700 | Tiêu đề phần |
| `h4` | 24 / 32 · 900 | Tiêu đề trang (PageHeader) |
| `amount` | 32 / 48 · 700 | Số tiền lớn, nổi bật nhất màn |
| `amount-sm` | 20 / 28 · 700 | Số liệu StatCard |
| `title-md` | 16 / 24 · 700 | Tiêu đề popup |
| `body-lg` | 18 / 28 | Đoạn dẫn, nội dung nhấn |
| `body-md` | 16 / 22 | Nội dung dài, đoạn văn |
| `body-sm` | 14 / 20 | Ô bảng, mô tả, ô nhập — mức tối thiểu cho thông tin cần đọc |
| `body-xs` | 12 / 16 | Thông tin phụ: email, footer bảng, tag, chú thích |
| `body-2xs` | 11 / 16.5 | Chỉ cho chú thích ngắn (vai trò dưới tên người dùng) |
| `overline` | 11 / 16.5 · 700 | Nhãn nhóm điều hướng viết HOA |
| `overline-xs` | 12 / 16 · 600 | Nhãn nhóm tuỳ chọn trong popup, viết HOA |
| `code` | 12 / 16 · 600 · mono | Mã bản ghi |

Bản có sẵn độ đậm: `body-lg-bold`; `body-sm-medium` / `-semibold` / `-bold`; `body-xs-medium` / `-semibold` / `-bold`. Cỡ chữ, line-height và giới hạn sử dụng giống kiểu gốc.

- Chỉ dùng độ đậm 400, 500, 600, 700 (và 900 cho `h4`). Cần chữ đậm thì chọn bản có sẵn độ đậm, không viết `font-weight` chồng lên kiểu chữ.
- Không hạ line-height dưới mức token: line-height đã chừa chỗ cho dấu tiếng Việt.
- Số liệu, số tiền dùng chữ số đều độ rộng (`font-variant-numeric: tabular-nums`); cách viết số xem mục **Quy ước hiển thị số**.

## Khoảng cách

| Token | Giá trị | Dùng cho |
|---|---|---|
| `space-2` | 2px | Đệm dọc tag |
| `space-4` | 4px | Trong một dòng: icon với chữ, nhãn với số; giữa các mục điều hướng |
| `space-6` | 6px | Đệm dọc ô tìm cỡ nhỏ |
| `space-8` | 8px | Giữa các phần tử liên quan; đệm dọc control |
| `space-10` | 10px | Đệm ngang tag tông màu, nhãn trạng thái |
| `space-12` | 12px | Giữa các control, giữa các thẻ số liệu; đệm ngang mục điều hướng |
| `space-14` | 14px | Đệm thẻ số liệu, đệm dọc ô bảng |
| `space-16` | 16px | Đệm trong card; đệm ngang ô bảng |
| `space-20` | 20px | Giữa các khối trong thân popup |
| `space-24` | 24px | Giữa các phần lớn trong một màn; giữa các nhóm điều hướng |
| `space-32` | 32px | Lề vùng nội dung chính từ 1024px |
| `space-48` | 48px | Khoảng cách lớn giữa các khối |

- Phần tử càng liên quan thì đặt càng gần.

## Kích thước

| Token | Giá trị | Dùng cho |
|---|---|---|
| `size-8` | 8px | Chấm báo mới |
| `size-14` | 14px | Icon cỡ sm |
| `size-16` | 16px | Icon cỡ md |
| `size-30` | 30px | Icon trạng thái rỗng |
| `size-32` | 32px | Nút icon, avatar cỡ sm |
| `size-40` | 40px | Avatar cỡ md, ô logo, ô icon tiêu đề popup |
| `size-header-h` | 64px | Chiều cao AppHeader |
| `size-sidebar-w` | 256px | Chiều rộng SidebarNav |

- Ưu tiên để nội dung và `padding` quyết định kích thước; chỉ đặt kích thước cố định khi phần tử cần đúng khung (icon, avatar, nút icon).
- Được viết số trực tiếp, không cần token: đường kẻ 1px, viền focus 2px, làm mờ lớp phủ 4px, checkbox native 13px, chiều rộng cố định / tối thiểu / tối đa của ô tìm, nhóm tag, menu (224px) và popup (448px), và prop `size` dạng số của component (ví dụ `Icon`).

## Bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `radius-4` | 4px | Tag, tag mã |
| `radius-6` | 6px | Tag tông màu |
| `radius-8` | 8px | Nút, ô nhập, select, mục điều hướng |
| `radius-12` | 12px | Card, menu, ô logo, nhóm tuỳ chọn |
| `radius-16` | 16px | Popup |
| `radius-full` | 9999px | Nhãn trạng thái, chip, avatar, chấm |

- Khối càng lớn thì bo càng lớn. Các khối lồng nhau: bo góc trong nhỏ hơn bo góc ngoài.

## Đổ bóng

| Token | Dùng cho |
|---|---|
| `shadow-xs` | Nổi rất nhẹ: ô logo |
| `shadow-sm` | Thành phần nằm trên nền khi cần tách lớp |
| `shadow-md` | Thành phần nổi: menu thả, tooltip |
| `shadow-lg` | Thành phần nổi cần tách rõ khỏi nền |
| `shadow-xl` | Menu thả xuống |
| `shadow-2xl` | Lớp nổi cao nhất: popup |

- Card trong Dashboard không đổ bóng; phân tầng bằng nền và viền. Không dùng bóng thay cho viền.

## Thêm hoặc đổi token

1. Kiểm tra token sẵn có theo vai trò trước.
2. Nếu vẫn thiếu: nêu tên theo quy ước trên, giá trị, lý do và nơi dùng. Màu dùng cho chữ phải đạt 4.5:1 trên các nền nó sẽ nằm.
3. Đổi tên hoặc gộp token: cập nhật mọi component, preview và thiết kế đang dùng trong cùng một lần, không để tên cũ tồn tại song song; ghi vào **Lịch sử thay đổi**.
