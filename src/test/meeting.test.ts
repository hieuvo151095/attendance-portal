import { describe, it, expect, beforeEach } from 'vitest';
import { meetingService } from '../services/meeting';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { CreateMeetingDTO } from '../types/meeting';

describe('Dịch Vụ Điểm Danh Cuộc Họp (MTG-01: Meeting Service)', () => {
  const ubndTenant = 'tenant-ubnd-001';
  const factoryTenant = 'tenant-factory-002';

  beforeEach(async () => {
    authService.resetMockData();
    // Đăng nhập quyền UBND Bến Nghé
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    employeeService.resetMockData();
    meetingService.resetMockData();
  });

  it('Lấy danh sách cuộc họp thuộc đơn vị và kiểm tra ranh giới bảo mật đa đơn vị (multi-tenancy)', async () => {
    const list = await meetingService.getMeetingsByTenant(ubndTenant);
    expect(list.length).toBeGreaterThan(0);
    list.forEach((m) => expect(m.tenantId).toBe(ubndTenant));

    // Không được truy cập danh sách cuộc họp của nhà máy Tân Bình
    await expect(meetingService.getMeetingsByTenant(factoryTenant)).rejects.toThrow(
      /không có quyền/i
    );
  });

  it('Hỗ trợ tìm kiếm cuộc họp theo tiêu đề, phòng họp hoặc người chủ trì', async () => {
    const searchByTitle = await meetingService.getMeetingsByTenant(ubndTenant, {
      search: 'Giao Ban Thường Kỳ'
    });
    expect(searchByTitle.length).toBe(1);
    expect(searchByTitle[0].title).toContain('Họp Giao Ban Thường Kỳ');

    const searchByRoom = await meetingService.getMeetingsByTenant(ubndTenant, {
      search: 'Phòng họp Đa năng'
    });
    expect(searchByRoom.length).toBe(1);
    expect(searchByRoom[0].title).toContain('Chuyển đổi số');
  });

  it('Lọc cuộc họp theo trạng thái (Đang diễn ra vs Đã kết thúc)', async () => {
    const inProgressList = await meetingService.getMeetingsByTenant(ubndTenant, {
      status: 'in_progress'
    });
    expect(inProgressList.length).toBe(1);
    expect(inProgressList[0].status).toBe('in_progress');

    const completedList = await meetingService.getMeetingsByTenant(ubndTenant, {
      status: 'completed'
    });
    expect(completedList.length).toBe(3);
    completedList.forEach((m) => expect(m.status).toBe('completed'));
  });

  it('Tạo cuộc họp mới thành công với đầy đủ tiêu đề, phòng họp, thời gian và danh sách đại biểu triệu tập', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(9, 0, 0, 0);
    const endTomorrow = new Date(tomorrow);
    endTomorrow.setHours(11, 30, 0, 0);

    const dto: CreateMeetingDTO = {
      title: 'Họp Chuyên Đề Cải Cách Thủ Tục Hành Chính',
      roomName: 'Hội trường Lớn UBND',
      description: 'Đánh giá việc cung cấp dịch vụ công trực tuyến mức độ 4.',
      hostName: 'Đ/c Nguyễn Văn An',
      startTime: tomorrow.toISOString(),
      endTime: endTomorrow.toISOString(),
      attendees: [
        { employeeId: 'emp-ubnd-01', role: 'required' },
        { employeeId: 'emp-ubnd-02', role: 'required' },
        { employeeId: 'emp-ubnd-03', role: 'optional' }
      ]
    };

    const created = await meetingService.createMeeting(ubndTenant, dto);
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Họp Chuyên Đề Cải Cách Thủ Tục Hành Chính');
    expect(created.roomName).toBe('Hội trường Lớn UBND');
    expect(created.status).toBe('scheduled');
    expect(created.attendees.length).toBe(3);

    // Kiểm tra đại biểu được điền đầy đủ metadata họ tên, mã NV, phòng ban
    const hostAtt = created.attendees.find((a) => a.employeeId === 'emp-ubnd-01');
    expect(hostAtt?.fullName).toBe('Đ/c Nguyễn Văn An');
    expect(hostAtt?.role).toBe('required');
    expect(hostAtt?.departmentName).toBeDefined();
  });

  it('Từ chối tạo cuộc họp khi thiếu tiêu đề, phòng họp hoặc thời gian bắt đầu sau thời gian kết thúc', async () => {
    const validTime = new Date().toISOString();

    // 1. Thiếu tiêu đề
    await expect(
      meetingService.createMeeting(ubndTenant, {
        title: '',
        roomName: 'Phòng 1',
        startTime: validTime,
        endTime: validTime,
        attendees: [{ employeeId: 'emp-ubnd-01' }]
      })
    ).rejects.toThrow(/Tiêu đề cuộc họp không được để trống/i);

    // 2. Thiếu phòng họp
    await expect(
      meetingService.createMeeting(ubndTenant, {
        title: 'Họp Test',
        roomName: '',
        startTime: validTime,
        endTime: validTime,
        attendees: [{ employeeId: 'emp-ubnd-01' }]
      })
    ).rejects.toThrow(/Tên phòng họp không được để trống/i);

    // 3. Thời gian kết thúc trước thời gian bắt đầu
    await expect(
      meetingService.createMeeting(ubndTenant, {
        title: 'Họp Test',
        roomName: 'Phòng 1',
        startTime: '2026-11-04T10:00:00Z',
        endTime: '2026-11-04T08:00:00Z', // Kết thúc trước khi bắt đầu
        attendees: [{ employeeId: 'emp-ubnd-01' }]
      })
    ).rejects.toThrow(/Thời điểm kết thúc phải diễn ra sau thời điểm bắt đầu/i);
  });

  it('Từ chối tạo cuộc họp khi danh sách đại biểu triệu tập rỗng hoặc có đại biểu trùng lặp', async () => {
    const startTime = '2026-11-04T08:00:00Z';
    const endTime = '2026-11-04T10:00:00Z';

    // 1. Không có đại biểu nào
    await expect(
      meetingService.createMeeting(ubndTenant, {
        title: 'Họp Không Đại Biểu',
        roomName: 'Phòng 1',
        startTime,
        endTime,
        attendees: []
      })
    ).rejects.toThrow(/triệu tập ít nhất 1 đại biểu/i);

    // 2. Trùng lặp đại biểu trong cùng cuộc họp
    await expect(
      meetingService.createMeeting(ubndTenant, {
        title: 'Họp Trùng Đại Biểu',
        roomName: 'Phòng 1',
        startTime,
        endTime,
        attendees: [
          { employeeId: 'emp-ubnd-01', role: 'required' },
          { employeeId: 'emp-ubnd-01', role: 'optional' } // Trùng ID
        ]
      })
    ).rejects.toThrow(/Danh sách đại biểu có nhân viên bị trùng lặp/i);
  });

  it('Cập nhật thông tin cuộc họp và danh sách đại biểu triệu tập', async () => {
    const list = await meetingService.getMeetingsByTenant(ubndTenant, { status: 'scheduled' });
    const meeting = list[0];

    const updated = await meetingService.updateMeeting(ubndTenant, meeting.id, {
      title: 'Họp Giao Ban Đã Cập Nhật',
      roomName: 'Phòng Họp VIP Tầng 3',
      attendees: [
        { employeeId: 'emp-ubnd-01', role: 'required' }
      ]
    });

    expect(updated.title).toBe('Họp Giao Ban Đã Cập Nhật');
    expect(updated.roomName).toBe('Phòng Họp VIP Tầng 3');
    expect(updated.attendees.length).toBe(1);
  });

  it('Xóa cuộc họp thành công', async () => {
    const list = await meetingService.getMeetingsByTenant(ubndTenant);
    const meeting = list.find((m) => m.status === 'completed') || list[0];

    await meetingService.deleteMeeting(ubndTenant, meeting.id);

    await expect(meetingService.getMeetingById(ubndTenant, meeting.id)).rejects.toThrow(
      /Không tìm thấy thông tin cuộc họp/i
    );
  });
});
