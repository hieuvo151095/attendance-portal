import React, { useState, useEffect } from 'react';
import { SideSheet, TextField, SelectField, InlineNotice } from '../../design-system';
import type { CameraDevice, CreateCameraDeviceDTO, UpdateCameraDeviceDTO, CameraAttendanceType, CameraDeviceStatus } from '../../types/device';
import { cameraDeviceService } from '../../services/device';

export interface DeviceModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  deviceToEdit?: CameraDevice | null;
  onSuccess: () => void;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  open,
  onClose,
  tenantId,
  deviceToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(deviceToEdit);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attendanceType, setAttendanceType] = useState<CameraAttendanceType>('attendance');
  const [status, setStatus] = useState<CameraDeviceStatus>('active');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (deviceToEdit) {
      setName(deviceToEdit.name);
      setCode(deviceToEdit.code);
      setAttendanceType(deviceToEdit.attendanceType);
      setStatus(deviceToEdit.status);
      setLocation(deviceToEdit.location || '');
    } else {
      setName('');
      setCode('');
      setAttendanceType('attendance');
      setStatus('active');
      setLocation('');
    }
  }, [open, deviceToEdit]);

  const isFormValid = Boolean(name.trim() && code.trim());

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing && deviceToEdit) {
        const updateDto: UpdateCameraDeviceDTO = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          attendanceType,
          status,
          location: location.trim()
        };
        await cameraDeviceService.updateDevice(tenantId, deviceToEdit.id, updateDto);
      } else {
        const createDto: CreateCameraDeviceDTO = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          attendanceType,
          status,
          location: location.trim()
        };
        await cameraDeviceService.createDevice(tenantId, createDto);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu thông tin thiết bị.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendanceTypeOptions = [
    { value: 'attendance', label: 'Chấm công (Điểm danh ca làm việc hằng ngày)' },
    { value: 'meeting', label: 'Cuộc họp (Điểm danh hội nghị & phòng họp)' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'locked', label: 'Tạm khoá' }
  ];

  return (
    <SideSheet
      open={open}
      title={isEditing ? 'Chỉnh sửa thông tin thiết bị' : 'Tạo mới thiết bị'}
      description="Khai báo thông tin thiết bị Camera nhận diện và loại điểm danh áp dụng."
      icon="camera"
      width={520}
      onClose={onClose}
      primaryAction={{
        label: isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo mới',
        icon: isEditing ? 'check' : 'plus',
        onClick: () => handleSubmit(),
        disabled: !isFormValid || isSubmitting
      }}
      secondaryAction={{
        label: 'Huỷ',
        onClick: onClose,
        disabled: isSubmitting
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <InlineNotice tone="danger" label={error} />}

        <div>
          <TextField
            id="device-name-input"
            label="Tên thiết bị"
            required
            value={name}
            onChange={(val) => setName(val)}
            placeholder="Nhập tên thiết bị (ví dụ: Camera Cổng Tiếp Dân)"
            disabled={isSubmitting}
          />
          <div style={{ marginTop: '4px' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Tên gợi nhớ để phân biệt vị trí và mục đích sử dụng.
            </span>
          </div>
        </div>

        <div>
          <TextField
            id="device-code-input"
            label="Mã thiết bị"
            required
            value={code}
            onChange={(val) => setCode(val)}
            placeholder="Nhập mã thiết bị (ví dụ: CAM-099842)"
            disabled={isSubmitting}
          />
          <div style={{ marginTop: '4px' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Mã định danh duy nhất của thiết bị trong hệ thống.
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="device-attendance-type"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}
          >
            Loại điểm danh áp dụng <span style={{ color: 'var(--danger-500, #ef4444)' }}>*</span>
          </label>
          <SelectField
            id="device-attendance-type"
            value={attendanceType}
            onChange={(val) => setAttendanceType(val as CameraAttendanceType)}
            options={attendanceTypeOptions}
            disabled={isSubmitting}
          />
          <div style={{ marginTop: '4px' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Khi chọn loại nào, luồng dữ liệu nhận diện của thiết bị sẽ tự động gán cho nghiệp vụ đó.
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="device-status-select"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}
          >
            Trạng thái hoạt động <span style={{ color: 'var(--danger-500, #ef4444)' }}>*</span>
          </label>
          <SelectField
            id="device-status-select"
            value={status}
            onChange={(val) => setStatus(val as CameraDeviceStatus)}
            options={statusOptions}
            disabled={isSubmitting}
          />
          <div style={{ marginTop: '4px' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Thiết bị ở trạng thái Tạm khoá sẽ không ghi nhận dữ liệu điểm danh vào hệ thống.
            </span>
          </div>
        </div>

        <div>
          <TextField
            id="device-location-input"
            label="Vị trí lắp đặt"
            value={location}
            onChange={(val) => setLocation(val)}
            placeholder="Ví dụ: Cổng chính trụ sở UBND, Tầng 1"
            disabled={isSubmitting}
          />
          <div style={{ marginTop: '4px' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Ghi chú vị trí vật lý để kỹ thuật viên dễ bảo trì.
            </span>
          </div>
        </div>
      </form>
    </SideSheet>
  );
};
