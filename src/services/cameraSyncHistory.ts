import { deviceService } from './device';
import { cardService } from './card';
import { employeeService } from './employee';

export interface EmployeeCameraSyncLog {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  deviceCode: string;
  deviceName: string;
  deviceLocation: string;
  method: 'faceId' | 'card';
  methodLabel: string;
  cardUid?: string;
  isCardFirstTapSynced?: boolean;
  status: 'synced' | 'pending_first_tap';
  statusLabel: string;
  syncedAt: string; // ISO string or formatted date
  performedBy: string;
  note?: string;
}

const STORAGE_KEY_FIRST_TAPS = 'finviet_camera_first_tapped_cards';

export class CameraSyncHistoryService {
  /**
   * Lấy tập hợp các thẻ đã thực hiện tap thẻ lần đầu vào Camera
   */
  private getTappedCardUids(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIRST_TAPS);
      if (raw) {
        return new Set(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
    // Mặc định các thẻ lâu năm đã tap lần đầu (trừ một số thẻ mẫu để trải nghiệm trạng thái chờ)
    const defaults = new Set([
      '04A1B2C3D4', // Nguyễn Văn An
      '04B2C3D4E5', // Phạm Thị Cúc
      '04C3D4E504', // Lê Thị Thảo
      '04D4E5F605', // Trần Minh Tuấn
      '04E5F6A706'  // Nguyễn Hoàng Mai
    ]);
    return defaults;
  }

  /**
   * Đánh dấu thẻ đã thực hiện quẹt lần đầu vào camera
   */
  public async markCardFirstTap(cardUid: string): Promise<void> {
    const set = this.getTappedCardUids();
    set.add(cardUid);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_FIRST_TAPS, JSON.stringify(Array.from(set)));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Lấy lịch sử đồng bộ lên Camera của một nhân sự cụ thể
   */
  public async getEmployeeSyncHistory(
    tenantId: string,
    employeeId: string
  ): Promise<EmployeeCameraSyncLog[]> {
    const [employees, allDevices, allCards] = await Promise.all([
      employeeService.getEmployeesByTenant(tenantId),
      deviceService.getDevicesByTenant(tenantId),
      cardService.getCardsByTenant(tenantId)
    ]);

    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return [];

    const activeDevices = allDevices.filter((d) => d.status === 'active');
    const employeeCards = allCards.filter(
      (c) => c.employeeId === employeeId && c.status !== 'revoked'
    );
    const tappedCardSet = this.getTappedCardUids();

    const logs: EmployeeCameraSyncLog[] = [];

    // 1. Kiểm tra đồng bộ Nhận diện khuôn mặt (Face ID)
    const isFaceEnrolled = employee.faceIdStatus === 'enrolled' && Boolean(employee.avatarUrl);
    if (isFaceEnrolled) {
      // Các camera điểm danh nhận diện khuôn mặt
      const faceDevices = activeDevices.filter(
        (d) => d.attendanceType === 'attendance' || d.attendanceType === 'both'
      );

      const syncTime = employee.cameraSyncInfo?.syncedAt || employee.createdAt || '2026-11-01T08:30:00Z';

      faceDevices.forEach((dev, idx) => {
        logs.push({
          id: `sync-face-${employee.id}-${dev.id}`,
          tenantId,
          employeeId: employee.id,
          employeeName: employee.fullName,
          employeeCode: employee.employeeCode,
          deviceCode: dev.code,
          deviceName: dev.name,
          deviceLocation: dev.location || 'Trụ sở cơ quan',
          method: 'faceId',
          methodLabel: 'Nhận diện khuôn mặt (Face ID)',
          status: 'synced',
          statusLabel: 'Đã đồng bộ',
          syncedAt: syncTime,
          performedBy: idx === 0 ? employee.fullName : 'Hệ thống tự động (Camera AI)',
          note: `Đã nạp mẫu vector khuôn mặt vào bộ nhớ máy (${dev.code})`
        });
      });
    }

    // 2. Kiểm tra đồng bộ Thẻ nhân sự (RFID / NFC)
    // Quy tắc nghiệp vụ bắt buộc:
    // Khi thêm thẻ vào hệ thống thì CHƯA tính là đồng bộ lên thiết bị.
    // Chỉ tính là đồng bộ khi cán bộ quẹt (tap) thẻ lần đầu tiên vào camera.
    employeeCards.forEach((card) => {
      const isTapped = tappedCardSet.has(card.cardUid);
      const targetDevice = activeDevices[0] || {
        id: 'cam-01',
        code: 'CAM-UBND-CC-01',
        name: 'Camera AI Cổng Tiếp Dân',
        location: 'Cổng chính tiếp dân UBND'
      };

      if (isTapped) {
        logs.push({
          id: `sync-card-${card.id}-${targetDevice.id}`,
          tenantId,
          employeeId: employee.id,
          employeeName: employee.fullName,
          employeeCode: employee.employeeCode,
          deviceCode: targetDevice.code,
          deviceName: targetDevice.name,
          deviceLocation: targetDevice.location || 'Cổng chính trụ sở',
          method: 'card',
          methodLabel: `Thẻ nhân sự (UID: ${card.cardUid})`,
          cardUid: card.cardUid,
          isCardFirstTapSynced: true,
          status: 'synced',
          statusLabel: 'Đã đồng bộ (Đã tap thẻ lần đầu)',
          syncedAt: card.linkedAt || '2026-11-01T08:15:00Z',
          performedBy: `${employee.fullName} (Quẹt thẻ lần đầu)`,
          note: 'Thiết bị đã đọc và ghi nhận mã UID vật lý vào danh sách thẻ hợp lệ'
        });
      } else {
        logs.push({
          id: `sync-card-${card.id}-pending`,
          tenantId,
          employeeId: employee.id,
          employeeName: employee.fullName,
          employeeCode: employee.employeeCode,
          deviceCode: targetDevice.code,
          deviceName: targetDevice.name,
          deviceLocation: targetDevice.location || 'Cổng chính trụ sở',
          method: 'card',
          methodLabel: `Thẻ nhân sự (UID: ${card.cardUid})`,
          cardUid: card.cardUid,
          isCardFirstTapSynced: false,
          status: 'pending_first_tap',
          statusLabel: 'Chưa đồng bộ (Chờ tap thẻ lần đầu)',
          syncedAt: '--- (Chờ kích hoạt)',
          performedBy: 'Hệ thống cấp thẻ Finviet',
          note: 'Thẻ đã gán vào hồ sơ, cần cán bộ quẹt 1 lần tại đầu đọc Camera để hoàn tất nạp bộ nhớ'
        });
      }
    });

    return logs;
  }
}

export const cameraSyncHistoryService = new CameraSyncHistoryService();
