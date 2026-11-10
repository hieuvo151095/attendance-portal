import React, { useState, useEffect } from 'react';
import { SideSheet, TextField, SelectField, InlineNotice, Icon } from '../../design-system';
import { Employee } from '../../types/employee';
import { AttendanceMethodType } from '../../types/attendance';
import { employeeService } from '../../services/employee';
import { dailyAttendanceService } from '../../services/attendance';

export interface QuickScanModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  currentDate: string;
  onSuccess: () => void;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({
  open,
  onClose,
  tenantId,
  currentDate,
  onSuccess
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [scanType, setScanType] = useState<'check_in' | 'check_out'>('check_in');
  const [scanMethod, setScanMethod] = useState<AttendanceMethodType>('manual');
  const [scanTime, setScanTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);

    // Mặc định thời gian là giờ hiện tại
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setScanTime(`${h}:${m}`);

    employeeService.getEmployeesByTenant(tenantId).then((emps) => {
      setEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmployeeId(emps[0].id);
      }
    });
  }, [open, tenantId]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId) {
      setError('Vui lòng chọn cán bộ nhân sự.');
      return;
    }
    if (!scanTime.trim()) {
      setError('Vui lòng nhập giờ quét điểm danh (HH:mm).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await dailyAttendanceService.recordAttendance({
        tenantId,
        employeeId: selectedEmployeeId,
        date: currentDate,
        time: scanTime.trim(),
        type: scanType,
        method: scanMethod
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi ghi nhận điểm danh';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.employeeCode} - ${e.fullName} (${e.position})`
  }));

  const scanTypeOptions = [
    { value: 'check_in', label: 'Vào cơ quan đầu ngày (Check-in)' },
    { value: 'check_out', label: 'Tan ca ra về (Check-out)' }
  ];

  const methodOptions = [
    { value: 'manual', label: 'Ghi nhận thủ công từ Quản trị viên' }
  ];

  return (
    <SideSheet
      open={open}
      title="Quét Điểm Danh Nhanh"
      description="Ghi nhận lượt vào/ra thủ công từ Quản trị viên cho cán bộ tại cơ quan."
      icon="camera"
      width={500}
      onClose={onClose}
      primaryAction={{
        label: isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận quét điểm danh',
        icon: 'check',
        onClick: handleSubmit,
        disabled: isSubmitting || employees.length === 0 || !selectedEmployeeId
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: onClose,
        disabled: isSubmitting
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && <InlineNotice tone="danger" label={error} />}

        <div>
          <label
            htmlFor="scan-emp"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
          >
            Chọn cán bộ nhân sự <span style={{ color: 'var(--semantic-danger)' }}>*</span>
          </label>
          <SelectField
            id="scan-emp"
            options={employeeOptions.length > 0 ? employeeOptions : ['Chưa có nhân viên']}
            value={selectedEmployeeId}
            onChange={(val) => setSelectedEmployeeId(val)}
            disabled={isSubmitting || employeeOptions.length === 0}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <div>
            <label
              htmlFor="scan-type"
              className="body-sm-medium"
              style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
            >
              Loại sự kiện <span style={{ color: 'var(--semantic-danger)' }}>*</span>
            </label>
            <SelectField
              id="scan-type"
              options={scanTypeOptions}
              value={scanType}
              onChange={(val) => setScanType(val as 'check_in' | 'check_out')}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            />
          </div>

          <TextField
            id="scan-time"
            label="Thời điểm quét (HH:mm)"
            required
            placeholder="VD: 07:15, 07:45"
            value={scanTime}
            onChange={(val) => setScanTime(val)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="scan-method"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
          >
            Phương thức xác thực <span style={{ color: 'var(--semantic-danger)' }}>*</span>
          </label>
          <SelectField
            id="scan-method"
            options={methodOptions}
            value={scanMethod}
            onChange={(val) => setScanMethod(val as AttendanceMethodType)}
            disabled={isSubmitting}
            style={{ width: '100%' }}
          />
        </div>

        <div
          className="body-xs"
          style={{
            padding: 'var(--space-12)',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-8)'
          }}
        >
          <Icon name="info-circle" size={16} style={{ color: 'var(--primary-600)', marginTop: 2, flexShrink: 0 }} />
          <span>
            Hệ thống sẽ tự động đối soát thời điểm quét với <b>Khung giờ ca làm việc</b> đã cấu hình để tính số phút đi muộn hoặc về sớm và cập nhật nhãn trạng thái tức thì.
          </span>
        </div>
      </div>
    </SideSheet>
  );
};
