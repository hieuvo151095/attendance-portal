import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StatCard,
  SelectField,
  Button,
  StatusTag,
  Icon,
  Meter
} from '../../design-system';
import {
  dashboardService,
  MeetingDashboardData
} from '../../services/dashboard';
import { departmentService } from '../../services/department';
import { Department } from '../../types/organization';
import { attendanceSettingService } from '../../services/setting';
import { DepartmentAttendanceComparison } from './DepartmentAttendanceComparison';

export interface MeetingDashboardProps {
  tenantId: string;
  onNavigateTab?: (tab: 'attendance' | 'meetings' | 'reports' | 'employees' | 'departments') => void;
}

export const MeetingDashboard: React.FC<MeetingDashboardProps> = ({
  tenantId,
  onNavigateTab
}) => {
  // Bộ lọc số lượng cuộc họp gần nhất (chỉ gồm 4 tùy chọn: 6, 9, 12, 15 cuộc họp, mặc định 6)
  const [meetingCount, setMeetingCount] = useState<number>(6);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<MeetingDashboardData | null>(null);

  // Mục tiêu chuyên cần cuộc họp lấy từ Thiết lập module
  const [meetingTargetAttendanceRate, setMeetingTargetAttendanceRate] = useState<number | undefined>(undefined);
  const [meetingTargetOnTimeRate, setMeetingTargetOnTimeRate] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Giám sát kỷ luật & cảnh báo chuyên cần: Quản lý theo tháng (mặc định: Tháng 11/2026)
  const [selectedDisciplineMonth, setSelectedDisciplineMonth] = useState<string>('2026-11');
  const [disciplineCalendarOpen, setDisciplineCalendarOpen] = useState<boolean>(false);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const disciplinePickerRef = useRef<HTMLDivElement>(null);

  // Đóng popover lịch khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (disciplinePickerRef.current && !disciplinePickerRef.current.contains(e.target as Node)) {
        setDisciplineCalendarOpen(false);
      }
    };
    if (disciplineCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [disciplineCalendarOpen]);

  // Dữ liệu kỷ luật cuộc họp theo tháng đã chọn (mặc định: tháng hiện tại)
  const currentDisciplineWatch = useMemo(() => {
    return dashboardService.getMeetingDisciplineWatch(tenantId, selectedDisciplineMonth);
  }, [tenantId, selectedDisciplineMonth]);

  // Nạp danh sách phòng ban
  useEffect(() => {
    departmentService
      .getDepartmentsByTenant(tenantId)
      .then(setDepartments)
      .catch((err) => console.error('Lỗi tải phòng ban:', err));
  }, [tenantId]);

  // Nạp thiết lập mục tiêu chuyên cần cuộc họp
  useEffect(() => {
    attendanceSettingService
      .getSettings(tenantId)
      .then((settings) => {
        setMeetingTargetAttendanceRate(settings?.meetingTargetAttendanceRate);
        setMeetingTargetOnTimeRate(settings?.meetingTargetOnTimeRate);
      })
      .catch((err) => console.error('Lỗi tải thiết lập chỉ tiêu:', err));
  }, [tenantId]);

  // Nạp dữ liệu báo cáo phân tích cuộc họp
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getMeetingDashboardData(
        tenantId,
        meetingCount,
        selectedDeptId || undefined
      );
      setData(res);
    } catch (err) {
      console.error('Lỗi tải dữ liệu bảng điều khiển cuộc họp:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, meetingCount, selectedDeptId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await dashboardService.exportMeetingDashboardExcel(
        tenantId,
        meetingCount,
        selectedDeptId || undefined
      );
    } catch (err) {
      console.error('Lỗi xuất báo cáo cuộc họp:', err);
    } finally {
      setExporting(false);
    }
  };

  const departmentFilterOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: d.name }))
  ];

  const meetingCountOptions = [
    { value: '6', label: '6 cuộc họp gần nhất' },
    { value: '9', label: '9 cuộc họp gần nhất' },
    { value: '12', label: '12 cuộc họp gần nhất' },
    { value: '15', label: '15 cuộc họp gần nhất' }
  ];

  // Chuyển đổi số liệu phòng ban cho component so sánh
  const deptMetricsForComparison = (data?.departmentMetrics || []).map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    totalStaff: d.totalSummoned,
    presentCount: d.presentCount,
    onTimeCount: d.onTimeCount,
    lateCount: d.lateCount,
    absentCount: d.absentCount,
    attendanceRate: d.attendanceRate,
    onTimeRate: d.onTimeRate
  }));

  // Tính toán các phân đoạn cho biểu đồ Donut Tổng quan cả năm
  const yearlyStats = data?.yearlyOverall;
  const donutR = 52;
  const donutCircumference = 2 * Math.PI * donutR; // ~ 326.726

  const onTimePct = yearlyStats?.onTimeRate ?? 0;
  const latePct = yearlyStats?.lateRate ?? 0;
  const earlyLeavePct = yearlyStats?.earlyLeaveRate ?? 0;
  const absentPct = yearlyStats?.absentRate ?? 0;

  const onTimeLen = (onTimePct / 100) * donutCircumference;
  const lateLen = (latePct / 100) * donutCircumference;
  const earlyLeaveLen = (earlyLeavePct / 100) * donutCircumference;
  const absentLen = (absentPct / 100) * donutCircumference;

  const onTimeOffset = 0;
  const lateOffset = -onTimeLen;
  const earlyLeaveOffset = -(onTimeLen + lateLen);
  const absentOffset = -(onTimeLen + lateLen + earlyLeaveLen);

  return (
    <div
      className="meeting-dashboard-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* ================= GROUP 1: EXECUTIVE MEETING OVERVIEW (Toolbar, KPIs, Charts) ================= */}
      <div
        className="dashboard-card"
        data-testid="meeting-overview-group"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-12)',
          padding: '22px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* 1. Header Toolbar with Section Title & Filters/Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="calendar-check" size={18} color="var(--eco-blue-strong)" />
            <span className="title-md" style={{ color: 'var(--text-heading)', margin: 0, fontWeight: 600 }}>
              Xu Hướng Chuyên Cần & Cơ Cấu Điểm Danh
            </span>
          </div>

          {/* Filter Controls & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            {/* Lọc theo số lượng cuộc họp (6, 9, 12, 15 cuộc họp gần nhất) */}
            <SelectField
              id="meeting-dashboard-count-filter"
              value={String(meetingCount)}
              onChange={(val) => setMeetingCount(parseInt(val, 10) || 6)}
              options={meetingCountOptions}
              width={195}
            />

            <SelectField
              id="meeting-dashboard-dept-filter"
              value={selectedDeptId}
              onChange={(val) => setSelectedDeptId(val)}
              options={departmentFilterOptions}
              width={185}
            />

            <Button
              variant="secondary"
              icon="download"
              disabled={exporting || loading}
              onClick={handleExportCsv}
            >
              {exporting ? 'Đang xuất...' : 'Xuất Báo Cáo'}
            </Button>
          </div>
        </div>

        {loading || !data ? (
          <div
            style={{
              padding: '60px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-subtle)'
            }}
          >
            <Icon name="spinner" size={28} className="fa-spin" />
            <p style={{ marginTop: '12px' }}>Đang tổng hợp dữ liệu chuyên cần cuộc họp toàn cơ quan...</p>
          </div>
        ) : (
          <>
            {/* 2. Highlighted KPI Stat Cards Group (6 cards) */}
            <StatCard.Group columns={6}>
              {/* Card 1: Tổng số khách mời (Bắt buộc to, tùy chọn nhỏ bên dưới) */}
              <StatCard
                label="Tổng Số Khách Mời"
                value={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span>{data.kpis.totalCompulsory}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-subtle)' }}>
                        bắt buộc
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 400,
                        color: 'var(--text-subtle)',
                        lineHeight: 1.2
                      }}
                    >
                      + {data.kpis.totalOptional} tùy chọn
                    </span>
                  </div>
                }
                tone="neutral"
                icon="users"
              />

              {/* Card 2: Tỷ Lệ Tham Dự (Tính trên đại biểu bắt buộc) */}
              <StatCard
                label="Tỷ Lệ Tham Dự"
                value={`${data.kpis.attendanceRate}%`}
                tone={
                  meetingTargetAttendanceRate !== undefined
                    ? data.kpis.attendanceRate >= meetingTargetAttendanceRate
                      ? 'success'
                      : 'warning'
                    : data.kpis.attendanceRate >= 90
                    ? 'success'
                    : 'warning'
                }
                icon="clipboard-check"
              />

              {/* Card 3: Tỷ Lệ Đúng Giờ (Tính trên đại biểu bắt buộc) */}
              <StatCard
                label="Tỷ Lệ Đúng Giờ"
                value={`${data.kpis.onTimeRate}%`}
                tone={
                  meetingTargetOnTimeRate !== undefined
                    ? data.kpis.onTimeRate >= meetingTargetOnTimeRate
                      ? 'success'
                      : 'warning'
                    : 'success'
                }
                icon="clock"
              />

              {/* Card 4: Đi Muộn (Tính trên đại biểu bắt buộc) */}
              <StatCard
                label="Đi Muộn"
                value={String(data.kpis.lateCount)}
                tone={data.kpis.lateCount > 0 ? 'warning' : 'neutral'}
                icon="bell"
              />

              {/* Card 5: Về Sớm (Tính trên đại biểu bắt buộc) */}
              <StatCard
                label="Về Sớm"
                value={String(data.kpis.earlyLeaveCount)}
                tone={data.kpis.earlyLeaveCount > 0 ? 'warning' : 'neutral'}
                icon="right-from-bracket"
              />

              {/* Card 6: Vắng (Tính trên đại biểu bắt buộc) */}
              <StatCard
                label="Vắng"
                value={String(data.kpis.absentCount)}
                tone={data.kpis.absentCount > 0 ? 'warning' : 'success'}
                icon="user-xmark"
              />
            </StatCard.Group>

            {/* Row 1: Meeting Trend Chart (Columns per meeting) & Overall Donut Chart */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1.15fr)',
                gap: '24px'
              }}
            >
              {/* Meeting Trend Chart Card */}
              <div
                className="dashboard-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h2
                      className="title-md"
                      style={{
                        margin: 0,
                        color: 'var(--text-heading)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Icon name="chart-line" size={16} color="var(--eco-blue-strong)" />
                      Xu Hướng Chuyên Cần Cuộc Họp ({data.trends.length} cuộc họp gần nhất)
                    </h2>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      Tỷ lệ đại biểu đúng giờ, đi muộn, về sớm và vắng mặt từng cuộc họp (
                      {data.trends[0]?.label || ''} - {data.trends[data.trends.length - 1]?.label || ''})
                    </span>
                  </div>

                  {/* Chart Legend */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      fontSize: '12px',
                      flexShrink: 0,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          backgroundColor: '#10B981'
                        }}
                      />
                      Đúng giờ
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          backgroundColor: '#F59E0B'
                        }}
                      />
                      Đi muộn
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          backgroundColor: '#8B5CF6'
                        }}
                      />
                      Về sớm
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          backgroundColor: '#EF4444'
                        }}
                      />
                      Vắng mặt
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '2px',
                          backgroundColor: '#3B82F6'
                        }}
                      />
                      % Tham dự
                    </span>
                    {meetingTargetAttendanceRate !== undefined && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#EF4444' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '0px',
                            borderTop: '2px dashed #EF4444'
                          }}
                        />
                        Mục tiêu: {meetingTargetAttendanceRate}%
                      </span>
                    )}
                  </div>
                </div>

                {/* SVG Visual Trend Chart */}
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}
                >
                  <svg
                    viewBox="0 0 700 200"
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '180px', overflow: 'visible' }}
                  >
                    {/* Horizontal Guide Lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="var(--border-default)" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="700" y2="90" stroke="var(--border-default)" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="700" y2="140" stroke="var(--border-default)" strokeDasharray="3 3" />
                    <line x1="0" y1="190" x2="700" y2="190" stroke="var(--border-default)" />

                    {/* Target Benchmark Line if configured */}
                    {meetingTargetAttendanceRate !== undefined && (
                      <line
                        x1="0"
                        y1={190 - (meetingTargetAttendanceRate / 100) * 150}
                        x2="700"
                        y2={190 - (meetingTargetAttendanceRate / 100) * 150}
                        stroke="#EF4444"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                        opacity="0.85"
                      />
                    )}

                    {/* Columns per meeting */}
                    {data.trends.map((pt, idx) => {
                      const totalPoints = data.trends.length;
                      const colWidth = Math.min(30, Math.max(16, 400 / totalPoints));
                      const xCenter = (700 / (totalPoints + 1)) * (idx + 1);
                      const x = xCenter - colWidth / 2;

                      // Tính toán độ cao cột theo tỷ lệ đại biểu bắt buộc
                      const maxVal = Math.max(
                        1,
                        Math.max(...data.trends.map((t) => t.compulsoryCount || 6))
                      );
                      const onTimeH = (pt.onTimeCount / maxVal) * 140;
                      const lateH = (pt.lateCount / maxVal) * 140;
                      const earlyLeaveH = ((pt.earlyLeaveCount || 0) / maxVal) * 140;
                      const absentH = (pt.absentCount / maxVal) * 140;

                      const isHovered = hoveredTrendIdx === idx;

                      return (
                        <g
                          key={`${pt.meetingId}-${idx}`}
                          onMouseEnter={() => setHoveredTrendIdx(idx)}
                          onMouseLeave={() => setHoveredTrendIdx(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Background hover bar */}
                          <rect
                            x={xCenter - colWidth * 1.2}
                            y="10"
                            width={colWidth * 2.4}
                            height="180"
                            fill={isHovered ? 'var(--eco-blue-subtle)' : 'transparent'}
                            rx="4"
                            opacity="0.5"
                          />

                          {/* Stacked bars: OnTime ở dưới, Late, EarlyLeave, Absent ở đỉnh */}
                          {/* 1. OnTime */}
                          <rect
                            x={x}
                            y={190 - onTimeH}
                            width={colWidth}
                            height={Math.max(0, onTimeH)}
                            fill="#10B981"
                            rx="2"
                          />
                          {/* 2. Late */}
                          {lateH > 0 && (
                            <rect
                              x={x}
                              y={190 - onTimeH - lateH}
                              width={colWidth}
                              height={Math.max(0, lateH)}
                              fill="#F59E0B"
                              rx="2"
                            />
                          )}
                          {/* 3. Early Leave */}
                          {earlyLeaveH > 0 && (
                            <rect
                              x={x}
                              y={190 - onTimeH - lateH - earlyLeaveH}
                              width={colWidth}
                              height={Math.max(0, earlyLeaveH)}
                              fill="#8B5CF6"
                              rx="2"
                            />
                          )}
                          {/* 4. Absent */}
                          {absentH > 0 && (
                            <rect
                              x={x}
                              y={190 - onTimeH - lateH - earlyLeaveH - absentH}
                              width={colWidth}
                              height={Math.max(0, absentH)}
                              fill="#EF4444"
                              rx="2"
                            />
                          )}

                          {/* Point Marker for Attendance Rate */}
                          <circle
                            cx={xCenter}
                            cy={190 - (pt.attendanceRate / 100) * 150}
                            r={isHovered ? 6 : 4}
                            fill="#3B82F6"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}

                    {/* Polyline connecting Attendance Rate points */}
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      points={data.trends
                        .map((pt, idx) => {
                          const xCenter = (700 / (data.trends.length + 1)) * (idx + 1);
                          const y = 190 - (pt.attendanceRate / 100) * 150;
                          return `${xCenter},${y}`;
                        })
                        .join(' ')}
                    />
                  </svg>

                  {/* X-Axis Labels (Mỗi cột là 1 cuộc họp có ngày dd/mm) */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '28px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-default)',
                      boxSizing: 'border-box'
                    }}
                  >
                    {data.trends.map((pt, idx) => {
                      const totalPoints = data.trends.length;
                      const xPercent = ((idx + 1) / (totalPoints + 1)) * 100;
                      return (
                        <div
                          key={`${pt.meetingId}-lbl-${idx}`}
                          onMouseEnter={() => setHoveredTrendIdx(idx)}
                          onMouseLeave={() => setHoveredTrendIdx(null)}
                          style={{
                            position: 'absolute',
                            left: `${xPercent}%`,
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span
                            className="body-xs"
                            style={{
                              fontSize: totalPoints > 10 ? '10.5px' : '11px',
                              letterSpacing: totalPoints > 10 ? '-0.3px' : 'normal',
                              fontWeight: hoveredTrendIdx === idx ? 600 : 400,
                              color:
                                hoveredTrendIdx === idx
                                  ? 'var(--eco-blue-strong)'
                                  : 'var(--text-subtle)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {pt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Tooltip Popover */}
                  {hoveredTrendIdx !== null && data.trends[hoveredTrendIdx] && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: `${Math.min(78, Math.max(16, ((hoveredTrendIdx + 1) / (data.trends.length + 1)) * 100))}%`,
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-8)',
                        padding: '10px 14px',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '12px',
                        zIndex: 10,
                        pointerEvents: 'none',
                        minWidth: '200px'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-heading)',
                          marginBottom: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '220px'
                        }}
                        title={data.trends[hoveredTrendIdx].meetingTitle}
                      >
                        {data.trends[hoveredTrendIdx].meetingTitle}
                      </div>
                      <div style={{ color: 'var(--text-subtle)', fontSize: '11px', marginBottom: '6px' }}>
                        {data.trends[hoveredTrendIdx].date} • {data.trends[hoveredTrendIdx].roomName || 'Hội trường'}
                      </div>
                      <div style={{ color: 'var(--text-body)', fontSize: '11.5px', marginBottom: '4px' }}>
                        Khách mời: <strong>{data.trends[hoveredTrendIdx].compulsoryCount} bắt buộc</strong>
                        {data.trends[hoveredTrendIdx].optionalCount > 0 && (
                          <span style={{ color: 'var(--text-subtle)' }}>
                            {' '}(+{data.trends[hoveredTrendIdx].optionalCount} tùy chọn)
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#10B981', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Đúng giờ:</span> <strong>{data.trends[hoveredTrendIdx].onTimeCount} đại biểu</strong>
                      </div>
                      <div style={{ color: '#F59E0B', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Đi muộn:</span> <strong>{data.trends[hoveredTrendIdx].lateCount} đại biểu</strong>
                      </div>
                      <div style={{ color: '#8B5CF6', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Về sớm:</span> <strong>{data.trends[hoveredTrendIdx].earlyLeaveCount || 0} đại biểu</strong>
                      </div>
                      <div style={{ color: '#EF4444', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Vắng mặt:</span> <strong>{data.trends[hoveredTrendIdx].absentCount} đại biểu</strong>
                      </div>
                      <div
                        style={{
                          color: '#3B82F6',
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-default)',
                          marginTop: '4px',
                          paddingTop: '4px'
                        }}
                      >
                        <span>Tỷ lệ tham dự:</span> <strong>{data.trends[hoveredTrendIdx].attendanceRate}%</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-in Method Distribution Card (Cơ Cấu Phương Thức Xác Thực) */}
              <div
                className="dashboard-card"
                data-testid="meeting-method-distribution-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div>
                  <h2
                    className="title-md"
                    style={{
                      margin: 0,
                      color: 'var(--text-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Icon name="fingerprint" size={18} color="var(--eco-blue-strong)" />
                    Cơ Cấu Phương Thức Xác Thực
                  </h2>
                  <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                    Phân bổ phương thức điểm danh thực tế ghi nhận tại cổng và phòng họp
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Face ID */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}
                    >
                      <span
                        className="body-sm"
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-heading)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icon name="camera" size={14} color="var(--eco-blue-strong)" />
                        Nhận diện khuôn mặt (Camera Face ID)
                      </span>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        <strong>{data.methodDistribution.faceId.count}</strong> lượt ({data.methodDistribution.faceId.percentage}%)
                      </span>
                    </div>
                    <Meter
                      value={data.methodDistribution.faceId.percentage}
                      tone="default"
                      label="Khuôn mặt"
                      showLabel={false}
                    />
                  </div>

                  {/* RFID / NFC Card */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}
                    >
                      <span
                        className="body-sm"
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-heading)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icon name="credit-card" size={14} color="var(--semantic-success)" />
                        Thẻ nhân sự (RFID / NFC)
                      </span>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        <strong>{data.methodDistribution.card.count}</strong> lượt ({data.methodDistribution.card.percentage}%)
                      </span>
                    </div>
                    <Meter
                      value={data.methodDistribution.card.percentage}
                      tone="success"
                      label="Thẻ vật lý"
                      showLabel={false}
                    />
                  </div>

                  {/* Fingerprint / Manual */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}
                    >
                      <span
                        className="body-sm"
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-heading)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Icon name="fingerprint" size={14} color="var(--semantic-warning)" />
                        Sinh trắc học vân tay
                      </span>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        <strong>{data.methodDistribution.fingerprint?.count ?? 3}</strong> lượt ({data.methodDistribution.fingerprint?.percentage ?? 13}%)
                      </span>
                    </div>
                    <Meter
                      value={data.methodDistribution.fingerprint?.percentage ?? 13}
                      tone="warning"
                      label="Vân tay"
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Enrollment Summary Matrix */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '12px',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', margin: 0 }}>
                      {data.kpis.activeCardsCount ?? 22}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Thẻ hoạt động
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', margin: 0 }}>
                      {data.kpis.faceIdEnrolledCount ?? 22}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Có Face ID
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', margin: 0 }}>
                      {data.kpis.fingerprintEnrolledCount ?? 25}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Có Vân tay
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Side-by-Side Cards (Donut Overview & Room Utilization) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '16px',
                alignItems: 'stretch'
              }}
            >
              {/* Card 1: Overall Donut Chart Card (Tổng quan chuyên cần cả năm 2026) */}
              <div
                className="dashboard-card"
                data-testid="meeting-yearly-donut-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  height: '100%'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <h2
                      className="title-md"
                      style={{
                        margin: 0,
                        color: 'var(--text-heading)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        fontSize: '15px'
                      }}
                    >
                      <Icon name="chart-pie" size={16} color="var(--eco-blue-strong)" />
                      Tổng Quan Chuyên Cần Cả Năm (2026)
                    </h2>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px', display: 'block' }}>
                      Tổng kết chuyên cần toàn bộ {yearlyStats?.totalMeetings || 0} cuộc họp trong năm 2026
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--eco-blue-strong)',
                      backgroundColor: 'var(--eco-blue-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {yearlyStats?.totalMeetings || 0} cuộc họp
                  </span>
                </div>

                {/* Body: SVG Donut + 2x2 Rates Grid */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '4px 0'
                  }}
                >
                  {/* SVG Donut */}
                  <div style={{ position: 'relative', width: '124px', height: '124px', flexShrink: 0 }}>
                    <svg viewBox="0 0 136 136" width="124" height="124">
                      <g transform="rotate(-90 68 68)">
                        <circle
                          cx="68"
                          cy="68"
                          r={donutR}
                          fill="transparent"
                          stroke="var(--bg-muted)"
                          strokeWidth="20"
                        />
                        {onTimeLen > 0 && (
                          <circle
                            cx="68"
                            cy="68"
                            r={donutR}
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="20"
                            strokeDasharray={`${onTimeLen} ${donutCircumference - onTimeLen}`}
                            strokeDashoffset={onTimeOffset}
                          />
                        )}
                        {lateLen > 0 && (
                          <circle
                            cx="68"
                            cy="68"
                            r={donutR}
                            fill="transparent"
                            stroke="#F59E0B"
                            strokeWidth="20"
                            strokeDasharray={`${lateLen} ${donutCircumference - lateLen}`}
                            strokeDashoffset={lateOffset}
                          />
                        )}
                        {earlyLeaveLen > 0 && (
                          <circle
                            cx="68"
                            cy="68"
                            r={donutR}
                            fill="transparent"
                            stroke="#8B5CF6"
                            strokeWidth="20"
                            strokeDasharray={`${earlyLeaveLen} ${donutCircumference - earlyLeaveLen}`}
                            strokeDashoffset={earlyLeaveOffset}
                          />
                        )}
                        {absentLen > 0 && (
                          <circle
                            cx="68"
                            cy="68"
                            r={donutR}
                            fill="transparent"
                            stroke="#EF4444"
                            strokeWidth="20"
                            strokeDasharray={`${absentLen} ${donutCircumference - absentLen}`}
                            strokeDashoffset={absentOffset}
                          />
                        )}
                      </g>
                    </svg>

                    {/* Donut Center Label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <span
                        className="title-md"
                        style={{
                          color: 'var(--text-heading)',
                          fontWeight: 700,
                          lineHeight: 1
                        }}
                      >
                        {yearlyStats?.attendanceRate ?? 0}%
                      </span>
                      <span
                        className="body-xs"
                        style={{
                          color: 'var(--text-subtle)',
                          fontSize: '10px',
                          marginTop: '2px'
                        }}
                      >
                        Tham dự cả năm
                      </span>
                    </div>
                  </div>

                  {/* 4 Status Breakdown in 2x2 grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      flex: 1
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 10px', borderRadius: 'var(--radius-6)', backgroundColor: 'var(--bg-canvas)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                        Đúng giờ:
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                        {yearlyStats?.onTimeRate}% <span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: '11px' }}>({yearlyStats?.onTimeCount})</span>
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 10px', borderRadius: 'var(--radius-6)', backgroundColor: 'var(--bg-canvas)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        Đi muộn:
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                        {yearlyStats?.lateRate}% <span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: '11px' }}>({yearlyStats?.lateCount})</span>
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 10px', borderRadius: 'var(--radius-6)', backgroundColor: 'var(--bg-canvas)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                        Về sớm:
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                        {yearlyStats?.earlyLeaveRate}% <span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: '11px' }}>({yearlyStats?.earlyLeaveCount})</span>
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 10px', borderRadius: 'var(--radius-6)', backgroundColor: 'var(--bg-canvas)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                        Vắng mặt:
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                        {yearlyStats?.absentRate}% <span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: '11px' }}>({yearlyStats?.absentCount})</span>
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer: 3 summary KPI tiles */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-8)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>
                      {yearlyStats?.totalMeetings ?? 0}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Cuộc họp cả năm
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--eco-blue-strong)', fontWeight: 700, margin: 0 }}>
                      {yearlyStats?.totalAttendeesPresent ?? 0}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Lượt tham dự
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--semantic-success)', fontWeight: 700, margin: 0 }}>
                      {yearlyStats?.compulsoryAttendees ?? 0}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Đại biểu bắt buộc
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Room Utilization Card (Hiệu suất & tần suất sử dụng phòng họp) */}
              <div
                className="dashboard-card"
                data-testid="meeting-room-utilization-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  height: '100%'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <h2
                      className="title-md"
                      style={{
                        margin: 0,
                        color: 'var(--text-heading)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        fontSize: '15px'
                      }}
                    >
                      <Icon name="building" size={16} color="var(--eco-blue-strong)" />
                      Hiệu Suất & Tần Suất Sử Dụng Phòng Họp
                    </h2>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px', display: 'block' }}>
                      Thống kê tần suất tổ chức và tỷ lệ khai thác các phòng họp trụ sở năm 2026
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-subtle)',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {data.roomStats?.rooms.length || 5} phòng trụ sở
                  </span>
                </div>

                {/* Body: Room utilization list with Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '2px 0' }}>
                  {(data.roomStats?.rooms || []).slice(0, 4).map((room, idx) => (
                    <div key={room.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                            {room.name}
                          </span>
                          <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                            ({room.capacity} chỗ)
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '12px' }}>
                            {room.meetingCount} cuộc họp
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: idx === 0 ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
                              fontSize: '11.5px',
                              minWidth: '32px',
                              textAlign: 'right'
                            }}
                          >
                            {room.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          height: '6px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-muted)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${room.percentage}%`,
                            backgroundColor:
                              idx === 0
                                ? 'var(--eco-blue-strong)'
                                : idx === 1
                                ? '#3B82F6'
                                : idx === 2
                                ? '#10B981'
                                : '#8B5CF6',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: 3 summary tiles matching the left card's footer */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-8)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div
                      className="title-sm"
                      style={{
                        color: 'var(--text-heading)',
                        fontWeight: 700,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={data.roomStats?.mostUsedRoom}
                    >
                      {data.roomStats?.mostUsedRoom ? data.roomStats.mostUsedRoom.split(' - ')[0] : 'Hội trường số 1'}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Dùng nhiều nhất ({data.roomStats?.mostUsedPercentage || 52}%)
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--eco-blue-strong)', fontWeight: 700, margin: 0 }}>
                      {data.roomStats?.avgOccupancyRate || 68}%
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Công suất lấp đầy TB
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--semantic-success)', fontWeight: 700, margin: 0 }}>
                      {data.roomStats?.totalRoomHours || 46.5}h
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', marginTop: '1px' }}>
                      Tổng thời lượng phòng
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= GROUP 2: DEPARTMENT MEETING ATTENDANCE COMPARISON ================= */}
      {data && (
        <DepartmentAttendanceComparison
          metrics={deptMetricsForComparison}
          targetOnTimeRate={meetingTargetOnTimeRate}
          targetAttendanceRate={meetingTargetAttendanceRate}
          hideTargetIfEmpty={true}
          title="So Sánh Chuyên Cần Cuộc Họp Giữa Các Phòng Ban"
          subtitle="Đánh giá mức độ tham gia và tỷ lệ đúng giờ họp của từng đơn vị trực thuộc trong tháng hiện tại"
          attendanceLabel="Tỷ lệ tham dự"
          totalLabel="đại biểu"
          cutoffDateNote={`${data.completedMeetingsInCurrentMonth || 3} cuộc họp hoàn thành, cập nhật đến hết ngày 6/11`}
        />
      )}

      {/* ================= GROUP 3: RECENT CONCLUDED MEETINGS & ACTIVE/UPCOMING MEETING ================= */}
      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.7fr)',
            gap: '24px'
          }}
        >
          {/* Concluded / Active Meetings List */}
          <div
            className="dashboard-card"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-12)',
              padding: '22px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3
                  className="title-md"
                  style={{
                    margin: 0,
                    color: 'var(--text-heading)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Icon name="calendar-check" size={16} color="var(--eco-blue-strong)" />
                  Cuộc Họp Gần Đây
                </h3>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Tổng hợp kết quả chuyên cần các cuộc họp gần đây
                </span>
              </div>

              {onNavigateTab && (
                <Button
                  variant="ghost"
                  onClick={() => onNavigateTab('meetings')}
                >
                  Xem tất cả cuộc họp →
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recentMeetings.map((m) => {
                const totalAtt = m.attendees.length;
                const joinedAtt = m.attendees.filter(
                  (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
                ).length;
                const rate = totalAtt > 0 ? Math.round((joinedAtt / totalAtt) * 100) : 100;

                return (
                  <div
                    key={m.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-8)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="body-sm-bold"
                          style={{
                            color: 'var(--text-heading)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={m.title}
                        >
                          {m.title}
                        </div>
                        <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                          🏛️ {m.roomName} • Chủ trì: {m.hostName || 'Ủy ban'}
                        </div>
                      </div>

                      {m.status === 'completed' ? (
                        <StatusTag tone="success" label="Đã kết thúc" />
                      ) : m.status === 'in_progress' ? (
                        <StatusTag tone="warning" label="Đang diễn ra" />
                      ) : (
                        <StatusTag tone="neutral" label="Sắp diễn ra" />
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '6px',
                        borderTop: '1px dashed var(--border-default)',
                        fontSize: '12px',
                        minHeight: '32px'
                      }}
                    >
                      <span style={{ color: 'var(--text-subtle)' }}>
                        {m.status === 'scheduled' ? (
                          <>Triệu tập: <strong style={{ color: 'var(--eco-blue-strong)' }}>{totalAtt}</strong> đại biểu</>
                        ) : (
                          <>Tham gia: <strong style={{ color: 'var(--eco-blue-strong)' }}>{joinedAtt}/{totalAtt}</strong> đại biểu ({rate}%)</>
                        )}
                      </span>

                      {onNavigateTab && m.status === 'completed' && (
                        <Button
                          variant="ghost"
                          onClick={() => onNavigateTab('reports')}
                        >
                          Biên bản & Báo cáo
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3 Right Card: Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần Khối Phòng Ban Theo Tháng */}
          <div
            className="dashboard-card"
            data-testid="meeting-compliance-card"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-12)',
              padding: '22px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* 1. Card Header kèm Bộ chọn Lịch Tháng trong năm */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <h3
                  className="title-md"
                  style={{
                    margin: 0,
                    color: 'var(--text-heading)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    fontSize: '16px'
                  }}
                >
                  <Icon name="shield-halved" size={16} color="var(--semantic-warning-dark, #b45309)" />
                  Giám Sát Kỷ Luật & Cảnh Báo Chuyên Cần
                </h3>
                <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px', display: 'inline-block' }}>
                  Theo dõi chấp hành triệu tập, danh sách vắng/muộn và đơn vị cần chấn chỉnh
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Bộ chọn tháng theo lịch năm (Year Calendar Month Picker) */}
                <div ref={disciplinePickerRef} style={{ position: 'relative' }}>
                  {/* Select ẩn hỗ trợ truy cập accessibility & automation testing */}
                  <select
                    aria-label="Chọn tháng kỷ luật cuộc họp"
                    value={selectedDisciplineMonth}
                    onChange={(e) => setSelectedDisciplineMonth(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                  >
                    {(currentDisciplineWatch.availableMonths || []).map((m) => (
                      <option key={m.value} value={m.value} disabled={m.disabled}>
                        {m.label} {m.isCurrent ? '(Hiện tại)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Nút bấm hiển thị lịch tháng */}
                  <button
                    type="button"
                    data-testid="discipline-month-trigger"
                    aria-haspopup="dialog"
                    aria-expanded={disciplineCalendarOpen}
                    onClick={() => setDisciplineCalendarOpen(!disciplineCalendarOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-6)',
                      border: disciplineCalendarOpen ? '1px solid var(--primary-600, #2563eb)' : '1px solid var(--border-default)',
                      backgroundColor: disciplineCalendarOpen ? 'var(--primary-50, #eff6ff)' : 'var(--bg-canvas)',
                      color: 'var(--text-heading)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <Icon name="calendar-days" size={13} color="var(--primary-600, #2563eb)" />
                    <span>
                      {currentDisciplineWatch.monthLabel}
                      {currentDisciplineWatch.isCurrentMonth ? ' (Hiện tại)' : ''}
                    </span>
                    <Icon name="chevron-down" size={11} color="var(--text-subtle)" />
                  </button>

                  {/* Popover lịch chọn tháng trong năm */}
                  {disciplineCalendarOpen && (
                    <div
                      role="dialog"
                      aria-label="Lịch chọn tháng kỷ luật"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        width: '280px',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        borderRadius: 'var(--radius-8)',
                        border: '1px solid var(--border-default, #e2e8f0)',
                        boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
                        zIndex: 1000,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Điều hướng năm */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                        <button
                          type="button"
                          disabled={calendarYear <= 2025}
                          onClick={() => setCalendarYear((y) => y - 1)}
                          title="Năm trước"
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            borderRadius: 'var(--radius-4)',
                            backgroundColor: 'transparent',
                            cursor: calendarYear <= 2025 ? 'not-allowed' : 'pointer',
                            opacity: calendarYear <= 2025 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-body)'
                          }}
                        >
                          <Icon name="chevron-down" size={12} style={{ transform: 'rotate(90deg)' }} />
                        </button>
                        <strong className="body-xs-semibold" style={{ color: 'var(--text-heading)', fontSize: '13px' }}>
                          Năm {calendarYear}
                        </strong>
                        <button
                          type="button"
                          disabled={calendarYear >= 2026}
                          onClick={() => setCalendarYear((y) => y + 1)}
                          title="Năm sau"
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            borderRadius: 'var(--radius-4)',
                            backgroundColor: 'transparent',
                            cursor: calendarYear >= 2026 ? 'not-allowed' : 'pointer',
                            opacity: calendarYear >= 2026 ? 0.3 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-body)'
                          }}
                        >
                          <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                      </div>

                      {/* Lưới 12 tháng trong năm */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                          const mKey = `${calendarYear}-${String(m).padStart(2, '0')}`;
                          const isFuture = calendarYear === 2026 && m > 11;
                          const isSelected = selectedDisciplineMonth === mKey;
                          const isCurrent = mKey === '2026-11';

                          return (
                            <button
                              key={m}
                              type="button"
                              disabled={isFuture}
                              title={isFuture ? 'Tháng chưa diễn ra' : `Chọn Tháng ${m}/${calendarYear}`}
                              onClick={() => {
                                setSelectedDisciplineMonth(mKey);
                                setDisciplineCalendarOpen(false);
                              }}
                              style={{
                                padding: '8px 4px',
                                borderRadius: 'var(--radius-6)',
                                border: isSelected
                                  ? '1px solid var(--primary-600, #2563eb)'
                                  : isCurrent
                                  ? '1px solid var(--primary-400, #60a5fa)'
                                  : '1px solid var(--border-neutral-subtle, #f1f5f9)',
                                backgroundColor: isSelected
                                  ? 'var(--primary-600, #2563eb)'
                                  : isCurrent
                                  ? 'var(--primary-50, #eff6ff)'
                                  : 'var(--bg-canvas, #ffffff)',
                                color: isSelected
                                  ? '#ffffff'
                                  : isFuture
                                  ? 'var(--text-muted, #94a3b8)'
                                  : 'var(--text-heading, #1e293b)',
                                cursor: isFuture ? 'not-allowed' : 'pointer',
                                opacity: isFuture ? 0.35 : 1,
                                fontSize: '11.5px',
                                fontWeight: isSelected || isCurrent ? 600 : 400,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>Thg {m}</span>
                              {isCurrent && !isSelected && (
                                <span style={{ fontSize: '9px', color: 'var(--primary-700, #1d4ed8)', lineHeight: 1 }}>
                                  Hiện tại
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Chân popover: Lối tắt quay lại tháng hiện tại */}
                      <div style={{ borderTop: '1px solid var(--border-subtle, #f1f5f9)', paddingTop: '8px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDisciplineMonth('2026-11');
                            setCalendarYear(2026);
                            setDisciplineCalendarOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-600, #2563eb)',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Icon name="clock-rotate-left" size={11} /> Về tháng hiện tại (Tháng 11/2026)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <StatusTag tone="warning" label="Kỷ luật công vụ" />
              </div>
            </div>

            {/* Dòng ghi chú thông tin thu thập dữ liệu theo tháng */}
            <div
              data-testid="meeting-discipline-note"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-6)',
                backgroundColor: currentDisciplineWatch.isCurrentMonth ? 'var(--primary-50, #eff6ff)' : 'var(--bg-subtle)',
                border: currentDisciplineWatch.isCurrentMonth ? '1px solid var(--primary-200, #bfdbfe)' : '1px solid var(--border-subtle)',
                color: currentDisciplineWatch.isCurrentMonth ? 'var(--primary-900, #1e3a8a)' : 'var(--text-heading)',
                fontSize: '12px',
                lineHeight: 1.4
              }}
            >
              <Icon name="circle-info" size={14} color="var(--primary-600, #2563eb)" />
              <div style={{ flex: 1 }}>
                {currentDisciplineWatch.isCurrentMonth ? (
                  <span>
                    <strong>Lưu ý:</strong> Dữ liệu kỳ họp được thu thập theo <strong>từng tháng</strong> (mặc định: <strong>{currentDisciplineWatch.monthLabel} — tháng hiện tại</strong>). Quản trị viên có thể bấm chọn tháng trên lịch năm để tra cứu các tháng đã qua.
                  </span>
                ) : (
                  <span>
                    Đang hiển thị dữ liệu kỳ họp thu thập trong <strong>{currentDisciplineWatch.monthLabel}</strong> (dữ liệu lịch sử). Bấm{' '}
                    <button
                      type="button"
                      onClick={() => setSelectedDisciplineMonth('2026-11')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--primary-600, #2563eb)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Về tháng hiện tại (Tháng 11/2026)
                    </button>{' '}
                    để xem dữ liệu mới nhất.
                  </span>
                )}
              </div>
            </div>

            {/* 2. Chỉ số Kỷ luật Hành chính trong kỳ (Mini KPI Stats Grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '12px',
                borderRadius: 'var(--radius-8)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Tỷ lệ chấp hành */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--semantic-success)', display: 'inline-block' }} />
                  <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>Chấp hành</span>
                </div>
                <div className="title-sm" style={{ fontWeight: 700, color: 'var(--semantic-success)', marginTop: '2px' }}>
                  {currentDisciplineWatch.complianceRate}%
                </div>
              </div>

              {/* Đi muộn */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                  <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>Đi muộn</span>
                </div>
                <div className="title-sm" style={{ fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                  {currentDisciplineWatch.lateCount} <span style={{ fontSize: '11px', fontWeight: 400 }}>lượt</span>
                </div>
              </div>

              {/* Vắng có phép */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--eco-blue-strong)', display: 'inline-block' }} />
                  <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>Có phép</span>
                </div>
                <div className="title-sm" style={{ fontWeight: 700, color: 'var(--eco-blue-strong)', marginTop: '2px' }}>
                  {currentDisciplineWatch.excusedAbsentCount} <span style={{ fontSize: '11px', fontWeight: 400 }}>lượt</span>
                </div>
              </div>

              {/* Vắng không phép */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--semantic-danger)', display: 'inline-block' }} />
                  <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>Không phép</span>
                </div>
                <div className="title-sm" style={{ fontWeight: 700, color: 'var(--semantic-danger)', marginTop: '2px' }}>
                  {currentDisciplineWatch.unexcusedAbsentCount} <span style={{ fontSize: '11px', fontWeight: 400 }}>lượt</span>
                </div>
              </div>
            </div>

            {/* 3. Top đơn vị cần chấn chỉnh kỷ luật */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                <span className="body-xs-bold" style={{ color: 'var(--text-heading)', fontSize: '12px' }}>
                  Đơn vị cần chấn chỉnh kỷ luật ({currentDisciplineWatch.departmentsNeedingAttention.length})
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                  Dựa trên các kỳ họp trong {currentDisciplineWatch.monthLabel} {currentDisciplineWatch.isCurrentMonth ? '(Tháng hiện tại)' : ''}
                </span>
              </div>

              {currentDisciplineWatch.departmentsNeedingAttention.length === 0 ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-6)',
                    backgroundColor: 'var(--semantic-success-light, #f0fdf4)',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--semantic-success-dark, #166534)',
                    fontSize: '12px'
                  }}
                >
                  <Icon name="circle-check" size={14} color="var(--semantic-success)" />
                  <span>Trong {currentDisciplineWatch.monthLabel} không có đơn vị nào cần chấn chỉnh kỷ luật. Toàn bộ cán bộ chấp hành nghiêm túc.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentDisciplineWatch.departmentsNeedingAttention.map((dept) => (
                    <div
                      key={dept.departmentId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: dept.status === 'danger' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                        border: dept.status === 'danger' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Icon
                          name={dept.status === 'danger' ? 'circle-exclamation' : 'triangle-exclamation'}
                          size={14}
                          color={dept.status === 'danger' ? 'var(--semantic-danger)' : 'var(--semantic-warning)'}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div className="body-xs-bold" style={{ color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dept.departmentName}
                          </div>
                          <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                            {dept.note.replace(' • Cần lưu ý', '').replace(' • Cần chấn chỉnh', '')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Danh sách đại biểu vắng/muộn gần nhất (Fixed scrollable container with stable gutter) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="body-xs-bold" style={{ color: 'var(--text-heading)', fontSize: '12px' }}>
                  Danh sách đại biểu vắng / muộn gần nhất
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                  {currentDisciplineWatch.monthLabel}
                </span>
              </div>

              {currentDisciplineWatch.recentViolations.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    fontSize: '12px'
                  }}
                >
                  <Icon name="circle-check" size={16} color="var(--semantic-success)" style={{ marginBottom: '4px' }} />
                  <div>Toàn bộ đại biểu tham dự đầy đủ và đúng giờ trong {currentDisciplineWatch.monthLabel}.</div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                    scrollbarGutter: 'stable'
                  }}
                >
                  {currentDisciplineWatch.recentViolations.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-8)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {v.avatarUrl ? (
                          <img
                            src={v.avatarUrl}
                            alt={v.employeeName}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--border-subtle)',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: v.type === 'unexcused_absent' ? '#fee2e2' : 'var(--bg-muted)',
                              color: v.type === 'unexcused_absent' ? '#b91c1c' : 'var(--text-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {v.employeeName.charAt(0)}
                          </div>
                        )}

                        <div style={{ minWidth: 0 }}>
                          <div className="body-sm-bold" style={{ color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.employeeName} <span style={{ fontWeight: 400, color: 'var(--text-subtle)', fontSize: '11px' }}>({v.employeeCode})</span>
                          </div>
                          <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {v.position} • {v.departmentName}
                          </div>
                          <div className="body-xs" style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '1px' }}>
                            {v.type === 'late'
                              ? `Trễ ${v.lateMinutes}p tại ${v.meetingTitle}`
                              : v.type === 'excused_absent'
                              ? `Nghỉ có phép: ${v.reason}`
                              : `Vắng không phép: ${v.meetingTitle}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {v.type === 'late' ? (
                          <StatusTag tone="warning" label={`Trễ ${v.lateMinutes}p`} />
                        ) : v.type === 'excused_absent' ? (
                          <StatusTag tone="neutral" label="Có phép" />
                        ) : (
                          <StatusTag tone="danger" label="Không phép" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
