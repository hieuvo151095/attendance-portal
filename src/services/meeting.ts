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

  // Một cuộc họp đang diễn ra (Current one - In Progress)
  {
    id: 'mtg-ubnd-live',
    tenantId: 'tenant-ubnd-001',
    title: 'Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ',
    roomName: 'Hội trường số 1 - Tầng 2 Trụ sở UBND',
    description: 'Triển khai kế hoạch tuần tra liên ngành, xử lý vi phạm trật tự xây dựng và phòng cháy chữa cháy cơ sở.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-11-06T01:00:00Z',
    endTime: '2026-11-06T04:30:00Z',
    status: 'in_progress',
    checkInGraceMinutes: 5,
    checkOutGraceMinutes: 5,
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
        attendanceStatus: 'joined',
        checkInTime: '2026-11-06T00:58:00Z',
        checkInMethod: 'face_id',
        isLate: false
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
        attendanceStatus: 'joined',
        checkInTime: '2026-11-06T01:02:00Z',
        checkInMethod: 'card',
        isLate: false
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
    createdAt: '2026-11-05T08:00:00Z',
    updatedAt: '2026-11-06T01:00:00Z'
  },

  // Ba cuộc họp đã kết thúc phục vụ module Báo cáo (Completed meetings)
  {
    id: 'mtg-ubnd-03',
    tenantId: 'tenant-ubnd-001',
    title: 'Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026',
    roomName: 'Hội trường số 1 - Tầng 2 Trụ sở UBND',
    description: 'Đánh giá tiến độ giải ngân vốn đầu tư công và công tác quản lý trật tự đô thị tháng 10.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-10-28T08:00:00Z',
    endTime: '2026-10-28T10:00:00Z',
    status: 'completed',
    closedAt: '2026-10-28T11:00:00Z',
    closedBy: 'Đ/c Nguyễn Văn An',
    checkInGraceMinutes: 5,
    checkOutGraceMinutes: 5,
    summary: {
      totalAttendees: 3,
      presentAttendees: 2,
      lateAttendees: 1,
      earlyLeaveAttendees: 0,
      absentAttendees: 1,
      attendanceRate: 67,
      averageDurationMinutes: 115
    },
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
        attendanceStatus: 'joined',
        checkInTime: '2026-10-28T07:55:00Z',
        checkOutTime: '2026-10-28T10:00:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        durationMinutes: 125
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
        attendanceStatus: 'joined',
        checkInTime: '2026-10-28T08:12:00Z',
        checkOutTime: '2026-10-28T10:00:00Z',
        checkInMethod: 'card',
        isLate: true,
        lateMinutes: 12,
        durationMinutes: 108
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
    createdAt: '2026-10-25T08:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'mtg-ubnd-04',
    tenantId: 'tenant-ubnd-001',
    title: 'Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số',
    roomName: 'Phòng Họp Hội Đồng Nhân Dân - Trụ sở UBND',
    description: 'Triển khai số hóa hồ sơ thủ tục hành chính một cửa và dịch vụ công trực tuyến toàn trình.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-10-15T08:30:00Z',
    endTime: '2026-10-15T11:00:00Z',
    status: 'completed',
    closedAt: '2026-10-15T12:00:00Z',
    closedBy: 'Văn phòng HĐND & UBND',
    checkInGraceMinutes: 5,
    checkOutGraceMinutes: 5,
    summary: {
      totalAttendees: 3,
      presentAttendees: 3,
      lateAttendees: 0,
      earlyLeaveAttendees: 0,
      absentAttendees: 0,
      attendanceRate: 100,
      averageDurationMinutes: 150
    },
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
        attendanceStatus: 'joined',
        checkInTime: '2026-10-15T08:20:00Z',
        checkOutTime: '2026-10-15T11:00:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        durationMinutes: 160
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
        attendanceStatus: 'joined',
        checkInTime: '2026-10-15T08:25:00Z',
        checkOutTime: '2026-10-15T11:00:00Z',
        checkInMethod: 'card',
        isLate: false,
        durationMinutes: 155
      },
      {
        employeeId: 'emp-ubnd-03',
        employeeCode: 'UBND-003',
        fullName: 'Ông Hoàng Văn Đức',
        position: 'Cán bộ Tư pháp - Hộ tịch',
        departmentId: 'dept-ubnd-03',
        departmentName: 'Bộ phận Tư pháp - Hộ tịch',
        role: 'optional',
        attendanceStatus: 'joined',
        checkInTime: '2026-10-15T08:28:00Z',
        checkOutTime: '2026-10-15T11:00:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        durationMinutes: 152
      }
    ],
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'mtg-ubnd-05',
    tenantId: 'tenant-ubnd-001',
    title: 'Hội Nghị Sơ Kết Công Tác Tư Pháp - Hộ Tịch & Quản Lý Dân Cư Quý 3/2026',
    roomName: 'Phòng Họp Ban Thường Vụ - Trụ sở UBND',
    description: 'Tổng kết công tác đăng ký khai sinh, kết hôn, chứng thực điện tử và liên thông dữ liệu dân cư quốc gia Đề án 06.',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-09-25T08:00:00Z',
    endTime: '2026-09-25T11:00:00Z',
    status: 'completed',
    closedAt: '2026-09-25T12:00:00Z',
    closedBy: 'Đ/c Nguyễn Văn An',
    checkInGraceMinutes: 5,
    checkOutGraceMinutes: 5,
    summary: {
      totalAttendees: 5,
      presentAttendees: 4,
      lateAttendees: 1,
      earlyLeaveAttendees: 0,
      absentAttendees: 1,
      attendanceRate: 80,
      averageDurationMinutes: 175
    },
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
        attendanceStatus: 'left',
        checkInTime: '2026-09-25T07:50:00Z',
        checkOutTime: '2026-09-25T11:00:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        durationMinutes: 190
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
        attendanceStatus: 'left',
        checkInTime: '2026-09-25T07:55:00Z',
        checkOutTime: '2026-09-25T11:00:00Z',
        checkInMethod: 'card',
        isLate: false,
        durationMinutes: 185
      },
      {
        employeeId: 'emp-ubnd-06',
        employeeCode: 'UBND-006',
        fullName: 'Bà Nguyễn Hoàng Mai',
        position: 'Chuyên viên CNTT & Cải cách hành chính',
        departmentId: 'dept-ubnd-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        attendanceStatus: 'left',
        checkInTime: '2026-09-25T07:52:00Z',
        checkOutTime: '2026-09-25T11:00:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        durationMinutes: 188
      },
      {
        employeeId: 'emp-ubnd-05',
        employeeCode: 'UBND-005',
        fullName: 'Ông Trần Minh Tuấn',
        position: 'Phó Chánh Văn phòng HĐND & UBND',
        departmentId: 'dept-ubnd-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        attendanceStatus: 'left',
        checkInTime: '2026-09-25T08:12:00Z',
        checkOutTime: '2026-09-25T11:00:00Z',
        checkInMethod: 'card',
        isLate: true,
        lateMinutes: 12,
        durationMinutes: 168
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
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-09-25T11:00:00Z'
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

  /**
   * Điểm danh Check-in đại biểu (MTG-02) qua Face ID, thẻ RFID hoặc thủ công
   */
  public async recordCheckIn(
    tenantId: string,
    meetingId: string,
    employeeId: string,
    options?: {
      method?: 'face_id' | 'card' | 'manual';
      timestamp?: string;
      photoUrl?: string;
    }
  ): Promise<{ meeting: Meeting; attendee: MeetingAttendee }> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp');
    }

    const meeting = all[index];
    if (meeting.status === 'completed') {
      throw new Error('Cuộc họp đã kết thúc và chốt dữ liệu, không thể điểm danh');
    }

    const checkInTime = options?.timestamp || new Date().toISOString();
    const checkInMs = new Date(checkInTime).getTime();
    const startMs = new Date(meeting.startTime).getTime();
    const graceMinutes = meeting.checkInGraceMinutes ?? 5;
    const maxOnTimeMs = startMs + graceMinutes * 60000;

    const isLate = checkInMs > maxOnTimeMs;
    const lateMinutes = isLate ? Math.max(1, Math.round((checkInMs - startMs) / 60000)) : 0;

    let attendee = meeting.attendees.find((a) => a.employeeId === employeeId);

    if (!attendee) {
      // Khách mời hoặc đại biểu bổ sung ngoài danh sách triệu tập
      const emp = await employeeService.getEmployeeById(tenantId, employeeId);
      const departments = await departmentService.getDepartmentsByTenant(tenantId);
      const deptMap = new Map<string, string>();
      departments.forEach((d) => deptMap.set(d.id, d.name));

      attendee = {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        position: emp.position,
        departmentId: emp.departmentId,
        departmentName: deptMap.get(emp.departmentId) || 'Khách mời bổ sung',
        role: 'optional',
        avatarUrl: emp.avatarUrl,
        isAdHoc: true,
        attendanceStatus: 'joined',
        checkInTime,
        checkInMethod: options?.method || 'face_id',
        checkInPhoto: options?.photoUrl || emp.avatarUrl,
        isLate,
        lateMinutes
      };
      meeting.attendees.push(attendee);
    } else {
      attendee.attendanceStatus = 'joined';
      attendee.checkInTime = checkInTime;
      attendee.checkInMethod = options?.method || 'face_id';
      attendee.checkInPhoto = options?.photoUrl || attendee.avatarUrl;
      attendee.isLate = isLate;
      attendee.lateMinutes = lateMinutes;
    }

    if (meeting.status === 'scheduled') {
      meeting.status = 'in_progress';
    }

    meeting.updatedAt = new Date().toISOString();
    all[index] = meeting;
    this.saveMeetings(all);

    return { meeting, attendee };
  }

  /**
   * Điểm danh Check-out đại biểu rời phòng họp (MTG-03)
   */
  public async recordCheckOut(
    tenantId: string,
    meetingId: string,
    employeeId: string,
    options?: { timestamp?: string }
  ): Promise<{ meeting: Meeting; attendee: MeetingAttendee }> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp');
    }

    const meeting = all[index];
    if (meeting.status === 'completed') {
      throw new Error('Cuộc họp đã kết thúc và chốt dữ liệu, không thể điểm danh ra về');
    }

    const attendee = meeting.attendees.find((a) => a.employeeId === employeeId);
    if (!attendee) {
      throw new Error('Đại biểu không có trong danh sách cuộc họp');
    }

    if (attendee.attendanceStatus === 'not_joined' || !attendee.checkInTime) {
      throw new Error('Đại biểu chưa điểm danh vào phòng họp');
    }

    const checkOutTime = options?.timestamp || new Date().toISOString();
    const checkOutMs = new Date(checkOutTime).getTime();
    const checkInMs = new Date(attendee.checkInTime).getTime();
    const endMs = new Date(meeting.endTime).getTime();
    const graceMinutes = meeting.checkOutGraceMinutes ?? 5;
    const earliestCheckOutMs = endMs - graceMinutes * 60000;

    const isEarlyLeave = checkOutMs < earliestCheckOutMs;
    const earlyLeaveMinutes = isEarlyLeave ? Math.max(1, Math.round((endMs - checkOutMs) / 60000)) : 0;
    const durationMinutes = Math.max(1, Math.round((checkOutMs - checkInMs) / 60000));

    attendee.attendanceStatus = 'left';
    attendee.checkOutTime = checkOutTime;
    attendee.isEarlyLeave = isEarlyLeave;
    attendee.earlyLeaveMinutes = earlyLeaveMinutes;
    attendee.durationMinutes = durationMinutes;

    meeting.updatedAt = new Date().toISOString();
    all[index] = meeting;
    this.saveMeetings(all);

    return { meeting, attendee };
  }

  /**
   * Kết thúc và chốt biên bản cuộc họp (MTG-03)
   */
  public async closeMeeting(
    tenantId: string,
    meetingId: string,
    closedBy?: string
  ): Promise<Meeting> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp');
    }

    const meeting = all[index];
    const now = new Date().toISOString();
    const nowMs = new Date(now).getTime();
    const endMs = new Date(meeting.endTime).getTime();
    const graceMinutes = meeting.checkOutGraceMinutes ?? 5;
    const earliestCheckOutMs = endMs - graceMinutes * 60000;

    // Chốt dữ liệu cho toàn bộ đại biểu
    meeting.attendees.forEach((att) => {
      if (att.attendanceStatus === 'joined') {
        att.checkOutTime = now;
        att.attendanceStatus = 'left';
        const checkInMs = att.checkInTime ? new Date(att.checkInTime).getTime() : nowMs;
        att.durationMinutes = Math.max(1, Math.round((nowMs - checkInMs) / 60000));

        if (nowMs < earliestCheckOutMs) {
          att.isEarlyLeave = true;
          att.earlyLeaveMinutes = Math.max(1, Math.round((endMs - nowMs) / 60000));
        } else {
          att.isEarlyLeave = false;
          att.earlyLeaveMinutes = 0;
        }
      } else if (att.attendanceStatus === 'left') {
        if (att.checkInTime && att.checkOutTime && !att.durationMinutes) {
          const cin = new Date(att.checkInTime).getTime();
          const cout = new Date(att.checkOutTime).getTime();
          att.durationMinutes = Math.max(1, Math.round((cout - cin) / 60000));
        }
      } else {
        att.attendanceStatus = 'not_joined';
        att.durationMinutes = 0;
      }
    });

    // Tính toán số liệu tổng hợp chuyên cần
    const totalAttendees = meeting.attendees.length;
    const attendedList = meeting.attendees.filter(
      (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
    );
    const presentAttendees = attendedList.length;
    const lateAttendees = meeting.attendees.filter((a) => a.isLate).length;
    const earlyLeaveAttendees = meeting.attendees.filter((a) => a.isEarlyLeave).length;
    const absentAttendees = totalAttendees - presentAttendees;
    const attendanceRate = totalAttendees > 0 ? Math.round((presentAttendees / totalAttendees) * 100) : 0;
    const totalDuration = attendedList.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const averageDurationMinutes = presentAttendees > 0 ? Math.round(totalDuration / presentAttendees) : 0;

    meeting.summary = {
      totalAttendees,
      presentAttendees,
      lateAttendees,
      earlyLeaveAttendees,
      absentAttendees,
      attendanceRate,
      averageDurationMinutes
    };

    meeting.status = 'completed';
    meeting.closedAt = now;
    meeting.closedBy = closedBy || 'Thư ký cuộc họp';
    meeting.updatedAt = now;

    all[index] = meeting;
    this.saveMeetings(all);

    return meeting;
  }

  /**
   * Thiết lập lại trạng thái điểm danh cuộc họp về ban đầu (cho diễn tập / thử nghiệm)
   */
  public async resetMeetingAttendance(
    tenantId: string,
    meetingId: string
  ): Promise<Meeting> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllMeetings();
    const index = all.findIndex((m) => m.id === meetingId && m.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy cuộc họp');
    }

    const meeting = all[index];
    meeting.status = 'scheduled';
    meeting.closedAt = undefined;
    meeting.closedBy = undefined;
    meeting.summary = undefined;
    meeting.attendees = meeting.attendees
      .filter((a) => !a.isAdHoc)
      .map((a) => ({
        ...a,
        attendanceStatus: 'not_joined',
        checkInTime: undefined,
        checkOutTime: undefined,
        checkInMethod: undefined,
        checkInPhoto: undefined,
        isLate: undefined,
        lateMinutes: undefined,
        isEarlyLeave: undefined,
        earlyLeaveMinutes: undefined,
        durationMinutes: undefined
      }));

    meeting.updatedAt = new Date().toISOString();
    all[index] = meeting;
    this.saveMeetings(all);

    return meeting;
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
