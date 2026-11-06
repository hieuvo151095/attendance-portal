export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AttendeeRole = 'required' | 'optional';
export type AttendanceCheckStatus = 'not_joined' | 'joined' | 'left';

export interface MeetingAttendee {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  position: string;
  departmentId: string;
  departmentName?: string;
  role: AttendeeRole; // 'required': Đại biểu bắt buộc | 'optional': Đại biểu tùy chọn
  avatarUrl?: string;
  attendanceStatus?: AttendanceCheckStatus;
  checkInTime?: string;
  checkOutTime?: string;
  checkInMethod?: 'face_id' | 'card' | 'manual';
  checkInPhoto?: string;
  checkOutMethod?: 'face_id' | 'card' | 'manual';
  checkOutPhoto?: string;
  isLate?: boolean;
  lateMinutes?: number;
  isEarlyLeave?: boolean;
  earlyLeaveMinutes?: number;
  durationMinutes?: number; // Thời lượng tham dự thực tế (phút)
  note?: string;
  isAdHoc?: boolean; // Khách mời bổ sung ngoài danh sách triệu tập ban đầu
}

export interface MeetingSummary {
  totalAttendees: number;
  presentAttendees: number;
  lateAttendees: number;
  earlyLeaveAttendees: number;
  absentAttendees: number;
  attendanceRate: number; // Tỷ lệ %
  averageDurationMinutes: number; // Thời lượng trung bình (phút)
}

export interface Meeting {
  id: string;
  tenantId: string;
  title: string; // Tiêu đề cuộc họp (bắt buộc)
  roomName: string; // Tên phòng họp (bắt buộc)
  description?: string;
  hostName?: string; // Người chủ trì cuộc họp
  startTime: string; // Thời điểm bắt đầu dự kiến (bắt buộc)
  endTime: string; // Thời điểm kết thúc dự kiến (bắt buộc)
  status: MeetingStatus;
  enableAttendanceRules?: boolean; // Áp dụng quy tắc thời gian điểm danh (mặc định true)
  checkInGraceMinutes?: number; // Dung sai vào trễ cho phép (phút, mặc định 5)
  checkOutGraceMinutes?: number; // Dung sai về sớm cho phép (phút, mặc định 5)
  attendees: MeetingAttendee[]; // Danh sách đại biểu được triệu tập (bắt buộc >= 1)
  closedAt?: string; // Thời điểm kết thúc / đóng cuộc họp
  closedBy?: string;
  summary?: MeetingSummary; // Biên bản tổng hợp chuyên cần khi chốt cuộc họp
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDTO {
  title: string;
  roomName: string;
  description?: string;
  hostName?: string;
  startTime: string;
  endTime: string;
  enableAttendanceRules?: boolean;
  checkInGraceMinutes?: number;
  checkOutGraceMinutes?: number;
  attendees: Array<{
    employeeId: string;
    role?: AttendeeRole;
  }>;
}

export interface UpdateMeetingDTO {
  title?: string;
  roomName?: string;
  description?: string;
  hostName?: string;
  startTime?: string;
  endTime?: string;
  status?: MeetingStatus;
  enableAttendanceRules?: boolean;
  checkInGraceMinutes?: number;
  checkOutGraceMinutes?: number;
  attendees?: Array<{
    employeeId: string;
    role?: AttendeeRole;
  }>;
}

export interface MeetingFilterOptions {
  status?: MeetingStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
