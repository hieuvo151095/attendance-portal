import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SearchField,
  SelectField,
  Button,
  DataTable,
  Tag,
  StatusTag,
  Icon,
  PopupModal,
  InlineNotice,
  toast
} from '../../design-system';
import { Meeting, MeetingStatus } from '../../types/meeting';
import { meetingService } from '../../services/meeting';
import { MeetingModal } from './MeetingModal';
import { MeetingLiveScreen } from './MeetingLiveScreen';
import { MeetingReportModal } from './MeetingReportModal';
import { MeetingReportArchive } from '../report/MeetingReportArchive';

export interface MeetingManagementProps {
  tenantId: string;
  orgName?: string;
  initialSubTab?: 'list' | 'reports';
  onSubTabChange?: (tab: 'list' | 'reports') => void;
  onOpenLiveScreen?: (meeting: Meeting) => void;
}

export const MeetingManagement: React.FC<MeetingManagementProps> = ({
  tenantId,
  orgName,
  initialSubTab = 'list',
  onSubTabChange,
  onOpenLiveScreen
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'reports'>(initialSubTab);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabChange = (tab: 'list' | 'reports') => {
    setActiveSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
  const [activeLiveMeeting, setActiveLiveMeeting] = useState<Meeting | null>(null);
  const [reportingMeeting, setReportingMeeting] = useState<Meeting | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await meetingService.getMeetingsByTenant(tenantId, {
        status: statusFilter !== 'all' ? (statusFilter as MeetingStatus) : undefined,
        search: searchTerm || undefined
      });
      // Sắp xếp ưu tiên: Đang diễn ra -> Sắp diễn ra -> Đã kết thúc
      const statusOrder: Record<string, number> = {
        in_progress: 1,
        scheduled: 2,
        completed: 3,
        cancelled: 4
      };
      list.sort((a, b) => {
        const orderDiff = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
        if (orderDiff !== 0) return orderDiff;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      setMeetings(list);
    } catch (err) {
      console.error('Lỗi tải danh sách cuộc họp:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, statusFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistics
  const totalCount = meetings.length;
  const scheduledCount = meetings.filter((m) => m.status === 'scheduled').length;
  const inProgressCount = meetings.filter((m) => m.status === 'in_progress').length;
  const completedCount = meetings.filter((m) => m.status === 'completed').length;

  const handleOpenAddModal = () => {
    setMeetingToEdit(null);
    setMeetingModalOpen(true);
  };

  const handleOpenEditModal = (meeting: Meeting) => {
    if (meeting.status !== 'scheduled') return;
    setMeetingToEdit(meeting);
    setMeetingModalOpen(true);
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
  };

  const handleConfirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    setIsDeletingMeeting(true);
    try {
      await meetingService.deleteMeeting(tenantId, meetingToDelete.id);
      const deletedTitle = meetingToDelete.title;
      setMeetingToDelete(null);
      loadData();
      toast.success(`Đã xóa cuộc họp "${deletedTitle}" thành công.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa cuộc họp';
      toast.danger(msg);
    } finally {
      setIsDeletingMeeting(false);
    }
  };

  const statusFilterOptions = [
    { value: 'all', label: 'Tất cả trạng thái cuộc họp' },
    { value: 'scheduled', label: 'Sắp diễn ra' },
    { value: 'in_progress', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Đã kết thúc' }
  ];

  const formatMeetingTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startTimeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endTimeStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    const dateStr = start.toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return `${startTimeStr} - ${endTimeStr}, ${dateStr}`;
  };

  const columns = [
    {
      key: 'title',
      title: 'Tên cuộc họp & Chủ trì',
      width: '280px',
      render: (m: Meeting) => (
        <div>
          <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
            {m.title}
          </div>
          {m.hostName && (
            <div className="body-xs" style={{ color: 'var(--eco-blue-strong)', marginTop: '2px' }}>
              👤 {m.hostName}
            </div>
          )}
          {m.description && (
            <div
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                marginTop: '2px',
                maxWidth: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {m.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'roomName',
      title: 'Phòng họp',
      width: '200px',
      render: (m: Meeting) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <span style={{ color: 'var(--text-subtle)' }}>📍</span>
          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
            {m.roomName}
          </span>
        </div>
      )
    },
    {
      key: 'time',
      title: 'Thời gian diễn ra',
      width: '210px',
      render: (m: Meeting) => (
        <div className="body-xs" style={{ color: 'var(--text-body)' }}>
          {formatMeetingTime(m.startTime, m.endTime)}
        </div>
      )
    },
    {
      key: 'attendees',
      title: 'Đại biểu triệu tập (MTG-01)',
      width: '200px',
      render: (m: Meeting) => {
        const required = m.attendees.filter((a) => a.role === 'required').length;
        const optional = m.attendees.length - required;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
              {m.attendees.length} đại biểu
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Tag variant="default">{required} bắt buộc</Tag>
              {optional > 0 && <Tag variant="warning">{optional} tùy chọn</Tag>}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '140px',
      render: (m: Meeting) => {
        if (m.status === 'scheduled') {
          return <StatusTag tone="neutral" label="Sắp diễn ra" icon="clock" />;
        }
        if (m.status === 'in_progress') {
          return <StatusTag tone="warning" label="Đang diễn ra" icon="circle-dot" />;
        }
        if (m.status === 'completed') {
          return <StatusTag tone="success" label="Đã kết thúc" icon="circle-check" />;
        }
        return <StatusTag tone="danger" label="Đã hủy" icon="circle-xmark" />;
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '90px',
      render: (m: Meeting) => (
        <DataTable.RowAction
          label="Thao tác"
          items={[
            {
              icon: 'chalkboard-user',
              label: 'Thống kê điểm danh',
              onClick: () => {
                setActiveLiveMeeting(m);
                if (onOpenLiveScreen) onOpenLiveScreen(m);
              }
            },
            {
              icon: 'pen',
              label: 'Chỉnh sửa cuộc họp',
              disabled: m.status !== 'scheduled',
              onClick: () => handleOpenEditModal(m)
            },
            {
              divider: true
            },
            {
              icon: 'trash',
              label: 'Xóa cuộc họp',
              tone: 'danger',
              onClick: () => handleDeleteMeeting(m)
            }
          ]}
        />
      )
    }
  ];

  if (activeLiveMeeting) {
    return (
      <MeetingLiveScreen
        meetingId={activeLiveMeeting.id}
        tenantId={tenantId}
        onBack={() => {
          setActiveLiveMeeting(null);
          loadData();
        }}
        onMeetingUpdated={loadData}
      />
    );
  }

  return (
    <div
      className="meeting-management-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Page Title, Overview & Sub-Tabs (OUTSIDE all sections) */}
      <div
        data-testid="meeting-page-header"
        style={{
          padding: '4px 0 0',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'transparent',
          flexShrink: 0,
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-16)',
            marginBottom: '14px'
          }}
        >
          <div>
            <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
              Lên Lịch & Điểm Danh Cuộc Họp
            </h1>
            <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
              Thiết lập cuộc họp, phòng họp, thời gian và triệu tập danh sách đại biểu bắt buộc / tùy chọn theo phòng ban.
            </p>
          </div>
        </div>

        {/* Sub-tabs Switcher */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            data-testid="subtab-meeting-list"
            onClick={() => handleSubTabChange('list')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeSubTab === 'list' ? '2px solid var(--eco-blue-strong)' : '2px solid transparent',
              color: activeSubTab === 'list' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeSubTab === 'list' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="calendar-check" size={15} />
            <span>Lịch Họp & Điểm Danh</span>
          </button>

          <button
            type="button"
            data-testid="subtab-meeting-reports"
            onClick={() => handleSubTabChange('reports')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeSubTab === 'reports' ? '2px solid var(--eco-blue-strong)' : '2px solid transparent',
              color: activeSubTab === 'reports' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeSubTab === 'reports' ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="file-lines" size={15} />
            <span>Báo Cáo & Lưu Trữ Biên Bản</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'reports' ? (
        <MeetingReportArchive tenantId={tenantId} orgName={orgName} />
      ) : (
        <div
          className="dashboard-card"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-12)',
            padding: '22px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-16)'
          }}
        >
          {/* Summary StatCards */}
          <StatCard.Group columns={4}>
            <StatCard
              label="Tổng cuộc họp"
              value={totalCount}
              icon="calendar-days"
              tone="neutral"
            />
            <StatCard
              label="Sắp diễn ra"
              value={scheduledCount}
              icon="clock"
              tone="neutral"
            />
            <StatCard
              label="Đang diễn ra"
              value={inProgressCount}
              icon="circle-dot"
              tone="warning"
            />
            <StatCard
              label="Đã kết thúc"
              value={completedCount}
              icon="circle-check"
              tone="success"
            />
          </StatCard.Group>

          {/* Toolbar & Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-12)',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-16)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-12)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)', alignItems: 'center', flex: 1 }}>
              <SearchField
                placeholder="Tìm theo tên cuộc họp, phòng họp, người chủ trì..."
                value={searchTerm}
                onChange={(val) => setSearchTerm(val)}
                width={300}
              />

              <SelectField
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                width={200}
              />
            </div>

            <div>
              <Button
                variant="primary"
                icon="calendar-plus"
                onClick={handleOpenAddModal}
              >
                Tạo cuộc họp mới
              </Button>
            </div>
          </div>

          {/* Meetings Data Table */}
          <DataTable
            columns={columns}
            rows={meetings}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => (
                <span>
                  Hiển thị <b>{total === 0 ? 0 : range[0]} - {range[1]}</b> trên <b>{total}</b> cuộc họp
                </span>
              )
            }}
            emptyText={
              loading
                ? 'Đang tải danh sách cuộc họp...'
                : 'Không tìm thấy cuộc họp nào phù hợp với bộ lọc.'
            }
            emptyIcon="calendar-days"
          />
        </div>
      )}

      {/* Meeting Modal / SideSheet */}
      <MeetingModal
        open={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        tenantId={tenantId}
        meetingToEdit={meetingToEdit}
        onSuccess={() => {
          loadData();
          toast.success(
            meetingToEdit
              ? `Đã cập nhật thông tin cuộc họp "${meetingToEdit.title}" thành công.`
              : 'Đã lên lịch cuộc họp mới thành công.'
          );
        }}
      />

      {/* Meeting Report Modal (MTG-04) */}
      {reportingMeeting && (
        <MeetingReportModal
          meeting={reportingMeeting}
          onClose={() => setReportingMeeting(null)}
        />
      )}

      {/* Delete Meeting Confirmation PopupModal */}
      {meetingToDelete && (
        <PopupModal
          open={!!meetingToDelete}
          icon="triangle-exclamation"
          title="Xác Nhận Xóa Cuộc Họp"
          description={`Bạn có chắc chắn muốn xóa cuộc họp "${meetingToDelete.title}" khỏi hệ thống không?`}
          width={460}
          onClose={() => !isDeletingMeeting && setMeetingToDelete(null)}
          primaryAction={{
            label: isDeletingMeeting ? 'Đang xóa...' : 'Xóa cuộc họp',
            icon: 'trash',
            onClick: handleConfirmDeleteMeeting,
            disabled: isDeletingMeeting
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            onClick: () => setMeetingToDelete(null),
            disabled: isDeletingMeeting
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)',
                fontSize: '13px',
                lineHeight: '20px',
                color: 'var(--text-body)'
              }}
            >
              <div><strong>Tên cuộc họp:</strong> {meetingToDelete.title}</div>
              {meetingToDelete.roomName && <div style={{ marginTop: '2px' }}><strong>Phòng họp:</strong> {meetingToDelete.roomName}</div>}
              {meetingToDelete.hostName && <div style={{ marginTop: '2px' }}><strong>Chủ trì:</strong> {meetingToDelete.hostName}</div>}
              <div style={{ marginTop: '2px' }}><strong>Đại biểu triệu tập:</strong> {meetingToDelete.attendees?.length || 0} cán bộ</div>
            </div>

            <InlineNotice tone="warning">
              Hành động này sẽ xóa vĩnh viễn cuộc họp và các dữ liệu điểm danh liên quan.
            </InlineNotice>
          </div>
        </PopupModal>
      )}
    </div>
  );
};
