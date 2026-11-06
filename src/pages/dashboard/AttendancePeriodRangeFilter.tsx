import React, { useState, useRef, useEffect } from 'react';
import { Icon, Button } from '../../design-system';
import { DashboardPeriod } from '../../services/dashboard';

export interface AttendancePeriodRangeFilterProps {
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  dayRange: string;
  onDayRangeChange: (r: string) => void;
  weekRange: string;
  onWeekRangeChange: (r: string) => void;
  monthRange: string;
  onMonthRangeChange: (r: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (start: string, end: string) => void;
}

const TODAY_STR = '2026-11-06';

export const getDayRangeLabel = (val: string, customStart?: string, customEnd?: string): string => {
  if (val === 'custom' && customStart && customEnd) {
    const s = customStart.split('-');
    const e = customEnd.split('-');
    return `${s[2]}/${s[1]} - ${e[2]}/${e[1]}`;
  }
  if (val === '14') return '24/10 - 06/11';
  if (val === '10') return '28/10 - 06/11';
  if (val === '7') return '31/10 - 06/11';
  return '24/10 - 06/11';
};

export const getWeekRangeLabel = (val: string, customStart?: string, customEnd?: string): string => {
  if (val === 'custom' && customStart && customEnd) {
    const s = customStart.split('-');
    const e = customEnd.split('-');
    return `${s[2]}/${s[1]} - ${e[2]}/${e[1]}`;
  }
  if (val === '12') return '15/08 - 06/11';
  if (val === '8') return '12/09 - 06/11';
  if (val === '4') return '10/10 - 06/11';
  return '15/08 - 06/11';
};

export const getMonthRangeLabel = (val: string, customStart?: string, customEnd?: string): string => {
  if (val === 'custom' && customStart && customEnd) {
    const s = customStart.split('-');
    const e = customEnd.split('-');
    return `${s[2]}/${s[1]}/${s[0]} - ${e[2]}/${e[1]}/${e[0]}`;
  }
  if (val === '12') return '01/12/2025 - 30/11/2026';
  if (val === '6') return '01/06/2026 - 30/11/2026';
  if (val === '3') return '01/09/2026 - 30/11/2026';
  return '01/12/2025 - 30/11/2026';
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Lấy ngày thứ 2 đầu tuần
function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Thứ 2 = 0
  date.setDate(date.getDate() - diff);
  return date;
}

// Lấy ngày Chủ nhật cuối tuần
function getSundayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export const AttendancePeriodRangeFilter: React.FC<AttendancePeriodRangeFilterProps> = ({
  period,
  onPeriodChange,
  dayRange,
  onDayRangeChange,
  weekRange,
  onWeekRangeChange,
  monthRange,
  onMonthRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange
}) => {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  // --- 1. DATE CALENDAR STATE ---
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(10); // 10 = Nov (0-indexed)
  const [tempStart, setTempStart] = useState<string>(
    dayRange === '14'
      ? '2026-10-24'
      : dayRange === '10'
      ? '2026-10-28'
      : dayRange === '7'
      ? '2026-10-31'
      : customStartDate || '2026-10-24'
  );
  const [tempEnd, setTempEnd] = useState<string>(
    dayRange === '14' || dayRange === '10' || dayRange === '7'
      ? '2026-11-06'
      : customEndDate || '2026-11-06'
  );
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // --- 2. WEEK CALENDAR STATE ---
  const [weekViewYear, setWeekViewYear] = useState<number>(2026);
  const [weekViewMonth, setWeekViewMonth] = useState<number>(10); // Nov
  const [tempWeekStart, setTempWeekStart] = useState<string>(
    weekRange === '12'
      ? '2026-08-15'
      : weekRange === '8'
      ? '2026-09-12'
      : weekRange === '4'
      ? '2026-10-10'
      : customStartDate || '2026-08-15'
  );
  const [tempWeekEnd, setTempWeekEnd] = useState<string>(
    weekRange === '12' || weekRange === '8' || weekRange === '4'
      ? '2026-11-06'
      : customEndDate || '2026-11-06'
  );
  const [hoveredWeekDate, setHoveredWeekDate] = useState<string | null>(null);

  // --- 3. MONTH CALENDAR STATE ---
  const [monthViewYear, setMonthViewYear] = useState<number>(2026);
  // Default months: 12/2025 to 11/2026
  const [tempMonthStartYear, setTempMonthStartYear] = useState<number>(2025);
  const [tempMonthStartMonth, setTempMonthStartMonth] = useState<number>(12);
  const [tempMonthEndYear, setTempMonthEndYear] = useState<number>(2026);
  const [tempMonthEndMonth, setTempMonthEndMonth] = useState<number>(11);
  const [hoveredMonth, setHoveredMonth] = useState<{ year: number; month: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state when props change
  useEffect(() => {
    if (dayRange === '14') {
      setTempStart('2026-10-24');
      setTempEnd('2026-11-06');
    } else if (dayRange === '10') {
      setTempStart('2026-10-28');
      setTempEnd('2026-11-06');
    } else if (dayRange === '7') {
      setTempStart('2026-10-31');
      setTempEnd('2026-11-06');
    } else if (dayRange === 'custom') {
      setTempStart(customStartDate || '2026-10-24');
      setTempEnd(customEndDate || '2026-11-06');
    }
  }, [dayRange, customStartDate, customEndDate]);

  useEffect(() => {
    if (weekRange === '12') {
      setTempWeekStart('2026-08-15');
      setTempWeekEnd('2026-11-06');
    } else if (weekRange === '8') {
      setTempWeekStart('2026-09-12');
      setTempWeekEnd('2026-11-06');
    } else if (weekRange === '4') {
      setTempWeekStart('2026-10-10');
      setTempWeekEnd('2026-11-06');
    } else if (weekRange === 'custom') {
      setTempWeekStart(customStartDate || '2026-08-15');
      setTempWeekEnd(customEndDate || '2026-11-06');
    }
  }, [weekRange, customStartDate, customEndDate]);

  useEffect(() => {
    if (monthRange === '12') {
      setTempMonthStartYear(2025);
      setTempMonthStartMonth(12);
      setTempMonthEndYear(2026);
      setTempMonthEndMonth(11);
    } else if (monthRange === '6') {
      setTempMonthStartYear(2026);
      setTempMonthStartMonth(6);
      setTempMonthEndYear(2026);
      setTempMonthEndMonth(11);
    } else if (monthRange === '3') {
      setTempMonthStartYear(2026);
      setTempMonthStartMonth(9);
      setTempMonthEndYear(2026);
      setTempMonthEndMonth(11);
    } else if (monthRange === 'custom' && customStartDate && customEndDate) {
      const s = customStartDate.split('-');
      const e = customEndDate.split('-');
      setTempMonthStartYear(parseInt(s[0], 10));
      setTempMonthStartMonth(parseInt(s[1], 10));
      setTempMonthEndYear(parseInt(e[0], 10));
      setTempMonthEndMonth(parseInt(e[1], 10));
    }
  }, [monthRange, customStartDate, customEndDate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
        setIsRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current period display text
  const currentPeriodText =
    period === 'days' || period === 'today'
      ? 'Theo ngày'
      : period === 'weeks' || period === 'week'
      ? 'Theo tuần'
      : 'Theo tháng';

  // Determine current range display text
  let currentRangeText = '';
  if (period === 'days' || period === 'today') {
    currentRangeText = getDayRangeLabel(dayRange, customStartDate, customEndDate);
  } else if (period === 'weeks' || period === 'week') {
    currentRangeText = getWeekRangeLabel(weekRange, customStartDate, customEndDate);
  } else {
    currentRangeText = getMonthRangeLabel(monthRange, customStartDate, customEndDate);
  }

  const periodOptions = [
    { value: 'days', label: 'Theo ngày' },
    { value: 'weeks', label: 'Theo tuần' },
    { value: 'months', label: 'Theo tháng' }
  ];

  // ==========================================
  // 1. DATE CALENDAR LOGIC
  // ==========================================
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewYear === 2026 && viewMonth >= 10) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
  const daysInCurMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: { day: number; dateStr: string; isCurrentMonth: boolean; disabled: boolean }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const dateObj = new Date(viewYear, viewMonth - 1, d);
    const dateStr = formatDate(dateObj);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: false, disabled: dateStr > TODAY_STR });
  }
  for (let d = 1; d <= daysInCurMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    const dateStr = formatDate(dateObj);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: true, disabled: dateStr > TODAY_STR });
  }
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(viewYear, viewMonth + 1, d);
    const dateStr = formatDate(dateObj);
    calendarCells.push({ day: d, dateStr, isCurrentMonth: false, disabled: dateStr > TODAY_STR });
  }

  const handleCalendarDayClick = (dateStr: string, disabled: boolean) => {
    if (disabled) return;
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd('');
    } else {
      if (dateStr < tempStart) {
        setTempStart(dateStr);
        setTempEnd('');
      } else {
        const startObj = new Date(tempStart);
        const endObj = new Date(dateStr);
        const diffDays = Math.round((endObj.getTime() - startObj.getTime()) / 86400000) + 1;
        if (diffDays > 14) {
          const clamped = new Date(startObj);
          clamped.setDate(startObj.getDate() + 13);
          setTempEnd(formatDate(clamped));
        } else {
          setTempEnd(dateStr);
        }
      }
    }
  };

  const handleApplyDateRange = (start: string, end: string) => {
    const s = start || '2026-10-24';
    const e = end || s;
    if (s === '2026-10-24' && e === '2026-11-06') {
      onDayRangeChange('14');
    } else if (s === '2026-10-28' && e === '2026-11-06') {
      onDayRangeChange('10');
    } else if (s === '2026-10-31' && e === '2026-11-06') {
      onDayRangeChange('7');
    } else {
      onDayRangeChange('custom');
      onCustomDateChange(s, e);
    }
    setIsRangeOpen(false);
  };

  const currentDiffDays =
    tempStart && tempEnd
      ? Math.round((new Date(tempEnd).getTime() - new Date(tempStart).getTime()) / 86400000) + 1
      : tempStart
      ? 1
      : 0;

  // ==========================================
  // 2. WEEK CALENDAR LOGIC
  // ==========================================
  const handlePrevWeekMonth = () => {
    if (weekViewMonth === 0) {
      setWeekViewMonth(11);
      setWeekViewYear((y) => y - 1);
    } else {
      setWeekViewMonth((m) => m - 1);
    }
  };

  const handleNextWeekMonth = () => {
    if (weekViewYear === 2026 && weekViewMonth >= 10) return;
    if (weekViewMonth === 11) {
      setWeekViewMonth(0);
      setWeekViewYear((y) => y + 1);
    } else {
      setWeekViewMonth((m) => m + 1);
    }
  };

  const weekFirstDayOfMonth = new Date(weekViewYear, weekViewMonth, 1);
  const weekStartDayOfWeek = (weekFirstDayOfMonth.getDay() + 6) % 7;
  const weekPrevMonthLastDate = new Date(weekViewYear, weekViewMonth, 0).getDate();
  const weekDaysInCurMonth = new Date(weekViewYear, weekViewMonth + 1, 0).getDate();

  const weekCalendarCells: { day: number; dateStr: string; isCurrentMonth: boolean; disabled: boolean }[] = [];
  for (let i = weekStartDayOfWeek - 1; i >= 0; i--) {
    const d = weekPrevMonthLastDate - i;
    const dateObj = new Date(weekViewYear, weekViewMonth - 1, d);
    const dateStr = formatDate(dateObj);
    weekCalendarCells.push({ day: d, dateStr, isCurrentMonth: false, disabled: dateStr > TODAY_STR });
  }
  for (let d = 1; d <= weekDaysInCurMonth; d++) {
    const dateObj = new Date(weekViewYear, weekViewMonth, d);
    const dateStr = formatDate(dateObj);
    weekCalendarCells.push({ day: d, dateStr, isCurrentMonth: true, disabled: dateStr > TODAY_STR });
  }
  const weekRemaining = (7 - (weekCalendarCells.length % 7)) % 7;
  for (let d = 1; d <= weekRemaining; d++) {
    const dateObj = new Date(weekViewYear, weekViewMonth + 1, d);
    const dateStr = formatDate(dateObj);
    weekCalendarCells.push({ day: d, dateStr, isCurrentMonth: false, disabled: dateStr > TODAY_STR });
  }

  const handleWeekDayClick = (dateStr: string, disabled: boolean) => {
    if (disabled) return;
    const clickedDate = new Date(dateStr);
    const monday = getMondayOfWeek(clickedDate);
    const sunday = getSundayOfWeek(clickedDate);
    const sundayStr = formatDate(sunday) > TODAY_STR ? TODAY_STR : formatDate(sunday);
    const mondayStr = formatDate(monday);

    if (!tempWeekStart || (tempWeekStart && tempWeekEnd)) {
      setTempWeekStart(mondayStr);
      setTempWeekEnd('');
    } else {
      if (dateStr < tempWeekStart) {
        setTempWeekStart(mondayStr);
        setTempWeekEnd('');
      } else {
        const startObj = new Date(tempWeekStart);
        const diffWeeks = Math.round((new Date(sundayStr).getTime() - startObj.getTime()) / (86400000 * 7)) + 1;
        if (diffWeeks > 12) {
          const clamped = new Date(startObj);
          clamped.setDate(startObj.getDate() + 12 * 7 - 1);
          const clampedStr = formatDate(clamped) > TODAY_STR ? TODAY_STR : formatDate(clamped);
          setTempWeekEnd(clampedStr);
        } else {
          setTempWeekEnd(sundayStr);
        }
      }
    }
  };

  const currentWeekDiff =
    tempWeekStart && tempWeekEnd
      ? Math.max(1, Math.min(12, Math.round((new Date(tempWeekEnd).getTime() - new Date(tempWeekStart).getTime()) / (86400000 * 7))))
      : tempWeekStart
      ? 1
      : 0;

  const handleApplyWeekRange = (start: string, end: string) => {
    const s = start || '2026-08-15';
    const e = end || TODAY_STR;
    if (s === '2026-08-15' && e === '2026-11-06') {
      onWeekRangeChange('12');
    } else if (s === '2026-09-12' && e === '2026-11-06') {
      onWeekRangeChange('8');
    } else if (s === '2026-10-10' && e === '2026-11-06') {
      onWeekRangeChange('4');
    } else {
      onWeekRangeChange('custom');
      onCustomDateChange(s, e);
    }
    setIsRangeOpen(false);
  };

  // ==========================================
  // 3. MONTH CALENDAR LOGIC
  // ==========================================
  const handlePrevMonthYear = () => {
    setMonthViewYear((y) => Math.max(2024, y - 1));
  };

  const handleNextMonthYear = () => {
    setMonthViewYear((y) => Math.min(2026, y + 1));
  };

  const handleMonthCellClick = (year: number, monthNum: number, disabled: boolean) => {
    if (disabled) return;
    const isStartSelecting =
      !tempMonthStartYear ||
      (tempMonthStartYear && tempMonthEndYear && tempMonthStartMonth && tempMonthEndMonth);

    if (isStartSelecting) {
      setTempMonthStartYear(year);
      setTempMonthStartMonth(monthNum);
      setTempMonthEndYear(0);
      setTempMonthEndMonth(0);
    } else {
      const startTotal = tempMonthStartYear * 12 + tempMonthStartMonth;
      const curTotal = year * 12 + monthNum;

      if (curTotal < startTotal) {
        setTempMonthStartYear(year);
        setTempMonthStartMonth(monthNum);
        setTempMonthEndYear(0);
        setTempMonthEndMonth(0);
      } else {
        const diffMonths = curTotal - startTotal + 1;
        if (diffMonths > 12) {
          // Clamp to 12 months max
          const clampedTotal = startTotal + 11;
          const clampedYear = Math.floor((clampedTotal - 1) / 12);
          const clampedMonth = ((clampedTotal - 1) % 12) + 1;
          setTempMonthEndYear(clampedYear);
          setTempMonthEndMonth(clampedMonth);
        } else {
          setTempMonthEndYear(year);
          setTempMonthEndMonth(monthNum);
        }
      }
    }
  };

  const currentMonthDiff =
    tempMonthStartYear && tempMonthEndYear
      ? (tempMonthEndYear - tempMonthStartYear) * 12 + (tempMonthEndMonth - tempMonthStartMonth) + 1
      : tempMonthStartYear
      ? 1
      : 0;

  const handleApplyMonthRange = () => {
    const sYear = tempMonthStartYear || 2025;
    const sMonth = tempMonthStartMonth || 12;
    const eYear = tempMonthEndYear || 2026;
    const eMonth = tempMonthEndMonth || 11;

    const sStr = `${sYear}-${String(sMonth).padStart(2, '0')}-01`;
    const lastDayOfEndMonth = new Date(eYear, eMonth, 0).getDate();
    const eStr = `${eYear}-${String(eMonth).padStart(2, '0')}-${String(lastDayOfEndMonth).padStart(2, '0')}`;

    if (sYear === 2025 && sMonth === 12 && eYear === 2026 && eMonth === 11) {
      onMonthRangeChange('12');
    } else if (sYear === 2026 && sMonth === 6 && eYear === 2026 && eMonth === 11) {
      onMonthRangeChange('6');
    } else if (sYear === 2026 && sMonth === 9 && eYear === 2026 && eMonth === 11) {
      onMonthRangeChange('3');
    } else {
      onMonthRangeChange('custom');
      onCustomDateChange(sStr, eStr);
    }
    setIsRangeOpen(false);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
      {/* 1. The Unified Frame: Standardized to Month Version Size so it never changes size */}
      <div
        ref={containerRef}
        className="period-range-frame"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-8)',
          boxShadow: 'var(--shadow-xs)',
          position: 'relative',
          height: '38px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Segment: Period Dropdown Trigger (Fixed standard width) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="body-sm-medium"
            onClick={() => {
              setIsPeriodOpen(!isPeriodOpen);
              setIsRangeOpen(false);
            }}
            data-testid="period-dropdown-trigger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0 12px',
              height: '36px',
              width: '136px',
              minWidth: '136px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              border: 'none',
              background: isPeriodOpen ? 'var(--bg-muted)' : 'transparent',
              color: 'var(--text-heading)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-8) 0 0 var(--radius-8)',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'background-color 0.15s ease'
            }}
            aria-expanded={isPeriodOpen}
            aria-haspopup="listbox"
          >
            <Icon name="calendar-days" size={14} color="var(--eco-blue-strong)" />
            <span style={{ whiteSpace: 'nowrap' }}>{currentPeriodText}</span>
            <Icon
              name="chevron-down"
              size={11}
              color="var(--text-subtle)"
              style={{
                transform: isPeriodOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
                flexShrink: 0
              }}
            />
          </button>

          {/* Period Dropdown Popover */}
          {isPeriodOpen && (
            <div
              role="listbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '140px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                zIndex: 120,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {periodOptions.map((opt) => {
                const isSelected =
                  (opt.value === 'days' && (period === 'days' || period === 'today')) ||
                  (opt.value === 'weeks' && (period === 'weeks' || period === 'week')) ||
                  (opt.value === 'months' && (period === 'months' || period === 'month'));

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onPeriodChange(opt.value as DashboardPeriod);
                      setIsPeriodOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-6)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent',
                      color: isSelected ? 'var(--eco-blue-strong)' : 'var(--text-body)',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Icon name="check" size={12} color="var(--eco-blue-strong)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider inside the frame */}
        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'var(--border-default)',
            flexShrink: 0
          }}
        />

        {/* Right Segment: Range Dropdown Trigger (Standardized to Month version size: 205px) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="body-sm-semibold"
            onClick={() => {
              setIsRangeOpen(!isRangeOpen);
              setIsPeriodOpen(false);
            }}
            data-testid="range-dropdown-trigger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0 12px',
              height: '36px',
              width: '205px',
              minWidth: '205px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              border: 'none',
              background: isRangeOpen ? 'var(--bg-muted)' : 'transparent',
              color: 'var(--eco-blue-strong)',
              cursor: 'pointer',
              borderRadius: '0 var(--radius-8) var(--radius-8) 0',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'background-color 0.15s ease'
            }}
            aria-expanded={isRangeOpen}
            aria-haspopup="dialog"
          >
            <span style={{ whiteSpace: 'nowrap' }}>{currentRangeText}</span>
            <Icon
              name="chevron-down"
              size={11}
              color="var(--text-subtle)"
              style={{
                transform: isRangeOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
                flexShrink: 0
              }}
            />
          </button>
        </div>

        {/* RANGE CALENDAR POPOVER: Applies to Date, Week, and Month options */}
        {isRangeOpen && (
          <div
            data-testid="calendar-range-popover"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '340px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-10)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              zIndex: 130,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* 1. DATE MODE CALENDAR (No suggested preset buttons) */}
            {(period === 'days' || period === 'today') && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div
                      className="body-xs-semibold"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-subtle)',
                        fontSize: '11px'
                      }}
                    >
                      Chọn phạm vi ngày
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      Tối đa 14 ngày theo thời gian thực
                    </div>
                  </div>
                  {tempStart && tempEnd && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'var(--semantic-info-soft)',
                        color: 'var(--eco-blue-strong)'
                      }}
                    >
                      {currentDiffDays} ngày
                    </span>
                  )}
                </div>

                {/* First Date & Last Date Input Fields */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Từ ngày (Ngày đầu):
                    </div>
                    <input
                      type="date"
                      data-testid="calendar-first-date-input"
                      value={tempStart}
                      max={tempEnd || TODAY_STR}
                      onChange={(e) => {
                        setTempStart(e.target.value);
                        if (tempEnd && e.target.value > tempEnd) {
                          setTempEnd(e.target.value);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '28px',
                        padding: '0 6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)'
                      }}
                    />
                  </div>
                  <div style={{ color: 'var(--text-subtle)', marginTop: '14px', fontSize: '12px' }}>→</div>
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Đến ngày (Ngày cuối):
                    </div>
                    <input
                      type="date"
                      data-testid="calendar-last-date-input"
                      value={tempEnd}
                      min={tempStart}
                      max={TODAY_STR}
                      onChange={(e) => {
                        setTempEnd(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        height: '28px',
                        padding: '0 6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)'
                      }}
                    />
                  </div>
                </div>

                {/* Visual Calendar Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      title="Tháng trước"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <strong className="body-xs-semibold" style={{ color: 'var(--text-heading)', fontSize: '13px' }}>
                      Tháng {viewMonth + 1}, {viewYear}
                    </strong>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      disabled={viewYear === 2026 && viewMonth >= 10}
                      title="Tháng sau"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: viewYear === 2026 && viewMonth >= 10 ? 'not-allowed' : 'pointer',
                        opacity: viewYear === 2026 && viewMonth >= 10 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-subtle)',
                      paddingBottom: '2px'
                    }}
                  >
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                    {calendarCells.map((c, idx) => {
                      const isStart = tempStart === c.dateStr;
                      const isEnd = tempEnd === c.dateStr;
                      const effectiveEnd = tempEnd || hoveredDate || tempStart;
                      const inRange =
                        tempStart && effectiveEnd && c.dateStr >= tempStart && c.dateStr <= effectiveEnd;

                      let bg = 'transparent';
                      let color = c.isCurrentMonth ? 'var(--text-heading)' : 'var(--text-subtle)';
                      let borderRadius = '0';
                      let fontWeight = c.isCurrentMonth ? 400 : 300;

                      if (isStart && isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = 'var(--radius-6)';
                        fontWeight = 600;
                      } else if (isStart) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = 'var(--radius-6) 0 0 var(--radius-6)';
                        fontWeight = 600;
                      } else if (isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = '0 var(--radius-6) var(--radius-6) 0';
                        fontWeight = 600;
                      } else if (inRange) {
                        bg = 'rgba(0, 112, 206, 0.12)';
                        color = 'var(--eco-blue-strong)';
                        fontWeight = 500;
                      }

                      if (c.disabled) {
                        color = 'var(--text-disabled)';
                      }

                      return (
                        <button
                          key={`${c.dateStr}-${idx}`}
                          type="button"
                          disabled={c.disabled}
                          data-date={c.dateStr}
                          onClick={() => handleCalendarDayClick(c.dateStr, c.disabled)}
                          onMouseEnter={() => {
                            if (tempStart && !tempEnd && !c.disabled && c.dateStr >= tempStart) {
                              setHoveredDate(c.dateStr);
                            }
                          }}
                          onMouseLeave={() => setHoveredDate(null)}
                          style={{
                            height: '28px',
                            border: 'none',
                            backgroundColor: bg,
                            color,
                            fontWeight,
                            fontSize: '11px',
                            cursor: c.disabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius,
                            padding: 0,
                            margin: 0,
                            transition: 'all 0.1s ease'
                          }}
                        >
                          {c.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                    {tempStart ? `${formatDisplayDate(tempStart)} → ${formatDisplayDate(tempEnd || tempStart)}` : 'Chưa chọn'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" onClick={() => setIsRangeOpen(false)}>
                      Đóng
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!tempStart}
                      onClick={() => handleApplyDateRange(tempStart, tempEnd)}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* 2. WEEK MODE CALENDAR */}
            {(period === 'weeks' || period === 'week') && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div
                      className="body-xs-semibold"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-subtle)',
                        fontSize: '11px'
                      }}
                    >
                      Chọn phạm vi tuần
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      Tối đa 12 tuần theo thời gian thực
                    </div>
                  </div>
                  {tempWeekStart && tempWeekEnd && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'var(--semantic-info-soft)',
                        color: 'var(--eco-blue-strong)'
                      }}
                    >
                      {currentWeekDiff} tuần
                    </span>
                  )}
                </div>

                {/* First Week & Last Week Input Fields */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Từ ngày (Đầu tuần):
                    </div>
                    <input
                      type="date"
                      data-testid="calendar-week-first-date-input"
                      value={tempWeekStart}
                      max={tempWeekEnd || TODAY_STR}
                      onChange={(e) => setTempWeekStart(e.target.value)}
                      style={{
                        width: '100%',
                        height: '28px',
                        padding: '0 6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)'
                      }}
                    />
                  </div>
                  <div style={{ color: 'var(--text-subtle)', marginTop: '14px', fontSize: '12px' }}>→</div>
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Đến ngày (Cuối tuần):
                    </div>
                    <input
                      type="date"
                      data-testid="calendar-week-last-date-input"
                      value={tempWeekEnd}
                      min={tempWeekStart}
                      max={TODAY_STR}
                      onChange={(e) => setTempWeekEnd(e.target.value)}
                      style={{
                        width: '100%',
                        height: '28px',
                        padding: '0 6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)'
                      }}
                    />
                  </div>
                </div>

                {/* Visual Calendar Grid for Weeks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <button
                      type="button"
                      onClick={handlePrevWeekMonth}
                      title="Tháng trước"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <strong className="body-xs-semibold" style={{ color: 'var(--text-heading)', fontSize: '13px' }}>
                      Tháng {weekViewMonth + 1}, {weekViewYear}
                    </strong>
                    <button
                      type="button"
                      onClick={handleNextWeekMonth}
                      disabled={weekViewYear === 2026 && weekViewMonth >= 10}
                      title="Tháng sau"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: weekViewYear === 2026 && weekViewMonth >= 10 ? 'not-allowed' : 'pointer',
                        opacity: weekViewYear === 2026 && weekViewMonth >= 10 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-subtle)',
                      paddingBottom: '2px'
                    }}
                  >
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                    {weekCalendarCells.map((c, idx) => {
                      const effectiveWeekEnd = tempWeekEnd || hoveredWeekDate || tempWeekStart;
                      const inRange =
                        tempWeekStart &&
                        effectiveWeekEnd &&
                        c.dateStr >= tempWeekStart &&
                        c.dateStr <= effectiveWeekEnd;

                      const isStart = tempWeekStart === c.dateStr;
                      const isEnd = tempWeekEnd === c.dateStr;

                      let bg = 'transparent';
                      let color = c.isCurrentMonth ? 'var(--text-heading)' : 'var(--text-subtle)';
                      let borderRadius = '0';
                      let fontWeight = c.isCurrentMonth ? 400 : 300;

                      if (isStart && isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = 'var(--radius-6)';
                        fontWeight = 600;
                      } else if (isStart) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = 'var(--radius-6) 0 0 var(--radius-6)';
                        fontWeight = 600;
                      } else if (isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        borderRadius = '0 var(--radius-6) var(--radius-6) 0';
                        fontWeight = 600;
                      } else if (inRange) {
                        bg = 'rgba(0, 112, 206, 0.12)';
                        color = 'var(--eco-blue-strong)';
                        fontWeight = 500;
                      }

                      if (c.disabled) {
                        color = 'var(--text-disabled)';
                      }

                      return (
                        <button
                          key={`week-${c.dateStr}-${idx}`}
                          type="button"
                          disabled={c.disabled}
                          data-week-date={c.dateStr}
                          onClick={() => handleWeekDayClick(c.dateStr, c.disabled)}
                          onMouseEnter={() => {
                            if (tempWeekStart && !tempWeekEnd && !c.disabled && c.dateStr >= tempWeekStart) {
                              setHoveredWeekDate(c.dateStr);
                            }
                          }}
                          onMouseLeave={() => setHoveredWeekDate(null)}
                          style={{
                            height: '28px',
                            border: 'none',
                            backgroundColor: bg,
                            color,
                            fontWeight,
                            fontSize: '11px',
                            cursor: c.disabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius,
                            padding: 0,
                            margin: 0,
                            transition: 'all 0.1s ease'
                          }}
                        >
                          {c.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                    {tempWeekStart
                      ? `${formatDisplayDate(tempWeekStart)} → ${formatDisplayDate(tempWeekEnd || tempWeekStart)}`
                      : 'Chưa chọn'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" onClick={() => setIsRangeOpen(false)}>
                      Đóng
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!tempWeekStart}
                      onClick={() => handleApplyWeekRange(tempWeekStart, tempWeekEnd)}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* 3. MONTH MODE CALENDAR */}
            {(period === 'months' || period === 'month') && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div
                      className="body-xs-semibold"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-subtle)',
                        fontSize: '11px'
                      }}
                    >
                      Chọn phạm vi tháng
                    </div>
                    <div className="body-xs" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      Tối đa 12 tháng theo thời gian thực
                    </div>
                  </div>
                  {tempMonthStartYear && tempMonthEndYear && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'var(--semantic-info-soft)',
                        color: 'var(--eco-blue-strong)'
                      }}
                    >
                      {currentMonthDiff} tháng
                    </span>
                  )}
                </div>

                {/* Month Range Preview Input Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Từ tháng:
                    </div>
                    <div
                      style={{
                        height: '28px',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {tempMonthStartYear
                        ? `Thg ${String(tempMonthStartMonth).padStart(2, '0')}/${tempMonthStartYear}`
                        : 'Chọn tháng'}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-subtle)', marginTop: '14px', fontSize: '12px' }}>→</div>
                  <div style={{ flex: 1 }}>
                    <div className="body-xs" style={{ fontSize: '10px', color: 'var(--text-subtle)', marginBottom: '2px' }}>
                      Đến tháng:
                    </div>
                    <div
                      style={{
                        height: '28px',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-4)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-heading)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {tempMonthEndYear
                        ? `Thg ${String(tempMonthEndMonth).padStart(2, '0')}/${tempMonthEndYear}`
                        : 'Chọn tháng'}
                    </div>
                  </div>
                </div>

                {/* 12-Month Calendar Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Year Header Navigator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <button
                      type="button"
                      onClick={handlePrevMonthYear}
                      disabled={monthViewYear <= 2024}
                      title="Năm trước"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: monthViewYear <= 2024 ? 'not-allowed' : 'pointer',
                        opacity: monthViewYear <= 2024 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <strong className="body-xs-semibold" style={{ color: 'var(--text-heading)', fontSize: '13px' }}>
                      Năm {monthViewYear}
                    </strong>
                    <button
                      type="button"
                      onClick={handleNextMonthYear}
                      disabled={monthViewYear >= 2026}
                      title="Năm sau"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: 'var(--radius-4)',
                        backgroundColor: 'transparent',
                        cursor: monthViewYear >= 2026 ? 'not-allowed' : 'pointer',
                        opacity: monthViewYear >= 2026 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-body)'
                      }}
                    >
                      <Icon name="chevron-down" size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  </div>

                  {/* 12-Month Grid (3 rows x 4 cols) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mNum) => {
                      const isDisabled = monthViewYear === 2026 && mNum > 11; // Sau tháng 11/2026 là tương lai
                      const currentTotal = monthViewYear * 12 + mNum;
                      const startTotal = tempMonthStartYear * 12 + tempMonthStartMonth;
                      const endTotal = tempMonthEndYear ? tempMonthEndYear * 12 + tempMonthEndMonth : 0;
                      const hoverTotal = hoveredMonth ? hoveredMonth.year * 12 + hoveredMonth.month : 0;
                      const effectiveEndTotal = endTotal || hoverTotal || startTotal;

                      const isStart = tempMonthStartYear === monthViewYear && tempMonthStartMonth === mNum;
                      const isEnd = tempMonthEndYear === monthViewYear && tempMonthEndMonth === mNum;
                      const inRange =
                        startTotal > 0 &&
                        effectiveEndTotal > 0 &&
                        currentTotal >= startTotal &&
                        currentTotal <= effectiveEndTotal;

                      let bg = 'var(--bg-canvas)';
                      let color = 'var(--text-heading)';
                      let border = '1px solid var(--border-default)';
                      let fontWeight = 500;

                      if (isStart && isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        border = '1px solid var(--eco-blue-strong)';
                        fontWeight = 600;
                      } else if (isStart || isEnd) {
                        bg = 'var(--eco-blue-strong)';
                        color = '#ffffff';
                        border = '1px solid var(--eco-blue-strong)';
                        fontWeight = 600;
                      } else if (inRange) {
                        bg = 'rgba(0, 112, 206, 0.12)';
                        color = 'var(--eco-blue-strong)';
                        border = '1px solid rgba(0, 112, 206, 0.2)';
                        fontWeight = 600;
                      }

                      if (isDisabled) {
                        color = 'var(--text-disabled)';
                        bg = 'var(--bg-muted)';
                        border = '1px solid var(--border-subtle)';
                      }

                      return (
                        <button
                          key={`month-cell-${monthViewYear}-${mNum}`}
                          type="button"
                          disabled={isDisabled}
                          data-month-cell={`${monthViewYear}-${mNum}`}
                          onClick={() => handleMonthCellClick(monthViewYear, mNum, isDisabled)}
                          onMouseEnter={() => {
                            if (tempMonthStartYear && !tempMonthEndYear && !isDisabled) {
                              setHoveredMonth({ year: monthViewYear, month: mNum });
                            }
                          }}
                          onMouseLeave={() => setHoveredMonth(null)}
                          style={{
                            padding: '8px 0',
                            borderRadius: 'var(--radius-6)',
                            border,
                            backgroundColor: bg,
                            color,
                            fontSize: '12px',
                            fontWeight,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          Thg {mNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="body-xs" style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                    {tempMonthStartYear && tempMonthEndYear
                      ? `01/${String(tempMonthStartMonth).padStart(2, '0')}/${tempMonthStartYear} → 30/${String(tempMonthEndMonth).padStart(2, '0')}/${tempMonthEndYear}`
                      : 'Chọn tháng'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" onClick={() => setIsRangeOpen(false)}>
                      Đóng
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!tempMonthStartYear}
                      onClick={handleApplyMonthRange}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
