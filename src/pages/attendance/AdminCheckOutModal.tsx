import React, { useState, useEffect } from 'react';
import {
  PopupModal,
  TextField,
  SelectField,
  InlineNotice,
  toast
} from '../../design-system';
import { DailyAttendanceRecord } from '../../types/attendance';
import { dailyAttendanceService } from '../../services/attendance';
import { authService } from '../../services/auth';

export interface AdminCheckOutModalProps {
  open: boolean;
  onClose: () => void;
  record: DailyAttendanceRecord | null;
  tenantId: string;
  onSuccess: (updated: DailyAttendanceRecord) => void;
}

const REASON_OPTIONS = [
  { value: 'Cán bộ quên quét vân tay / Face ID khi ra về', label: 'Cán bộ quên quét vân tay / Face ID khi ra về' },
  { value: 'Xác nhận hoàn thành ca làm việc theo báo cáo Trưởng phòng', label: 'Xác nhận hoàn thành ca làm việc theo báo cáo Trưởng phòng' },
  { value: 'Đi công tác địa bàn về thẳng, không quay lại cơ quan', label: 'Đi công tác địa bàn về thẳng, không quay lại cơ quan' },
  { value: 'Sự cố kết nối thiết bị cổng lúc tan ca', label: 'Sự cố kết nối thiết bị cổng lúc tan ca' },
  { value: 'Khác', label: 'Lý do giải trình khác...' }
];

export const AdminCheckOutModal: React.FC<AdminCheckOutModalProps> = ({
  open,
  onClose,
  record,
  tenantId,
  onSuccess
}) => {
  if (!record) return null;

  const session = authService.getCurrentSession();
  const defaultAdminName = session?.tenant.contactName
    ? `${session.tenant.contactName} (Quản trị viên)`
    : session?.tenant.orgName
    ? `${session.tenant.orgName} (Quản trị viên)`
    : 'Quản trị viên hệ thống';

  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0].value);
  const [customReason, setCustomReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setCheckOutTime(record.checkOutTime || '17:00');
      setSelectedReason(REASON_OPTIONS[0].value);
      setCustomReason('');
      setNote('');
      setError(null);
    }
  }, [record, open]);

  const handleSubmit = async () => {
    if (!checkOutTime.trim()) {
      setError('Vui lòng nhập giờ về hợp lệ (định dạng HH:mm).');
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(checkOutTime.trim())) {
      setError('Định dạng giờ không hợp lệ. Vui lòng nhập theo chuẩn HH:mm (ví dụ: 17:00).');
      return;
    }

    const finalReason = selectedReason === 'Khác'
      ? (customReason.trim() || 'Lý do khác do Quản trị viên ghi nhận')
      : selectedReason;

    try {
      setSubmitting(true);
      setError(null);

      const updated = await dailyAttendanceService.adminCheckOut({
        tenantId,
        employeeId: record.employeeId,
        date: record.date,
        checkOutTime: checkOutTime.trim(),
        reason: finalReason,
        adminName: defaultAdminName,
        note: note.trim() || undefined
      });

      toast.success(
        `Đã bổ sung giờ về (Check-out bù) lúc ${checkOutTime.trim()} cho cán bộ ${record.employeeName} và lưu vết kiểm toán.`
      );
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Lỗi khi thực hiện check-out bù:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi bổ sung giờ về.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PopupModal
      open={open}
      onClose={onClose}
      title="Bổ Sung Giờ Về (Check-out Bù)"
      description="Xác nhận giờ tan ca cho cán bộ quên quét thiết bị ngày hôm trước và lưu vết kiểm toán minh bạch."
      width={540}
      primaryAction={{
        label: submitting ? 'Đang lưu vết...' : 'Xác nhận & Lưu vết Check-out',
        onClick: handleSubmit,
        disabled: submitting
      }}
      secondaryAction={{
        label: 'Hủy bỏ',
        onClick: onClose,
        disabled: submitting
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {/* Thông tin cán bộ */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            border: '1px solid var(--border-neutral-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 15,
                flexShrink: 0
              }}
            >
              {record.avatarUrl ? (
                <img
                  src={record.avatarUrl}
                  alt={record.employeeName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                record.employeeName.charAt(0)
              )}
            </div>
            <div>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                {record.employeeName}{' '}
                <span className="body-xs" style={{ color: 'var(--text-subtle)', fontWeight: 'normal' }}>
                  ({record.employeeCode})
                </span>
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                {record.departmentName}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              Ngày: <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{record.date}</span>
            </div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: 2 }}>
              Giờ vào: <span style={{ fontWeight: 600, color: 'var(--semantic-success)' }}>{record.checkInTime || '—'}</span>
            </div>
          </div>
        </div>

        {error && (
          <InlineNotice tone="danger">
            {error}
          </InlineNotice>
        )}

        {/* Input giờ về & nút chọn nhanh */}
        <div>
          <label className="body-xs-medium" style={{ color: 'var(--text-heading)', display: 'block', marginBottom: 6 }}>
            Giờ về bổ sung (Check-out Time) <span style={{ color: 'var(--semantic-danger)' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: 140 }}>
              <TextField
                value={checkOutTime}
                onChange={setCheckOutTime}
                placeholder="17:00"
                aria-label="Giờ về bổ sung"
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCheckOutTime('17:00')}
                className="body-xs"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-6)',
                  border: checkOutTime === '17:00' ? '1px solid var(--primary-500)' : '1px solid var(--border-default)',
                  backgroundColor: checkOutTime === '17:00' ? 'var(--primary-50)' : 'var(--bg-canvas)',
                  color: checkOutTime === '17:00' ? 'var(--primary-700)' : 'var(--text-body)',
                  cursor: 'pointer',
                  fontWeight: checkOutTime === '17:00' ? 600 : 400
                }}
              >
                17:00 (Tan ca chuẩn)
              </button>
              <button
                type="button"
                onClick={() => setCheckOutTime('17:30')}
                className="body-xs"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-6)',
                  border: checkOutTime === '17:30' ? '1px solid var(--primary-500)' : '1px solid var(--border-default)',
                  backgroundColor: checkOutTime === '17:30' ? 'var(--primary-50)' : 'var(--bg-canvas)',
                  color: checkOutTime === '17:30' ? 'var(--primary-700)' : 'var(--text-body)',
                  cursor: 'pointer',
                  fontWeight: checkOutTime === '17:30' ? 600 : 400
                }}
              >
                17:30
              </button>
              <button
                type="button"
                onClick={() => setCheckOutTime('18:00')}
                className="body-xs"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-6)',
                  border: checkOutTime === '18:00' ? '1px solid var(--primary-500)' : '1px solid var(--border-default)',
                  backgroundColor: checkOutTime === '18:00' ? 'var(--primary-50)' : 'var(--bg-canvas)',
                  color: checkOutTime === '18:00' ? 'var(--primary-700)' : 'var(--text-body)',
                  cursor: 'pointer',
                  fontWeight: checkOutTime === '18:00' ? 600 : 400
                }}
              >
                18:00 (Tăng ca)
              </button>
            </div>
          </div>
        </div>

        {/* Lý do bổ sung */}
        <div>
          <SelectField
            label="Lý do bổ sung giờ về *"
            value={selectedReason}
            onChange={setSelectedReason}
            options={REASON_OPTIONS}
          />

          {selectedReason === 'Khác' && (
            <div style={{ marginTop: '8px' }}>
              <TextField
                value={customReason}
                onChange={setCustomReason}
                placeholder="Nhập lý do giải trình cụ thể..."
                aria-label="Lý do giải trình cụ thể"
              />
            </div>
          )}
        </div>

        {/* Ghi chú diễn giải thêm */}
        <div>
          <label className="body-xs-medium" style={{ color: 'var(--text-heading)', display: 'block', marginBottom: 6 }}>
            Ghi chú đối soát thêm (Tùy chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Đã đối chiếu camera giám sát hành lang lúc 17:05..."
            rows={2}
            className="body-sm"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-6)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-heading)',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Người thực hiện & cảnh báo kiểm toán */}
        <InlineNotice tone="info">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="body-xs-bold" style={{ color: 'var(--primary-800)' }}>
              Lưu vết kiểm toán an toàn
            </div>
            <span>
              Thao tác này được thực hiện bởi <b>{defaultAdminName}</b> vào lúc <b>{new Date().toLocaleTimeString('vi-VN')} hôm nay</b>.
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
              Hệ thống sẽ lưu vết kiểm toán (Audit Log) vĩnh viễn trong hồ sơ chấm công để phục vụ đối soát, thanh tra và báo cáo tổng hợp.
            </span>
          </div>
        </InlineNotice>
      </div>
    </PopupModal>
  );
};
