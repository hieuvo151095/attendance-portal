# TeacherListPage

Mẫu màn Danh sách giáo viên dựng hoàn toàn từ component của DS: tham chiếu cho mọi màn danh sách của portal.

## Khi nào dùng

- **Dùng khi:** dựng một màn danh sách mới (Học sinh, Lớp học, Bình chọn…). Giữ đúng thứ tự và cách ghép khối.

## Cấu trúc

1. `AppShell` với `activeKey` của trang, `breadcrumb` (nhóm › trang).
2. `PageHeader`: tiêu đề, mô tả một dòng, hành động chính bên phải (một nút `primary`, các nút khác `secondary`).
3. Một `ecomd-table-card` chứa theo thứ tự: `Tabs` có số đếm (nếu dữ liệu có trạng thái) → toolbar (`SearchField` + `SelectField` + "Bộ lọc khác") → thanh chọn nhiều (`ecomd-table-card__bulk`, chỉ khi đang chọn) → bảng `ecomd-table` → `Pagination`.

## Nội dung & quy tắc

**Nên:**
- Gộp các thông tin phụ vào ô chính (mã, email dưới tên).
- Dùng `StatusTag` cho trạng thái, `Tag` cho lớp, mã; `EmptyValue` cho ô trống.
- Thao tác từng hàng gom vào `DataTable.RowAction` (menu ⋮).

**Không nên:**
- Thẻ số liệu trùng với số đếm của Tabs; select trạng thái trùng Tabs.
- Nhiều nút sửa / xóa rời trong một hàng.

## Thông số

Theo thông số của từng component; vùng nội dung theo `AppShell`.
