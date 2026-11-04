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
      expect(screen.getByText('Quản Lý Hồ Sơ Nhân Sự')).toBeInTheDocument();
    });

    expect(screen.getByText('Tổng nhân sự')).toBeInTheDocument();
    expect(screen.getByText('Đã đồng bộ Face ID từ Camera')).toBeInTheDocument();
    expect(screen.getAllByText('Chờ lấy mẫu tại Camera').length).toBeGreaterThanOrEqual(1);

    // Check pre-seeded employee names
    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Check Face ID tags
    expect(screen.getAllByText('Đã có Face ID').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Chờ lấy mẫu camera')).toBeInTheDocument();
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

    // Bấm nút lưu
    const submitBtn = screen.getByRole('button', { name: /^Thêm nhân sự$/i });
    fireEvent.click(submitBtn);

    // Xác nhận đã lưu thành công và xuất hiện trên bảng
    await waitFor(() => {
      expect(screen.getByText('Lê Văn Luyện')).toBeInTheDocument();
      expect(screen.getByText('NV-TEST-01')).toBeInTheDocument();
      expect(screen.getByText('079099887766')).toBeInTheDocument();
    });
  });

  it('Mở modal Đồng bộ Face ID từ Camera Hikvision và kích hoạt đồng bộ thành công', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Tìm các nút đồng bộ camera
    const cameraBtns = screen.getAllByRole('button', {
      name: /Đồng bộ Face ID từ Camera Hikvision/i
    });
    expect(cameraBtns.length).toBeGreaterThan(0);

    // Bấm vào nút camera của hàng Hoàng Văn Đức (hàng thứ 3)
    fireEvent.click(cameraBtns[2]);

    await waitFor(() => {
      expect(
        screen.getByText(/Đồng bộ Face ID từ Camera Hikvision/i, { selector: 'h3' })
      ).toBeInTheDocument();
      expect(screen.getByText(/Chọn thiết bị Camera Hikvision kết nối/i)).toBeInTheDocument();
      expect(screen.getByText(/Độ chuẩn xác nhận diện khuôn mặt/i)).toBeInTheDocument();
    });

    // Bấm nút Lưu Face ID vào hồ sơ
    const confirmSyncBtn = screen.getByRole('button', {
      name: /Lưu Face ID vào hồ sơ/i
    });
    fireEvent.click(confirmSyncBtn);

    // Chờ modal đóng và trạng thái nhân viên đổi sang Đã có Face ID
    await waitFor(() => {
      expect(screen.getAllByText('Đã có Face ID').length).toBe(3);
    });
  });

  it('Mở modal Nhập từ Excel và import thành công danh sách nhân viên', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Nhập từ Excel')).toBeInTheDocument();
    });

    // Bấm nút Nhập từ Excel
    fireEvent.click(screen.getByText('Nhập từ Excel'));

    await waitFor(() => {
      expect(screen.getByText('Xem trước danh sách (3 nhân sự chuẩn bị nhập):')).toBeInTheDocument();
      expect(screen.getByText('Trần Văn Bình')).toBeInTheDocument();
      expect(screen.getByText('Lê Thị Diệu')).toBeInTheDocument();
    });

    // Bấm nút Tiến hành Import
    const importBtn = screen.getByRole('button', {
      name: /Nhập 3 nhân sự/i
    });
    fireEvent.click(importBtn);

    // Chờ thông báo kết quả
    await waitFor(() => {
      expect(screen.getByText(/Kết quả import: Toàn bộ 3 nhân sự/i)).toBeInTheDocument();
    });

    // Đóng modal
    const closeBtn = screen.getByRole('button', { name: /^Đóng$/i });
    fireEvent.click(closeBtn);

    // Kiểm tra nhân viên mới import xuất hiện trên bảng chính
    await waitFor(() => {
      expect(screen.getByText('Trần Văn Bình')).toBeInTheDocument();
      expect(screen.getByText('Lê Thị Diệu')).toBeInTheDocument();
    });
  });
});
