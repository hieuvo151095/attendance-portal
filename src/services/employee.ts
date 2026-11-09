import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CameraFaceSyncPayload,
  CameraSyncBatchResult,
  ImportEmployeeRow,
  ImportEmployeeResult,
  ImportErrorRow,
  ImportValidationResult,
  ImportErrorCode
} from '../types/employee';
import { authService } from './auth';
import { departmentService } from './department';

const STORAGE_EMPLOYEES_KEY = 'finviet_attendance_employees';

// Pre-seeded employees with realistic Vietnamese non-school data
export const INITIAL_EMPLOYEES: Employee[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001)
  {
    id: 'emp-ubnd-01',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-001',
    fullName: 'Đ/c Nguyễn Văn An',
    identityNumber: '079085001234',
    position: 'Chủ tịch UBND Phường',
    departmentId: 'dept-ubnd-01',
    email: 'an.nguyen@ubnd.gov.vn',
    phoneNumber: '0903 111 222',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:30:00Z',
      faceScore: 98.6
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:30:00Z'
  },
  {
    id: 'emp-ubnd-02',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-002',
    fullName: 'Bà Phạm Thị Cúc',
    identityNumber: '079186002345',
    position: 'Trưởng bộ phận Địa chính - Xây dựng',
    departmentId: 'dept-ubnd-02',
    email: 'cuc.pham@ubnd.gov.vn',
    phoneNumber: '0903 333 444',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:35:00Z',
      faceScore: 99.1
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:35:00Z'
  },
  {
    id: 'emp-ubnd-03',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-003',
    fullName: 'Ông Hoàng Văn Đức',
    identityNumber: '079090003456',
    position: 'Cán bộ Tư pháp - Hộ tịch',
    departmentId: 'dept-ubnd-03',
    email: 'duc.hoang@ubnd.gov.vn',
    phoneNumber: '0903 555 666',
    gender: 'male',
    faceIdStatus: 'pending', // Chưa có ảnh chân dung
    fingerprintStatus: 'pending', // Chưa đồng bộ camera, chưa thể lấy mẫu vân tay
    allowedMethods: {
      faceId: false,
      fingerprint: false,
      card: false
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-ubnd-04',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-004',
    fullName: 'Bà Lê Thị Thảo',
    identityNumber: '079188004567',
    position: 'Chánh Văn phòng HĐND & UBND',
    departmentId: 'dept-ubnd-01',
    email: 'thao.le@ubnd.gov.vn',
    phoneNumber: '0908 123 456',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:40:00Z',
      faceScore: 98.9
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:40:00Z'
  },
  {
    id: 'emp-ubnd-05',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-005',
    fullName: 'Ông Trần Minh Tuấn',
    identityNumber: '079092005678',
    position: 'Phó Chánh Văn phòng HĐND & UBND',
    departmentId: 'dept-ubnd-01',
    email: 'tuan.tran@ubnd.gov.vn',
    phoneNumber: '0908 234 567',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:42:00Z',
      faceScore: 97.8
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:42:00Z'
  },
  {
    id: 'emp-ubnd-06',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-006',
    fullName: 'Bà Nguyễn Hoàng Mai',
    identityNumber: '079195006789',
    position: 'Chuyên viên CNTT & Cải cách hành chính',
    departmentId: 'dept-ubnd-01',
    email: 'mai.nguyen@ubnd.gov.vn',
    phoneNumber: '0908 345 678',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:45:00Z',
      faceScore: 99.4
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:45:00Z'
  },
  {
    id: 'emp-ubnd-07',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-007',
    fullName: 'Ông Vũ Quốc Bảo',
    identityNumber: '079089007890',
    position: 'Phó Trưởng bộ phận Địa chính - Xây dựng',
    departmentId: 'dept-ubnd-02',
    email: 'bao.vu@ubnd.gov.vn',
    phoneNumber: '0908 456 789',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:50:00Z',
      faceScore: 98.2
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:50:00Z'
  },
  {
    id: 'emp-ubnd-08',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-008',
    fullName: 'Ông Đỗ Quang Huy',
    identityNumber: '079093008901',
    position: 'Cán bộ Quản lý Trật tự Đô thị',
    departmentId: 'dept-ubnd-02',
    email: 'huy.do@ubnd.gov.vn',
    phoneNumber: '0908 567 890',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:52:00Z',
      faceScore: 97.5
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:52:00Z'
  },
  {
    id: 'emp-ubnd-09',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-009',
    fullName: 'Bà Đặng Kim Ngân',
    identityNumber: '079196009012',
    position: 'Chuyên viên Thẩm định Hồ sơ Đất đai',
    departmentId: 'dept-ubnd-02',
    email: 'ngan.dang@ubnd.gov.vn',
    phoneNumber: '0908 678 901',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:55:00Z',
      faceScore: 98.7
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: false
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:55:00Z'
  },
  {
    id: 'emp-ubnd-10',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-010',
    fullName: 'Ông Bùi Tiến Dũng',
    identityNumber: '079094010123',
    position: 'Cán bộ Giám sát Công trình & Môi trường',
    departmentId: 'dept-ubnd-02',
    email: 'dung.bui@ubnd.gov.vn',
    phoneNumber: '0908 789 012',
    gender: 'male',
    faceIdStatus: 'pending',
    fingerprintStatus: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    allowedMethods: {
      faceId: true,
      fingerprint: false,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-ubnd-11',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-011',
    fullName: 'Bà Trần Thu Trang',
    identityNumber: '079191011234',
    position: 'Trưởng bộ phận Tư pháp - Hộ tịch',
    departmentId: 'dept-ubnd-03',
    email: 'trang.tran@ubnd.gov.vn',
    phoneNumber: '0908 890 123',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:00:00Z',
      faceScore: 99.0
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z'
  },
  {
    id: 'emp-ubnd-12',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-012',
    fullName: 'Ông Phan Trọng Nghĩa',
    identityNumber: '079095012345',
    position: 'Cán bộ Chứng thực & Tiếp nhận Hồ sơ Sao y',
    departmentId: 'dept-ubnd-03',
    email: 'nghia.phan@ubnd.gov.vn',
    phoneNumber: '0908 901 234',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:05:00Z',
      faceScore: 98.4
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:05:00Z'
  },
  {
    id: 'emp-ubnd-13',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-013',
    fullName: 'Bà Võ Bích Hạnh',
    identityNumber: '079197013456',
    position: 'Chuyên viên Hòa giải & Trợ giúp Pháp lý',
    departmentId: 'dept-ubnd-03',
    email: 'hanh.vo@ubnd.gov.vn',
    phoneNumber: '0909 012 345',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:10:00Z',
      faceScore: 97.9
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:10:00Z'
  },
  {
    id: 'emp-ubnd-14',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-014',
    fullName: 'Đ/c Lê Văn Hùng',
    identityNumber: '079087014567',
    position: 'Chỉ huy trưởng Ban Chỉ huy Quân sự',
    departmentId: 'dept-ubnd-04',
    email: 'hung.le@ubnd.gov.vn',
    phoneNumber: '0903 777 888',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:15:00Z',
      faceScore: 98.5
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:15:00Z'
  },
  {
    id: 'emp-ubnd-15',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-015',
    fullName: 'Ông Mai Xuân Nam',
    identityNumber: '079096015678',
    position: 'Chỉ huy phó Ban Chỉ huy Quân sự',
    departmentId: 'dept-ubnd-04',
    email: 'nam.mai@ubnd.gov.vn',
    phoneNumber: '0909 123 456',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:18:00Z',
      faceScore: 99.1
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:18:00Z'
  },
  {
    id: 'emp-ubnd-16',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-016',
    fullName: 'Ông Nguyễn Quốc Khánh',
    identityNumber: '079097016789',
    position: 'Cán bộ Tác chiến & Huấn luyện Dân quân',
    departmentId: 'dept-ubnd-04',
    email: 'khanh.nguyen@ubnd.gov.vn',
    phoneNumber: '0909 234 567',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:20:00Z',
      faceScore: 98.0
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:20:00Z'
  },
  {
    id: 'emp-ubnd-17',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-017',
    fullName: 'Ông Đoàn Gia Huy',
    identityNumber: '079098017890',
    position: 'Cán bộ Động viên Tuyển quân & Hậu cần',
    departmentId: 'dept-ubnd-04',
    email: 'huy.doan@ubnd.gov.vn',
    phoneNumber: '0909 345 678',
    gender: 'male',
    faceIdStatus: 'pending',
    fingerprintStatus: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150',
    allowedMethods: {
      faceId: true,
      fingerprint: false,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-ubnd-18',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-018',
    fullName: 'Trung tá Trần Quốc Toản',
    identityNumber: '079084018901',
    position: 'Trưởng Công An Phường',
    departmentId: 'dept-ubnd-05',
    email: 'toan.tran@ubnd.gov.vn',
    phoneNumber: '0903 999 000',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:25:00Z',
      faceScore: 99.5
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:25:00Z'
  },
  {
    id: 'emp-ubnd-19',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-019',
    fullName: 'Thiếu tá Đinh Trọng Hưng',
    identityNumber: '079088019012',
    position: 'Phó Trưởng Công An Phường phụ trách Trật tự',
    departmentId: 'dept-ubnd-05',
    email: 'hung.dinh@ubnd.gov.vn',
    phoneNumber: '0909 456 789',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:30:00Z',
      faceScore: 98.8
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:30:00Z'
  },
  {
    id: 'emp-ubnd-20',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-020',
    fullName: 'Đại úy Nguyễn Thanh Tùng',
    identityNumber: '079091020123',
    position: 'Cảnh sát Khu vực Cụm 1',
    departmentId: 'dept-ubnd-05',
    email: 'tung.nguyen@ubnd.gov.vn',
    phoneNumber: '0909 567 890',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:32:00Z',
      faceScore: 98.3
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:32:00Z'
  },
  {
    id: 'emp-ubnd-21',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-021',
    fullName: 'Thượng úy Bùi Thị Thu Vân',
    identityNumber: '079193021234',
    position: 'Cán bộ Quản lý Hành chính & Dữ liệu Dân cư VNeID',
    departmentId: 'dept-ubnd-05',
    email: 'van.bui@ubnd.gov.vn',
    phoneNumber: '0909 678 901',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:35:00Z',
      faceScore: 99.2
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:35:00Z'
  },
  {
    id: 'emp-ubnd-22',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-022',
    fullName: 'Trung úy Tạ Đình Khang',
    identityNumber: '079099022345',
    position: 'Cán bộ Cảnh sát Phòng chống Tội phạm',
    departmentId: 'dept-ubnd-05',
    email: 'khang.ta@ubnd.gov.vn',
    phoneNumber: '0909 789 012',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:38:00Z',
      faceScore: 97.9
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:38:00Z'
  },
  {
    id: 'emp-ubnd-23',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-023',
    fullName: 'Thượng sĩ Ngô Văn Kiên',
    identityNumber: '079100023456',
    position: 'Cán bộ Trực ban Chỉ huy Công An Phường',
    departmentId: 'dept-ubnd-05',
    email: 'kien.ngo@ubnd.gov.vn',
    phoneNumber: '0909 890 123',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:40:00Z',
      faceScore: 98.1
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: false
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:40:00Z'
  },
  {
    id: 'emp-ubnd-24',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-024',
    fullName: 'Bà Lâm Thanh Trúc',
    identityNumber: '079198024567',
    position: 'Kế toán trưởng & Quản lý Tài chính Đơn vị',
    departmentId: 'dept-ubnd-01',
    email: 'truc.lam@ubnd.gov.vn',
    phoneNumber: '0909 901 234',
    gender: 'female',
    faceIdStatus: 'pending',
    fingerprintStatus: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=150',
    allowedMethods: {
      faceId: true,
      fingerprint: false,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-ubnd-25',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-025',
    fullName: 'Ông Đỗ Việt Hùng',
    identityNumber: '079101025678',
    position: 'Cán bộ Tiếp nhận & Trả kết quả (Bộ phận Một Cửa)',
    departmentId: 'dept-ubnd-01',
    email: 'hung.doviet@ubnd.gov.vn',
    phoneNumber: '0909 999 888',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T09:45:00Z',
      faceScore: 99.0
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:45:00Z'
  },

  // 2. Nhà Máy Tân Bình (tenant-factory-002)
  {
    id: 'emp-tb-01',
    tenantId: 'tenant-factory-002',
    employeeCode: 'TB-001',
    fullName: 'Bà Trần Thị Mai',
    identityNumber: '079180004567',
    position: 'Giám đốc Điều hành Nhà máy',
    departmentId: 'dept-tb-01',
    email: 'mai.tran@tanbinhfactory.com',
    phoneNumber: '0918 111 222',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Cổng Chính Nhà Máy',
      syncedAt: '2026-11-01T07:15:00Z',
      faceScore: 97.8
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-tb-02',
    tenantId: 'tenant-factory-002',
    employeeCode: 'TB-002',
    fullName: 'Ông Lê Văn Hải',
    identityNumber: '079083005678',
    position: 'Quản đốc Phân xưởng May 1',
    departmentId: 'dept-tb-03',
    email: 'hai.le@tanbinhfactory.com',
    phoneNumber: '0918 555 666',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Phân Xưởng May',
      syncedAt: '2026-11-01T07:20:00Z',
      faceScore: 98.9
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 3. Bệnh Viện Nhi Đồng 1 (tenant-hospital-003)
  {
    id: 'emp-bv-01',
    tenantId: 'tenant-hospital-003',
    employeeCode: 'BV-001',
    fullName: 'BS. Lê Hoàng Nam',
    identityNumber: '079081006789',
    position: 'Phó Giám Đốc KHTH',
    departmentId: 'dept-bv-01',
    email: 'nam.le@nhidong1.org.vn',
    phoneNumber: '0922 111 222',
    gender: 'male',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Khu Hành Chính BV',
      syncedAt: '2026-11-01T08:00:00Z',
      faceScore: 99.4
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-bv-02',
    tenantId: 'tenant-hospital-003',
    employeeCode: 'BV-002',
    fullName: 'BSCK2 Nguyễn Thị Huệ',
    identityNumber: '079184007890',
    position: 'Trưởng Khoa Khám Bệnh',
    departmentId: 'dept-bv-02',
    email: 'hue.nguyen@nhidong1.org.vn',
    phoneNumber: '0922 333 444',
    gender: 'female',
    faceIdStatus: 'enrolled',
    fingerprintStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813590-785a97576442?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Khu Khám Bệnh',
      syncedAt: '2026-11-01T08:10:00Z',
      faceScore: 98.7
    },
    allowedMethods: {
      faceId: true,
      fingerprint: true,
      card: true
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  }
];

class EmployeeService {
  private memoryEmployees: Map<string, Employee> = new Map();

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
      const stored = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      } else {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            let changed = false;
            // Quy tắc bất biến: Nhân sự chưa đồng bộ đến Camera thì không thể có vân tay
            list.forEach((e: Employee) => {
              if (!e.cameraSyncInfo) {
                if (e.fingerprintStatus === 'enrolled' || e.allowedMethods?.fingerprint) {
                  e.fingerprintStatus = 'pending';
                  if (e.allowedMethods) {
                    e.allowedMethods.fingerprint = false;
                  }
                  changed = true;
                }
              }
              if (e.id === 'emp-ubnd-03') {
                if (e.fingerprintStatus === 'enrolled' || e.allowedMethods?.fingerprint || e.allowedMethods?.faceId) {
                  e.fingerprintStatus = 'pending';
                  e.allowedMethods = { faceId: false, fingerprint: false, card: false };
                  changed = true;
                }
              }
            });

            if (list.length < INITIAL_EMPLOYEES.length || changed) {
              localStorage.setItem(
                STORAGE_EMPLOYEES_KEY,
                JSON.stringify(list.length < INITIAL_EMPLOYEES.length ? INITIAL_EMPLOYEES : list)
              );
            }
          } else {
            localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
          }
        } catch {
          localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
        }
      }
    } else {
      INITIAL_EMPLOYEES.forEach((e) => this.memoryEmployees.set(e.id, { ...e }));
    }
  }

  private getAllEmployees(): Employee[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return INITIAL_EMPLOYEES;
        }
      }
      return INITIAL_EMPLOYEES;
    }
    return Array.from(this.memoryEmployees.values());
  }

  private saveEmployees(employees: Employee[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(employees));
    } else {
      this.memoryEmployees.clear();
      employees.forEach((e) => this.memoryEmployees.set(e.id, e));
    }
  }

  /**
   * Lấy danh sách nhân viên thuộc đơn vị (kèm bộ lọc phòng ban, tìm kiếm, trạng thái Face ID)
   */
  public async getEmployeesByTenant(
    tenantId: string,
    filters?: { departmentId?: string; search?: string; faceIdStatus?: 'enrolled' | 'pending' }
  ): Promise<Employee[]> {
    authService.assertTenantAccess(tenantId);
    let list = this.getAllEmployees().filter((e) => e.tenantId === tenantId);

    if (filters?.departmentId) {
      list = list.filter((e) => e.departmentId === filters.departmentId);
    }

    if (filters?.faceIdStatus) {
      list = list.filter((e) => e.faceIdStatus === filters.faceIdStatus);
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.employeeCode.toLowerCase().includes(term) ||
          e.fullName.toLowerCase().includes(term) ||
          e.identityNumber.toLowerCase().includes(term) ||
          (e.position && e.position.toLowerCase().includes(term)) ||
          (e.email && e.email.toLowerCase().includes(term)) ||
          (e.phoneNumber && e.phoneNumber.toLowerCase().includes(term))
      );
    }

    return list.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  }

  public async getEmployeeById(tenantId: string, id: string): Promise<Employee> {
    authService.assertTenantAccess(tenantId);
    const emp = this.getAllEmployees().find((e) => e.id === id && e.tenantId === tenantId);
    if (!emp) {
      throw new Error('Không tìm thấy thông tin nhân viên');
    }
    return emp;
  }

  /**
   * Thêm nhân sự mới (ORG-02)
   */
  public async createEmployee(tenantId: string, dto: CreateEmployeeDTO): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const employeeCode = dto.employeeCode.trim().toUpperCase();
    const fullName = dto.fullName.trim();
    const identityNumber = dto.identityNumber.trim();
    const position = dto.position.trim();

    if (!employeeCode) throw new Error('Mã nhân viên (Employee ID) không được để trống');
    if (!fullName) throw new Error('Họ và tên nhân viên không được để trống');
    if (!identityNumber) throw new Error('Số CCCD / Hộ chiếu không được để trống');
    if (!dto.departmentId) throw new Error('Vui lòng chọn phòng ban trực thuộc');

    // Kiểm tra phòng ban có thuộc cùng đơn vị không
    const depts = await departmentService.getDepartmentsByTenant(tenantId);
    const deptExists = depts.some((d) => d.id === dto.departmentId);
    if (!deptExists) throw new Error('Phòng ban được chọn không thuộc cơ quan đơn vị này');

    const all = this.getAllEmployees();

    // 1. Kiểm tra tính duy nhất của mã nhân viên trong cùng đơn vị
    if (all.some((e) => e.tenantId === tenantId && e.employeeCode.toUpperCase() === employeeCode)) {
      throw new Error(`Mã nhân viên "${employeeCode}" đã tồn tại trong cơ quan`);
    }

    // 2. Kiểm tra tính duy nhất của số CCCD/Hộ chiếu trong cùng đơn vị
    if (all.some((e) => e.tenantId === tenantId && e.identityNumber === identityNumber)) {
      throw new Error(`Số CCCD "${identityNumber}" đã được sử dụng cho nhân viên khác`);
    }

    const now = new Date().toISOString();
    const hasAvatar = Boolean(dto.avatarUrl && dto.avatarUrl.trim());
    const newEmp: Employee = {
      id: `emp-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}`,
      tenantId,
      employeeCode,
      fullName,
      identityNumber,
      position,
      departmentId: dto.departmentId,
      email: dto.email?.trim() || '',
      phoneNumber: dto.phoneNumber?.trim() || '',
      gender: dto.gender || 'male',
      faceIdStatus: hasAvatar ? 'enrolled' : (dto.faceIdStatus || 'pending'),
      fingerprintStatus: 'pending', // Nhân sự mới chưa đồng bộ đến Camera thì chưa thể có vân tay
      avatarUrl: dto.avatarUrl?.trim(),
      cameraSyncInfo: undefined,
      allowedMethods: {
        faceId: hasAvatar && (dto.allowedMethods?.faceId !== false),
        fingerprint: false, // Bắt buộc false khi chưa đồng bộ camera và chưa lấy mẫu vân tay
        card: false
      },
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    all.push(newEmp);
    this.saveEmployees(all);

    return newEmp;
  }

  /**
   * Cập nhật thông tin nhân sự (ORG-02)
   */
  public async updateEmployee(
    tenantId: string,
    id: string,
    dto: UpdateEmployeeDTO
  ): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === id && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy hồ sơ nhân viên cần cập nhật');

    const emp = all[index];

    if (dto.employeeCode !== undefined) {
      const code = dto.employeeCode.trim().toUpperCase();
      if (!code) throw new Error('Mã nhân viên không được để trống');
      const dup = all.some(
        (e) => e.tenantId === tenantId && e.id !== id && e.employeeCode.toUpperCase() === code
      );
      if (dup) throw new Error(`Mã nhân viên "${code}" đã tồn tại`);
      emp.employeeCode = code;
    }

    if (dto.fullName !== undefined) {
      const name = dto.fullName.trim();
      if (!name) throw new Error('Họ tên không được để trống');
      emp.fullName = name;
    }

    if (dto.identityNumber !== undefined) {
      const cccd = dto.identityNumber.trim();
      if (!cccd) throw new Error('Số CCCD không được để trống');
      const dup = all.some(
        (e) => e.tenantId === tenantId && e.id !== id && e.identityNumber === cccd
      );
      if (dup) throw new Error(`Số CCCD "${cccd}" đã được sử dụng`);
      emp.identityNumber = cccd;
    }

    if (dto.departmentId !== undefined) {
      const depts = await departmentService.getDepartmentsByTenant(tenantId);
      if (!depts.some((d) => d.id === dto.departmentId)) {
        throw new Error('Phòng ban không tồn tại trong cơ quan');
      }
      emp.departmentId = dto.departmentId;
    }

    if (dto.position !== undefined) emp.position = dto.position.trim();
    if (dto.email !== undefined) emp.email = dto.email.trim();
    if (dto.phoneNumber !== undefined) emp.phoneNumber = dto.phoneNumber.trim();
    if (dto.gender !== undefined) emp.gender = dto.gender;
    if (dto.avatarUrl !== undefined) {
      emp.avatarUrl = dto.avatarUrl;
      emp.faceIdStatus = dto.avatarUrl ? 'enrolled' : 'pending';
    }
    if (dto.faceIdStatus !== undefined) emp.faceIdStatus = dto.faceIdStatus;
    if (dto.fingerprintStatus !== undefined) emp.fingerprintStatus = dto.fingerprintStatus;
    if (dto.allowedMethods !== undefined) {
      emp.allowedMethods = { ...dto.allowedMethods };
    }
    // Quy tắc: Nếu chưa đồng bộ đến Camera thì không thể có vân tay
    if (!emp.cameraSyncInfo) {
      emp.fingerprintStatus = 'pending';
      if (emp.allowedMethods) {
        emp.allowedMethods.fingerprint = false;
      }
    }
    if (dto.status !== undefined) emp.status = dto.status;

    emp.updatedAt = new Date().toISOString();
    all[index] = emp;
    this.saveEmployees(all);

    return emp;
  }

  /**
   * Xóa nhân sự
   */
  public async deleteEmployee(tenantId: string, id: string): Promise<void> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === id && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy nhân viên cần xóa');

    all.splice(index, 1);
    this.saveEmployees(all);
  }

  /**
   * ĐỒNG BỘ ẢNH CHÂN DUNG & DỮ LIỆU FACE ID TỪ CAMERA SANG PORTAL (ORG-02)
   * Yêu cầu từ PO: "Về ảnh chân dung, sẽ được chuyển từ camera sang.
   * Người dùng khi thiết lập face id trên camera sẽ được lưu trữ trên portal."
   */
  public async syncFaceIdFromCamera(
    tenantId: string,
    payload: CameraFaceSyncPayload
  ): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === payload.employeeId && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy nhân viên để đồng bộ dữ liệu Face ID');

    const emp = all[index];
    const now = new Date().toISOString();

    emp.avatarUrl = payload.avatarUrl;
    emp.faceIdStatus = 'enrolled';
    emp.cameraSyncInfo = {
      deviceName: payload.deviceName || 'Camera AI Hikvision Cổng 1',
      syncedAt: now,
      faceScore: payload.faceScore || 98.8
    };
    emp.updatedAt = now;

    all[index] = emp;
    this.saveEmployees(all);

    return emp;
  }

  /**
   * ĐỒNG BỘ DỮ LIỆU ĐẾN CAMERA AI (2-Step Camera Sync Flow)
   * Đồng bộ danh sách cán bộ đã chọn xuống các thiết bị Camera AI đang hoạt động.
   */
  public async syncEmployeesToCamera(
    tenantId: string,
    employeeIds: string[],
    targetDeviceNames?: string[]
  ): Promise<CameraSyncBatchResult> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllEmployees();
    const now = new Date().toISOString();
    const targetName =
      targetDeviceNames && targetDeviceNames.length > 0
        ? targetDeviceNames.join(', ')
        : 'Hệ thống Camera AI Finviet (5 thiết bị)';

    let syncedCount = 0;
    const syncedEmployeeIds: string[] = [];

    for (const id of employeeIds) {
      const idx = all.findIndex((e) => e.id === id && e.tenantId === tenantId);
      if (idx !== -1) {
        const emp = all[idx];
        emp.cameraSyncInfo = {
          deviceName: targetName,
          syncedAt: now,
          faceScore: 99.2
        };
        emp.faceIdStatus = 'enrolled';
        if (emp.avatarUrl) {
          emp.allowedMethods = {
            faceId: true,
            fingerprint: emp.allowedMethods?.fingerprint ?? false,
            card: emp.allowedMethods?.card ?? false
          };
        }
        emp.updatedAt = now;
        all[idx] = emp;
        syncedCount++;
        syncedEmployeeIds.push(id);
      }
    }

    this.saveEmployees(all);

    return {
      syncedCount,
      deviceCount: targetDeviceNames?.length || 5,
      syncedEmployeeIds,
      syncedAt: now
    };
  }

  /**
   * Lấy danh sách cán bộ chưa đồng bộ dữ liệu đến Camera AI
   */
  public async getUnsyncedEmployees(tenantId: string): Promise<Employee[]> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllEmployees();
    return all.filter((e) => e.tenantId === tenantId && !e.cameraSyncInfo);
  }

  /**
   * Import danh sách nhân viên từ file Excel
   */
  public async importFromExcel(
    tenantId: string,
    rows: ImportEmployeeRow[]
  ): Promise<ImportEmployeeResult> {
    authService.assertTenantAccess(tenantId);

    const depts = await departmentService.getDepartmentsByTenant(tenantId);
    const all = this.getAllEmployees();

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIdx = i + 1;

      try {
        const code = row.employeeCode.trim().toUpperCase();
        const fullName = row.fullName.trim();
        const identityNumber = row.identityNumber.trim();

        if (!code || !fullName || !identityNumber) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Thiếu thông tin bắt buộc (mã, họ tên hoặc CCCD)`);
          continue;
        }

        // Kiểm tra trùng mã
        if (all.some((e) => e.tenantId === tenantId && e.employeeCode.toUpperCase() === code)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Mã nhân viên "${code}" đã tồn tại`);
          continue;
        }

        // Kiểm tra trùng CCCD
        if (all.some((e) => e.tenantId === tenantId && e.identityNumber === identityNumber)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Số CCCD "${identityNumber}" đã tồn tại`);
          continue;
        }

        // Kiểm tra trùng email
        const email = row.email?.trim().toLowerCase();
        if (email && all.some((e) => e.tenantId === tenantId && (e.email || '').toLowerCase() === email)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Email "${row.email?.trim()}" đã tồn tại`);
          continue;
        }

        // Kiểm tra trùng số điện thoại
        const phone = row.phoneNumber?.replace(/\s+/g, '');
        if (phone && all.some((e) => e.tenantId === tenantId && (e.phoneNumber || '').replace(/\s+/g, '') === phone)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Số điện thoại "${row.phoneNumber?.trim()}" đã tồn tại`);
          continue;
        }

        // Tìm phòng ban theo mã hoặc tên
        const deptTerm = row.departmentCodeOrName.trim().toLowerCase();
        let targetDept = depts.find(
          (d) =>
            d.code.toLowerCase() === deptTerm ||
            d.name.toLowerCase() === deptTerm ||
            d.name.toLowerCase().includes(deptTerm)
        );

        if (!targetDept) {
          // Mặc định gắn vào phòng ban đầu tiên nếu không khớp
          targetDept = depts[0];
        }

        const now = new Date().toISOString();
        const newEmp: Employee = {
          id: `emp-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}-${i}`,
          tenantId,
          employeeCode: code,
          fullName,
          identityNumber,
          position: row.position?.trim() || 'Nhân viên',
          departmentId: targetDept ? targetDept.id : '',
          email: row.email?.trim() || '',
          phoneNumber: row.phoneNumber?.trim() || '',
          gender: 'male',
          faceIdStatus: 'pending', // Mặc định chờ lấy mẫu tại Camera
          status: 'active',
          createdAt: now,
          updatedAt: now
        };

        all.push(newEmp);
        importedCount++;
      } catch (err: unknown) {
        skippedCount++;
        const msg = err instanceof Error ? err.message : 'Lỗi xử lý hàng dữ liệu';
        errors.push(`Dòng ${rowIdx}: ${msg}`);
      }
    }

    this.saveEmployees(all);

    return {
      total: rows.length,
      importedCount,
      skippedCount,
      errors
    };
  }

  public async validateExcelRows(
    tenantId: string,
    rows: ImportEmployeeRow[]
  ): Promise<ImportValidationResult> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllEmployees().filter((e) => e.tenantId === tenantId);

    const validRows: ImportEmployeeRow[] = [];
    const errorRows: ImportErrorRow[] = [];

    // Track duplicates within the batch
    const seenCodes = new Set<string>();
    const seenIdentities = new Set<string>();
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIdx = i + 1;
      const rowErrors: string[] = [];
      const errorTypes: ImportErrorCode[] = [];
      let conflictWith: string | undefined = undefined;

      const code = (row.employeeCode || '').trim().toUpperCase();
      const fullName = (row.fullName || '').trim();
      const identityNumber = (row.identityNumber || '').trim();
      const email = (row.email || '').trim().toLowerCase();
      const phoneClean = (row.phoneNumber || '').replace(/\s+/g, '');

      if (!code || !fullName || !identityNumber) {
        rowErrors.push('Thiếu thông tin bắt buộc (mã NV, họ tên hoặc số CCCD)');
        errorTypes.push('missing_required');
      }

      // Check duplicate code
      if (code) {
        const existingEmp = all.find((e) => e.employeeCode.toUpperCase() === code);
        if (existingEmp) {
          rowErrors.push(`Trùng mã NV "${code}" (đã thuộc về cán bộ ${existingEmp.fullName})`);
          errorTypes.push('duplicate_code');
          conflictWith = existingEmp.fullName;
        } else if (seenCodes.has(code)) {
          rowErrors.push(`Trùng lặp mã NV "${code}" với hàng khác trong tệp`);
          errorTypes.push('duplicate_code');
        } else {
          seenCodes.add(code);
        }
      }

      // Check duplicate identityNumber (CCCD)
      if (identityNumber) {
        const existingEmp = all.find((e) => e.identityNumber === identityNumber);
        if (existingEmp) {
          rowErrors.push(`Trùng số CCCD "${identityNumber}" (đã thuộc về cán bộ ${existingEmp.fullName})`);
          errorTypes.push('duplicate_identity');
          conflictWith = conflictWith || existingEmp.fullName;
        } else if (seenIdentities.has(identityNumber)) {
          rowErrors.push(`Trùng lặp số CCCD "${identityNumber}" với hàng khác trong tệp`);
          errorTypes.push('duplicate_identity');
        } else {
          seenIdentities.add(identityNumber);
        }
      }

      // Check duplicate email
      if (email) {
        const existingEmp = all.find((e) => (e.email || '').toLowerCase() === email);
        if (existingEmp) {
          rowErrors.push(`Trùng email "${row.email?.trim()}" (đã thuộc về cán bộ ${existingEmp.fullName})`);
          errorTypes.push('duplicate_email');
          conflictWith = conflictWith || existingEmp.fullName;
        } else if (seenEmails.has(email)) {
          rowErrors.push(`Trùng lặp email "${row.email?.trim()}" với hàng khác trong tệp`);
          errorTypes.push('duplicate_email');
        } else {
          seenEmails.add(email);
        }
      }

      // Check duplicate phone number
      if (phoneClean) {
        const existingEmp = all.find((e) => (e.phoneNumber || '').replace(/\s+/g, '') === phoneClean);
        if (existingEmp) {
          rowErrors.push(`Trùng số điện thoại "${row.phoneNumber?.trim()}" (đã thuộc về cán bộ ${existingEmp.fullName})`);
          errorTypes.push('duplicate_phone');
          conflictWith = conflictWith || existingEmp.fullName;
        } else if (seenPhones.has(phoneClean)) {
          rowErrors.push(`Trùng lặp số điện thoại "${row.phoneNumber?.trim()}" với hàng khác trong tệp`);
          errorTypes.push('duplicate_phone');
        } else {
          seenPhones.add(phoneClean);
        }
      }

      if (rowErrors.length > 0) {
        errorRows.push({
          ...row,
          rowNumber: rowIdx,
          errors: rowErrors,
          errorTypes,
          conflictWith
        });
      } else {
        validRows.push(row);
      }
    }

    return {
      total: rows.length,
      validRows,
      errorRows
    };
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    }
    this.memoryEmployees.clear();
    INITIAL_EMPLOYEES.forEach((e) => this.memoryEmployees.set(e.id, { ...e }));
  }
}

export const employeeService = new EmployeeService();
