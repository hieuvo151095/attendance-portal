import React, { useState } from 'react';
import { Icon, Button, StatusTag, Tag, EmptyValue } from '../../design-system';
import { TodayAttendanceRoster } from '../../services/dashboard';

export interface TodayAttendanceRosterCardProps {
  roster: TodayAttendanceRoster;
  onNavigateTab?: (tab: 'attendance' | 'meetings' | 'reports' | 'employees' | 'departments') => void;
}

export type RosterFilter = 'all' | 'leave' | 'absent' | 'present';

export const TodayAttendanceRosterCard: React.FC<TodayAttendanceRosterCardProps> = ({
  roster,
  onNavigateTab
}) => {
  const [filter, setFilter] = useState<RosterFilter>('all');

  const filteredItems = roster.items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'leave') return item.status === 'leave';
    if (filter === 'absent') return item.status === 'absent';
    if (filter === 'present') return item.status === 'present' || item.status === 'late';
    return true;
  });

  return (
    <div
      className="dashboard-card"
      data-testid="attendance-today-roster-card"
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
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
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
              gap: '8px',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            <Icon name="users" size={18} color="var(--eco-blue-strong)" />
            Chấm công hôm nay và Nghỉ phép
          </h2>
          <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px', display: 'inline-block' }}>
            Theo dõi cán bộ có mặt thực tế, nghỉ phép có đơn và vắng mặt trong ngày
          </span>
        </div>

        {onNavigateTab && (
          <Button
            variant="ghost"
            onClick={() => onNavigateTab('attendance')}
          >
            Màn hình chấm công
          </Button>
        )}
      </div>

      {/* 2. Top Summary KPI Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          padding: '12px',
          borderRadius: 'var(--radius-8)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Có mặt */}
        <div
          onClick={() => setFilter(filter === 'present' ? 'all' : 'present')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-6)',
            backgroundColor: filter === 'present' ? 'var(--bg-surface)' : 'transparent',
            boxShadow: filter === 'present' ? 'var(--shadow-xs)' : 'none',
            border: filter === 'present' ? '1px solid var(--border-default)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>
              Đang có mặt
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--semantic-success)'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span className="title-sm" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
              {roster.presentCount}
            </span>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              / {roster.totalStaff} cán bộ ({roster.totalStaff > 0 ? Math.round((roster.presentCount / roster.totalStaff) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Nghỉ phép có đơn */}
        <div
          onClick={() => setFilter(filter === 'leave' ? 'all' : 'leave')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-6)',
            backgroundColor: filter === 'leave' ? 'var(--bg-surface)' : 'transparent',
            boxShadow: filter === 'leave' ? 'var(--shadow-xs)' : 'none',
            border: filter === 'leave' ? '1px solid var(--border-default)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>
              Nghỉ phép có đơn
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--eco-blue-strong)'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span className="title-sm" style={{ fontWeight: 700, color: 'var(--eco-blue-strong)' }}>
              {roster.leaveCount}
            </span>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              cán bộ (đã duyệt)
            </span>
          </div>
        </div>

        {/* Chưa đến / Vắng */}
        <div
          onClick={() => setFilter(filter === 'absent' ? 'all' : 'absent')}
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-6)',
            backgroundColor: filter === 'absent' ? 'var(--bg-surface)' : 'transparent',
            boxShadow: filter === 'absent' ? 'var(--shadow-xs)' : 'none',
            border: filter === 'absent' ? '1px solid var(--border-default)' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="body-xs-medium" style={{ color: 'var(--text-subtle)' }}>
              Chưa đến / Vắng
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: roster.absentCount > 0 ? 'var(--semantic-warning)' : 'var(--text-disabled)'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span
              className="title-sm"
              style={{
                fontWeight: 700,
                color: roster.absentCount > 0 ? 'var(--semantic-warning)' : 'var(--text-heading)'
              }}
            >
              {roster.absentCount}
            </span>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              cán bộ
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: filter === 'all' ? 'var(--eco-blue-strong)' : 'var(--bg-subtle)',
            color: filter === 'all' ? '#FFFFFF' : 'var(--text-body)',
            transition: 'all 0.15s ease'
          }}
        >
          Tất cả ({roster.totalStaff})
        </button>

        <button
          type="button"
          onClick={() => setFilter('leave')}
          style={{
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: filter === 'leave' ? 'var(--eco-blue-strong)' : 'var(--bg-subtle)',
            color: filter === 'leave' ? '#FFFFFF' : 'var(--text-body)',
            transition: 'all 0.15s ease'
          }}
        >
          Nghỉ phép ({roster.leaveCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('absent')}
          style={{
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: filter === 'absent' ? 'var(--eco-blue-strong)' : 'var(--bg-subtle)',
            color: filter === 'absent' ? '#FFFFFF' : 'var(--text-body)',
            transition: 'all 0.15s ease'
          }}
        >
          Chưa đến / Vắng ({roster.absentCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('present')}
          style={{
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: filter === 'present' ? 'var(--eco-blue-strong)' : 'var(--bg-subtle)',
            color: filter === 'present' ? '#FFFFFF' : 'var(--text-body)',
            transition: 'all 0.15s ease'
          }}
        >
          Có mặt ({roster.presentCount})
        </button>
      </div>

      {/* 4. Scrollable List of Personnel */}
      {filteredItems.length === 0 ? (
        <EmptyValue label="Không có cán bộ nào thuộc nhóm này" />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {filteredItems.map((item) => {
            const isLeave = item.status === 'leave';
            const isAbsent = item.status === 'absent';
            const isLate = item.status === 'late';

            let tagTone: 'success' | 'warning' | 'neutral' | 'danger' = 'success';
            if (isLeave) tagTone = 'neutral';
            else if (isAbsent) tagTone = 'warning';
            else if (isLate) tagTone = 'warning';

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: isLeave
                    ? 'rgba(0, 112, 206, 0.04)'
                    : isAbsent
                    ? 'rgba(239, 68, 68, 0.04)'
                    : 'var(--bg-canvas)',
                  border: isLeave
                    ? '1px solid rgba(0, 112, 206, 0.2)'
                    : isAbsent
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid var(--border-subtle)',
                  gap: '12px'
                }}
              >
                {/* Left: Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isLeave
                        ? 'var(--eco-blue-subtle)'
                        : isAbsent
                        ? '#FEE2E2'
                        : 'var(--bg-subtle)',
                      color: isLeave
                        ? 'var(--eco-blue-strong)'
                        : isAbsent
                        ? '#DC2626'
                        : 'var(--text-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <span>{item.employeeName.charAt(0)}</span>
                    {item.avatarUrl && (
                      <img
                        src={item.avatarUrl}
                        alt={item.employeeName}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      className="body-sm"
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-heading)',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.employeeName}{' '}
                      <code style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        ({item.employeeCode})
                      </code>
                    </div>
                    <div
                      className="body-xs"
                      style={{
                        color: 'var(--text-subtle)',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.departmentName}
                    </div>
                  </div>
                </div>

                {/* Right: Status details */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  {/* Dòng trên: Time hoặc text "Chưa check-in" hoặc lý do nghỉ */}
                  {item.checkInTime ? (
                    <span
                      className="body-xs"
                      style={{
                        color: 'var(--text-heading)',
                        fontWeight: 600,
                        fontSize: '12px',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: '16px'
                      }}
                    >
                      {item.checkInTime}
                    </span>
                  ) : isAbsent ? (
                    <span
                      className="body-xs"
                      style={{
                        color: 'var(--text-subtle)',
                        fontStyle: 'italic',
                        fontSize: '11px',
                        lineHeight: '16px'
                      }}
                    >
                      Chưa check-in
                    </span>
                  ) : isLeave && item.leaveReason ? (
                    <span
                      className="body-xs"
                      style={{
                        color: 'var(--text-subtle)',
                        fontStyle: 'italic',
                        maxWidth: '180px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '11px',
                        lineHeight: '16px'
                      }}
                    >
                      {item.leaveReason}
                    </span>
                  ) : null}

                  {/* Dòng dưới: Label "Đi muộn", "Chưa đến", "Đúng giờ" hoặc "Nghỉ phép" */}
                  <div>
                    {isLeave ? (
                      <Tag variant="default">
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--eco-blue-strong)',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                        >
                          <Icon name="calendar-check" size={12} />
                          Nghỉ phép
                        </span>
                      </Tag>
                    ) : isAbsent ? (
                      <StatusTag tone="warning" label="Chưa đến" />
                    ) : (
                      <StatusTag tone={tagTone} label={item.statusLabel} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
