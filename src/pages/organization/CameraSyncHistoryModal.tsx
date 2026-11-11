import React, { useState, useEffect, useCallback } from 'react';
import {
  SideSheet,
  DataTable,
  DataTableColumn,
  Tag,
  StatusTag,
  Icon,
  InlineNotice,
  Button,
  EmptyState
} from '../../design-system';
import { Employee } from '../../types/employee';
import {
  EmployeeCameraSyncLog,
  cameraSyncHistoryService
} from '../../services/cameraSyncHistory';

export interface CameraSyncHistoryModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  departmentName?: string;
  tenantId: string;
}

export const CameraSyncHistoryModal: React.FC<CameraSyncHistoryModalProps> = ({
  open,
  onClose,
  employee,
  departmentName = '---',
  tenantId
}) => {
  const [logs, setLogs] = useState<EmployeeCameraSyncLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHistory = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const data = await cameraSyncHistoryService.getEmployeeSyncHistory(
        tenantId,
        employee.id
      );
      setLogs(data);
    } catch (err) {
      console.error('Lỗi tải lịch sử đồng bộ camera:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, employee]);

  useEffect(() => {
    if (open && employee) {
      loadHistory();
    } else {
      setLogs([]);
    }
  }, [open, employee, loadHistory]);

  const handleSimulateFirstTap = async (cardUid: string) => {
    await cameraSyncHistoryService.markCardFirstTap(cardUid);
    await loadHistory();
  };

  const columns: DataTableColumn<EmployeeCameraSyncLog>[] = [
    {
      key: 'device',
      title: 'Mã & Tên thiết bị',
      width: '260px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag variant="code">{row.deviceCode}</Tag>
            <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
              {row.deviceName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-subtle)', fontSize: '11px' }}>
            <Icon name="location-dot" size={10} />
            <span>{row.deviceLocation}</span>
          </div>
        </div>
      )
    },
    {
      key: 'method',
      title: 'Hình thức điểm danh',
      width: '240px',
      render: (row) => {
        const isFace = row.method === 'faceId';
        const isSynced = row.status === 'synced';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon
                name={isFace ? 'camera' : 'id-badge'}
                size={13}
                color={isFace ? '#2563eb' : '#0891b2'}
              />
              <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                {isFace ? 'Khuôn mặt (Face ID)' : `Thẻ RFID/NFC (${row.cardUid})`}
              </span>
            </div>

            {isFace ? (
              <StatusTag tone="success" label="Đã đồng bộ" icon="circle-check" />
            ) : isSynced ? (
              <StatusTag tone="success" label="Đã đồng bộ (Đã tap thẻ lần đầu)" icon="circle-check" />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <StatusTag tone="warning" label="Chưa đồng bộ (Chờ tap thẻ lần đầu)" icon="clock" />
                {row.cardUid && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSimulateFirstTap(row.cardUid!)}
                    style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                    title="Mô phỏng cán bộ chạm thẻ vào đầu đọc camera để nạp bộ nhớ"
                  >
                    Quẹt thẻ ngay
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'syncedAt',
      title: 'Thời gian đồng bộ',
      width: '180px',
      render: (row) => {
        if (row.status === 'pending_first_tap') {
          return (
            <span className="body-xs" style={{ color: 'var(--semantic-warning)', fontStyle: 'italic' }}>
              Chưa quẹt thẻ lần đầu
            </span>
          );
        }

        const date = new Date(row.syncedAt);
        const formatted = !isNaN(date.getTime())
          ? date.toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : row.syncedAt;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="body-sm-medium" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
              {formatted}
            </span>
            <span className="body-xs" style={{ color: 'var(--semantic-success)', fontSize: '11px' }}>
              • Đã nạp thành công
            </span>
          </div>
        );
      }
    },
    {
      key: 'performedBy',
      title: 'Người thực hiện',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="user-check" size={13} color="var(--text-subtle)" />
          <span className="body-sm" style={{ color: 'var(--text-heading)' }}>
            {row.performedBy}
          </span>
        </div>
      )
    }
  ];

  if (!employee) return null;

  return (
    <SideSheet
      open={open}
      title="Lịch sử đồng bộ lên Camera"
      description={`Theo dõi tình trạng nạp dữ liệu nhận diện vào thiết bị cho cán bộ ${employee.fullName}`}
      icon="camera"
      width={840}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
        {/* Khối thông tin tóm tắt cán bộ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-16)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-12)',
            gap: 'var(--space-16)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.fullName}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-default)'
                }}
              />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '18px'
                }}
              >
                {employee.fullName.charAt(0)}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <span className="body-md-bold" style={{ color: 'var(--text-heading)' }}>
                  {employee.fullName}
                </span>
                <Tag variant="code">{employee.employeeCode}</Tag>
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                {employee.position} • {departmentName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            {employee.faceIdStatus === 'enrolled' ? (
              <StatusTag tone="success" label="Face ID: Đã đồng bộ" icon="camera" />
            ) : (
              <StatusTag tone="neutral" label="Face ID: Chưa lấy mẫu" icon="camera" />
            )}
          </div>
        </div>

        {/* Thông báo nghiệp vụ quy tắc đồng bộ thẻ */}
        <InlineNotice
          tone="info"
          title="Quy tắc đồng bộ thẻ RFID/NFC lên Camera AI"
        >
          Khi quản trị viên gán hoặc đổi mã thẻ vào hồ sơ, mã thẻ <b>chưa tính là đã đồng bộ</b> lên Camera AI.
          Thẻ chỉ được tính là đã đồng bộ khi cán bộ <b>quẹt (tap) thẻ lần đầu tiên</b> tại đầu đọc của Camera AI.
        </InlineNotice>

        {/* Bảng danh sách lịch sử đồng bộ thiết bị */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-12)'
            }}
          >
            <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
              Danh mục thiết bị & Trạng thái đồng bộ ({logs.length} bản ghi):
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="rotate-right"
              onClick={loadHistory}
            >
              Làm mới
            </Button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              <Icon name="spinner" size={24} className="fa-spin" />
              <p style={{ marginTop: '8px' }}>Đang nạp lịch sử đồng bộ từ các camera...</p>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon="camera"
              label="Chưa có dữ liệu đồng bộ lên camera"
              description="Cán bộ này chưa được đồng bộ mẫu ảnh Face ID và chưa có thẻ được quẹt tại camera."
            />
          ) : (
            <DataTable
              columns={columns}
              rows={logs}
              rowKey="id"
              emptyText="Chưa có lịch sử đồng bộ"
            />
          )}
        </div>
      </div>
    </SideSheet>
  );
};
