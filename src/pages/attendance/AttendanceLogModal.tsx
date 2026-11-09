import React, { useState, useEffect } from 'react';
import { SideSheet, StatusTag, Icon, EmptyValue, Button } from '../../design-system';
import { DailyAttendanceRecord } from '../../types/attendance';
import { dailyAttendanceService } from '../../services/attendance';
import { AdminCheckOutModal } from './AdminCheckOutModal';

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
  if (!record) return null;

  const hasCheckedIn = Boolean(record.checkInTime);
  const [isLeave, setIsLeave] = useState(record.status === 'leave');
  const [currentStatus, setCurrentStatus] = useState(record.status);
  const [leaveReason, setLeaveReason] = useState(record.note || 'Nghỉ phép năm');
  const [submitting, setSubmitting] = useState(false);
  const [adminCheckOutOpen, setAdminCheckOutOpen] = useState(false);

  useEffect(() => {
    if (record) {
      setIsLeave(record.status === 'leave');
      setCurrentStatus(record.status);
      setLeaveReason(record.status === 'leave' && record.note ? record.note : 'Nghỉ phép năm');
    }
  }, [record, record.status, record.note]);

  const handleToggleLeave = async (checked: boolean) => {
    if (hasCheckedIn || submitting) return;
    if (!tenantId) return;

    try {
      setSubmitting(true);
      const updated = await dailyAttendanceService.toggleEmployeeLeave(
        tenantId,
        record.employeeId,
        record.date,
        checked,
        checked ? leaveReason : undefined
      );
      setIsLeave(checked);
      setCurrentStatus(updated.status);
      record.status = updated.status;
      record.note = updated.note;
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle leave:', err);
      alert('Lỗi cập nhật trạng thái nghỉ phép: ' + (err instanceof Error ? err.message : ''));
      setIsLeave(!checked);
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
        newReason
      );
      record.note = updated.note;
      if (onRecordUpdated) {
        onRecordUpdated();
      }
    } catch (err) {
      console.error('Failed to update leave reason:', err);
    }
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
              {currentStatus === 'leave' && <StatusTag tone="info" label="Nghỉ phép" icon="calendar-check" />}
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
              {currentStatus === 'leave' ? (
                <span style={{ color: 'var(--primary-700)', fontStyle: 'italic' }}>Nghỉ phép</span>
              ) : record.checkInTime ? (
                <span>
                  <b>{record.checkInTime}</b> ({getMethodBadge(record.checkInMethod || '')})
                </span>
              ) : (
                <EmptyValue italic>Chưa vào</EmptyValue>
              )}
            </div>
          </div>

          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Giờ về (Check-out)</div>
            <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: 2 }}>
              {currentStatus === 'leave' ? (
                <span style={{ color: 'var(--primary-700)', fontStyle: 'italic' }}>Nghỉ phép</span>
              ) : record.checkOutTime ? (
                <span>
                  <b>{record.checkOutTime}</b> ({getMethodBadge(record.checkOutMethod || '')})
                </span>
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
                cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={isLeave}
                disabled={hasCheckedIn || submitting}
                onChange={(e) => handleToggleLeave(e.target.checked)}
                aria-label="Xác nhận nghỉ phép"
                style={{
                  width: 18,
                  height: 18,
                  cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                  accentColor: 'var(--primary-600)'
                }}
              />
              <span
                className="body-sm-bold"
                style={{
                  color: hasCheckedIn ? 'var(--text-disabled)' : 'var(--text-heading)'
                }}
              >
                Xác nhận nghỉ phép ngày {record.date}
              </span>
            </label>

            {hasCheckedIn ? (
              <span
                className="body-xs-medium"
                style={{
                  color: 'var(--semantic-warning-dark, #b45309)',
                  backgroundColor: 'var(--semantic-warning-light, #fef3c7)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-4)',
                  border: '1px solid #fde68a'
                }}
              >
                Đã check-in (Không thể báo nghỉ)
              </span>
            ) : isLeave ? (
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
                Đang nghỉ phép
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

          {hasCheckedIn ? (
            <div
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-6)'
              }}
            >
              <Icon name="info" size={14} style={{ color: 'var(--semantic-warning)' }} />
              <span>
                Cán bộ đã có dữ liệu check-in ghi nhận lúc <b>{record.checkInTime}</b>. Hệ thống chỉ cho phép xác nhận nghỉ phép khi nhân sự chưa thực hiện quét vào ca.
              </span>
            </div>
          ) : (
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
                    : 'Cán bộ chưa vào ca (Vắng mặt). Quản trị viên có thể tích chọn để ghi nhận nghỉ phép (kể cả với các ngày đã qua nếu trước đó quên ghi nhận).'}
                </span>
              </div>

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
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
                    <option value="Nghỉ ốm / Khám sức khỏe">Nghỉ ốm / Khám sức khỏe</option>
                    <option value="Nghỉ chế độ / Thai sản">Nghỉ chế độ / Thai sản</option>
                    <option value="Đi công tác đột xuất">Đi công tác đột xuất</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Khối quản trị: Bổ sung giờ về (Check-out bù) khi cán bộ quên quét */}
        {hasCheckedIn && !record.checkOutTime && (
          <div
            style={{
              padding: 'var(--space-16)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--semantic-warning, #f59e0b)',
              backgroundColor: 'var(--semantic-warning-light, #fef3c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
                Cán bộ chưa có giờ về (Quên check-out)
              </div>
              <div className="body-xs" style={{ color: 'var(--text-body)', marginTop: 4 }}>
                Cán bộ đã vào ca lúc <b>{record.checkInTime}</b> nhưng chưa ghi nhận giờ tan ca. Quản trị viên có thể xác nhận giờ về bù và lưu vết kiểm toán.
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setAdminCheckOutOpen(true)}
            >
              Bổ sung giờ về
            </Button>
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

      {tenantId && (
        <AdminCheckOutModal
          open={adminCheckOutOpen}
          onClose={() => setAdminCheckOutOpen(false)}
          record={record}
          tenantId={tenantId}
          onSuccess={(updated) => {
            record.checkOutTime = updated.checkOutTime;
            record.checkOutMethod = updated.checkOutMethod;
            record.checkOutDevice = updated.checkOutDevice;
            record.status = updated.status;
            record.note = updated.note;
            record.scanLogs = updated.scanLogs;
            record.auditLogs = updated.auditLogs;
            setCurrentStatus(updated.status);
            if (onRecordUpdated) onRecordUpdated();
          }}
        />
      )}
    </SideSheet>
  );
};
