export interface CameraSyncInfo {
  deviceName: string;
  syncedAt: string;
  faceScore?: number; // Điểm số khớp mẫu khuôn mặt từ Camera (0-100)
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
  avatarUrl?: string; // Ảnh chân dung nhận diện được camera Hikvision chuyển sang portal
  cameraSyncInfo?: CameraSyncInfo; // Thông tin thiết bị camera đồng bộ
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
  status?: 'active' | 'inactive';
}

export interface CameraFaceSyncPayload {
  employeeId: string;
  avatarUrl: string;
  deviceName?: string;
  faceScore?: number;
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

export interface ImportEmployeeResult {
  total: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}
