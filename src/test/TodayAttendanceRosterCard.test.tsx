import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodayAttendanceRosterCard } from '../pages/dashboard/TodayAttendanceRosterCard';
import { TodayAttendanceRoster } from '../services/dashboard';

const mockRoster: TodayAttendanceRoster = {
  totalStaff: 25,
  presentCount: 22,
  onTimeCount: 19,
  lateCount: 3,
  leaveCount: 2,
  absentCount: 1,
  items: [
    {
      id: 'roster-1',
      employeeId: 'emp-1',
      employeeName: 'Đ/c Nguyễn Văn An',
      employeeCode: 'UBND-001',
      departmentName: 'Văn phòng HĐND & UBND',
      status: 'present',
      statusLabel: 'Đúng giờ',
      checkInTime: '07:15'
    },
    {
      id: 'roster-2',
      employeeId: 'emp-2',
      employeeName: 'Bà Phạm Thị Cúc',
      employeeCode: 'UBND-002',
      departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
      status: 'late',
      statusLabel: 'Đi muộn (15p)',
      checkInTime: '07:45',
      lateMinutes: 15
    },
    {
      id: 'roster-3',
      employeeId: 'emp-3',
      employeeName: 'Bà Đặng Kim Ngân',
      employeeCode: 'UBND-009',
      departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
      status: 'leave',
      statusLabel: 'Nghỉ phép',
      leaveReason: 'Nghỉ phép năm'
    },
    {
      id: 'roster-4',
      employeeId: 'emp-4',
      employeeName: 'Trung úy Tạ Đình Khang',
      employeeCode: 'UBND-022',
      departmentName: 'Công An Phường Bến Nghé',
      status: 'leave',
      statusLabel: 'Nghỉ phép',
      leaveReason: 'Đi công tác đột xuất'
    },
    {
      id: 'roster-5',
      employeeId: 'emp-5',
      employeeName: 'Ông Bùi Tiến Dũng',
      employeeCode: 'UBND-010',
      departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
      status: 'absent',
      statusLabel: 'Chưa đến / Vắng',
      note: 'Chưa check-in'
    }
  ]
};

describe('TodayAttendanceRosterCard - Chấm công hôm nay và Nghỉ phép', () => {
  it('Hiển thị tiêu đề thẻ và các chỉ số tóm tắt Có mặt, Nghỉ phép, Chưa đến', () => {
    render(<TodayAttendanceRosterCard roster={mockRoster} />);

    expect(screen.getByText('Chấm công hôm nay và Nghỉ phép')).toBeInTheDocument();
    expect(screen.getAllByText('Đang có mặt').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nghỉ phép').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chưa đến / Vắng').length).toBeGreaterThanOrEqual(1);

    // Giá trị KPI
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Lọc theo các nút bấm phân loại: Tất cả, Nghỉ phép, Chưa đến / Vắng, Có mặt (đã bỏ Nghỉ phép & Vắng)', () => {
    render(<TodayAttendanceRosterCard roster={mockRoster} />);

    // Đã xóa tab Nghỉ phép & Vắng
    expect(screen.queryByRole('button', { name: /Nghỉ phép & Vắng/i })).not.toBeInTheDocument();

    // Ban đầu hiển thị tất cả 5 cán bộ
    expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Bà Đặng Kim Ngân')).toBeInTheDocument();
    expect(screen.getByText('Ông Bùi Tiến Dũng')).toBeInTheDocument();

    // Bấm lọc Nghỉ phép
    const leaveBtn = screen.getByRole('button', { name: /Nghỉ phép \(2\)/i });
    fireEvent.click(leaveBtn);

    // Chỉ hiển thị 2 cán bộ nghỉ phép cùng lý do chuẩn hóa khớp với module Chấm công
    expect(screen.getByText('Bà Đặng Kim Ngân')).toBeInTheDocument();
    expect(screen.getByText('Trung úy Tạ Đình Khang')).toBeInTheDocument();
    expect(screen.getByText('Nghỉ phép năm')).toBeInTheDocument();
    expect(screen.getByText('Đi công tác đột xuất')).toBeInTheDocument();
    expect(screen.queryByText('Đ/c Nguyễn Văn An')).not.toBeInTheDocument();
    expect(screen.queryByText('Ông Bùi Tiến Dũng')).not.toBeInTheDocument();

    // Bấm lọc Chưa đến / Vắng
    const absentBtn = screen.getByRole('button', { name: /Chưa đến \/ Vắng \(1\)/i });
    fireEvent.click(absentBtn);

    expect(screen.getByText('Ông Bùi Tiến Dũng')).toBeInTheDocument();
    expect(screen.queryByText('Bà Đặng Kim Ngân')).not.toBeInTheDocument();

    // Bấm quay lại Tất cả
    const allBtn = screen.getByRole('button', { name: /Tất cả \(25\)/i });
    fireEvent.click(allBtn);

    expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Bà Đặng Kim Ngân')).toBeInTheDocument();
  });

  it('Bấm nút xem chi tiết bảng chấm công gọi hàm onNavigateTab', () => {
    const handleNavigate = vi.fn();
    render(<TodayAttendanceRosterCard roster={mockRoster} onNavigateTab={handleNavigate} />);

    const linkBtn = screen.getByRole('button', { name: /Màn hình chấm công/i });
    fireEvent.click(linkBtn);

    expect(handleNavigate).toHaveBeenCalledWith('attendance');
  });
});
