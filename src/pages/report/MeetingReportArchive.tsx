import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DataTable,
  Tag,
  StatusTag,
  Button,
  SearchField,
  SelectField,
  StatCard
} from '../../design-system';
import { Meeting } from '../../types/meeting';
import { meetingService } from '../../services/meeting';
import { meetingReportService } from '../../services/report';
import { MeetingReportModal } from '../meeting/MeetingReportModal';

export interface MeetingReportArchiveProps {
  tenantId: string;
  orgName?: string;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month';

export const MeetingReportArchive: React.FC<MeetingReportArchiveProps> = ({
  tenantId,
  orgName = 'Ủy Ban Nhân Dân Phường Bến Nghé'
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [selectedMeetingForReport, setSelectedMeetingForReport] = useState<Meeting | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // SPEC DASH-01: Chỉ lấy danh mục các cuộc họp ĐÃ KẾT THÚC (status === 'completed')
      const allMeetings = await meetingService.getMeetingsByTenant(tenantId, {
        status: 'completed'
      });
      // Đảm bảo tuyệt đối không có cuộc họp nào chưa kết thúc
      const concludedOnly = allMeetings.filter((m) => m.status === 'completed');
      setMeetings(concludedOnly);
    } catch (err: unknown) {
      console.error('Lỗi tải danh mục báo cáo cuộc họp:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bộ lọc theo khoảng thời gian và từ khóa tìm kiếm
  const filteredMeetings = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return meetings.filter((m) => {
      // 1. Kiểm tra ngày kết thúc / diễn ra cuộc họp
      const meetingDate = new Date(m.closedAt || m.endTime || m.startTime);
      const meetingDateStr = meetingDate.toISOString().slice(0, 10);

      if (period === 'today') {
        if (meetingDateStr !== todayStr) return false;
      } else if (period === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (meetingDate < oneWeekAgo || meetingDate > now) return false;
      } else if (period === 'month') {
        if (
          meetingDate.getFullYear() !== now.getFullYear() ||
          meetingDate.getMonth() !== now.getMonth()
        ) {
          return false;
        }
      }

      // 2. Tìm kiếm theo tên cuộc họp, chủ trì, phòng họp
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchHost = (m.hostName || '').toLowerCase().includes(q);
        const matchRoom = (m.roomName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchHost && !matchRoom) return false;
      }

      return true;
    });
  }, [meetings, period, searchTerm]);

  // Tổng hợp các chỉ số báo cáo chuyên cần
  const stats = useMemo(() => {
    const totalMeetings = filteredMeetings.length;
    let sumTotalAttendees = 0;
    let sumPresentAttendees = 0;
    let sumAbsentAttendees = 0;
    let sumLateAttendees = 0;

    filteredMeetings.forEach((m) => {
      const rep = meetingReportService.buildMeetingReportData(m, orgName);
      sumTotalAttendees += rep.summary.totalAttendees;
      sumPresentAttendees += rep.summary.presentAttendees;
      sumAbsentAttendees += rep.summary.absentAttendees;
      sumLateAttendees += rep.summary.lateAttendees;
    });

    const avgAttendanceRate =
      sumTotalAttendees > 0
        ? Math.round((sumPresentAttendees / sumTotalAttendees) * 100)
        : totalMeetings > 0
        ? 100
        : 0;

    return {
      totalMeetings,
      avgAttendanceRate,
      sumPresentAttendees,
      sumAbsentAttendees,
      sumLateAttendees
    };
  }, [filteredMeetings, orgName]);

  const periodOptions = [
    { value: 'all', label: 'Tất cả các kỳ' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: '7 ngày qua' },
    { value: 'month', label: 'Tháng này' }
  ];

  const handleExportSummaryExcel = () => {
    const periodLabel =
      periodOptions.find((p) => p.value === period)?.label || 'Tất cả các kỳ';
    meetingReportService.exportConcludedMeetingsSummaryToExcel(
      filteredMeetings,
      orgName,
      periodLabel
    );
  };

  const formatMeetingDate = (iso?: string) => {
    if (!iso) return '--:--';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '--:--';
    }
  };

  const formatMeetingTime = (startIso?: string, endIso?: string) => {
    if (!startIso) return '--:--';
    try {
      const s = new Date(startIso);
      const startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      if (!endIso) return startTime;
      const e = new Date(endIso);
      const endTime = e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return `${startTime} - ${endTime}`;
    } catch {
      return '--:--';
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Tên cuộc họp & Chủ trì',
      width: '320px',
      render: (m: Meeting) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
            {m.title}
          </span>
          {m.hostName && (
            <span className="body-xs" style={{ color: 'var(--eco-blue-strong)' }}>
              👤 {m.hostName}
            </span>
          )}
          {m.description && (
            <span
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {m.description}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'roomName',
      title: 'Phòng họp',
      width: '180px',
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
      title: 'Thời gian thực tế',
      width: '200px',
      render: (m: Meeting) => {
        const timeRange = formatMeetingTime(m.startTime, m.endTime);
        const dateStr = formatMeetingDate(m.closedAt || m.startTime);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span className="body-xs-bold" style={{ color: 'var(--text-body)' }}>
              {timeRange}
            </span>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              {dateStr}
            </span>
          </div>
        );
      }
    },
    {
      key: 'attendees',
      title: 'Đại biểu triệu tập & Có mặt',
      width: '210px',
      render: (m: Meeting) => {
        const rep = meetingReportService.buildMeetingReportData(m, orgName);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
              {rep.summary.presentAttendees} / {rep.summary.totalAttendees} đại biểu
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Tag variant="success">{rep.summary.presentAttendees} có mặt</Tag>
              {rep.summary.lateAttendees > 0 && (
                <Tag variant="warning">{rep.summary.lateAttendees} đến muộn</Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'attendanceRate',
      title: 'Tỷ lệ chuyên cần',
      width: '160px',
      render: (m: Meeting) => {
        const rep = meetingReportService.buildMeetingReportData(m, orgName);
        const rate = rep.summary.attendanceRate;
        if (rate >= 80) {
          return <StatusTag tone="success" label={`${rate}%`} icon="circle-check" />;
        }
        if (rate >= 50) {
          return <StatusTag tone="warning" label={`${rate}%`} icon="circle-half-stroke" />;
        }
        return <StatusTag tone="danger" label={`${rate}%`} icon="circle-exclamation" />;
      }
    },
    {
      key: 'absent',
      title: 'Vắng mặt',
      width: '130px',
      render: (m: Meeting) => {
        const rep = meetingReportService.buildMeetingReportData(m, orgName);
        const absent = rep.summary.absentAttendees;
        if (absent === 0) {
          return <Tag variant="default">0 vắng</Tag>;
        }
        return <StatusTag tone="danger" label={`${absent} vắng`} icon="circle-xmark" />;
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '130px',
      render: (m: Meeting) => (
        <DataTable.RowAction
          label="Tác vụ"
          items={[
            {
              icon: 'file-lines',
              label: 'Xem biên bản họp',
              onClick: () => setSelectedMeetingForReport(m)
            },
            {
              icon: 'file-excel',
              label: 'Tải nhanh file Excel (.csv)',
              onClick: () => meetingReportService.exportMeetingToExcel(m, orgName)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div
      className="meeting-report-archive-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      <div
        style={{
          padding: 'var(--space-20)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)'
        }}
      >
        {/* Aggregate Stat Cards */}
        <StatCard.Group columns={4}>
          <StatCard
            label="Cuộc họp đã kết thúc"
            value={stats.totalMeetings}
            icon="calendar-check"
            tone="info"
          />
          <StatCard
            label="Tỷ lệ chuyên cần trung bình"
            value={`${stats.avgAttendanceRate}%`}
            icon="chart-pie"
            tone="success"
          />
          <StatCard
            label="Tổng lượt đại biểu có mặt"
            value={stats.sumPresentAttendees}
            icon="users"
            tone="info"
          />
          <StatCard
            label="Tổng lượt vắng mặt"
            value={stats.sumAbsentAttendees}
            icon="user-xmark"
            tone={stats.sumAbsentAttendees > 0 ? 'warning' : 'neutral'}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)', alignItems: 'center' }}>
            <SearchField
              placeholder="Tìm theo tên cuộc họp, chủ trì, phòng họp..."
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              width={300}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <span className="body-xs-bold" style={{ color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                Kỳ tổng hợp:
              </span>
              <SelectField
                options={periodOptions}
                value={period}
                onChange={(val) => setPeriod(val as PeriodFilter)}
                width={180}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              🔒 <i>Chỉ hiển thị các cuộc họp đã hoàn tất chốt biên bản</i>
            </div>
            <Button
              variant="secondary"
              icon="file-excel"
              onClick={handleExportSummaryExcel}
              disabled={filteredMeetings.length === 0}
            >
              Xuất Excel Tổng Hợp Kỳ
            </Button>
          </div>
        </div>

        {/* Concluded Meetings DataTable */}
        <DataTable
          columns={columns}
          rows={filteredMeetings}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => (
              <span>
                Hiển thị <b>{total === 0 ? 0 : range[0]} - {range[1]}</b> trên <b>{total}</b> cuộc họp đã hoàn tất & lưu trữ biên bản
              </span>
            )
          }}
          emptyText={
            loading
              ? 'Đang nạp danh mục cuộc họp...'
              : 'Không tìm thấy cuộc họp đã kết thúc nào trong kỳ được chọn.'
          }
          emptyIcon="calendar-days"
        />
      </div>

      {/* Meeting Report Modal */}
      {selectedMeetingForReport && (
        <MeetingReportModal
          onClose={() => setSelectedMeetingForReport(null)}
          meeting={selectedMeetingForReport}
          tenantOrgName={orgName}
        />
      )}
    </div>
  );
};
