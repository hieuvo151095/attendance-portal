import { describe, it, expect, beforeEach } from 'vitest';
import { dashboardService } from '../services/dashboard';
import { authService } from '../services/auth';

describe('DashboardService (DASH-02)', () => {
  const tenantId = 'tenant-ubnd-001';

  beforeEach(async () => {
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('tổng hợp đầy đủ các chỉ số KPI hiện diện và chuyên cần toàn cơ quan', async () => {
    const data = await dashboardService.getDashboardData(tenantId, 'today');

    expect(data).toBeDefined();
    expect(data.period).toBe('today');
    expect(data.kpis).toBeDefined();
    expect(data.kpis.totalStaff).toBeGreaterThan(0);
    expect(data.kpis.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(data.kpis.attendanceRate).toBeLessThanOrEqual(100);
    expect(data.kpis.onTimeRate).toBeGreaterThanOrEqual(0);
    expect(data.kpis.onTimeRate).toBeLessThanOrEqual(100);
    expect(data.kpis.earlyLeaveCount).toBeGreaterThanOrEqual(0);
    expect(data.kpis.lateCount).toBeGreaterThanOrEqual(0);
    expect(data.kpis.meetingAttendanceRate).toBeGreaterThanOrEqual(0);
    expect(data.kpis.meetingAttendanceRate).toBeLessThanOrEqual(100);
  });

  it('tính toán xu hướng điểm danh theo ngày, tuần, tháng (DASH-02)', async () => {
    const todayData = await dashboardService.getDashboardData(tenantId, 'today');
    expect(todayData.trends.length).toBeGreaterThan(0);
    todayData.trends.forEach((pt) => {
      expect(pt.earlyLeaveCount).toBeDefined();
      expect(pt.earlyLeaveCount).toBeGreaterThanOrEqual(0);
    });

    const weekData = await dashboardService.getDashboardData(tenantId, 'week');
    expect(weekData.trends.length).toBe(7);

    // Kiểm tra định dạng nhãn theo tuần chuẩn dd/mm thay vì T36, T37
    const weeksData = await dashboardService.getDashboardData(tenantId, 'weeks', undefined, { weekCount: 12 });
    expect(weeksData.trends.length).toBe(12);
    weeksData.trends.forEach((pt) => {
      expect(pt.label).toMatch(/^\d{2}\/\d{2}$/); // dd/mm format
    });

    const monthData = await dashboardService.getDashboardData(tenantId, 'month');
    expect(monthData.trends.length).toBe(4);
  });

  it('tính toán ma trận so sánh chuyên cần giữa các phòng ban', async () => {
    const data = await dashboardService.getDashboardData(tenantId, 'today');

    expect(data.departmentMetrics.length).toBeGreaterThan(0);
    data.departmentMetrics.forEach((dept) => {
      expect(dept.id).toBeDefined();
      expect(dept.name).toBeDefined();
      expect(dept.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(dept.attendanceRate).toBeLessThanOrEqual(100);
      expect(dept.onTimeRate).toBeGreaterThanOrEqual(0);
      expect(dept.onTimeRate).toBeLessThanOrEqual(100);
    });
  });

  it('hỗ trợ lọc dữ liệu theo từng phòng ban cụ thể', async () => {
    const allData = await dashboardService.getDashboardData(tenantId, 'today');
    const firstDept = allData.departmentMetrics[0];

    const filteredData = await dashboardService.getDashboardData(tenantId, 'today', firstDept.id);
    expect(filteredData.kpis.totalStaff).toBe(firstDept.totalStaff);
  });

  it('phân tích cơ cấu phương thức xác thực (Camera AI, Thẻ RFID, Vân tay)', async () => {
    const data = await dashboardService.getDashboardData(tenantId, 'today');

    expect(data.methodDistribution).toBeDefined();
    expect(data.methodDistribution.faceId).toBeDefined();
    expect(data.methodDistribution.card).toBeDefined();
    expect(data.methodDistribution.fingerprint).toBeDefined();
  });

  it('tổng hợp các cuộc họp đã kết thúc và không hiển thị cuộc họp đang diễn ra', async () => {
    const data = await dashboardService.getDashboardData(tenantId, 'today');

    expect(data.recentConcludedMeetings).toBeDefined();
    data.recentConcludedMeetings.forEach((m) => {
      expect(m.status).toBe('completed');
    });
  });

  it('xuất báo cáo tổng quan ra định dạng CSV có UTF-8 BOM chuẩn xác', async () => {
    const csv = await dashboardService.exportDashboardCsv(tenantId, 'today');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('BÁO CÁO PHÂN TÍCH HIỆN DIỆN VÀ CHUYÊN CẦN TOÀN CƠ QUAN');
    expect(csv).toContain('CHỈ SỐ TỔNG HỢP TOÀN CƠ QUAN');
    expect(csv).toContain('SO SÁNH CHUYÊN CẦN THEO PHÒNG BAN');
    expect(csv).toContain('CƠ CẤU PHƯƠNG THỨC ĐIỂM DANH');
  });

  it('tổng hợp dữ liệu bảng điều khiển cuộc họp (DASH-03: Meeting Executive Dashboard)', async () => {
    const meetingData = await dashboardService.getMeetingDashboardData(tenantId, 'days');

    expect(meetingData).toBeDefined();
    expect(meetingData.kpis).toBeDefined();
    expect(meetingData.kpis.totalMeetings).toBeGreaterThanOrEqual(0);
    expect(meetingData.kpis.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(meetingData.kpis.attendanceRate).toBeLessThanOrEqual(100);
    expect(meetingData.kpis.onTimeRate).toBeGreaterThanOrEqual(0);
    expect(meetingData.kpis.lateCount).toBeGreaterThanOrEqual(0);
    expect(meetingData.kpis.earlyLeaveCount).toBeGreaterThanOrEqual(0);
    expect(meetingData.kpis.absentCount).toBeGreaterThanOrEqual(0);

    // Xu hướng điểm danh cuộc họp
    expect(meetingData.trends.length).toBeGreaterThan(0);
    meetingData.trends.forEach((pt) => {
      expect(pt.totalSummoned).toBeGreaterThanOrEqual(0);
      expect(pt.presentCount).toBeGreaterThanOrEqual(0);
      expect(pt.onTimeCount).toBeGreaterThanOrEqual(0);
      expect(pt.lateCount).toBeGreaterThanOrEqual(0);
      expect(pt.earlyLeaveCount).toBeGreaterThanOrEqual(0);
      expect(pt.absentCount).toBeGreaterThanOrEqual(0);
    });

    // So sánh chuyên cần cuộc họp giữa các phòng ban
    expect(meetingData.departmentMetrics.length).toBeGreaterThan(0);
    meetingData.departmentMetrics.forEach((d) => {
      expect(d.name).toBeDefined();
      expect(d.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(d.onTimeRate).toBeGreaterThanOrEqual(0);
    });

    // Cơ cấu phương thức điểm danh cuộc họp
    expect(meetingData.methodDistribution.faceId).toBeDefined();
    expect(meetingData.methodDistribution.card).toBeDefined();
    expect(meetingData.methodDistribution.manual).toBeDefined();

    // Hoạt động điểm danh gần nhất
    expect(meetingData.recentActivities.length).toBeGreaterThan(0);
  });

  it('xuất báo cáo tổng quan cuộc họp ra định dạng CSV có UTF-8 BOM chuẩn xác', async () => {
    const csv = await dashboardService.exportMeetingDashboardCsv(tenantId, 'days');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('BÁO CÁO PHÂN TÍCH CHUYÊN CẦN CUỘC HỌP TOÀN CƠ QUAN');
    expect(csv).toContain('CHỈ SỐ TỔNG HỢP CUỘC HỌP');
    expect(csv).toContain('SO SÁNH CHUYÊN CẦN CUỘC HỌP THEO PHÒNG BAN');
    expect(csv).toContain('CƠ CẤU PHƯƠNG THỨC ĐIỂM DANH & VAI TRÒ ĐẠI BIỂU');
  });
});
