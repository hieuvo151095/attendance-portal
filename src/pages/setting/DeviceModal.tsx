import React, { useState, useEffect } from 'react';
import { SideSheet, TextField, SelectField, InlineNotice, Icon } from '../../design-system';
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
  const [isAttendance, setIsAttendance] = useState(true);
  const [isMeeting, setIsMeeting] = useState(false);
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
      const isAtt =
        deviceToEdit.attendanceType === 'attendance' ||
        deviceToEdit.attendanceType === 'both' ||
        deviceToEdit.attendanceTypes?.includes('attendance');
      const isMtg =
        deviceToEdit.attendanceType === 'meeting' ||
        deviceToEdit.attendanceType === 'both' ||
        deviceToEdit.attendanceTypes?.includes('meeting');
      setIsAttendance(Boolean(isAtt));
      setIsMeeting(Boolean(isMtg));
      setStatus(deviceToEdit.status);
      setLocation(deviceToEdit.location || '');
    } else {
      setName('');
      setCode('');
      setIsAttendance(true);
      setIsMeeting(false);
      setStatus('active');
      setLocation('');
    }
  }, [open, deviceToEdit]);

  const isTypeValid = isAttendance || isMeeting;
  const isFormValid = Boolean(name.trim() && code.trim() && isTypeValid);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);

    const resolvedType: CameraAttendanceType =
      isAttendance && isMeeting ? 'both' : isAttendance ? 'attendance' : 'meeting';
    const resolvedTypes: ('attendance' | 'meeting')[] = [
      ...(isAttendance ? ['attendance' as const] : []),
      ...(isMeeting ? ['meeting' as const] : [])
    ];

    try {
      if (isEditing && deviceToEdit) {
        const updateDto: UpdateCameraDeviceDTO = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          attendanceType: resolvedType,
          attendanceTypes: resolvedTypes,
          status,
          location: location.trim()
        };
        await cameraDeviceService.updateDevice(tenantId, deviceToEdit.id, updateDto);
      } else {
        const createDto: CreateCameraDeviceDTO = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          attendanceType: resolvedType,
          attendanceTypes: resolvedTypes,
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
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0' }}
      >
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

        {/* Loại điểm danh áp dụng (Hỗ trợ 1 hoặc cả 2 loại hình điểm danh) */}
        <div>
          <label
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: '8px', color: 'var(--text-heading)' }}
          >
            Loại điểm danh áp dụng <span style={{ color: 'var(--danger-500, #ef4444)' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Tùy chọn 1: Chấm công */}
            <label
              htmlFor="device-type-attendance"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-8, 8px)',
                border: `1.5px solid ${isAttendance ? 'var(--eco-blue-strong, #0070ce)' : 'var(--border-default)'}`,
                backgroundColor: isAttendance ? 'var(--eco-blue-50, #eff6ff)' : 'var(--bg-surface)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                id="device-type-attendance"
                data-testid="device-type-attendance-checkbox"
                checked={isAttendance}
                onChange={(e) => setIsAttendance(e.target.checked)}
                disabled={isSubmitting}
                style={{ width: 16, height: 16, accentColor: 'var(--eco-blue-strong, #0070ce)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    color: '#0070ce',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Icon name="clock" size={12} color="#0070ce" />
                  Chấm công
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Điểm danh ca làm việc hàng ngày của cán bộ nhân viên
                </span>
              </div>
            </label>

            {/* Tùy chọn 2: Cuộc họp */}
            <label
              htmlFor="device-type-meeting"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-8, 8px)',
                border: `1.5px solid ${isMeeting ? 'var(--primary-600, #7c3aed)' : 'var(--border-default)'}`,
                backgroundColor: isMeeting ? '#f5f3ff' : 'var(--bg-surface)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                id="device-type-meeting"
                data-testid="device-type-meeting-checkbox"
                checked={isMeeting}
                onChange={(e) => setIsMeeting(e.target.checked)}
                disabled={isSubmitting}
                style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#f5f3ff',
                    color: '#7c3aed',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Icon name="calendar-days" size={12} color="#7c3aed" />
                  Cuộc họp
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Điểm danh hội nghị, cuộc họp và phòng họp cơ quan
                </span>
              </div>
            </label>
          </div>
          <div style={{ marginTop: '6px' }}>
            <span
              className="body-xs"
              style={{
                color: !isTypeValid ? 'var(--status-danger, #ef4444)' : 'var(--text-subtle)',
                fontWeight: !isTypeValid ? 600 : 400
              }}
            >
              {!isTypeValid
                ? '⚠️ Vui lòng chọn ít nhất một loại hình điểm danh áp dụng.'
                : 'Có thể tích chọn cả 2 loại hình để thiết bị phục vụ đồng thời cho cả Chấm công và Cuộc họp.'}
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
