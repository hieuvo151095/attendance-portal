import React, { useState, useEffect, useCallback } from 'react';
import {
  PopupModal,
  Button,
  TextField,
  Tag,
  StatusTag,
  InlineNotice,
  Avatar,
  DataTable
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

  // Form states for replacing / revoking card
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceReason, setReplaceReason] = useState('Báo mất thẻ vật lý');
  const [replacementCardUid, setReplacementCardUid] = useState('');
  const [replacementNote, setReplacementNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setSuccessMsg(null);
      setIsReplacing(false);
      setNewCardUid('');
      setNewCardNote('');
      setReplacementCardUid('');
      setReplacementNote('');
      loadCardData();
    }
  }, [open, employee, loadCardData]);

  // Simulation of tapping physical card onto desktop RFID reader
  const handleSimulateCardScan = (setter: (val: string) => void) => {
    const hex = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    setter(`04${hex}`);
  };

  // Link new card
  const handleAssignNewCard = async () => {
    if (!employee) return;
    setError(null);
    setSuccessMsg(null);

    const uid = newCardUid.trim().toUpperCase();
    if (!uid) {
      setError('Vui lòng nhập hoặc quẹt mã UID thẻ vật lý.');
      return;
    }

    try {
      setSubmitting(true);
      const card = await cardService.assignCard(tenantId, {
        employeeId: employee.id,
        cardUid: uid,
        note: newCardNote.trim() || undefined
      });
      setSuccessMsg(`Đã liên kết thành công thẻ UID "${card.cardUid}" với nhân viên!`);
      setNewCardUid('');
      setNewCardNote('');
      await loadCardData();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi liên kết thẻ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Lock / Unlock current card
  const handleToggleLock = async () => {
    if (!activeCard) return;
    setError(null);
    setSuccessMsg(null);

    try {
      setSubmitting(true);
      const updated = await cardService.toggleLockCard(
        tenantId,
        activeCard.id,
        activeCard.status === 'active' ? 'Tạm khóa theo yêu cầu' : undefined
      );
      setSuccessMsg(
        updated.status === 'locked'
          ? `Đã tạm khóa thẻ UID "${updated.cardUid}". Thẻ này sẽ không thể chấm công hoặc điểm danh.`
          : `Đã mở khóa thẻ UID "${updated.cardUid}". Thẻ đã hoạt động bình thường trở lại.`
      );
      await loadCardData();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái thẻ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Replace lost / damaged card
  const handleConfirmReplace = async () => {
    if (!activeCard) return;
    setError(null);
    setSuccessMsg(null);

    const newUid = replacementCardUid.trim().toUpperCase();
    if (!newUid) {
      setError('Vui lòng nhập hoặc quẹt mã UID thẻ mới.');
      return;
    }
    if (!replaceReason.trim()) {
      setError('Vui lòng chọn hoặc nhập lý do hủy thẻ cũ.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await cardService.replaceCard(tenantId, {
        oldCardId: activeCard.id,
        newCardUid: newUid,
        revokeReason: replaceReason,
        note: replacementNote.trim() || undefined
      });
      setSuccessMsg(
        `Đã hủy thẻ cũ (UID: ${res.oldCard.cardUid}) và kích hoạt thành công thẻ mới (UID: ${res.newCard.cardUid})!`
      );
      setIsReplacing(false);
      setReplacementCardUid('');
      setReplacementNote('');
      await loadCardData();
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi thẻ mới';
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
    <PopupModal
      open={open}
      title="Quản Lý Thẻ Nhân Viên Vật Lý (RFID/NFC)"
      description="Quản lý mã UID vật lý, trạng thái hoạt động và cấp đổi thẻ khi báo mất."
      icon="id-badge"
      width={680}
      onClose={onClose}
      primaryAction={{
        label: 'Đóng',
        onClick: onClose
      }}
      secondaryAction={null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && <InlineNotice tone="danger" label={error} />}
        {successMsg && <InlineNotice tone="success" label={successMsg} />}

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
        ) : activeCard && !isReplacing ? (
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
              <div className="body-xs-bold" style={{ color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
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
                <div className="body-sm-medium" style={{ marginTop: 'var(--space-4)', color: 'var(--text-body)' }}>
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
                onClick={handleToggleLock}
              >
                {activeCard.status === 'active' ? 'Tạm khóa thẻ' : 'Mở khóa thẻ'}
              </Button>

              <Button
                variant="secondary"
                icon="arrows-rotate"
                disabled={submitting}
                onClick={() => setIsReplacing(true)}
              >
                Báo mất / Cấp đổi thẻ mới
              </Button>
            </div>
          </div>
        ) : isReplacing && activeCard ? (
          /* Replace Card Sub-form */
          <div
            style={{
              padding: 'var(--space-16)',
              backgroundColor: 'var(--semantic-warning-soft)',
              border: '1px solid var(--border-warning-soft)',
              borderRadius: 'var(--radius-12)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-12)'
            }}
          >
            <div className="body-sm-bold" style={{ color: 'var(--semantic-warning-strong)' }}>
              ⚠️ Báo mất thẻ & Cấp thẻ mới thay thế
            </div>
            <p className="body-xs" style={{ margin: 0, color: 'var(--text-body)' }}>
              Thẻ cũ (UID: <b>{activeCard.cardUid}</b>) sẽ bị hủy vĩnh viễn và không thể sử dụng để điểm danh nữa.
            </p>

            <div>
              <label
                htmlFor="replace-reason-select"
                className="body-xs-bold"
                style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}
              >
                Lý do hủy thẻ cũ <span style={{ color: 'var(--semantic-danger)' }}>*</span>
              </label>
              <select
                id="replace-reason-select"
                className="ecomd-select body-sm-medium"
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="Báo mất thẻ vật lý">Báo mất thẻ vật lý</option>
                <option value="Thẻ bị gãy / hỏng chip">Thẻ bị gãy / hỏng chip</option>
                <option value="Nâng cấp công nghệ thẻ mới">Nâng cấp công nghệ thẻ mới</option>
                <option value="Lý do nghiệp vụ khác">Lý do nghiệp vụ khác</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <TextField
                  id="replace-card-uid"
                  label="Mã UID thẻ mới (RFID/NFC)"
                  required
                  placeholder="VD: 04E9A1B2C3"
                  value={replacementCardUid}
                  onChange={(val) => setReplacementCardUid(val)}
                  disabled={submitting}
                />
              </div>
              <Button
                variant="secondary"
                icon="fingerprint"
                onClick={() => handleSimulateCardScan(setReplacementCardUid)}
                disabled={submitting}
              >
                Quét từ đầu đọc
              </Button>
            </div>

            <TextField
              id="replace-card-note"
              label="Ghi chú cấp đổi"
              placeholder="VD: Cấp lại lần 1"
              value={replacementNote}
              onChange={(val) => setReplacementNote(val)}
              disabled={submitting}
            />

            <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
              <Button
                variant="primary"
                icon="check"
                disabled={submitting}
                onClick={handleConfirmReplace}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận hủy thẻ cũ & Kích hoạt thẻ mới'}
              </Button>
              <Button
                variant="ghost"
                disabled={submitting}
                onClick={() => setIsReplacing(false)}
              >
                Hủy thao tác
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
              Nhập mã thẻ hoặc chạm thẻ vật lý vào đầu đọc USB RFID/NFC để liên kết với nhân sự.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <TextField
                  id="assign-new-card-uid"
                  label="Mã UID vật lý của thẻ"
                  required
                  placeholder="VD: 04A1B2C3D4, E0040150..."
                  value={newCardUid}
                  onChange={(val) => setNewCardUid(val)}
                  disabled={submitting}
                />
              </div>
              <Button
                variant="secondary"
                icon="fingerprint"
                onClick={() => handleSimulateCardScan(setNewCardUid)}
                disabled={submitting}
              >
                Quét từ đầu đọc
              </Button>
            </div>

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
                disabled={submitting}
                onClick={handleAssignNewCard}
              >
                {submitting ? 'Đang liên kết...' : 'Liên kết thẻ cho nhân viên'}
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
    </PopupModal>
  );
};
