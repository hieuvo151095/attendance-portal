export type CameraAttendanceType = 'attendance' | 'meeting'; // 'Chấm công' | 'Cuộc họp'
export type CameraDeviceStatus = 'active' | 'locked'; // 'Hoạt động' | 'Tạm khoá'

export interface CameraDevice {
  id: string;
  tenantId: string;
  name: string; // Tên thiết bị (admin add)
  code: string; // Mã thiết bị (admin add)
  attendanceType: CameraAttendanceType; // Loại điểm danh (Chấm công or Cuộc họp)
  status: CameraDeviceStatus; // Trạng thái (Hoạt động or Tạm khoá)
  location?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCameraDeviceDTO {
  name: string;
  code: string;
  attendanceType: CameraAttendanceType;
  status?: CameraDeviceStatus;
  location?: string;
}

export interface UpdateCameraDeviceDTO {
  name?: string;
  code?: string;
  attendanceType?: CameraAttendanceType;
  status?: CameraDeviceStatus;
  location?: string;
}
