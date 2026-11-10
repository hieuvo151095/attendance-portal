import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeManagement } from '../pages/organization/EmployeeManagement';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';

describe('Giao diện Quản Lý Nhân Sự (ORG-02: Employee Management UI)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    departmentService.resetMockData();
    employeeService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Hiển thị tiêu đề, thẻ tóm tắt số liệu và danh sách nhân sự ban đầu', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Quản Lý Hồ Sơ Nhân Sự/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Tổng nhân sự')).toBeInTheDocument();
    expect(screen.getAllByText('Đã đồng bộ đến Camera').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chưa đồng bộ đến Camera').length).toBeGreaterThanOrEqual(1);

    // Check pre-seeded employee names
    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Check table headers and attendance method icons
    expect(screen.getAllByText('Mã NV & CCCD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Liên lạc').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chức danh & Phòng ban').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hình thức điểm danh').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Mã thẻ').length).toBeGreaterThanOrEqual(1);

    // Kiểm tra cột Liên lạc hiển thị email và số điện thoại
    expect(screen.getByText('an.nguyen@ubnd.gov.vn')).toBeInTheDocument();
    expect(screen.getByText('0903 111 222')).toBeInTheDocument();

    // Nguyễn Văn An (đã có Face ID, Vân tay, Thẻ) hiển thị đủ 3 icon
    expect(screen.getByTestId('method-faceId-emp-ubnd-01')).toBeInTheDocument();
    expect(screen.getByTestId('method-fingerprint-emp-ubnd-01')).toBeInTheDocument();
    expect(screen.getByTestId('method-card-emp-ubnd-01')).toBeInTheDocument();

    // Hoàng Văn Đức (chưa đồng bộ camera, chưa có Face ID, chưa có Thẻ) thì KHÔNG hiển thị bất kỳ phương thức nào -> "Chưa kích hoạt"
    expect(screen.queryByTestId('method-card-emp-ubnd-03')).not.toBeInTheDocument();
    expect(screen.queryByTestId('method-faceId-emp-ubnd-03')).not.toBeInTheDocument();
    expect(screen.queryByTestId('method-fingerprint-emp-ubnd-03')).not.toBeInTheDocument();
    expect(screen.getByText('Chưa kích hoạt')).toBeInTheDocument();
  });

  it('Tìm kiếm nhân sự theo họ tên cập nhật danh sách bảng tức thì', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên, mã NV, CCCD/i);
    fireEvent.change(searchInput, { target: { value: 'Phạm Thị Cúc' } });

    await waitFor(() => {
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
      expect(screen.queryByText('Đ/c Nguyễn Văn An')).not.toBeInTheDocument();
      expect(screen.queryByText('Ông Hoàng Văn Đức')).not.toBeInTheDocument();
    });
  });

  it('Thêm nhân sự mới qua EmployeeModal và hiển thị ngay trên bảng', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thêm nhân sự mới')).toBeInTheDocument();
    });

    // Bấm nút thêm mới
    fireEvent.click(screen.getByText('Thêm nhân sự mới'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/VD: NV-001, BCD-042/i)).toBeInTheDocument();
    });

    // Nút Thêm nhân sự bị vô hiệu hóa khi chưa điền đủ các trường bắt buộc
    const submitBtn = screen.getByRole('button', { name: /^Thêm nhân sự$/i });
    expect(submitBtn).toBeDisabled();

    // Nhãn "Số CCCD" và lưu ý đồng bộ mới
    expect(screen.getByText('Số CCCD')).toBeInTheDocument();
    expect(screen.getByText(/Ảnh khuôn mặt có thể nạp trực tiếp qua Portal để điểm danh Face ID/i)).toBeInTheDocument();

    // Điền thông tin nhân viên
    fireEvent.change(screen.getByPlaceholderText(/VD: NV-001, BCD-042/i), {
      target: { value: 'NV-TEST-01' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: Nguyễn Văn An/i), {
      target: { value: 'Lê Văn Luyện' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: 079085001234/i), {
      target: { value: '079099887766' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: Chuyên viên, Bác sĩ/i), {
      target: { value: 'Cán bộ Địa chính' }
    });

    // Khi đã điền đủ thông tin bắt buộc, nút Thêm nhân sự được kích hoạt
    expect(submitBtn).not.toBeDisabled();

    // Bấm nút lưu
    fireEvent.click(submitBtn);

    // Xác nhận đã lưu thành công và xuất hiện trên bảng
    await waitFor(() => {
      expect(screen.getByText('Lê Văn Luyện')).toBeInTheDocument();
      expect(screen.getByText('NV-TEST-01')).toBeInTheDocument();
      expect(screen.getByText('079099887766')).toBeInTheDocument();
    });
  });

  it('Mở modal Cập nhật hồ sơ nhân sự và tùy chỉnh hình thức điểm danh cho phép thành công', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    });

    // Bấm vào nút Thao tác (ba chấm) của hàng Nguyễn Văn An (hàng đầu tiên)
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    expect(actionBtns.length).toBeGreaterThan(0);
    fireEvent.click(actionBtns[0]);

    // Bấm nút Chỉnh sửa hồ sơ trong menu thao tác
    const editBtn = screen.getByRole('menuitem', {
      name: /Chỉnh sửa hồ sơ/i
    });
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Cập nhật hồ sơ nhân sự', { selector: 'h3' })
      ).toBeInTheDocument();
      expect(screen.getByText('Hình thức điểm danh cho phép')).toBeInTheDocument();
      expect(screen.getByLabelText('Cho phép điểm danh bằng Face ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Cho phép điểm danh bằng Vân tay')).toBeInTheDocument();
      expect(screen.getByLabelText('Cho phép điểm danh bằng Thẻ nhân sự')).toBeInTheDocument();
    });

    // Tắt tùy chọn Face ID
    const faceIdCheckbox = screen.getByLabelText('Cho phép điểm danh bằng Face ID');
    fireEvent.click(faceIdCheckbox);

    // Bấm nút Lưu thay đổi
    const saveBtn = screen.getByRole('button', {
      name: /Lưu thay đổi/i
    });
    fireEvent.click(saveBtn);

    // Chờ modal đóng
    await waitFor(() => {
      expect(screen.queryByText('Cập nhật hồ sơ nhân sự', { selector: 'h3' })).not.toBeInTheDocument();
    });

    // Kiểm tra icon Face ID của nhân viên emp-ubnd-01 được cập nhật trạng thái tắt
    const faceIdIconContainer = screen.getByTestId('method-faceId-emp-ubnd-01');
    expect(faceIdIconContainer).toHaveAttribute('title', expect.stringContaining('tạm tắt'));
  });

  it('Nhân sự chưa có Face ID hoặc Thẻ thì modal khóa toggle và hiển thị ghi chú nhắc nhở rõ ràng', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Bấm vào nút Thao tác của Hoàng Văn Đức (hàng thứ 3)
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtns[2]);

    const editBtn = screen.getByRole('menuitem', {
      name: /Chỉnh sửa hồ sơ/i
    });
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText('Cập nhật hồ sơ nhân sự', { selector: 'h3' })).toBeInTheDocument();
      // Ghi chú nhắc nhở hiển thị rõ ràng
      expect(screen.getByText(/Chưa có ảnh khuôn mặt — Hãy tải ảnh chân dung/i)).toBeInTheDocument();
      expect(screen.getByText(/Chưa cấp thẻ nhân sự — Cần cấp thẻ tại mục Quản lý thẻ/i)).toBeInTheDocument();
    });

    // Checkbox Face ID và Thẻ bị vô hiệu hóa (disabled)
    const faceIdInput = screen.getByLabelText(/Chưa có dữ liệu Face ID/i);
    expect(faceIdInput).toBeDisabled();
    expect(faceIdInput).not.toBeChecked();

    const cardInput = screen.getByLabelText(/Chưa cấp thẻ nhân sự/i);
    expect(cardInput).toBeDisabled();
    expect(cardInput).not.toBeChecked();

    // Checkbox Vân tay cũng bị khóa do chưa đồng bộ Camera và chưa lấy mẫu vân tay trên máy
    const fingerprintInput = screen.getByLabelText(/Chưa có dữ liệu vân tay/i);
    expect(fingerprintInput).toBeDisabled();
    expect(fingerprintInput).not.toBeChecked();
    expect(
      screen.getByText(/Chưa đồng bộ đến Camera — Cần đồng bộ hồ sơ nhân sự/i)
    ).toBeInTheDocument();
  });

  it('Mở modal Nhập từ Excel và import thành công danh sách nhân viên qua 3 bước (Tải lên -> Kiểm tra & Xác nhận -> Hoàn tất)', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Nhập từ Excel')).toBeInTheDocument();
    });

    // Bấm nút Nhập từ Excel
    fireEvent.click(screen.getByText('Nhập từ Excel'));

    // BƯỚC 1: Hiển thị thanh 3 bước, nút Tải file mẫu, và danh sách xem trước
    await waitFor(() => {
      expect(screen.getByText('1. Tải lên dữ liệu')).toBeInTheDocument();
      expect(screen.getByText('Tải file mẫu')).toBeInTheDocument();
      expect(screen.getByText('Xem trước danh sách (3 nhân sự chuẩn bị nhập):')).toBeInTheDocument();
      expect(screen.getByText('Trần Văn Bình')).toBeInTheDocument();
      expect(screen.getByText('Lê Thị Diệu')).toBeInTheDocument();
    });

    // Bấm nút "Tiếp tục kiểm tra dữ liệu" để sang Bước 2
    const step1NextBtn = screen.getByRole('button', {
      name: /Tiếp tục kiểm tra dữ liệu/i
    });
    fireEvent.click(step1NextBtn);

    // BƯỚC 2: Review dữ liệu và hiển thị nút "Xác nhận nạp"
    await waitFor(() => {
      expect(screen.getByText('2. Kiểm tra & Xem lại')).toBeInTheDocument();
      expect(screen.getByText(/Danh sách nhân sự hợp lệ/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', {
      name: /Xác nhận nạp/i
    });
    fireEvent.click(confirmBtn);

    // BƯỚC 3: Hiển thị kết quả hoàn tất
    await waitFor(() => {
      expect(screen.getByText('3. Hoàn tất')).toBeInTheDocument();
      expect(screen.getByText(/Nạp dữ liệu nhân sự thành công!/i)).toBeInTheDocument();
      expect(screen.getByText(/Toàn bộ 3 nhân sự hợp lệ đã được đồng bộ/i)).toBeInTheDocument();
    });

    // Bấm nút "Hoàn tất" để đóng modal
    const finishBtn = screen.getByRole('button', { name: /^Hoàn tất$/i });
    fireEvent.click(finishBtn);

    // Kiểm tra nhân viên mới import xuất hiện trên bảng chính
    await waitFor(() => {
      expect(screen.getByText('Trần Văn Bình')).toBeInTheDocument();
      expect(screen.getByText('Lê Thị Diệu')).toBeInTheDocument();
    });
  });

  it('Bước 2 kiểm tra trùng lặp: hiển thị bảng lỗi ở trên cùng với các thẻ trạng thái Trùng mã NV, Trùng CCCD, Trùng Email, Trùng Số ĐT', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Nhập từ Excel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nhập từ Excel'));

    await waitFor(() => {
      expect(screen.getByText('Dữ liệu có lỗi trùng lặp (Mã NV, CCCD, Email, SĐT)')).toBeInTheDocument();
    });

    // Chọn bộ dữ liệu thử nghiệm có lỗi trùng lặp
    fireEvent.click(screen.getByText('Dữ liệu có lỗi trùng lặp (Mã NV, CCCD, Email, SĐT)'));

    // Chuyển sang Bước 2
    const step1NextBtn = screen.getByRole('button', {
      name: /Tiếp tục kiểm tra dữ liệu/i
    });
    fireEvent.click(step1NextBtn);

    // Chờ Bước 2 hiển thị bảng lỗi nổi bật ở trên cùng
    await waitFor(() => {
      expect(screen.getByText(/Phát hiện 4 dòng dữ liệu lỗi \/ trùng lặp/i)).toBeInTheDocument();
    });

    // Kiểm tra các nhãn lỗi nổi bật
    expect(screen.getAllByText('Trùng mã NV').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trùng CCCD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trùng Số ĐT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Trùng Email').length).toBeGreaterThanOrEqual(1);

    // Bảng hợp lệ vẫn hiển thị ở phía dưới với 1 nhân sự hợp lệ
    expect(screen.getByText(/Danh sách nhân sự hợp lệ \(1\/5 nhân sự\)/i)).toBeInTheDocument();
    expect(screen.getByText('Đỗ Kim Phượng')).toBeInTheDocument();

    // Bấm nút "Xác nhận nạp" để chỉ nạp dòng hợp lệ
    const confirmBtn = screen.getByRole('button', {
      name: /Xác nhận nạp \(1 nhân sự\)/i
    });
    fireEvent.click(confirmBtn);

    // Bước 3 xác nhận chỉ nạp thành công 1 nhân sự và bỏ qua 4 dòng lỗi
    await waitFor(() => {
      expect(screen.getByText('Nạp dữ liệu nhân sự thành công!')).toBeInTheDocument();
      expect(screen.getByText('Bỏ qua do lỗi / trùng')).toBeInTheDocument();
    });
  });

  it('Thêm nhân sự mới có ảnh chân dung: kích hoạt sẵn Face ID mà không cần chụp tại camera Hikvision', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thêm nhân sự mới')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Thêm nhân sự mới'));

    await waitFor(() => {
      expect(screen.getByText('Ảnh chân dung nhận diện khuôn mặt (Face ID)')).toBeInTheDocument();
    });

    // Điền thông tin nhân viên
    fireEvent.change(screen.getByPlaceholderText(/VD: NV-001, BCD-042/i), {
      target: { value: 'NV-FACE-01' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: Nguyễn Văn An/i), {
      target: { value: 'Nguyễn Thanh Tùng' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: 079085001234/i), {
      target: { value: '079088776655' }
    });
    fireEvent.change(screen.getByPlaceholderText(/VD: Chuyên viên, Bác sĩ/i), {
      target: { value: 'Cán bộ CNTT' }
    });

    // Chọn nhanh 1 ảnh chân dung mẫu
    const samplePhotoBtn = screen.getByRole('button', { name: /Cán bộ Nam 1/i });
    fireEvent.click(samplePhotoBtn);

    // Xác nhận đã nhận ảnh chân dung và Face ID được kích hoạt sẵn
    await waitFor(() => {
      expect(screen.getByText('Ảnh chân dung hợp lệ cho Face ID')).toBeInTheDocument();
      expect(screen.getByText(/Đã có ảnh khuôn mặt — Sẵn sàng đồng bộ đến Camera AI/i)).toBeInTheDocument();
    });

    // Checkbox Face ID được bật sẵn
    const faceCheckbox = screen.getByLabelText('Cho phép điểm danh bằng Face ID');
    expect(faceCheckbox).toBeChecked();
    expect(faceCheckbox).not.toBeDisabled();

    // Checkbox Vân tay vẫn khóa do chưa lấy mẫu tại thiết bị Hikvision
    const fpCheckbox = screen.getByLabelText(/Chưa có dữ liệu vân tay/i);
    expect(fpCheckbox).toBeDisabled();

    // Lưu nhân viên
    const submitBtn = screen.getByRole('button', { name: /^Thêm nhân sự$/i });
    fireEvent.click(submitBtn);

    // Xác nhận nhân viên đã được thêm và hiển thị trên bảng
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Thanh Tùng')).toBeInTheDocument();
      expect(screen.getByText('NV-FACE-01')).toBeInTheDocument();
    });
  });

  it('Quy trình 3 bước Đồng bộ dữ liệu đến Camera AI: kiểm tra danh sách chưa đồng bộ, bỏ chọn, xem lại, thực hiện đồng bộ và xem màn hình Kết quả', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Đồng bộ dữ liệu đến Camera/i)).toBeInTheDocument();
    });

    // 1. Kiểm tra huy hiệu số lượng chưa đồng bộ có nền tròn màu đỏ
    const unsyncedBadge = screen.getByTestId('unsynced-badge');
    expect(unsyncedBadge).toBeInTheDocument();
    expect(unsyncedBadge).toHaveTextContent('4');
    expect(unsyncedBadge).toHaveStyle({ backgroundColor: '#ef4444' });

    // 2. Kiểm tra cột Thao tác đã xóa hành động "Đồng bộ đến Camera AI"
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtns[0]);
    expect(screen.queryByText(/Đồng bộ đến Camera AI/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Đồng bộ lại đến Camera/i)).not.toBeInTheDocument();

    // Bấm nút "Đồng bộ dữ liệu đến Camera" trên thanh công cụ
    fireEvent.click(screen.getByText(/Đồng bộ dữ liệu đến Camera/i));

    // BƯỚC 1: Hiển thị danh sách cán bộ chưa đồng bộ
    await waitFor(() => {
      expect(screen.getByText('Đồng Bộ Dữ Liệu Đến Camera AI')).toBeInTheDocument();
      expect(screen.getByText('Bước 1: Chọn cán bộ')).toBeInTheDocument();
      expect(screen.getByText('Bước 2: Xem lại & Đồng bộ')).toBeInTheDocument();
    });

    // Kiểm tra Hoàng Văn Đức chưa đủ điều kiện (thiếu cả ảnh và thẻ) nên bị khóa checkbox
    expect(screen.getByText('Chưa đủ điều kiện (Thiếu ảnh & thẻ)')).toBeInTheDocument();
    const ducCheckbox = screen.getByLabelText(/Cán bộ Ông Hoàng Văn Đức chưa đủ điều kiện đồng bộ/i);
    expect(ducCheckbox).toBeDisabled();
    expect(ducCheckbox).not.toBeChecked();

    // Kiểm tra Bùi Tiến Dũng đủ điều kiện và được chọn sẵn
    const dungCheckbox = screen.getByLabelText(/Chọn cán bộ Ông Bùi Tiến Dũng/i);
    expect(dungCheckbox).toBeChecked();
    fireEvent.click(dungCheckbox);
    expect(dungCheckbox).not.toBeChecked();

    // Bấm "Tiếp tục: Xem lại" để sang Bước 2
    const nextBtn = screen.getByRole('button', { name: /Tiếp tục: Xem lại/i });
    fireEvent.click(nextBtn);

    // BƯỚC 2: Hiển thị danh sách xem lại và các camera tiếp nhận
    await waitFor(() => {
      expect(screen.getByText(/Thiết bị Camera AI tiếp nhận dữ liệu/i)).toBeInTheDocument();
      expect(screen.getByText(/Danh sách cán bộ được duyệt đồng bộ/i)).toBeInTheDocument();
    });

    // Bùi Tiến Dũng đã bị bỏ chọn ở Bước 1 nên không có trong danh sách duyệt modal
    // Hoàng Văn Đức cũng không có vì không đủ điều kiện
    expect(screen.getAllByText('Ông Hoàng Văn Đức').length).toBe(1);

    // Bấm "← Quay lại chỉnh sửa" để kiểm tra tính năng quay lại
    const backBtn = screen.getByRole('button', { name: /← Quay lại chỉnh sửa/i });
    fireEvent.click(backBtn);

    // Trở về Bước 1, chọn lại Bùi Tiến Dũng
    await waitFor(() => {
      expect(screen.getByText('Bước 1: Chọn cán bộ')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText(/Chọn cán bộ Ông Bùi Tiến Dũng/i));
    expect(screen.getByLabelText(/Chọn cán bộ Ông Bùi Tiến Dũng/i)).toBeChecked();

    // Tiến lại Bước 2
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục: Xem lại/i }));

    await waitFor(() => {
      expect(screen.getByText(/Đồng bộ ngay/i)).toBeInTheDocument();
    });

    // Bấm "Đồng bộ ngay"
    fireEvent.click(screen.getByText(/Đồng bộ ngay/i));

    // BƯỚC 3: Màn hình Kết quả đồng bộ (Result step)
    await waitFor(() => {
      expect(screen.getByText('Bước 3: Kết quả đồng bộ')).toBeInTheDocument();
      expect(screen.getByText(/Đồng bộ dữ liệu đến Camera AI thành công!/i)).toBeInTheDocument();
      expect(screen.getByText(/Danh sách cán bộ đã đồng bộ thành công/i)).toBeInTheDocument();
      expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
    });

    // Bấm nút "Hoàn tất" để kết thúc và đóng right-sheet
    fireEvent.click(screen.getByRole('button', { name: /^Hoàn tất$/i }));

    // Chờ SideSheet đóng và đồng bộ hoàn tất
    await waitFor(() => {
      expect(screen.queryByText('Đồng Bộ Dữ Liệu Đến Camera AI')).not.toBeInTheDocument();
    });
  });
});
