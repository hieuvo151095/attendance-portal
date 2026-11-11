import {
  DailyAttendanceRecord,
  DailyAttendanceFilter,
  DailyAttendanceSummary,
  RecordAttendancePayload,
  AttendanceScanLog,
  AttendanceAuditLog,
  AdminCheckOutPayload,
  DailyAttendanceStatus,
  LeavePeriod,
  STANDARD_LEAVE_REASONS
} from '../types/attendance';
import { authService } from './auth';
import { employeeService } from './employee';
import { departmentService } from './department';
import { attendanceSettingService } from './setting';
import { downloadExcelFile, ExcelSheetDefinition } from '../utils/excelExport';

export function normalizeLeaveReason(note?: string): string {
  if (!note) return 'Nghỉ việc riêng / Khẩn cấp';
  let cleaned = note.trim();
  // Loại bỏ triệt để mọi hậu tố trùng lặp như (Buổi chiều) (Buổi chiều)
  while (/\s*\((?:Buổi sáng|Buổi chiều|Cả ngày)\)\s*$/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*\((?:Buổi sáng|Buổi chiều|Cả ngày)\)\s*$/i, '').trim();
  }
  if ((STANDARD_LEAVE_REASONS as readonly string[]).includes(cleaned)) return cleaned;
  if (cleaned.includes('công tác')) return 'Đi công tác đột xuất';
  if (cleaned.includes('ốm') || cleaned.includes('khám') || cleaned.includes('bệnh') || cleaned.includes('sức khỏe')) return 'Nghỉ ốm / Khám sức khỏe';
  if (cleaned.includes('phép năm')) return 'Nghỉ phép năm';
  if (cleaned.includes('thai sản') || cleaned.includes('chế độ')) return 'Nghỉ chế độ / Thai sản';
  if (cleaned.includes('việc riêng') || cleaned.includes('Khẩn cấp')) return 'Nghỉ việc riêng / Khẩn cấp';
  return cleaned;
}

export function formatScanLogTime(timestamp?: string): string {
  if (!timestamp) return '--:--:--';
  // Trích xuất trực tiếp giờ:phút:giây từ chuỗi ISO để không bị lệch múi giờ (+7h)
  const match = timestamp.match(/T(\d{2}:\d{2}(?::\d{2})?)/);
  if (match) {
    const timePart = match[1];
    return timePart.length === 5 ? `${timePart}:00` : timePart;
  }
  try {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return timestamp;
  }
}

export function sanitizeRecordConsistency(r: DailyAttendanceRecord): DailyAttendanceRecord {
  if (r.status === 'leave') {
    if (r.leavePeriod === 'afternoon') {
      // Nghỉ buổi chiều: giữ checkIn buổi sáng, không có checkOut và loại bỏ mọi scanLog check_out
      r.checkOutTime = undefined;
      r.checkOutMethod = undefined;
      r.checkOutDevice = undefined;
      r.earlyLeaveMinutes = 0;
      r.scanLogs = (r.scanLogs || []).filter((l) => l.type === 'check_in');
    } else if (r.leavePeriod === 'full_day') {
      // Nghỉ cả ngày: xóa cả checkIn và checkOut, scanLogs trống
      r.checkInTime = undefined;
      r.checkInMethod = undefined;
      r.checkInDevice = undefined;
      r.checkOutTime = undefined;
      r.checkOutMethod = undefined;
      r.checkOutDevice = undefined;
      r.lateMinutes = 0;
      r.earlyLeaveMinutes = 0;
      r.scanLogs = [];
    } else if (r.leavePeriod === 'morning') {
      // Nghỉ buổi sáng: không có checkIn sáng, chỉ giữ checkOut chiều nếu có
      r.checkInTime = undefined;
      r.checkInMethod = undefined;
      r.checkInDevice = undefined;
      r.lateMinutes = 0;
      r.scanLogs = (r.scanLogs || []).filter((l) => l.type === 'check_out');
    }
    if (r.note) {
      r.note = normalizeLeaveReason(r.note);
    }
  } else {
    // Không nghỉ phép: đồng bộ tuyệt đối giữa checkOutTime và scanLogs
    if (!r.checkOutTime) {
      // Chưa về: scanLogs không được chứa lượt quét check_out
      r.scanLogs = (r.scanLogs || []).filter((l) => l.type === 'check_in');
    } else {
      // Đã có giờ về: đảm bảo scanLogs có lượt quét check_out tương ứng
      const hasCheckOutLog = (r.scanLogs || []).some((l) => l.type === 'check_out');
      if (!hasCheckOutLog) {
        r.scanLogs = [
          ...(r.scanLogs || []),
          {
            id: `scan-${r.id}-out`,
            timestamp: `${r.date}T${r.checkOutTime}:00+07:00`,
            type: 'check_out',
            method: r.checkOutMethod || 'manual',
            deviceName: r.checkOutDevice || 'Ghi nhận thủ công từ Quản trị viên'
          }
        ];
      }
    }
  }
  return r;
}

const STORAGE_ATTENDANCE_KEY = 'finviet_daily_attendance_records';

const BASE_RECORDS_20261104: DailyAttendanceRecord[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001) - 2026-11-04 (Hôm nay)
  {
    id: 'att-ubnd-01-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-01',
    employeeCode: 'UBND-001',
    employeeName: 'Đ/c Nguyễn Văn An',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:15',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:05',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-01-1',
        timestamp: '2026-11-04T07:15:20Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.2
      },
      {
        id: 'scan-01-2',
        timestamp: '2026-11-04T16:05:40Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.8
      }
    ],
    note: 'Đến cơ quan và tan ca đúng giờ quy định',
    createdAt: '2026-11-04T07:15:20Z',
    updatedAt: '2026-11-04T16:05:40Z'
  },
  {
    id: 'att-ubnd-02-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-02',
    employeeCode: 'UBND-002',
    employeeName: 'Bà Phạm Thị Cúc',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    departmentId: 'dept-ubnd-02',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    date: '2026-11-04',
    checkInTime: '07:45',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:15',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 45, // Ca 07:00, ân hạn 30p (đến 07:30). Quét 07:45 -> muộn 45 phút so với giờ bắt đầu ca
    earlyLeaveMinutes: 0,
    status: 'late',
    scanLogs: [
      {
        id: 'scan-02-1',
        timestamp: '2026-11-04T07:45:10Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.6
      },
      {
        id: 'scan-02-2',
        timestamp: '2026-11-04T16:15:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04B2C3D4E5'
      }
    ],
    note: 'Đi muộn 45 phút do đi khảo sát thực địa hiện trường',
    createdAt: '2026-11-04T07:45:10Z',
    updatedAt: '2026-11-04T16:15:00Z'
  },
  {
    id: 'att-ubnd-03-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-03',
    employeeCode: 'UBND-003',
    employeeName: 'Ông Hoàng Văn Đức',
    departmentId: 'dept-ubnd-03',
    departmentName: 'Bộ phận Tư pháp - Hộ tịch',
    date: '2026-11-04',
    checkInTime: '07:25',
    checkInMethod: 'fingerprint',
    checkInDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    checkOutTime: '16:45',
    checkOutMethod: 'fingerprint',
    checkOutDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-03-1',
        timestamp: '2026-11-04T07:25:35Z',
        type: 'check_in',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      },
      {
        id: 'scan-03-2',
        timestamp: '2026-11-04T16:45:00Z',
        type: 'check_out',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      }
    ],
    note: 'Đến cơ quan và tan ca đúng giờ quy định',
    createdAt: '2026-11-04T07:25:35Z',
    updatedAt: '2026-11-04T16:45:00Z'
  },
  {
    id: 'att-ubnd-04-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-04',
    employeeCode: 'UBND-004',
    employeeName: 'Bà Lê Thị Thảo',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:18',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '17:05',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-04-1',
        timestamp: '2026-11-04T07:18:10Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.1
      }
    ],
    note: 'Đến đúng giờ quy định',
    createdAt: '2026-11-04T07:18:10Z',
    updatedAt: '2026-11-04T17:05:00Z'
  },
  {
    id: 'att-ubnd-05-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-05',
    employeeCode: 'UBND-005',
    employeeName: 'Ông Trần Minh Tuấn',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:22',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:30',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 30,
    status: 'early_leave',
    scanLogs: [
      {
        id: 'scan-05-1',
        timestamp: '2026-11-04T07:22:00Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04D4E5F605'
      }
    ],
    note: 'Về sớm 30 phút do có lịch họp đột xuất tại UBND Quận',
    createdAt: '2026-11-04T07:22:00Z',
    updatedAt: '2026-11-04T16:30:00Z'
  },
  {
    id: 'att-ubnd-06-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-06',
    employeeCode: 'UBND-006',
    employeeName: 'Bà Nguyễn Hoàng Mai',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:10',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '17:15',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-06-1',
        timestamp: '2026-11-04T07:10:05Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.5
      }
    ],
    note: 'Đến sớm hỗ trợ vận hành máy chủ',
    createdAt: '2026-11-04T07:10:05Z',
    updatedAt: '2026-11-04T17:15:00Z'
  },
  {
    id: 'att-ubnd-07-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-07',
    employeeCode: 'UBND-007',
    employeeName: 'Ông Vũ Quốc Bảo',
    departmentId: 'dept-ubnd-02',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    date: '2026-11-04',
    checkInTime: '07:24',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '17:00',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-07-1',
        timestamp: '2026-11-04T07:24:00Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04F6A7B807'
      },
      {
        id: 'scan-07-2',
        timestamp: '2026-11-04T17:00:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04F6A7B807'
      }
    ],
    note: 'Tan ca quẹt thẻ đúng giờ',
    createdAt: '2026-11-04T07:24:00Z',
    updatedAt: '2026-11-04T17:00:00Z'
  },
  {
    id: 'att-ubnd-08-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-08',
    employeeCode: 'UBND-008',
    employeeName: 'Ông Đỗ Quang Huy',
    departmentId: 'dept-ubnd-02',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    date: '2026-11-04',
    checkInTime: '07:42',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:50',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 12,
    earlyLeaveMinutes: 0,
    status: 'late',
    scanLogs: [
      {
        id: 'scan-08-1',
        timestamp: '2026-11-04T07:42:15Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.0
      },
      {
        id: 'scan-08-2',
        timestamp: '2026-11-04T16:50:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.4
      }
    ],
    note: 'Đi muộn 12 phút do xử lý trật tự lòng lề đường, tan ca đúng giờ',
    createdAt: '2026-11-04T07:42:15Z',
    updatedAt: '2026-11-04T16:50:00Z'
  },
  {
    id: 'att-ubnd-09-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-09',
    employeeCode: 'UBND-009',
    employeeName: 'Bà Đặng Kim Ngân',
    departmentId: 'dept-ubnd-02',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    date: '2026-11-04',
    checkInTime: '07:20',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:35',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-09-1',
        timestamp: '2026-11-04T07:20:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.9
      },
      {
        id: 'scan-09-2',
        timestamp: '2026-11-04T16:35:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.1
      }
    ],
    note: 'Đến cơ quan và tan ca đúng giờ quy định',
    createdAt: '2026-11-04T07:20:00Z',
    updatedAt: '2026-11-04T16:35:00Z'
  },
  {
    id: 'att-ubnd-11-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-11',
    employeeCode: 'UBND-011',
    employeeName: 'Bà Trần Thu Trang',
    departmentId: 'dept-ubnd-03',
    departmentName: 'Bộ phận Tư pháp - Hộ tịch',
    date: '2026-11-04',
    checkInTime: '07:15',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:40',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-11-1',
        timestamp: '2026-11-04T07:15:30Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C9D0E111'
      },
      {
        id: 'scan-11-2',
        timestamp: '2026-11-04T16:40:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C9D0E111'
      }
    ],
    note: 'Quẹt thẻ đúng giờ vào và ra ca',
    createdAt: '2026-11-04T07:15:30Z',
    updatedAt: '2026-11-04T16:40:00Z'
  },
  {
    id: 'att-ubnd-12-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-12',
    employeeCode: 'UBND-012',
    employeeName: 'Ông Phan Trọng Nghĩa',
    departmentId: 'dept-ubnd-03',
    departmentName: 'Bộ phận Tư pháp - Hộ tịch',
    date: '2026-11-04',
    checkInTime: '07:19',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '17:05',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-12-1',
        timestamp: '2026-11-04T07:19:10Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.7
      },
      {
        id: 'scan-12-2',
        timestamp: '2026-11-04T17:05:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.9
      }
    ],
    note: 'Điểm danh camera hoàn thành ca làm',
    createdAt: '2026-11-04T07:19:10Z',
    updatedAt: '2026-11-04T17:05:00Z'
  },
  {
    id: 'att-ubnd-13-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-13',
    employeeCode: 'UBND-013',
    employeeName: 'Bà Võ Bích Hạnh',
    departmentId: 'dept-ubnd-03',
    departmentName: 'Bộ phận Tư pháp - Hộ tịch',
    date: '2026-11-04',
    checkInTime: '07:23',
    checkInMethod: 'fingerprint',
    checkInDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    checkOutTime: '16:25',
    checkOutMethod: 'fingerprint',
    checkOutDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-13-1',
        timestamp: '2026-11-04T07:23:45Z',
        type: 'check_in',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      },
      {
        id: 'scan-13-2',
        timestamp: '2026-11-04T16:25:00Z',
        type: 'check_out',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      }
    ],
    note: 'Xác thực vân tay hoàn tất ca làm',
    createdAt: '2026-11-04T07:23:45Z',
    updatedAt: '2026-11-04T16:25:00Z'
  },
  {
    id: 'att-ubnd-14-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-14',
    employeeCode: 'UBND-014',
    employeeName: 'Đ/c Lê Văn Hùng',
    departmentId: 'dept-ubnd-04',
    departmentName: 'Ban Chỉ huy Quân sự Phường',
    date: '2026-11-04',
    checkInTime: '07:05',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:30',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-14-1',
        timestamp: '2026-11-04T07:05:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.3
      },
      {
        id: 'scan-14-2',
        timestamp: '2026-11-04T16:30:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.1
      }
    ],
    note: 'Trực chỉ huy ban sáng, bàn giao ca chiều',
    createdAt: '2026-11-04T07:05:00Z',
    updatedAt: '2026-11-04T16:30:00Z'
  },
  {
    id: 'att-ubnd-15-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-15',
    employeeCode: 'UBND-015',
    employeeName: 'Ông Mai Xuân Nam',
    departmentId: 'dept-ubnd-04',
    departmentName: 'Ban Chỉ huy Quân sự Phường',
    date: '2026-11-04',
    checkInTime: '07:12',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '17:00',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-15-1',
        timestamp: '2026-11-04T07:12:30Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04A3B4C515'
      },
      {
        id: 'scan-15-2',
        timestamp: '2026-11-04T17:00:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04A3B4C515'
      }
    ],
    note: 'Điểm danh thẻ hoàn thành trực ban',
    createdAt: '2026-11-04T07:12:30Z',
    updatedAt: '2026-11-04T17:00:00Z'
  },
  {
    id: 'att-ubnd-16-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-16',
    employeeCode: 'UBND-016',
    employeeName: 'Ông Nguyễn Quốc Khánh',
    departmentId: 'dept-ubnd-04',
    departmentName: 'Ban Chỉ huy Quân sự Phường',
    date: '2026-11-04',
    checkInTime: '07:17',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:45',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-16-1',
        timestamp: '2026-11-04T07:17:15Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.4
      },
      {
        id: 'scan-16-2',
        timestamp: '2026-11-04T16:45:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.7
      }
    ],
    note: 'Điểm danh camera hoàn tất ca trực',
    createdAt: '2026-11-04T07:17:15Z',
    updatedAt: '2026-11-04T16:45:00Z'
  },
  {
    id: 'att-ubnd-17-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-17',
    employeeCode: 'UBND-017',
    employeeName: 'Ông Đoàn Gia Huy',
    departmentId: 'dept-ubnd-04',
    departmentName: 'Ban Chỉ huy Quân sự Phường',
    date: '2026-11-04',
    checkInTime: '07:44',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:55',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 14,
    earlyLeaveMinutes: 0,
    status: 'late',
    scanLogs: [
      {
        id: 'scan-17-1',
        timestamp: '2026-11-04T07:44:00Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C5D6E717'
      },
      {
        id: 'scan-17-2',
        timestamp: '2026-11-04T16:55:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C5D6E717'
      }
    ],
    note: 'Đi muộn 14 phút, tan ca quẹt thẻ đầy đủ',
    createdAt: '2026-11-04T07:44:00Z',
    updatedAt: '2026-11-04T16:55:00Z'
  },
  {
    id: 'att-ubnd-18-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-18',
    employeeCode: 'UBND-018',
    employeeName: 'Trung tá Trần Quốc Toản',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    checkInTime: '07:08',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '17:10',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-18-1',
        timestamp: '2026-11-04T07:08:10Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.7
      },
      {
        id: 'scan-18-2',
        timestamp: '2026-11-04T17:10:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.5
      }
    ],
    note: 'Chỉ huy giao ban đầu ngày và bàn giao ca tối',
    createdAt: '2026-11-04T07:08:10Z',
    updatedAt: '2026-11-04T17:10:00Z'
  },
  {
    id: 'att-ubnd-19-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-19',
    employeeCode: 'UBND-019',
    employeeName: 'Thiếu tá Đinh Trọng Hưng',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    checkInTime: '07:11',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:45',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-19-1',
        timestamp: '2026-11-04T07:11:30Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04E7F8A919'
      },
      {
        id: 'scan-19-2',
        timestamp: '2026-11-04T16:45:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04E7F8A919'
      }
    ],
    note: 'Điểm danh thẻ hoàn thành nhiệm vụ ca ngày',
    createdAt: '2026-11-04T07:11:30Z',
    updatedAt: '2026-11-04T16:45:00Z'
  },
  {
    id: 'att-ubnd-20-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-20',
    employeeCode: 'UBND-020',
    employeeName: 'Đại úy Nguyễn Thanh Tùng',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    checkInTime: '07:19',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '17:05',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-20-1',
        timestamp: '2026-11-04T07:19:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.6
      },
      {
        id: 'scan-20-2',
        timestamp: '2026-11-04T17:05:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.8
      }
    ],
    note: 'Điểm danh camera ra về đúng quy định',
    createdAt: '2026-11-04T07:19:00Z',
    updatedAt: '2026-11-04T17:05:00Z'
  },
  {
    id: 'att-ubnd-21-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-21',
    employeeCode: 'UBND-021',
    employeeName: 'Thượng úy Bùi Thị Thu Vân',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    checkInTime: '07:14',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:50',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-21-1',
        timestamp: '2026-11-04T07:14:20Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04A9B0C121'
      },
      {
        id: 'scan-21-2',
        timestamp: '2026-11-04T16:50:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04A9B0C121'
      }
    ],
    note: 'Điểm danh thẻ hoàn thành trực ban',
    createdAt: '2026-11-04T07:14:20Z',
    updatedAt: '2026-11-04T16:50:00Z'
  },
  {
    id: 'att-ubnd-22-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-22',
    employeeCode: 'UBND-022',
    employeeName: 'Trung úy Tạ Đình Khang',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'leave',
    scanLogs: [],
    note: 'Đi công tác đột xuất',
    createdAt: '2026-11-04T07:00:00Z',
    updatedAt: '2026-11-04T07:00:00Z'
  },
  {
    id: 'att-ubnd-23-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-23',
    employeeCode: 'UBND-023',
    employeeName: 'Thượng sĩ Ngô Văn Kiên',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    date: '2026-11-04',
    checkInTime: '06:55',
    checkInMethod: 'fingerprint',
    checkInDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    checkOutTime: '15:05',
    checkOutMethod: 'fingerprint',
    checkOutDevice: 'Máy chấm công vân tay Cổng Tiếp công dân',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-23-1',
        timestamp: '2026-11-04T06:55:00Z',
        type: 'check_in',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      },
      {
        id: 'scan-23-2',
        timestamp: '2026-11-04T15:05:00Z',
        type: 'check_out',
        method: 'fingerprint',
        deviceName: 'Máy chấm công vân tay Cổng Tiếp công dân'
      }
    ],
    note: 'Hoàn thành ca trực ban',
    createdAt: '2026-11-04T06:55:00Z',
    updatedAt: '2026-11-04T15:05:00Z'
  },
  {
    id: 'att-ubnd-24-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-24',
    employeeCode: 'UBND-024',
    employeeName: 'Bà Lâm Thanh Trúc',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:16',
    checkInMethod: 'card',
    checkInDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    checkOutTime: '16:35',
    checkOutMethod: 'card',
    checkOutDevice: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-24-1',
        timestamp: '2026-11-04T07:16:40Z',
        type: 'check_in',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C1D2E324'
      },
      {
        id: 'scan-24-2',
        timestamp: '2026-11-04T16:35:00Z',
        type: 'check_out',
        method: 'card',
        deviceName: 'Đầu đọc thẻ RFID Mifare Cổng Trụ sở',
        cardUid: '04C1D2E324'
      }
    ],
    note: 'Điểm danh thẻ hoàn thành ca trực một cửa',
    createdAt: '2026-11-04T07:16:40Z',
    updatedAt: '2026-11-04T16:35:00Z'
  },
  {
    id: 'att-ubnd-25-20261104',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-25',
    employeeCode: 'UBND-025',
    employeeName: 'Ông Đỗ Việt Hùng',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    date: '2026-11-04',
    checkInTime: '07:21',
    checkInMethod: 'faceId',
    checkInDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    checkOutTime: '16:40',
    checkOutMethod: 'faceId',
    checkOutDevice: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-25-1',
        timestamp: '2026-11-04T07:21:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.2
      },
      {
        id: 'scan-25-2',
        timestamp: '2026-11-04T16:40:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99
      }
    ],
    note: 'Bộ phận một cửa mở đúng giờ và kết thúc ca đúng quy định',
    createdAt: '2026-11-04T07:21:00Z',
    updatedAt: '2026-11-04T16:40:00Z'
  },
  {
    id: 'att-ubnd-20261104-26',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-26',
    employeeCode: 'UBND-026',
    employeeName: 'Bà Nguyễn Thùy Linh',
    departmentId: 'dept-ubnd-01',
    departmentName: 'Văn phòng HĐND & UBND',
    position: 'Chuyên viên Tổng hợp',
    date: '2026-11-04',
    shiftName: 'Ca hành chính UBND',
    checkInTime: '07:15',
    checkOutTime: '17:00',
    workDurationHours: 8.5,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-26-1',
        timestamp: '2026-11-04T07:15:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.7
      },
      {
        id: 'scan-26-2',
        timestamp: '2026-11-04T17:00:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.5
      }
    ],
    createdAt: '2026-11-04T07:15:00Z',
    updatedAt: '2026-11-04T17:00:00Z'
  },
  {
    id: 'att-ubnd-20261104-27',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-27',
    employeeCode: 'UBND-027',
    employeeName: 'Ông Trần Quốc Tuấn',
    departmentId: 'dept-ubnd-02',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    position: 'Cán bộ Quản lý trật tự đô thị',
    date: '2026-11-04',
    shiftName: 'Ca hành chính UBND',
    checkInTime: '07:12',
    checkOutTime: '16:45',
    workDurationHours: 8.5,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-27-1',
        timestamp: '2026-11-04T07:12:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.1
      },
      {
        id: 'scan-27-2',
        timestamp: '2026-11-04T16:45:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.9
      }
    ],
    createdAt: '2026-11-04T07:12:00Z',
    updatedAt: '2026-11-04T16:45:00Z'
  },
  {
    id: 'att-ubnd-20261104-28',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-28',
    employeeCode: 'UBND-028',
    employeeName: 'Bà Lê Khánh Vy',
    departmentId: 'dept-ubnd-03',
    departmentName: 'Bộ phận Tư pháp - Hộ tịch',
    position: 'Chuyên viên Hộ tịch',
    date: '2026-11-04',
    shiftName: 'Ca hành chính UBND',
    checkInTime: '07:18',
    checkOutTime: '17:05',
    workDurationHours: 8.5,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-28-1',
        timestamp: '2026-11-04T07:18:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.4
      },
      {
        id: 'scan-28-2',
        timestamp: '2026-11-04T17:05:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.6
      }
    ],
    createdAt: '2026-11-04T07:18:00Z',
    updatedAt: '2026-11-04T17:05:00Z'
  },
  {
    id: 'att-ubnd-20261104-29',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-29',
    employeeCode: 'UBND-029',
    employeeName: 'Ông Phan Đình Trọng',
    departmentId: 'dept-ubnd-04',
    departmentName: 'Ban Chỉ huy Quân sự Phường',
    position: 'Chiến sĩ Dân quân thường trực',
    date: '2026-11-04',
    shiftName: 'Ca hành chính UBND',
    checkInTime: '07:05',
    checkOutTime: '16:30',
    workDurationHours: 8.5,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-29-1',
        timestamp: '2026-11-04T07:05:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.3
      },
      {
        id: 'scan-29-2',
        timestamp: '2026-11-04T16:30:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 99.0
      }
    ],
    createdAt: '2026-11-04T07:05:00Z',
    updatedAt: '2026-11-04T16:30:00Z'
  },
  {
    id: 'att-ubnd-20261104-30',
    tenantId: 'tenant-ubnd-001',
    employeeId: 'emp-ubnd-30',
    employeeCode: 'UBND-030',
    employeeName: 'Bà Vũ Mai Phương',
    departmentId: 'dept-ubnd-05',
    departmentName: 'Công An Phường Bến Nghé',
    position: 'Cán bộ Cảnh sát trật tự',
    date: '2026-11-04',
    shiftName: 'Ca hành chính UBND',
    checkInTime: '07:08',
    checkOutTime: '16:40',
    workDurationHours: 8.5,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: 'on_time',
    scanLogs: [
      {
        id: 'scan-30-1',
        timestamp: '2026-11-04T07:08:00Z',
        type: 'check_in',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.9
      },
      {
        id: 'scan-30-2',
        timestamp: '2026-11-04T16:40:00Z',
        type: 'check_out',
        method: 'faceId',
        deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
        faceScore: 98.8
      }
    ],
    createdAt: '2026-11-04T07:08:00Z',
    updatedAt: '2026-11-04T16:40:00Z'
  },
];

function buildMultiDayRecords(base20261104: DailyAttendanceRecord[]): DailyAttendanceRecord[] {
  const all: DailyAttendanceRecord[] = [...base20261104];
  const otherDates = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'];

  for (const date of otherDates) {
    if (date === '2026-11-01') {
      // Chủ nhật: Lịch trực ban Ban chỉ huy quân sự và Công an phường (6 cán bộ)
      const dutyRecords = base20261104
        .filter((r) => r.departmentId === 'dept-ubnd-04' || r.departmentId === 'dept-ubnd-05')
        .map((r, i) => {
          const isLate = i === 5;
          return {
            ...r,
            id: `att-${r.employeeId}-${date.replace(/-/g, '')}`,
            date,
            checkInTime: isLate ? '07:45' : '07:15',
            checkInMethod: r.checkInMethod || 'faceId',
            checkOutTime: '17:00',
            checkOutMethod: r.checkOutMethod || 'faceId',
            lateMinutes: isLate ? 45 : 0,
            earlyLeaveMinutes: 0,
            status: (isLate ? 'late' : 'on_time') as DailyAttendanceStatus,
            note: isLate ? 'Trực ban ca Chủ nhật (Đi muộn 45p)' : 'Trực ban ca Chủ nhật đúng giờ',
            createdAt: `${date}T07:15:00Z`,
            updatedAt: `${date}T17:00:00Z`,
            scanLogs: [
              {
                id: `scan-${r.employeeId}-${date}-in`,
                timestamp: `${date}T${isLate ? '07:45' : '07:15'}:00Z`,
                type: 'check_in' as const,
                method: r.checkInMethod || 'faceId',
                deviceName: r.checkInDevice || 'Camera AI Hikvision Cổng 1 - Trụ sở UBND'
              },
              {
                id: `scan-${r.employeeId}-${date}-out`,
                timestamp: `${date}T17:00:00Z`,
                type: 'check_out' as const,
                method: r.checkOutMethod || 'faceId',
                deviceName: r.checkOutDevice || 'Camera AI Hikvision Cổng 1 - Trụ sở UBND'
              }
            ]
          };
        });
      all.push(...dutyRecords);
    } else {
      // Các ngày làm việc trong tuần (02, 03, 05, 06)
      const dayRecords = base20261104.map((r) => {
        const rec: DailyAttendanceRecord = {
          ...r,
          id: `att-${r.employeeId}-${date.replace(/-/g, '')}`,
          date,
          createdAt: `${date}T07:15:00Z`,
          updatedAt: `${date}T16:15:00Z`,
          scanLogs: r.scanLogs.map((l) => ({
            ...l,
            id: `${l.id}-${date.replace(/-/g, '')}`,
            timestamp: l.timestamp.replace('2026-11-04', date)
          }))
        };

        // 2026-11-05: Đầy đủ giờ đến & giờ về cho tất cả cán bộ có mặt

        if (date === '2026-11-02') {
          if (r.employeeId === 'emp-ubnd-17') {
            rec.status = 'leave';
            rec.note = 'Nghỉ phép năm';
            rec.checkInTime = undefined;
            rec.checkOutTime = undefined;
            rec.lateMinutes = 0;
            rec.earlyLeaveMinutes = 0;
          }
        } else if (date === '2026-11-03') {
          if (r.employeeId === 'emp-ubnd-13') {
            rec.status = 'leave';
            rec.note = 'Nghỉ việc riêng / Khẩn cấp';
            rec.checkInTime = undefined;
            rec.checkOutTime = undefined;
            rec.lateMinutes = 0;
            rec.earlyLeaveMinutes = 0;
          }
        } else if (date === '2026-11-05') {
          if (r.employeeId === 'emp-ubnd-16') {
            rec.status = 'leave';
            rec.note = 'Nghỉ ốm / Khám sức khỏe';
            rec.checkInTime = undefined;
            rec.checkOutTime = undefined;
            rec.lateMinutes = 0;
            rec.earlyLeaveMinutes = 0;
          } else if (r.employeeId === 'emp-ubnd-03' || r.employeeId === 'emp-ubnd-07') {
            // Cán bộ quên check-out ngày hôm trước (chỉ có giờ vào)
            rec.checkOutTime = undefined;
            rec.checkOutMethod = undefined;
            rec.checkOutDevice = undefined;
            rec.earlyLeaveMinutes = 0;
            rec.scanLogs = rec.scanLogs.filter(l => l.type === 'check_in');
            rec.note = 'Chưa ghi nhận giờ về (Quên check-out)';
          }
        } else if (date === '2026-11-06') {
          // Ngày hôm nay (06/11/2026): Cán bộ đang trong ca làm việc chưa tan ca
          if (r.employeeId === 'emp-ubnd-09') {
            rec.status = 'leave';
            rec.note = 'Nghỉ phép năm';
            rec.checkInTime = undefined;
            rec.checkOutTime = undefined;
            rec.lateMinutes = 0;
            rec.earlyLeaveMinutes = 0;
            rec.scanLogs = [];
          } else if (r.employeeId !== 'emp-ubnd-01' && r.employeeId !== 'emp-ubnd-06') {
            // Các cán bộ khác chưa hết giờ làm việc (chưa có giờ về)
            rec.checkOutTime = undefined;
            rec.checkOutMethod = undefined;
            rec.checkOutDevice = undefined;
            rec.scanLogs = rec.scanLogs.filter(l => l.type === 'check_in');
          }
        }

        return sanitizeRecordConsistency(rec);
      }).filter((r): r is DailyAttendanceRecord => r !== null);
      all.push(...dayRecords);
    }
  }

  return all;
}

export const INITIAL_ATTENDANCE_RECORDS: DailyAttendanceRecord[] = buildMultiDayRecords(BASE_RECORDS_20261104);

class DailyAttendanceService {
  private memoryRecords: Map<string, DailyAttendanceRecord> = new Map();

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
      const stored = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
      } else {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            if (list.length < INITIAL_ATTENDANCE_RECORDS.length) {
              localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
            } else {
              list.forEach((rec: DailyAttendanceRecord) => {
                sanitizeRecordConsistency(rec);
              });
              localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(list));
            }
          }
        } catch {
          localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
        }
      }
    } else {
      INITIAL_ATTENDANCE_RECORDS.forEach((r) => this.memoryRecords.set(r.id, sanitizeRecordConsistency({ ...r })));
    }
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    }
    this.memoryRecords.clear();
    INITIAL_ATTENDANCE_RECORDS.forEach((r) => this.memoryRecords.set(r.id, sanitizeRecordConsistency({ ...r })));
  }

  private getAllRecords(): DailyAttendanceRecord[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
      if (raw) {
        try {
          const parsed: DailyAttendanceRecord[] = JSON.parse(raw);
          return parsed.map((r) => sanitizeRecordConsistency({ ...r }));
        } catch {
          return INITIAL_ATTENDANCE_RECORDS.map((r) => sanitizeRecordConsistency({ ...r }));
        }
      }
      return INITIAL_ATTENDANCE_RECORDS.map((r) => sanitizeRecordConsistency({ ...r }));
    }
    return Array.from(this.memoryRecords.values()).map((r) => sanitizeRecordConsistency({ ...r }));
  }

  private saveRecords(records: DailyAttendanceRecord[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(records));
    } else {
      this.memoryRecords.clear();
      records.forEach((r) => this.memoryRecords.set(r.id, r));
    }
  }

  /**
   * Lấy danh sách chấm công ngày của toàn thể cán bộ trong đơn vị (ATT-03)
   * Tự động sinh bản ghi 'absent' đối với cán bộ chưa có lượt quét trong ngày.
   */
  public async getDailyAttendance(
    tenantId: string,
    filter: DailyAttendanceFilter
  ): Promise<DailyAttendanceRecord[]> {
    authService.assertTenantAccess(tenantId);

    const [employees, departments] = await Promise.all([
      employeeService.getEmployeesByTenant(tenantId),
      departmentService.getDepartmentsByTenant(tenantId)
    ]);

    const deptMap = new Map<string, string>();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    const allRecords = this.getAllRecords();
    const existingMap = new Map<string, DailyAttendanceRecord>();

    allRecords
      .filter((r) => r.tenantId === tenantId && r.date === filter.date)
      .forEach((r) => existingMap.set(r.employeeId, r));

    // Duyệt qua tất cả nhân viên của đơn vị để tạo danh sách đầy đủ
    const fullList: DailyAttendanceRecord[] = employees.map((emp) => {
      const existing = existingMap.get(emp.id);
      if (existing) {
        return {
          ...existing,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          avatarUrl: emp.avatarUrl,
          departmentId: emp.departmentId,
          departmentName: deptMap.get(emp.departmentId) || 'Phòng ban khác'
        };
      }

      // Chưa có lượt quét -> Tự động đánh dấu vắng mặt
      const emptyRecord: DailyAttendanceRecord = {
        id: `att-${emp.id}-${filter.date.replace(/-/g, '')}`,
        tenantId,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        avatarUrl: emp.avatarUrl,
        departmentId: emp.departmentId,
        departmentName: deptMap.get(emp.departmentId) || 'Phòng ban khác',
        date: filter.date,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        status: 'absent',
        scanLogs: [],
        note: 'Chưa có dữ liệu quét trong ngày',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return emptyRecord;
    });

    // Lọc theo điều kiện tìm kiếm và bộ lọc
    let result = fullList;

    if (filter.departmentId) {
      result = result.filter((r) => r.departmentId === filter.departmentId);
    }

    if (filter.status && filter.status !== 'all') {
      if (filter.status === 'on_time') {
        result = result.filter(
          (r) =>
            r.status === 'on_time' ||
            (r.lateMinutes === 0 && r.earlyLeaveMinutes === 0 && Boolean(r.checkInTime) && r.status !== 'leave')
        );
      } else if (filter.status === 'late') {
        result = result.filter(
          (r) => r.status === 'late' || r.status === 'late_and_early' || r.lateMinutes > 0
        );
      } else if (filter.status === 'early_leave') {
        result = result.filter(
          (r) => r.status === 'early_leave' || r.status === 'late_and_early' || r.earlyLeaveMinutes > 0
        );
      } else if (filter.status === 'leave') {
        result = result.filter((r) => r.status === 'leave');
      } else if (filter.status === 'absent') {
        result = result.filter((r) => r.status === 'absent');
      } else {
        result = result.filter((r) => r.status === filter.status);
      }
    }

    if (filter.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q) ||
          r.departmentName.toLowerCase().includes(q)
      );
    }

    // Sắp xếp: Ai đã đến trước xếp trên, sau đó theo mã nhân viên
    return result.sort((a, b) => {
      if (a.checkInTime && !b.checkInTime) return -1;
      if (!a.checkInTime && b.checkInTime) return 1;
      if (a.checkInTime && b.checkInTime) {
        return a.checkInTime.localeCompare(b.checkInTime);
      }
      return a.employeeCode.localeCompare(b.employeeCode);
    });
  }

  /**
   * Tính toán các chỉ số tóm tắt chuyên cần trong ngày (ATT-03)
   */
  public async getDailySummary(
    tenantId: string,
    date: string
  ): Promise<DailyAttendanceSummary> {
    authService.assertTenantAccess(tenantId);
    const records = await this.getDailyAttendance(tenantId, { date });

    const totalEmployees = records.length;
    let presentCount = 0;
    let onTimeCount = 0;
    let lateCount = 0;
    let earlyLeaveCount = 0;
    let leaveCount = 0;
    let absentCount = 0;

    records.forEach((r) => {
      if (r.checkInTime) {
        presentCount++;
      }
      if (r.status === 'on_time') onTimeCount++;
      else if (r.status === 'late') lateCount++;
      else if (r.status === 'early_leave') earlyLeaveCount++;
      else if (r.status === 'late_and_early') {
        lateCount++;
        earlyLeaveCount++;
      } else if (r.status === 'leave') {
        leaveCount++;
      } else if (r.status === 'absent') absentCount++;
    });

    const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    return {
      date,
      totalEmployees,
      presentCount,
      onTimeCount,
      lateCount,
      earlyLeaveCount,
      leaveCount,
      absentCount,
      attendanceRate
    };
  }

  /**
   * Tiếp nhận sự kiện quét điểm danh mới (Face ID, Vân tay, Thẻ) tại cổng cơ quan (ATT-02)
   */
  public async recordAttendance(payload: RecordAttendancePayload): Promise<DailyAttendanceRecord> {
    authService.assertTenantAccess(payload.tenantId);

    const [emp, settings, departments] = await Promise.all([
      employeeService.getEmployeeById(payload.tenantId, payload.employeeId),
      attendanceSettingService.getSettings(payload.tenantId),
      departmentService.getDepartmentsByTenant(payload.tenantId)
    ]);

    const deptMap = new Map<string, string>();
    departments.forEach((d) => deptMap.set(d.id, d.name));

    const allRecords = this.getAllRecords();
    const recordIndex = allRecords.findIndex(
      (r) => r.tenantId === payload.tenantId && r.employeeId === payload.employeeId && r.date === payload.date
    );

    const now = new Date();
    let timeStr = payload.time;
    if (!timeStr) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      timeStr = `${h}:${m}`;
    }

    const deviceName = payload.deviceName || (
      payload.method === 'faceId'
        ? 'Camera AI Hikvision Cổng 1 - Trụ sở'
        : payload.method === 'fingerprint'
        ? 'Máy quét vân tay Cổng Trụ sở'
        : payload.method === 'card'
        ? 'Đầu đọc thẻ RFID Mifare Cổng'
        : 'Ghi nhận thủ công từ Quản trị viên'
    );

    let existingRecord: DailyAttendanceRecord;
    if (recordIndex >= 0) {
      existingRecord = { ...allRecords[recordIndex] };
    } else {
      existingRecord = {
        id: `att-${payload.employeeId}-${payload.date.replace(/-/g, '')}`,
        tenantId: payload.tenantId,
        employeeId: payload.employeeId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        avatarUrl: emp.avatarUrl,
        departmentId: emp.departmentId,
        departmentName: deptMap.get(emp.departmentId) || 'Phòng ban khác',
        date: payload.date,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        status: 'absent',
        scanLogs: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    }

    // Tự động phân loại Check-in hoặc Check-out nếu chọn auto
    let eventType: 'check_in' | 'check_out' = payload.type === 'auto'
      ? (existingRecord.checkInTime ? 'check_out' : 'check_in')
      : payload.type;

    const newLog: AttendanceScanLog = {
      id: `scan-${Date.now().toString(36)}`,
      timestamp: now.toISOString(),
      type: eventType,
      method: payload.method,
      deviceName,
      cardUid: payload.cardUid,
      faceScore: payload.faceScore
    };

    existingRecord.scanLogs.push(newLog);

    if (eventType === 'check_in') {
      existingRecord.checkInTime = timeStr;
      existingRecord.checkInMethod = payload.method;
      existingRecord.checkInDevice = deviceName;

      // Đánh giá đi muộn đối chiếu với cài đặt khung ca
      const checkInEval = attendanceSettingService.evaluateDailyCheckIn(timeStr, settings);
      existingRecord.lateMinutes = checkInEval.lateMinutes;
      if (checkInEval.isLate) {
        existingRecord.status = 'late';
        existingRecord.note = `Đi muộn ${checkInEval.lateMinutes} phút`;
      } else {
        existingRecord.status = 'on_time';
        existingRecord.note = 'Đến đúng giờ quy định';
      }
    } else {
      existingRecord.checkOutTime = timeStr;
      existingRecord.checkOutMethod = payload.method;
      existingRecord.checkOutDevice = deviceName;

      // Đánh giá về sớm đối chiếu với giờ tan ca
      const checkOutEval = attendanceSettingService.evaluateDailyCheckOut(timeStr, settings);
      existingRecord.earlyLeaveMinutes = checkOutEval.earlyLeaveMinutes;

      if (existingRecord.lateMinutes > 0 && checkOutEval.isEarlyLeave) {
        existingRecord.status = 'late_and_early';
        existingRecord.note = `Đi muộn ${existingRecord.lateMinutes}p & Về sớm ${checkOutEval.earlyLeaveMinutes}p`;
      } else if (existingRecord.lateMinutes > 0) {
        existingRecord.status = 'late';
      } else if (checkOutEval.isEarlyLeave) {
        existingRecord.status = 'early_leave';
        existingRecord.note = `Về sớm ${checkOutEval.earlyLeaveMinutes} phút trước giờ tan ca`;
      } else {
        existingRecord.status = 'on_time';
        existingRecord.note = 'Hoàn thành ca làm việc đúng giờ';
      }
    }

    existingRecord.updatedAt = now.toISOString();

    if (recordIndex >= 0) {
      allRecords[recordIndex] = existingRecord;
    } else {
      allRecords.push(existingRecord);
    }

    this.saveRecords(allRecords);
    return existingRecord;
  }

  /**
   * Đánh dấu hoặc hủy trạng thái Nghỉ phép cho nhân sự trong ngày
   */
  public async toggleEmployeeLeave(
    tenantId: string,
    employeeId: string,
    date: string,
    isLeave: boolean,
    reason?: string,
    leavePeriod: LeavePeriod = 'full_day'
  ): Promise<DailyAttendanceRecord> {
    authService.assertTenantAccess(tenantId);
    const emp = await employeeService.getEmployeeById(tenantId, employeeId);
    const allRecords = this.getAllRecords();
    const recordIndex = allRecords.findIndex(
      (r) => r.tenantId === tenantId && r.employeeId === employeeId && r.date === date
    );

    const now = new Date();
    let record: DailyAttendanceRecord;

    if (recordIndex >= 0) {
      record = { ...allRecords[recordIndex] };
    } else {
      record = {
        id: `att-${employeeId}-${date.replace(/-/g, '')}`,
        tenantId,
        employeeId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        avatarUrl: emp.avatarUrl,
        departmentId: emp.departmentId,
        departmentName: 'Phòng ban',
        date,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        status: 'absent',
        scanLogs: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    }

    if (isLeave) {
      record.status = 'leave';
      record.leavePeriod = leavePeriod;
      record.note = reason?.trim() ? normalizeLeaveReason(reason.trim()) : 'Nghỉ việc riêng / Khẩn cấp';
      // Áp dụng chuẩn hóa tính nhất quán dữ liệu nghỉ phép
      sanitizeRecordConsistency(record);
    } else {
      record.leavePeriod = undefined;
      record.note = 'Đã hủy trạng thái nghỉ phép';
      if (record.checkInTime) {
        record.status = record.lateMinutes > 0 ? 'late' : 'on_time';
      } else {
        record.status = 'absent';
        record.checkInTime = undefined;
        record.checkOutTime = undefined;
        record.lateMinutes = 0;
        record.earlyLeaveMinutes = 0;
      }
      sanitizeRecordConsistency(record);
    }

    record.updatedAt = now.toISOString();

    if (recordIndex >= 0) {
      allRecords[recordIndex] = record;
    } else {
      allRecords.push(record);
    }

    this.saveRecords(allRecords);
    return record;
  }

  /**
   * Quản trị viên bổ sung giờ về (check-out bù) cho cán bộ quên check-out ngày hôm trước
   * và lưu vết kiểm toán (Audit Log)
   */
  public async adminCheckOut(payload: AdminCheckOutPayload): Promise<DailyAttendanceRecord> {
    authService.assertTenantAccess(payload.tenantId);

    const settings = await attendanceSettingService.getSettings(payload.tenantId);

    const allRecords = this.getAllRecords();
    const recordIndex = allRecords.findIndex(
      (r) => r.tenantId === payload.tenantId && r.employeeId === payload.employeeId && r.date === payload.date
    );

    if (recordIndex < 0) {
      throw new Error(`Không tìm thấy hồ sơ chấm công ngày ${payload.date} của nhân sự.`);
    }

    const existingRecord = { ...allRecords[recordIndex] };
    const previousStatus = existingRecord.status;
    const now = new Date();

    // Đánh giá giờ về đối chiếu khung ca
    const checkOutEval = attendanceSettingService.evaluateDailyCheckOut(payload.checkOutTime, settings);

    existingRecord.checkOutTime = payload.checkOutTime;
    existingRecord.checkOutMethod = 'manual';
    existingRecord.checkOutDevice = `Thông tin check-out được bổ sung bởi ${payload.adminName}`;
    existingRecord.checkOutAdminName = payload.adminName;
    existingRecord.earlyLeaveMinutes = checkOutEval.earlyLeaveMinutes;

    // Cập nhật trạng thái
    if (existingRecord.lateMinutes > 0 && checkOutEval.isEarlyLeave) {
      existingRecord.status = 'late_and_early';
      existingRecord.note = `Đi muộn ${existingRecord.lateMinutes}p & Về sớm ${checkOutEval.earlyLeaveMinutes}p (Thông tin check-out được bổ sung bởi ${payload.adminName})`;
    } else if (existingRecord.lateMinutes > 0) {
      existingRecord.status = 'late';
      existingRecord.note = `Đi muộn ${existingRecord.lateMinutes}p (Thông tin check-out được bổ sung bởi ${payload.adminName})`;
    } else if (checkOutEval.isEarlyLeave) {
      existingRecord.status = 'early_leave';
      existingRecord.note = `Về sớm ${checkOutEval.earlyLeaveMinutes}p (Thông tin check-out được bổ sung bởi ${payload.adminName})`;
    } else {
      existingRecord.status = 'on_time';
      existingRecord.note = `Hoàn thành ca làm việc (Thông tin check-out được bổ sung bởi ${payload.adminName})`;
    }

    // Thêm vào scanLogs
    const newScanLog: AttendanceScanLog = {
      id: `scan-admin-${Date.now().toString(36)}`,
      timestamp: `${payload.date}T${payload.checkOutTime}:00+07:00`,
      type: 'check_out',
      method: 'manual',
      deviceName: `Thông tin check-out được bổ sung bởi ${payload.adminName}`,
      note: payload.reason || `Thông tin check-out được bổ sung bởi ${payload.adminName}`
    };
    existingRecord.scanLogs = [...(existingRecord.scanLogs || []), newScanLog];

    // Thêm vào auditLogs
    const newAuditLog: AttendanceAuditLog = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      action: 'admin_checkout',
      performedBy: payload.adminName,
      performedAt: now.toISOString(),
      reason: payload.reason || 'Bổ sung giờ về trực tiếp',
      details: `Thông tin check-out được bổ sung bởi ${payload.adminName}: Giờ về ${payload.checkOutTime} ngày ${payload.date}.${payload.note ? ` Ghi chú: ${payload.note}` : ''}`,
      previousStatus,
      newStatus: existingRecord.status
    };
    existingRecord.auditLogs = [...(existingRecord.auditLogs || []), newAuditLog];
    existingRecord.updatedAt = now.toISOString();

    allRecords[recordIndex] = existingRecord;
    this.saveRecords(allRecords);
    return existingRecord;
  }

  /**
   * Lấy danh sách cán bộ quên check-out trong ngày (có check-in nhưng chưa có check-out)
   */
  public async getUncheckedOutEmployees(tenantId: string, date: string): Promise<DailyAttendanceRecord[]> {
    const records = await this.getDailyAttendance(tenantId, { date });
    return records.filter((r) => r.status !== 'leave' && Boolean(r.checkInTime) && !r.checkOutTime);
  }

  /**
   * Xuất dữ liệu bảng chấm công ngày ra file CSV / Excel định dạng chuẩn tiếng Việt (ATT-03)
   */
  public async exportDailyAttendanceCsv(tenantId: string, date: string): Promise<string> {
    const records = await this.getDailyAttendance(tenantId, { date });

    const header = [
      'STT',
      'Mã Nhân Viên',
      'Họ và Tên',
      'Phòng Ban',
      'Ngày',
      'Giờ Đến (Check-in)',
      'Hình Thức Đến',
      'Thiết Bị Đến',
      'Giờ Về (Check-out)',
      'Hình Thức Về',
      'Thiết Bị Về',
      'Phút Muộn',
      'Phút Về Sớm',
      'Trạng Thái',
      'Ghi Chú'
    ];

    const getStatusText = (status: string) => {
      switch (status) {
        case 'on_time':
          return 'Đúng giờ';
        case 'late':
          return 'Đi muộn';
        case 'early_leave':
          return 'Về sớm';
        case 'late_and_early':
          return 'Muộn & Về sớm';
        case 'leave':
          return 'Nghỉ phép';
        case 'absent':
          return 'Chưa đến / Vắng';
        default:
          return status;
      }
    };

    const getMethodText = (method?: string) => {
      switch (method) {
        case 'faceId':
          return 'Khuôn mặt (Face ID)';
        case 'fingerprint':
          return 'Vân tay';
        case 'card':
          return 'Thẻ RFID';
        case 'manual':
          return 'Thủ công';
        default:
          return '—';
      }
    };

    const rows = records.map((r, idx) => [
      String(idx + 1),
      r.employeeCode,
      `"${r.employeeName}"`,
      `"${r.departmentName}"`,
      r.date,
      r.checkInTime || '—',
      getMethodText(r.checkInMethod),
      `"${r.checkInDevice || '—'}"`,
      r.checkOutTime || '—',
      getMethodText(r.checkOutMethod),
      `"${r.checkOutDevice || '—'}"`,
      String(r.lateMinutes || 0),
      String(r.earlyLeaveMinutes || 0),
      getStatusText(r.status),
      `"${r.note || ''}"`
    ]);

    // Thêm BOM UTF-8 để mở tiếng Việt trên Microsoft Excel không bị lỗi font
    return '\uFEFF' + [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  }

  /**
   * Xuất dữ liệu bảng chấm công ngày ra file Excel (.xlsx) chuẩn OpenXML với thiết kế bảng chuyên nghiệp
   */
  public async exportDailyAttendanceExcel(tenantId: string, date: string, orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé'): Promise<void> {
    const records = await this.getDailyAttendance(tenantId, { date });

    const getStatusText = (status: string) => {
      switch (status) {
        case 'on_time':
          return 'Đúng giờ';
        case 'late':
          return 'Đi muộn';
        case 'early_leave':
          return 'Về sớm';
        case 'late_and_early':
          return 'Muộn & Về sớm';
        case 'leave':
          return 'Nghỉ phép';
        case 'absent':
          return 'Chưa đến / Vắng';
        default:
          return status;
      }
    };

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'on_time':
          return 'badgeSuccess' as const;
        case 'late':
        case 'early_leave':
        case 'late_and_early':
          return 'badgeWarning' as const;
        case 'leave':
          return 'badgeInfo' as const;
        case 'absent':
          return 'badgeDanger' as const;
        default:
          return 'borderCenter' as const;
      }
    };

    const getMethodText = (method?: string) => {
      switch (method) {
        case 'faceId':
          return 'Face ID';
        case 'fingerprint':
          return 'Vân tay';
        case 'card':
          return 'Thẻ RFID';
        case 'manual':
          return 'Thủ công';
        default:
          return '—';
      }
    };

    const sheet: ExcelSheetDefinition = {
      name: `Chấm công ${date}`,
      columns: [
        { width: 7 },   // STT
        { width: 14 },  // Mã NV
        { width: 26 },  // Họ và Tên
        { width: 28 },  // Phòng Ban
        { width: 13 },  // Ngày
        { width: 16 },  // Giờ vào
        { width: 15 },  // Hình thức vào
        { width: 22 },  // Thiết bị vào
        { width: 16 },  // Giờ ra
        { width: 15 },  // Hình thức ra
        { width: 22 },  // Thiết bị ra
        { width: 14 },  // Phút muộn
        { width: 14 },  // Phút về sớm
        { width: 18 },  // Trạng thái
        { width: 30 }   // Ghi chú
      ],
      rows: [
        // Quốc hiệu & Tiêu ngữ
        {
          cells: [
            {
              value: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
              style: 'subtitle',
              colSpan: 15
            }
          ]
        },
        {
          cells: [
            {
              value: 'Độc lập - Tự do - Hạnh phúc',
              style: 'subtitle',
              colSpan: 15
            }
          ]
        },
        { cells: [] },
        // Tiêu đề báo cáo
        {
          height: 28,
          cells: [
            {
              value: 'BẢNG CHẤM CÔNG CÁN BỘ NHÂN SỰ HÀNG NGÀY',
              style: 'title',
              colSpan: 15
            }
          ]
        },
        {
          cells: [
            {
              value: `Cơ quan / Đơn vị: ${orgName}  |  Ngày chấm công: ${date}`,
              style: 'subtitle',
              colSpan: 15
            }
          ]
        },
        {
          cells: [
            {
              value: `Thời điểm xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`,
              style: 'subtitle',
              colSpan: 15
            }
          ]
        },
        { cells: [] },
        // Header bảng
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Mã NV', style: 'header' },
            { value: 'Họ và Tên', style: 'header' },
            { value: 'Phòng Ban', style: 'header' },
            { value: 'Ngày', style: 'header' },
            { value: 'Giờ vào (Check-in)', style: 'header' },
            { value: 'Hình thức vào', style: 'header' },
            { value: 'Thiết bị vào', style: 'header' },
            { value: 'Giờ ra (Check-out)', style: 'header' },
            { value: 'Hình thức ra', style: 'header' },
            { value: 'Thiết bị ra', style: 'header' },
            { value: 'Đi muộn (phút)', style: 'header' },
            { value: 'Về sớm (phút)', style: 'header' },
            { value: 'Trạng thái', style: 'header' },
            { value: 'Ghi chú', style: 'header' }
          ]
        },
        // Danh sách cán bộ
        ...records.map((r, idx) => ({
          height: 21,
          cells: [
            { value: idx + 1, style: 'borderCenter' as const },
            { value: r.employeeCode, style: 'boldBorderCenter' as const },
            { value: r.employeeName, style: 'boldBorderLeft' as const },
            { value: r.departmentName, style: 'borderLeft' as const },
            { value: r.date, style: 'borderCenter' as const },
            { value: r.checkInTime || '—', style: 'borderCenter' as const },
            { value: getMethodText(r.checkInMethod), style: 'borderCenter' as const },
            { value: r.checkInDevice || '—', style: 'borderLeft' as const },
            { value: r.checkOutTime || '—', style: 'borderCenter' as const },
            { value: getMethodText(r.checkOutMethod), style: 'borderCenter' as const },
            { value: r.checkOutDevice || '—', style: 'borderLeft' as const },
            { value: r.lateMinutes || 0, style: 'borderRight' as const },
            { value: r.earlyLeaveMinutes || 0, style: 'borderRight' as const },
            { value: getStatusText(r.status), style: getStatusStyle(r.status) },
            { value: r.note || '', style: 'borderLeft' as const }
          ]
        })),
        { cells: [] },
        // Dòng tổng kết
        {
          height: 22,
          cells: [
            {
              value: `TỔNG CỘNG: ${records.length} CÁN BỘ  (Đúng giờ: ${records.filter(r => r.status === 'on_time').length} | Đi muộn: ${records.filter(r => r.status === 'late' || r.status === 'late_and_early').length} | Nghỉ phép: ${records.filter(r => r.status === 'leave').length} | Vắng mặt: ${records.filter(r => r.status === 'absent').length})`,
              style: 'subHeader',
              colSpan: 15
            }
          ]
        }
      ]
    };

    downloadExcelFile(sheet, `Bang_Cham_Cong_Ngay_${date}.xlsx`);
  }
}

export const dailyAttendanceService = new DailyAttendanceService();
