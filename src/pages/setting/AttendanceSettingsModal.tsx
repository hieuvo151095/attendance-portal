import React, { useState, useEffect } from 'react';
import { PopupModal, Button, InlineNotice, Icon } from '../../design-system';
import { AttendanceSettings } from '../../types/setting';
import { attendanceSettingService } from '../../services/setting';

export interface AttendanceSettingsModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onSaved?: (settings: AttendanceSettings) => void;
}

export const AttendanceSettingsModal: React.FC<AttendanceSettingsModalProps> = ({
  open,
  onClose,
  tenantId,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Daily Work Hours State
  const [workStartTime, setWorkStartTime] = useState('07:00');
  const [workEndTime, setWorkEndTime] = useState('16:00');
  const [morningStartTime, setMorningStartTime] = useState('07:30');
  const [morningEndTime, setMorningEndTime] = useState('11:30');
  const [afternoonStartTime, setAfternoonStartTime] = useState('13:30');
  const [afternoonEndTime, setAfternoonEndTime] = useState('17:00');
  const [workCheckInGraceMinutes, setWorkCheckInGraceMinutes] = useState(30);
  const [workCheckOutGraceMinutes, setWorkCheckOutGraceMinutes] = useState(30);
  const [targetOnTimeRate, setTargetOnTimeRate] = useState(90);

  // Default Meeting Grace Periods State
  const [defaultMeetingCheckInGraceMinutes, setDefaultMeetingCheckInGraceMinutes] = useState(5);
  const [defaultMeetingCheckOutGraceMinutes, setDefaultMeetingCheckOutGraceMinutes] = useState(5);
  const [meetingEarlyOpenMinutes, setMeetingEarlyOpenMinutes] = useState(15);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setLoading(true);

    attendanceSettingService
      .getSettings(tenantId)
      .then((settings) => {
        setWorkStartTime(settings.workStartTime || '07:00');
        setWorkEndTime(settings.workEndTime || '16:00');
        setMorningStartTime(settings.morningStartTime || '07:30');
        setMorningEndTime(settings.morningEndTime || '11:30');
        setAfternoonStartTime(settings.afternoonStartTime || '13:30');
        setAfternoonEndTime(settings.afternoonEndTime || '17:00');
        setWorkCheckInGraceMinutes(settings.workCheckInGraceMinutes ?? 30);
        setWorkCheckOutGraceMinutes(settings.workCheckOutGraceMinutes ?? 30);
        setTargetOnTimeRate(settings.targetOnTimeRate ?? 90);
        setDefaultMeetingCheckInGraceMinutes(settings.defaultMeetingCheckInGraceMinutes ?? 5);
        setDefaultMeetingCheckOutGraceMinutes(settings.defaultMeetingCheckOutGraceMinutes ?? 5);
        setMeetingEarlyOpenMinutes(settings.meetingEarlyOpenMinutes ?? 15);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải thiết lập thời gian');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, tenantId]);

  // Tính toán thời gian thực giới hạn đi làm
  const calculateLateThresholdTime = (startTimeStr: string, graceMin: number): string => {
    const parts = startTimeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const total = parts[0] * 60 + parts[1] + graceMin;
      const h = Math.floor(total / 60) % 24;
      const m = total % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return '--:--';
  };

  const calculateEarlyLeaveThresholdTime = (endTimeStr: string, graceMin: number): string => {
    const parts = endTimeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const total = parts[0] * 60 + parts[1] - graceMin;
      const safe = total < 0 ? 0 : total;
      const h = Math.floor(safe / 60) % 24;
      const m = safe % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return '--:--';
  };

  const lateThreshold = calculateLateThresholdTime(workStartTime, workCheckInGraceMinutes);
  const earlyLeaveThreshold = calculateEarlyLeaveThresholdTime(workEndTime, workCheckOutGraceMinutes);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await attendanceSettingService.updateSettings(tenantId, {
        workStartTime,
        workEndTime,
        morningStartTime,
        morningEndTime,
        afternoonStartTime,
        afternoonEndTime,
        workCheckInGraceMinutes,
        workCheckOutGraceMinutes,
        targetOnTimeRate,
        defaultMeetingCheckInGraceMinutes,
        defaultMeetingCheckOutGraceMinutes,
        meetingEarlyOpenMinutes
      });
      setSuccess(true);
      if (onSaved) onSaved(updated);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi lưu thiết lập');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWorkStartTime('07:00');
    setWorkEndTime('16:00');
    setWorkCheckInGraceMinutes(30);
    setWorkCheckOutGraceMinutes(30);
    setTargetOnTimeRate(90);
    setDefaultMeetingCheckInGraceMinutes(5);
    setDefaultMeetingCheckOutGraceMinutes(5);
    setMeetingEarlyOpenMinutes(15);
  };

  return (
    <PopupModal
      open={open}
      onClose={onClose}
      title="Cấu hình Thời gian Làm việc & Điểm danh"
      description="Thiết lập khung giờ làm việc hàng ngày, ngưỡng tính đi muộn / về sớm và dung sai điểm danh cuộc họp cho cơ quan."
      width={720}
      primaryAction={{
        label: saving ? 'Đang lưu...' : 'Lưu cấu hình',
        onClick: handleSave,
        disabled: loading || saving
      }}
      secondaryAction={{
        label: 'Đóng',
        onClick: onClose,
        disabled: saving
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
        {error && <InlineNotice tone="danger" label={error} />}
        {success && (
          <InlineNotice
            tone="success"
            label="Đã lưu cấu hình thời gian làm việc và dung sai điểm danh thành công."
          />
        )}

        {/* Section 1: Giờ làm việc hàng ngày của cơ quan */}
        <div
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-8)',
            padding: 'var(--space-16)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-12)' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-6)',
                backgroundColor: 'var(--eco-blue-subtle)',
                color: 'var(--eco-blue-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="business-time" size={14} />
            </div>
            <div>
              <h4 className="body-sm-bold" style={{ margin: 0, color: 'var(--text-heading)' }}>
                1. Khung giờ làm việc hàng ngày tại cơ quan
              </h4>
              <p className="body-xs" style={{ margin: 0, color: 'var(--text-subtle)' }}>
                Áp dụng cho cán bộ, nhân viên check-in/out hằng ngày tại trụ sở UBND.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
            <div>
              <label
                htmlFor="work-start-time"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Giờ bắt đầu làm việc (Ca sáng)
              </label>
              <input
                id="work-start-time"
                type="time"
                className="ecomd-input body-sm"
                value={workStartTime}
                onChange={(e) => {
                  setWorkStartTime(e.target.value);
                  setMorningStartTime(e.target.value);
                }}
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="work-end-time"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Giờ tan ca (Ca chiều)
              </label>
              <input
                id="work-end-time"
                type="time"
                className="ecomd-input body-sm"
                value={workEndTime}
                onChange={(e) => {
                  setWorkEndTime(e.target.value);
                  setAfternoonEndTime(e.target.value);
                }}
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', marginTop: 'var(--space-12)' }}>
            <div>
              <label
                htmlFor="morning-end-time"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Giờ nghỉ trưa (Hết ca sáng)
              </label>
              <input
                id="morning-end-time"
                type="time"
                className="ecomd-input body-sm"
                value={morningEndTime}
                onChange={(e) => setMorningEndTime(e.target.value)}
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="afternoon-start-time"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Giờ vào ca chiều
              </label>
              <input
                id="afternoon-start-time"
                type="time"
                className="ecomd-input body-sm"
                value={afternoonStartTime}
                onChange={(e) => setAfternoonStartTime(e.target.value)}
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
          </div>

          {/* Grace periods for daily work */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-16)',
              marginTop: 'var(--space-12)'
            }}
          >
            <div>
              <label
                htmlFor="work-checkin-grace"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Cho phép vào trễ tối đa (phút)
              </label>
              <input
                id="work-checkin-grace"
                type="number"
                min="0"
                max="180"
                className="ecomd-input body-sm"
                value={workCheckInGraceMinutes}
                onChange={(e) =>
                  setWorkCheckInGraceMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="work-checkout-grace"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Cho phép về sớm tối đa (phút)
              </label>
              <input
                id="work-checkout-grace"
                type="number"
                min="0"
                max="180"
                className="ecomd-input body-sm"
                value={workCheckOutGraceMinutes}
                onChange={(e) =>
                  setWorkCheckOutGraceMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', marginTop: 'var(--space-12)' }}>
            <div>
              <label
                htmlFor="target-ontime-rate-modal"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Mục tiêu chuẩn cơ quan (% đúng giờ)
              </label>
              <input
                id="target-ontime-rate-modal"
                type="number"
                min="0"
                max="100"
                className="ecomd-input body-sm"
                value={targetOnTimeRate}
                onChange={(e) =>
                  setTargetOnTimeRate(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)', lineHeight: 1.4, marginTop: 'var(--space-16)' }}>
                Chỉ tiêu chuyên cần theo dõi tỷ lệ đúng giờ của các phòng ban (mặc định 90%).
              </span>
            </div>
          </div>

          {/* Feedback note for daily work */}
          <div
            style={{
              marginTop: 'var(--space-12)',
              padding: 'var(--space-10) var(--space-12)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-6)',
              border: '1px dashed var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <div className="body-xs" style={{ color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="clock" size={12} />
              <span>
                Cán bộ được phép check-in trễ nhất lúc <b>{lateThreshold}</b> (sau giờ này sẽ bị tính đi trễ).
              </span>
            </div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="door-open" size={12} />
              <span>
                Được phép check-out ra về từ lúc <b>{earlyLeaveThreshold}</b> (nếu về sớm hơn sẽ bị ghi nhận là về sớm).
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Dung sai điểm danh cuộc họp */}
        <div
          style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-8)',
            padding: 'var(--space-16)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-12)' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-6)',
                backgroundColor: 'var(--eco-purple-subtle, rgba(147, 51, 234, 0.1))',
                color: 'var(--eco-purple-strong, #7e22ce)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="calendar-check" size={14} />
            </div>
            <div>
              <h4 className="body-sm-bold" style={{ margin: 0, color: 'var(--text-heading)' }}>
                2. Quy tắc điểm danh cuộc họp cơ quan (Mặc định)
              </h4>
              <p className="body-xs" style={{ margin: 0, color: 'var(--text-subtle)' }}>
                Tự động áp dụng khi tạo cuộc họp mới; người tạo họp vẫn có thể tùy biến số phút cho từng sự kiện.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-12)' }}>
            <div>
              <label
                htmlFor="default-meeting-checkin-grace"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Vào trễ mặc định (phút)
              </label>
              <input
                id="default-meeting-checkin-grace"
                type="number"
                min="0"
                max="60"
                className="ecomd-input body-sm"
                value={defaultMeetingCheckInGraceMinutes}
                onChange={(e) =>
                  setDefaultMeetingCheckInGraceMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="default-meeting-checkout-grace"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Về sớm mặc định (phút)
              </label>
              <input
                id="default-meeting-checkout-grace"
                type="number"
                min="0"
                max="60"
                className="ecomd-input body-sm"
                value={defaultMeetingCheckOutGraceMinutes}
                onChange={(e) =>
                  setDefaultMeetingCheckOutGraceMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="meeting-early-open"
                className="body-xs-medium"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Đón tiếp trước giờ (phút)
              </label>
              <input
                id="meeting-early-open"
                type="number"
                min="0"
                max="60"
                className="ecomd-input body-sm"
                value={meetingEarlyOpenMinutes}
                onChange={(e) =>
                  setMeetingEarlyOpenMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={saving || loading}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--space-12)',
              padding: 'var(--space-10) var(--space-12)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-6)',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-subtle)'
            }}
            className="body-xs"
          >
            💡 <b>Ví dụ:</b> Cuộc họp bắt đầu lúc 09:00 và kết thúc lúc 10:00: Camera AI mở đón tiếp từ{' '}
            <b>08:45</b>, đại biểu điểm danh trễ nhất lúc <b>09:05</b> không bị phạt muộn, và được phép check-out
            từ <b>09:55</b>.
          </div>
        </div>

        {/* Action helper */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button variant="ghost" onClick={handleResetDefaults} disabled={saving || loading}>
            <Icon name="rotate-left" size={12} style={{ marginRight: '6px' }} />
            Khôi phục mặc định chuẩn
          </Button>
        </div>
      </div>
    </PopupModal>
  );
};
