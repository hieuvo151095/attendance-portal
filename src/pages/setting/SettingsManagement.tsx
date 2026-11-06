import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  TextField,
  SelectField,
  InlineNotice,
  Icon,
  Tag,
  StatusTag,
  DataTable,
  StatCard,
  SearchField,
  PopupModal
} from '../../design-system';
import { OfficeRoom } from '../../types/room';
import { attendanceSettingService } from '../../services/setting';
import { roomService } from '../../services/room';
import { RoomModal } from './RoomModal';

export interface SettingsManagementProps {
  tenantId: string;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'rooms'>('attendance');

  // --- 1. Attendance Settings State ---
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  const [workStartTime, setWorkStartTime] = useState('07:00');
  const [workEndTime, setWorkEndTime] = useState('16:00');
  const [morningStartTime, setMorningStartTime] = useState('07:00');
  const [morningEndTime, setMorningEndTime] = useState('11:30');
  const [afternoonStartTime, setAfternoonStartTime] = useState('13:30');
  const [afternoonEndTime, setAfternoonEndTime] = useState('16:00');
  const [workCheckInGraceMinutes, setWorkCheckInGraceMinutes] = useState(30);
  const [workCheckOutGraceMinutes, setWorkCheckOutGraceMinutes] = useState(30);
  const [targetOnTimeRate, setTargetOnTimeRate] = useState(90);

  const [defaultMeetingCheckInGraceMinutes, setDefaultMeetingCheckInGraceMinutes] = useState(5);
  const [defaultMeetingCheckOutGraceMinutes, setDefaultMeetingCheckOutGraceMinutes] = useState(5);
  const [meetingEarlyOpenMinutes, setMeetingEarlyOpenMinutes] = useState(15);
  const [meetingTargetAttendanceRate, setMeetingTargetAttendanceRate] = useState<string>('90');
  const [meetingTargetOnTimeRate, setMeetingTargetOnTimeRate] = useState<string>('85');

  // --- 2. Office Rooms State ---
  const [rooms, setRooms] = useState<OfficeRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('');
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<OfficeRoom | null>(null);
  const [roomNotice, setRoomNotice] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<OfficeRoom | null>(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  // Load Settings
  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    setSettingsError(null);
    try {
      const s = await attendanceSettingService.getSettings(tenantId);
      setWorkStartTime(s.workStartTime || '07:00');
      setWorkEndTime(s.workEndTime || '16:00');
      setMorningStartTime(s.morningStartTime || '07:00');
      setMorningEndTime(s.morningEndTime || '11:30');
      setAfternoonStartTime(s.afternoonStartTime || '13:30');
      setAfternoonEndTime(s.afternoonEndTime || '16:00');
      setWorkCheckInGraceMinutes(s.workCheckInGraceMinutes ?? 30);
      setWorkCheckOutGraceMinutes(s.workCheckOutGraceMinutes ?? 30);
      setTargetOnTimeRate(s.targetOnTimeRate ?? 90);
      setDefaultMeetingCheckInGraceMinutes(s.defaultMeetingCheckInGraceMinutes ?? 5);
      setDefaultMeetingCheckOutGraceMinutes(s.defaultMeetingCheckOutGraceMinutes ?? 5);
      setMeetingEarlyOpenMinutes(s.meetingEarlyOpenMinutes ?? 15);
      setMeetingTargetAttendanceRate(
        s.meetingTargetAttendanceRate !== undefined && s.meetingTargetAttendanceRate !== null
          ? String(s.meetingTargetAttendanceRate)
          : ''
      );
      setMeetingTargetOnTimeRate(
        s.meetingTargetOnTimeRate !== undefined && s.meetingTargetOnTimeRate !== null
          ? String(s.meetingTargetOnTimeRate)
          : ''
      );
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : 'Không thể tải cấu hình');
    } finally {
      setLoadingSettings(false);
    }
  }, [tenantId]);

  // Load Rooms
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const r = await roomService.getRoomsByTenant(tenantId);
      setRooms(r);
    } catch (err: unknown) {
      console.error('Không thể tải danh sách phòng:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadSettings();
    loadRooms();
  }, [loadSettings, loadRooms]);

  // Threshold calculations
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

  const handleSaveSettings = async () => {
    setSettingsError(null);
    setSettingsSuccess(null);
    setSavingSettings(true);
    try {
      await attendanceSettingService.updateSettings(tenantId, {
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
        meetingEarlyOpenMinutes,
        meetingTargetAttendanceRate:
          meetingTargetAttendanceRate.trim() === ''
            ? undefined
            : Math.min(100, Math.max(0, parseInt(meetingTargetAttendanceRate, 10) || 0)),
        meetingTargetOnTimeRate:
          meetingTargetOnTimeRate.trim() === ''
            ? undefined
            : Math.min(100, Math.max(0, parseInt(meetingTargetOnTimeRate, 10) || 0))
      });
      setSettingsSuccess('Đã lưu cấu hình thời gian làm việc & dung sai điểm danh thành công.');
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : 'Có lỗi khi lưu cấu hình.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetDefaults = () => {
    setWorkStartTime('07:00');
    setWorkEndTime('16:00');
    setMorningStartTime('07:00');
    setMorningEndTime('11:30');
    setAfternoonStartTime('13:30');
    setAfternoonEndTime('16:00');
    setWorkCheckInGraceMinutes(30);
    setWorkCheckOutGraceMinutes(30);
    setTargetOnTimeRate(90);
    setDefaultMeetingCheckInGraceMinutes(5);
    setDefaultMeetingCheckOutGraceMinutes(5);
    setMeetingEarlyOpenMinutes(15);
    setMeetingTargetAttendanceRate('90');
    setMeetingTargetOnTimeRate('85');
  };

  const handleDeleteRoom = (room: OfficeRoom) => {
    setRoomToDelete(room);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsDeletingRoom(true);
    try {
      await roomService.deleteRoom(tenantId, roomToDelete.id);
      setRoomNotice({ message: `Đã xóa phòng "${roomToDelete.name}" thành công.`, tone: 'success' });
      setRoomToDelete(null);
      loadRooms();
      setTimeout(() => setRoomNotice(null), 3000);
    } catch (err: unknown) {
      setRoomNotice({ message: err instanceof Error ? err.message : 'Có lỗi khi xóa phòng', tone: 'danger' });
    } finally {
      setIsDeletingRoom(false);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      !roomSearch.trim() ||
      r.roomId.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.location.toLowerCase().includes(roomSearch.toLowerCase());
    const matchesStatus = !roomStatusFilter || r.status === roomStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const roomColumns = [
    {
      key: 'roomId',
      title: 'Mã phòng',
      width: '130px',
      render: (r: OfficeRoom) => <Tag variant="code">{r.roomId}</Tag>
    },
    {
      key: 'name',
      title: 'Tên phòng',
      render: (r: OfficeRoom) => (
        <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
          {r.name}
        </span>
      )
    },
    {
      key: 'location',
      title: 'Vị trí / Địa điểm',
      render: (r: OfficeRoom) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="location-dot" size={13} color="var(--eco-blue-strong)" />
          <span className="body-sm" style={{ color: 'var(--text-body)' }}>
            {r.location}
          </span>
        </div>
      )
    },
    {
      key: 'capacity',
      title: 'Sức chứa',
      width: '120px',
      render: (r: OfficeRoom) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="users" size={13} color="var(--text-subtle)" />
          <span className="body-sm" style={{ color: 'var(--text-heading)' }}>
            {r.capacity ? `${r.capacity} chỗ` : '--'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '160px',
      render: (r: OfficeRoom) =>
        r.status === 'available' ? (
          <StatusTag tone="success" label="Sẵn sàng phục vụ" icon="circle-check" />
        ) : (
          <StatusTag tone="warning" label="Đang bảo trì" icon="screwdriver-wrench" />
        )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '90px',
      render: (r: OfficeRoom) => (
        <DataTable.RowAction
          label="Thao tác"
          items={[
            {
              icon: 'pen',
              label: 'Chỉnh sửa phòng',
              onClick: () => {
                setRoomToEdit(r);
                setRoomModalOpen(true);
              }
            },
            {
              divider: true
            },
            {
              icon: 'trash',
              label: 'Xóa phòng',
              tone: 'danger',
              onClick: () => handleDeleteRoom(r)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div
      className="settings-management-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* 1. Header Toolbar (OUTSIDE all sections) */}
      <div
        className="settings-header"
        data-testid="settings-page-header"
        style={{
          padding: '4px 0 16px',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flexShrink: 0
        }}
      >
        <div>
          <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Thiết Lập Hệ Thống & Quản Trị Cơ Quan
          </h1>
          <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
            Cấu hình thời gian làm việc hàng ngày, dung sai điểm danh và thiết lập danh mục phòng họp trụ sở.
          </p>
        </div>

        {/* Sub-tab Switcher: Thời Gian & Điểm Danh vs Danh Sách Phòng Họp */}
        <div
          data-testid="settings-subtabs-container"
          role="tablist"
          aria-label="Chọn nhóm thiết lập"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-default)',
            paddingBottom: '0px'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'attendance'}
            data-testid="settings-tab-attendance"
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'attendance' ? '2.5px solid var(--eco-blue-strong)' : '2.5px solid transparent',
              color: activeTab === 'attendance' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeTab === 'attendance' ? 600 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="clock" size={17} color={activeTab === 'attendance' ? 'var(--eco-blue-strong)' : 'currentColor'} />
            Thời Gian & Điểm Danh
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rooms'}
            data-testid="settings-tab-rooms"
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'rooms' ? '2.5px solid var(--eco-blue-strong)' : '2.5px solid transparent',
              color: activeTab === 'rooms' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeTab === 'rooms' ? 600 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="building" size={17} color={activeTab === 'rooms' ? 'var(--eco-blue-strong)' : 'currentColor'} />
            Danh Sách Phòng Họp ({rooms.length})
          </button>
        </div>
      </div>

      {/* 2. Body Area */}
      <div style={{ padding: '4px 0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* ================= TAB 1: WORK HOURS & ATTENDANCE RULES ================= */}
        {activeTab === 'attendance' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {settingsError && <InlineNotice tone="danger" label={settingsError} />}
            {settingsSuccess && <InlineNotice tone="success" label={settingsSuccess} />}

            {/* Side-by-Side Grid: Block 1 & Block 2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '20px',
                alignItems: 'stretch'
              }}
            >
              {/* Block 1: Work Hours Daily */}
              <div
                className="settings-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon name="clock" size={16} />
                    </div>
                    <div>
                      <h2 className="title-md" style={{ margin: 0, color: 'var(--text-heading)' }}>
                        1. Khung giờ làm việc hàng ngày tại cơ quan
                      </h2>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        Áp dụng cho cán bộ, nhân viên check-in/out hằng ngày tại trụ sở UBND.
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      id="work-start"
                      label="Giờ bắt đầu làm việc (Ca sáng)"
                      type="time"
                      required
                      value={workStartTime}
                      onChange={(val) => setWorkStartTime(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="work-end"
                      label="Giờ tan ca (Ca chiều)"
                      type="time"
                      required
                      value={workEndTime}
                      onChange={(val) => setWorkEndTime(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      id="morning-end"
                      label="Giờ nghỉ trưa (Hết ca sáng)"
                      type="time"
                      value={morningEndTime}
                      onChange={(val) => setMorningEndTime(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="afternoon-start"
                      label="Giờ vào ca chiều"
                      type="time"
                      value={afternoonStartTime}
                      onChange={(val) => setAfternoonStartTime(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      id="grace-in"
                      label="Cho phép vào trễ tối đa (phút)"
                      type="number"
                      required
                      value={String(workCheckInGraceMinutes)}
                      onChange={(val) => setWorkCheckInGraceMinutes(parseInt(val, 10) || 0)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="grace-out"
                      label="Cho phép về sớm tối đa (phút)"
                      type="number"
                      required
                      value={String(workCheckOutGraceMinutes)}
                      onChange={(val) => setWorkCheckOutGraceMinutes(parseInt(val, 10) || 0)}
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      id="target-ontime-rate"
                      label="Mục tiêu chuẩn cơ quan (% đúng giờ)"
                      type="number"
                      required
                      value={String(targetOnTimeRate)}
                      onChange={(val) => setTargetOnTimeRate(Math.min(100, Math.max(0, parseInt(val, 10) || 0)))}
                      disabled={loadingSettings || savingSettings}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)', lineHeight: 1.5 }}>
                        Chỉ tiêu chuyên cần áp dụng theo dõi tỷ lệ đúng giờ của các phòng ban tại Bảng So Sánh Chuyên Cần (mặc định: 90%).
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic rule helper */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-8)',
                    fontSize: '13px',
                    color: 'var(--text-body)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="clock" size={14} color="var(--eco-blue-strong)" />
                    <span>
                      Cán bộ được phép check-in trễ nhất lúc <b>{lateThreshold}</b> (sau giờ này sẽ bị tính đi trễ).
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="right-from-bracket" size={14} color="#f59e0b" />
                    <span>
                      Được phép check-out ra về từ lúc <b>{earlyLeaveThreshold}</b> (nếu về sớm hơn sẽ bị ghi nhận là về sớm).
                    </span>
                  </div>
                </div>
              </div>

              {/* Block 2: Meeting Attendance Rules */}
              <div
                className="settings-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon name="calendar-check" size={16} />
                    </div>
                    <div>
                      <h2 className="title-md" style={{ margin: 0, color: 'var(--text-heading)' }}>
                        2. Quy tắc điểm danh cuộc họp cơ quan (Mặc định)
                      </h2>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        Tự động áp dụng khi tạo cuộc họp mới; người tạo họp vẫn có thể tùy biến số phút cho từng sự kiện.
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <TextField
                      id="meeting-grace-in"
                      label="Vào trễ mặc định (phút)"
                      type="number"
                      required
                      value={String(defaultMeetingCheckInGraceMinutes)}
                      onChange={(val) => setDefaultMeetingCheckInGraceMinutes(parseInt(val, 10) || 0)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="meeting-grace-out"
                      label="Về sớm mặc định (phút)"
                      type="number"
                      required
                      value={String(defaultMeetingCheckOutGraceMinutes)}
                      onChange={(val) => setDefaultMeetingCheckOutGraceMinutes(parseInt(val, 10) || 0)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="meeting-early-open"
                      label="Đón tiếp trước giờ (phút)"
                      type="number"
                      required
                      value={String(meetingEarlyOpenMinutes)}
                      onChange={(val) => setMeetingEarlyOpenMinutes(parseInt(val, 10) || 0)}
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  {/* Target Settings for Meetings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <TextField
                      id="meeting-target-attendance-rate"
                      label="Mục tiêu tỷ lệ tham dự (%)"
                      type="number"
                      placeholder="Để trống nếu không áp dụng"
                      value={meetingTargetAttendanceRate}
                      onChange={(val) => setMeetingTargetAttendanceRate(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                    <TextField
                      id="meeting-target-ontime-rate"
                      label="Mục tiêu tỷ lệ đúng giờ (%)"
                      type="number"
                      placeholder="Để trống nếu không áp dụng"
                      value={meetingTargetOnTimeRate}
                      onChange={(val) => setMeetingTargetOnTimeRate(val)}
                      disabled={loadingSettings || savingSettings}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)', lineHeight: 1.5 }}>
                      Chỉ tiêu chuyên cần cuộc họp áp dụng cho các phòng ban tại Bảng So Sánh Chuyên Cần Cuộc Họp. Nếu để trống, hệ thống sẽ không áp dụng mục tiêu và ẩn hoàn toàn giao diện chỉ tiêu này tại tab Cuộc họp.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-8)',
                    fontSize: '13px',
                    color: 'var(--text-subtle)'
                  }}
                >
                  💡 <b>Ví dụ:</b> Cuộc họp bắt đầu lúc 09:00 và kết thúc lúc 10:00: Camera AI mở đón tiếp từ{' '}
                  <b>08:45</b>, đại biểu điểm danh trễ nhất lúc <b>09:05</b> không bị tính muộn, và được phép check-out
                  từ <b>09:55</b>.
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px'
              }}
            >
              <Button
                variant="secondary"
                icon="rotate-left"
                onClick={handleResetDefaults}
                disabled={loadingSettings || savingSettings}
              >
                Khôi phục mặc định chuẩn
              </Button>

              <Button
                variant="primary"
                icon="check"
                onClick={handleSaveSettings}
                disabled={loadingSettings || savingSettings}
              >
                {savingSettings ? 'Đang lưu...' : 'Lưu cấu hình thời gian'}
              </Button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: OFFICE ROOMS SETUP ================= */}
        {activeTab === 'rooms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roomNotice && <InlineNotice tone={roomNotice.tone} label={roomNotice.message} />}

            {/* Stat Cards */}
            <StatCard.Group columns={3}>
              <StatCard
                label="Tổng số phòng làm việc / phòng họp"
                value={rooms.length}
                icon="building"
                tone="neutral"
              />
              <StatCard
                label="Phòng sẵn sàng phục vụ"
                value={rooms.filter((r) => r.status === 'available').length}
                icon="circle-check"
                tone="success"
              />
              <StatCard
                label="Đang bảo trì / nâng cấp"
                value={rooms.filter((r) => r.status === 'maintenance').length}
                icon="screwdriver-wrench"
                tone="warning"
              />
            </StatCard.Group>

            {/* Filter and Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-8)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <SearchField
                  placeholder="Tìm theo tên phòng, mã phòng, vị trí..."
                  value={roomSearch}
                  onChange={(val) => setRoomSearch(val)}
                  width={300}
                />
                <SelectField
                  id="room-status-filter"
                  value={roomStatusFilter}
                  onChange={(val) => setRoomStatusFilter(val)}
                  options={[
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: 'available', label: 'Sẵn sàng phục vụ' },
                    { value: 'maintenance', label: 'Đang bảo trì' }
                  ]}
                  width={180}
                />
              </div>

              <Button
                variant="primary"
                icon="plus"
                onClick={() => {
                  setRoomToEdit(null);
                  setRoomModalOpen(true);
                }}
              >
                Thêm phòng mới
              </Button>
            </div>

            {/* Data Table */}
            <DataTable
              columns={roomColumns}
              rows={filteredRooms}
              rowKey="id"
              emptyText={
                loadingRooms
                  ? 'Đang tải danh sách phòng...'
                  : 'Chưa có phòng họp / phòng làm việc nào phù hợp với bộ lọc.'
              }
            />
          </div>
        )}
      </div>

      {/* Room Modal Right-Sheet */}
      <RoomModal
        open={roomModalOpen}
        onClose={() => {
          setRoomModalOpen(false);
          setRoomToEdit(null);
        }}
        tenantId={tenantId}
        roomToEdit={roomToEdit}
        onSuccess={() => {
          loadRooms();
          setRoomNotice({
            message: roomToEdit
              ? 'Đã cập nhật thông tin phòng thành công.'
              : 'Đã thêm phòng mới thành công.',
            tone: 'success'
          });
          setTimeout(() => setRoomNotice(null), 3000);
        }}
      />

      {/* Modal Xác nhận Xóa phòng họp (Design System PopupModal) */}
      {roomToDelete && (
        <PopupModal
          open={!!roomToDelete}
          icon="triangle-exclamation"
          title="Xác Nhận Xóa Phòng Họp"
          description={`Bạn có chắc chắn muốn xóa phòng "${roomToDelete.name}" (${roomToDelete.roomId}) không?`}
          width={460}
          onClose={() => !isDeletingRoom && setRoomToDelete(null)}
          primaryAction={{
            label: isDeletingRoom ? 'Đang xóa...' : 'Xóa phòng họp',
            icon: 'trash',
            onClick: handleConfirmDeleteRoom,
            disabled: isDeletingRoom
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            onClick: () => setRoomToDelete(null),
            disabled: isDeletingRoom
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
              <div><strong>Mã phòng:</strong> <Tag variant="code">{roomToDelete.roomId}</Tag></div>
              <div style={{ marginTop: '4px' }}><strong>Tên phòng:</strong> {roomToDelete.name}</div>
              <div style={{ marginTop: '2px' }}><strong>Vị trí:</strong> {roomToDelete.location}</div>
              <div style={{ marginTop: '2px' }}><strong>Sức chứa:</strong> {roomToDelete.capacity ? `${roomToDelete.capacity} chỗ ngồi` : '--'}</div>
            </div>

            <InlineNotice tone="warning">
              Hành động này sẽ xóa phòng họp khỏi danh mục cơ quan. Các cuộc họp đã lên lịch trong tương lai tại phòng này có thể cần được phân bổ lại.
            </InlineNotice>
          </div>
        </PopupModal>
      )}
    </div>
  );
};
