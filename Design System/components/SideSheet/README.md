# SideSheet

Bảng trượt từ cạnh phải màn hình (Right-side Sheet / Drawer) dùng cho các tác vụ tạo mới, chỉnh sửa thông tin chi tiết, gán dữ liệu hoặc bộ lọc phức tạp nằm trọn trong không gian của module nghiệp vụ.

## Khi nào dùng

- **Dùng khi:**
  - Thêm mới hoặc chỉnh sửa dữ liệu (phòng ban, nhân sự, thẻ điểm danh, cuộc họp) mà người dùng vẫn muốn giữ ngữ cảnh của bảng dữ liệu bên trái.
  - Các biểu mẫu nhiều trường, chia nhiều phân đoạn cần diện tích cuộn dọc tối ưu.
- **Không dùng khi:**
  - Hộp thoại cảnh báo ngắn (xác nhận xóa, thông báo lỗi ngắn) → Dùng `PopupModal`.
  - Chọn giá trị đơn giản trong dòng → Dùng `SelectField` hoặc `DropdownMenu`.

## Biến thể & Thuộc tính

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `open` | boolean | `true` | Điều khiển đóng/mở SideSheet. |
| `icon` | IconName | — | Icon hiển thị bên trái tiêu đề. |
| `title` | ReactNode | — | Tiêu đề chính của bảng trượt. |
| `description` | ReactNode | — | Dòng diễn giải phụ bên dưới tiêu đề. |
| `onClose` | `() => void` \| `false` | — | Callback khi đóng (bấm xmark, bấm overlay, nhấn phím Escape). |
| `primaryAction` | `{ label, icon?, onClick?, disabled? }` | — | Nút hành động chính ở chân trang (Lưu, Thêm mới). |
| `secondaryAction` | `{ label, onClick? }` | `{ label: 'Đóng' }` | Nút phụ bên cạnh nút chính (Hủy, Đóng). |
| `extraAction` | `{ label, icon?, onClick?, disabled? }` | — | Nút bổ sung nằm góc trái chân trang. |
| `width` | number \| string | `520` | Độ rộng bảng trượt (mặc định 520px). |
| `fixed` | boolean | `false` | Cố định toàn màn hình (`position: fixed`) hoặc trong khung màn hình con (`position: absolute`). |
| `closeOnOverlay` | boolean | `true` | Cho phép bấm lớp phủ mờ để đóng. |

## Cấu trúc chuẩn

SideSheet gồm 3 phần:
1. **Header**: Icon bo tròn, tiêu đề `title-md`, mô tả ngắn `body-xs`, nút đóng `xmark`.
2. **Body**: Vùng nội dung cuộn độc lập, gồm các khối `SideSheet.Section` chia mục rõ ràng.
3. **Footer**: Ghim chân bảng, chứa nút hành động chính (Primary: `var(--eco-blue-strong)`) và nút hủy (Ghost).
