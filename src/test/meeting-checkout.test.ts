import { describe, it, expect, beforeEach } from 'vitest';
import { meetingService } from '../services/meeting';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';

describe('Ghi Nhận Check-out & Chốt Cuộc Họp (MTG-03: Meeting Checkout & Session Finalization)', () => {
  const ubndTenant = 'tenant-ubnd-001';
  const meetingId = 'mtg-ubnd-01'; // 08:00 - 10:30, grace: 5 min -> earliest checkout 10:25

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

  it('Ghi nhận Check-out tính toán chính xác thời lượng tham dự (phút) và trạng thái ra về đúng giờ', async () => {
    // 1. Check-in lúc 08:00
    await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-01', {
      timestamp: '2026-11-04T08:00:00Z'
    });

    // 2. Check-out lúc 10:30 (sau mốc 10:25) -> Đúng giờ, thời lượng 150 phút
    const res = await meetingService.recordCheckOut(ubndTenant, meetingId, 'emp-ubnd-01', {
      timestamp: '2026-11-04T10:30:00Z'
    });

    expect(res.attendee.attendanceStatus).toBe('left');
    expect(res.attendee.isEarlyLeave).toBe(false);
    expect(res.attendee.earlyLeaveMinutes).toBe(0);
    expect(res.attendee.durationMinutes).toBe(150);
  });

  it('Ghi nhận Check-out trước mốc cho phép đánh dấu Về sớm kèm số phút về sớm', async () => {
    // 1. Check-in lúc 08:00
    await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-02', {
      timestamp: '2026-11-04T08:00:00Z'
    });

    // 2. Check-out lúc 09:30 (kết thúc lúc 10:30, về sớm 60 phút)
    const res = await meetingService.recordCheckOut(ubndTenant, meetingId, 'emp-ubnd-02', {
      timestamp: '2026-11-04T09:30:00Z'
    });

    expect(res.attendee.attendanceStatus).toBe('left');
    expect(res.attendee.isEarlyLeave).toBe(true);
    expect(res.attendee.earlyLeaveMinutes).toBe(60);
    expect(res.attendee.durationMinutes).toBe(90);
  });

  it('Báo lỗi nghiệp vụ khi thực hiện Check-out cho đại biểu chưa từng Check-in', async () => {
    await expect(
      meetingService.recordCheckOut(ubndTenant, meetingId, 'emp-ubnd-03')
    ).rejects.toThrow(/chưa điểm danh vào/i);
  });

  it('Quy trình Kết thúc cuộc họp (closeMeeting): Tự động chốt danh sách, tính thời lượng và đóng băng dữ liệu', async () => {
    // 1. Đại biểu 1 check-in lúc 08:00
    await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-01', {
      timestamp: '2026-11-04T08:00:00Z'
    });

    // 2. Đại biểu 2 check-in lúc 08:15 (đi muộn 15 phút)
    await meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-02', {
      timestamp: '2026-11-04T08:15:00Z'
    });

    // 3. Người chủ trì bấm Kết thúc cuộc họp
    const closedMeeting = await meetingService.closeMeeting(
      ubndTenant,
      meetingId,
      'Đ/c Nguyễn Văn An - Chủ tịch UBND'
    );

    expect(closedMeeting.status).toBe('completed');
    expect(closedMeeting.closedAt).toBeDefined();
    expect(closedMeeting.closedBy).toBe('Đ/c Nguyễn Văn An - Chủ tịch UBND');

    // Toàn bộ đại biểu đang ở trong phòng họp tự động được chốt giờ ra về và tính thời lượng
    const a1 = closedMeeting.attendees.find((a: any) => a.employeeId === 'emp-ubnd-01');
    const a2 = closedMeeting.attendees.find((a: any) => a.employeeId === 'emp-ubnd-02');
    const a3 = closedMeeting.attendees.find((a: any) => a.employeeId === 'emp-ubnd-03');

    expect(a1?.attendanceStatus).toBe('left');
    expect(a1?.durationMinutes).toBeGreaterThanOrEqual(1);

    expect(a2?.attendanceStatus).toBe('left');
    expect(a2?.isLate).toBe(true);
    expect(a2?.durationMinutes).toBeGreaterThanOrEqual(1);

    expect(a3?.attendanceStatus).toBe('not_joined');
    expect(a3?.durationMinutes).toBe(0);

    // Kiểm tra số liệu biên bản tổng hợp chuyên cần
    expect(closedMeeting.summary).toBeDefined();
    expect(closedMeeting.summary?.totalAttendees).toBe(3);
    expect(closedMeeting.summary?.presentAttendees).toBe(2);
    expect(closedMeeting.summary?.lateAttendees).toBe(1);
    expect(closedMeeting.summary?.absentAttendees).toBe(1);
    expect(closedMeeting.summary?.attendanceRate).toBe(67); // 2/3 ~ 67%
    expect(closedMeeting.summary?.averageDurationMinutes).toBeGreaterThanOrEqual(1);

    // Từ chối điểm danh sau khi cuộc họp đã kết thúc (dữ liệu bất biến)
    await expect(
      meetingService.recordCheckIn(ubndTenant, meetingId, 'emp-ubnd-03')
    ).rejects.toThrow(/đã kết thúc và chốt dữ liệu/i);

    await expect(
      meetingService.recordCheckOut(ubndTenant, meetingId, 'emp-ubnd-01')
    ).rejects.toThrow(/đã kết thúc và chốt dữ liệu/i);
  });
});
