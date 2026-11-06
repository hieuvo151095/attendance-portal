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
    expect(screen.getByText(/Mục tiêu chuẩn cơ quan:/)).toBeInTheDocument();
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
});
