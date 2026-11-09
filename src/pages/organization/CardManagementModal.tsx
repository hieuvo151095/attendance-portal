import React, { useState, useEffect, useCallback } from 'react';
import {
  SideSheet,
  Button,
  TextField,
  Tag,
  StatusTag,
  InlineNotice,
  Avatar,
  DataTable,
  PopupModal,
  toast,
  ToastContainer
} from '../../design-system';
import { Employee } from '../../types/employee';
import { EmployeeCard } from '../../types/card';
import { cardService } from '../../services/card';

export interface CardManagementModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  employee: Employee | null;
  onSuccess: () => void;
}

export const CardManagementModal: React.FC<CardManagementModalProps> = ({
  open,
  onClose,
  tenantId,
  employee,
  onSuccess
}) => {
  const [activeCard, setActiveCard] = useState<EmployeeCard | null>(null);
  const [cardHistory, setCardHistory] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for linking new card
  const [newCardUid, setNewCardUid] = useState('');
  const [newCardNote, setNewCardNote] = useState('');

  // Confirmation modal state for Lock / Unlock
  const [confirmLockModalOpen, setConfirmLockModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCardData = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const [currCard, history] = await Promise.all([
        cardService.getActiveCardByEmployee(tenantId, employee.id),
        cardService.getCardHistoryByEmployee(tenantId, employee.id)
      ]);
      setActiveCard(currCard);
      setCardHistory(history.filter((c) => c.status === 'revoked'));
    } catch (err) {
      console.error('Lỗi tải dữ liệu thẻ:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, employee]);

  useEffect(() => {
    if (open && employee) {
      setError(null);
      setConfirmLockModalOpen(false);
      setNewCardUid('');
      setNewCardNote('');
      loadCardData();
    }
  }, [open, employee, loadCardData]);

  // Link new card
  const handleAssignNewCard = async () => {
    if (!employee) return;
    setError(null);

    const uid = newCardUid.trim().toUpperCase();
    if (!uid) {
      setError('Vui lòng nhập mã UID thẻ vật lý.');
      return;
    }

    try {
      setSubmitting(true);
      const card = await cardService.assignCard(tenantId, {
        employeeId: employee.id,
        cardUid: uid,
        note: newCardNote.trim() || undefined
      });
      toast.success(`Đã cấp thành công thẻ UID "${card.cardUid}" cho nhân viên!`);
      setNewCardUid('');
      setNewCardNote('');
      await loadCardData();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cấp thẻ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Lock / Unlock current card after confirmation
  const handleExecuteToggleLock = async () => {
    if (!activeCard) return;
    setError(null);
    setConfirmLockModalOpen(false);

    try {
      setSubmitting(true);
      const updated = await cardService.toggleLockCard(
        tenantId,
        activeCard.id,
        activeCard.status === 'active' ? 'Tạm khóa theo yêu cầu' : undefined
      );
      const message =
        updated.status === 'locked'
          ? `Đã tạm khóa thẻ UID "${updated.cardUid}". Thẻ này sẽ không thể chấm công hoặc điểm danh.`
          : `Đã mở khóa thẻ UID "${updated.cardUid}". Thẻ đã hoạt động bình thường trở lại.`;
      toast.success(message);
      await loadCardData();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái thẻ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  const historyColumns = [
    {
      key: 'cardUid',
      title: 'Mã UID thẻ cũ',
      render: (c: EmployeeCard) => <Tag variant="code">{c.cardUid}</Tag>
    },
    {
      key: 'revokedAt',
      title: 'Thời điểm hủy',
      render: (c: EmployeeCard) =>
        c.revokedAt ? new Date(c.revokedAt).toLocaleString('vi-VN') : '—'
    },
    {
      key: 'revocationReason',
      title: 'Lý do hủy',
      render: (c: EmployeeCard) => (
        <span style={{ color: 'var(--semantic-danger)' }}>{c.revocationReason || '—'}</span>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: () => <StatusTag tone="danger" label="Đã hủy" icon="circle-xmark" />
    }
  ];

  return (
    <>
      <SideSheet
        open={open}
        title="Quản Lý Thẻ Nhân Viên Vật Lý (RFID/NFC)"
        description="Quản lý mã UID vật lý và trạng thái hoạt động của thẻ điểm danh."
        icon="id-badge"
        width={640}
        onClose={onClose}
        primaryAction={{
          label: 'Đóng',
          onClick: onClose
        }}
        secondaryAction={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {error && <InlineNotice tone="danger" label={error} />}

          {/* Employee Info Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-12)',
              padding: 'var(--space-12) var(--space-16)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--border-default)'
            }}
          >
            <Avatar src={employee.avatarUrl} name={employee.fullName} size="md" />
            <div style={{ flex: 1 }}>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                {employee.fullName} ({employee.employeeCode})
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                Chức vụ: <b>{employee.position}</b> | CCCD: {employee.identityNumber}
              </div>
            </div>
            <div>
              {activeCard ? (
                activeCard.status === 'active' ? (
                  <StatusTag tone="success" label="Đang có thẻ hoạt động" icon="circle-check" />
                ) : (
                  <StatusTag tone="warning" label="Thẻ đang tạm khóa" icon="lock" />
                )
              ) : (
                <StatusTag tone="neutral" label="Chưa có thẻ" />
              )}
            </div>
          </div>

          {/* Active Card Card or Linking Form */}
          {loading ? (
            <div style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
              <span className="body-sm">Đang tải thông tin thẻ...</span>
            </div>
          ) : activeCard ? (
            /* Card Information Display */
            <div
              style={{
                padding: 'var(--space-16)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-12)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  className="body-xs-bold"
                  style={{ color: 'var(--text-subtle)', textTransform: 'uppercase' }}
                >
                  Thẻ vật lý đang liên kết
                </div>
                <div>
                  {activeCard.status === 'active' ? (
                    <StatusTag tone="success" label="Đang hoạt động" icon="circle-check" />
                  ) : (
                    <StatusTag tone="warning" label="Đang tạm khóa" icon="lock" />
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
                <div>
                  <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                    Mã UID vật lý của thẻ:
                  </div>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Tag variant="code">{activeCard.cardUid}</Tag>
                  </div>
                </div>

                <div>
                  <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                    Ngày liên kết thẻ:
                  </div>
                  <div
                    className="body-sm-medium"
                    style={{ marginTop: 'var(--space-4)', color: 'var(--text-body)' }}
                  >
                    {new Date(activeCard.linkedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {activeCard.note && (
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Ghi chú: {activeCard.note}
                </div>
              )}

              {/* Quick Actions for Current Card */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-8)',
                  marginTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 'var(--space-12)'
                }}
              >
                <Button
                  variant={activeCard.status === 'active' ? 'secondary' : 'primary'}
                  icon={activeCard.status === 'active' ? 'lock' : 'key'}
                  disabled={submitting}
                  onClick={() => setConfirmLockModalOpen(true)}
                >
                  {activeCard.status === 'active' ? 'Tạm khóa thẻ' : 'Mở khóa thẻ'}
                </Button>
              </div>
            </div>
          ) : (
            /* Link New Card Form */
            <div
              style={{
                padding: 'var(--space-16)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-12)'
              }}
            >
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                Chưa có thẻ vật lý nào đang hoạt động
              </div>
              <p className="body-xs" style={{ margin: 0, color: 'var(--text-subtle)' }}>
                Nhập mã thẻ vật lý (RFID/NFC) để cấp thẻ điểm danh cho nhân sự.
              </p>

              <TextField
                id="assign-new-card-uid"
                label="Mã UID vật lý của thẻ"
                required
                placeholder="VD: 04A1B2C3D4, E0040150..."
                value={newCardUid}
                onChange={(val) => setNewCardUid(val)}
                disabled={submitting}
              />

              <TextField
                id="assign-new-card-note"
                label="Ghi chú cấp phát"
                placeholder="VD: Thẻ công vụ chuẩn Mifare 13.56MHz"
                value={newCardNote}
                onChange={(val) => setNewCardNote(val)}
                disabled={submitting}
              />

              <div>
                <Button
                  variant="primary"
                  icon="plus"
                  disabled={submitting || !newCardUid.trim()}
                  onClick={handleAssignNewCard}
                >
                  {submitting ? 'Đang cấp thẻ...' : 'Cấp thẻ'}
                </Button>
              </div>
            </div>
          )}

          {/* Revoked Cards History */}
          {cardHistory.length > 0 && (
            <div>
              <div
                className="body-xs-bold"
                style={{
                  marginBottom: 'var(--space-8)',
                  color: 'var(--text-heading)',
                  textTransform: 'uppercase'
                }}
              >
                Lịch sử thẻ đã thu hồi / báo mất ({cardHistory.length} thẻ)
              </div>
              <DataTable
                columns={historyColumns}
                rows={cardHistory}
                rowKey="id"
                emptyText="Không có lịch sử thẻ cũ"
              />
            </div>
          )}
        </div>
      </SideSheet>

      {/* Confirmation Modal for Lock / Unlock Card */}
      {confirmLockModalOpen && activeCard && (
        <PopupModal
          open={confirmLockModalOpen}
          icon={activeCard.status === 'active' ? 'lock' : 'key'}
          title={
            activeCard.status === 'active'
              ? 'Xác nhận tạm khóa thẻ vật lý'
              : 'Xác nhận mở khóa thẻ vật lý'
          }
          description={
            activeCard.status === 'active'
              ? `Bạn có chắc chắn muốn tạm khóa thẻ UID "${activeCard.cardUid}" của cán bộ ${employee.fullName}? Thẻ này sẽ tạm thời không thể sử dụng để chấm công hoặc điểm danh.`
              : `Bạn có chắc chắn muốn mở khóa lại thẻ UID "${activeCard.cardUid}" cho cán bộ ${employee.fullName}? Thẻ sẽ hoạt động bình thường trở lại để chấm công và điểm danh.`
          }
          width={480}
          onClose={() => setConfirmLockModalOpen(false)}
          primaryAction={{
            label: activeCard.status === 'active' ? 'Tạm khóa thẻ' : 'Mở khóa thẻ',
            icon: activeCard.status === 'active' ? 'lock' : 'key',
            disabled: submitting,
            onClick: handleExecuteToggleLock
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            disabled: submitting,
            onClick: () => setConfirmLockModalOpen(false)
          }}
        />
      )}

      {/* Toast container for notifications */}
      <ToastContainer />
    </>
  );
};
