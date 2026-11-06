import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsManagement } from '../pages/setting/SettingsManagement';
import { attendanceSettingService } from '../services/setting';
import { roomService } from '../services/room';
import { authService } from '../services/auth';

describe('Mô-đun Thiết Lập Hệ Thống (Settings Management)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    attendanceSettingService.resetMockData();
    roomService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Hiển thị tiêu đề mô-đun Thiết Lập và 2 tab cấu hình', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    expect(screen.getByText('Thời Gian & Điểm Danh')).toBeInTheDocument();
    expect(screen.getByText(/Danh Sách Phòng Họp/)).toBeInTheDocument();
  });

  it('Tab Thời Gian & Điểm Danh hiển thị các thông số ca làm việc và nút lưu cấu hình', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Khung giờ làm việc hàng ngày tại cơ quan/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Quy tắc điểm danh cuộc họp cơ quan/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mục tiêu chuẩn cơ quan \(% đúng giờ\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mục tiêu chuẩn cơ quan \(% đúng giờ\)/)).toHaveValue(90);

    // 2 mục tiêu chuyên cần cuộc họp
    const meetingAttTarget = screen.getByLabelText(/Mục tiêu tỷ lệ tham dự \(%\)/);
    const meetingOnTimeTarget = screen.getByLabelText(/Mục tiêu tỷ lệ đúng giờ \(%\)/);
    expect(meetingAttTarget).toBeInTheDocument();
    expect(meetingAttTarget).toHaveValue(90);
    expect(meetingOnTimeTarget).toBeInTheDocument();
    expect(meetingOnTimeTarget).toHaveValue(85);

    expect(screen.getByText('Lưu cấu hình thời gian')).toBeInTheDocument();
    expect(screen.getByText('Khôi phục mặc định chuẩn')).toBeInTheDocument();

    const saveBtn = screen.getByText('Lưu cấu hình thời gian');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Đã lưu cấu hình thời gian làm việc & dung sai điểm danh thành công/)
      ).toBeInTheDocument();
    });
  });

  it('Chuyển sang tab Danh Sách Phòng Họp, hiển thị danh sách phòng và vị trí', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    // Bấm chuyển sang tab Danh Sách Phòng Họp
    const roomsTabBtn = screen.getByText(/Danh Sách Phòng Họp/);
    fireEvent.click(roomsTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Tổng số phòng/)).toBeInTheDocument();
    });

    // Kiểm tra các phòng họp mẫu hiển thị
    expect(screen.getByText('PH-HT-01')).toBeInTheDocument();
    expect(screen.getByText('Hội trường số 1')).toBeInTheDocument();
    expect(screen.getByText('PH-DN-02')).toBeInTheDocument();
    expect(screen.getByText('Phòng họp Đa năng')).toBeInTheDocument();
    expect(screen.getAllByText('Tầng 2 Trụ sở UBND').length).toBeGreaterThan(0);
  });

  it('Mở Right-Sheet thêm phòng họp: nút thêm bị disabled khi chưa nhập đủ thông tin bắt buộc', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    // Chuyển sang tab phòng họp
    fireEvent.click(screen.getByText(/Danh Sách Phòng Họp/));

    await waitFor(() => {
      expect(screen.getByText('Thêm phòng mới')).toBeInTheDocument();
    });

    // Bấm nút "Thêm phòng mới"
    fireEvent.click(screen.getByText('Thêm phòng mới'));

    await waitFor(() => {
      expect(screen.getByText('Thêm phòng họp mới')).toBeInTheDocument();
    });

    // Nút "Thêm phòng" bên trong right-sheet phải bị disabled ban đầu vì chưa điền Room ID, Tên, Vị trí
    const submitBtn = screen.getByRole('button', { name: /^Thêm phòng$/ });
    expect(submitBtn).toBeDisabled();

    // Điền mã phòng
    const roomIdInput = screen.getByPlaceholderText('VD: PH-01, HT-T2');
    fireEvent.change(roomIdInput, { target: { value: 'PH-VIP-99' } });
    expect(submitBtn).toBeDisabled();

    // Điền tên phòng
    const nameInput = screen.getByPlaceholderText('VD: Hội trường số 1');
    fireEvent.change(nameInput, { target: { value: 'Phòng Tiếp Khách VIP' } });
    expect(submitBtn).toBeDisabled();

    // Điền vị trí phòng
    const locationInput = screen.getByPlaceholderText('VD: Tầng 2 - Trụ sở UBND, Dãy nhà B');
    fireEvent.change(locationInput, { target: { value: 'Tầng 1 Trụ sở UBND' } });

    // Lúc này các trường bắt buộc đã được điền đầy đủ -> nút được kích hoạt
    expect(submitBtn).not.toBeDisabled();

    // Bấm tạo phòng
    fireEvent.click(submitBtn);

    // Kiểm tra phòng mới xuất hiện trong danh sách
    await waitFor(() => {
      expect(screen.getByText('PH-VIP-99')).toBeInTheDocument();
      expect(screen.getByText('Phòng Tiếp Khách VIP')).toBeInTheDocument();
    });
  });

  it('Cột Thao tác phòng họp: Hiển thị nút 3 chấm và menu dropdown chỉnh sửa / xóa phòng', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    // Chuyển sang tab phòng họp
    fireEvent.click(screen.getByText(/Danh Sách Phòng Họp/));

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'Thao tác' })).toBeInTheDocument();
    });

    // Lấy các nút Thao tác (3 chấm)
    const actionButtons = screen.getAllByRole('button', { name: 'Thao tác' });
    expect(actionButtons.length).toBeGreaterThan(0);

    // Bấm nút 3 chấm của phòng đầu tiên (Hội trường số 1)
    fireEvent.click(actionButtons[0]);

    // Menu dropdown phải bật lên với 2 tùy chọn: Chỉnh sửa phòng và Xóa phòng
    await waitFor(() => {
      expect(screen.getByText('Chỉnh sửa phòng')).toBeInTheDocument();
      expect(screen.getByText('Xóa phòng')).toBeInTheDocument();
    });

    // Bấm vào "Chỉnh sửa phòng"
    fireEvent.click(screen.getByText('Chỉnh sửa phòng'));

    // Kiểm tra Right-sheet chỉnh sửa phòng được mở với thông tin phòng Hội trường số 1
    await waitFor(() => {
      expect(screen.getByText('Cập nhật thông tin phòng họp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PH-HT-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Hội trường số 1')).toBeInTheDocument();
    });
  });

  it('Bấm nút Xóa phòng hiển thị Pop-up xác nhận chuẩn Design System (PopupModal) thay vì window.confirm mặc định', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    // Chuyển sang tab phòng họp
    fireEvent.click(screen.getByText(/Danh Sách Phòng Họp/));

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'Thao tác' })).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button', { name: 'Thao tác' });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Xóa phòng')).toBeInTheDocument();
    });

    // Bấm nút "Xóa phòng"
    fireEvent.click(screen.getByText('Xóa phòng'));

    // Kiểm tra window.confirm KHÔNG được gọi
    expect(confirmSpy).not.toHaveBeenCalled();

    // Pop-up xác nhận xóa chuẩn Design System phải xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Xác Nhận Xóa Phòng Họp')).toBeInTheDocument();
      expect(screen.getByText(/Bạn có chắc chắn muốn xóa phòng "Hội trường số 1"/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Xóa phòng họp' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hủy bỏ' })).toBeInTheDocument();
    });

    // Bấm nút "Hủy bỏ"
    fireEvent.click(screen.getByRole('button', { name: 'Hủy bỏ' }));

    // Pop-up đóng lại và phòng vẫn còn
    await waitFor(() => {
      expect(screen.queryByText('Xác Nhận Xóa Phòng Họp')).toBeNull();
      expect(screen.getByText('Hội trường số 1')).toBeInTheDocument();
    });

    // Mở lại và xác nhận xóa
    fireEvent.click(actionButtons[0]);
    await waitFor(() => expect(screen.getByText('Xóa phòng')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Xóa phòng'));

    await waitFor(() => expect(screen.getByText('Xác Nhận Xóa Phòng Họp')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xóa phòng họp' }));

    // Sau khi xóa thành công, thông báo thành công xuất hiện và phòng biến mất khỏi bảng
    await waitFor(() => {
      expect(screen.getByText(/Đã xóa phòng "Hội trường số 1" thành công/)).toBeInTheDocument();
      expect(screen.queryByText('Hội trường số 1')).toBeNull();
    });

    confirmSpy.mockRestore();
  });
});
