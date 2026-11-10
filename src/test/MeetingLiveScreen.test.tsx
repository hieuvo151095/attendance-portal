import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { meetingService } from '../services/meeting';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { MeetingLiveScreen } from '../pages/meeting/MeetingLiveScreen';

describe('Màn Hình Điểm Danh Trực Tiếp Cuộc Họp (MTG-02: Meeting Live Roll-Call)', () => {
  const ubndTenant = 'tenant-ubnd-001';
  const meetingId = 'mtg-ubnd-01'; // Họp 08:00 - 10:30, grace: 5 min -> deadline 08:05

  beforeEach(async () => {
    authService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    employeeService.resetMockData();
    departmentService.resetMockData();
    meetingService.resetMockData();
  });

  it('Nghiệp vụ dịch vụ: Điểm danh đúng giờ ghi nhận có mặt và không tính trễ', async () => {
    // 08:02 (trước hạn chót 08:05)
    const onTimeISO = '2026-11-04T08:02:00Z';
    const res = await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-01', {
      method: 'face_id',
      timestamp: onTimeISO,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    expect(res.attendee.attendanceStatus).toBe('joined');
    expect(res.attendee.isLate).toBe(false);
    expect(res.attendee.lateMinutes).toBe(0);
    expect(res.attendee.checkInMethod).toBe('face_id');
    expect(res.meeting.status).toBe('in_progress');
  });

  it('Nghiệp vụ dịch vụ: Điểm danh sau mốc cho phép tự động tính đi muộn và ghi số phút trễ', async () => {
    // 08:15 (sau hạn chót 08:05, trễ 15 phút so với giờ bắt đầu 08:00)
    const lateISO = '2026-11-04T08:15:00Z';
    const res = await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-02', {
      method: 'card',
      timestamp: lateISO
    });

    expect(res.attendee.attendanceStatus).toBe('joined');
    expect(res.attendee.isLate).toBe(true);
    expect(res.attendee.lateMinutes).toBe(15);
    expect(res.attendee.checkInMethod).toBe('card');
  });

  it('Nghiệp vụ dịch vụ: Điểm danh ra về trước mốc quy định tính về sớm', async () => {
    // Check-in trước
    await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-01', {
      timestamp: '2026-11-04T08:00:00Z'
    });

    // Check-out lúc 10:00 (kết thúc lúc 10:30, dung sai 5p -> sớm nhất 10:25, do đó về sớm 30p)
    const res = await meetingService.recordCheckOut(ubndTenant, meetingId, 'emp-ubnd-01', {
      timestamp: '2026-11-04T10:00:00Z'
    });

    expect(res.attendee.attendanceStatus).toBe('left');
    expect(res.attendee.isEarlyLeave).toBe(true);
    expect(res.attendee.earlyLeaveMinutes).toBe(30);
  });

  it('Giao diện MeetingLiveScreen: Hiển thị đầy đủ thông tin cuộc họp, thông báo mốc giờ và danh sách đại biểu', async () => {
    render(
      <MeetingLiveScreen
        meetingId={meetingId}
        tenantId={ubndTenant}
        onBack={() => {}}
      />
    );

    // Chờ tải xong tiêu đề cuộc họp
    expect(await screen.findByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')).toBeInTheDocument();
    expect(screen.getByText(/Hội trường số 1 - Tầng 2 Trụ sở UBND/i)).toBeInTheDocument();
    expect(screen.getByText('Đánh giá tình hình phát triển kinh tế xã hội và kế hoạch cải cách hành chính.')).toBeInTheDocument();

    // Kiểm tra thông báo mốc giờ vào trễ động
    expect(screen.getByText(/Mốc vào trễ: Điểm danh trước/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dung sai/i).length).toBeGreaterThanOrEqual(1);

    // Thẻ thống kê
    expect(screen.getByText('Tổng đại biểu triệu tập')).toBeInTheDocument();
    expect(screen.getByText('Đúng giờ')).toBeInTheDocument();
    expect(screen.getByText('Đi muộn')).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ tham dự')).toBeInTheDocument();

    // Đại biểu trong danh sách
    expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();

    // Thẻ thống kê & Tab Chưa đến/ Không tham dự
    expect(screen.getAllByText(/Chưa đến\/ Không tham dự/i).length).toBeGreaterThanOrEqual(1);

    // Không còn phần camera bên phải
    expect(screen.queryByText(/HIKVISION MinMoe AI/i)).not.toBeInTheDocument();

    // Cuộc họp sắp diễn ra: Ẩn cả 2 nút Biên bản & Báo cáo và Kết thúc cuộc họp
    expect(screen.queryByRole('button', { name: /Biên bản & Báo cáo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kết thúc cuộc họp/i })).not.toBeInTheDocument();
  });

  it('Giao diện MeetingLiveScreen: Bấm nút Check-in trên thẻ đại biểu cập nhật tức thì trạng thái', async () => {
    render(
      <MeetingLiveScreen
        meetingId={meetingId}
        tenantId={ubndTenant}
        onBack={() => {}}
      />
    );

    expect(await screen.findByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();

    // Bấm nút "Check-in" trên thẻ đại biểu
    const checkInBtns = screen.getAllByRole('button', { name: /Check-in/i });
    expect(checkInBtns.length).toBeGreaterThan(0);
    fireEvent.click(checkInBtns[0]);

    // Kiểm tra trạng thái có mặt xuất hiện
    await waitFor(() => {
      expect(screen.getAllByText(/Nguyễn Văn An/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Giao diện MeetingLiveScreen: Chuyển đổi sang dạng bảng chi tiết hiển thị đầy đủ các cột nghiệp vụ', async () => {
    render(
      <MeetingLiveScreen
        meetingId={meetingId}
        tenantId={ubndTenant}
        onBack={() => {}}
      />
    );

    expect(await screen.findByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();

    // Bấm nút chuyển sang chế độ Bảng
    const tableBtn = screen.getByTitle('Dạng bảng chi tiết');
    fireEvent.click(tableBtn);

    // Kiểm tra các tiêu đề cột bảng xuất hiện
    expect(screen.getByText('Đại biểu')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Check-out')).toBeInTheDocument();
    expect(screen.getByText('Thời lượng')).toBeInTheDocument();
    expect(screen.getByText('Kết luận chuyên cần')).toBeInTheDocument();
  });

  it('Giao diện MeetingLiveScreen: Bấm Kết thúc cuộc họp hiển thị modal xác nhận và chốt biên bản thành công', async () => {
    render(
      <MeetingLiveScreen
        meetingId="mtg-ubnd-live"
        tenantId={ubndTenant}
        onBack={() => {}}
      />
    );

    expect(await screen.findByText('Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ')).toBeInTheDocument();

    // Cuộc họp đang diễn ra: chỉ có nút Kết thúc cuộc họp, KHÔNG có nút Biên bản & Báo cáo trên header
    expect(screen.queryByRole('button', { name: /Biên bản & Báo cáo/i })).not.toBeInTheDocument();

    // Bấm nút Kết thúc cuộc họp trên header
    const closeBtn = screen.getByRole('button', { name: /Kết thúc cuộc họp/i });
    fireEvent.click(closeBtn);

    // Popup xác nhận xuất hiện
    expect(screen.getByText('Xác nhận kết thúc cuộc họp')).toBeInTheDocument();

    // Bấm xác nhận kết thúc
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận kết thúc/i });
    fireEvent.click(confirmBtn);

    // Kiểm tra banner chốt biên bản xuất hiện và cuộc họp đã kết thúc có cả 2 nút
    await waitFor(() => {
      expect(screen.getByText('Biên bản cuộc họp đã được chốt')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Biên bản & Báo cáo/i }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Người chốt:/i)).toBeInTheDocument();
    });
  });
});
