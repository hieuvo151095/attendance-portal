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

  it('Hiển thị bộ lọc số lượng cuộc họp gần nhất (chỉ gồm 4 tùy chọn: 6, 9, 12, 15) thay thế cho lọc ngày/tuần/tháng', async () => {
    const { container } = render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Xu Hướng Chuyên Cần & Cơ Cấu Điểm Danh')).toBeInTheDocument();
    });

    // Bộ lọc cuộc họp gần nhất
    const countSelect = container.querySelector('#meeting-dashboard-count-filter') as HTMLSelectElement;
    expect(countSelect).toBeInTheDocument();
    expect(countSelect.value).toBe('6');
    expect(screen.getAllByText('6 cuộc họp gần nhất').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9 cuộc họp gần nhất').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12 cuộc họp gần nhất').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15 cuộc họp gần nhất').length).toBeGreaterThan(0);

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
      expect(screen.getByText(/Xu Hướng Chuyên Cần Cuộc Họp \(6 cuộc họp gần nhất\)/)).toBeInTheDocument();
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
    fireEvent.change(select, { target: { value: '9' } });

    await waitFor(() => {
      expect(getDashboardSpy).toHaveBeenCalledWith(ubndTenant, 9, undefined);
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
    expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1);

    // 3. Cả 2 mốc chỉ tiêu xuất hiện trên thước đo
    expect(screen.getByText(/90% 🎯/)).toBeInTheDocument();
    expect(screen.getByText(/80% ⏱️/)).toBeInTheDocument();
  });

  it('Khối Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần hiển thị tỷ lệ chấp hành, đơn vị cần lưu ý và đại biểu vắng/muộn', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-compliance-card')).toBeInTheDocument();
    });

    const complianceCard = screen.getByTestId('meeting-compliance-card');

    // 1. Tiêu đề và nhãn thẻ
    expect(within(complianceCard).getByText('Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần')).toBeInTheDocument();
    expect(within(complianceCard).getByText('Kỷ luật công vụ')).toBeInTheDocument();

    // 2. Chỉ số kỷ luật hành chính trong kỳ
    expect(within(complianceCard).getByText('Chấp hành')).toBeInTheDocument();
    expect(within(complianceCard).getAllByText('94%').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).getAllByText('Có phép').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).getAllByText('Không phép').length).toBeGreaterThanOrEqual(1);

    // 3. Đơn vị cần chấn chỉnh (Đã bỏ nhãn "Cần lưu ý" và "Cần chấn chỉnh")
    expect(within(complianceCard).getByText(/Đơn vị cần chấn chỉnh kỷ luật/)).toBeInTheDocument();
    expect(within(complianceCard).getAllByText('Bộ phận Địa chính - Xây dựng - Đô thị').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).getAllByText('Ban Chỉ huy Quân sự Phường').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).queryByText('Cần chấn chỉnh')).toBeNull();
    expect(within(complianceCard).queryByText('Cần lưu ý')).toBeNull();

    // 4. Danh sách đại biểu vắng/muộn gần nhất (Đã bỏ chữ "Nhắc nhở" và "Yêu cầu giải trình")
    expect(within(complianceCard).getByText('Danh sách đại biểu vắng / muộn gần nhất')).toBeInTheDocument();
    expect(within(complianceCard).getAllByText('Bà Phạm Thị Cúc').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).getAllByText('Ông Hoàng Văn Đức').length).toBeGreaterThanOrEqual(1);
    expect(within(complianceCard).getByText('Đ/c Lê Văn Hùng')).toBeInTheDocument();
    expect(within(complianceCard).queryByText('Nhắc nhở')).toBeNull();
    expect(within(complianceCard).queryByText('Yêu cầu giải trình')).toBeNull();
  });

  it('Khối Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần: Quản lý theo tháng, mặc định tháng hiện tại (11/2026) kèm ghi chú, cho phép chọn bất kỳ tháng nào trong năm', async () => {
    render(<MeetingDashboard tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByTestId('meeting-compliance-card')).toBeInTheDocument();
    });

    const complianceCard = screen.getByTestId('meeting-compliance-card');

    // 1. Dòng ghi chú hiển thị rõ việc thu thập dữ liệu theo từng tháng, mặc định tháng hiện tại
    const noteBanner = within(complianceCard).getByTestId('meeting-discipline-note');
    expect(noteBanner).toBeInTheDocument();
    expect(within(noteBanner).getByText(/Dữ liệu kỳ họp được thu thập theo/i)).toBeInTheDocument();
    expect(within(noteBanner).getByText(/Tháng 11\/2026 — tháng hiện tại/i)).toBeInTheDocument();

    // 2. Nút chọn tháng hiển thị mặc định: "Tháng 11/2026 (Hiện tại)"
    const monthPickerBtn = within(complianceCard).getByRole('button', { name: /Tháng 11\/2026/i });
    expect(monthPickerBtn).toBeInTheDocument();
    expect(within(complianceCard).getByText(/Dựa trên các kỳ họp trong Tháng 11\/2026/i)).toBeInTheDocument();

    // 3. Bấm vào nút để mở popover Lịch chọn tháng trong năm
    fireEvent.click(monthPickerBtn);

    const calendarDialog = screen.getByRole('dialog', { name: 'Lịch chọn tháng kỷ luật' });
    expect(calendarDialog).toBeInTheDocument();
    expect(within(calendarDialog).getByText('Năm 2026')).toBeInTheDocument();

    // Tháng 12 (tương lai) bị vô hiệu hóa
    const thg12Btn = within(calendarDialog).getByRole('button', { name: /Thg 12/i });
    expect(thg12Btn).toBeDisabled();

    // 4. Chọn một tháng trong quá khứ (Tháng 10)
    const thg10Btn = within(calendarDialog).getByRole('button', { name: /Thg 10/i });
    expect(thg10Btn).not.toBeDisabled();
    fireEvent.click(thg10Btn);

    // Popover tự động đóng và dữ liệu chuyển sang Tháng 10/2026
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Lịch chọn tháng kỷ luật' })).not.toBeInTheDocument();
      expect(within(complianceCard).getByText(/Dựa trên các kỳ họp trong Tháng 10\/2026/i)).toBeInTheDocument();
      expect(within(complianceCard).getByText('90%')).toBeInTheDocument();
    });

    // 5. Bấm "Về tháng hiện tại" trên banner thông báo để quay lại Tháng 11/2026
    const backToCurrentBtn = within(complianceCard).getByRole('button', { name: /Về tháng hiện tại/i });
    fireEvent.click(backToCurrentBtn);

    await waitFor(() => {
      expect(within(complianceCard).getByText(/Dựa trên các kỳ họp trong Tháng 11\/2026/i)).toBeInTheDocument();
      expect(within(complianceCard).getByText('94%')).toBeInTheDocument();
    });
  });

  it('Khối Cuộc Họp Gần Đây không hiển thị nút "Xem chi tiết", chỉ hiển thị "Biên bản & Báo cáo" cho cuộc họp đã kết thúc', async () => {
    const onNavigateTabMock = vi.fn();
    render(<MeetingDashboard tenantId={ubndTenant} onNavigateTab={onNavigateTabMock} />);

    await waitFor(() => {
      expect(screen.getByText('Cuộc Họp Gần Đây')).toBeInTheDocument();
    });

    // 1. Tuyệt đối không hiển thị nút "Xem chi tiết" trên bất kỳ thẻ cuộc họp nào
    expect(screen.queryByText('Xem chi tiết')).toBeNull();

    // 2. Thẻ cuộc họp đã kết thúc vẫn có nút "Biên bản & Báo cáo"
    const reportBtn = screen.getByRole('button', { name: 'Biên bản & Báo cáo' });
    expect(reportBtn).toBeInTheDocument();
    fireEvent.click(reportBtn);
    expect(onNavigateTabMock).toHaveBeenCalledWith('reports');
  });
});
