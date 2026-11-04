import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeManagement } from '../pages/organization/EmployeeManagement';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { cardService } from '../services/card';

describe('Giao diện Quản Lý Thẻ Nhân Viên (ORG-03: Card Management UI)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    departmentService.resetMockData();
    employeeService.resetMockData();
    cardService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Hiển thị thông tin cột thẻ RFID/NFC và thẻ thống kê số lượng thẻ đã cấp', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Quản Lý Hồ Sơ Nhân Sự & Thẻ Điểm Danh')).toBeInTheDocument();
    });

    expect(screen.getByText('Đã cấp thẻ RFID/NFC')).toBeInTheDocument();

    // Check card UIDs in table
    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument(); // Thẻ của Nguyễn Văn An
      expect(screen.getByText('04B2C3D4E5')).toBeInTheDocument(); // Thẻ của Phạm Thị Cúc
      expect(screen.getByText('Chưa cấp thẻ')).toBeInTheDocument(); // Hoàng Văn Đức chưa có thẻ
    });
  });

  it('Mở modal Quản lý thẻ và tạm khóa thẻ vật lý thành công', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument();
    });

    // Tìm các nút quản lý thẻ
    const cardBtns = screen.getAllByRole('button', { name: /Quản lý thẻ nhân viên/i });
    expect(cardBtns.length).toBeGreaterThan(0);

    // Bấm nút quản lý thẻ của Nguyễn Văn An (hàng 1)
    fireEvent.click(cardBtns[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Quản Lý Thẻ Nhân Viên Vật Lý \(RFID\/NFC\)/i, { selector: 'h3' })
      ).toBeInTheDocument();
      expect(screen.getByText('Thẻ vật lý đang liên kết')).toBeInTheDocument();
      expect(screen.getByText('Tạm khóa thẻ')).toBeInTheDocument();
    });

    // Bấm nút Tạm khóa thẻ
    fireEvent.click(screen.getByText('Tạm khóa thẻ'));

    // Chờ thông báo tạm khóa thành công
    await waitFor(() => {
      expect(screen.getByText(/Đã tạm khóa thẻ UID "04A1B2C3D4"/i)).toBeInTheDocument();
      expect(screen.getByText('Mở khóa thẻ')).toBeInTheDocument();
    });
  });

  it('Thực hiện quy trình Báo mất thẻ và cấp đổi thẻ mới ngay lập tức', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument();
    });

    // Mở modal thẻ của Nguyễn Văn An
    const cardBtns = screen.getAllByRole('button', { name: /Quản lý thẻ nhân viên/i });
    fireEvent.click(cardBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Báo mất / Cấp đổi thẻ mới')).toBeInTheDocument();
    });

    // Bấm nút Báo mất / Cấp đổi thẻ mới
    fireEvent.click(screen.getByText('Báo mất / Cấp đổi thẻ mới'));

    await waitFor(() => {
      expect(screen.getByText(/Báo mất thẻ & Cấp thẻ mới thay thế/i)).toBeInTheDocument();
    });

    // Nhập mã UID thẻ mới
    const newUidInput = screen.getByPlaceholderText(/VD: 04E9A1B2C3/i);
    fireEvent.change(newUidInput, { target: { value: '04AABBCCDDEE' } });

    // Bấm nút Xác nhận hủy thẻ cũ & Kích hoạt thẻ mới
    const confirmBtn = screen.getByText('Xác nhận hủy thẻ cũ & Kích hoạt thẻ mới');
    fireEvent.click(confirmBtn);

    // Chờ thông báo đổi thẻ thành công
    await waitFor(() => {
      expect(
        screen.getByText(/Đã hủy thẻ cũ \(UID: 04A1B2C3D4\) và kích hoạt thành công thẻ mới/i)
      ).toBeInTheDocument();
    });

    // Đóng modal
    const closeBtn = screen.getByRole('button', { name: /^Đóng$/i });
    fireEvent.click(closeBtn);

    // Kiểm tra trên bảng chính đã cập nhật UID mới
    await waitFor(() => {
      expect(screen.getByText('04AABBCCDDEE')).toBeInTheDocument();
    });
  });

  it('Liên kết thẻ mới thành công cho nhân sự chưa có thẻ', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Bấm nút quản lý thẻ của Hoàng Văn Đức (hàng thứ 3)
    const cardBtns = screen.getAllByRole('button', { name: /Quản lý thẻ nhân viên/i });
    fireEvent.click(cardBtns[2]);

    await waitFor(() => {
      expect(screen.getByText('Chưa có thẻ vật lý nào đang hoạt động')).toBeInTheDocument();
    });

    // Nhập mã UID mới
    const uidInput = screen.getByPlaceholderText(/VD: 04A1B2C3D4, E0040150.../i);
    fireEvent.change(uidInput, { target: { value: '04FFFF112233' } });

    // Bấm nút Liên kết thẻ
    const assignBtn = screen.getByRole('button', { name: /Liên kết thẻ cho nhân viên/i });
    fireEvent.click(assignBtn);

    // Chờ thông báo thành công
    await waitFor(() => {
      expect(screen.getByText(/Đã liên kết thành công thẻ UID "04FFFF112233"/i)).toBeInTheDocument();
    });

    // Đóng modal
    const closeBtn = screen.getByRole('button', { name: /^Đóng$/i });
    fireEvent.click(closeBtn);

    // Kiểm tra trên bảng chính đã hiện mã thẻ mới
    await waitFor(() => {
      expect(screen.getByText('04FFFF112233')).toBeInTheDocument();
    });
  });

  it('Lọc danh sách nhân viên theo trạng thái thẻ', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument();
    });

    // Tìm select filter trạng thái thẻ
    const cardSelect = screen.getByLabelText(/Tất cả trạng thái thẻ/i);
    fireEvent.change(cardSelect, { target: { value: 'none' } });

    // Khi lọc 'Chưa có thẻ vật lý', chỉ có Hoàng Văn Đức
    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
      expect(screen.queryByText('Đ/c Nguyễn Văn An')).not.toBeInTheDocument();
      expect(screen.queryByText('Bà Phạm Thị Cúc')).not.toBeInTheDocument();
    });
  });
});
