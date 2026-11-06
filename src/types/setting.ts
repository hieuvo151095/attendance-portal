export interface WorkShiftEvaluation {
  isLate: boolean;
  lateMinutes: number;
  isEarlyLeave: boolean;
  earlyLeaveMinutes: number;
  shiftName: 'morning' | 'afternoon' | 'full_day';
  thresholdTime: string;
}

export interface AttendanceSettings {
  tenantId: string;
  // Giờ làm việc cơ quan hàng ngày (Ca hành chính chuẩn ATT-01)
  workStartTime: string; // Giờ bắt đầu chuẩn (VD: "07:30" hoặc "07:00")
  workEndTime: string;   // Giờ tan ca chuẩn (VD: "17:00" hoặc "16:00")
  morningStartTime?: string; // Bắt đầu ca sáng (mặc định "07:30")
  morningEndTime?: string;   // Kết thúc ca sáng (mặc định "11:30")
  afternoonStartTime?: string; // Bắt đầu ca chiều (mặc định "13:30")
  afternoonEndTime?: string;   // Kết thúc ca chiều (mặc định "17:00")
  workCheckInGraceMinutes: number;  // Dung sai đi muộn (phút, mặc định 10 hoặc 30)
  workCheckOutGraceMinutes: number; // Dung sai về sớm (phút, mặc định 15 hoặc 30)
  targetOnTimeRate?: number;        // Mục tiêu chuẩn cơ quan cho Tỷ lệ đúng giờ (%, mặc định 90)
  // Thiết lập điểm danh cuộc họp mặc định toàn cơ quan
  defaultMeetingCheckInGraceMinutes: number;  // VD: 5 phút -> Họp 09:00 thì trễ nhất 09:05
  defaultMeetingCheckOutGraceMinutes: number; // VD: 5 phút -> Họp đến 10:00 thì được về từ 09:55
  meetingEarlyOpenMinutes: number;           // Mở cửa đón tiếp trước giờ họp (phút), VD: 15
  meetingTargetAttendanceRate?: number;      // Mục tiêu tỷ lệ tham dự cuộc họp cơ quan (%)
  meetingTargetOnTimeRate?: number;          // Mục tiêu tỷ lệ đúng giờ cuộc họp cơ quan (%)
  updatedAt: string;
}

export type UpdateAttendanceSettingsDTO = Partial<Omit<AttendanceSettings, 'tenantId' | 'updatedAt'>>;
