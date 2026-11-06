import { AttendanceSettings, UpdateAttendanceSettingsDTO, WorkShiftEvaluation } from '../types/setting';
import { authService } from './auth';

const STORAGE_SETTINGS_KEY = 'finviet_attendance_settings';

export const DEFAULT_ATTENDANCE_SETTINGS: Record<string, AttendanceSettings> = {
  'tenant-ubnd-001': {
    tenantId: 'tenant-ubnd-001',
    workStartTime: '07:00',
    workEndTime: '16:00',
    morningStartTime: '07:00',
    morningEndTime: '11:30',
    afternoonStartTime: '13:30',
    afternoonEndTime: '16:00',
    workCheckInGraceMinutes: 30, // Sau 07:30 tính đi trễ
    workCheckOutGraceMinutes: 30, // Trước 15:30 tính về sớm
    targetOnTimeRate: 90, // Mục tiêu tỷ lệ đúng giờ 90%
    defaultMeetingCheckInGraceMinutes: 5, // Cuộc họp: sau giờ bắt đầu + 5p tính trễ
    defaultMeetingCheckOutGraceMinutes: 5, // Cuộc họp: trước giờ kết thúc - 5p tính về sớm
    meetingEarlyOpenMinutes: 15, // Mở cửa phòng họp đón tiếp trước 15p
    meetingTargetAttendanceRate: 90, // Mục tiêu tỷ lệ tham dự cuộc họp (%)
    meetingTargetOnTimeRate: 85,     // Mục tiêu tỷ lệ đúng giờ cuộc họp (%)
    updatedAt: '2026-11-01T08:00:00Z'
  },
  'tenant-ubnd-002': {
    tenantId: 'tenant-ubnd-002',
    workStartTime: '07:30',
    workEndTime: '17:00',
    morningStartTime: '07:30',
    morningEndTime: '11:30',
    afternoonStartTime: '13:30',
    afternoonEndTime: '17:00',
    workCheckInGraceMinutes: 10,
    workCheckOutGraceMinutes: 15,
    targetOnTimeRate: 90,
    defaultMeetingCheckInGraceMinutes: 5,
    defaultMeetingCheckOutGraceMinutes: 5,
    meetingEarlyOpenMinutes: 15,
    updatedAt: '2026-11-01T08:00:00Z'
  },
  'tenant-bv-001': {
    tenantId: 'tenant-bv-001',
    workStartTime: '06:30',
    workEndTime: '15:30',
    morningStartTime: '06:30',
    morningEndTime: '11:30',
    afternoonStartTime: '13:00',
    afternoonEndTime: '15:30',
    workCheckInGraceMinutes: 15,
    workCheckOutGraceMinutes: 15,
    targetOnTimeRate: 90,
    defaultMeetingCheckInGraceMinutes: 5,
    defaultMeetingCheckOutGraceMinutes: 5,
    meetingEarlyOpenMinutes: 20,
    updatedAt: '2026-11-01T08:00:00Z'
  }
};

class AttendanceSettingService {
  private memorySettings: Map<string, AttendanceSettings> = new Map();

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
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_ATTENDANCE_SETTINGS));
      }
    } else {
      Object.entries(DEFAULT_ATTENDANCE_SETTINGS).forEach(([tenantId, setting]) => {
        this.memorySettings.set(tenantId, { ...setting });
      });
    }
  }

  private getAllSettings(): Record<string, AttendanceSettings> {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return DEFAULT_ATTENDANCE_SETTINGS;
        }
      }
      return DEFAULT_ATTENDANCE_SETTINGS;
    }
    const result: Record<string, AttendanceSettings> = {};
    this.memorySettings.forEach((val, key) => {
      result[key] = val;
    });
    return result;
  }

  private saveSettings(settings: Record<string, AttendanceSettings>): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } else {
      this.memorySettings.clear();
      Object.entries(settings).forEach(([tenantId, val]) => {
        this.memorySettings.set(tenantId, val);
      });
    }
  }

  /**
   * Lấy cấu hình thời gian làm việc và dung sai điểm danh của đơn vị
   */
  public async getSettings(tenantId: string): Promise<AttendanceSettings> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllSettings();
    if (all[tenantId]) {
      return { ...all[tenantId] };
    }

    // Thiết lập mặc định nếu đơn vị mới
    const defaultSetting: AttendanceSettings = {
      tenantId,
      workStartTime: '07:00',
      workEndTime: '16:00',
      workCheckInGraceMinutes: 30,
      workCheckOutGraceMinutes: 30,
      targetOnTimeRate: 90,
      defaultMeetingCheckInGraceMinutes: 5,
      defaultMeetingCheckOutGraceMinutes: 5,
      meetingEarlyOpenMinutes: 15,
      updatedAt: new Date().toISOString()
    };
    all[tenantId] = defaultSetting;
    this.saveSettings(all);
    return defaultSetting;
  }

  /**
   * Cập nhật cấu hình thời gian làm việc & điểm danh
   */
  public async updateSettings(
    tenantId: string,
    dto: UpdateAttendanceSettingsDTO
  ): Promise<AttendanceSettings> {
    authService.assertTenantAccess(tenantId);
    const current = await this.getSettings(tenantId);

    const updated: AttendanceSettings = {
      ...current,
      ...dto,
      morningStartTime: dto.morningStartTime ?? (dto.workStartTime ? dto.workStartTime : current.morningStartTime),
      afternoonEndTime: dto.afternoonEndTime ?? (dto.workEndTime ? dto.workEndTime : current.afternoonEndTime),
      meetingTargetAttendanceRate:
        dto.meetingTargetAttendanceRate !== undefined
          ? dto.meetingTargetAttendanceRate
          : ('meetingTargetAttendanceRate' in dto ? undefined : current.meetingTargetAttendanceRate),
      meetingTargetOnTimeRate:
        dto.meetingTargetOnTimeRate !== undefined
          ? dto.meetingTargetOnTimeRate
          : ('meetingTargetOnTimeRate' in dto ? undefined : current.meetingTargetOnTimeRate),
      tenantId,
      updatedAt: new Date().toISOString()
    };

    const all = this.getAllSettings();
    all[tenantId] = updated;
    this.saveSettings(all);

    return updated;
  }

  /**
   * Khôi phục dữ liệu mẫu về ban đầu cho môi trường kiểm thử
   */
  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_ATTENDANCE_SETTINGS));
    }
    this.memorySettings.clear();
    Object.entries(DEFAULT_ATTENDANCE_SETTINGS).forEach(([tenantId, setting]) => {
      this.memorySettings.set(tenantId, { ...setting });
    });
  }

  /**
   * Tính toán thời gian điểm danh vào trễ nhất cho cuộc họp
   * @param startTimeISO Chuỗi ISO hoặc time HH:mm
   * @param graceMinutes Số phút dung sai trễ cho phép (VD: 5 phút)
   * @returns Chuỗi giờ:phút (HH:mm) trễ nhất cho phép điểm danh đúng giờ
   */
  public calculateMaxCheckInTime(startTimeISO: string, graceMinutes: number): string {
    if (!startTimeISO) return '--:--';
    const date = new Date(startTimeISO);
    if (isNaN(date.getTime())) {
      // Trường hợp chuỗi "09:00"
      const parts = startTimeISO.split(':').map((p) => parseInt(p, 10));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const totalMin = parts[0] * 60 + parts[1] + graceMinutes;
        const h = Math.floor(totalMin / 60) % 24;
        const m = totalMin % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return '--:--';
    }
    const deadline = new Date(date.getTime() + graceMinutes * 60000);
    const h = String(deadline.getHours()).padStart(2, '0');
    const m = String(deadline.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Tính toán thời gian điểm danh ra về sớm nhất cho cuộc họp
   * @param endTimeISO Chuỗi ISO hoặc time HH:mm
   * @param graceMinutes Số phút dung sai về sớm cho phép (VD: 5 phút)
   * @returns Chuỗi giờ:phút (HH:mm) sớm nhất được phép ra về không tính về sớm
   */
  public calculateEarliestCheckOutTime(endTimeISO: string, graceMinutes: number): string {
    if (!endTimeISO) return '--:--';
    const date = new Date(endTimeISO);
    if (isNaN(date.getTime())) {
      // Trường hợp chuỗi "10:00"
      const parts = endTimeISO.split(':').map((p) => parseInt(p, 10));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const totalMin = parts[0] * 60 + parts[1] - graceMinutes;
        const safeTotal = totalMin < 0 ? 0 : totalMin;
        const h = Math.floor(safeTotal / 60) % 24;
        const m = safeTotal % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return '--:--';
    }
    const earliest = new Date(date.getTime() - graceMinutes * 60000);
    const h = String(earliest.getHours()).padStart(2, '0');
    const m = String(earliest.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Chuyển đổi chuỗi giờ HH:mm sang số phút tính từ đầu ngày
   */
  public parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 7 * 60 + 30; // fallback 07:30
  }

  /**
   * Đánh giá bản ghi Check-in hàng ngày đối chiếu với ca làm việc và dung sai đi muộn (ATT-01)
   */
  public evaluateDailyCheckIn(
    scanTimeInput: string | Date,
    settings: AttendanceSettings
  ): WorkShiftEvaluation {
    let scanMinutes = 0;
    if (typeof scanTimeInput === 'string' && scanTimeInput.includes(':') && !scanTimeInput.includes('T')) {
      const parts = scanTimeInput.split(':').map((p) => parseInt(p, 10));
      scanMinutes = parts[0] * 60 + parts[1];
    } else {
      const d = new Date(scanTimeInput);
      scanMinutes = d.getHours() * 60 + d.getMinutes();
    }

    // Xác định ca sáng hay ca chiều
    const morningStart = this.parseTimeToMinutes(settings.morningStartTime || settings.workStartTime || '07:30');
    const afternoonStart = this.parseTimeToMinutes(settings.afternoonStartTime || '13:30');
    const graceMin = settings.workCheckInGraceMinutes ?? 10;

    let targetShift: 'morning' | 'afternoon' | 'full_day' = 'morning';
    let shiftStart = morningStart;

    // Nếu quét sau 12:00 trưa thì tính ca chiều
    if (scanMinutes >= 12 * 60) {
      targetShift = 'afternoon';
      shiftStart = afternoonStart;
    }

    const lateThresholdMinutes = shiftStart + graceMin;
    const isLate = scanMinutes > lateThresholdMinutes;
    const lateMinutes = isLate ? scanMinutes - shiftStart : 0;

    const thresholdH = Math.floor(lateThresholdMinutes / 60) % 24;
    const thresholdM = lateThresholdMinutes % 60;
    const thresholdTime = `${String(thresholdH).padStart(2, '0')}:${String(thresholdM).padStart(2, '0')}`;

    return {
      isLate,
      lateMinutes,
      isEarlyLeave: false,
      earlyLeaveMinutes: 0,
      shiftName: targetShift,
      thresholdTime
    };
  }

  /**
   * Đánh giá bản ghi Check-out hàng ngày đối chiếu với giờ tan ca và dung sai về sớm (ATT-01)
   */
  public evaluateDailyCheckOut(
    scanTimeInput: string | Date,
    settings: AttendanceSettings
  ): { isEarlyLeave: boolean; earlyLeaveMinutes: number; thresholdTime: string } {
    let scanMinutes = 0;
    if (typeof scanTimeInput === 'string' && scanTimeInput.includes(':') && !scanTimeInput.includes('T')) {
      const parts = scanTimeInput.split(':').map((p) => parseInt(p, 10));
      scanMinutes = parts[0] * 60 + parts[1];
    } else {
      const d = new Date(scanTimeInput);
      scanMinutes = d.getHours() * 60 + d.getMinutes();
    }

    const workEnd = this.parseTimeToMinutes(settings.afternoonEndTime || settings.workEndTime || '17:00');
    const graceMin = settings.workCheckOutGraceMinutes ?? 15;
    const earliestAllowed = workEnd - graceMin;

    const isEarlyLeave = scanMinutes < earliestAllowed;
    const earlyLeaveMinutes = isEarlyLeave ? workEnd - scanMinutes : 0;

    const h = Math.floor(earliestAllowed / 60) % 24;
    const m = earliestAllowed % 60;
    const thresholdTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    return {
      isEarlyLeave,
      earlyLeaveMinutes,
      thresholdTime
    };
  }
}

export const attendanceSettingService = new AttendanceSettingService();
