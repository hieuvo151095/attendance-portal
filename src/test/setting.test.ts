import { describe, it, expect, beforeEach } from 'vitest';
import { attendanceSettingService } from '../services/setting';
import { authService } from '../services/auth';

describe('Dịch Vụ Cấu Hình Thời Gian Làm Việc & Dung Sai Điểm Danh', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    attendanceSettingService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Lấy cấu hình thời gian làm việc & điểm danh mặc định của cơ quan', async () => {
    const settings = await attendanceSettingService.getSettings(ubndTenant);
    expect(settings.tenantId).toBe(ubndTenant);
    expect(settings.workStartTime).toBe('07:00');
    expect(settings.workEndTime).toBe('16:00');
    expect(settings.workCheckInGraceMinutes).toBe(30);
    expect(settings.workCheckOutGraceMinutes).toBe(30);
    expect(settings.targetOnTimeRate).toBe(90);
    expect(settings.defaultMeetingCheckInGraceMinutes).toBe(5);
    expect(settings.defaultMeetingCheckOutGraceMinutes).toBe(5);
  });

  it('Cập nhật cấu hình thời gian làm việc thành công', async () => {
    const updated = await attendanceSettingService.updateSettings(ubndTenant, {
      workStartTime: '07:30',
      workEndTime: '16:30',
      workCheckInGraceMinutes: 15,
      targetOnTimeRate: 95,
      defaultMeetingCheckInGraceMinutes: 10
    });

    expect(updated.workStartTime).toBe('07:30');
    expect(updated.workEndTime).toBe('16:30');
    expect(updated.workCheckInGraceMinutes).toBe(15);
    expect(updated.targetOnTimeRate).toBe(95);
    expect(updated.defaultMeetingCheckInGraceMinutes).toBe(10);

    const reloaded = await attendanceSettingService.getSettings(ubndTenant);
    expect(reloaded.workStartTime).toBe('07:30');
    expect(reloaded.targetOnTimeRate).toBe(95);
    expect(reloaded.defaultMeetingCheckInGraceMinutes).toBe(10);
  });

  it('Tính toán chính xác mốc giờ check-in trễ nhất dựa trên giờ bắt đầu và số phút dung sai', () => {
    // 09:00 + 5 phút -> 09:05
    const t1 = attendanceSettingService.calculateMaxCheckInTime('2026-11-04T09:00:00', 5);
    expect(t1).toBe('09:05');

    // 10:00 + 10 phút -> 10:10
    const t2 = attendanceSettingService.calculateMaxCheckInTime('2026-11-04T10:00:00', 10);
    expect(t2).toBe('10:10');

    // Hỗ trợ cả định dạng "07:00"
    const t3 = attendanceSettingService.calculateMaxCheckInTime('07:00', 30);
    expect(t3).toBe('07:30');
  });

  it('Tính toán chính xác mốc giờ check-out sớm nhất dựa trên giờ kết thúc và số phút dung sai', () => {
    // 10:00 - 5 phút -> 09:55
    const t1 = attendanceSettingService.calculateEarliestCheckOutTime('2026-11-04T10:00:00', 5);
    expect(t1).toBe('09:55');

    // 16:00 - 30 phút -> 15:30
    const t2 = attendanceSettingService.calculateEarliestCheckOutTime('16:00', 30);
    expect(t2).toBe('15:30');
  });

  it('Đánh giá Check-in đầu ngày theo khung ca làm việc và dung sai đi muộn (ATT-01)', async () => {
    const settings = await attendanceSettingService.getSettings(ubndTenant);
    // Ca sáng chuẩn bắt đầu 07:00, dung sai 30p -> mốc trễ là 07:30
    const onTimeMorning = attendanceSettingService.evaluateDailyCheckIn('07:20', settings);
    expect(onTimeMorning.isLate).toBe(false);
    expect(onTimeMorning.lateMinutes).toBe(0);
    expect(onTimeMorning.shiftName).toBe('morning');
    expect(onTimeMorning.thresholdTime).toBe('07:30');

    // Quét lúc 07:45 -> đi muộn 45 phút so với giờ bắt đầu ca (07:00)
    const lateMorning = attendanceSettingService.evaluateDailyCheckIn('07:45', settings);
    expect(lateMorning.isLate).toBe(true);
    expect(lateMorning.lateMinutes).toBe(45);
    expect(lateMorning.shiftName).toBe('morning');

    // Ca chiều bắt đầu 13:30, dung sai 30p -> mốc trễ là 14:00
    const onTimeAfternoon = attendanceSettingService.evaluateDailyCheckIn('13:40', settings);
    expect(onTimeAfternoon.isLate).toBe(false);
    expect(onTimeAfternoon.lateMinutes).toBe(0);
    expect(onTimeAfternoon.shiftName).toBe('afternoon');

    // Quét lúc 14:10 -> đi muộn 40 phút so với giờ bắt đầu ca chiều (13:30)
    const lateAfternoon = attendanceSettingService.evaluateDailyCheckIn('14:10', settings);
    expect(lateAfternoon.isLate).toBe(true);
    expect(lateAfternoon.lateMinutes).toBe(40);
  });

  it('Đánh giá Check-out tan ca theo giờ kết thúc và dung sai về sớm (ATT-01)', async () => {
    const settings = await attendanceSettingService.getSettings(ubndTenant);
    // Giờ tan ca 16:00, dung sai về sớm 30p -> được về từ 15:30
    const onTimeOut = attendanceSettingService.evaluateDailyCheckOut('15:45', settings);
    expect(onTimeOut.isEarlyLeave).toBe(false);
    expect(onTimeOut.earlyLeaveMinutes).toBe(0);
    expect(onTimeOut.thresholdTime).toBe('15:30');

    // Về lúc 15:10 -> về sớm 50 phút so với 16:00
    const earlyOut = attendanceSettingService.evaluateDailyCheckOut('15:10', settings);
    expect(earlyOut.isEarlyLeave).toBe(true);
    expect(earlyOut.earlyLeaveMinutes).toBe(50);
  });
});
