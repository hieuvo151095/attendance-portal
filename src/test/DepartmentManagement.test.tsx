import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DepartmentManagement } from '../pages/organization/DepartmentManagement';
import { authService } from '../services/auth';
import { departmentService } from '../services/department';

describe('Giao diện Quản lý Cơ Cấu Phòng Ban (ORG-01: Department UI)', () => {
  beforeEach(async () => {
    departmentService.resetMockData();
    authService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Hiển thị danh sách cây phòng ban và số lượng nhân sự', async () => {
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Cơ Cấu Tổ Chức & Phòng Ban')).toBeInTheDocument();
      expect(screen.getByText('Văn phòng HĐND & UBND')).toBeInTheDocument();
      expect(screen.getByText('VP-UBND')).toBeInTheDocument();
      expect(screen.getByText('Ban Chỉ huy Quân sự Phường')).toBeInTheDocument();
      expect(screen.getByText('Công An Phường Bến Nghé')).toBeInTheDocument();
    });
  });

  it('Hỗ trợ tìm kiếm phòng ban theo tên hoặc mã định danh', async () => {
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Văn phòng HĐND & UBND')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm phòng ban theo tên/i);
    fireEvent.change(searchInput, { target: { value: 'Quân sự' } });

    await waitFor(() => {
      expect(screen.getByText('Ban Chỉ huy Quân sự Phường')).toBeInTheDocument();
      expect(screen.queryByText('Công An Phường Bến Nghé')).not.toBeInTheDocument();
    });
  });

  it('Mở modal thêm phòng ban mới và tạo thành công', async () => {
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Thêm phòng ban mới')).toBeInTheDocument();
    });

    // Bấm nút thêm
    fireEvent.click(screen.getByText('Thêm phòng ban mới'));

    await waitFor(() => {
      expect(screen.getByText('Thêm Phòng Ban / Đơn Vị Mới')).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText(/Mã phòng ban/i);
    const nameInput = screen.getByLabelText(/Tên phòng ban \/ Phân xưởng/i);
    const managerInput = screen.getByLabelText(/Họ tên người phụ trách/i);

    fireEvent.change(codeInput, { target: { value: 'TT-VHTT' } });
    fireEvent.change(nameInput, { target: { value: 'Trung tâm Văn hóa Thể thao' } });
    fireEvent.change(managerInput, { target: { value: 'Ông Lê Hoàng Hải' } });

    const submitBtn = screen.getByRole('button', { name: /^Thêm phòng ban$/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Trung tâm Văn hóa Thể thao')).toBeInTheDocument();
      expect(screen.getByText('TT-VHTT')).toBeInTheDocument();
      expect(screen.getByText(/Đã tạo mới phòng ban thành công/i)).toBeInTheDocument();
    });
  });

  it('Bấm nút Thêm con tự động gán cấp quản lý trực thuộc', async () => {
    render(<DepartmentManagement />);

    await waitFor(() => {
      expect(screen.getByText('Văn phòng HĐND & UBND')).toBeInTheDocument();
    });

    // Bấm nút "Thêm con" trên hàng Văn phòng HĐND & UBND
    const addSubBtns = screen.getAllByRole('button', { name: /Thêm con/i });
    fireEvent.click(addSubBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Thêm Phòng Ban / Đơn Vị Mới')).toBeInTheDocument();
    });

    const parentSelect = screen.getByLabelText(/Cấp quản lý trực thuộc/i) as HTMLSelectElement;
    expect(parentSelect.value).toBe('dept-ubnd-01');
  });
});
