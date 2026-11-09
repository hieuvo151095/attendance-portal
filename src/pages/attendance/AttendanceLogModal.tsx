import React, { useState, useEffect } from 'react';
import { SideSheet, StatusTag, Icon, EmptyValue, Button, PopupModal, toast } from '../../design-system';
import { DailyAttendanceRecord, LeavePeriod } from '../../types/attendance';
import { dailyAttendanceService } from '../../services/attendance';
import { authService } from '../../services/auth';

export interface AttendanceLogModalProps {
  open: boolean;
  onClose: () => void;
  record: DailyAttendanceRecord | null;
  tenantId?: string;
  onRecordUpdated?: () => void;
}

export const AttendanceLogModal: React.FC<AttendanceLogModalProps> = ({
  open,
  onClose,
  record,
  tenantId,
  onRecordUpdated
}) => {
  const session = authService.getCurrentSession();
  const adminName = session?.tenant.contactName || session?.tenant.orgName || 'Đ/c Nguyễn Văn An';

  const hasCheckedIn = Boolean(record?.checkInTime);
  const [isLeave, setIsLeave] = useState(record?.status === 'leave');
  const [currentStatus, setCurrentStatus] = useState(record?.status);
  const [leaveReason, setLeaveReason] = useState(record?.note || 'Nghỉ việc riêng / Khẩn cấp');
  const [leavePeriod, setLeavePeriod] = useState<LeavePeriod>(
    record?.leavePeriod || (hasCheckedIn ? 'afternoon' : 'full_day')
  );
  const [supplementTime, setSupplementTime] = useState(record?.checkOutTime || '17:00');
  const [confirmCheckOutModalOpen, setConfirmCheckOutModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setIsLeave(record.status === 'leave');
      setCurrentStatus(record.status);
      setLeaveReason(record.status === 'leave' && record.note ? record.note : 'Nghỉ việc riêng / Khẩn cấp');
      setLeavePeriod(record.leavePeriod || (Boolean(record.checkInTime) ? 'afternoon' : 'full_day'));
      setSupplementTime(record.checkOutTime || '17:00');
    }
  }, [record, record?.status, record?.note, record?.leavePeriod, record?.checkOutTime, record?.checkInTime]);

  if (!record) return null;

  const handleToggleLeave = async (checked: boolean) => {
    if (submitting || !tenantId) return;

    try {
      setSubmitting(true);
      const period = leavePeriod || (hasCheckedIn ? 'afternoon' : 'full_day');
      const updated = await dailyAttendanceService.toggleEmployeeLeave(
        tenantId,
        record.employeeId,
        record.date,
        checked,
        checked ? leaveReason : undefined,
        period
      );
      setIsLeave(checked);
      setCurrentStatus(updated.status);
      record.status = updated.status;
      record.note = updated.note;
      record.leavePeriod = updated.leavePeriod;
      toast.success(
        checked
          ? `Đã xác nhận nghỉ phép (${period === 'morning' ? 'Buổi sáng' : period === 'afternoon' ? 'Buổi chiều' : 'Cả ngày'}) cho cán bộ ${record.employeeName}.`
          : `Đã hủy ghi nhận nghỉ phép cho cán bộ ${record.employeeName}.`
      );
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle leave:', err);
      toast.error('Lỗi cập nhật trạng thái nghỉ phép: ' + (err instanceof Error ? err.message : ''));
      setIsLeave(!checked);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeavePeriodChange = async (newPeriod: LeavePeriod) => {
    setLeavePeriod(newPeriod);
    if (!tenantId || !isLeave || submitting) return;
    try {
      setSubmitting(true);
      const updated = await dailyAttendanceService.toggleEmployeeLeave(
        tenantId,
        record.employeeId,
        record.date,
        true,
        leaveReason,
        newPeriod
      );
      record.leavePeriod = updated.leavePeriod;
      record.note = updated.note;
      record.status = updated.status;
      setCurrentStatus(updated.status);
      toast.success(
        `Đã chuyển sang nghỉ phép ${newPeriod === 'morning' ? 'Buổi sáng' : newPeriod === 'afternoon' ? 'Buổi chiều' : 'Cả ngày'}.`
      );
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err) {
      console.error('Failed to update leave period:', err);
      toast.error('Lỗi chuyển thời gian nghỉ phép');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonChange = async (newReason: string) => {
    setLeaveReason(newReason);
    if (!tenantId || !isLeave || submitting) return;
    try {
      const updated = await dailyAttendanceService.toggleEmployeeLeave(
        tenantId,
        record.employeeId,
        record.date,
        true,
        newReason,
        leavePeriod
      );
      record.note = updated.note;
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err) {
      console.error('Failed to update leave reason:', err);
    }
  };

  const handleConfirmSupplementCheckOut = async () => {
    if (!tenantId || !record || submitting) return;
    const timeVal = supplementTime.trim();
    if (!timeVal) {
      toast.error('Vui lòng chọn hoặc nhập giờ về.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await dailyAttendanceService.adminCheckOut({
        tenantId,
        employeeId: record.employeeId,
        date: record.date,
        checkOutTime: timeVal,
        reason: 'Quản trị viên bổ sung giờ về',
        adminName,
        note: `Thông tin check-out được bổ sung bởi ${adminName}`
      });

      record.checkOutTime = updated.checkOutTime;
      record.checkOutMethod = updated.checkOutMethod;
      record.checkOutDevice = updated.checkOutDevice;
      record.checkOutAdminName = updated.checkOutAdminName;
      record.status = updated.status;
      record.note = updated.note;
      record.scanLogs = updated.scanLogs;
      record.auditLogs = updated.auditLogs;
      setCurrentStatus(updated.status);

      toast.success(`Đã bổ sung giờ về lúc ${timeVal} cho cán bộ ${record.employeeName}.`);
      setConfirmCheckOutModalOpen(false);
      if (onRecordUpdated) onRecordUpdated();
    } catch (err) {
      console.error('Lỗi khi bổ sung giờ về:', err);
      toast.error(err instanceof Error ? err.message : 'Có lỗi khi bổ sung giờ về.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLeaveStatusLabel = () => {
    if (record.leavePeriod === 'morning' || leavePeriod === 'morning') return 'Nghỉ buổi sáng';
    if (record.leavePeriod === 'afternoon' || leavePeriod === 'afternoon') return 'Nghỉ buổi chiều';
    if (record.leavePeriod === 'full_day' || leavePeriod === 'full_day') return 'Nghỉ cả ngày';
    return 'Nghỉ phép';
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'faceId':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary-700)' }}>
            <Icon name="camera" size={14} /> Face ID
          </span>
        );
      case 'fingerprint':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary-700)' }}>
            <Icon name="fingerprint" size={14} /> Vân tay
          </span>
        );
      case 'card':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary-700)' }}>
            <Icon name="id-badge" size={14} /> Thẻ RFID
          </span>
        );
      case 'manual':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--eco-blue-strong, #0284c7)', fontWeight: 500 }}>
            <Icon name="pencil" size={13} /> Admin bổ sung
          </span>
        );
      default:
        return <span>Thủ công</span>;
    }
  };

  return (
    <SideSheet
      open={open}
      title="Chi tiết chấm công"
      description={`Cán bộ: ${record.employeeName} (${record.employeeCode}) — Ngày: ${record.date}`}
      icon="clock"
      width={520}
      onClose={onClose}
      secondaryAction={{
        label: 'Đóng',
        onClick: onClose
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {/* Tóm tắt ca làm việc */}
        <div
          style={{
            padding: 'var(--space-16)',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            border: '1px solid var(--border-neutral-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-12)'
          }}
        >
          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Phòng ban</div>
            <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: 2 }}>
              {record.departmentName}
            </div>
          </div>

          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Trạng thái chấm công</div>
            <div style={{ marginTop: 2 }}>
              {currentStatus === 'leave' && <StatusTag tone="info" label={getLeaveStatusLabel()} icon="calendar-check" />}
              {currentStatus === 'on_time' && <StatusTag tone="success" label="Đúng giờ" icon="circle-check" />}
              {currentStatus === 'late' && <StatusTag tone="warning" label={`Đi muộn ${record.lateMinutes}p`} icon="clock" />}
              {currentStatus === 'early_leave' && <StatusTag tone="warning" label={`Về sớm ${record.earlyLeaveMinutes}p`} icon="clock" />}
              {currentStatus === 'late_and_early' && <StatusTag tone="danger" label="Muộn & Về sớm" icon="circle-xmark" />}
              {currentStatus === 'absent' && <StatusTag tone="danger" label="Chưa đến / Vắng" icon="circle-xmark" />}
            </div>
          </div>

          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Giờ đến (Check-in)</div>
            <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: 2 }}>
              {record.checkInTime ? (
                <span>
                  <b>{record.checkInTime}</b> ({getMethodBadge(record.checkInMethod || '')})
                </span>
              ) : currentStatus === 'leave' ? (
                <span style={{ color: 'var(--primary-700)', fontStyle: 'italic' }}>{getLeaveStatusLabel()}</span>
              ) : (
                <EmptyValue italic>Chưa vào</EmptyValue>
              )}
            </div>
          </div>

          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Giờ về (Check-out)</div>
            <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: 2 }}>
              {record.checkOutTime ? (
                <div>
                  <span>
                    <b>{record.checkOutTime}</b> ({getMethodBadge(record.checkOutMethod || '')})
                  </span>
                  {(record.checkOutMethod === 'manual' || record.checkOutAdminName) && (
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic', marginTop: 3 }}>
                      Thông tin check-out được bổ sung bởi &ldquo;{record.checkOutAdminName || adminName}&rdquo;
                    </div>
                  )}
                </div>
              ) : currentStatus === 'leave' ? (
                <span style={{ color: 'var(--primary-700)', fontStyle: 'italic' }}>{getLeaveStatusLabel()}</span>
              ) : (
                <EmptyValue italic>Chưa về</EmptyValue>
              )}
            </div>
          </div>
        </div>

        {/* Khối quản trị: Xác nhận nghỉ phép */}
        <div
          style={{
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius-8)',
            border: isLeave ? '1px solid var(--primary-300)' : '1px solid var(--border-default)',
            backgroundColor: isLeave ? 'var(--primary-50)' : 'var(--bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-10)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={isLeave}
                disabled={submitting}
                onChange={(e) => handleToggleLeave(e.target.checked)}
                aria-label="Xác nhận nghỉ phép"
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                  accentColor: 'var(--primary-600)'
                }}
              />
              <span
                className="body-sm-bold"
                style={{
                  color: 'var(--text-heading)'
                }}
              >
                Xác nhận nghỉ phép ngày {record.date}
              </span>
            </label>

            {isLeave ? (
              <span
                className="body-xs-medium"
                style={{
                  color: 'var(--primary-700)',
                  backgroundColor: 'var(--primary-100)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-4)',
                  border: '1px solid var(--primary-200)'
                }}
              >
                {leavePeriod === 'morning' ? 'Nghỉ buổi sáng' : leavePeriod === 'afternoon' ? 'Nghỉ buổi chiều' : 'Nghỉ cả ngày'}
              </span>
            ) : hasCheckedIn ? (
              <span
                className="body-xs-medium"
                style={{
                  color: 'var(--semantic-success)',
                  backgroundColor: 'var(--semantic-success-light, #dcfce7)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-4)',
                  border: '1px solid #bbf7d0'
                }}
              >
                Đã vào ca ({record.checkInTime})
              </span>
            ) : (
              <span
                className="body-xs-medium"
                style={{
                  color: 'var(--semantic-danger)',
                  backgroundColor: '#fee2e2',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-4)',
                  border: '1px solid #fecaca'
                }}
              >
                Chưa đến / Vắng (Không phép)
              </span>
            )}
          </div>

          {/* Lựa chọn phạm vi nghỉ phép: Cả ngày / Buổi sáng / Buổi chiều */}
          {isLeave && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
                padding: 'var(--space-10) var(--space-12)',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-6)',
                border: '1px solid var(--border-neutral-subtle)'
              }}
            >
              <div className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>
                Thời gian nghỉ phép:
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-heading)' }}>
                  <input
                    type="radio"
                    name="leavePeriod"
                    value="full_day"
                    checked={leavePeriod === 'full_day'}
                    disabled={submitting}
                    onChange={() => handleLeavePeriodChange('full_day')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Cả ngày</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-heading)' }}>
                  <input
                    type="radio"
                    name="leavePeriod"
                    value="morning"
                    checked={leavePeriod === 'morning'}
                    disabled={submitting}
                    onChange={() => handleLeavePeriodChange('morning')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Buổi sáng</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-heading)' }}>
                  <input
                    type="radio"
                    name="leavePeriod"
                    value="afternoon"
                    checked={leavePeriod === 'afternoon'}
                    disabled={submitting}
                    onChange={() => handleLeavePeriodChange('afternoon')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Buổi chiều</span>
                </label>
              </div>
            </div>
          )}

          {hasCheckedIn && isLeave && (
            <div
              className="body-xs"
              style={{
                color: 'var(--semantic-warning-dark, #b45309)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-6)',
                backgroundColor: '#fffbeb',
                padding: '6px 10px',
                borderRadius: 'var(--radius-4)',
                border: '1px solid #fef3c7'
              }}
            >
              <Icon name="info" size={14} style={{ color: 'var(--semantic-warning)' }} />
              <span>
                Cán bộ đã có dữ liệu check-in lúc <b>{record.checkInTime}</b>. Hệ thống ghi nhận nghỉ phép đột xuất (việc khẩn cấp về sớm) và bảo lưu dữ liệu vào ca.
              </span>
            </div>
          )}

          {hasCheckedIn && !isLeave && (
            <div
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-6)'
              }}
            >
              <Icon name="info" size={14} style={{ color: 'var(--primary-600)' }} />
              <span>
                Cán bộ đã check-in lúc <b>{record.checkInTime}</b>. Trường hợp có việc khẩn cấp cần về sớm, Quản trị viên vẫn có thể tích chọn để ghi nhận nghỉ phép (Buổi chiều hoặc Cả ngày).
              </span>
            </div>
          )}

          {!hasCheckedIn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              <div
                className="body-xs"
                style={{
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-6)'
                }}
              >
                <Icon name="info" size={14} style={{ color: 'var(--primary-600)' }} />
                <span>
                  {isLeave
                    ? 'Cán bộ đang được ghi nhận nghỉ phép có lý do. Quản trị viên có thể bỏ tích để chuyển lại thành Chưa đến / Vắng.'
                    : 'Cán bộ chưa vào ca (Vắng mặt). Quản trị viên có thể tích chọn để ghi nhận nghỉ phép.'}
                </span>
              </div>
            </div>
          )}

          {isLeave && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <label className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>
                Lý do nghỉ phép:
              </label>
              <select
                value={leaveReason}
                onChange={(e) => handleReasonChange(e.target.value)}
                disabled={submitting}
                className="body-sm"
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 'var(--radius-6)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-heading)'
                }}
              >
                <option value="Nghỉ việc riêng / Khẩn cấp">Nghỉ việc riêng / Khẩn cấp</option>
                <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                <option value="Nghỉ ốm / Khám sức khỏe">Nghỉ ốm / Khám sức khỏe</option>
                <option value="Nghỉ chế độ / Thai sản">Nghỉ chế độ / Thai sản</option>
                <option value="Đi công tác đột xuất">Đi công tác đột xuất</option>
              </select>
            </div>
          )}
        </div>

        {/* Khối quản trị: Bổ sung giờ về (Check-out bù) ngay trong right-sheet */}
        {hasCheckedIn && (
          <div
            style={{
              padding: 'var(--space-16)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--semantic-warning, #f59e0b)',
              backgroundColor: 'var(--semantic-warning-light, #fef3c7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-12)'
            }}
          >
            <div>
              <div
                className="body-sm-bold"
                style={{
                  color: 'var(--semantic-warning-dark, #b45309)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="clock" size={15} />
                {record.checkOutTime ? 'Điều chỉnh giờ về (Check-out)' : 'Cán bộ chưa có giờ về (Quên check-out)'}
              </div>
              <div className="body-xs" style={{ color: 'var(--text-body)', marginTop: 4 }}>
                {record.checkOutTime
                  ? `Giờ về hiện tại: ${record.checkOutTime}. Quản trị viên có thể điều chỉnh giờ về và bấm Bổ sung.`
                  : `Cán bộ đã vào ca lúc ${record.checkInTime} nhưng chưa ghi nhận giờ tan ca. Quản trị viên có thể chỉnh giờ về trực tiếp tại đây và bấm Bổ sung.`}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <label className="body-xs-medium" style={{ color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
                  Giờ về:
                </label>
                <input
                  type="time"
                  aria-label="Giờ về bổ sung"
                  value={supplementTime}
                  onChange={(e) => setSupplementTime(e.target.value)}
                  disabled={submitting}
                  style={{
                    height: 36,
                    padding: '0 10px',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-canvas)',
                    color: 'var(--text-heading)',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => setConfirmCheckOutModalOpen(true)}
                disabled={submitting || !supplementTime.trim()}
              >
                Bổ sung
              </Button>
            </div>
          </div>
        )}

        {/* Lịch sử kiểm toán của Quản trị viên (Audit Log) */}
        {record.auditLogs && record.auditLogs.length > 0 && (
          <div>
            <h4
              className="body-sm-semibold"
              style={{
                color: 'var(--text-heading)',
                marginBottom: 'var(--space-8)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name="shield-halved" size={15} color="var(--primary-600)" />
              Nhật ký kiểm toán & can thiệp Quản trị viên ({record.auditLogs.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {record.auditLogs.map((audit) => (
                <div
                  key={audit.id}
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-8)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span className="body-xs-medium" style={{ color: 'var(--primary-700)' }}>
                      {audit.action === 'admin_checkout' ? 'Bổ sung giờ về (Check-out bù)' : 'Điều chỉnh thủ công'}
                    </span>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      {new Date(audit.performedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                    {audit.details}
                  </div>
                  <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                    Lý do: <i>{audit.reason}</i> • Thực hiện bởi: <b>{audit.performedBy}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lịch sử từng lượt quét chi tiết */}
        <div>
          <h4 className="body-sm-semibold" style={{ color: 'var(--text-heading)', marginBottom: 'var(--space-8)' }}>
            Lịch sử các lần quét thiết bị ({record.scanLogs.length} lần ghi nhận)
          </h4>

          {record.scanLogs.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-20)',
                textAlign: 'center',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-8)',
                border: '1px dashed var(--border-neutral-subtle)',
                color: 'var(--text-subtle)'
              }}
            >
              Chưa có lượt quét nào được ghi nhận từ thiết bị cổng trong ngày này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {record.scanLogs.map((log, index) => (
                <div
                  key={log.id || index}
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-12)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: log.type === 'check_in' ? 'var(--primary-100)' : 'var(--semantic-warning-light, #fef3c7)',
                        color: log.type === 'check_in' ? 'var(--primary-700)' : 'var(--semantic-warning-dark, #b45309)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon name={log.type === 'check_in' ? 'arrow-right' : 'arrow-left'} size={15} />
                    </div>
                    <div>
                      <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                        {log.type === 'check_in' ? 'Vào ca (Check-in)' : 'Tan ca (Check-out)'}
                      </div>
                      <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        {log.deviceName}
                        {log.faceScore && ` • Độ khớp: ${log.faceScore}%`}
                        {log.cardUid && ` • Mã thẻ: ${log.cardUid}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      {getMethodBadge(log.method)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up modal xác nhận bổ sung giờ về */}
      <PopupModal
        open={confirmCheckOutModalOpen}
        onClose={() => setConfirmCheckOutModalOpen(false)}
        title="Xác nhận bổ sung giờ về"
        description="Xác nhận lưu vết thông tin giờ tan ca do Quản trị viên bổ sung."
        width={460}
        primaryAction={{
          label: submitting ? 'Đang lưu...' : 'Xác nhận',
          onClick: handleConfirmSupplementCheckOut,
          disabled: submitting
        }}
        secondaryAction={{
          label: 'Hủy bỏ',
          onClick: () => setConfirmCheckOutModalOpen(false),
          disabled: submitting
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <div className="body-sm" style={{ color: 'var(--text-heading)', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xác nhận bổ sung giờ về lúc <b>{supplementTime}</b> ngày <b>{record.date}</b> cho cán bộ <b>{record.employeeName}</b>?
          </div>
          <div
            className="body-xs"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-6)',
              color: 'var(--primary-900)',
              border: '1px solid var(--primary-200)',
              lineHeight: 1.5
            }}
          >
            Thông tin check-out được bổ sung bởi &ldquo;<b>{adminName}</b>&rdquo;.
          </div>
        </div>
      </PopupModal>
    </SideSheet>
  );
};
