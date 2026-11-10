import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AttendanceDashboard } from '../pages/dashboard/AttendanceDashboard';
import { authService } from '../services/auth';
import { dashboardService } from '../services/dashboard';

describe('Bảng Điều Khiển Tổng Quan Điểm Danh & Chuyên Cần Toàn Cơ Quan (DASH-02: Executive Attendance Dashboard)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Hiển thị tiêu đề, các nút chọn kỳ thống kê và các chỉ số KPI hiện diện', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Tổng Quan Điểm Danh & Chuyên Cần')).toBeInTheDocument();
    });

    // Khung chọn kỳ & phạm vi ngày thực tế
    const periodTrigger = screen.getByTestId('period-dropdown-trigger');
    expect(periodTrigger).toHaveTextContent('Theo ngày');

    const rangeTrigger = screen.getByTestId('range-dropdown-trigger');
    expect(rangeTrigger).toHaveTextContent('24/10 - 06/11');

    // Mở dropdown phạm vi hiển thị lịch chọn ngày
    fireEvent.click(rangeTrigger);
    expect(screen.getByTestId('calendar-range-popover')).toBeInTheDocument();
    expect(screen.getByText('Chọn phạm vi ngày')).toBeInTheDocument();

    // Các thẻ KPI StatCard
    expect(screen.getByText('Tỷ Lệ Hiện Diện')).toBeInTheDocument();
    expect(screen.getByText('Tỷ Lệ Đúng Giờ')).toBeInTheDocument();
    expect(screen.getByText('Đi Muộn')).toBeInTheDocument();
    expect(screen.getByText('Về Sớm')).toBeInTheDocument();
    expect(screen.getByText('Vắng')).toBeInTheDocument();
    expect(screen.queryByText('Chuyên Cần Cuộc Họp')).toBeNull();
  });

  it('Hiển thị biểu đồ xu hướng hiện diện (SVG Trend Chart) với trục X theo ngày và chú thích các loại hình', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText(/Xu Hướng Hiện Diện & Chuyên Cần \(14 ngày qua\)/)).toBeInTheDocument();
    });

    // Trục X hiển thị các mốc ngày (mặc định 14 ngày kết thúc vào 06/11)
    expect(screen.getByText('24/10')).toBeInTheDocument();
    expect(screen.getByText('06/11')).toBeInTheDocument();

    expect(screen.getAllByText('Đúng giờ').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Đi muộn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Về sớm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vắng mặt').length).toBeGreaterThan(0);
    expect(screen.getByText('% Hiện diện')).toBeInTheDocument();
  });

  it('Hiển thị cơ cấu phương thức xác thực (Camera AI Face ID, Thẻ RFID, Vân tay)', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Cơ Cấu Phương Thức Xác Thực')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Nhận diện khuôn mặt (Camera Face ID)')
    ).toBeInTheDocument();
    expect(screen.getByText('Thẻ nhân sự (RFID / NFC)')).toBeInTheDocument();
    expect(screen.getByText('Sinh trắc học vân tay')).toBeInTheDocument();
    expect(screen.getByText('Thẻ hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Có Face ID')).toBeInTheDocument();
    expect(screen.getByText('Có Vân tay')).toBeInTheDocument();
  });

  it('Hiển thị ma trận so sánh chuyên cần giữa các phòng ban với thanh tiến trình Meter', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(
        screen.getByText('So Sánh Chuyên Cần Giữa Các Phòng Ban')
      ).toBeInTheDocument();
    });

    // Tên các phòng ban
    expect(screen.getAllByText('Văn phòng HĐND & UBND').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bộ phận Địa chính - Xây dựng - Đô thị').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bộ phận Tư pháp - Hộ tịch').length).toBeGreaterThan(0);
  });

  it('Tab Chấm công: Không chia sẻ Cuộc Họp Đã Hoàn Tất Gần Nhất, hiển thị Chấm công hôm nay và Nghỉ phép và Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày (Action Center)', async () => {
    const handleNavigate = vi.fn();
    render(<AttendanceDashboard tenantId={ubndTenant} onNavigateTab={handleNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Chấm công hôm nay và Nghỉ phép')).toBeInTheDocument();
      expect(screen.getByText('Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày')).toBeInTheDocument();
    });

    // Cuộc họp đã hoàn tất KHÔNG được hiển thị ở tab Chấm công
    expect(screen.queryByText('Cuộc Họp Đã Hoàn Tất Gần Nhất')).not.toBeInTheDocument();

    // Thẻ Quân Số Hiện Diện & Nghỉ Phép Hôm Nay có các mục trạng thái
    expect(screen.getAllByText('Đang có mặt').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nghỉ phép').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chưa đến / Vắng').length).toBeGreaterThanOrEqual(1);

    // Trung tâm cảnh báo bất thường hiển thị các nhóm việc cần xử lý
    expect(screen.getAllByText(/Quên check-out/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chuyên cần đột biến/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Thiết bị/).length).toBeGreaterThan(0);

    // Nút chuyển tab sang màn hình chấm công
    const viewAttendanceBtns = screen.getAllByText('Màn hình chấm công');
    fireEvent.click(viewAttendanceBtns[0]);
    expect(handleNavigate).toHaveBeenCalledWith('attendance');
  });

  it('Chuyển đổi linh hoạt kỳ báo cáo (Theo ngày -> Theo tuần -> Theo tháng) và phạm vi', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('period-dropdown-trigger')).toHaveTextContent('Theo ngày');
    });

    // Mở dropdown kỳ và chuyển sang Theo tuần (tối đa 12 tuần)
    const periodTrigger = screen.getByTestId('period-dropdown-trigger');
    fireEvent.click(periodTrigger);
    const weekOption = screen.getByText('Theo tuần');
    fireEvent.click(weekOption);

    await waitFor(() => {
      expect(screen.getByText(/Xu Hướng Hiện Diện & Chuyên Cần \(12 tuần qua\)/)).toBeInTheDocument();
      expect(screen.getByTestId('range-dropdown-trigger')).toHaveTextContent('15/08 - 06/11');
    });

    // Mở dropdown kỳ và chuyển sang Theo tháng (tối đa 12 tháng)
    fireEvent.click(screen.getByTestId('period-dropdown-trigger'));
    const monthOption = screen.getByText('Theo tháng');
    fireEvent.click(monthOption);

    await waitFor(() => {
      expect(screen.getByText(/Xu Hướng Hiện Diện & Chuyên Cần \(12 tháng qua\)/)).toBeInTheDocument();
      expect(screen.getByTestId('range-dropdown-trigger')).toHaveTextContent('01/12/2025 - 30/11/2026');
    });
  });

  it('Hỗ trợ xuất báo cáo tổng quan ra file Excel/CSV UTF-8', async () => {
    const exportSpy = vi.spyOn(dashboardService, 'exportDashboardCsv');
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Xuất Báo Cáo')).toBeInTheDocument();
    });

    const exportBtn = screen.getByText('Xuất Báo Cáo');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportSpy).toHaveBeenCalled();
    });
  });

  it('Hỗ trợ chuyển đổi mượt mà giữa 2 tab Chấm Công và Cuộc Họp trong Bảng điều khiển', async () => {
    render(<AttendanceDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-subtabs-container')).toBeInTheDocument();
    });

    const attendanceTabBtn = screen.getByTestId('dashboard-tab-attendance');
    const meetingsTabBtn = screen.getByTestId('dashboard-tab-meetings');

    expect(attendanceTabBtn).toBeInTheDocument();
    expect(meetingsTabBtn).toBeInTheDocument();

    // Mặc định tab Chấm công đang mở
    expect(screen.getByText('Tổng Quan Điểm Danh & Chuyên Cần')).toBeInTheDocument();

    // Bấm chuyển sang tab Cuộc Họp
    fireEvent.click(meetingsTabBtn);

    await waitFor(() => {
      // Tiêu đề vẫn giữ nguyên "Tổng Quan Điểm Danh & Chuyên Cần" khi chuyển sang tab Cuộc Họp
      expect(screen.getByText('Tổng Quan Điểm Danh & Chuyên Cần')).toBeInTheDocument();
      expect(screen.getByTestId('meeting-overview-group')).toBeInTheDocument();
    });

    // 6 Thẻ KPI của Cuộc Họp
    expect(screen.getByText('Tổng Số Khách Mời')).toBeInTheDocument();
    expect(screen.getByText('Tỷ Lệ Tham Dự')).toBeInTheDocument();
    expect(screen.getByText('Tỷ Lệ Đúng Giờ')).toBeInTheDocument();
    expect(screen.getByText('Đi Muộn')).toBeInTheDocument();
    expect(screen.getByText('Về Sớm')).toBeInTheDocument();
    expect(screen.getByText('Vắng')).toBeInTheDocument();

    // Biểu đồ xu hướng và biểu đồ donut tổng quan cả năm
    expect(screen.getByText(/Xu Hướng Chuyên Cần Cuộc Họp/)).toBeInTheDocument();
    expect(screen.getByText('Tổng Quan Chuyên Cần Cả Năm (2026)')).toBeInTheDocument();

    // So sánh chuyên cần cuộc họp phòng ban
    expect(screen.getByText('So Sánh Chuyên Cần Cuộc Họp Giữa Các Phòng Ban')).toBeInTheDocument();

    // Bấm quay lại tab Chấm Công
    fireEvent.click(attendanceTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Tổng Quan Điểm Danh & Chuyên Cần')).toBeInTheDocument();
      expect(screen.getByTestId('attendance-overview-group')).toBeInTheDocument();
    });
  });

  it('Action Center: Chuyển đổi tab Tất cả, Chuyên cần đột biến và bấm Kiểm tra thiết bị dẫn đến settings devices', async () => {
    const handleNavigateTab = vi.fn();
    render(<AttendanceDashboard tenantId={ubndTenant} onNavigateTab={handleNavigateTab} />);

    await waitFor(() => {
      expect(screen.getByText(/Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày/)).toBeInTheDocument();
    });

    const actionCenter = screen.getByTestId('attendance-action-center-card');
    const withinAC = within(actionCenter);

    // Mặc định tab "Tất cả" được chọn
    const tabAll = withinAC.getByRole('button', { name: /Tất cả/ });
    expect(tabAll).toHaveStyle({ backgroundColor: '#eff6ff', color: '#1d4ed8' });

    // Bấm sang tab "Chuyên cần đột biến"
    const tabAnomaly = withinAC.getByRole('button', { name: /Chuyên cần đột biến/ });
    fireEvent.click(tabAnomaly);
    expect(tabAnomaly).toHaveStyle({ backgroundColor: '#fee2e2', color: '#b91c1c' });

    // Bấm sang tab "Thiết bị"
    const tabDevice = withinAC.getByRole('button', { name: /Thiết bị/ });
    fireEvent.click(tabDevice);
    expect(tabDevice).toHaveStyle({ backgroundColor: '#f1f5f9', color: '#334155' });

    // Kiểm tra tỉ lệ thiết bị đồng bộ đúng với Quản trị thiết bị (3/5 đang hoạt động)
    expect(withinAC.getByText('3/5 đang hoạt động')).toBeInTheDocument();

    // Bấm nút "Kiểm tra" trong mục thiết bị
    const checkBtns = withinAC.getAllByRole('button', { name: 'Kiểm tra' });
    expect(checkBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(checkBtns[0]);

    // Xác nhận gọi onNavigateTab('settings', 'devices')
    expect(handleNavigateTab).toHaveBeenCalledWith('settings', 'devices');
  });
});
