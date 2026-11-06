import { describe, it, expect, beforeEach } from 'vitest';
import { dailyAttendanceService } from '../services/attendance';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { attendanceSettingService } from '../services/setting';

describe('Nghiệp vụ Chấm Công Ngày (ATT-02 & ATT-03: Daily Attendance Service)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    employeeService.resetMockData();
    departmentService.resetMockData();
    attendanceSettingService.resetMockData();
    dailyAttendanceService.resetMockData();

    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Lấy danh sách chấm công ngày kết hợp toàn bộ cán bộ nhân sự trong đơn vị', async () => {
    const records = await dailyAttendanceService.getDailyAttendance(ubndTenant, {
      date: '2026-11-04'
    });

    expect(records.length).toBeGreaterThanOrEqual(3);

    // Nguyễn Văn An check-in 07:15 -> Đúng giờ
    const an = records.find((r) => r.employeeCode === 'UBND-001');
    expect(an).toBeDefined();
    expect(an?.checkInTime).toBe('07:15');
    expect(an?.status).toBe('on_time');
    expect(an?.lateMinutes).toBe(0);

    // Phạm Thị Cúc check-in 07:45 -> Muộn 45 phút (ca sáng 07:00, ân hạn 30p)
    const cuc = records.find((r) => r.employeeCode === 'UBND-002');
    expect(cuc).toBeDefined();
    expect(cuc?.checkInTime).toBe('07:45');
    expect(cuc?.status).toBe('late');
    expect(cuc?.lateMinutes).toBe(45);
  });

  it('Tính toán các chỉ số tóm tắt chuyên cần trong ngày chính xác', async () => {
    const summary = await dailyAttendanceService.getDailySummary(ubndTenant, '2026-11-04');

    expect(summary.totalEmployees).toBeGreaterThanOrEqual(3);
    expect(summary.presentCount).toBeGreaterThanOrEqual(3);
    expect(summary.onTimeCount).toBeGreaterThanOrEqual(2);
    expect(summary.lateCount).toBeGreaterThanOrEqual(1);
    expect(summary.attendanceRate).toBeGreaterThanOrEqual(90);
  });

  it('Lọc danh sách chấm công theo phòng ban và theo trạng thái chuyên cần', async () => {
    // Lọc trạng thái Đi muộn
    const lateList = await dailyAttendanceService.getDailyAttendance(ubndTenant, {
      date: '2026-11-04',
      status: 'late'
    });
    expect(lateList.length).toBeGreaterThanOrEqual(1);
    expect(lateList.some((e) => e.employeeCode === 'UBND-002')).toBe(true);

    // Lọc theo phòng ban Địa chính (dept-ubnd-02)
    const deptList = await dailyAttendanceService.getDailyAttendance(ubndTenant, {
      date: '2026-11-04',
      departmentId: 'dept-ubnd-02'
    });
    expect(deptList.length).toBeGreaterThanOrEqual(1);
    expect(deptList.some((e) => e.employeeCode === 'UBND-002')).toBe(true);
  });

  it('Tiếp nhận sự kiện quét điểm danh mới từ thiết bị và tự động cập nhật bản ghi', async () => {
    // Quét điểm danh cho một nhân viên mới vào ngày 2026-11-10
    const newRecord = await dailyAttendanceService.recordAttendance({
      tenantId: ubndTenant,
      employeeId: 'emp-ubnd-01',
      date: '2026-11-10',
      time: '07:10',
      type: 'check_in',
      method: 'faceId',
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND'
    });

    expect(newRecord.checkInTime).toBe('07:10');
    expect(newRecord.status).toBe('on_time');
    expect(newRecord.scanLogs.length).toBe(1);
    expect(newRecord.scanLogs[0].method).toBe('faceId');

    // Sau đó quét tan ca Check-out lúc 16:10
    const updatedRecord = await dailyAttendanceService.recordAttendance({
      tenantId: ubndTenant,
      employeeId: 'emp-ubnd-01',
      date: '2026-11-10',
      time: '16:10',
      type: 'check_out',
      method: 'faceId'
    });

    expect(updatedRecord.checkOutTime).toBe('16:10');
    expect(updatedRecord.scanLogs.length).toBe(2);
    expect(updatedRecord.status).toBe('on_time');
  });

  it('Xuất bảng chấm công ngày ra file CSV tiếng Việt chuẩn có BOM UTF-8', async () => {
    const csv = await dailyAttendanceService.exportDailyAttendanceCsv(ubndTenant, '2026-11-04');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Mã Nhân Viên');
    expect(csv).toContain('Họ và Tên');
    expect(csv).toContain('UBND-001');
    expect(csv).toContain('Nguyễn Văn An');
    expect(csv).toContain('Đúng giờ');
    expect(csv).toContain('Đi muộn');
  });
});
