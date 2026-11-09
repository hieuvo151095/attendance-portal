import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SearchField,
  SelectField,
  Button,
  DataTable,
  Tag,
  EmptyValue,
  Icon,
  toast
} from '../../design-system';
import { DailyAttendanceRecord, DailyAttendanceSummary } from '../../types/attendance';
import { Department } from '../../types/organization';
import { departmentService } from '../../services/department';
import { dailyAttendanceService } from '../../services/attendance';
import { QuickScanModal } from './QuickScanModal';
import { AttendanceLogModal } from './AttendanceLogModal';
import { AttendanceSettingsModal } from '../setting/AttendanceSettingsModal';

export interface DailyAttendanceProps {
  tenantId: string;
}

const TODAY = '2026-11-06';

export const DailyAttendance: React.FC<DailyAttendanceProps> = ({ tenantId }) => {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [records, setRecords] = useState<DailyAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyAttendanceRecord | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptList, recordList, sum] = await Promise.all([
        departmentService.getDepartmentsByTenant(tenantId),
        dailyAttendanceService.getDailyAttendance(tenantId, {
          date: selectedDate,
          departmentId: selectedDeptId || undefined,
          status: selectedStatus as any,
          search: searchTerm || undefined
        }),
        dailyAttendanceService.getDailySummary(tenantId, selectedDate)
      ]);
      setDepartments(deptList);
      setRecords(recordList);
      setSummary(sum);
      setSelectedRecord((prev) => {
        if (!prev) return null;
        const fresh = recordList.find(
          (r) => r.id === prev.id || (r.employeeId === prev.employeeId && r.date === prev.date)
        );
        return fresh || prev;
      });
    } catch (err) {
      console.error('Failed to load daily attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedDate, selectedDeptId, selectedStatus, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenLogModal = (rec: DailyAttendanceRecord) => {
    setSelectedRecord(rec);
    setLogModalOpen(true);
  };

  const handleDateChange = (newDate: string) => {
    if (newDate > TODAY) {
      toast.warning(`Không thể chọn ngày trong tương lai. Ngày hiện tại là ${TODAY}`);
      setSelectedDate(TODAY);
      return;
    }
    setSelectedDate(newDate);
  };

  const handleStepDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const dateStr = current.toISOString().slice(0, 10);
    if (dateStr > TODAY) return;
    setSelectedDate(dateStr);
  };

  const handleExportCsv = async () => {
    try {
      const csv = await dailyAttendanceService.exportDailyAttendanceCsv(tenantId, selectedDate);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bang_Cham_Cong_Ngay_${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã xuất báo cáo chấm công thành công!');
    } catch (err) {
      toast.danger('Lỗi xuất dữ liệu chấm công: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const departmentFilterOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'on_time', label: 'Đúng giờ' },
    { value: 'late', label: 'Đi muộn' },
    { value: 'early_leave', label: 'Về sớm' },
    { value: 'leave', label: 'Nghỉ phép' },
    { value: 'absent', label: 'Chưa đến / Vắng mặt' }
  ];

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'faceId':
        return <Icon name="camera" size={13} style={{ color: 'var(--primary-600)' }} />;
      case 'fingerprint':
        return <Icon name="fingerprint" size={13} style={{ color: 'var(--primary-600)' }} />;
      case 'card':
        return <Icon name="id-badge" size={13} style={{ color: 'var(--primary-600)' }} />;
      default:
        return <Icon name="pen" size={12} style={{ color: 'var(--text-subtle)' }} />;
    }
  };

  const columns = [
    {
      key: 'employee',
      title: 'Cán bộ nhân sự',
      width: '260px',
      render: (r: DailyAttendanceRecord) => (
        <DataTable.Person
          name={r.employeeName}
          avatar={r.avatarUrl}
          meta={r.employeeCode}
        />
      )
    },
    {
      key: 'department',
      title: 'Mã NV & Phòng ban',
      width: '220px',
      render: (r: DailyAttendanceRecord) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <Tag variant="code">{r.employeeCode}</Tag>
          <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
            {r.departmentName}
          </span>
        </div>
      )
    },
    {
      key: 'checkIn',
      title: 'Giờ đến (Check-in)',
      width: '240px',
      render: (r: DailyAttendanceRecord) => {
        if (r.status === 'leave') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--primary-700)' }}>
              <Icon name="calendar-check" size={13} style={{ color: 'var(--primary-600)' }} />
              <span className="body-xs-medium">Nghỉ phép</span>
            </div>
          );
        }

        if (!r.checkInTime) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--semantic-danger)' }}>
              <Icon name="circle-xmark" size={13} style={{ color: 'var(--semantic-danger)' }} />
              <span className="body-xs-medium">Chưa đến / Vắng</span>
            </div>
          );
        }

        const isLate = r.lateMinutes > 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                {r.checkInTime}
              </span>
              <div
                title={`${r.checkInMethod === 'faceId' ? 'Face ID' : r.checkInMethod === 'fingerprint' ? 'Vân tay' : 'Thẻ'} • ${r.checkInDevice || ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--radius-4)',
                  backgroundColor: 'var(--primary-50)'
                }}
              >
                {getMethodIcon(r.checkInMethod)}
              </div>
            </div>

            {/* Trạng thái Check-in */}
            {isLate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--semantic-warning)' }}>
                <Icon name="clock" size={13} style={{ color: 'var(--semantic-warning)' }} />
                <span className="body-xs-medium" style={{ color: 'var(--semantic-warning)' }}>
                  Đi muộn {r.lateMinutes > 0 ? `(${r.lateMinutes}p)` : ''}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--semantic-success)' }}>
                <Icon name="circle-check" size={13} style={{ color: 'var(--semantic-success)' }} />
                <span className="body-xs-medium" style={{ color: 'var(--semantic-success)' }}>
                  Đúng giờ
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'checkOut',
      title: 'Giờ về (Check-out)',
      width: '240px',
      render: (r: DailyAttendanceRecord) => {
        if (r.status === 'leave') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--primary-700)' }}>
              <Icon name="calendar-check" size={13} style={{ color: 'var(--primary-600)' }} />
              <span className="body-xs-medium">Nghỉ phép</span>
            </div>
          );
        }

        if (!r.checkOutTime) {
          if (!r.checkInTime) {
            return <span style={{ color: 'var(--text-disabled)' }}>—</span>;
          }
          return <EmptyValue italic>Chưa tan ca</EmptyValue>;
        }

        const isEarly = r.earlyLeaveMinutes > 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                {r.checkOutTime}
              </span>
              <div
                title={`${r.checkOutMethod === 'faceId' ? 'Face ID' : r.checkOutMethod === 'fingerprint' ? 'Vân tay' : 'Thẻ'} • ${r.checkOutDevice || ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 'var(--radius-4)',
                  backgroundColor: 'var(--primary-50)'
                }}
              >
                {getMethodIcon(r.checkOutMethod)}
              </div>
            </div>

            {/* Trạng thái Check-out */}
            {isEarly ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--semantic-warning)' }}>
                <Icon name="clock" size={13} style={{ color: 'var(--semantic-warning)' }} />
                <span className="body-xs-medium" style={{ color: 'var(--semantic-warning)' }}>
                  Về sớm {r.earlyLeaveMinutes > 0 ? `(${r.earlyLeaveMinutes}p)` : ''}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--semantic-success)' }}>
                <Icon name="circle-check" size={13} style={{ color: 'var(--semantic-success)' }} />
                <span className="body-xs-medium" style={{ color: 'var(--semantic-success)' }}>
                  Đúng giờ
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '90px',
      render: (r: DailyAttendanceRecord) => (
        <DataTable.RowAction
          label="Thao tác"
          items={[
            {
              icon: 'clock',
              label: 'Chi tiết chấm công',
              onClick: () => handleOpenLogModal(r)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div
      className="daily-attendance-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Header OUTSIDE all sections */}
      <div
        data-testid="attendance-page-header"
        style={{
          padding: '4px 0 16px',
          flexShrink: 0
        }}
      >
        <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
          Bảng Theo Dõi Chấm Công Ngày
        </h1>
        <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
          Theo dõi tình hình cán bộ nhân sự vào/ra cơ quan, kiểm tra giờ đến và giờ về.
        </p>
      </div>

      {/* Main Section Card */}
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
        {/* Stat Cards Group */}
        <StatCard.Group columns={6}>
          <StatCard
            label="Tổng nhân sự"
            value={summary?.totalEmployees ?? 0}
            icon="users"
            tone="neutral"
          />
          <StatCard
            label="Đã có mặt tại cơ quan"
            value={`${summary?.presentCount ?? 0} (${summary?.attendanceRate ?? 0}%)`}
            icon="circle-check"
            tone="success"
          />
          <StatCard
            label="Đúng giờ"
            value={summary?.onTimeCount ?? 0}
            icon="check"
            tone="info"
          />
          <StatCard
            label="Đi muộn"
            value={summary?.lateCount ?? 0}
            icon="clock"
            tone="warning"
          />
          <StatCard
            label="Nghỉ phép"
            value={summary?.leaveCount ?? 0}
            icon="calendar-check"
            tone="info"
          />
          <StatCard
            label="Chưa đến / Vắng mặt"
            value={summary?.absentCount ?? 0}
            icon="circle-xmark"
            tone="warning"
          />
        </StatCard.Group>

        {/* Toolbar & Filters */}
        <div
          data-testid="attendance-table-toolbar"
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
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 'var(--space-8)', alignItems: 'center' }}>
            {/* Bộ điều hướng & chọn ngày */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexShrink: 0 }}>
              <Button
                variant="secondary"
                icon="arrow-left"
                onClick={() => handleStepDate(-1)}
                title="Ngày trước"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <span className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>Ngày:</span>
                <input
                  type="date"
                  value={selectedDate}
                  max={TODAY}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="body-sm"
                  aria-label="Chọn ngày xem chấm công"
                  style={{
                    height: 36,
                    width: 130,
                    padding: '0 6px',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-canvas)',
                    color: 'var(--text-heading)'
                  }}
                />
              </div>
              <Button
                variant="secondary"
                icon="arrow-right"
                onClick={() => handleStepDate(1)}
                disabled={selectedDate >= TODAY}
                title={selectedDate >= TODAY ? 'Không thể xem ngày trong tương lai' : 'Ngày tiếp theo'}
              />
              {selectedDate !== TODAY && (
                <Button
                  variant="secondary"
                  onClick={() => setSelectedDate(TODAY)}
                  title="Quay về ngày hôm nay"
                >
                  Hôm nay (06/11)
                </Button>
              )}
            </div>

            <SearchField
              placeholder="Tìm theo tên cán bộ, mã NV..."
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              width={300}
            />

            <SelectField
              options={departmentFilterOptions}
              value={selectedDeptId}
              onChange={(val) => setSelectedDeptId(val)}
              width={175}
            />

            <SelectField
              options={statusFilterOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              width={170}
            />
          </div>

          {/* Action Buttons Toolbar (Aliged with Employee / Meeting modules) */}
          <div
            data-testid="attendance-action-buttons"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              flexShrink: 0
            }}
          >
            <Button
              variant="secondary"
              icon="file-excel"
              onClick={handleExportCsv}
            >
              Xuất Excel
            </Button>
            <Button
              variant="primary"
              icon="camera"
              onClick={() => setScanModalOpen(true)}
            >
              Quét điểm danh nhanh
            </Button>
          </div>
        </div>

        {/* Attendance Data Table */}
        <DataTable
          columns={columns}
          rows={records}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => (
              <span>
                Hiển thị <b>{total === 0 ? 0 : range[0]} - {range[1]}</b> trên <b>{total}</b> cán bộ nhân sự trong ngày <b>{selectedDate}</b>
              </span>
            )
          }}
          emptyText={
            loading
              ? 'Đang tải bảng chấm công ngày...'
              : 'Không tìm thấy dữ liệu chấm công cán bộ nào phù hợp với bộ lọc.'
          }
          emptyIcon="users"
        />
      </div>

      {/* Modals */}
      <QuickScanModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        tenantId={tenantId}
        currentDate={selectedDate}
        onSuccess={() => {
          loadData();
          toast.success('Ghi nhận điểm danh thành công!');
        }}
      />

      <AttendanceLogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        record={selectedRecord}
        tenantId={tenantId}
        onRecordUpdated={() => {
          loadData();
          toast.success('Đã cập nhật nhật ký điểm danh thành công!');
        }}
      />

      <AttendanceSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        tenantId={tenantId}
        onSaved={() => loadData()}
      />
    </div>
  );
};
