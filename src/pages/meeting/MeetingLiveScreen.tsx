import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Tag,
  StatusTag,
  Icon,
  Avatar,
  SearchField,
  InlineNotice,
  StatCard,
  PopupModal
} from '../../design-system';
import { Meeting } from '../../types/meeting';
import { Employee } from '../../types/employee';
import { meetingService } from '../../services/meeting';
import { employeeService } from '../../services/employee';
import { attendanceSettingService } from '../../services/setting';
import { dailyAttendanceService } from '../../services/attendance';
import { DailyAttendanceRecord } from '../../types/attendance';
import { MeetingReportModal } from './MeetingReportModal';

export interface MeetingLiveScreenProps {
  meetingId: string;
  tenantId: string;
  onBack: () => void;
  onMeetingUpdated?: () => void;
}

export const MeetingLiveScreen: React.FC<MeetingLiveScreenProps> = ({
  meetingId,
  tenantId,
  onBack,
  onMeetingUpdated
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'joined' | 'late' | 'early_leave' | 'left' | 'not_joined'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Operation processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Close meeting confirmation modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  // Meeting report modal (MTG-04)
  const [showReportModal, setShowReportModal] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<DailyAttendanceRecord[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mtg, emps] = await Promise.all([
        meetingService.getMeetingById(tenantId, meetingId),
        employeeService.getEmployeesByTenant(tenantId)
      ]);
      setMeeting(mtg);
      setAllEmployees(emps);

      if (mtg) {
        const meetingDate = mtg.startTime.includes('T') ? mtg.startTime.slice(0, 10) : '2026-11-06';
        try {
          const dRecords = await dailyAttendanceService.getDailyAttendance(tenantId, { date: meetingDate });
          setDailyRecords(dRecords);
        } catch {
          // ignore error if offline
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [meetingId, tenantId]);

  // Phân loại đại biểu vắng: Có phép vs Không phép theo quy chuẩn:
  // - Có phép: Cán bộ được duyệt nghỉ Cả ngày, Buổi sáng hoặc Buổi chiều khớp với thời gian diễn ra cuộc họp
  // - Không phép: Cán bộ không tham dự họp và không có thông tin duyệt nghỉ phép trong ca này
  const absentAttendeesAnalysis = useMemo(() => {
    if (!meeting) return { excused: [], unexcused: [] };
    const notJoined = meeting.attendees.filter((a) => !a.attendanceStatus || a.attendanceStatus === 'not_joined');
    const meetingHour = meeting.startTime ? new Date(meeting.startTime).getHours() : 8;
    const isMorningMeeting = meetingHour < 12;

    const excused: Array<{ attendee: (typeof notJoined)[0]; reason: string }> = [];
    const unexcused: Array<{ attendee: (typeof notJoined)[0]; hasCheckedIn: boolean }> = [];

    notJoined.forEach((a) => {
      const dailyRec = dailyRecords.find((r) => r.employeeId === a.employeeId);
      const isLeave =
        dailyRec?.status === 'leave' &&
        (dailyRec.leavePeriod === 'full_day' ||
          (isMorningMeeting && dailyRec.leavePeriod === 'morning') ||
          (!isMorningMeeting && dailyRec.leavePeriod === 'afternoon'));

      if (isLeave) {
        excused.push({
          attendee: a,
          reason:
            dailyRec.note ||
            (dailyRec.leavePeriod === 'full_day'
              ? 'Nghỉ cả ngày (đã duyệt)'
              : isMorningMeeting
              ? 'Nghỉ buổi sáng (đã duyệt)'
              : 'Nghỉ buổi chiều (đã duyệt)')
        });
      } else {
        unexcused.push({
          attendee: a,
          hasCheckedIn: Boolean(dailyRec?.checkInTime)
        });
      }
    });

    return { excused, unexcused };
  }, [meeting, dailyRecords]);

  // Grace deadlines
  const graceMinutes = meeting?.checkInGraceMinutes ?? 5;
  const checkOutGraceMinutes = meeting?.checkOutGraceMinutes ?? 5;
  const maxCheckInTime = meeting
    ? attendanceSettingService.calculateMaxCheckInTime(meeting.startTime, graceMinutes)
    : '--:--';
  const earliestCheckOutTime = meeting
    ? attendanceSettingService.calculateEarliestCheckOutTime(meeting.endTime, checkOutGraceMinutes)
    : '--:--';

  // Statistics
  const attendees = meeting?.attendees || [];
  const totalCount = attendees.length;
  const joinedCount = attendees.filter((a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left').length;
  const onTimeCount = attendees.filter((a) => (a.attendanceStatus === 'joined' || a.attendanceStatus === 'left') && !a.isLate).length;
  const lateCount = attendees.filter((a) => (a.attendanceStatus === 'joined' || a.attendanceStatus === 'left') && a.isLate).length;
  const earlyLeaveCount = attendees.filter((a) => a.isEarlyLeave).length;
  const notJoinedCount = attendees.filter((a) => !a.attendanceStatus || a.attendanceStatus === 'not_joined').length;
  const leftCount = attendees.filter((a) => a.attendanceStatus === 'left').length;
  const attendanceRate = totalCount > 0 ? Math.round((joinedCount / totalCount) * 100) : 0;

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      // Status filter
      if (statusFilter === 'joined' && a.attendanceStatus !== 'joined' && a.attendanceStatus !== 'left') return false;
      if (statusFilter === 'late' && (!a.isLate || (a.attendanceStatus !== 'joined' && a.attendanceStatus !== 'left'))) return false;
      if (statusFilter === 'early_leave' && !a.isEarlyLeave) return false;
      if (statusFilter === 'not_joined' && a.attendanceStatus && a.attendanceStatus !== 'not_joined') return false;
      if (statusFilter === 'left' && a.attendanceStatus !== 'left') return false;

      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          a.fullName.toLowerCase().includes(q) ||
          a.employeeCode.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q) ||
          (a.departmentName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attendees, statusFilter, search]);

  // Handle Check-in from card
  const handleSimulateCheckIn = async (employeeIdToUse?: string) => {
    if (!meeting || !employeeIdToUse) return;

    try {
      setIsProcessing(true);
      const emp = allEmployees.find((e) => e.id === employeeIdToUse);
      const photoUrl = emp?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      const timestamp = new Date().toISOString();

      const res = await meetingService.recordCheckIn(tenantId, meeting.id, employeeIdToUse, {
        method: 'face_id',
        timestamp,
        photoUrl
      });

      setMeeting({ ...res.meeting });
      if (onMeetingUpdated) onMeetingUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi điểm danh');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Check-out from card
  const handleSimulateCheckOut = async (employeeIdToUse?: string) => {
    if (!meeting || !employeeIdToUse) return;

    try {
      setIsProcessing(true);
      const timestamp = new Date().toISOString();

      const res = await meetingService.recordCheckOut(tenantId, meeting.id, employeeIdToUse, {
        timestamp
      });

      setMeeting({ ...res.meeting });
      if (onMeetingUpdated) onMeetingUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi khi điểm danh ra về');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Close Meeting Modal (opens modal immediately & refreshes daily records)
  const handleOpenCloseModal = () => {
    setShowCloseModal(true);
    if (meeting) {
      const meetingDate = meeting.startTime.includes('T') ? meeting.startTime.slice(0, 10) : '2026-11-06';
      dailyAttendanceService
        .getDailyAttendance(tenantId, { date: meetingDate })
        .then((dRecords) => setDailyRecords(dRecords))
        .catch(() => {});
    }
  };

  // Close Meeting
  const handleConfirmClose = async () => {
    if (!meeting) return;
    try {
      const closed = await meetingService.closeMeeting(tenantId, meeting.id, 'Đ/c Nguyễn Văn An');
      setMeeting({ ...closed });
      setShowCloseModal(false);
      if (onMeetingUpdated) onMeetingUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể kết thúc cuộc họp');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subtle)' }}>
        Đang tải dữ liệu màn hình điểm danh trực tiếp...
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--semantic-danger)' }}>
        <p>{error || 'Không tìm thấy cuộc họp'}</p>
        <Button variant="secondary" onClick={onBack}>Quay lại danh sách</Button>
      </div>
    );
  }

  const formatMeetingTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getStatusBadge = () => {
    if (meeting.status === 'completed') {
      return <StatusTag tone="success" label="Đã kết thúc" icon="circle-check" />;
    }
    if (meeting.status === 'in_progress') {
      return <StatusTag tone="warning" label="Đang diễn ra" icon="circle-dot" />;
    }
    return <StatusTag tone="neutral" label="Sắp diễn ra" icon="clock" />;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-canvas)',
        overflow: 'hidden'
      }}
    >
      {/* 1. Header Bar: Meeting Info & Live Status */}
      <header
        style={{
          flex: 'none',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <Button variant="ghost" onClick={onBack} title="Quay lại bảng cuộc họp">
            <Icon name="arrow-left" size={14} style={{ marginRight: '6px' }} />
            Quay lại
          </Button>

          <div style={{ height: '36px', width: '1px', backgroundColor: 'var(--border-default)' }} />

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                className="title-sm"
                style={{
                  margin: 0,
                  color: 'var(--text-heading)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {meeting.title}
              </h2>
              {getStatusBadge()}
            </div>
            <div
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '2px'
              }}
            >
              <span>
                <Icon name="location-dot" size={11} style={{ marginRight: '4px' }} />
                {meeting.roomName}
              </span>
              <span>
                <Icon name="clock" size={11} style={{ marginRight: '4px' }} />
                {formatMeetingTime(meeting.startTime)} - {formatMeetingTime(meeting.endTime)}
              </span>
              {meeting.hostName && (
                <span>
                  <Icon name="user-tie" size={11} style={{ marginRight: '4px' }} />
                  {meeting.hostName}
                </span>
              )}
            </div>
            {meeting.description && (
              <div
                className="body-xs"
                style={{
                  color: 'var(--text-subtle)',
                  marginTop: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={meeting.description}
              >
                {meeting.description}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {meeting.status === 'in_progress' && (
            <Button
              variant="secondary"
              icon="flag-checkered"
              style={{
                borderColor: 'var(--semantic-danger)',
                color: 'var(--semantic-danger)'
              }}
              onClick={handleOpenCloseModal}
            >
              Kết thúc cuộc họp
            </Button>
          )}

          {meeting.status === 'completed' && (
            <>
              <Button
                variant="secondary"
                icon="file-lines"
                onClick={() => setShowReportModal(true)}
              >
                Biên bản & Báo cáo
              </Button>
              <Button
                variant="secondary"
                icon="flag-checkered"
                style={{
                  borderColor: 'var(--semantic-danger)',
                  color: 'var(--semantic-danger)'
                }}
                onClick={handleOpenCloseModal}
              >
                Kết thúc cuộc họp
              </Button>
            </>
          )}
        </div>
      </header>

      {/* 2. Top Notice Banner with Grace Period Deadlines */}
      <div
        style={{
          flex: 'none',
          backgroundColor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af' }} className="body-xs">
            <Icon name="circle-info" size={13} />
            <span>
              Mốc vào trễ: Điểm danh trước <b>{maxCheckInTime}</b> (dung sai <b>{graceMinutes} phút</b>). Sau giờ này tự động tính đi muộn.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }} className="body-xs">
            <Icon name="door-open" size={13} />
            <span>
              Mốc về sớm: Được phép check-out từ <b>{earliestCheckOutTime}</b> (dung sai <b>{checkOutGraceMinutes} phút</b>).
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 Finalized Session Banner (MTG-03) */}
      {meeting.status === 'completed' && meeting.summary && (
        <div
          style={{
            flex: 'none',
            margin: '12px 24px 0 24px',
            padding: '12px 18px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-8)',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon name="lock" size={16} />
            </div>
            <div>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                Biên bản cuộc họp đã được chốt
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                Đóng lúc {new Date(meeting.closedAt || '').toLocaleTimeString('vi-VN')} ngày{' '}
                {new Date(meeting.closedAt || '').toLocaleDateString('vi-VN')} · Người chốt:{' '}
                <b>{meeting.closedBy || 'Chủ tọa'}</b>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            icon="file-lines"
            onClick={() => setShowReportModal(true)}
          >
            Biên bản & Báo cáo
          </Button>
        </div>
      )}

      {/* 3. Stat Cards Row */}
      <div
        style={{
          flex: 'none',
          padding: '16px 24px 8px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px'
        }}
      >
        <StatCard
          label="Tổng đại biểu triệu tập"
          value={totalCount}
          icon="users"
          tone="neutral"
        />
        <StatCard
          label="Đúng giờ"
          value={onTimeCount}
          icon="circle-check"
          tone="success"
        />
        <StatCard
          label="Đi muộn"
          value={lateCount}
          icon="triangle-exclamation"
          tone="warning"
        />
        <StatCard
          label="Về sớm"
          value={earlyLeaveCount}
          icon="door-open"
          tone="warning"
        />
        <StatCard
          label="Chưa đến/ Không tham dự"
          value={notJoinedCount}
          icon="clock"
          tone="neutral"
        />
        <StatCard
          label="Tỷ lệ tham dự"
          value={`${attendanceRate}%`}
          icon="chart-pie"
          tone="info"
        />
      </div>

      {/* 4. Main Body: Attendees Roll-call Roster */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 24px 20px 24px',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-8)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Roster Controls: Search + Filter Tabs */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flex: 1,
                minWidth: 0,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ width: '280px', flexShrink: 0 }}>
                <SearchField
                  placeholder="Tìm đại biểu theo tên, mã, chức vụ..."
                  value={search}
                  onChange={setSearch}
                  block
                />
              </div>

              {/* Filter buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'all' ? 'ecomd-tag--default is-active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'all' ? 'var(--eco-blue-subtle)' : 'var(--bg-subtle)' }}
                >
                  Tất cả ({totalCount})
                </button>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'joined' ? 'ecomd-tag--success is-active' : ''}`}
                  onClick={() => setStatusFilter('joined')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'joined' ? '#dcfce7' : 'var(--bg-subtle)' }}
                >
                  Đã đến ({joinedCount})
                </button>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'late' ? 'ecomd-tag--warning is-active' : ''}`}
                  onClick={() => setStatusFilter('late')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'late' ? '#fef3c7' : 'var(--bg-subtle)' }}
                >
                  Đi muộn ({lateCount})
                </button>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'early_leave' ? 'ecomd-tag--warning is-active' : ''}`}
                  onClick={() => setStatusFilter('early_leave')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'early_leave' ? '#ffedd5' : 'var(--bg-subtle)' }}
                >
                  Về sớm ({earlyLeaveCount})
                </button>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'not_joined' ? 'ecomd-tag--default is-active' : ''}`}
                  onClick={() => setStatusFilter('not_joined')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'not_joined' ? 'var(--border-default)' : 'var(--bg-subtle)' }}
                >
                  Chưa đến/ Không tham dự ({notJoinedCount})
                </button>
                <button
                  type="button"
                  className={`ecomd-tag ${statusFilter === 'left' ? 'ecomd-tag--default is-active' : ''}`}
                  onClick={() => setStatusFilter('left')}
                  style={{ cursor: 'pointer', border: 'none', background: statusFilter === 'left' ? '#e0f2fe' : 'var(--bg-subtle)' }}
                >
                  Đã về ({leftCount})
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Cards vs Table */}
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-6)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: viewMode === 'cards' ? 'var(--eco-blue-subtle)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--brand-primary)' : 'var(--text-subtle)',
                  cursor: 'pointer'
                }}
                title="Dạng thẻ trực quan"
              >
                <Icon name="grip" size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? 'var(--eco-blue-subtle)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--brand-primary)' : 'var(--text-subtle)',
                  cursor: 'pointer'
                }}
                title="Dạng bảng chi tiết"
              >
                <Icon name="table-list" size={13} />
              </button>
            </div>
          </div>

          {/* Attendees Content: Table View vs Cards Grid */}
          {viewMode === 'table' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-subtle)',
                      textAlign: 'left',
                      color: 'var(--text-subtle)'
                    }}
                  >
                    <th style={{ padding: '8px 12px' }}>Đại biểu</th>
                    <th style={{ padding: '8px 12px' }}>Phòng ban</th>
                    <th style={{ padding: '8px 12px' }}>Check-in</th>
                    <th style={{ padding: '8px 12px' }}>Check-out</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Thời lượng</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Kết luận chuyên cần</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-subtle)' }}>
                        Không có đại biểu nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((att) => (
                      <tr key={att.employeeId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar src={att.checkInPhoto || att.avatarUrl} name={att.fullName} size="sm" />
                            <div>
                              <div className="body-xs-bold" style={{ color: 'var(--text-heading)' }}>
                                {att.fullName}
                              </div>
                              <div className="caption" style={{ color: 'var(--text-subtle)' }}>
                                {att.position}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-body)' }}>{att.departmentName}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {att.checkInTime ? (
                            <div>
                              <span style={{ fontWeight: 600, color: att.isLate ? '#b45309' : '#15803d' }}>
                                {new Date(att.checkInTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {att.isLate && (
                                <span className="caption" style={{ color: '#b45309', display: 'block' }}>
                                  Muộn {att.lateMinutes}p
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>--:--</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {att.checkOutTime ? (
                            <div>
                              <span style={{ fontWeight: 600, color: att.isEarlyLeave ? '#b45309' : '#2563eb' }}>
                                {new Date(att.checkOutTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {att.isEarlyLeave && (
                                <span className="caption" style={{ color: '#b45309', display: 'block' }}>
                                  Sớm {att.earlyLeaveMinutes}p
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>--:--</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>
                          {att.durationMinutes !== undefined && att.durationMinutes > 0
                            ? `${att.durationMinutes} phút`
                            : '--'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          {att.attendanceStatus === 'left' ? (
                            att.isEarlyLeave ? (
                              <Tag variant="warning">Về sớm</Tag>
                            ) : att.isLate ? (
                              <Tag variant="warning">Đến muộn</Tag>
                            ) : (
                              <Tag variant="success">Trọn vẹn</Tag>
                            )
                          ) : att.attendanceStatus === 'joined' ? (
                            <Tag variant="default">Đang trong phòng</Tag>
                          ) : (
                            (() => {
                              const abs = absentAttendeesAnalysis.excused.find((x) => x.attendee.employeeId === att.employeeId);
                              if (abs) {
                                return (
                                  <Tag variant="default">
                                    <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Có phép</span>
                                  </Tag>
                                );
                              }
                              if (meeting.status === 'completed') {
                                return <StatusTag tone="danger">Không phép</StatusTag>;
                              }
                              return <Tag variant="default">Chưa đến</Tag>;
                            })()
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Attendees Cards List */
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                alignContent: 'start'
              }}
            >
              {filteredAttendees.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '48px 16px',
                    color: 'var(--text-subtle)'
                  }}
                >
                  <Icon name="user-slash" size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p className="body-sm" style={{ margin: 0 }}>
                    Không tìm thấy đại biểu phù hợp điều kiện lọc.
                  </p>
                </div>
              ) : (
                filteredAttendees.map((att) => {
                  const isJoined = att.attendanceStatus === 'joined' || att.attendanceStatus === 'left';
                  const isLeft = att.attendanceStatus === 'left';

                  return (
                    <div
                      key={att.employeeId}
                      style={{
                        border: isJoined
                          ? att.isLate
                            ? '1px solid #fcd34d'
                            : '1px solid #86efac'
                          : '1px solid var(--border-default)',
                        backgroundColor: isJoined
                          ? att.isLate
                            ? '#fffbeb'
                            : '#f0fdf4'
                          : 'var(--bg-surface)',
                        borderRadius: 'var(--radius-8)',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Top Row: Avatar, Name, Role badge */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <Avatar
                            src={att.checkInPhoto || att.avatarUrl}
                            name={att.fullName}
                            size="md"
                          />
                          {isJoined && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: att.isLate ? 'var(--semantic-warning)' : 'var(--semantic-success)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px'
                              }}
                            >
                              <Icon name={att.checkInMethod === 'card' ? 'id-card' : 'camera'} size={8} />
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              className="body-sm-bold"
                              style={{
                                color: 'var(--text-heading)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {att.fullName}
                            </span>
                            {att.isAdHoc && (
                              <Tag variant="warning">Khách mời</Tag>
                            )}
                            {!isJoined && (
                              (() => {
                                const abs = absentAttendeesAnalysis.excused.find((x) => x.attendee.employeeId === att.employeeId);
                                if (abs) {
                                  return (
                                    <Tag variant="default">
                                      <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Có phép</span>
                                    </Tag>
                                  );
                                }
                                if (meeting.status === 'completed') {
                                  return <StatusTag tone="danger">Không phép</StatusTag>;
                                }
                                return null;
                              })()
                            )}
                          </div>
                          <div
                            className="body-xs"
                            style={{
                              color: 'var(--text-subtle)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {att.position}
                          </div>
                          <div
                            className="caption"
                            style={{
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {att.departmentName}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Attendance Status Details */}
                      <div
                        style={{
                          padding: '6px 8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          borderRadius: 'var(--radius-6)',
                          border: '1px solid rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px'
                        }}
                      >
                        {isJoined ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon
                                name={att.isLate ? 'triangle-exclamation' : 'circle-check'}
                                size={12}
                                style={{ color: att.isLate ? '#d97706' : '#16a34a' }}
                              />
                              <span style={{ fontWeight: 600, color: att.isLate ? '#b45309' : '#15803d' }}>
                                {att.isLate ? `Đi muộn (${att.lateMinutes}p)` : 'Đúng giờ'}
                              </span>
                              <span style={{ color: 'var(--text-subtle)' }}>
                                [{att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}]
                              </span>
                            </div>

                            {isLeft ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <span style={{ color: att.isEarlyLeave ? '#b45309' : '#2563eb', fontWeight: 600 }}>
                                  {att.isEarlyLeave ? `Về sớm (${att.earlyLeaveMinutes}p)` : 'Đúng giờ'}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                                  Rời [{att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}]
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>
                                {att.checkInMethod === 'face_id' ? 'Face ID' : att.checkInMethod === 'card' ? 'Thẻ RFID' : 'Thủ công'}
                              </span>
                            )}
                          </>
                        ) : (
                          (() => {
                            const abs = absentAttendeesAnalysis.excused.find((x) => x.attendee.employeeId === att.employeeId);
                            if (abs) {
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-700)' }}>
                                  <Icon name="calendar-check" size={12} color="var(--primary-600)" />
                                  <span style={{ fontWeight: 600 }}>Có phép:</span>
                                  <span style={{ color: 'var(--text-subtle)' }}>{abs.reason}</span>
                                </div>
                              );
                            }
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)' }}>
                                <Icon name="hourglass-half" size={11} />
                                <span>{meeting.status === 'completed' ? 'Vắng không phép' : 'Chưa có mặt tại phòng họp'}</span>
                              </div>
                            );
                          })()
                        )}
                      </div>

                      {/* Duration Info */}
                      {att.durationMinutes !== undefined && att.durationMinutes > 0 && (
                        <div
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            borderRadius: 'var(--radius-4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: 'var(--text-heading)'
                          }}
                        >
                          <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="clock" size={10} />
                            Thời lượng tham dự:
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                            {att.durationMinutes} phút
                          </span>
                        </div>
                      )}

                      {/* Action buttons on card */}
                      {meeting.status !== 'completed' && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          {!isJoined ? (
                            <Button
                              variant="secondary"
                              style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleSimulateCheckIn(att.employeeId)}
                              disabled={isProcessing}
                            >
                              <Icon name="check" size={11} style={{ marginRight: '4px' }} />
                              Check-in
                            </Button>
                          ) : !isLeft ? (
                            <Button
                              variant="ghost"
                              style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleSimulateCheckOut(att.employeeId)}
                              disabled={isProcessing}
                            >
                              <Icon name="arrow-right-from-bracket" size={11} style={{ marginRight: '4px' }} />
                              Check-out
                            </Button>
                          ) : (
                            <span className="caption" style={{ color: 'var(--text-subtle)', margin: 'auto' }}>
                              Đã hoàn thành phiên họp
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Close Meeting */}
      {showCloseModal && (
        <PopupModal
          open={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          title="Xác nhận kết thúc cuộc họp"
          description="Hệ thống sẽ chốt dữ liệu chuyên cần và chuyển trạng thái cuộc họp sang Đã kết thúc (bất biến)."
          width={520}
          primaryAction={{
            label: 'Xác nhận kết thúc',
            onClick: handleConfirmClose
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            onClick: () => setShowCloseModal(false)
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InlineNotice
              tone="warning"
              label="Sau khi kết thúc, dữ liệu danh sách điểm danh và ảnh đối soát sẽ được lưu cố định làm biên bản cuộc họp."
            />
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-6)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tóm tắt chuyên cần hiện tại:</div>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                {joinedCount} / {totalCount} đại biểu tham dự ({attendanceRate}%) • {lateCount} đi muộn • {notJoinedCount} vắng mặt
              </div>

              {notJoinedCount > 0 && (
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-neutral-subtle)', paddingTop: '8px' }}>
                  {/* Đại biểu vắng có phép */}
                  {absentAttendeesAnalysis.excused.length > 0 && (
                    <div style={{ backgroundColor: '#eff6ff', padding: '8px 10px', borderRadius: 'var(--radius-6)', border: '1px solid #bfdbfe' }}>
                      <div className="body-xs-bold" style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Icon name="calendar-check" size={13} color="#2563eb" />
                        Vắng có phép ({absentAttendeesAnalysis.excused.length} đại biểu):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {absentAttendeesAnalysis.excused.map((item) => (
                          <div key={item.attendee.employeeId} className="body-xs" style={{ color: '#1e40af' }}>
                            • <b>{item.attendee.fullName}</b> ({item.attendee.departmentName}): {item.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Đại biểu vắng không phép */}
                  {absentAttendeesAnalysis.unexcused.length > 0 && (
                    <div style={{ backgroundColor: '#fef2f2', padding: '8px 10px', borderRadius: 'var(--radius-6)', border: '1px solid #fecaca' }}>
                      <div className="body-xs-bold" style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Icon name="triangle-exclamation" size={13} color="#ef4444" />
                        Vắng không phép ({absentAttendeesAnalysis.unexcused.length} đại biểu):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {absentAttendeesAnalysis.unexcused.map((item) => (
                          <div key={item.attendee.employeeId} className="body-xs" style={{ color: '#991b1b' }}>
                            • <b>{item.attendee.fullName}</b> ({item.attendee.departmentName}) — {item.hasCheckedIn ? 'Đã vào ca nhưng không tham dự họp' : 'Chưa có thông tin xin phép'}
                          </div>
                        ))}
                      </div>
                      <div className="caption" style={{ color: '#b91c1c', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.4 }}>
                        * Nếu đại biểu đã báo trước, Quản trị viên có thể bấm <b>Hủy bỏ</b> để sang màn hình <b>Chấm công</b> xác nhận nghỉ phép cho đại biểu, sau đó quay lại chốt họp để hệ thống tự động ghi nhận <b>Có phép</b>.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopupModal>
      )}

      {/* Meeting Report Modal (MTG-04) */}
      {showReportModal && meeting && (
        <MeetingReportModal
          meeting={meeting}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
