export type CameraAttendanceType = 'attendance' | 'meeting' | 'both'; // 'Chấm công' | 'Cuộc họp' | 'Cả hai'
export type CameraDeviceStatus = 'active' | 'locked'; // 'Hoạt động' | 'Tạm khoá'
export type CameraConnectionStatus = 'online' | 'offline'; // 'Đang kết nối' | 'Mất kết nối'

export interface CameraDevice {
  id: string;
  tenantId: string;
  name: string; // Tên thiết bị (admin add)
  code: string; // Mã thiết bị (admin add)
  attendanceType: CameraAttendanceType; // Loại điểm danh (Chấm công, Cuộc họp, hoặc Cả hai)
  attendanceTypes?: ('attendance' | 'meeting')[]; // Mảng các loại hình áp dụng
  status: CameraDeviceStatus; // Trạng thái thiết bị (Hoạt động or Tạm khoá) — admin toggle
  connectionStatus: CameraConnectionStatus; // Trạng thái kết nối (tự động, không chỉnh sửa)
  location?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCameraDeviceDTO {
  name: string;
  code: string;
  attendanceType: CameraAttendanceType;
  attendanceTypes?: ('attendance' | 'meeting')[];
  status?: CameraDeviceStatus;
  location?: string;
}

export interface UpdateCameraDeviceDTO {
  name?: string;
  code?: string;
  attendanceType?: CameraAttendanceType;
  attendanceTypes?: ('attendance' | 'meeting')[];
  status?: CameraDeviceStatus;
  location?: string;
}
