import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SelectField,
  Button,
  Meter,
  Icon
} from '../../design-system';
import {
  dashboardService,
  DashboardData,
  DashboardPeriod,
  DashboardFilterOptions
} from '../../services/dashboard';
import { departmentService } from '../../services/department';
import { Department } from '../../types/organization';
import { attendanceSettingService } from '../../services/setting';
import { DepartmentAttendanceComparison } from './DepartmentAttendanceComparison';
import { AttendancePeriodRangeFilter } from './AttendancePeriodRangeFilter';
import { MeetingDashboard } from './MeetingDashboard';
import { TodayAttendanceRosterCard } from './TodayAttendanceRosterCard';
import { ActionCenterCard } from './ActionCenterCard';

export interface AttendanceDashboardProps {
  tenantId: string;
  initialTab?: 'attendance' | 'meetings';
  onNavigateTab?: (tab: 'attendance' | 'meetings' | 'reports' | 'employees' | 'departments' | 'settings', subTab?: string) => void;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  tenantId,
  initialTab = 'attendance',
  onNavigateTab
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'attendance' | 'meetings'>(initialTab);
  const [period, setPeriod] = useState<DashboardPeriod>('days');
  const [dayRange, setDayRange] = useState<string>('14');
  const [weekRange, setWeekRange] = useState<string>('12');
  const [monthRange, setMonthRange] = useState<string>('12');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-24');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-11-06');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [targetOnTimeRate, setTargetOnTimeRate] = useState<number>(90);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const handleCustomDateChange = (start: string, end: string) => {
    let s = new Date(start);
    let e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;

    const maxDate = new Date('2026-11-06');
    if (e > maxDate) {
      e = maxDate;
    }
    if (s > e) {
      s = new Date(e);
    }

    if (period === 'days' || period === 'today') {
      const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 14) {
        const clampedStart = new Date(e);
        clampedStart.setDate(e.getDate() - 13);
        s = clampedStart;
      }
    } else if (period === 'weeks' || period === 'week') {
      const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 84) {
        const clampedStart = new Date(e);
        clampedStart.setDate(e.getDate() - 83);
        s = clampedStart;
      }
    } else if (period === 'months' || period === 'month') {
      const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
      if (months > 12) {
        const clampedStart = new Date(e);
        clampedStart.setMonth(e.getMonth() - 11);
        clampedStart.setDate(1);
        s = clampedStart;
      }
    }

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setCustomStartDate(formatDate(s));
    setCustomEndDate(formatDate(e));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const options: DashboardFilterOptions = {};
      if (period === 'days' || period === 'today') {
        if (dayRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
        } else {
          options.dayCount = parseInt(dayRange, 10);
        }
      } else if (period === 'weeks' || period === 'week') {
        if (weekRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
          const s = new Date(customStartDate);
          const e = new Date(customEndDate);
          const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          options.weekCount = Math.max(1, Math.min(12, Math.round(diffDays / 7)));
        } else {
          options.weekCount = parseInt(weekRange, 10);
        }
      } else if (period === 'months' || period === 'month') {
        if (monthRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
          const s = new Date(customStartDate);
          const e = new Date(customEndDate);
          const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
          options.monthCount = Math.max(1, Math.min(12, months));
        } else {
          options.monthCount = parseInt(monthRange, 10);
        }
      }

      const [deptList, dashData, settings] = await Promise.all([
        departmentService.getDepartmentsByTenant(tenantId),
        dashboardService.getDashboardData(tenantId, period, selectedDeptId || undefined, options),
        attendanceSettingService.getSettings(tenantId).catch(() => null)
      ]);
      setDepartments(deptList);
      setData(dashData);
      if (settings?.targetOnTimeRate) {
        setTargetOnTimeRate(settings.targetOnTimeRate);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, period, dayRange, weekRange, monthRange, customStartDate, customEndDate, selectedDeptId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const options: DashboardFilterOptions = {};
      if (period === 'days' || period === 'today') {
        if (dayRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
        } else {
          options.dayCount = parseInt(dayRange, 10);
        }
      } else if (period === 'weeks' || period === 'week') {
        if (weekRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
          const s = new Date(customStartDate);
          const e = new Date(customEndDate);
          const diffDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          options.weekCount = Math.max(1, Math.min(12, Math.round(diffDays / 7)));
        } else {
          options.weekCount = parseInt(weekRange, 10);
        }
      } else if (period === 'months' || period === 'month') {
        if (monthRange === 'custom') {
          options.startDate = customStartDate;
          options.endDate = customEndDate;
          const s = new Date(customStartDate);
          const e = new Date(customEndDate);
          const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
          options.monthCount = Math.max(1, Math.min(12, months));
        } else {
          options.monthCount = parseInt(monthRange, 10);
        }
      }

      await dashboardService.exportDashboardExcel(
        tenantId,
        period,
        selectedDeptId || undefined,
        options
      );
    } catch (err) {
      console.error('Lỗi xuất báo cáo tổng quan:', err);
    } finally {
      setExporting(false);
    }
  };

  const departmentFilterOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))
  ];

  return (
    <div
      className="attendance-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      <div
        className="dashboard-scrollable-body"
        style={{
          padding: '4px 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Page Title & Subtitle OUTSIDE all sections */}
        <div
          data-testid="dashboard-page-header"
          style={{
            padding: '0 0 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Tổng Quan Điểm Danh & Chuyên Cần
          </h1>
          <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
            Theo dõi phân tích xu hướng hiện diện, tỷ lệ đúng giờ và so sánh chuyên cần giữa các phòng ban.
          </p>
        </div>

        {/* Top Module Sub-tabs: Chấm Công vs Cuộc Họp */}
        <div
          data-testid="dashboard-subtabs-container"
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
            data-testid="dashboard-tab-attendance"
            onClick={() => setActiveDashboardTab('attendance')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeDashboardTab === 'attendance' ? '2.5px solid var(--eco-blue-strong)' : '2.5px solid transparent',
              color: activeDashboardTab === 'attendance' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeDashboardTab === 'attendance' ? 600 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="clipboard-check" size={17} color={activeDashboardTab === 'attendance' ? 'var(--eco-blue-strong)' : 'currentColor'} />
            Chấm Công
          </button>
          <button
            type="button"
            data-testid="dashboard-tab-meetings"
            onClick={() => setActiveDashboardTab('meetings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeDashboardTab === 'meetings' ? '2.5px solid var(--eco-blue-strong)' : '2.5px solid transparent',
              color: activeDashboardTab === 'meetings' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
              fontWeight: activeDashboardTab === 'meetings' ? 600 : 500,
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="calendar-check" size={17} color={activeDashboardTab === 'meetings' ? 'var(--eco-blue-strong)' : 'currentColor'} />
            Cuộc Họp
          </button>
        </div>

        {activeDashboardTab === 'meetings' ? (
          <MeetingDashboard tenantId={tenantId} onNavigateTab={onNavigateTab} />
        ) : (
          <>
            {/* ================= GROUP 1: EXECUTIVE ATTENDANCE OVERVIEW (Filters, KPIs, Charts) ================= */}
            <div
              className="dashboard-card"
              data-testid="attendance-overview-group"
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
              <Icon name="chart-simple" size={18} color="var(--eco-blue-strong)" />
              <span className="title-md" style={{ color: 'var(--text-heading)', margin: 0, fontWeight: 600 }}>
                Xu Hướng Hiện Diện & Phương Thức Xác Thực
              </span>
            </div>

            {/* Filter Controls & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              {/* Unified Period & Real Date Range Frame */}
              <AttendancePeriodRangeFilter
                period={period}
                onPeriodChange={(newP) => setPeriod(newP)}
                dayRange={dayRange}
                onDayRangeChange={(newR) => setDayRange(newR)}
                weekRange={weekRange}
                onWeekRangeChange={(newR) => setWeekRange(newR)}
                monthRange={monthRange}
                onMonthRangeChange={(newR) => setMonthRange(newR)}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomDateChange={handleCustomDateChange}
              />

              {/* Department Filter */}
              <SelectField
                id="dashboard-dept-filter"
                value={selectedDeptId}
                onChange={(val) => setSelectedDeptId(val)}
                options={departmentFilterOptions}
                width={185}
              />

              {/* Export CSV / Excel Button */}
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
                textAlign: 'center',
                color: 'var(--text-subtle)'
              }}
            >
              <Icon name="spinner" size={28} className="fa-spin" />
              <p style={{ marginTop: '12px' }}>Đang tổng hợp dữ liệu chuyên cần toàn cơ quan...</p>
            </div>
          ) : (
            <>
              {/* 2. Highlighted KPI Stat Cards Group */}
              <StatCard.Group columns={5}>
                <StatCard
                  label="Tỷ Lệ Hiện Diện"
                  value={`${data.kpis.attendanceRate}%`}
                  tone={data.kpis.attendanceRate >= 90 ? 'success' : 'warning'}
                  icon="clipboard-check"
                />
                <StatCard
                  label="Tỷ Lệ Đúng Giờ"
                  value={`${data.kpis.onTimeRate}%`}
                  tone="success"
                  icon="clock"
                />
                <StatCard
                  label="Đi Muộn"
                  value={String(data.kpis.lateCount)}
                  tone={data.kpis.lateCount > 0 ? 'warning' : 'neutral'}
                  icon="bell"
                />
                <StatCard
                  label="Về Sớm"
                  value={String(data.kpis.earlyLeaveCount)}
                  tone={data.kpis.earlyLeaveCount > 0 ? 'warning' : 'neutral'}
                  icon="right-from-bracket"
                />
                <StatCard
                  label="Vắng"
                  value={String(data.kpis.absentCount)}
                  tone={data.kpis.absentCount > 0 ? 'warning' : 'success'}
                  icon="users"
                />
              </StatCard.Group>

            {/* Row 1: Trend Chart & Check-in Methods Distribution */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1.1fr)',
                gap: '24px'
              }}
            >
              {/* Trend Chart Card */}
              <div
                className="dashboard-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-12)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
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
                      <Icon name="chart-line" size={18} color="var(--eco-blue-strong)" />
                      Xu Hướng Hiện Diện & Chuyên Cần (
                      {(period === 'days' || period === 'today')
                        ? (dayRange === 'custom'
                            ? `${data.trends[0]?.label || ''} - ${data.trends[data.trends.length - 1]?.label || ''}`
                            : `${data.trends.length} ngày qua`)
                        : (period === 'weeks' || period === 'week')
                        ? `${data.trends.length} tuần qua`
                        : `${data.trends.length} tháng qua`}
                      )
                    </h2>
                    <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      {(period === 'days' || period === 'today')
                        ? `Tỷ lệ đi làm đúng giờ, đi muộn, về sớm và vắng mặt theo ngày (${data.trends[0]?.date || ''} - ${data.trends[data.trends.length - 1]?.date || ''})`
                        : (period === 'weeks' || period === 'week')
                        ? `Tỷ lệ đi làm đúng giờ, đi muộn, về sớm và vắng mặt theo tuần (${data.trends[0]?.label || ''} - ${data.trends[data.trends.length - 1]?.label || ''})`
                        : `Tỷ lệ đi làm đúng giờ, đi muộn, về sớm và vắng mặt theo tháng (Tối đa 12 tháng)`}
                    </span>
                  </div>

                  {/* Chart Legend */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      fontSize: '12px',
                      flexShrink: 0
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
                      % Hiện diện
                    </span>
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

                    {/* Columns per point */}
                    {data.trends.map((pt, idx) => {
                      const totalPoints = data.trends.length;
                      const colWidth = Math.min(26, Math.max(14, 380 / totalPoints));
                      const xCenter = (700 / (totalPoints + 1)) * (idx + 1);
                      const x = xCenter - colWidth / 2;

                      const maxVal = Math.max(1, data.kpis.totalStaff);
                      const onTimeH = (pt.onTimeCount / maxVal) * 140;
                      const lateH = (pt.lateCount / maxVal) * 140;
                      const earlyLeaveH = ((pt.earlyLeaveCount || 0) / maxVal) * 140;
                      const absentH = (pt.absentCount / maxVal) * 140;

                      const isHovered = hoveredTrendIdx === idx;

                      return (
                        <g
                          key={`${pt.label}-${idx}`}
                          onMouseEnter={() => setHoveredTrendIdx(idx)}
                          onMouseLeave={() => setHoveredTrendIdx(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Background hover bar */}
                          <rect
                            x={xCenter - colWidth}
                            y="10"
                            width={colWidth * 2}
                            height="180"
                            fill={isHovered ? 'var(--eco-blue-subtle)' : 'transparent'}
                            rx="4"
                            opacity="0.5"
                          />

                          {/* Stacked bars: Absent at top, then Early Leave, then Late, then OnTime at base */}
                          {/* OnTime */}
                          <rect
                            x={x}
                            y={190 - onTimeH}
                            width={colWidth}
                            height={Math.max(0, onTimeH)}
                            fill="#10B981"
                            rx="2"
                          />
                          {/* Late */}
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
                          {/* Early Leave */}
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
                          {/* Absent */}
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

                          {/* Trend Point Marker for Attendance Rate */}
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

                  {/* X-Axis Labels: positioned directly and precisely under each bar column */}
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
                          key={`${pt.label}-${idx}`}
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
                              fontSize: totalPoints > 10 ? '10px' : '11px',
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
                        top: '10px',
                        left: `${Math.min(80, Math.max(15, ((hoveredTrendIdx + 1) / (data.trends.length + 1)) * 100))}%`,
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-8)',
                        padding: '10px 14px',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '12px',
                        zIndex: 10,
                        pointerEvents: 'none',
                        minWidth: '160px'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
                        {data.trends[hoveredTrendIdx].date} ({data.trends[hoveredTrendIdx].label})
                      </div>
                      <div style={{ color: '#10B981', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Đúng giờ:</span> <strong>{data.trends[hoveredTrendIdx].onTimeCount} cán bộ</strong>
                      </div>
                      <div style={{ color: '#F59E0B', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Đi muộn:</span> <strong>{data.trends[hoveredTrendIdx].lateCount} cán bộ</strong>
                      </div>
                      <div style={{ color: '#8B5CF6', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Về sớm:</span> <strong>{data.trends[hoveredTrendIdx].earlyLeaveCount || 0} cán bộ</strong>
                      </div>
                      <div style={{ color: '#EF4444', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Vắng mặt:</span> <strong>{data.trends[hoveredTrendIdx].absentCount} cán bộ</strong>
                      </div>
                      <div style={{ color: '#3B82F6', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', marginTop: '4px', paddingTop: '4px' }}>
                        <span>Hiện diện:</span> <strong>{data.trends[hoveredTrendIdx].attendanceRate}%</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-in Method Distribution Card */}
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

                  {/* Fingerprint */}
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
                        <strong>{data.methodDistribution.fingerprint.count}</strong> lượt ({data.methodDistribution.fingerprint.percentage}%)
                      </span>
                    </div>
                    <Meter
                      value={data.methodDistribution.fingerprint.percentage}
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
                      {data.kpis.activeCardsCount}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Thẻ hoạt động
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', margin: 0 }}>
                      {data.kpis.faceIdEnrolledCount}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Có Face ID
                    </div>
                  </div>
                  <div>
                    <div className="title-sm" style={{ color: 'var(--text-heading)', margin: 0 }}>
                      {data.kpis.fingerprintEnrolledCount}
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Có Vân tay
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= GROUP 2: DEPARTMENT ATTENDANCE COMPARISON ================= */}
      {data && (
        <DepartmentAttendanceComparison
          metrics={data.departmentMetrics}
          targetOnTimeRate={targetOnTimeRate}
        />
      )}

      {/* ================= GROUP 3: TODAY ROSTER & RECENT ACTIVITIES ================= */}
      {data && (
        <div
          data-testid="dashboard-bottom-group"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '24px'
          }}
        >
          {/* Card 1: Chấm công hôm nay và Nghỉ phép */}
          {data.todayRoster && (
            <TodayAttendanceRosterCard
              roster={data.todayRoster}
              onNavigateTab={onNavigateTab}
            />
          )}

          {/* Card 2: Trung Tâm Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày (Action Center) */}
          <ActionCenterCard
            tenantId={tenantId}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}
      </>
    )}
        </div>
      </div>
    );
  };
