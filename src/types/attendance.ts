export type AttendanceMethodType = 'faceId' | 'fingerprint' | 'card' | 'manual';

export type DailyAttendanceStatus = 'on_time' | 'late' | 'early_leave' | 'late_and_early' | 'absent' | 'leave';

export type LeavePeriod = 'full_day' | 'morning' | 'afternoon';

export const STANDARD_LEAVE_REASONS = [
  'Nghỉ việc riêng / Khẩn cấp',
  'Nghỉ phép năm',
  'Nghỉ ốm / Khám sức khỏe',
  'Nghỉ chế độ / Thai sản',
  'Đi công tác đột xuất'
] as const;

export type StandardLeaveReason = typeof STANDARD_LEAVE_REASONS[number];

export interface AttendanceScanLog {
  id: string;
  timestamp: string; // ISO String (e.g. 2026-11-04T07:22:15Z)
  type: 'check_in' | 'check_out';
  method: AttendanceMethodType;
  deviceName: string;
  faceScore?: number;
  cardUid?: string;
  note?: string;
}

export interface AttendanceAuditLog {
  id: string;
  action: 'admin_checkout' | 'admin_leave' | 'admin_checkin' | 'admin_override';
  performedBy: string; // Tên Quản trị viên
  performedAt: string; // ISO String
  reason: string; // Lý do giải trình
  details: string; // Chi tiết thay đổi (ví dụ: Bổ sung giờ về 17:00)
  previousStatus?: DailyAttendanceStatus;
  newStatus?: DailyAttendanceStatus;
}

export interface DailyAttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm or ISO
  checkInMethod?: AttendanceMethodType;
  checkInDevice?: string;
  checkOutTime?: string; // HH:mm or ISO
  checkOutMethod?: AttendanceMethodType;
  checkOutDevice?: string;
  lateMinutes: number; // 0 if on time
  earlyLeaveMinutes: number; // 0 if worked full shift
  status: DailyAttendanceStatus;
  scanLogs: AttendanceScanLog[];
  auditLogs?: AttendanceAuditLog[];
  leavePeriod?: LeavePeriod;
  checkOutAdminName?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyAttendanceFilter {
  date: string; // YYYY-MM-DD
  departmentId?: string;
  status?: 'all' | DailyAttendanceStatus;
  search?: string;
}

export interface DailyAttendanceSummary {
  date: string;
  totalEmployees: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number; // 0 - 100 (%)
}

export interface RecordAttendancePayload {
  tenantId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (defaults to now)
  type: 'check_in' | 'check_out' | 'auto';
  method: AttendanceMethodType;
  deviceName?: string;
  cardUid?: string;
  faceScore?: number;
  note?: string;
}

export interface AdminCheckOutPayload {
  tenantId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkOutTime: string; // HH:mm (e.g. 17:00)
  reason: string;
  adminName: string;
  note?: string;
}
