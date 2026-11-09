import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      expect(screen.getByText('Quản Lý Hồ Sơ Nhân Sự')).toBeInTheDocument();
    });

    expect(screen.getByText('Đã cấp thẻ RFID/NFC')).toBeInTheDocument();

    // Check card UIDs in table
    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument(); // Thẻ của Nguyễn Văn An
      expect(screen.getByText('04B2C3D4E5')).toBeInTheDocument(); // Thẻ của Phạm Thị Cúc
      expect(screen.getAllByText('Chưa cấp thẻ').length).toBeGreaterThanOrEqual(1); // Hoàng Văn Đức và các nhân sự chưa cấp thẻ
    });
  });

  it('Mở modal Quản lý thẻ và tạm khóa thẻ vật lý thành công', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument();
    });

    // Mở menu thao tác ba chấm của Nguyễn Văn An (hàng 1)
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    expect(actionBtns.length).toBeGreaterThan(0);
    fireEvent.click(actionBtns[0]);

    // Bấm nút quản lý thẻ trong menu
    const cardBtn = screen.getByRole('menuitem', { name: /Quản lý thẻ nhân viên/i });
    fireEvent.click(cardBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Quản Lý Thẻ Nhân Viên Vật Lý \(RFID\/NFC\)/i, { selector: 'h3' })
      ).toBeInTheDocument();
      expect(screen.getByText('Thẻ vật lý đang liên kết')).toBeInTheDocument();
      expect(screen.getByText('Tạm khóa thẻ')).toBeInTheDocument();
    });

    // Bấm nút Tạm khóa thẻ trên thanh công cụ thẻ
    fireEvent.click(screen.getByText('Tạm khóa thẻ'));

    // Xuất hiện Pop-up xác nhận tạm khóa
    await waitFor(() => {
      expect(screen.getByText('Xác nhận tạm khóa thẻ vật lý')).toBeInTheDocument();
    });

    // Bấm nút xác nhận trong Pop-up dialog
    const confirmDialog = screen.getByRole('dialog', { name: /Xác nhận tạm khóa thẻ vật lý/i });
    const modalConfirmBtn = within(confirmDialog).getByRole('button', { name: /^Tạm khóa thẻ$/i });
    fireEvent.click(modalConfirmBtn);

    // Chờ Toast thông báo tạm khóa thành công
    await waitFor(() => {
      expect(screen.getByText(/Đã tạm khóa thẻ UID "04A1B2C3D4"/i)).toBeInTheDocument();
      expect(screen.getByText('Mở khóa thẻ')).toBeInTheDocument();
    });
  });

  it('Không hiển thị nút Báo mất / Cấp đổi thẻ mới; Mở khóa thẻ yêu cầu pop-up xác nhận và hiển thị Toast', async () => {
    // Khóa thẻ trước để kiểm tra luồng Mở khóa thẻ
    await cardService.toggleLockCard(ubndTenant, 'card-ubnd-01', 'Tạm khóa');

    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('04A1B2C3D4')).toBeInTheDocument();
    });

    // Mở menu thao tác của Nguyễn Văn An
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtns[0]);
    const cardBtn = screen.getByRole('menuitem', { name: /Quản lý thẻ nhân viên/i });
    fireEvent.click(cardBtn);

    await waitFor(() => {
      expect(screen.getByText('Mở khóa thẻ')).toBeInTheDocument();
    });

    // Xác nhận đã xóa nút "Báo mất / Cấp đổi thẻ mới"
    expect(screen.queryByText('Báo mất / Cấp đổi thẻ mới')).not.toBeInTheDocument();

    // Bấm nút Mở khóa thẻ
    fireEvent.click(screen.getByText('Mở khóa thẻ'));

    // Xuất hiện Pop-up xác nhận mở khóa
    await waitFor(() => {
      expect(screen.getByText('Xác nhận mở khóa thẻ vật lý')).toBeInTheDocument();
    });

    // Bấm xác nhận mở khóa trong Pop-up dialog
    const unlockDialog = screen.getByRole('dialog', { name: /Xác nhận mở khóa thẻ vật lý/i });
    const modalUnlockBtn = within(unlockDialog).getByRole('button', { name: /^Mở khóa thẻ$/i });
    fireEvent.click(modalUnlockBtn);

    // Chờ Toast thông báo mở khóa thành công
    await waitFor(() => {
      expect(screen.getByText(/Đã mở khóa thẻ UID "04A1B2C3D4"/i)).toBeInTheDocument();
      expect(screen.getByText('Tạm khóa thẻ')).toBeInTheDocument();
    });
  });

  it('Liên kết thẻ mới thành công cho nhân sự chưa có thẻ', async () => {
    render(<EmployeeManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Bấm nút Thao tác của Hoàng Văn Đức (hàng thứ 3)
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtns[2]);
    const cardBtn = screen.getByRole('menuitem', { name: /Quản lý thẻ nhân viên/i });
    fireEvent.click(cardBtn);

    await waitFor(() => {
      expect(screen.getByText('Chưa có thẻ vật lý nào đang hoạt động')).toBeInTheDocument();
    });

    // Xác nhận không còn nút "Quét từ đầu đọc"
    expect(screen.queryByText(/Quét từ đầu đọc/i)).not.toBeInTheDocument();

    // Nhập mã UID mới
    const uidInput = screen.getByPlaceholderText(/VD: 04A1B2C3D4, E0040150.../i);
    fireEvent.change(uidInput, { target: { value: '04FFFF112233' } });

    // Bấm nút Cấp thẻ
    const assignBtn = screen.getByRole('button', { name: /^Cấp thẻ$/i });
    fireEvent.click(assignBtn);

    // Chờ thông báo thành công
    await waitFor(() => {
      expect(screen.getByText(/Đã cấp thành công thẻ UID "04FFFF112233"/i)).toBeInTheDocument();
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
