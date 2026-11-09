import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsManagement } from '../pages/setting/SettingsManagement';
import { attendanceSettingService } from '../services/setting';
import { roomService } from '../services/room';
import { cameraDeviceService } from '../services/device';
import { authService } from '../services/auth';

describe('Mô-đun Thiết Lập Hệ Thống (Settings Management)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    attendanceSettingService.resetMockData();
    roomService.resetMockData();
    cameraDeviceService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Hiển thị tiêu đề mô-đun Thiết Lập và các tab cấu hình (Thời Gian & Điểm Danh, Danh Sách Phòng Họp, Quản trị thiết bị)', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    expect(screen.getByText('Thời Gian & Điểm Danh')).toBeInTheDocument();
    expect(screen.getByText(/Danh Sách Phòng Họp/)).toBeInTheDocument();
    expect(screen.getByText('Quản trị thiết bị')).toBeInTheDocument();
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

  it('Chuyển sang tab Quản trị thiết bị, hiển thị StatCards tổng quan và đầy đủ các cột', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Thiết Lập Hệ Thống/)).toBeInTheDocument();
    });

    // Bấm chuyển sang tab Quản trị thiết bị
    const devicesTabBtn = screen.getByText('Quản trị thiết bị');
    fireEvent.click(devicesTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Tổng số lượng thiết bị camera')).toBeInTheDocument();
    });

    // Kiểm tra StatCards số liệu tổng quan trên đầu bộ lọc
    expect(screen.getByText('Thiết bị đang hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Thiết bị tạm khoá / bảo trì')).toBeInTheDocument();
    expect(screen.getByText('Thêm thiết bị mới')).toBeInTheDocument();
    expect(screen.getByText('Xuất dữ liệu')).toBeInTheDocument();

    // Kiểm tra các cột trong bảng
    expect(screen.getByRole('columnheader', { name: 'STT' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tên thiết bị' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mã thiết bị' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Loại điểm danh' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Trạng thái' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Thao tác' })).toBeInTheDocument();

    // Kiểm tra dữ liệu thiết bị mẫu
    expect(screen.getByText('CAM-UBND-CC-01')).toBeInTheDocument();
    expect(screen.getByText('Camera AI Cổng Tiếp Dân')).toBeInTheDocument();
    expect(screen.getAllByText('Chấm công').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cuộc họp').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hoạt động').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tạm khoá').length).toBeGreaterThan(0);
  });

  it('Thao tác mở Right-Sheet thêm thiết bị mới và chuyển đổi trạng thái Hoạt động / Tạm khoá', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    // Chuyển sang tab Quản trị thiết bị
    fireEvent.click(screen.getByText('Quản trị thiết bị'));

    await waitFor(() => {
      expect(screen.getByText('Thêm thiết bị mới')).toBeInTheDocument();
    });

    // Bấm nút "Thêm thiết bị mới" cùng hàng với bộ lọc
    fireEvent.click(screen.getByText('Thêm thiết bị mới'));

    await waitFor(() => {
      expect(screen.getByText('Tạo mới thiết bị')).toBeInTheDocument();
    });

    // Nhập dữ liệu thiết bị mới
    const nameInput = screen.getByPlaceholderText('Nhập tên thiết bị (ví dụ: Camera Cổng Tiếp Dân)');
    const codeInput = screen.getByPlaceholderText('Nhập mã thiết bị (ví dụ: CAM-099842)');

    fireEvent.change(nameInput, { target: { value: 'Camera Cổng Thư Viện' } });
    fireEvent.change(codeInput, { target: { value: 'CAM-LIB-01' } });

    // Bấm nút lưu trong Right-Sheet
    const saveBtn = screen.getByRole('button', { name: 'Tạo mới' });
    fireEvent.click(saveBtn);

    // Thiết bị mới xuất hiện trên danh sách
    await waitFor(() => {
      expect(screen.getByText('CAM-LIB-01')).toBeInTheDocument();
      expect(screen.getByText('Camera Cổng Thư Viện')).toBeInTheDocument();
    });

    // Thao tác chỉnh trạng thái Tạm khoá / Mở khoá qua menu Thao tác
    const actionButtons = screen.getAllByRole('button', { name: 'Thao tác' });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Tạm khoá thiết bị')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tạm khoá thiết bị'));

    await waitFor(() => {
      expect(screen.getByText(/Đã tạm khoá thiết bị/)).toBeInTheDocument();
    });
  });

  it('Thao tác xóa thiết bị yêu cầu tick ô vuông xác nhận trách nhiệm trước khi xóa (Claim responsibility checkbox)', async () => {
    render(<SettingsManagement tenantId={ubndTenant} />);

    // Chuyển sang tab Quản trị thiết bị
    fireEvent.click(screen.getByText('Quản trị thiết bị'));

    await waitFor(() => {
      expect(screen.getByText('Tổng số lượng thiết bị camera')).toBeInTheDocument();
    });

    // Mở menu Thao tác của dòng thiết bị đầu tiên
    const actionButtons = screen.getAllByRole('button', { name: 'Thao tác' });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Xóa thiết bị')).toBeInTheDocument();
    });

    // Bấm "Xóa thiết bị"
    fireEvent.click(screen.getByText('Xóa thiết bị'));

    // Modal Popup xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Xác Nhận Xóa Thiết Bị')).toBeInTheDocument();
    });

    // Kiểm tra ô checkbox xác nhận trách nhiệm
    const checkbox = screen.getByTestId('confirm-delete-device-checkbox');
    expect(checkbox).not.toBeChecked();

    // Nút "Xóa thiết bị" trong modal phải bị vô hiệu hóa (disabled) khi chưa tick
    const deleteConfirmBtn = screen.getByRole('button', { name: 'Xóa thiết bị' });
    expect(deleteConfirmBtn).toBeDisabled();

    // Bấm tick ô vuông xác nhận trách nhiệm
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Nút "Xóa thiết bị" bây giờ đã sẵn sàng (enabled)
    expect(deleteConfirmBtn).not.toBeDisabled();

    // Bấm xác nhận xóa
    fireEvent.click(deleteConfirmBtn);

    // Thông báo xóa thành công và thiết bị được loại bỏ
    await waitFor(() => {
      expect(screen.getByText(/Đã xóa thiết bị "Camera AI Cổng Tiếp Dân" thành công/)).toBeInTheDocument();
    });
  });
});
