export interface CameraSyncInfo {
  deviceName: string;
  syncedAt: string;
  faceScore?: number; // Điểm số khớp mẫu khuôn mặt từ Camera (0-100)
}

export interface AllowedAttendanceMethods {
  faceId: boolean;      // Nhận diện khuôn mặt (Face ID)
  fingerprint: boolean; // Quét vân tay
  card: boolean;        // Quẹt thẻ nhân viên (RFID/NFC)
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string; // Mã nhân viên duy nhất (Employee ID)
  fullName: string; // Họ tên nhân viên
  identityNumber: string; // Số CCCD / Hộ chiếu
  position: string; // Chức danh / Vị trí công tác
  departmentId: string; // ID phòng ban trực thuộc
  email?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  faceIdStatus: 'enrolled' | 'pending'; // Trạng thái Face ID (Đã lấy mẫu từ Camera vs Chờ thiết lập tại Camera)
  fingerprintStatus?: 'enrolled' | 'pending'; // Trạng thái Vân tay (Đã lấy mẫu thiết bị vs Chờ đăng ký)
  avatarUrl?: string; // Ảnh chân dung nhận diện được camera Hikvision chuyển sang portal
  cameraSyncInfo?: CameraSyncInfo; // Thông tin thiết bị camera đồng bộ
  allowedMethods?: AllowedAttendanceMethods; // 3 hình thức điểm danh cho phép (Face ID, Vân tay, Thẻ)
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDTO {
  employeeCode: string;
  fullName: string;
  identityNumber: string;
  position: string;
  departmentId: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  faceIdStatus?: 'enrolled' | 'pending';
  fingerprintStatus?: 'enrolled' | 'pending';
  allowedMethods?: AllowedAttendanceMethods;
}

export interface UpdateEmployeeDTO {
  employeeCode?: string;
  fullName?: string;
  identityNumber?: string;
  position?: string;
  departmentId?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  faceIdStatus?: 'enrolled' | 'pending';
  fingerprintStatus?: 'enrolled' | 'pending';
  allowedMethods?: AllowedAttendanceMethods;
  status?: 'active' | 'inactive';
}

export interface CameraFaceSyncPayload {
  employeeId: string;
  avatarUrl: string;
  deviceName?: string;
  faceScore?: number;
}

export interface CameraSyncFailureItem {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  reason: string;
}

export interface CameraSyncBatchResult {
  totalRequested: number;
  syncedCount: number;
  failedCount: number;
  deviceCount: number;
  syncedEmployeeIds: string[];
  failedItems?: CameraSyncFailureItem[];
  syncedAt: string;
}

export interface ImportEmployeeRow {
  employeeCode: string;
  fullName: string;
  identityNumber: string;
  position: string;
  departmentCodeOrName: string;
  email?: string;
  phoneNumber?: string;
}

export type ImportErrorCode =
  | 'duplicate_code'
  | 'duplicate_identity'
  | 'duplicate_email'
  | 'duplicate_phone'
  | 'missing_required';

export interface ImportErrorRow extends ImportEmployeeRow {
  rowNumber: number;
  errors: string[];
  errorTypes: ImportErrorCode[];
  conflictWith?: string;
}

export interface ImportValidationResult {
  total: number;
  validRows: ImportEmployeeRow[];
  errorRows: ImportErrorRow[];
}

export interface ImportEmployeeResult {
  total: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
