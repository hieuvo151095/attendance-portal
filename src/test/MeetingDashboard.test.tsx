import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MeetingDashboard } from '../pages/dashboard/MeetingDashboard';
import { authService } from '../services/auth';
import { dashboardService } from '../services/dashboard';
import { attendanceSettingService } from '../services/setting';

describe('Bảng Điều Khiển Phân Tích Chuyên Cần Cuộc Họp (DASH-03: Executive Meeting Dashboard)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Hiển thị bộ lọc số lượng cuộc họp gần nhất (5 đến 15) thay thế cho lọc ngày/tuần/tháng', async () => {
    const { container } = render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Xu Hướng Chuyên Cần & Cơ Cấu Điểm Danh')).toBeInTheDocument();
    });

    // Bộ lọc cuộc họp gần nhất
    const countSelect = container.querySelector('#meeting-dashboard-count-filter') as HTMLSelectElement;
    expect(countSelect).toBeInTheDocument();
    expect(countSelect.value).toBe('10');
    expect(screen.getAllByText('10 cuộc họp gần nhất').length).toBeGreaterThan(0);

    // Không còn bộ lọc ngày/tuần/tháng
    expect(screen.queryByTestId('period-dropdown-trigger')).toBeNull();
    expect(screen.queryByTestId('range-dropdown-trigger')).toBeNull();
  });

  it('Hiển thị 6 thẻ KPI: Thẻ Tổng số khách mời (bắt buộc to, tùy chọn nhỏ) và 5 thẻ còn lại tính trên đại biểu bắt buộc', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Tổng Số Khách Mời')).toBeInTheDocument();
    });

    // Thẻ 1: Tổng số khách mời
    expect(screen.getByText('bắt buộc')).toBeInTheDocument();
    expect(screen.getByText(/\+ \d+ tùy chọn/)).toBeInTheDocument();

    // 5 thẻ còn lại
    expect(screen.getByText('Tỷ Lệ Tham Dự')).toBeInTheDocument();
    expect(screen.getByText('Tỷ Lệ Đúng Giờ')).toBeInTheDocument();
    expect(screen.getByText('Đi Muộn')).toBeInTheDocument();
    expect(screen.getByText('Về Sớm')).toBeInTheDocument();
    expect(screen.getByText('Vắng')).toBeInTheDocument();
  });

  it('Biểu đồ cột Xu hướng chuyên cần: Mỗi cột đại diện cho 1 cuộc họp', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Xu Hướng Chuyên Cần Cuộc Họp \(10 cuộc họp gần nhất\)/)).toBeInTheDocument();
    });

    // Chú thích biểu đồ cột
    expect(screen.getAllByText('Đúng giờ').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đi muộn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Về sớm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vắng mặt').length).toBeGreaterThan(0);
    expect(screen.getByText('% Tham dự')).toBeInTheDocument();
  });

  it('Hiển thị biểu đồ Donut Tổng Quan Chuyên Cần Cả Năm (2026)', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-yearly-donut-card')).toBeInTheDocument();
      expect(screen.getByText('Tổng Quan Chuyên Cần Cả Năm (2026)')).toBeInTheDocument();
    });

    expect(screen.getByText('Tham dự cả năm')).toBeInTheDocument();
    expect(screen.getByText('Cuộc họp cả năm')).toBeInTheDocument();
    expect(screen.getByText('Lượt tham dự')).toBeInTheDocument();
    expect(screen.getByText('Đại biểu bắt buộc')).toBeInTheDocument();
  });

  it('Hiển thị thẻ Hiệu Suất & Tần Suất Sử Dụng Phòng Họp song hành cùng Tổng Quan Chuyên Cần Cả Năm', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-room-utilization-card')).toBeInTheDocument();
      expect(screen.getByText('Hiệu Suất & Tần Suất Sử Dụng Phòng Họp')).toBeInTheDocument();
    });

    const roomCard = screen.getByTestId('meeting-room-utilization-card');
    expect(within(roomCard).getAllByText(/Hội trường số 1/).length).toBeGreaterThanOrEqual(1);
    expect(within(roomCard).getByText(/Phòng họp Đa năng/)).toBeInTheDocument();
    expect(within(roomCard).getByText(/Dùng nhiều nhất/)).toBeInTheDocument();
    expect(within(roomCard).getByText(/Công suất lấp đầy TB/)).toBeInTheDocument();
    expect(within(roomCard).getByText(/Tổng thời lượng phòng/)).toBeInTheDocument();
  });

  it('Ẩn hoàn toàn giao diện chỉ tiêu mục tiêu khi Thiết lập không áp dụng mục tiêu (undefined)', async () => {
    // Giả lập cài đặt không có chỉ tiêu cuộc họp
    vi.spyOn(attendanceSettingService, 'getSettings').mockResolvedValue({
      tenantId: ubndTenant,
      workStartTime: '07:00',
      workEndTime: '16:00',
      targetOnTimeRate: 90,
      meetingTargetAttendanceRate: undefined,
      meetingTargetOnTimeRate: undefined,
      updatedAt: '2026-11-01'
    } as any);

    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('So Sánh Chuyên Cần Cuộc Họp Giữa Các Phòng Ban')).toBeInTheDocument();
    });

    // Không hiển thị "Mục tiêu chuẩn cơ quan" trong legend và không có marker 🎯
    expect(screen.queryByText(/Mục tiêu chuẩn cơ quan:/)).toBeNull();
    expect(screen.queryByText(/🎯/)).toBeNull();
  });

  it('Thay đổi số lượng cuộc họp cập nhật dữ liệu bảng điều khiển', async () => {
    const getDashboardSpy = vi.spyOn(dashboardService, 'getMeetingDashboardData');

    const { container } = render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Xu Hướng Chuyên Cần & Cơ Cấu Điểm Danh')).toBeInTheDocument();
    });

    const select = container.querySelector('#meeting-dashboard-count-filter') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: '5' } });

    await waitFor(() => {
      expect(getDashboardSpy).toHaveBeenCalledWith(ubndTenant, 5, undefined);
    });
  });

  it('Bấm nút Xuất Báo Cáo kích hoạt tải file CSV UTF-8 với dữ liệu chi tiết', async () => {
    const exportSpy = vi.spyOn(dashboardService, 'exportMeetingDashboardCsv').mockResolvedValue('MÃ CUỘC HỌP,TIÊU ĐỀ');

    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Xuất Báo Cáo')).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Xuất Báo Cáo/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportSpy).toHaveBeenCalled();
    });
  });

  it('Khôi phục card Cơ Cấu Phương Thức Xác Thực song hành cùng Xu Hướng Chuyên Cần Cuộc Họp', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-method-distribution-card')).toBeInTheDocument();
    });

    expect(screen.getByText('Cơ Cấu Phương Thức Xác Thực')).toBeInTheDocument();
    expect(screen.getByText('Nhận diện khuôn mặt (Camera Face ID)')).toBeInTheDocument();
    expect(screen.getByText('Thẻ nhân sự (RFID / NFC)')).toBeInTheDocument();
    expect(screen.getByText('Sinh trắc học vân tay')).toBeInTheDocument();
    expect(screen.getByText('Thẻ hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Có Face ID')).toBeInTheDocument();
    expect(screen.getByText('Có Vân tay')).toBeInTheDocument();
  });

  it('So Sánh Chuyên Cần Giữa Các Phòng Ban hiển thị số cuộc họp hoàn thành trong tháng và cả 2 chỉ tiêu mục tiêu', async () => {
    // Giả lập cài đặt có cả 2 mục tiêu: tham dự 90% và đúng giờ 80%
    vi.spyOn(attendanceSettingService, 'getSettings').mockResolvedValue({
      tenantId: ubndTenant,
      workStartTime: '07:00',
      workEndTime: '16:00',
      targetOnTimeRate: 85,
      meetingTargetAttendanceRate: 90,
      meetingTargetOnTimeRate: 80,
      updatedAt: '2026-11-01'
    } as any);

    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('So Sánh Chuyên Cần Cuộc Họp Giữa Các Phòng Ban')).toBeInTheDocument();
    });

    // 1. Ghi chú số cuộc họp hoàn thành cập nhật đến hết ngày 6/11
    expect(screen.getByText(/cuộc họp hoàn thành, cập nhật đến hết ngày 6\/11/)).toBeInTheDocument();

    // 2. Cả 2 mục tiêu riêng biệt hiển thị trên thanh giải thích
    expect(screen.getByText(/Mục tiêu tỷ lệ tham dự:/)).toBeInTheDocument();
    expect(screen.getByText(/Mục tiêu tỷ lệ đúng giờ:/)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();

    // 3. Cả 2 mốc chỉ tiêu xuất hiện trên thước đo
    expect(screen.getByText(/90% 🎯/)).toBeInTheDocument();
    expect(screen.getByText(/80% ⏱️/)).toBeInTheDocument();
  });

  it('Khối Cuộc Họp Đang Diễn Ra hiển thị thông tin sự kiện và danh sách đại biểu đã điểm danh có mặt', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-active-card')).toBeInTheDocument();
    });

    expect(screen.getByText('Cuộc Họp Đang Diễn Ra')).toBeInTheDocument();
    expect(screen.getAllByText('Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Đại Biểu Đã Có Mặt/)).toBeInTheDocument();

    // Đại biểu đã check-in
    expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
    expect(screen.getAllByText('Đúng giờ').length).toBeGreaterThanOrEqual(1);
  });
});
