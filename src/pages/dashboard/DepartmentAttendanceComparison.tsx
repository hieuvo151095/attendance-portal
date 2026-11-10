import React, { useState, useMemo } from 'react';
import { Icon, Tag, StatusTag, Meter, SelectField } from '../../design-system';
import { DepartmentAttendanceMetric } from '../../services/dashboard';

export interface DepartmentAttendanceComparisonProps {
  metrics: DepartmentAttendanceMetric[];
  targetOnTimeRate?: number;
  targetAttendanceRate?: number;
  hideTargetIfEmpty?: boolean;
  cutoffDateNote?: string;
  title?: string;
  subtitle?: string;
  attendanceLabel?: string;
  totalLabel?: string;
}

export type DeptViewMode = 'chart' | 'cards';
export type DeptSortBy = 'default' | 'attendance' | 'onTime';

export const DepartmentAttendanceComparison: React.FC<DepartmentAttendanceComparisonProps> = ({
  metrics,
  targetOnTimeRate,
  targetAttendanceRate,
  hideTargetIfEmpty = false,
  cutoffDateNote = 'Dữ liệu được cập nhật đến hết ngày 6/11',
  title = 'So Sánh Chuyên Cần Giữa Các Phòng Ban',
  subtitle = 'Đánh giá mức độ chấp hành giờ giấc và tỷ lệ hiện diện từng đơn vị trực thuộc trong tháng hiện tại',
  attendanceLabel = 'Tỷ lệ hiện diện',
  totalLabel = 'cán bộ'
}) => {
  const [viewMode, setViewMode] = useState<DeptViewMode>('chart');
  const [sortBy, setSortBy] = useState<DeptSortBy>('default');
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  // Kiểm tra xem có mục tiêu được cấu hình không
  const hasOnTimeTarget = typeof targetOnTimeRate === 'number' && !isNaN(targetOnTimeRate);
  const hasAttendanceTarget = typeof targetAttendanceRate === 'number' && !isNaN(targetAttendanceRate);
  const hasBothTargets = hasOnTimeTarget && hasAttendanceTarget;

  const hasTarget = hideTargetIfEmpty
    ? (hasOnTimeTarget || hasAttendanceTarget)
    : true;

  // Mục tiêu hiệu lực (nếu không cấu hình và không ẩn thì mặc định 90)
  const effectiveOnTimeTarget = hasOnTimeTarget
    ? targetOnTimeRate
    : (hideTargetIfEmpty ? undefined : 90);

  const activeBenchmarkRate = effectiveOnTimeTarget ?? targetAttendanceRate;

  // Sorted list based on user selection
  const sortedMetrics = useMemo(() => {
    const list = [...metrics];
    if (sortBy === 'attendance') {
      return list.sort((a, b) => b.attendanceRate - a.attendanceRate);
    }
    if (sortBy === 'onTime') {
      return list.sort((a, b) => b.onTimeRate - a.onTimeRate);
    }
    return list;
  }, [metrics, sortBy]);

  // Find top performer for executive highlight (tracks based on onTimeRate first, then attendanceRate)
  const topPerformer = useMemo(() => {
    if (!metrics || metrics.length === 0) return null;
    return [...metrics].sort((a, b) => {
      if (b.onTimeRate !== a.onTimeRate) return b.onTimeRate - a.onTimeRate;
      return b.attendanceRate - a.attendanceRate;
    })[0];
  }, [metrics]);

  return (
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
        gap: '20px'
      }}
    >
      {/* 1. Section Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
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
            <Icon name="layer-group" size={18} color="var(--eco-blue-strong)" />
            {title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              {subtitle}
            </span>
            <span style={{ color: 'var(--border-default)' }}>•</span>
            <span
              className="body-xs-medium"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--eco-blue-strong)',
                backgroundColor: 'var(--eco-blue-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-4)',
                fontSize: '11.5px',
                fontWeight: 600
              }}
            >
              <Icon name="calendar-check" size={12} />
              {cutoffDateNote}
            </span>
          </div>
        </div>

        {/* Right Controls: Sort + View Mode Switcher + Count Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {viewMode === 'chart' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                Sắp xếp:
              </span>
              <SelectField
                id="dept-sort-select"
                value={sortBy}
                onChange={(val) => setSortBy(val as DeptSortBy)}
                options={[
                  { value: 'default', label: 'Cơ cấu phòng ban' },
                  { value: 'attendance', label: 'Tỷ lệ hiện diện (Cao → Thấp)' },
                  { value: 'onTime', label: 'Tỷ lệ đúng giờ (Cao → Thấp)' }
                ]}
                width={190}
              />
            </div>
          )}

          {/* View Mode Toggle Buttons */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-muted)',
              padding: '3px',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--border-default)'
            }}
            role="group"
            aria-label="Chế độ xem so sánh phòng ban"
          >
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`body-xs-medium ${viewMode === 'chart' ? 'active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-6)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'chart' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'chart' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
                boxShadow: viewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontWeight: viewMode === 'chart' ? 600 : 500,
                transition: 'all 0.15s ease'
              }}
              data-testid="dept-view-chart-btn"
            >
              <Icon name="bars" size={13} />
              Biểu đồ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`body-xs-medium ${viewMode === 'cards' ? 'active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-6)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'cards' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontWeight: viewMode === 'cards' ? 600 : 500,
                transition: 'all 0.15s ease'
              }}
              data-testid="dept-view-cards-btn"
            >
              <Icon name="grip" size={13} />
              Dạng thẻ
            </button>
          </div>

          <Tag variant="default">{metrics.length} phòng ban trực thuộc</Tag>
        </div>
      </div>

      {/* 2. Main Content Based on View Mode */}
      {viewMode === 'chart' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chart Header Bar: Legend & Benchmark info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: '#10B981',
                    display: 'inline-block'
                  }}
                />
                <strong style={{ color: 'var(--text-heading)' }}>{attendanceLabel}</strong> (%)
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: '#0070CE',
                    display: 'inline-block'
                  }}
                />
                <strong style={{ color: 'var(--text-heading)' }}>Tỷ lệ đúng giờ</strong> (%)
              </span>

              {hasTarget && (
                hasBothTargets ? (
                  <>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '0px',
                          borderTop: '2px dashed #10B981',
                          display: 'inline-block'
                        }}
                      />
                      <span>Mục tiêu tỷ lệ tham dự: <strong style={{ color: '#059669' }}>{targetAttendanceRate}%</strong></span>
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                      <span
                        style={{
                          width: '16px',
                          height: '0px',
                          borderTop: '2px dashed #EF4444',
                          display: 'inline-block'
                        }}
                      />
                      <span>Mục tiêu tỷ lệ đúng giờ: <strong style={{ color: '#EF4444' }}>{targetOnTimeRate}%</strong></span>
                    </span>
                  </>
                ) : hasAttendanceTarget && !hasOnTimeTarget ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                    <span
                      style={{
                        width: '16px',
                        height: '0px',
                        borderTop: '2px dashed #10B981',
                        display: 'inline-block'
                      }}
                    />
                    <span>Mục tiêu tỷ lệ tham dự: <strong style={{ color: '#059669' }}>{targetAttendanceRate}%</strong></span>
                  </span>
                ) : effectiveOnTimeTarget !== undefined ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)' }}>
                    <span
                      style={{
                        width: '16px',
                        height: '0px',
                        borderTop: '2px dashed #EF4444',
                        display: 'inline-block'
                      }}
                    />
                    <span>Mục tiêu tỷ lệ đúng giờ: <strong style={{ color: '#EF4444' }}>{effectiveOnTimeTarget}%</strong></span>
                  </span>
                ) : null
              )}
            </div>

            {/* Top Performer Badge */}
            {topPerformer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-body)',
                  fontSize: '12px'
                }}
              >
                <span>🏆 Dẫn đầu chuyên cần:</span>
                <span className="body-xs-semibold" style={{ color: 'var(--semantic-success-strong)' }}>
                  {topPerformer.name} ({topPerformer.onTimeRate}%)
                </span>
              </div>
            )}
          </div>

          {/* Grouped Horizontal Bar Chart Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative'
            }}
          >
            {/* Scale Axis Header (0% - 100%) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 320px) 1fr',
                gap: '16px',
                paddingBottom: '6px',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-subtle)',
                fontWeight: 500
              }}
            >
              <div>ĐƠN VỊ TRỰC THUỘC</div>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <span>0%</span>
                <span style={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)' }}>25%</span>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>50%</span>
                <span style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>75%</span>
                {hasTarget && (
                  hasBothTargets ? (
                    targetAttendanceRate === targetOnTimeRate ? (
                      <span
                        style={{
                          position: 'absolute',
                          left: `${targetAttendanceRate}%`,
                          transform: 'translateX(-50%)',
                          color: '#059669',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {targetAttendanceRate}% 🎯⏱️
                      </span>
                    ) : (
                      <>
                        <span
                          style={{
                            position: 'absolute',
                            left: `${targetOnTimeRate}%`,
                            transform: Math.abs(targetAttendanceRate - targetOnTimeRate) < 10 && targetOnTimeRate < targetAttendanceRate ? 'translateX(-102%)' : 'translateX(-50%)',
                            color: '#EF4444',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {targetOnTimeRate}% ⏱️
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            left: `${targetAttendanceRate}%`,
                            transform: Math.abs(targetAttendanceRate - targetOnTimeRate) < 10 && targetAttendanceRate > targetOnTimeRate ? 'translateX(2%)' : 'translateX(-50%)',
                            color: '#059669',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {targetAttendanceRate}% 🎯
                        </span>
                      </>
                    )
                  ) : activeBenchmarkRate !== undefined ? (
                    <span
                      style={{
                        position: 'absolute',
                        left: `${activeBenchmarkRate}%`,
                        transform: 'translateX(-50%)',
                        color: '#EF4444',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      {activeBenchmarkRate}% 🎯
                    </span>
                  ) : null
                )}
                <span>100%</span>
              </div>
            </div>

            {/* Department Rows */}
            {sortedMetrics.map((dept, idx) => {
              const isHovered = hoveredDeptId === dept.id;

              // Đánh giá đạt chuẩn / cần lưu ý theo quy tắc nghiệp vụ:
              // - Chấm công: Tỷ lệ đúng giờ không đạt mục tiêu -> "Cần lưu ý"
              // - Cuộc họp: Một trong hai (Tỷ lệ tham dự hoặc Tỷ lệ đúng giờ) không đạt mục tiêu -> "Cần lưu ý"
              const isNeedsAttention = (() => {
                if (hasBothTargets) {
                  return (
                    (hasAttendanceTarget && dept.attendanceRate < (targetAttendanceRate ?? 0)) ||
                    (hasOnTimeTarget && dept.onTimeRate < (targetOnTimeRate ?? 0))
                  );
                }
                if (hasAttendanceTarget && !hasOnTimeTarget) {
                  return dept.attendanceRate < (targetAttendanceRate ?? 0);
                }
                if (effectiveOnTimeTarget !== undefined) {
                  return dept.onTimeRate < effectiveOnTimeTarget;
                }
                return false;
              })();

              return (
                <div
                  key={dept.id}
                  onMouseEnter={() => setHoveredDeptId(dept.id)}
                  onMouseLeave={() => setHoveredDeptId(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(260px, 320px) 1fr',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: isHovered ? 'var(--bg-muted)' : 'var(--bg-surface)',
                    border: `1px solid ${isHovered ? 'var(--eco-blue-subtle)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {/* Left Column: Department Info & Rank */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor:
                          idx === 0
                            ? '#FEF3C7'
                            : idx === 1
                            ? '#F1F5F9'
                            : idx === 2
                            ? '#FFEDD5'
                            : 'var(--bg-muted)',
                        color:
                          idx === 0
                            ? '#B45309'
                            : idx === 1
                            ? '#475569'
                            : idx === 2
                            ? '#C2410C'
                            : 'var(--text-subtle)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        className="title-sm"
                        style={{
                          margin: 0,
                          color: 'var(--text-heading)',
                          fontSize: '13px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={dept.name}
                      >
                        {dept.name}
                      </div>
                      <div
                        className="body-xs"
                        style={{
                          color: 'var(--text-subtle)',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px'
                        }}
                      >
                        <code>{dept.code}</code>
                        <span>•</span>
                        <span>{dept.totalStaff} {totalLabel}</span>
                        <span>•</span>
                        {isNeedsAttention ? (
                          <span style={{ color: '#EF4444', fontWeight: 600 }}>Cần lưu ý</span>
                        ) : (
                          <span style={{ color: 'var(--semantic-success)', fontWeight: 600 }}>Tốt</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dual Bars (Current & OnTime) */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px',
                      width: '100%'
                    }}
                  >
                    {/* Vertical Benchmark Target Lines */}
                    {hasTarget && (
                      hasBothTargets ? (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              left: `${targetAttendanceRate}%`,
                              top: '-6px',
                              bottom: '-6px',
                              width: '0',
                              borderLeft: '2px dashed rgba(16, 185, 129, 0.45)',
                              zIndex: 2,
                              pointerEvents: 'none'
                            }}
                            title={`Mục tiêu tỷ lệ tham dự: ${targetAttendanceRate}%`}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              left: `${targetOnTimeRate}%`,
                              top: '-6px',
                              bottom: '-6px',
                              width: '0',
                              borderLeft: '2px dashed rgba(239, 68, 68, 0.45)',
                              zIndex: 2,
                              pointerEvents: 'none'
                            }}
                            title={`Mục tiêu tỷ lệ đúng giờ: ${targetOnTimeRate}%`}
                          />
                        </>
                      ) : activeBenchmarkRate !== undefined ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${activeBenchmarkRate}%`,
                            top: '-6px',
                            bottom: '-6px',
                            width: '0',
                            borderLeft: '2px dashed rgba(239, 68, 68, 0.45)',
                            zIndex: 2,
                            pointerEvents: 'none'
                          }}
                          title={`Mục tiêu chuẩn cơ quan: ${activeBenchmarkRate}%`}
                        />
                      ) : null
                    )}

                    {/* Bar 1: Attendance Rate (Tỷ lệ hiện diện) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '16px',
                          backgroundColor: 'rgba(241, 245, 249, 0.9)',
                          borderRadius: 'var(--radius-4)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(0, dept.attendanceRate))}%`,
                            height: '100%',
                            backgroundColor: '#10B981',
                            borderRadius: 'var(--radius-4)',
                            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '6px'
                          }}
                        >
                          {dept.attendanceRate >= 25 && (
                            <span
                              style={{
                                color: '#FFFFFF',
                                fontSize: '10px',
                                fontWeight: 700,
                                lineHeight: 1
                              }}
                            >
                              {dept.attendanceRate}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* External Label if bar is short */}
                      {dept.attendanceRate < 25 && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-heading)', width: '38px' }}>
                          {dept.attendanceRate}%
                        </span>
                      )}
                    </div>

                    {/* Bar 2: On-Time Rate (Tỷ lệ đúng giờ) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '16px',
                          backgroundColor: 'rgba(241, 245, 249, 0.9)',
                          borderRadius: 'var(--radius-4)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(0, dept.onTimeRate))}%`,
                            height: '100%',
                            backgroundColor: '#0070CE',
                            borderRadius: 'var(--radius-4)',
                            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '6px'
                          }}
                        >
                          {dept.onTimeRate >= 25 && (
                            <span
                              style={{
                                color: '#FFFFFF',
                                fontSize: '10px',
                                fontWeight: 700,
                                lineHeight: 1
                              }}
                            >
                              {dept.onTimeRate}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* External Label if bar is short */}
                      {dept.onTimeRate < 25 && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-heading)', width: '38px' }}>
                          {dept.onTimeRate}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. Cards View (Original Layout) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}
          data-testid="dept-cards-grid"
        >
          {sortedMetrics.map((dept) => {
            const isNeedsAttention = (() => {
              if (hasBothTargets) {
                return (
                  (hasAttendanceTarget && dept.attendanceRate < (targetAttendanceRate ?? 0)) ||
                  (hasOnTimeTarget && dept.onTimeRate < (targetOnTimeRate ?? 0))
                );
              }
              if (hasAttendanceTarget && !hasOnTimeTarget) {
                return dept.attendanceRate < (targetAttendanceRate ?? 0);
              }
              if (effectiveOnTimeTarget !== undefined) {
                return dept.onTimeRate < effectiveOnTimeTarget;
              }
              return false;
            })();

            const tone = isNeedsAttention ? 'danger' : 'success';

            return (
              <div
                key={dept.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-8)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="title-sm"
                      style={{
                        margin: 0,
                        color: 'var(--text-heading)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={dept.name}
                    >
                      {dept.name}
                    </div>
                    <div
                      className="body-xs"
                      style={{ color: 'var(--text-subtle)', marginTop: '2px' }}
                    >
                      Mã: <code>{dept.code}</code> • {dept.totalStaff} {totalLabel}
                    </div>
                  </div>

                  <StatusTag tone={tone} label={`${dept.attendanceRate}%`} />
                </div>

                {/* Progress Meters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{ color: 'var(--text-subtle)' }}>Tỷ lệ hiện diện</span>
                      <span style={{ fontWeight: 600 }}>{dept.attendanceRate}%</span>
                    </div>
                    <Meter value={dept.attendanceRate} tone={tone} showLabel={false} />
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{ color: 'var(--text-subtle)' }}>Tỷ lệ đúng giờ</span>
                      <span style={{ fontWeight: 600 }}>{dept.onTimeRate}%</span>
                    </div>
                    <Meter
                      value={dept.onTimeRate}
                      tone={dept.onTimeRate >= 80 ? 'success' : 'warning'}
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Numbers Footer */}
                <div
                  style={{
                    paddingTop: '8px',
                    borderTop: '1px dashed var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-subtle)'
                  }}
                >
                  <span>
                    Có mặt: <strong>{dept.presentCount}</strong>
                  </span>
                  <span>
                    Đi muộn: <strong style={{ color: dept.lateCount > 0 ? '#F59E0B' : 'inherit' }}>{dept.lateCount}</strong>
                  </span>
                  <span>
                    Vắng: <strong style={{ color: dept.absentCount > 0 ? '#EF4444' : 'inherit' }}>{dept.absentCount}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
