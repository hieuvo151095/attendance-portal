import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MeetingModal } from '../pages/meeting/MeetingModal';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { roomService } from '../services/room';

describe('Thiết Lập Cuộc Họp Mới - Master Data Dropdown & Multi-Select Department', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    employeeService.resetMockData();
    departmentService.resetMockData();
    roomService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Tên phòng họp: hiển thị master data trong dropdown khi gõ tìm kiếm và chọn phòng thành công', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <MeetingModal
        open={true}
        onClose={handleClose}
        tenantId={ubndTenant}
        onSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Thiết lập cuộc họp mới')).toBeInTheDocument();
    });

    // Ô nhập Tên phòng họp
    const roomInput = screen.getByPlaceholderText(/VD: Hội trường số 1 - Tầng 2/i);
    expect(roomInput).toBeInTheDocument();

    // Gõ tìm kiếm phòng họp "Đa năng"
    fireEvent.change(roomInput, { target: { value: 'Đa năng' } });

    // Dropdown gợi ý xuất hiện chứa phòng họp Đa năng
    await waitFor(() => {
      expect(screen.getByText('Phòng họp Đa năng')).toBeInTheDocument();
    });

    // Bấm chọn phòng từ dropdown
    fireEvent.click(screen.getByText('Phòng họp Đa năng'));

    // Giá trị phòng họp được cập nhật vào ô nhập
    expect(roomInput).toHaveValue('Phòng họp Đa năng - Trụ sở UBND Phường');
  });

  it('Người chủ trì: hiển thị master data cán bộ nhân sự trong dropdown khi gõ tìm kiếm', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <MeetingModal
        open={true}
        onClose={handleClose}
        tenantId={ubndTenant}
        onSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Thiết lập cuộc họp mới')).toBeInTheDocument();
    });

    const hostInput = screen.getByPlaceholderText(/VD: Đ\/c Nguyễn Văn An - Chủ tịch UBND/i);
    expect(hostInput).toBeInTheDocument();

    // Chờ master data cán bộ nhân sự tải xong
    await waitFor(() => {
      expect(hostInput).not.toHaveValue('');
    });

    // Gõ tìm kiếm người chủ trì "Phạm Thị Cúc"
    fireEvent.change(hostInput, { target: { value: 'Phạm Thị Cúc' } });

    // Dropdown gợi ý hiển thị Bà Phạm Thị Cúc
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
    });

    // Bấm chọn từ dropdown
    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByText('Bà Phạm Thị Cúc'));

    // Giá trị người chủ trì được gán đầy đủ chức danh
    expect(hostInput).toHaveValue('Bà Phạm Thị Cúc - Trưởng bộ phận Địa chính - Xây dựng');
  });

  it('Chọn nhanh theo phòng ban: trường duy nhất mở dropdown, cho phép chọn nhiều phòng ban', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <MeetingModal
        open={true}
        onClose={handleClose}
        tenantId={ubndTenant}
        onSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Chọn nhanh theo phòng ban:')).toBeInTheDocument();
    });

    const deptTrigger = screen.getByTestId('dept-multiselect-trigger');

    // Bấm vào trường duy nhất để mở dropdown danh sách phòng ban
    fireEvent.click(deptTrigger);

    await waitFor(() => {
      expect(screen.getByText(/Danh sách phòng ban/i)).toBeInTheDocument();
    });

    // Chọn phòng ban 1: Văn phòng HĐND & UBND
    const dept1Btn = screen.getByRole('button', { name: /Văn phòng HĐND & UBND/i });
    fireEvent.click(dept1Btn);

    // Chọn phòng ban 2: Ban Chỉ huy Quân sự Phường
    const dept2Btn = screen.getByRole('button', { name: /Ban Chỉ huy Quân sự Phường/i });
    fireEvent.click(dept2Btn);

    // Kiểm tra trên trường duy nhất xuất hiện các chip thẻ đại diện cho 2 phòng ban đã chọn
    expect(screen.getAllByText(/Văn phòng HĐND & UBND/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ban Chỉ huy Quân sự Phường/).length).toBeGreaterThan(0);

    // Tổng số đại biểu đã chọn tăng lên tương ứng
    expect(screen.getByText(/Đã chọn: \d+ đại biểu/i)).toBeInTheDocument();

    // Bấm nút xóa "✕" trên chip Ban Chỉ huy Quân sự Phường
    const removeBtn = screen.getByRole('button', { name: /Bỏ chọn Ban Chỉ huy Quân sự Phường/i });
    fireEvent.click(removeBtn);

    // Chip đã bị xóa
    expect(screen.queryByRole('button', { name: /Bỏ chọn Ban Chỉ huy Quân sự Phường/i })).not.toBeInTheDocument();
  });

  it('Mô tả modal không chứa tiền tố đặc tả và hiển thị đúng câu hướng dẫn', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <MeetingModal
        open={true}
        onClose={handleClose}
        tenantId={ubndTenant}
        onSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Thiết lập cuộc họp mới')).toBeInTheDocument();
    });

    // Xác nhận không còn tiền tố "Đặc tả MTG-01:"
    expect(
      screen.queryByText(/Đặc tả MTG-01: Nhập thông tin phòng họp/i)
    ).not.toBeInTheDocument();

    // Xác nhận dòng mô tả chuẩn mới
    expect(
      screen.getByText('Nhập thông tin phòng họp, thời gian và triệu tập danh sách đại biểu theo phòng ban.')
    ).toBeInTheDocument();
  });

  it('Quy tắc thời gian điểm danh cuộc họp: BẬT mặc định khi tạo mới, hỗ trợ gạt công tắc để TẮT/BẬT linh hoạt', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <MeetingModal
        open={true}
        onClose={handleClose}
        tenantId={ubndTenant}
        onSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Quy tắc thời gian điểm danh cuộc họp')).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('meeting-rules-toggle') as HTMLInputElement;
    expect(toggle).toBeInTheDocument();

    // 1. Mặc định khi tạo cuộc họp mới: Toggle đang BẬT
    expect(toggle.checked).toBe(true);
    expect(screen.getByText('Bật')).toBeInTheDocument();

    // Các trường thời gian dung sai và thông báo tính giờ đang hiển thị
    expect(screen.getByLabelText(/Cho phép vào trễ tối đa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cho phép về sớm tối đa/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn có thể điểm danh vào trễ nhất lúc/i)).toBeInTheDocument();

    // 2. Gạt công tắc sang TẮT
    fireEvent.click(toggle);

    expect(toggle.checked).toBe(false);
    expect(screen.getByText('Tắt')).toBeInTheDocument();

    // Các trường thời gian dung sai bị ẩn, xuất hiện thông báo đã tắt quy tắc
    expect(screen.queryByLabelText(/Cho phép vào trễ tối đa/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Cho phép về sớm tối đa/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Đã tắt quy tắc thời gian điểm danh. Đại biểu check-in \/ check-out sẽ không bị tính đi muộn hoặc về sớm./i)
    ).toBeInTheDocument();

    // 3. Gạt công tắc BẬT trở lại
    fireEvent.click(toggle);

    expect(toggle.checked).toBe(true);
    expect(screen.getByText('Bật')).toBeInTheDocument();
    expect(screen.getByLabelText(/Cho phép vào trễ tối đa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cho phép về sớm tối đa/i)).toBeInTheDocument();
  });
});
