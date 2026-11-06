import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingManagement } from '../pages/meeting/MeetingManagement';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { meetingService } from '../services/meeting';

describe('Giao diện Quản Lý & Điểm Danh Cuộc Họp (MTG-01: Meeting UI)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    departmentService.resetMockData();
    employeeService.resetMockData();
    meetingService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Hiển thị tiêu đề, thẻ tóm tắt số liệu cuộc họp và danh sách cuộc họp mẫu', async () => {
    render(<MeetingManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Lên Lịch & Điểm Danh Cuộc Họp')).toBeInTheDocument();
    });

    expect(screen.getByText('Tổng cuộc họp')).toBeInTheDocument();
    expect(screen.getAllByText('Sắp diễn ra').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đang diễn ra').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đã kết thúc').length).toBeGreaterThanOrEqual(1);

    // Check pre-seeded meetings
    await waitFor(() => {
      expect(screen.getByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')).toBeInTheDocument();
      expect(screen.getByText('Tọa đàm Ứng dụng AI & Chuyển đổi số Năm 2026')).toBeInTheDocument();
      expect(screen.getAllByText('Hội trường số 1 - Tầng 2 Trụ sở UBND').length).toBeGreaterThanOrEqual(1);
    });

    // Check attendee counts
    expect(screen.getAllByText(/3 đại biểu/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/5 đại biểu/i).length).toBeGreaterThanOrEqual(1);
  });

  it('Tìm kiếm cuộc họp theo tên cập nhật bảng dữ liệu tức thì', async () => {
    render(<MeetingManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cuộc họp, phòng họp/i);
    fireEvent.change(searchInput, { target: { value: 'Chuyển đổi số' } });

    await waitFor(() => {
      expect(screen.getByText('Tọa đàm Ứng dụng AI & Chuyển đổi số Năm 2026')).toBeInTheDocument();
      expect(
        screen.queryByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')
      ).not.toBeInTheDocument();
    });
  });

  it('Mở modal Tạo cuộc họp mới, hỗ trợ chọn nhanh theo phòng ban và lưu thành công', async () => {
    render(<MeetingManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Tạo cuộc họp mới')).toBeInTheDocument();
    });

    // Bấm nút tạo cuộc họp mới
    fireEvent.click(screen.getByText('Tạo cuộc họp mới'));

    await waitFor(() => {
      expect(
        screen.getByText(/Thiết lập cuộc họp mới/i, { selector: 'h3' })
      ).toBeInTheDocument();
      expect(screen.getByText('Chọn nhanh theo phòng ban:')).toBeInTheDocument();
    });

    // Điền tiêu đề và phòng họp
    const titleInput = screen.getByPlaceholderText(/VD: Họp Giao Ban Thường Kỳ Tháng 11\/2026/i);
    fireEvent.change(titleInput, { target: { value: 'Hội Nghị Sơ Kết Công Tác Năm 2026' } });

    const roomInput = screen.getByPlaceholderText(/VD: Hội trường số 1 - Tầng 2/i);
    fireEvent.change(roomInput, { target: { value: 'Hội trường Thành ủy' } });

    // Mở dropdown Chọn nhanh theo phòng ban và chọn "Bộ phận Địa chính - Xây dựng"
    const deptTrigger = screen.getByTestId('dept-multiselect-trigger');
    fireEvent.click(deptTrigger);
    const deptBtn = screen.getByRole('button', { name: /Bộ phận Địa chính - Xây dựng/i });
    fireEvent.click(deptBtn);

    // Bấm nút Tạo cuộc họp
    const submitBtn = screen.getByRole('button', { name: /^Tạo cuộc họp$/i });
    fireEvent.click(submitBtn);

    // Chờ modal đóng và cuộc họp mới xuất hiện trên bảng chính
    await waitFor(() => {
      expect(screen.getByText('Hội Nghị Sơ Kết Công Tác Năm 2026')).toBeInTheDocument();
      expect(screen.getByText('Hội trường Thành ủy')).toBeInTheDocument();
    });
  });

  it('Khóa thao tác Chỉnh sửa cuộc họp với cuộc họp đang diễn ra hoặc đã kết thúc, chỉ cho phép chỉnh sửa cuộc họp sắp diễn ra', async () => {
    render(<MeetingManagement tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ')).toBeInTheDocument();
      expect(screen.getByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')).toBeInTheDocument();
    });

    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });

    // 1. Cuộc họp đang diễn ra (Row 0): Menu Chỉnh sửa cuộc họp bị disabled
    fireEvent.click(actionBtns[0]);
    const editBtnDisabled = screen.getByRole('menuitem', { name: /Chỉnh sửa cuộc họp/i });
    expect(editBtnDisabled).toBeDisabled();

    // Đóng menu bằng cách click ra ngoài hoặc click lại nút
    fireEvent.click(actionBtns[0]);

    // 2. Cuộc họp sắp diễn ra (Row 1): Menu Chỉnh sửa cuộc họp khả dụng (enabled)
    fireEvent.click(actionBtns[1]);
    const editBtnEnabled = screen.getByRole('menuitem', { name: /Chỉnh sửa cuộc họp/i });
    expect(editBtnEnabled).not.toBeDisabled();

    // Bấm nút chỉnh sửa trong menu thao tác
    fireEvent.click(editBtnEnabled);

    await waitFor(() => {
      expect(
        screen.getByText(/Cập nhật lịch cuộc họp/i, { selector: 'h3' })
      ).toBeInTheDocument();
    });

    // Cập nhật tiêu đề
    const titleInput = screen.getByPlaceholderText(/VD: Họp Giao Ban Thường Kỳ Tháng 11\/2026/i);
    fireEvent.change(titleInput, { target: { value: 'Họp Giao Ban Đã Được Đổi Tên' } });

    // Bấm nút Lưu thay đổi
    const saveBtn = screen.getByRole('button', { name: /^Lưu thay đổi$/i });
    fireEvent.click(saveBtn);

    // Kiểm tra trên bảng chính đã cập nhật tên mới
    await waitFor(() => {
      expect(screen.getByText('Họp Giao Ban Đã Được Đổi Tên')).toBeInTheDocument();
    });
  });
});
