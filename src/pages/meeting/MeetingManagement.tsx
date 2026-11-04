import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SearchField,
  SelectField,
  Button,
  DataTable,
  Tag,
  StatusTag,
  IconButton
} from '../../design-system';
import { Meeting, MeetingStatus } from '../../types/meeting';
import { meetingService } from '../../services/meeting';
import { MeetingModal } from './MeetingModal';

export interface MeetingManagementProps {
  tenantId: string;
  onOpenLiveScreen?: (meeting: Meeting) => void;
}

export const MeetingManagement: React.FC<MeetingManagementProps> = ({
  tenantId,
  onOpenLiveScreen
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await meetingService.getMeetingsByTenant(tenantId, {
        status: statusFilter !== 'all' ? (statusFilter as MeetingStatus) : undefined,
        search: searchTerm || undefined
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
    setMeetingToEdit(meeting);
    setMeetingModalOpen(true);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cuộc họp "${meeting.title}"?`)) {
      try {
        await meetingService.deleteMeeting(tenantId, meeting.id);
        loadData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi xóa cuộc họp';
        alert(msg);
      }
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
          return <StatusTag tone="info" label="Sắp diễn ra" icon="clock" />;
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
      width: '160px',
      render: (m: Meeting) => (
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            icon="chalkboard-user"
            onClick={() => onOpenLiveScreen && onOpenLiveScreen(m)}
          >
            Điểm danh
          </Button>
          <IconButton
            icon="pen"
            label="Chỉnh sửa cuộc họp"
            size="sm"
            onClick={() => handleOpenEditModal(m)}
          />
          <IconButton
            icon="trash"
            label="Xóa cuộc họp"
            size="sm"
            onClick={() => handleDeleteMeeting(m)}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
      {/* Page Title & Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="h2" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Lên Lịch & Điểm Danh Cuộc Họp
          </h1>
          <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
            Đặc tả MTG-01: Thiết lập cuộc họp, phòng họp, thời gian và triệu tập danh sách đại biểu bắt buộc / tùy chọn theo phòng ban.
          </p>
        </div>
      </div>

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
          tone="info"
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
            style={{ minWidth: '300px' }}
          />

          <SelectField
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
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
        emptyText={
          loading
            ? 'Đang tải danh sách cuộc họp...'
            : 'Không tìm thấy cuộc họp nào phù hợp với bộ lọc.'
        }
        emptyIcon="calendar-days"
        footer={
          <span>
            Hiển thị <b>{meetings.length}</b> cuộc họp
          </span>
        }
      />

      {/* Meeting Modal */}
      <MeetingModal
        open={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        tenantId={tenantId}
        meetingToEdit={meetingToEdit}
        onSuccess={loadData}
      />
    </div>
  );
};
