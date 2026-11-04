import {
  Meeting,
  CreateMeetingDTO,
  UpdateMeetingDTO,
  MeetingFilterOptions,
  MeetingAttendee
} from '../types/meeting';
import { authService } from './auth';
import { employeeService } from './employee';
import { departmentService } from './department';

const STORAGE_MEETINGS_KEY = 'finviet_attendance_meetings';

export const INITIAL_MEETINGS: Meeting[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001)
  {
    id: 'mtg-ubnd-01',
    tenantId: 'tenant-ubnd-001',
    title: 'Họp Giao Ban Thường Kỳ Tháng 11/2026',
    roomName: 'Hội trường số 1 - Tầng 2 Trụ sở UBND',
    description: 'Đánh giá tình hình phát triển kinh tế xã hội và kế hoạch cải cách hành chính.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-11-04T08:00:00Z',
    endTime: '2026-11-04T10:30:00Z',
    status: 'scheduled',
    attendees: [
      {
        employeeId: 'emp-ubnd-01',
        employeeCode: 'UBND-001',
        fullName: 'Đ/c Nguyễn Văn An',
        position: 'Chủ tịch UBND Phường',
        departmentId: 'dept-ubnd-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        attendanceStatus: 'not_joined'
      },
      {
        employeeId: 'emp-ubnd-02',
        employeeCode: 'UBND-002',
        fullName: 'Bà Phạm Thị Cúc',
        position: 'Trưởng bộ phận Địa chính - Xây dựng',
        departmentId: 'dept-ubnd-02',
        departmentName: 'Bộ phận Địa chính - Xây dựng',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        attendanceStatus: 'not_joined'
      },
      {
        employeeId: 'emp-ubnd-03',
        employeeCode: 'UBND-003',
        fullName: 'Ông Hoàng Văn Đức',
        position: 'Cán bộ Tư pháp - Hộ tịch',
        departmentId: 'dept-ubnd-03',
        departmentName: 'Bộ phận Tư pháp - Hộ tịch',
        role: 'optional',
        attendanceStatus: 'not_joined'
      }
    ],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'mtg-ubnd-02',
    tenantId: 'tenant-ubnd-001',
    title: 'Tọa đàm Ứng dụng AI & Chuyển đổi số Năm 2026',
    roomName: 'Phòng họp Đa năng - Trụ sở UBND',
    description: 'Triển khai thí điểm hệ thống điểm danh camera AI và thẻ định danh phục vụ nhân dân.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-11-05T14:00:00Z',
    endTime: '2026-11-05T16:30:00Z',
    status: 'scheduled',
    attendees: [
      {
        employeeId: 'emp-ubnd-01',
        employeeCode: 'UBND-001',
        fullName: 'Đ/c Nguyễn Văn An',
        position: 'Chủ tịch UBND Phường',
        departmentId: 'dept-ubnd-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        attendanceStatus: 'not_joined'
      },
      {
        employeeId: 'emp-ubnd-02',
        employeeCode: 'UBND-002',
        fullName: 'Bà Phạm Thị Cúc',
        position: 'Trưởng bộ phận Địa chính - Xây dựng',
        departmentId: 'dept-ubnd-02',
        departmentName: 'Bộ phận Địa chính - Xây dựng',
        role: 'optional',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        attendanceStatus: 'not_joined'
      }
    ],
    createdAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z'
  },

  // 2. Nhà Máy Tân Bình (tenant-factory-002)
  {
    id: 'mtg-tb-01',
    tenantId: 'tenant-factory-002',
    title: 'Họp An Toàn Lao Động Phân Xưởng May',
    roomName: 'Phòng họp Phân Xưởng 1',
    description: 'Kiểm tra quy trình an toàn điện và phòng cháy chữa cháy xưởng may.',
    hostName: 'Bà Trần Thị Mai - Giám đốc Điều hành Nhà máy',
    startTime: '2026-11-04T07:30:00Z',
    endTime: '2026-11-04T09:00:00Z',
    status: 'scheduled',
    attendees: [
      {
        employeeId: 'emp-tb-01',
        employeeCode: 'TB-001',
        fullName: 'Bà Trần Thị Mai',
        position: 'Giám đốc Điều hành Nhà máy',
        departmentId: 'dept-tb-01',
        departmentName: 'Ban Giám Đốc Nhà Máy',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        attendanceStatus: 'not_joined'
      },
      {
        employeeId: 'emp-tb-02',
        employeeCode: 'TB-002',
        fullName: 'Ông Lê Văn Hải',
        position: 'Quản đốc Phân xưởng May 1',
        departmentId: 'dept-tb-03',
        departmentName: 'Phân Xưởng May 1',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        attendanceStatus: 'not_joined'
      }
    ],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 3. Bệnh Viện Nhi Đồng 1 (tenant-hospital-003)
  {
    id: 'mtg-bv-01',
    tenantId: 'tenant-hospital-003',
    title: 'Giao Ban Toàn Viện Khối Nội Ngoại Nhi',
    roomName: 'Hội trường Lớn Bệnh Viện',
    description: 'Đánh giá các ca hội chẩn liên chuyên khoa tuần đầu tháng 11.',
    hostName: 'BS. Lê Hoàng Nam - Phó Giám Đốc KHTH',
    startTime: '2026-11-04T08:00:00Z',
    endTime: '2026-11-04T09:30:00Z',
    status: 'scheduled',
    attendees: [
      {
        employeeId: 'emp-bv-01',
        employeeCode: 'BV-001',
        fullName: 'BS. Lê Hoàng Nam',
        position: 'Phó Giám Đốc KHTH',
        departmentId: 'dept-bv-01',
        departmentName: 'Ban Giám Đốc Bệnh Viện',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        attendanceStatus: 'not_joined'
      },
      {
        employeeId: 'emp-bv-02',
        employeeCode: 'BV-002',
        fullName: 'BSCK2 Nguyễn Thị Huệ',
        position: 'Trưởng Khoa Khám Bệnh',
        departmentId: 'dept-bv-02',
        departmentName: 'Khoa Khám Bệnh',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813590-785a97576442?w=150',
        attendanceStatus: 'not_joined'
      }
    ],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  }
];

class MeetingService {
  private memoryMeetings: Map<string, Meeting> = new Map();

  constructor() {
    this.initStorage();
  }

  private hasLocalStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private initStorage(): void {
    if (this.hasLocalStorage()) {
      const stored = localStorage.getItem(STORAGE_MEETINGS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
      }
    } else {
      INITIAL_MEETINGS.forEach((m) => this.memoryMeetings.set(m.id, { ...m }));
    }
  }

  private getAllMeetings(): Meeting[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_MEETINGS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return INITIAL_MEETINGS;
        }
      }
      return INITIAL_MEETINGS;
    }
    return Array.from(this.memoryMeetings.values());
  }

  private saveMeetings(meetings: Meeting[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_MEETINGS_KEY, JSON.stringify(meetings));
    } else {
      this.memoryMeetings.clear();
      meetings.forEach((m) => this.memoryMeetings.set(m.id, m));
    }
  }

  /**
   * Lấy danh sách cuộc họp của đơn vị (kèm bộ lọc trạng thái, tìm kiếm, thời gian)
   */
  public async getMeetingsByTenant(
    tenantId: string,
    filters?: MeetingFilterOptions
  ): Promise<Meeting[]> {
    authService.assertTenantAccess(tenantId);
    let list = this.getAllMeetings().filter((m) => m.tenantId === tenantId);

    if (filters?.status) {
      list = list.filter((m) => m.status === filters.status);
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.roomName.toLowerCase().includes(term) ||
          (m.hostName && m.hostName.toLowerCase().includes(term)) ||
          (m.description && m.description.toLowerCase().includes(term))
      );
    }

    if (filters?.fromDate) {
      const fromTime = new Date(filters.fromDate).getTime();
      list = list.filter((m) => new Date(m.startTime).getTime() >= fromTime);
    }

    if (filters?.toDate) {
      const toTime = new Date(filters.toDate).getTime();
      list = list.filter((m) => new Date(m.startTime).getTime() <= toTime);
    }

    return list.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  public async getMeetingById(tenantId: string, meetingId: string): Promise<Meeting> {
    authService.assertTenantAccess(tenantId);
    const meeting = this.getAllMeetings().find(
      (m) => m.id === meetingId && m.tenantId === tenantId
    );
    if (!meeting) {
      throw new Error('Không tìm thấy thông tin cuộc họp');
    }
    return meeting;
  }

  /**
   * Tạo cuộc họp mới kèm danh sách đại biểu triệu tập (MTG-01)
   */
  public async createMeeting(tenantId: string, dto: CreateMeetingDTO): Promise<Meeting> {
    authService.assertTenantAccess(tenantId);

    const title = dto.title.trim();
    const roomName = dto.roomName.trim();

    if (!title) {
      throw new Error('Tiêu đề cuộc họp không được để trống');
    }
    if (!roomName) {
      throw new Error('Tên phòng họp không được để trống');
    }
    if (!dto.startTime) {
      throw new Error('Thời điểm bắt đầu dự kiến không được để trống');
    }
    if (!dto.endTime) {
      throw new Error('Thời điểm kết thúc dự kiến không được để trống');
    }

    const startMs = new Date(dto.startTime).getTime();
    const endMs = new Date(dto.endTime).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      throw new Error('Định dạng thời gian cuộc họp không hợp lệ');
    }
    if (startMs >= endMs) {
      throw new Error('Thời điểm kết thúc phải diễn ra sau thời điểm bắt đầu cuộc họp');
    }

    if (!dto.attendees || dto.attendees.length === 0) {
      throw new Error('Cuộc họp bắt buộc phải triệu tập ít nhất 1 đại biểu tham dự');
    }

    // Kiểm tra trùng lặp đại biểu trong cùng cuộc họp
    const seenEmpIds = new Set<string>();
    for (const att of dto.attendees) {
      if (seenEmpIds.has(att.employeeId)) {
        throw new Error('Danh sách đại biểu có nhân viên bị trùng lặp');
      }
      seenEmpIds.add(att.employeeId);
    }

    // Tra cứu danh sách phòng ban để gán departmentName
    const departments = await departmentService.getDepartmentsByTenant(tenantId);
    const deptMap = new Map<string, string>();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    // Xác thực toàn bộ đại biểu thuộc cùng đơn vị
    const resolvedAttendees: MeetingAttendee[] = [];
    for (const att of dto.attendees) {
      const emp = await employeeService.getEmployeeById(tenantId, att.employeeId);
      resolvedAttendees.push({
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        position: emp.position,
        departmentId: emp.departmentId,
        departmentName: deptMap.get(emp.departmentId) || 'Phòng ban khác',
        role: att.role || 'required',
        avatarUrl: emp.avatarUrl,
        attendanceStatus: 'not_joined'
      });
    }

    const all = this.getAllMeetings();
    const now = new Date().toISOString();
    const newMeeting: Meeting = {
      id: `mtg-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}`,
      tenantId,
      title,
      roomName,
      description: dto.description?.trim() || '',
      hostName: dto.hostName?.trim() || '',
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: 'scheduled',
      attendees: resolvedAttendees,
      createdAt: now,
      updatedAt: now
    };

    all.push(newMeeting);
    this.saveMeetings(all);

    return newMeeting;
  }

  /**
   * Cập nhật thông tin cuộc họp (MTG-01)
   */
  public async updateMeeting(
    tenantId: string,
    meetingId: string,
    dto: UpdateMeetingDTO
  ): Promise<Meeting> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp cần cập nhật');
    }

    const meeting = all[index];
    if (meeting.status === 'completed') {
      throw new Error('Cuộc họp đã kết thúc và chốt dữ liệu, không thể chỉnh sửa thông tin');
    }

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      if (!title) throw new Error('Tiêu đề cuộc họp không được để trống');
      meeting.title = title;
    }

    if (dto.roomName !== undefined) {
      const room = dto.roomName.trim();
      if (!room) throw new Error('Tên phòng họp không được để trống');
      meeting.roomName = room;
    }

    if (dto.description !== undefined) meeting.description = dto.description.trim();
    if (dto.hostName !== undefined) meeting.hostName = dto.hostName.trim();

    if (dto.startTime !== undefined) meeting.startTime = dto.startTime;
    if (dto.endTime !== undefined) meeting.endTime = dto.endTime;

    if (new Date(meeting.startTime).getTime() >= new Date(meeting.endTime).getTime()) {
      throw new Error('Thời điểm kết thúc phải diễn ra sau thời điểm bắt đầu cuộc họp');
    }

    if (dto.status !== undefined) meeting.status = dto.status;

    if (dto.attendees !== undefined) {
      if (dto.attendees.length === 0) {
        throw new Error('Cuộc họp bắt buộc phải triệu tập ít nhất 1 đại biểu tham dự');
      }

      const departments = await departmentService.getDepartmentsByTenant(tenantId);
      const deptMap = new Map<string, string>();
      departments.forEach((d) => deptMap.set(d.id, d.name));

      const resolvedAttendees: MeetingAttendee[] = [];
      const seenEmpIds = new Set<string>();

      for (const att of dto.attendees) {
        if (seenEmpIds.has(att.employeeId)) {
          throw new Error('Danh sách đại biểu có nhân viên bị trùng lặp');
        }
        seenEmpIds.add(att.employeeId);

        const emp = await employeeService.getEmployeeById(tenantId, att.employeeId);
        // Bảo lưu trạng thái điểm danh nếu đã có
        const oldAtt = meeting.attendees.find((a) => a.employeeId === emp.id);

        resolvedAttendees.push({
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          position: emp.position,
          departmentId: emp.departmentId,
          departmentName: deptMap.get(emp.departmentId) || 'Phòng ban khác',
          role: att.role || 'required',
          avatarUrl: emp.avatarUrl,
          attendanceStatus: oldAtt?.attendanceStatus || 'not_joined',
          checkInTime: oldAtt?.checkInTime,
          checkOutTime: oldAtt?.checkOutTime,
          checkInMethod: oldAtt?.checkInMethod,
          checkInPhoto: oldAtt?.checkInPhoto
        });
      }

      meeting.attendees = resolvedAttendees;
    }

    meeting.updatedAt = new Date().toISOString();
    all[index] = meeting;
    this.saveMeetings(all);

    return meeting;
  }

  /**
   * Xóa cuộc họp
   */
  public async deleteMeeting(tenantId: string, meetingId: string): Promise<void> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp cần xóa');
    }

    const meeting = all[index];
    if (meeting.status === 'in_progress') {
      throw new Error('Không thể xóa cuộc họp đang diễn ra');
    }

    all.splice(index, 1);
    this.saveMeetings(all);
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
    }
    this.memoryMeetings.clear();
    INITIAL_MEETINGS.forEach((m) => this.memoryMeetings.set(m.id, { ...m }));
  }
}

export const meetingService = new MeetingService();
