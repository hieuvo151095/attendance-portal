import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentAttendanceComparison } from '../pages/dashboard/DepartmentAttendanceComparison';
import { DepartmentAttendanceMetric } from '../services/dashboard';

describe('Thành Phần So Sánh Chuyên Cần Giữa Các Phòng Ban (Biểu Đồ Thanh Ngang Kép & Chuyển Đổi Dạng Thẻ)', () => {
  const mockMetrics: DepartmentAttendanceMetric[] = [
    {
      id: 'dept-01',
      name: 'Văn phòng HĐND & UBND',
      code: 'VP-UBND',
      totalStaff: 6,
      presentCount: 6,
      onTimeCount: 6,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 100,
      onTimeRate: 100
    },
    {
      id: 'dept-02',
      name: 'Bộ phận Địa chính - Xây dựng - Đô thị',
      code: 'DC-XD',
      totalStaff: 5,
      presentCount: 4,
      onTimeCount: 2,
      lateCount: 2,
      absentCount: 1,
      attendanceRate: 80,
      onTimeRate: 50
    },
    {
      id: 'dept-03',
      name: 'Bộ phận Tư pháp - Hộ tịch',
      code: 'TP-HT',
      totalStaff: 4,
      presentCount: 4,
      onTimeCount: 4,
      lateCount: 0,
      absentCount: 0,
      attendanceRate: 100,
      onTimeRate: 100
    },
    {
      id: 'dept-04',
      name: 'Ban Chỉ huy Quân sự Phường',
      code: 'BCH-QS',
      totalStaff: 4,
      presentCount: 4,
      onTimeCount: 3,
      lateCount: 1,
      absentCount: 0,
      attendanceRate: 100,
      onTimeRate: 75
    },
    {
      id: 'dept-05',
      name: 'Công An Phường Bến Nghé',
      code: 'CAP',
      totalStaff: 6,
      presentCount: 5,
      onTimeCount: 5,
      lateCount: 0,
      absentCount: 1,
      attendanceRate: 83,
      onTimeRate: 100
    }
  ];

  it('Mặc định hiển thị chế độ Biểu đồ thanh ngang kép với chú thích, thang đo và mục tiêu 90%', () => {
    render(<DepartmentAttendanceComparison metrics={mockMetrics} />);

    // Tiêu đề và tổng số phòng ban
    expect(screen.getByText('So Sánh Chuyên Cần Giữa Các Phòng Ban')).toBeInTheDocument();
    expect(screen.getByText('5 phòng ban trực thuộc')).toBeInTheDocument();

    // Ghi chú phạm vi tháng hiện tại và thời điểm chốt dữ liệu
    expect(screen.getByText(/trong tháng hiện tại/)).toBeInTheDocument();
    expect(screen.getByText('Dữ liệu được cập nhật đến hết ngày 6/11')).toBeInTheDocument();

    // Không còn nhãn Có mặt / Đúng giờ ở bên phải các thanh biểu đồ
    expect(screen.queryByText(/^Có mặt:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Đúng giờ:/)).not.toBeInTheDocument();

    // Chú thích biểu đồ
    expect(screen.getAllByText(/Tỷ lệ hiện diện/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tỷ lệ đúng giờ/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mục tiêu tỷ lệ đúng giờ:/)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();

    // Huy hiệu dẫn đầu
    expect(screen.getByText(/Dẫn đầu chuyên cần:/)).toBeInTheDocument();

    // Trục đo tỷ lệ
    expect(screen.getByText('ĐƠN VỊ TRỰC THUỘC')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('75%').length).toBeGreaterThan(0);
    expect(screen.getByText(/90% 🎯/)).toBeInTheDocument();
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);

    // Tên các phòng ban
    expect(screen.getByText('Văn phòng HĐND & UBND')).toBeInTheDocument();
    expect(screen.getByText('Bộ phận Địa chính - Xây dựng - Đô thị')).toBeInTheDocument();
  });

  it('Chuyển đổi linh hoạt giữa chế độ Biểu đồ và Dạng thẻ (Cards Grid)', () => {
    render(<DepartmentAttendanceComparison metrics={mockMetrics} />);

    const chartBtn = screen.getByTestId('dept-view-chart-btn');
    const cardsBtn = screen.getByTestId('dept-view-cards-btn');

    expect(chartBtn).toHaveClass('active');
    expect(screen.queryByTestId('dept-cards-grid')).not.toBeInTheDocument();

    // Bấm sang chế độ Dạng thẻ
    fireEvent.click(cardsBtn);
    expect(cardsBtn).toHaveClass('active');
    expect(screen.getByTestId('dept-cards-grid')).toBeInTheDocument();

    // Các thẻ hiển thị chỉ số chi tiết
    expect(screen.getAllByText(/Mã: /).length).toBe(5);

    // Bấm quay lại Biểu đồ
    fireEvent.click(chartBtn);
    expect(chartBtn).toHaveClass('active');
    expect(screen.queryByTestId('dept-cards-grid')).not.toBeInTheDocument();
    expect(screen.getByText('ĐƠN VỊ TRỰC THUỘC')).toBeInTheDocument();
  });

  it('Hỗ trợ sắp xếp theo Tỷ lệ hiện diện giảm dần và Tỷ lệ đúng giờ giảm dần', () => {
    render(<DepartmentAttendanceComparison metrics={mockMetrics} />);

    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();

    // Sắp xếp theo tỷ lệ hiện diện giảm dần
    fireEvent.change(sortSelect, { target: { value: 'attendance' } });

    // Kiểm tra hàng đầu tiên là phòng ban 100%
    const rows = screen.getAllByText(/cán bộ/);
    expect(rows.length).toBeGreaterThan(0);

    // Sắp xếp theo tỷ lệ đúng giờ giảm dần
    fireEvent.change(sortSelect, { target: { value: 'onTime' } });
    expect(sortSelect).toHaveValue('onTime');
  });

  it('Hỗ trợ mục tiêu chuẩn cơ quan linh hoạt từ Thiết Lập (targetOnTimeRate)', () => {
    render(<DepartmentAttendanceComparison metrics={mockMetrics} targetOnTimeRate={95} />);

    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText(/95% 🎯/)).toBeInTheDocument();
  });

  it('Chấm công: Thanh biểu đồ luôn giữ màu Xanh lá & Xanh dương; Tỷ lệ đúng giờ chưa đạt mục tiêu hiển thị "Cần lưu ý" màu đỏ', () => {
    // mockMetrics có:
    // dept-02 (Địa chính): onTimeRate 50% (< 90%) -> Cần lưu ý
    // dept-04 (Quân sự): onTimeRate 75% (< 90%) -> Cần lưu ý
    // dept-01, 03, 05: onTimeRate 100% (>= 90%) -> Tốt
    const { container } = render(<DepartmentAttendanceComparison metrics={mockMetrics} targetOnTimeRate={90} />);

    // Kiểm tra text "Cần lưu ý" xuất hiện (cho phòng ban chưa đạt mục tiêu đúng giờ)
    const warningLabels = screen.getAllByText('Cần lưu ý');
    expect(warningLabels.length).toBe(2);

    // Kiểm tra text "Tốt" xuất hiện (cho phòng ban đạt mục tiêu)
    const goodLabels = screen.getAllByText('Tốt');
    expect(goodLabels.length).toBe(3);

    // Kiểm tra màu thanh biểu đồ: Không có thanh màu cam (#F59E0B), chỉ có xanh lá (#10B981) và xanh dương (#0070CE)
    const bars = container.querySelectorAll('div[style*="background-color"]');
    const bgColors = Array.from(bars).map((el) => (el as HTMLElement).style.backgroundColor);
    expect(bgColors).not.toContain('rgb(245, 158, 11)'); // #F59E0B
  });

  it('Cuộc họp: Nếu một trong hai (Tỷ lệ tham dự hoặc Tỷ lệ đúng giờ) chưa đạt mục tiêu thì hiển thị "Cần lưu ý"', () => {
    // Giả lập cuộc họp với 2 mục tiêu: Tham dự 90% và Đúng giờ 80%
    // dept-04 (Quân sự): attendance 100% (>=90%), nhưng onTimeRate 75% (< 80%) -> Cần lưu ý
    // dept-05 (Công an): onTimeRate 100% (>=80%), nhưng attendanceRate 83% (< 90%) -> Cần lưu ý
    // dept-02 (Địa chính): attendance 80% (<90%) và onTime 50% (<80%) -> Cần lưu ý
    // dept-01 (Văn phòng), dept-03 (Tư pháp): cả 2 đều 100% -> Tốt
    render(
      <DepartmentAttendanceComparison
        metrics={mockMetrics}
        targetAttendanceRate={90}
        targetOnTimeRate={80}
        attendanceLabel="Tỷ lệ tham dự"
        hideTargetIfEmpty={true}
      />
    );

    const warningLabels = screen.getAllByText('Cần lưu ý');
    expect(warningLabels.length).toBe(3); // dept-02, dept-04, dept-05

    const goodLabels = screen.getAllByText('Tốt');
    expect(goodLabels.length).toBe(2); // dept-01, dept-03
  });
});
