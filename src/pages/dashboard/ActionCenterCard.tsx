import React, { useState, useEffect, useCallback } from 'react';
import {
  Icon,
  Button,
  StatusTag,
  Tag
} from '../../design-system';
import { DailyAttendanceRecord } from '../../types/attendance';
import { dailyAttendanceService } from '../../services/attendance';
import { CameraDevice } from '../../types/device';
import { cameraDeviceService, DEFAULT_CAMERA_DEVICES } from '../../services/device';

export interface ActionCenterCardProps {
  tenantId: string;
  onNavigateTab?: (tab: 'attendance' | 'meetings' | 'reports' | 'employees' | 'departments' | 'settings', subTab?: string) => void;
}

export type ActionFilter = 'all' | 'checkout' | 'anomaly' | 'device';

export interface AnomalyItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl?: string;
  departmentName: string;
  type: 'severe_late' | 'consecutive_late';
  detail: string;
  tag: string;
}

const STATIC_ANOMALIES: AnomalyItem[] = [
  {
    id: 'anom-1',
    employeeName: 'Bà Phạm Thị Cúc',
    employeeCode: 'UBND-002',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    type: 'severe_late',
    detail: 'Đi muộn 45 phút hôm nay (Vào ca lúc 07:45 thay vì 07:00)',
    tag: 'Đi muộn > 30p'
  },
  {
    id: 'anom-2',
    employeeName: 'Ông Đỗ Quang Huy',
    employeeCode: 'UBND-008',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    departmentName: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    type: 'consecutive_late',
    detail: 'Đi muộn liên tiếp 3 ngày trong tuần này (04, 05, 06/11)',
    tag: 'Đi muộn 3 ngày liên tiếp'
  }
];

export const ActionCenterCard: React.FC<ActionCenterCardProps> = ({
  tenantId,
  onNavigateTab
}) => {
  const [filter, setFilter] = useState<ActionFilter>('all');
  const [uncheckedOutRecords, setUncheckedOutRecords] = useState<DailyAttendanceRecord[]>([]);

  // Danh sách thiết bị camera đồng bộ trực tiếp từ cameraDeviceService
  const [devices, setDevices] = useState<CameraDevice[]>(() =>
    DEFAULT_CAMERA_DEVICES.filter((d) => d.tenantId === (tenantId || 'tenant-ubnd-001'))
  );

  const loadDevices = useCallback(async () => {
    try {
      const list = await cameraDeviceService.getDevicesByTenant(tenantId || 'tenant-ubnd-001');
      if (list && list.length > 0) {
        setDevices(list);
      }
    } catch (err) {
      console.error('Failed to load devices in ActionCenterCard:', err);
    }
  }, [tenantId]);

  useEffect(() => {
    loadDevices();
    const handleDeviceChange = () => {
      loadDevices();
    };
    window.addEventListener('finviet_devices_changed', handleDeviceChange);
    window.addEventListener('storage', handleDeviceChange);
    return () => {
      window.removeEventListener('finviet_devices_changed', handleDeviceChange);
      window.removeEventListener('storage', handleDeviceChange);
    };
  }, [loadDevices]);

  // Load danh sách quên check-out ngày hôm trước (05/11/2026)
  const loadUncheckedOut = async () => {
    try {
      const pastRecords = await dailyAttendanceService.getDailyAttendance(tenantId, {
        date: '2026-11-05'
      });
      const missing = pastRecords.filter(
        (r) => r.status !== 'leave' && Boolean(r.checkInTime) && !r.checkOutTime
      );
      setUncheckedOutRecords(missing);
    } catch (err) {
      console.error('Failed to load unchecked-out records:', err);
    }
  };

  useEffect(() => {
    loadUncheckedOut();
  }, [tenantId]);

  // Điều hướng đến Chấm Công ngày 05/11 và mở SideSheet cho cán bộ đó
  const handleCheckOutBu = (record: DailyAttendanceRecord) => {
    // Store intent on window so DailyAttendance picks it up on mount
    (window as any).__finviet_checkout_intent = {
      date: '2026-11-05',
      employeeId: record.employeeId,
      recordId: record.id
    };
    // Navigate to attendance tab
    onNavigateTab?.('attendance');
  };

  // Đếm tổng số việc cần xử lý đồng bộ từ Quản trị thiết bị
  const checkoutCount = uncheckedOutRecords.length;
  const anomalyCount = STATIC_ANOMALIES.length;
  const activeDevices = devices.filter((d) => d.status === 'active');
  const alertDevices = devices.filter((d) => d.status !== 'active');
  const totalDeviceCount = devices.length;
  const deviceCount = alertDevices.length;
  const totalTasks = checkoutCount + anomalyCount + deviceCount;

  return (
    <div
      className="dashboard-card"
      data-testid="attendance-action-center-card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-12)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '610px'
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
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-6)',
                backgroundColor: 'var(--semantic-warning-light, #fef3c7)',
                color: 'var(--semantic-warning-dark, #b45309)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon name="bell" size={15} />
            </div>
            Cảnh Báo Bất Thường & Việc Cần Xử Lý Trong Ngày
            <Tag variant="warning">
              {totalTasks} việc cần xử lý
            </Tag>
          </h2>
          <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: 4, display: 'block' }}>
            Trung tâm giải quyết các vấn đề chuyên cần & cảnh báo thiết bị
          </span>
        </div>

        {onNavigateTab && (
          <Button
            variant="ghost"
            onClick={() => onNavigateTab('attendance')}
            aria-label="Màn hình chấm công"
          >
            Màn hình chấm công
          </Button>
        )}
      </div>

      {/* 2. Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-neutral-subtle)',
          paddingBottom: '12px'
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'all' ? '1px solid #2563eb' : '1px solid var(--border-default)',
            backgroundColor: filter === 'all' ? '#eff6ff' : 'transparent',
            color: filter === 'all' ? '#1d4ed8' : 'var(--text-body)',
            fontWeight: filter === 'all' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Tất cả ({totalTasks})
        </button>

        <button
          type="button"
          onClick={() => setFilter('checkout')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'checkout' ? '1px solid #f59e0b' : '1px solid var(--border-default)',
            backgroundColor: filter === 'checkout' ? '#fef3c7' : 'transparent',
            color: filter === 'checkout' ? '#b45309' : 'var(--text-body)',
            fontWeight: filter === 'checkout' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Quên check-out ({checkoutCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('anomaly')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'anomaly' ? '1px solid #ef4444' : '1px solid var(--border-default)',
            backgroundColor: filter === 'anomaly' ? '#fee2e2' : 'transparent',
            color: filter === 'anomaly' ? '#b91c1c' : 'var(--text-body)',
            fontWeight: filter === 'anomaly' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Chuyên cần đột biến ({anomalyCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('device')}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: filter === 'device' ? '1px solid #64748b' : '1px solid var(--border-default)',
            backgroundColor: filter === 'device' ? '#f1f5f9' : 'transparent',
            color: filter === 'device' ? '#334155' : 'var(--text-body)',
            fontWeight: filter === 'device' ? 600 : 400,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Thiết bị ({deviceCount})
        </button>
      </div>

      {/* 3. Task List Container (Fixed height to prevent screen jumping/moving) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '468px',
          minHeight: '468px',
          maxHeight: '468px',
          overflowY: 'auto',
          paddingRight: '2px',
          scrollbarGutter: 'stable'
        }}
      >
        {/* GROUP 1: Cán bộ quên check-out ngày hôm trước */}
        {(filter === 'all' || filter === 'checkout') && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="clock" size={13} color="var(--semantic-warning-dark, #b45309)" />
                <span className="body-xs-bold" style={{ color: 'var(--semantic-warning-dark, #b45309)' }}>
                  Cán bộ quên check-out (Ngày hôm trước — 05/11/2026)
                </span>
              </div>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                {uncheckedOutRecords.length} cán bộ
              </span>
            </div>

            {uncheckedOutRecords.length === 0 ? (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-6)',
                  color: 'var(--text-subtle)',
                  fontSize: '12px'
                }}
              >
                Không có cán bộ nào quên check-out ngày hôm trước. Toàn bộ hồ sơ đã hoàn tất.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {uncheckedOutRecords.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-8)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {r.avatarUrl ? (
                          <img src={r.avatarUrl} alt={r.employeeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          r.employeeName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                          {r.employeeName}{' '}
                          <code style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            ({r.employeeCode})
                          </code>
                        </div>
                        <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                          {r.departmentName} • Vào ca: <b>{r.checkInTime}</b> (Chưa có giờ về)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <Button
                        variant="primary"
                        onClick={() => handleCheckOutBu(r)}
                      >
                        Check-out bù
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GROUP 2: Cảnh báo chuyên cần đột biến */}
        {(filter === 'all' || filter === 'anomaly') && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="triangle-exclamation" size={13} color="var(--semantic-danger, #ef4444)" />
                <span className="body-xs-bold" style={{ color: 'var(--semantic-danger, #ef4444)' }}>
                  Cảnh báo chuyên cần đột biến
                </span>
              </div>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                {STATIC_ANOMALIES.length} trường hợp
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STATIC_ANOMALIES.map((anom) => (
                <div
                  key={anom.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {anom.avatarUrl ? (
                        <img src={anom.avatarUrl} alt={anom.employeeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        anom.employeeName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                        {anom.employeeName}{' '}
                        <code style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          ({anom.employeeCode})
                        </code>
                      </div>
                      <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                        {anom.departmentName} • {anom.detail}
                      </div>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <StatusTag
                      tone={anom.type === 'consecutive_late' ? 'danger' : 'warning'}
                      label={anom.tag}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUP 3: Trạng thái thiết bị */}
        {(filter === 'all' || filter === 'device') && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="video" size={13} color="var(--text-subtle)" />
                <span className="body-xs-bold" style={{ color: 'var(--text-heading)' }}>
                  Giám sát thiết bị Camera AI & Đầu đọc thẻ
                </span>
              </div>
              <span
                className="body-xs"
                style={{
                  color: activeDevices.length === totalDeviceCount ? 'var(--semantic-success)' : 'var(--semantic-warning-dark, #b45309)',
                  fontWeight: 500
                }}
              >
                {activeDevices.length}/{totalDeviceCount} đang hoạt động
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alertDevices.length === 0 ? (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--semantic-success)'
                  }}
                >
                  <Icon name="circle-check" size={14} />
                  <span className="body-xs-medium">
                    Toàn bộ {totalDeviceCount} thiết bị camera đang hoạt động ổn định, không có cảnh báo.
                  </span>
                </div>
              ) : (
                alertDevices.map((dev) => (
                  <div
                    key={dev.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-8)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-6)',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon name="video" size={16} />
                      </div>
                      <div>
                        <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                          {dev.name}{' '}
                          <code style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            ({dev.code})
                          </code>
                        </div>
                        <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                          {dev.location || 'Trụ sở cơ quan'} • Thiết bị đang tạm khóa bảo trì{dev.attendanceType === 'meeting' ? ' phòng họp' : ''}.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <StatusTag tone="warning" label="Tạm khoá bảo trì" />
                      {onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('settings', 'devices')}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-4)',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-canvas)',
                            color: 'var(--text-body)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Kiểm tra
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
