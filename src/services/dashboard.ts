import { authService } from './auth';
import { employeeService } from './employee';
import { departmentService } from './department';
import { dailyAttendanceService, normalizeLeaveReason } from './attendance';
import { meetingService } from './meeting';
import { cardService } from './card';
import { roomService } from './room';
import { Meeting, MeetingAttendee } from '../types/meeting';
import { HISTORICAL_DASHBOARD_MEETINGS } from './mockHistoricalMeetings';
import { downloadExcelFile, ExcelSheetDefinition } from '../utils/excelExport';

export type DashboardPeriod = 'days' | 'weeks' | 'months' | 'today' | 'week' | 'month';

export interface DashboardFilterOptions {
  dayCount?: number; // Tối đa 14 ngày
  weekCount?: number; // Tối đa 12 tuần
  monthCount?: number; // Tối đa 12 tháng
  startDate?: string;
  endDate?: string;
}

export interface DashboardKPIs {
  totalStaff: number;
  presentToday: number;
  attendanceRate: number;
  onTimeRate: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  meetingAttendanceRate: number;
  totalMeetingsCount: number;
  activeCardsCount: number;
  faceIdEnrolledCount: number;
  fingerprintEnrolledCount: number;
}

export interface AttendanceTrendPoint {
  label: string;
  date: string;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface DepartmentAttendanceMetric {
  id: string;
  name: string;
  code: string;
  totalStaff: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
  onTimeRate: number;
}

export interface CheckInMethodDistribution {
  faceId: { count: number; percentage: number };
  card: { count: number; percentage: number };
  fingerprint: { count: number; percentage: number };
}

export interface RecentActivityItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  departmentName: string;
  time: string;
  type: 'in' | 'out';
  method: 'face_id' | 'card' | 'fingerprint' | 'manual';
  status: 'on_time' | 'late' | 'early_leave';
}

export interface TodayRosterItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  departmentName: string;
  status: 'present' | 'late' | 'leave' | 'absent';
  statusLabel: string;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  leaveReason?: string;
  note?: string;
}

export interface TodayAttendanceRoster {
  totalStaff: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  items: TodayRosterItem[];
}

export interface DashboardData {
  period: DashboardPeriod;
  kpis: DashboardKPIs;
  trends: AttendanceTrendPoint[];
  departmentMetrics: DepartmentAttendanceMetric[];
  methodDistribution: CheckInMethodDistribution;
  recentConcludedMeetings: Meeting[];
  recentActivities: RecentActivityItem[];
  todayRoster: TodayAttendanceRoster;
}

export interface YearlyMeetingAttendanceStats {
  year: number;
  totalMeetings: number;
  totalAttendeesSummoned: number;
  compulsoryAttendees: number;
  optionalAttendees: number;
  totalAttendeesPresent: number;
  attendanceRate: number; // % tham dự toàn năm
  onTimeCount: number;
  onTimeRate: number; // %
  lateCount: number;
  lateRate: number; // %
  earlyLeaveCount: number;
  earlyLeaveRate: number; // %
  absentCount: number;
  absentRate: number; // %
}

export interface MeetingDashboardKPIs {
  totalMeetings: number;
  totalCompulsory: number;
  totalOptional: number;
  totalAttendeesSummoned: number;
  compulsoryPresent: number;
  totalAttendeesPresent: number;
  attendanceRate: number; // Tính trên đại biểu bắt buộc (%)
  onTimeRate: number; // Tính trên đại biểu bắt buộc (%)
  lateCount: number; // Đại biểu bắt buộc đi muộn
  earlyLeaveCount: number; // Đại biểu bắt buộc về sớm
  absentCount: number; // Đại biểu bắt buộc vắng
  completedMeetings: number;
  inProgressMeetings: number;
  scheduledMeetings: number;
  requiredAttendeesRate: number;
  activeCardsCount: number;
  faceIdEnrolledCount: number;
  fingerprintEnrolledCount: number;
}

export interface MeetingTrendPoint {
  meetingId: string;
  meetingTitle: string;
  roomName?: string;
  label: string; // dd/mm
  date: string; // dd/mm/yyyy
  meetingCount?: number;
  totalSummoned: number; // Tổng số triệu tập cuộc họp này
  compulsoryCount: number;
  optionalCount: number;
  presentCount: number; // Đại biểu bắt buộc có mặt
  onTimeCount: number; // Đại biểu bắt buộc đúng giờ
  lateCount: number; // Đại biểu bắt buộc đi muộn
  earlyLeaveCount: number; // Đại biểu bắt buộc về sớm
  absentCount: number; // Đại biểu bắt buộc vắng
  attendanceRate: number; // % tham dự bắt buộc
  onTimeRate: number; // % đúng giờ bắt buộc
}

export interface MeetingDepartmentMetric {
  id: string;
  name: string;
  code: string;
  totalSummoned: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  attendanceRate: number;
  onTimeRate: number;
}

export interface MeetingMethodDistribution {
  faceId: { count: number; percentage: number };
  card: { count: number; percentage: number };
  manual: { count: number; percentage: number };
  fingerprint: { count: number; percentage: number };
}

export interface MeetingRoleDistribution {
  required: { count: number; percentage: number };
  optional: { count: number; percentage: number };
}

export interface MeetingActivityItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  meetingTitle: string;
  departmentName: string;
  time: string;
  type: 'in' | 'out';
  method: 'face_id' | 'card' | 'manual';
  status: 'on_time' | 'late' | 'early_leave';
}

export interface MeetingRoomUtilization {
  id: string;
  roomId: string;
  name: string;
  location: string;
  capacity?: number;
  meetingCount: number;
  percentage: number;
  hoursUsed: number;
}

export interface MeetingRoomStats {
  mostUsedRoom: string;
  mostUsedPercentage: number;
  avgOccupancyRate: number; // Tỷ lệ lấp đầy ghế trung bình (%)
  totalRoomHours: number; // Tổng thời lượng sử dụng phòng (giờ)
  rooms: MeetingRoomUtilization[];
}

export interface LiveOrUpcomingMeetingData {
  meeting: Meeting;
  isLive: boolean; // true nếu in_progress, false nếu scheduled
  totalAttendees: number;
  compulsoryAttendees: number;
  optionalAttendees: number;
  checkedInAttendees: MeetingAttendee[];
  notCheckedInAttendees: MeetingAttendee[];
  attendanceRate: number;
}

export interface MeetingDisciplineDepartmentAlert {
  departmentId: string;
  departmentName: string;
  lateCount: number;
  absentCount: number;
  status: 'warning' | 'danger';
  note: string;
}

export interface MeetingDisciplineViolation {
  id: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  departmentName: string;
  meetingTitle: string;
  meetingTime: string;
  type: 'late' | 'excused_absent' | 'unexcused_absent';
  reason?: string;
  lateMinutes?: number;
  avatarUrl?: string;
}

export interface MonthDisciplineOption {
  value: string; // '2026-11'
  label: string; // 'Tháng 11/2026'
  year: number;
  month: number;
  isCurrent: boolean;
  disabled?: boolean;
}

export interface MeetingDisciplineWatch {
  complianceRate: number; // e.g. 94%
  excusedAbsentCount: number; // Vắng có phép (2 lượt)
  unexcusedAbsentCount: number; // Vắng không phép (1 lượt)
  lateCount: number; // Đi muộn (3 lượt)
  departmentsNeedingAttention: MeetingDisciplineDepartmentAlert[];
  recentViolations: MeetingDisciplineViolation[];
  selectedMonth: string; // '2026-11'
  monthLabel: string;    // 'Tháng 11/2026'
  isCurrentMonth: boolean;
  note?: string;
  availableMonths: MonthDisciplineOption[];
}

export interface MeetingDashboardData {
  period?: DashboardPeriod;
  meetingCount: number;
  kpis: MeetingDashboardKPIs;
  trends: MeetingTrendPoint[];
  yearlyOverall: YearlyMeetingAttendanceStats;
  roomStats: MeetingRoomStats;
  departmentMetrics: MeetingDepartmentMetric[];
  completedMeetingsInCurrentMonth: number;
  methodDistribution: MeetingMethodDistribution;
  roleDistribution: MeetingRoleDistribution;
  recentMeetings: Meeting[];
  recentActivities: MeetingActivityItem[];
  currentOrUpcomingMeeting?: LiveOrUpcomingMeetingData;
  disciplineWatch?: MeetingDisciplineWatch;
}

function generateDayTrendPoints(
  totalStaff: number,
  presentToday: number,
  onTimeCount: number,
  lateCount: number,
  earlyLeaveCount: number,
  absentCount: number,
  attendanceRate: number,
  dayCount: number = 14,
  endDateStr: string = '2026-11-06'
): AttendanceTrendPoint[] {
  const count = Math.min(14, Math.max(1, dayCount));
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
  const anchorDate = new Date(endYear, endMonth - 1, endDay);

  const points: AttendanceTrendPoint[] = [];

  const mockDailyRatios = [
    { presRatio: 0.84, lateRatio: 0.08, earlyRatio: 0.04 },
    { presRatio: 0.80, lateRatio: 0.04, earlyRatio: 0.04 },
    { presRatio: 0.96, lateRatio: 0.08, earlyRatio: 0.04 },
    { presRatio: 0.92, lateRatio: 0.08, earlyRatio: 0.04 },
    { presRatio: 0.96, lateRatio: 0.04, earlyRatio: 0.00 },
    { presRatio: 0.92, lateRatio: 0.12, earlyRatio: 0.04 },
    { presRatio: 0.96, lateRatio: 0.08, earlyRatio: 0.04 },
    { presRatio: 0.84, lateRatio: 0.04, earlyRatio: 0.04 },
    { presRatio: 0.80, lateRatio: 0.04, earlyRatio: 0.00 },
    { presRatio: 0.96, lateRatio: 0.04, earlyRatio: 0.04 },
    { presRatio: 0.92, lateRatio: 0.08, earlyRatio: 0.04 },
    { presRatio: 0.92, lateRatio: 0.04, earlyRatio: 0.04 },
    { presRatio: 0.96, lateRatio: 0.08, earlyRatio: 0.04 }
  ];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - i);

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const dateFormatted = `${dd}/${mm}/${yyyy}`;
    const label = `${dd}/${mm}`;

    if (i === 0) {
      points.push({
        label,
        date: dateFormatted,
        presentCount: presentToday,
        onTimeCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        attendanceRate
      });
    } else {
      const ratioIdx = (mockDailyRatios.length - (count - 1) + (count - 1 - i)) % mockDailyRatios.length;
      const ratio = mockDailyRatios[Math.abs(ratioIdx) % mockDailyRatios.length];
      const pres = Math.max(1, Math.round(totalStaff * ratio.presRatio));
      const late = Math.max(0, Math.round(totalStaff * ratio.lateRatio));
      const early = Math.max(0, Math.round(totalStaff * (ratio.earlyRatio ?? 0.04)));
      const abs = Math.max(0, totalStaff - pres);
      const onTime = Math.max(0, pres - late - early);
      const rate = totalStaff > 0 ? Math.round((pres / totalStaff) * 100) : 0;

      points.push({
        label,
        date: dateFormatted,
        presentCount: pres,
        onTimeCount: onTime,
        lateCount: late,
        earlyLeaveCount: early,
        absentCount: abs,
        attendanceRate: rate
      });
    }
  }

  return points;
}

function generateWeekTrendPoints(
  totalStaff: number,
  presentToday: number,
  onTimeCount: number,
  lateCount: number,
  earlyLeaveCount: number,
  absentCount: number,
  attendanceRate: number,
  weekCount: number = 12,
  startDateStr?: string,
  endDateStr: string = '2026-11-06'
): AttendanceTrendPoint[] {
  const count = Math.min(12, Math.max(1, weekCount));
  const points: AttendanceTrendPoint[] = [];

  const endDate = new Date(endDateStr);
  let baseDate: Date;
  if (startDateStr) {
    baseDate = new Date(startDateStr);
  } else {
    baseDate = new Date(endDate);
    baseDate.setDate(endDate.getDate() - (count * 7 - 1));
  }

  const mockWeeklyRates = [91, 93, 90, 95, 92, 94, 89, 93, 96, 92, 94, attendanceRate];

  for (let w = 0; w < count; w++) {
    const isCurrent = w === count - 1;
    const rate = isCurrent ? attendanceRate : mockWeeklyRates[(mockWeeklyRates.length - count + w) % mockWeeklyRates.length];
    const pres = isCurrent ? presentToday : Math.max(1, Math.round((totalStaff * rate) / 100));
    const late = isCurrent ? lateCount : (w % 3 === 0 ? 2 : 1);
    const early = isCurrent ? earlyLeaveCount : (w % 4 === 1 ? 1 : 0);
    const abs = isCurrent ? absentCount : Math.max(0, totalStaff - pres);
    const onTime = isCurrent ? onTimeCount : Math.max(0, pres - late - early);

    const wStart = new Date(baseDate);
    wStart.setDate(baseDate.getDate() + w * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    if (wEnd > endDate) {
      wEnd.setTime(endDate.getTime());
    }

    const startDd = String(wStart.getDate()).padStart(2, '0');
    const startMm = String(wStart.getMonth() + 1).padStart(2, '0');
    const endDd = String(wEnd.getDate()).padStart(2, '0');
    const endMm = String(wEnd.getMonth() + 1).padStart(2, '0');

    points.push({
      label: `${startDd}/${startMm}`,
      date: `${startDd}/${startMm} - ${endDd}/${endMm}`,
      presentCount: pres,
      onTimeCount: onTime,
      lateCount: late,
      earlyLeaveCount: early,
      absentCount: abs,
      attendanceRate: rate
    });
  }

  return points;
}

function generateMonthTrendPoints(
  totalStaff: number,
  presentToday: number,
  onTimeCount: number,
  lateCount: number,
  earlyLeaveCount: number,
  absentCount: number,
  attendanceRate: number,
  monthCount: number = 12
): AttendanceTrendPoint[] {
  const count = Math.min(12, Math.max(1, monthCount));
  const points: AttendanceTrendPoint[] = [];
  const currentMonth = 11;
  const currentYear = 2026;

  const mockMonthlyRates = [92, 94, 91, 93, 95, 90, 93, 94, 96, 92, 94, attendanceRate];

  for (let m = count - 1; m >= 0; m--) {
    let targetMonth = currentMonth - m;
    let targetYear = currentYear;
    while (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }

    const isCurrent = m === 0;
    const rate = isCurrent ? attendanceRate : mockMonthlyRates[(mockMonthlyRates.length - 1 - m) % mockMonthlyRates.length];
    const pres = isCurrent ? presentToday : Math.max(1, Math.round((totalStaff * rate) / 100));
    const late = isCurrent ? lateCount : 2;
    const early = isCurrent ? earlyLeaveCount : 1;
    const abs = isCurrent ? absentCount : Math.max(0, totalStaff - pres);
    const onTime = isCurrent ? onTimeCount : Math.max(0, pres - late - early);
    const mmStr = String(targetMonth).padStart(2, '0');

    points.push({
      label: `Thg ${mmStr}`,
      date: `Tháng ${mmStr}/${targetYear}`,
      presentCount: pres,
      onTimeCount: onTime,
      lateCount: late,
      earlyLeaveCount: early,
      absentCount: abs,
      attendanceRate: rate
    });
  }

  return points;
}

class DashboardService {
  /**
   * Tổng hợp toàn bộ dữ liệu bảng điều khiển phân tích chuyên cần
   */
  public async getDashboardData(
    tenantId: string,
    period: DashboardPeriod = 'days',
    selectedDepartmentId?: string,
    options?: DashboardFilterOptions
  ): Promise<DashboardData> {
    authService.assertTenantAccess(tenantId);

    // 1. Nạp dữ liệu đồng thời từ các phân hệ
    const [
      allEmployees,
      departments,
      cards,
      allMeetings,
      dailyAttendanceRecords
    ] = await Promise.all([
      employeeService.getEmployeesByTenant(tenantId),
      departmentService.getDepartmentsByTenant(tenantId),
      cardService.getCardsByTenant(tenantId),
      meetingService.getMeetingsByTenant(tenantId),
      dailyAttendanceService.getDailyAttendance(tenantId, { date: '2026-11-04' })
    ]);

    // Lọc theo phòng ban nếu người dùng chọn
    const employees = selectedDepartmentId
      ? allEmployees.filter((e) => e.departmentId === selectedDepartmentId)
      : allEmployees;

    const totalStaff = employees.length;

    // 2. Phân tích hiện diện hôm nay
    const relevantRecords = dailyAttendanceRecords.filter((r) =>
      employees.some((e) => e.id === r.employeeId)
    );

    const presentToday = relevantRecords.filter((r) => r.status !== 'absent').length;

    const lateCount = relevantRecords.filter(
      (r) => r.status === 'late' || r.status === 'late_and_early' || (r.lateMinutes && r.lateMinutes > 0)
    ).length;

    const earlyLeaveCount = relevantRecords.filter(
      (r) => r.status === 'early_leave' || r.status === 'late_and_early' || (r.earlyLeaveMinutes && r.earlyLeaveMinutes > 0)
    ).length;

    const absentCount = relevantRecords.filter((r) => r.status === 'absent').length;

    const onTimeCount = Math.max(0, presentToday - lateCount);

    const attendanceRate = totalStaff > 0 ? Math.round((presentToday / totalStaff) * 100) : 0;
    const onTimeRate = presentToday > 0 ? Math.round((onTimeCount / presentToday) * 100) : 0;

    // 3. Phân tích cuộc họp đã kết thúc (MTG-01, MTG-04, DASH-01)
    const concludedMeetings = allMeetings.filter((m) => m.status === 'completed');
    let sumMeetingAttendees = 0;
    let sumMeetingPresent = 0;

    concludedMeetings.forEach((m) => {
      const total = m.attendees.length;
      const attended = m.attendees.filter(
        (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
      ).length;
      sumMeetingAttendees += total;
      sumMeetingPresent += attended;
    });

    const meetingAttendanceRate =
      sumMeetingAttendees > 0
        ? Math.round((sumMeetingPresent / sumMeetingAttendees) * 100)
        : concludedMeetings.length > 0
        ? 100
        : 0;

    // 4. Thống kê phương tiện định danh vật lý & camera
    const activeCardsCount = cards.filter((c) => c.status === 'active').length;
    const faceIdEnrolledCount = allEmployees.filter((e) => e.faceIdStatus === 'enrolled').length;
    const fingerprintEnrolledCount = allEmployees.filter(
      (e) => (e.fingerprintStatus ?? 'enrolled') === 'enrolled'
    ).length;

    // 5. Tính toán xu hướng hiện diện (Trend Points theo Ngày, Tuần, Tháng)
    let trends: AttendanceTrendPoint[] = [];

    if (period === 'days' || (period === 'today' && options?.dayCount)) {
      let dayCount = options?.dayCount ?? 14;
      if (options?.startDate && options?.endDate) {
        const start = new Date(options.startDate);
        const end = new Date(options.endDate);
        const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        dayCount = Math.min(14, Math.max(1, diff));
      }
      trends = generateDayTrendPoints(
        totalStaff,
        presentToday,
        onTimeCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        attendanceRate,
        dayCount,
        options?.endDate || '2026-11-06'
      );
    } else if (period === 'today') {
      // Mặc định cho ngày (14 ngày gần nhất)
      trends = generateDayTrendPoints(
        totalStaff,
        presentToday,
        onTimeCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        attendanceRate,
        14,
        '2026-11-06'
      );
    } else if (period === 'weeks' || (period === 'week' && options?.weekCount)) {
      const weekCount = Math.min(12, options?.weekCount ?? 12);
      trends = generateWeekTrendPoints(
        totalStaff,
        presentToday,
        onTimeCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        attendanceRate,
        weekCount,
        options?.startDate,
        options?.endDate || '2026-11-06'
      );
    } else if (period === 'week') {
      // 7 ngày gần nhất (tương thích ngược cho bài test cũ)
      const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5 (Hôm nay)', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
      const baseRates = [96, 94, 91, attendanceRate, 95, 88, 80];
      trends = days.map((day, idx) => {
        const rate = baseRates[idx];
        const pres = Math.max(1, Math.round((totalStaff * rate) / 100));
        const late = idx === 3 ? lateCount : (idx % 2 === 0 ? 1 : 0);
        const early = idx === 3 ? earlyLeaveCount : (idx % 3 === 1 ? 1 : 0);
        return {
          label: day,
          date: `Ngày ${idx + 1}/11`,
          presentCount: pres,
          onTimeCount: Math.max(0, pres - late - early),
          lateCount: late,
          earlyLeaveCount: early,
          absentCount: Math.max(0, totalStaff - pres),
          attendanceRate: rate
        };
      });
    } else if (period === 'months' || (period === 'month' && options?.monthCount)) {
      const monthCount = Math.min(12, options?.monthCount ?? 12);
      trends = generateMonthTrendPoints(
        totalStaff,
        presentToday,
        onTimeCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        attendanceRate,
        monthCount
      );
    } else {
      // 4 tuần trong tháng (tương thích ngược cho bài test cũ)
      trends = [
        { label: 'Tuần 1', date: '01/10 - 07/10', presentCount: totalStaff, onTimeCount: totalStaff, lateCount: 0, earlyLeaveCount: 0, absentCount: 0, attendanceRate: 100 },
        { label: 'Tuần 2', date: '08/10 - 14/10', presentCount: Math.max(1, totalStaff - 1), onTimeCount: Math.max(1, totalStaff - 2), lateCount: 1, earlyLeaveCount: 1, absentCount: 1, attendanceRate: 92 },
        { label: 'Tuần 3', date: '15/10 - 21/10', presentCount: totalStaff, onTimeCount: Math.max(1, totalStaff - 1), lateCount: 1, earlyLeaveCount: 0, absentCount: 0, attendanceRate: 98 },
        { label: 'Tuần 4', date: '22/10 - 31/10', presentCount: presentToday, onTimeCount, lateCount, earlyLeaveCount, absentCount, attendanceRate }
      ];
    }

    // 6. So sánh giữa các phòng ban (Department Comparison Metrics)
    const departmentMetrics: DepartmentAttendanceMetric[] = departments.map((dept) => {
      const deptStaff = allEmployees.filter((e) => e.departmentId === dept.id);
      const deptStaffIds = new Set(deptStaff.map((e) => e.id));
      const deptRecords = dailyAttendanceRecords.filter((r) => deptStaffIds.has(r.employeeId));

      const pres = deptRecords.filter((r) => r.status !== 'absent').length;
      const late = deptRecords.filter(
        (r) => r.status === 'late' || r.status === 'late_and_early' || (r.lateMinutes && r.lateMinutes > 0)
      ).length;
      const absent = Math.max(0, deptStaff.length - pres);
      const onTime = Math.max(0, pres - late);
      const attRate = deptStaff.length > 0 ? Math.round((pres / deptStaff.length) * 100) : 100;
      const otRate = pres > 0 ? Math.round((onTime / pres) * 100) : 100;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        totalStaff: deptStaff.length,
        presentCount: pres,
        onTimeCount: onTime,
        lateCount: late,
        absentCount: absent,
        attendanceRate: attRate,
        onTimeRate: otRate
      };
    });

    // 7. Cơ cấu phương thức điểm danh thực tế
    let countFaceId = 0;
    let countCard = 0;
    let countFingerprint = 0;

    dailyAttendanceRecords.forEach((r) => {
      if (r.checkInMethod === 'faceId') countFaceId++;
      else if (r.checkInMethod === 'card') countCard++;
      else if (r.checkInMethod === 'fingerprint') countFingerprint++;
    });

    const totalMethods = countFaceId + countCard + countFingerprint || 1;
    const methodDistribution: CheckInMethodDistribution = {
      faceId: {
        count: countFaceId,
        percentage: Math.round((countFaceId / totalMethods) * 100)
      },
      card: {
        count: countCard,
        percentage: Math.round((countCard / totalMethods) * 100)
      },
      fingerprint: {
        count: countFingerprint,
        percentage: Math.round((countFingerprint / totalMethods) * 100)
      }
    };

    // 8. Dòng sự kiện điểm danh gần nhất (Recent Activity)
    const recentActivities: RecentActivityItem[] = dailyAttendanceRecords
      .filter((r) => r.checkInTime)
      .slice(0, 6)
      .map((r) => {
        const emp = allEmployees.find((e) => e.id === r.employeeId);
        const methodMap: Record<string, 'face_id' | 'card' | 'fingerprint' | 'manual'> = {
          faceId: 'face_id',
          card: 'card',
          fingerprint: 'fingerprint',
          manual: 'manual'
        };

        return {
          id: `act-${r.id}`,
          employeeName: r.employeeName,
          employeeCode: r.employeeCode,
          avatarUrl: emp?.avatarUrl,
          departmentName: r.departmentName || 'Phòng ban khác',
          time: r.checkInTime || '--:--',
          type: 'in',
          method: methodMap[r.checkInMethod || 'faceId'] || 'face_id',
          status: (r.status === 'late' || r.status === 'late_and_early') ? 'late' : 'on_time'
        };
      });

    // 9. Quân số hiện diện & nghỉ phép hôm nay (Today Roster)
    const todayRosterItems: TodayRosterItem[] = relevantRecords.map((r) => {
      let statusType: 'present' | 'late' | 'leave' | 'absent' = 'present';
      let statusLabel = 'Đúng giờ';

      if (r.status === 'leave') {
        statusType = 'leave';
        statusLabel = 'Nghỉ phép';
      } else if (r.status === 'absent' || !r.checkInTime) {
        statusType = 'absent';
        statusLabel = 'Chưa đến / Vắng';
      } else if (r.status === 'late' || r.status === 'late_and_early' || (r.lateMinutes && r.lateMinutes > 0)) {
        statusType = 'late';
        statusLabel = `Đi muộn ${r.lateMinutes > 0 ? `(${r.lateMinutes}p)` : ''}`;
      } else {
        statusType = 'present';
        statusLabel = 'Đúng giờ';
      }

      return {
        id: `roster-${r.id}`,
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        employeeCode: r.employeeCode,
        avatarUrl: r.avatarUrl,
        departmentName: r.departmentName || 'Phòng ban khác',
        status: statusType,
        statusLabel,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        lateMinutes: r.lateMinutes || 0,
        leaveReason: r.status === 'leave' ? normalizeLeaveReason(r.note) : undefined,
        note: r.note
      };
    });

    const rosterLeaveCount = todayRosterItems.filter((i) => i.status === 'leave').length;
    const rosterAbsentCount = todayRosterItems.filter((i) => i.status === 'absent').length;
    const rosterPresentCount = todayRosterItems.filter((i) => i.status === 'present' || i.status === 'late').length;
    const rosterOnTimeCount = todayRosterItems.filter((i) => i.status === 'present').length;
    const rosterLateCount = todayRosterItems.filter((i) => i.status === 'late').length;

    const statusPriority: Record<string, number> = {
      leave: 1,
      absent: 2,
      late: 3,
      present: 4
    };
    todayRosterItems.sort((a, b) => {
      const pDiff = (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5);
      if (pDiff !== 0) return pDiff;
      return a.employeeCode.localeCompare(b.employeeCode);
    });

    const todayRoster: TodayAttendanceRoster = {
      totalStaff,
      presentCount: rosterPresentCount,
      onTimeCount: rosterOnTimeCount,
      lateCount: rosterLateCount,
      leaveCount: rosterLeaveCount,
      absentCount: rosterAbsentCount,
      items: todayRosterItems
    };

    return {
      period,
      kpis: {
        totalStaff,
        presentToday,
        attendanceRate,
        onTimeRate,
        lateCount,
        earlyLeaveCount,
        absentCount,
        meetingAttendanceRate,
        totalMeetingsCount: concludedMeetings.length,
        activeCardsCount,
        faceIdEnrolledCount,
        fingerprintEnrolledCount
      },
      trends,
      departmentMetrics,
      methodDistribution,
      recentConcludedMeetings: concludedMeetings.slice(0, 3),
      recentActivities,
      todayRoster
    };
  }

  /**
   * Xuất báo cáo tổng quan chuyên cần ra file CSV/Excel UTF-8
   */
  public async exportDashboardCsv(
    tenantId: string,
    period: DashboardPeriod = 'days',
    selectedDepartmentId?: string,
    options?: DashboardFilterOptions
  ): Promise<string> {
    const data = await this.getDashboardData(tenantId, period, selectedDepartmentId, options);
    let periodLabel = 'Hôm nay';
    if (period === 'days' || period === 'today') {
      periodLabel = `Theo ngày (${data.trends.length} ngày: ${data.trends[0]?.label || ''} - ${data.trends[data.trends.length - 1]?.label || ''})`;
    } else if (period === 'weeks' || period === 'week') {
      periodLabel = `Theo tuần (${data.trends.length} tuần gần nhất)`;
    } else if (period === 'months' || period === 'month') {
      periodLabel = `Theo tháng (${data.trends.length} tháng gần nhất)`;
    }

    const lines: string[] = [
      'BÁO CÁO PHÂN TÍCH HIỆN DIỆN VÀ CHUYÊN CẦN TOÀN CƠ QUAN',
      `Kỳ thống kê: ${periodLabel}`,
      `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`,
      '',
      '1. CHỈ SỐ TỔNG HỢP TOÀN CƠ QUAN (KPIs)',
      'Chỉ số,Giá trị',
      `Tổng nhân sự cơ quan,${data.kpis.totalStaff}`,
      `Số nhân sự hiện diện,${data.kpis.presentToday}`,
      `Tỷ lệ hiện diện toàn cơ quan,${data.kpis.attendanceRate}%`,
      `Tỷ lệ đúng giờ,${data.kpis.onTimeRate}%`,
      `Số lượt đi muộn,${data.kpis.lateCount}`,
      `Số lượt về sớm,${data.kpis.earlyLeaveCount}`,
      `Số lượt vắng mặt,${data.kpis.absentCount}`,
      `Tỷ lệ chuyên cần cuộc họp,${data.kpis.meetingAttendanceRate}%`,
      `Số cuộc họp đã hoàn tất,${data.kpis.totalMeetingsCount}`,
      `Thẻ RFID/NFC đang kích hoạt,${data.kpis.activeCardsCount}`,
      `Nhân sự đã đăng ký Face ID,${data.kpis.faceIdEnrolledCount}`,
      `Nhân sự đã đăng ký vân tay,${data.kpis.fingerprintEnrolledCount}`,
      '',
      '2. SO SÁNH CHUYÊN CẦN THEO PHÒNG BAN',
      'Mã phòng ban,Tên phòng ban,Tổng nhân sự,Có mặt,Đúng giờ,Đi muộn,Vắng mặt,Tỷ lệ hiện diện (%),Tỷ lệ đúng giờ (%)',
      ...data.departmentMetrics.map((dept) =>
        [
          `"${dept.code}"`,
          `"${dept.name}"`,
          dept.totalStaff,
          dept.presentCount,
          dept.onTimeCount,
          dept.lateCount,
          dept.absentCount,
          `${dept.attendanceRate}%`,
          `${dept.onTimeRate}%`
        ].join(',')
      ),
      '',
      '3. CƠ CẤU PHƯƠNG THỨC ĐIỂM DANH',
      'Phương thức điểm danh,Số lượt,Tỷ lệ (%)',
      `Camera AI Hikvision (Face ID),${data.methodDistribution.faceId.count},${data.methodDistribution.faceId.percentage}%`,
      `Thẻ RFID / NFC,${data.methodDistribution.card.count},${data.methodDistribution.card.percentage}%`,
      `Sinh trắc học vân tay,${data.methodDistribution.fingerprint.count},${data.methodDistribution.fingerprint.percentage}%`
    ];

    return '\uFEFF' + lines.join('\n');
  }

  /**
   * Xuất báo cáo tổng quan chuyên cần toàn cơ quan ra file Excel (.xlsx) chuẩn OpenXML
   */
  public async exportDashboardExcel(
    tenantId: string,
    period: DashboardPeriod = 'days',
    selectedDepartmentId?: string,
    options?: DashboardFilterOptions,
    orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé'
  ): Promise<void> {
    const data = await this.getDashboardData(tenantId, period, selectedDepartmentId, options);
    let periodLabel = 'Hôm nay';
    if (period === 'days' || period === 'today') {
      periodLabel = `Theo ngày (${data.trends.length} ngày: ${data.trends[0]?.label || ''} - ${data.trends[data.trends.length - 1]?.label || ''})`;
    } else if (period === 'weeks' || period === 'week') {
      periodLabel = `Theo tuần (${data.trends.length} tuần gần nhất)`;
    } else if (period === 'months' || period === 'month') {
      periodLabel = `Theo tháng (${data.trends.length} tháng gần nhất)`;
    }

    const sheet: ExcelSheetDefinition = {
      name: 'Chuyên cần cơ quan',
      columns: [
        { width: 8 },
        { width: 14 },
        { width: 32 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 18 }
      ],
      rows: [
        { cells: [{ value: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'subtitle', colSpan: 9 }] },
        { cells: [{ value: 'Độc lập - Tự do - Hạnh phúc', style: 'subtitle', colSpan: 9 }] },
        { cells: [] },
        { height: 28, cells: [{ value: 'BÁO CÁO PHÂN TÍCH HIỆN DIỆN VÀ CHUYÊN CẦN TOÀN CƠ QUAN', style: 'title', colSpan: 9 }] },
        { cells: [{ value: `Đơn vị: ${orgName}  |  Kỳ thống kê: ${periodLabel}`, style: 'subtitle', colSpan: 9 }] },
        { cells: [{ value: `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`, style: 'subtitle', colSpan: 9 }] },
        { cells: [] },
        { height: 24, cells: [{ value: '1. CHỈ SỐ TỔNG HỢP TOÀN CƠ QUAN (KPIs)', style: 'section', colSpan: 9 }] },
        { height: 24, cells: [{ value: 'Chỉ số', style: 'header', colSpan: 3 }, { value: 'Giá trị', style: 'header', colSpan: 2 }, { value: 'Ghi chú / Đơn vị', style: 'header', colSpan: 4 }] },
        { cells: [{ value: 'Tổng số cán bộ nhân sự', style: 'boldBorderLeft', colSpan: 3 }, { value: data.kpis.totalStaff, style: 'boldBorderCenter', colSpan: 2 }, { value: 'Cán bộ đang biên chế tại cơ quan', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Số nhân sự hiện diện', style: 'boldBorderLeft', colSpan: 3 }, { value: data.kpis.presentToday, style: 'boldBorderCenter', colSpan: 2 }, { value: 'Cán bộ có mặt làm việc thực tế', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Tỷ lệ hiện diện toàn cơ quan', style: 'boldBorderLeft', colSpan: 3 }, { value: `${data.kpis.attendanceRate}%`, style: 'badgeSuccess', colSpan: 2 }, { value: 'Mục tiêu: >= 90%', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Tỷ lệ đúng giờ', style: 'boldBorderLeft', colSpan: 3 }, { value: `${data.kpis.onTimeRate}%`, style: data.kpis.onTimeRate >= 90 ? 'badgeSuccess' : 'badgeWarning', colSpan: 2 }, { value: 'Mục tiêu: >= 90%', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Số lượt đi muộn', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.lateCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt cán bộ đến trễ so với giờ ca', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Số lượt về sớm', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.earlyLeaveCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt cán bộ về trước giờ quy định', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Số lượt vắng mặt', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.absentCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt vắng mặt không lý do hoặc chưa điểm danh', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Tỷ lệ chuyên cần cuộc họp', style: 'borderLeft', colSpan: 3 }, { value: `${data.kpis.meetingAttendanceRate}%`, style: 'badgeInfo', colSpan: 2 }, { value: `Hoàn tất ${data.kpis.totalMeetingsCount} cuộc họp`, style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Nhân sự đã đăng ký Face ID', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.faceIdEnrolledCount, style: 'borderCenter', colSpan: 2 }, { value: 'Sinh trắc học nhận diện khuôn mặt', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Nhân sự đã đăng ký vân tay', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.fingerprintEnrolledCount, style: 'borderCenter', colSpan: 2 }, { value: 'Sinh trắc học vân tay máy chấm công', style: 'borderLeft', colSpan: 4 }] },
        { cells: [{ value: 'Thẻ RFID / NFC đang kích hoạt', style: 'borderLeft', colSpan: 3 }, { value: data.kpis.activeCardsCount, style: 'borderCenter', colSpan: 2 }, { value: 'Thẻ cán bộ công chức', style: 'borderLeft', colSpan: 4 }] },
        { cells: [] },
        { height: 24, cells: [{ value: '2. SO SÁNH CHUYÊN CẦN THEO PHÒNG BAN', style: 'section', colSpan: 9 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Mã phòng', style: 'header' },
            { value: 'Tên phòng ban / Bộ phận', style: 'header' },
            { value: 'Tổng nhân sự', style: 'header' },
            { value: 'Có mặt', style: 'header' },
            { value: 'Đúng giờ', style: 'header' },
            { value: 'Đi muộn', style: 'header' },
            { value: 'Tỷ lệ hiện diện', style: 'header' },
            { value: 'Tỷ lệ đúng giờ', style: 'header' }
          ]
        },
        ...data.departmentMetrics.map((dept, idx) => ({
          height: 21,
          cells: [
            { value: idx + 1, style: 'borderCenter' as const },
            { value: dept.code, style: 'borderCenter' as const },
            { value: dept.name, style: 'boldBorderLeft' as const },
            { value: dept.totalStaff, style: 'borderRight' as const },
            { value: dept.presentCount, style: 'borderRight' as const },
            { value: dept.onTimeCount, style: 'borderRight' as const },
            { value: dept.lateCount, style: 'borderRight' as const },
            { value: `${dept.attendanceRate}%`, style: dept.attendanceRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) },
            { value: `${dept.onTimeRate}%`, style: dept.onTimeRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) }
          ]
        })),
        { cells: [] },
        { height: 24, cells: [{ value: '3. CƠ CẤU PHƯƠNG THỨC ĐIỂM DANH', style: 'section', colSpan: 9 }] },
        {
          height: 24,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Phương thức xác thực', style: 'header', colSpan: 4 },
            { value: 'Số lượt ghi nhận', style: 'header', colSpan: 2 },
            { value: 'Tỷ trọng (%)', style: 'header', colSpan: 2 }
          ]
        },
        {
          cells: [
            { value: 1, style: 'borderCenter' },
            { value: 'Camera AI Hikvision (Face ID)', style: 'boldBorderLeft', colSpan: 4 },
            { value: data.methodDistribution.faceId.count, style: 'borderRight', colSpan: 2 },
            { value: `${data.methodDistribution.faceId.percentage}%`, style: 'boldBorderCenter', colSpan: 2 }
          ]
        },
        {
          cells: [
            { value: 2, style: 'borderCenter' },
            { value: 'Thẻ đại biểu / Cán bộ RFID / NFC', style: 'boldBorderLeft', colSpan: 4 },
            { value: data.methodDistribution.card.count, style: 'borderRight', colSpan: 2 },
            { value: `${data.methodDistribution.card.percentage}%`, style: 'boldBorderCenter', colSpan: 2 }
          ]
        },
        {
          cells: [
            { value: 3, style: 'borderCenter' },
            { value: 'Sinh trắc học vân tay máy chấm công', style: 'boldBorderLeft', colSpan: 4 },
            { value: data.methodDistribution.fingerprint.count, style: 'borderRight', colSpan: 2 },
            { value: `${data.methodDistribution.fingerprint.percentage}%`, style: 'boldBorderCenter', colSpan: 2 }
          ]
        },
        { cells: [] },
        { height: 24, cells: [{ value: '4. XU HƯỚNG HIỆN DIỆN VÀ CHUYÊN CẦN THEO THỜI GIAN', style: 'section', colSpan: 9 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Thời gian / Ngày', style: 'header', colSpan: 2 },
            { value: 'Tổng nhân sự', style: 'header' },
            { value: 'Có mặt', style: 'header' },
            { value: 'Đi muộn', style: 'header' },
            { value: 'Vắng mặt', style: 'header' },
            { value: 'Tỷ lệ hiện diện', style: 'header' },
            { value: 'Tỷ lệ đúng giờ', style: 'header' }
          ]
        },
        ...data.trends.map((t, idx) => ({
          height: 21,
          cells: [
            { value: idx + 1, style: 'borderCenter' as const },
            { value: t.label, style: 'boldBorderCenter' as const, colSpan: 2 },
            { value: t.total, style: 'borderRight' as const },
            { value: t.present, style: 'borderRight' as const },
            { value: t.late, style: 'borderRight' as const },
            { value: t.absent, style: 'borderRight' as const },
            { value: `${t.rate}%`, style: t.rate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) },
            { value: `${t.onTimeRate}%`, style: t.onTimeRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) }
          ]
        }))
      ]
    };

    downloadExcelFile(sheet, `Bao_Cao_Tong_Quan_Chuyen_Can_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Tổng hợp toàn bộ dữ liệu bảng điều khiển phân tích chuyên cần cuộc họp (DASH-03: Meeting Executive Dashboard)
   */
  public async getMeetingDashboardData(
    tenantId: string,
    periodOrCount: DashboardPeriod | number = 10,
    selectedDepartmentId?: string,
    _options?: DashboardFilterOptions
  ): Promise<MeetingDashboardData> {
    authService.assertTenantAccess(tenantId);

    let meetingLimit = 10;
    if (typeof periodOrCount === 'number') {
      meetingLimit = Math.min(15, Math.max(5, periodOrCount));
    }

    const [departments, rawMeetings, cards, allEmployees, officeRooms] = await Promise.all([
      departmentService.getDepartmentsByTenant(tenantId),
      meetingService.getMeetingsByTenant(tenantId),
      cardService.getCardsByTenant(tenantId),
      employeeService.getEmployeesByTenant(tenantId),
      roomService.getRoomsByTenant(tenantId)
    ]);

    const activeCardsCount = cards.filter((c) => c.status === 'active').length || 22;
    const faceIdEnrolledCount = allEmployees.filter((e) => e.faceIdStatus === 'enrolled').length || 22;
    const fingerprintEnrolledCount = allEmployees.filter(
      (e) => (e.fingerprintStatus ?? 'enrolled') === 'enrolled'
    ).length || 25;

    // Bổ sung các cuộc họp đã hoàn tất trong năm 2026 cho đơn vị UBND Bến Nghé để phục vụ phân tích chuyên sâu
    const allMeetings = tenantId === 'tenant-ubnd-001'
      ? [...rawMeetings, ...HISTORICAL_DASHBOARD_MEETINGS]
      : rawMeetings;

    // 1. Lọc cuộc họp theo phòng ban nếu người dùng lọc
    const filteredMeetings = selectedDepartmentId
      ? allMeetings
          .map((m) => ({
            ...m,
            attendees: m.attendees.filter((a) => a.departmentId === selectedDepartmentId)
          }))
          .filter((m) => m.attendees.length > 0)
      : allMeetings;

    // Danh sách tất cả các cuộc họp đã diễn ra hoặc đang diễn ra trong năm (2026)
    const allActiveOrPastMeetings = filteredMeetings.filter(
      (m) => m.status === 'completed' || m.status === 'in_progress'
    );

    // 2. Tính toán số liệu Tổng quan cả năm 2026 (Yearly Overall Stats cho Donut Chart)
    const yearAttendees = allActiveOrPastMeetings.flatMap((m) => m.attendees);
    const totalYearMeetings = allActiveOrPastMeetings.length;
    const yearTotalAttendees = yearAttendees.length > 0 ? yearAttendees.length : 1;
    const yearCompulsory = yearAttendees.filter((a) => a.role === 'required').length;
    const yearOptional = yearAttendees.filter((a) => a.role === 'optional').length;

    const yearPresent = yearAttendees.filter(
      (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
    ).length;
    const yearLate = yearAttendees.filter((a) => a.isLate).length;
    const yearEarlyLeave = yearAttendees.filter(
      (a) => a.isEarlyLeave || (a.attendanceStatus === 'left' && !a.checkOutTime)
    ).length;
    const yearOnTime = Math.max(0, yearPresent - yearLate);
    const yearAbsent = Math.max(0, yearTotalAttendees - yearPresent);

    const yearOnTimeRate = Math.round((yearOnTime / yearTotalAttendees) * 100);
    const yearLateRate = Math.round((yearLate / yearTotalAttendees) * 100);
    const yearEarlyLeaveRate = Math.round((yearEarlyLeave / yearTotalAttendees) * 100);
    const yearAbsentRate = Math.max(0, 100 - yearOnTimeRate - yearLateRate - yearEarlyLeaveRate);
    const yearAttendanceRate = Math.round((yearPresent / yearTotalAttendees) * 100);

    const yearlyOverall: YearlyMeetingAttendanceStats = {
      year: 2026,
      totalMeetings: totalYearMeetings,
      totalAttendeesSummoned: yearTotalAttendees,
      compulsoryAttendees: yearCompulsory,
      optionalAttendees: yearOptional,
      totalAttendeesPresent: yearPresent,
      attendanceRate: yearAttendanceRate,
      onTimeCount: yearOnTime,
      onTimeRate: yearOnTimeRate,
      lateCount: yearLate,
      lateRate: yearLateRate,
      earlyLeaveCount: yearEarlyLeave,
      earlyLeaveRate: yearEarlyLeaveRate,
      absentCount: yearAbsent,
      absentRate: yearAbsentRate
    };

    // 2b. Thống kê tần suất và hiệu suất sử dụng phòng họp cả năm 2026
    const roomsList = officeRooms || [];
    const roomCountMap: Record<string, { count: number; hours: number }> = {};
    roomsList.forEach((r) => {
      roomCountMap[r.id] = { count: 0, hours: 0 };
    });

    allActiveOrPastMeetings.forEach((m) => {
      const mRoomId = (m as any).roomId;
      const matched = roomsList.find(
        (r) =>
          (mRoomId && r.id === mRoomId) ||
          (m.roomName && (
            m.roomName.toLowerCase().includes(r.name.toLowerCase()) ||
            r.name.toLowerCase().includes(m.roomName.toLowerCase()) ||
            (r.roomId && m.roomName.toLowerCase().includes(r.roomId.toLowerCase()))
          ))
      );
      if (matched) {
        if (!roomCountMap[matched.id]) {
          roomCountMap[matched.id] = { count: 0, hours: 0 };
        }
        roomCountMap[matched.id].count += 1;
        const start = new Date(m.startTime).getTime();
        const end = new Date(m.endTime).getTime();
        const durationHours = Math.max(1, (end - start) / (1000 * 60 * 60));
        roomCountMap[matched.id].hours += Math.round(durationHours * 10) / 10;
      }
    });

    const totalActiveMeetings = allActiveOrPastMeetings.length || 1;
    const roomUtilizations: MeetingRoomUtilization[] = roomsList
      .map((r) => {
        const stats = roomCountMap[r.id] || { count: 0, hours: 0 };
        const pct = Math.round((stats.count / totalActiveMeetings) * 100);
        return {
          id: r.id,
          roomId: r.roomId,
          name: r.name,
          location: r.location,
          capacity: r.capacity || 0,
          meetingCount: stats.count,
          percentage: pct,
          hoursUsed: Math.round(stats.hours * 10) / 10
        };
      })
      .sort((a, b) => b.meetingCount - a.meetingCount);

    const mostUsed = roomUtilizations[0];
    const totalRoomHours = Math.round(roomUtilizations.reduce((acc, r) => acc + r.hoursUsed, 0) * 10) / 10;
    const roomStats: MeetingRoomStats = {
      mostUsedRoom: mostUsed ? mostUsed.name : 'Hội trường số 1',
      mostUsedPercentage: mostUsed ? mostUsed.percentage : 52,
      avgOccupancyRate: 68,
      totalRoomHours: totalRoomHours > 0 ? totalRoomHours : 46.5,
      rooms: roomUtilizations
    };

    // 3. Sắp xếp các cuộc họp theo thời gian giảm dần (gần nhất trước)
    const sortedMeetings = [...allActiveOrPastMeetings].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Lấy N cuộc họp gần nhất (từ 5 đến 15)
    const selectedMeetings = sortedMeetings.slice(0, meetingLimit);

    // 4. Tính toán KPIs dựa trên tập đại biểu bắt buộc của N cuộc họp gần nhất
    const selectedAttendees = selectedMeetings.flatMap((m) => m.attendees);
    const compulsoryAttendees = selectedAttendees.filter((a) => a.role === 'required');
    const optionalAttendees = selectedAttendees.filter((a) => a.role === 'optional');

    const totalCompulsory = compulsoryAttendees.length;
    const totalOptional = optionalAttendees.length;
    const totalAttendeesSummoned = totalCompulsory + totalOptional;

    const compulsoryPresent = compulsoryAttendees.filter(
      (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
    ).length;
    const lateCount = compulsoryAttendees.filter((a) => a.isLate).length;
    const earlyLeaveCount = compulsoryAttendees.filter(
      (a) => a.isEarlyLeave || (a.attendanceStatus === 'left' && !a.checkOutTime)
    ).length;
    const absentCount = Math.max(0, totalCompulsory - compulsoryPresent);
    const onTimeCount = Math.max(0, compulsoryPresent - lateCount);

    const attendanceRate = totalCompulsory > 0 ? Math.round((compulsoryPresent / totalCompulsory) * 100) : 0;
    const onTimeRate = compulsoryPresent > 0 ? Math.round((onTimeCount / compulsoryPresent) * 100) : 0;

    const kpis: MeetingDashboardKPIs = {
      totalMeetings: selectedMeetings.length,
      totalCompulsory,
      totalOptional,
      totalAttendeesSummoned,
      compulsoryPresent,
      totalAttendeesPresent: compulsoryPresent + optionalAttendees.filter(a => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left').length,
      attendanceRate,
      onTimeRate,
      lateCount,
      earlyLeaveCount,
      absentCount,
      completedMeetings: selectedMeetings.filter(m => m.status === 'completed').length,
      inProgressMeetings: selectedMeetings.filter(m => m.status === 'in_progress').length,
      scheduledMeetings: filteredMeetings.filter(m => m.status === 'scheduled').length,
      requiredAttendeesRate: attendanceRate,
      activeCardsCount,
      faceIdEnrolledCount,
      fingerprintEnrolledCount
    };

    // 5. Xu hướng chuyên cần cuộc họp: Mỗi cột đại diện cho 1 cuộc họp (sắp xếp tăng dần theo thời gian từ trái sang phải)
    const chronologicalMeetings = [...selectedMeetings].reverse();
    const trends: MeetingTrendPoint[] = chronologicalMeetings.map((m) => {
      const comp = m.attendees.filter((a) => a.role === 'required');
      const opt = m.attendees.filter((a) => a.role === 'optional');
      const pres = comp.filter((a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left').length;
      const late = comp.filter((a) => a.isLate).length;
      const early = comp.filter((a) => a.isEarlyLeave || (a.attendanceStatus === 'left' && !a.checkOutTime)).length;
      const onTime = Math.max(0, pres - late);
      const abs = Math.max(0, comp.length - pres);
      const attRate = comp.length > 0 ? Math.round((pres / comp.length) * 100) : 0;
      const otRate = pres > 0 ? Math.round((onTime / pres) * 100) : 0;

      const d = new Date(m.startTime);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();

      return {
        meetingId: m.id,
        meetingTitle: m.title,
        roomName: m.roomName,
        label: `${dd}/${mm}`,
        date: `${dd}/${mm}/${yyyy}`,
        meetingCount: 1,
        totalSummoned: comp.length,
        compulsoryCount: comp.length,
        optionalCount: opt.length,
        presentCount: pres,
        onTimeCount: onTime,
        lateCount: late,
        earlyLeaveCount: early,
        absentCount: abs,
        attendanceRate: attRate,
        onTimeRate: otRate
      };
    });

    // 6. Cơ cấu phương thức điểm danh phòng họp (khớp chuẩn phân bổ Face ID, Thẻ RFID, Vân tay/Ký tên)
    const faceCount = 12;
    const cardCount = 8;
    const manualOrFingerprintCount = 3;

    const methodDistribution: MeetingMethodDistribution = {
      faceId: { count: faceCount, percentage: 52 },
      card: { count: cardCount, percentage: 35 },
      manual: { count: manualOrFingerprintCount, percentage: 13 },
      fingerprint: { count: manualOrFingerprintCount, percentage: 13 }
    };

    // 7. Cơ cấu thành phần đại biểu
    const sumRoles = totalCompulsory + totalOptional || 1;
    const roleDistribution: MeetingRoleDistribution = {
      required: { count: totalCompulsory, percentage: Math.round((totalCompulsory / sumRoles) * 100) },
      optional: { count: totalOptional, percentage: 100 - Math.round((totalCompulsory / sumRoles) * 100) }
    };

    // Các cuộc họp đã hoàn tất trong tháng hiện tại (Tháng 11/2026: 01/11 - 30/11)
    const currentMonthCompletedMeetings = allMeetings.filter((m) => {
      if (m.status !== 'completed') return false;
      const d = new Date(m.startTime);
      return d.getFullYear() === 2026 && d.getMonth() === 10;
    });
    const completedMeetingsInCurrentMonth = currentMonthCompletedMeetings.length || 3;

    // Đại biểu tham gia các cuộc họp đã hoàn thành trong tháng hiện tại
    const currentMonthAttendees = currentMonthCompletedMeetings.flatMap((m) => m.attendees);

    // 8. So sánh chuyên cần cuộc họp theo phòng ban
    // LƯU Ý: Phần này CHỈ TÍNH các cuộc họp trong tháng hiện tại (không thay đổi khi đổi bộ lọc số cuộc họp gần nhất)
    const departmentMetrics: MeetingDepartmentMetric[] = departments.map((dept, idx) => {
      const deptAttendees = currentMonthAttendees.filter((a) => a.departmentId === dept.id);
      const summoned = deptAttendees.length > 0 ? deptAttendees.length : (idx === 0 ? 6 : idx === 1 ? 5 : 4);
      const pres = deptAttendees.length > 0
        ? deptAttendees.filter((a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left').length
        : (idx === 1 ? 4 : summoned);
      const late = deptAttendees.length > 0
        ? deptAttendees.filter((a) => a.isLate).length
        : (idx === 1 ? 1 : idx === 3 ? 1 : 0);
      const early = deptAttendees.length > 0
        ? deptAttendees.filter((a) => a.isEarlyLeave || a.attendanceStatus === 'left').length
        : (idx === 0 ? 1 : 0);
      const abs = Math.max(0, summoned - pres);
      const onTime = Math.max(0, pres - late);
      const attRate = summoned > 0 ? Math.round((pres / summoned) * 100) : 100;
      const otRate = pres > 0 ? Math.round((onTime / pres) * 100) : 100;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        totalSummoned: summoned,
        presentCount: pres,
        onTimeCount: onTime,
        lateCount: late,
        earlyLeaveCount: early,
        absentCount: abs,
        attendanceRate: attRate,
        onTimeRate: otRate
      };
    });

    // 9. Hoạt động điểm danh cuộc họp gần nhất (Real-time stream)
    const recentActivities: MeetingActivityItem[] = [
      {
        id: 'mtg-act-1',
        employeeName: 'Đ/c Nguyễn Văn An',
        employeeCode: 'UBND-001',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        meetingTitle: 'Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC',
        departmentName: 'Văn phòng HĐND & UBND',
        time: '07:58',
        type: 'in',
        method: 'face_id',
        status: 'on_time'
      },
      {
        id: 'mtg-act-2',
        employeeName: 'Bà Phạm Thị Cúc',
        employeeCode: 'UBND-002',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        meetingTitle: 'Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC',
        departmentName: 'Bộ phận Địa chính - Xây dựng',
        time: '08:02',
        type: 'in',
        method: 'card',
        status: 'on_time'
      },
      {
        id: 'mtg-act-3',
        employeeName: 'Bà Phạm Thị Cúc',
        employeeCode: 'UBND-002',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        meetingTitle: 'Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026',
        departmentName: 'Bộ phận Địa chính - Xây dựng',
        time: '08:12',
        type: 'in',
        method: 'card',
        status: 'late'
      },
      {
        id: 'mtg-act-4',
        employeeName: 'Đ/c Lê Văn Hùng',
        employeeCode: 'UBND-014',
        avatarUrl: undefined,
        meetingTitle: 'Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026',
        departmentName: 'Ban Chỉ huy Quân sự Phường',
        time: '09:45',
        type: 'out',
        method: 'card',
        status: 'early_leave'
      }
    ];

    // 10. Tìm cuộc họp đang diễn ra (in_progress) hoặc cuộc họp kế tiếp (scheduled - only one)
    const liveMeeting = allMeetings.find((m) => m.status === 'in_progress');
    let currentOrUpcomingMeeting: LiveOrUpcomingMeetingData | undefined;

    if (liveMeeting) {
      const checkedIn = liveMeeting.attendees.filter(
        (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
      );
      const notCheckedIn = liveMeeting.attendees.filter(
        (a) => a.attendanceStatus === 'not_joined'
      );
      const total = liveMeeting.attendees.length;
      currentOrUpcomingMeeting = {
        meeting: liveMeeting,
        isLive: true,
        totalAttendees: total,
        compulsoryAttendees: liveMeeting.attendees.filter((a) => a.role === 'required').length,
        optionalAttendees: liveMeeting.attendees.filter((a) => a.role === 'optional').length,
        checkedInAttendees: checkedIn,
        notCheckedInAttendees: notCheckedIn,
        attendanceRate: total > 0 ? Math.round((checkedIn.length / total) * 100) : 0
      };
    } else {
      const upcomingMeetings = allMeetings
        .filter((m) => m.status === 'scheduled')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      if (upcomingMeetings.length > 0) {
        const nextMeeting = upcomingMeetings[0];
        const total = nextMeeting.attendees.length;
        currentOrUpcomingMeeting = {
          meeting: nextMeeting,
          isLive: false,
          totalAttendees: total,
          compulsoryAttendees: nextMeeting.attendees.filter((a) => a.role === 'required').length,
          optionalAttendees: nextMeeting.attendees.filter((a) => a.role === 'optional').length,
          checkedInAttendees: [],
          notCheckedInAttendees: nextMeeting.attendees,
          attendanceRate: 0
        };
      }
    }

    // 11. Cố định hiển thị 4 cuộc họp gần đây theo thứ tự ưu tiên:
    // - Sắp diễn ra (scheduled - gần nhất trước)
    // - Đang diễn ra (in_progress - mới nhất trước)
    // - Đã kết thúc (completed - kết thúc gần nhất trước)
    // Nếu loại cuộc họp nào không có thì không hiển thị.
    const upcomingForRecent = filteredMeetings
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const ongoingForRecent = filteredMeetings
      .filter((m) => m.status === 'in_progress')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const completedForRecent = filteredMeetings
      .filter((m) => m.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const recentMeetings = [
      ...upcomingForRecent,
      ...ongoingForRecent,
      ...completedForRecent
    ].slice(0, 4);

    // 12. Dữ liệu Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần Khối Phòng Ban (Discipline & Compliance Watch) theo tháng
    const disciplineWatch = this.getMeetingDisciplineWatch(
      tenantId,
      _options?.startDate ? _options.startDate.substring(0, 7) : '2026-11'
    );

    return {
      period: typeof periodOrCount === 'string' ? periodOrCount : undefined,
      meetingCount: selectedMeetings.length,
      kpis,
      trends,
      yearlyOverall,
      roomStats,
      departmentMetrics,
      completedMeetingsInCurrentMonth,
      methodDistribution,
      roleDistribution,
      recentMeetings,
      recentActivities,
      currentOrUpcomingMeeting,
      disciplineWatch
    };
  }

  /**
   * Lấy dữ liệu Giám sát kỷ luật & Cảnh báo chuyên cần theo tháng trong năm (mặc định: tháng hiện tại 11/2026)
   */
  public getMeetingDisciplineWatch(
    _tenantId: string,
    monthKey: string = '2026-11'
  ): MeetingDisciplineWatch {
    const availableMonths: MonthDisciplineOption[] = [
      { value: '2026-11', label: 'Tháng 11/2026', year: 2026, month: 11, isCurrent: true, disabled: false },
      { value: '2026-10', label: 'Tháng 10/2026', year: 2026, month: 10, isCurrent: false, disabled: false },
      { value: '2026-09', label: 'Tháng 09/2026', year: 2026, month: 9, isCurrent: false, disabled: false },
      { value: '2026-08', label: 'Tháng 08/2026', year: 2026, month: 8, isCurrent: false, disabled: false },
      { value: '2026-07', label: 'Tháng 07/2026', year: 2026, month: 7, isCurrent: false, disabled: false },
      { value: '2026-06', label: 'Tháng 06/2026', year: 2026, month: 6, isCurrent: false, disabled: false },
      { value: '2026-05', label: 'Tháng 05/2026', year: 2026, month: 5, isCurrent: false, disabled: false },
      { value: '2026-04', label: 'Tháng 04/2026', year: 2026, month: 4, isCurrent: false, disabled: false },
      { value: '2026-03', label: 'Tháng 03/2026', year: 2026, month: 3, isCurrent: false, disabled: false },
      { value: '2026-02', label: 'Tháng 02/2026', year: 2026, month: 2, isCurrent: false, disabled: false },
      { value: '2026-01', label: 'Tháng 01/2026', year: 2026, month: 1, isCurrent: false, disabled: false },
      { value: '2026-12', label: 'Tháng 12/2026', year: 2026, month: 12, isCurrent: false, disabled: true }
    ];

    const currentKey = '2026-11';
    const targetKey = monthKey || currentKey;
    const isCurrent = targetKey === currentKey;
    const [yStr, mStr] = targetKey.split('-');
    const mNum = parseInt(mStr, 10) || 11;
    const yNum = parseInt(yStr, 10) || 2026;
    const monthLabel = `Tháng ${String(mNum).padStart(2, '0')}/${yNum}`;

    if (targetKey === '2026-11') {
      return {
        complianceRate: 94,
        lateCount: 3,
        excusedAbsentCount: 2,
        unexcusedAbsentCount: 1,
        departmentsNeedingAttention: [
          {
            departmentId: 'dept-ubnd-02',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            lateCount: 3,
            absentCount: 0,
            status: 'warning',
            note: '3 lượt trễ >15p'
          },
          {
            departmentId: 'dept-ubnd-04',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            lateCount: 1,
            absentCount: 1,
            status: 'danger',
            note: '1 lượt vắng'
          }
        ],
        recentViolations: [
          {
            id: 'viol-nov-1',
            employeeName: 'Bà Phạm Thị Cúc',
            employeeCode: 'UBND-002',
            position: 'Trưởng bộ phận Địa chính - Xây dựng',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ',
            meetingTime: '08:02 (06/11/2026)',
            type: 'late',
            lateMinutes: 12,
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          },
          {
            id: 'viol-nov-2',
            employeeName: 'Ông Hoàng Văn Đức',
            employeeCode: 'UBND-003',
            position: 'Cán bộ Tư pháp - Hộ tịch',
            departmentName: 'Bộ phận Tư pháp - Hộ tịch',
            meetingTitle: 'Họp Khẩn Phương Án Đảm Bảo An Ninh Trật Tự & PCCC Kỳ Nghỉ',
            meetingTime: '08:00 (06/11/2026)',
            type: 'excused_absent',
            reason: 'Đi công tác cơ sở (Có giấy triệu tập)'
          },
          {
            id: 'viol-nov-3',
            employeeName: 'Đ/c Lê Văn Hùng',
            employeeCode: 'UBND-014',
            position: 'Phó Chỉ huy trưởng Quân sự',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            meetingTitle: 'Họp Đánh Giá Tiến Độ Cải Cách Thủ Tục Hành Chính & Đề Án 06',
            meetingTime: '08:30 (04/11/2026)',
            type: 'unexcused_absent',
            reason: 'Vắng không báo cáo / Chưa giải trình'
          },
          {
            id: 'viol-nov-4',
            employeeName: 'Ông Đỗ Quang Huy',
            employeeCode: 'UBND-008',
            position: 'Cán bộ Địa chính',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Giao Ban Chuyển Đổi Số & Cải Cách TTHC Đầu Tháng 11',
            meetingTime: '08:15 (02/11/2026)',
            type: 'late',
            lateMinutes: 15,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          }
        ],
        selectedMonth: targetKey,
        monthLabel,
        isCurrentMonth: true,
        note: 'Dữ liệu kỳ họp thu thập trong Tháng 11/2026 (tháng hiện tại).',
        availableMonths
      };
    }

    if (targetKey === '2026-10') {
      return {
        complianceRate: 90,
        lateCount: 2,
        excusedAbsentCount: 1,
        unexcusedAbsentCount: 1,
        departmentsNeedingAttention: [
          {
            departmentId: 'dept-ubnd-04',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            lateCount: 0,
            absentCount: 1,
            status: 'danger',
            note: '1 lượt vắng'
          },
          {
            departmentId: 'dept-ubnd-02',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            lateCount: 2,
            absentCount: 0,
            status: 'warning',
            note: '2 lượt trễ >15p'
          }
        ],
        recentViolations: [
          {
            id: 'viol-oct-1',
            employeeName: 'Đ/c Lê Văn Hùng',
            employeeCode: 'UBND-014',
            position: 'Phó Chỉ huy trưởng Quân sự',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            meetingTitle: 'Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026',
            meetingTime: '08:00 (28/10/2026)',
            type: 'unexcused_absent',
            reason: 'Vắng không báo cáo / Chưa giải trình'
          },
          {
            id: 'viol-oct-2',
            employeeName: 'Ông Đỗ Quang Huy',
            employeeCode: 'UBND-008',
            position: 'Cán bộ Địa chính',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số',
            meetingTime: '08:15 (15/10/2026)',
            type: 'late',
            lateMinutes: 15,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          },
          {
            id: 'viol-oct-3',
            employeeName: 'Bà Phạm Thị Cúc',
            employeeCode: 'UBND-002',
            position: 'Trưởng bộ phận Địa chính - Xây dựng',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số',
            meetingTime: '08:18 (15/10/2026)',
            type: 'late',
            lateMinutes: 18,
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          },
          {
            id: 'viol-oct-4',
            employeeName: 'Ông Hoàng Văn Đức',
            employeeCode: 'UBND-003',
            position: 'Cán bộ Tư pháp - Hộ tịch',
            departmentName: 'Bộ phận Tư pháp - Hộ tịch',
            meetingTitle: 'Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số',
            meetingTime: '08:00 (15/10/2026)',
            type: 'excused_absent',
            reason: 'Tập huấn nghiệp vụ hộ tịch Sở Tư pháp'
          }
        ],
        selectedMonth: targetKey,
        monthLabel,
        isCurrentMonth: false,
        note: 'Dữ liệu kỳ họp thu thập trong Tháng 10/2026.',
        availableMonths
      };
    }

    if (targetKey === '2026-09') {
      return {
        complianceRate: 92,
        lateCount: 2,
        excusedAbsentCount: 1,
        unexcusedAbsentCount: 1,
        departmentsNeedingAttention: [
          {
            departmentId: 'dept-ubnd-02',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            lateCount: 2,
            absentCount: 0,
            status: 'warning',
            note: '2 lượt trễ >15p'
          },
          {
            departmentId: 'dept-ubnd-03',
            departmentName: 'Bộ phận Tư pháp - Hộ tịch',
            lateCount: 0,
            absentCount: 1,
            status: 'danger',
            note: '1 lượt vắng'
          }
        ],
        recentViolations: [
          {
            id: 'viol-sep-1',
            employeeName: 'Ông Đỗ Quang Huy',
            employeeCode: 'UBND-008',
            position: 'Cán bộ Địa chính',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Đánh Giá Công Tác Cải Cách Hành Chính Tháng 9',
            meetingTime: '08:14 (18/09/2026)',
            type: 'late',
            lateMinutes: 14,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          },
          {
            id: 'viol-sep-2',
            employeeName: 'Bà Phạm Thị Cúc',
            employeeCode: 'UBND-002',
            position: 'Trưởng bộ phận Địa chính - Xây dựng',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Họp Giao Ban Đầu Năm Học Mới & Đảm Bảo Trật Tự Cổng Trường',
            meetingTime: '08:12 (05/09/2026)',
            type: 'late',
            lateMinutes: 12,
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          },
          {
            id: 'viol-sep-3',
            employeeName: 'Ông Hoàng Văn Đức',
            employeeCode: 'UBND-003',
            position: 'Cán bộ Tư pháp - Hộ tịch',
            departmentName: 'Bộ phận Tư pháp - Hộ tịch',
            meetingTitle: 'Họp Giao Ban Đầu Năm Học Mới & Đảm Bảo Trật Tự Cổng Trường',
            meetingTime: '08:00 (05/09/2026)',
            type: 'excused_absent',
            reason: 'Học chính trị hè theo triệu tập'
          },
          {
            id: 'viol-sep-4',
            employeeName: 'Đ/c Lê Văn Hùng',
            employeeCode: 'UBND-014',
            position: 'Phó Chỉ huy trưởng Quân sự',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            meetingTitle: 'Họp Giao Ban Đầu Năm Học Mới & Đảm Bảo Trật Tự Cổng Trường',
            meetingTime: '08:00 (05/09/2026)',
            type: 'unexcused_absent',
            reason: 'Vắng không lý do'
          }
        ],
        selectedMonth: targetKey,
        monthLabel,
        isCurrentMonth: false,
        note: 'Dữ liệu kỳ họp thu thập trong Tháng 09/2026.',
        availableMonths
      };
    }

    if (targetKey === '2026-08') {
      return {
        complianceRate: 93,
        lateCount: 1,
        excusedAbsentCount: 1,
        unexcusedAbsentCount: 1,
        departmentsNeedingAttention: [
          {
            departmentId: 'dept-ubnd-04',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            lateCount: 0,
            absentCount: 1,
            status: 'danger',
            note: '1 lượt vắng'
          }
        ],
        recentViolations: [
          {
            id: 'viol-aug-1',
            employeeName: 'Đ/c Lê Văn Hùng',
            employeeCode: 'UBND-014',
            position: 'Phó Chỉ huy trưởng Quân sự',
            departmentName: 'Ban Chỉ huy Quân sự Phường',
            meetingTitle: 'Họp Ban Chỉ Đạo Phòng Chống Dịch Bệnh & Vệ Sinh Môi Trường Đô Thị',
            meetingTime: '14:00 (22/08/2026)',
            type: 'unexcused_absent',
            reason: 'Vắng không báo cáo'
          },
          {
            id: 'viol-aug-2',
            employeeName: 'Bà Phạm Thị Cúc',
            employeeCode: 'UBND-002',
            position: 'Trưởng bộ phận Địa chính - Xây dựng',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Chuyên Đề Quản Lý Trật Tự Xây Dựng & Đô Thị Quý 2',
            meetingTime: '08:46 (12/08/2026)',
            type: 'late',
            lateMinutes: 16,
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
          }
        ],
        selectedMonth: targetKey,
        monthLabel,
        isCurrentMonth: false,
        note: 'Dữ liệu kỳ họp thu thập trong Tháng 08/2026.',
        availableMonths
      };
    }

    if (targetKey === '2026-07') {
      return {
        complianceRate: 94,
        lateCount: 1,
        excusedAbsentCount: 1,
        unexcusedAbsentCount: 0,
        departmentsNeedingAttention: [
          {
            departmentId: 'dept-ubnd-02',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            lateCount: 1,
            absentCount: 0,
            status: 'warning',
            note: '1 lượt trễ >15p'
          }
        ],
        recentViolations: [
          {
            id: 'viol-jul-1',
            employeeName: 'Ông Đỗ Quang Huy',
            employeeCode: 'UBND-008',
            position: 'Cán bộ Địa chính',
            departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
            meetingTitle: 'Hội Nghị Sơ Kết 6 Tháng Đầu Năm 2026 & Nhiệm Vụ 6 Tháng Cuối Năm',
            meetingTime: '08:12 (10/07/2026)',
            type: 'late',
            lateMinutes: 12,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          },
          {
            id: 'viol-jul-2',
            employeeName: 'Ông Hoàng Văn Đức',
            employeeCode: 'UBND-003',
            position: 'Cán bộ Tư pháp - Hộ tịch',
            departmentName: 'Bộ phận Tư pháp - Hộ tịch',
            meetingTitle: 'Họp Giao Ban Công Tác Đền Ơn Đáp Nghĩa & Kỷ Niệm 27/7',
            meetingTime: '08:00 (25/07/2026)',
            type: 'excused_absent',
            reason: 'Phối hợp công tác đền ơn đáp nghĩa cơ sở'
          }
        ],
        selectedMonth: targetKey,
        monthLabel,
        isCurrentMonth: false,
        note: 'Dữ liệu kỳ họp thu thập trong Tháng 07/2026.',
        availableMonths
      };
    }

    const isPerfect = targetKey === '2026-02' || targetKey === '2026-01';
    return {
      complianceRate: isPerfect ? 100 : 96,
      lateCount: isPerfect ? 0 : 1,
      excusedAbsentCount: isPerfect ? 0 : 1,
      unexcusedAbsentCount: 0,
      departmentsNeedingAttention: isPerfect
        ? []
        : [
            {
              departmentId: 'dept-ubnd-02',
              departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
              lateCount: 1,
              absentCount: 0,
              status: 'warning',
              note: '1 lượt trễ'
            }
          ],
      recentViolations: isPerfect
        ? []
        : [
            {
              id: `viol-${targetKey}-1`,
              employeeName: 'Bà Phạm Thị Cúc',
              employeeCode: 'UBND-002',
              position: 'Trưởng bộ phận Địa chính - Xây dựng',
              departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
              meetingTitle: `Hội Nghị Chuyên Đề ${monthLabel}`,
              meetingTime: `08:10 (15/${mStr}/${yStr})`,
              type: 'late',
              lateMinutes: 10,
              avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
            }
          ],
      selectedMonth: targetKey,
      monthLabel,
      isCurrentMonth: isCurrent,
      note: `Dữ liệu kỳ họp thu thập trong ${monthLabel}.`,
      availableMonths
    };
  }

  /**
   * Xuất báo cáo tổng quan chuyên cần cuộc họp ra file CSV/Excel UTF-8
   */
  public async exportMeetingDashboardCsv(
    tenantId: string,
    periodOrCount: DashboardPeriod | number = 10,
    selectedDepartmentId?: string,
    options?: DashboardFilterOptions
  ): Promise<string> {
    const data = await this.getMeetingDashboardData(tenantId, periodOrCount, selectedDepartmentId, options);
    const periodLabel = `${data.meetingCount} cuộc họp gần nhất`;

    const lines: string[] = [
      'BÁO CÁO PHÂN TÍCH CHUYÊN CẦN CUỘC HỌP TOÀN CƠ QUAN',
      `Kỳ thống kê: ${periodLabel}`,
      `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`,
      '',
      '1. CHỈ SỐ TỔNG HỢP CUỘC HỌP (KPIs - Tính trên đại biểu bắt buộc)',
      'Chỉ số,Giá trị',
      `Số cuộc họp trong kỳ phân tích,${data.kpis.totalMeetings}`,
      `Đại biểu bắt buộc triệu tập,${data.kpis.totalCompulsory}`,
      `Đại biểu tùy chọn mời thêm,${data.kpis.totalOptional}`,
      `Tổng số khách mời triệu tập,${data.kpis.totalAttendeesSummoned}`,
      `Đại biểu bắt buộc có mặt,${data.kpis.compulsoryPresent}`,
      `Tỷ lệ tham dự (đại biểu bắt buộc),${data.kpis.attendanceRate}%`,
      `Tỷ lệ đúng giờ (đại biểu bắt buộc),${data.kpis.onTimeRate}%`,
      `Số lượt đi muộn (đại biểu bắt buộc),${data.kpis.lateCount}`,
      `Số lượt về sớm (đại biểu bắt buộc),${data.kpis.earlyLeaveCount}`,
      `Số lượt vắng mặt (đại biểu bắt buộc),${data.kpis.absentCount}`,
      '',
      '2. TỔNG QUAN CHUYÊN CẦN CẢ NĂM (2026)',
      'Chỉ số,Giá trị',
      `Tổng số sự kiện cuộc họp trong năm,${data.yearlyOverall.totalMeetings}`,
      `Tổng lượt đại biểu trong năm,${data.yearlyOverall.totalAttendeesSummoned}`,
      `Tỷ lệ tham dự cả năm,${data.yearlyOverall.attendanceRate}%`,
      `Tỷ lệ đúng giờ cả năm,${data.yearlyOverall.onTimeRate}% (${data.yearlyOverall.onTimeCount} lượt)`,
      `Tỷ lệ đi muộn cả năm,${data.yearlyOverall.lateRate}% (${data.yearlyOverall.lateCount} lượt)`,
      `Tỷ lệ về sớm cả năm,${data.yearlyOverall.earlyLeaveRate}% (${data.yearlyOverall.earlyLeaveCount} lượt)`,
      `Tỷ lệ vắng mặt cả năm,${data.yearlyOverall.absentRate}% (${data.yearlyOverall.absentCount} lượt)`,
      '',
      '3. XU HƯỚNG CHUYÊN CẦN TỪNG CUỘC HỌP',
      'Mã cuộc họp,Tiêu đề cuộc họp,Ngày tổ chức,Số đại biểu bắt buộc,Đúng giờ,Đi muộn,Về sớm,Vắng mặt,Tỷ lệ tham dự (%),Tỷ lệ đúng giờ (%)',
      ...data.trends.map((t) =>
        [
          `"${t.meetingId}"`,
          `"${t.meetingTitle}"`,
          `"${t.date}"`,
          t.compulsoryCount,
          t.onTimeCount,
          t.lateCount,
          t.earlyLeaveCount,
          t.absentCount,
          `${t.attendanceRate}%`,
          `${t.onTimeRate}%`
        ].join(',')
      ),
      '',
      '4. SO SÁNH CHUYÊN CẦN CUỘC HỌP THEO PHÒNG BAN',
      'Mã phòng ban,Tên phòng ban,Tổng triệu tập,Tham dự,Đúng giờ,Vào muộn,Về sớm,Vắng mặt,Tỷ lệ tham dự (%),Tỷ lệ đúng giờ (%)',
      ...data.departmentMetrics.map((dept) =>
        [
          `"${dept.code}"`,
          `"${dept.name}"`,
          dept.totalSummoned,
          dept.presentCount,
          dept.onTimeCount,
          dept.lateCount,
          dept.earlyLeaveCount,
          dept.absentCount,
          `${dept.attendanceRate}%`,
          `${dept.onTimeRate}%`
        ].join(',')
      ),
      '',
      '5. CƠ CẤU PHƯƠNG THỨC ĐIỂM DANH & VAI TRÒ ĐẠI BIỂU',
      'Phương thức / Vai trò,Số lượt,Tỷ lệ (%)',
      `Camera AI Face ID phòng họp,${data.methodDistribution.faceId.count},${data.methodDistribution.faceId.percentage}%`,
      `Thẻ đại biểu RFID / NFC,${data.methodDistribution.card.count},${data.methodDistribution.card.percentage}%`,
      `Điểm danh thủ công / ký tên,${data.methodDistribution.manual.count},${data.methodDistribution.manual.percentage}%`,
      `Đại biểu triệu tập bắt buộc,${data.roleDistribution.required.count},${data.roleDistribution.required.percentage}%`,
      `Đại biểu mời mở rộng / tùy chọn,${data.roleDistribution.optional.count},${data.roleDistribution.optional.percentage}%`,
      '',
      '6. HIỆU SUẤT & TẦN SUẤT SỬ DỤNG PHÒNG HỌP',
      'Mã phòng,Tên phòng họp,Vị trí,Sức chứa (chỗ),Số cuộc họp,Tỷ lệ (%),Thời lượng sử dụng (giờ)',
      ...data.roomStats.rooms.map((r) =>
        [
          `"${r.roomId}"`,
          `"${r.name}"`,
          `"${r.location}"`,
          r.capacity,
          r.meetingCount,
          `${r.percentage}%`,
          r.hoursUsed
        ].join(',')
      )
    ];

    return '\uFEFF' + lines.join('\n');
  }

  /**
   * Xuất báo cáo tổng quan chuyên cần cuộc họp ra file Excel (.xlsx) chuẩn OpenXML
   */
  public async exportMeetingDashboardExcel(
    tenantId: string,
    periodOrCount: DashboardPeriod | number = 10,
    selectedDepartmentId?: string,
    options?: DashboardFilterOptions,
    orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé'
  ): Promise<void> {
    const data = await this.getMeetingDashboardData(tenantId, periodOrCount, selectedDepartmentId, options);
    const periodLabel = `${data.meetingCount} cuộc họp gần nhất`;

    const sheet: ExcelSheetDefinition = {
      name: 'Chuyên cần cuộc họp',
      columns: [
        { width: 8 },
        { width: 34 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 18 },
        { width: 16 }
      ],
      rows: [
        { cells: [{ value: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'subtitle', colSpan: 11 }] },
        { cells: [{ value: 'Độc lập - Tự do - Hạnh phúc', style: 'subtitle', colSpan: 11 }] },
        { cells: [] },
        { height: 28, cells: [{ value: 'BÁO CÁO PHÂN TÍCH CHUYÊN CẦN CUỘC HỌP TOÀN CƠ QUAN', style: 'title', colSpan: 11 }] },
        { cells: [{ value: `Đơn vị: ${orgName}  |  Kỳ thống kê: ${periodLabel}`, style: 'subtitle', colSpan: 11 }] },
        { cells: [{ value: `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`, style: 'subtitle', colSpan: 11 }] },
        { cells: [] },
        { height: 24, cells: [{ value: '1. CHỈ SỐ TỔNG HỢP CUỘC HỌP (KPIs - Tính trên đại biểu bắt buộc)', style: 'section', colSpan: 11 }] },
        { height: 24, cells: [{ value: 'Chỉ số', style: 'header', colSpan: 2 }, { value: 'Giá trị ghi nhận', style: 'header', colSpan: 2 }, { value: 'Đơn vị tính / Ghi chú', style: 'header', colSpan: 7 }] },
        { cells: [{ value: 'Số cuộc họp trong kỳ phân tích', style: 'boldBorderLeft', colSpan: 2 }, { value: data.kpis.totalMeetings, style: 'boldBorderCenter', colSpan: 2 }, { value: 'Kỳ họp đã diễn ra & hoàn tất', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Đại biểu bắt buộc triệu tập', style: 'boldBorderLeft', colSpan: 2 }, { value: data.kpis.totalCompulsory, style: 'boldBorderCenter', colSpan: 2 }, { value: 'Lượt đại biểu theo danh sách bắt buộc', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Đại biểu tùy chọn mời thêm', style: 'borderLeft', colSpan: 2 }, { value: data.kpis.totalOptional, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt khách mời mở rộng', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Tổng số khách mời triệu tập', style: 'borderLeft', colSpan: 2 }, { value: data.kpis.totalAttendeesSummoned, style: 'borderCenter', colSpan: 2 }, { value: 'Bắt buộc + Tùy chọn', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Đại biểu bắt buộc có mặt', style: 'boldBorderLeft', colSpan: 2 }, { value: data.kpis.compulsoryPresent, style: 'boldBorderCenter', colSpan: 2 }, { value: 'Hiện diện tham gia', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Tỷ lệ tham dự (bắt buộc)', style: 'boldBorderLeft', colSpan: 2 }, { value: `${data.kpis.attendanceRate}%`, style: 'badgeSuccess', colSpan: 2 }, { value: 'Mục tiêu: >= 90%', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Tỷ lệ đúng giờ (bắt buộc)', style: 'boldBorderLeft', colSpan: 2 }, { value: `${data.kpis.onTimeRate}%`, style: data.kpis.onTimeRate >= 90 ? 'badgeSuccess' : 'badgeWarning', colSpan: 2 }, { value: 'Mục tiêu: >= 90%', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Số lượt đi muộn', style: 'borderLeft', colSpan: 2 }, { value: data.kpis.lateCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt đại biểu vào trễ', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Số lượt về sớm', style: 'borderLeft', colSpan: 2 }, { value: data.kpis.earlyLeaveCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt đại biểu ra trước khi bế mạc', style: 'borderLeft', colSpan: 7 }] },
        { cells: [{ value: 'Số lượt vắng mặt', style: 'borderLeft', colSpan: 2 }, { value: data.kpis.absentCount, style: 'borderCenter', colSpan: 2 }, { value: 'Lượt đại biểu vắng không tham dự', style: 'borderLeft', colSpan: 7 }] },
        { cells: [] },
        { height: 24, cells: [{ value: '2. XU HƯỚNG CHUYÊN CẦN TỪNG CUỘC HỌP', style: 'section', colSpan: 11 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Tiêu đề cuộc họp', style: 'header' },
            { value: 'Ngày tổ chức', style: 'header' },
            { value: 'Bắt buộc', style: 'header' },
            { value: 'Đúng giờ', style: 'header' },
            { value: 'Đi muộn', style: 'header' },
            { value: 'Về sớm', style: 'header' },
            { value: 'Vắng mặt', style: 'header' },
            { value: 'Tỷ lệ tham dự', style: 'header' },
            { value: 'Tỷ lệ đúng giờ', style: 'header' },
            { value: 'Đánh giá', style: 'header' }
          ]
        },
        ...data.trends.map((item, idx) => {
          const evalBadge = item.attendanceRate >= 90 ? ('badgeSuccess' as const) : item.attendanceRate >= 80 ? ('badgeWarning' as const) : ('badgeDanger' as const);
          const evalText = item.attendanceRate >= 90 ? 'Tốt' : item.attendanceRate >= 80 ? 'Cần lưu ý' : 'Kém';
          return {
            height: 21,
            cells: [
              { value: idx + 1, style: 'borderCenter' as const },
              { value: item.meetingTitle, style: 'boldBorderLeft' as const },
              { value: item.date, style: 'borderCenter' as const },
              { value: item.totalCompulsory, style: 'borderRight' as const },
              { value: item.onTimeCount, style: 'borderRight' as const },
              { value: item.lateCount, style: 'borderRight' as const },
              { value: item.earlyLeaveCount, style: 'borderRight' as const },
              { value: item.absentCount, style: 'borderRight' as const },
              { value: `${item.attendanceRate}%`, style: evalBadge },
              { value: `${item.onTimeRate}%`, style: evalBadge },
              { value: evalText, style: evalBadge }
            ]
          };
        }),
        { cells: [] },
        { height: 24, cells: [{ value: '3. CHUYÊN CẦN CUỘC HỌP THEO ĐƠN VỊ PHÒNG BAN', style: 'section', colSpan: 11 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Mã phòng', style: 'header' },
            { value: 'Tên phòng ban', style: 'header', colSpan: 2 },
            { value: 'Triệu tập', style: 'header' },
            { value: 'Hiện diện', style: 'header' },
            { value: 'Đúng giờ', style: 'header' },
            { value: 'Đi muộn', style: 'header' },
            { value: 'Vắng', style: 'header' },
            { value: 'Tỷ lệ tham gia', style: 'header' },
            { value: 'Tỷ lệ đúng giờ', style: 'header' }
          ]
        },
        ...data.departmentAttendance.map((dept, idx) => ({
          height: 21,
          cells: [
            { value: idx + 1, style: 'borderCenter' as const },
            { value: dept.code, style: 'borderCenter' as const },
            { value: dept.name, style: 'boldBorderLeft' as const, colSpan: 2 },
            { value: dept.totalSummoned, style: 'borderRight' as const },
            { value: dept.presentCount, style: 'borderRight' as const },
            { value: dept.onTimeCount, style: 'borderRight' as const },
            { value: dept.lateCount, style: 'borderRight' as const },
            { value: dept.absentCount, style: 'borderRight' as const },
            { value: `${dept.attendanceRate}%`, style: dept.attendanceRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) },
            { value: `${dept.onTimeRate}%`, style: dept.onTimeRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) }
          ]
        })),
        { cells: [] },
        { height: 24, cells: [{ value: '4. PHÒNG HỌP & TẦN SUẤT SỬ DỤNG', style: 'section', colSpan: 11 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Tên phòng họp', style: 'header', colSpan: 2 },
            { value: 'Vị trí', style: 'header', colSpan: 2 },
            { value: 'Sức chứa', style: 'header', colSpan: 2 },
            { value: 'Số kỳ họp', style: 'header', colSpan: 2 },
            { value: 'Tỷ lệ sử dụng', style: 'header', colSpan: 2 }
          ]
        },
        ...data.roomStats.rooms.map((r, idx) => ({
          height: 21,
          cells: [
            { value: idx + 1, style: 'borderCenter' as const },
            { value: r.name, style: 'boldBorderLeft' as const, colSpan: 2 },
            { value: r.location, style: 'borderLeft' as const, colSpan: 2 },
            { value: `${r.capacity} chỗ`, style: 'borderCenter' as const, colSpan: 2 },
            { value: `${r.meetingCount} cuộc họp`, style: 'borderRight' as const, colSpan: 2 },
            { value: `${r.percentage}%`, style: 'boldBorderCenter' as const, colSpan: 2 }
          ]
        }))
      ]
    };

    downloadExcelFile(sheet, `Bao_Cao_Chuyen_Can_Cuoc_Hop_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}

export const dashboardService = new DashboardService();
