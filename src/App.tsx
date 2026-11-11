import React, { useState, useEffect, useRef } from 'react';
import { Login } from './pages/auth/Login';
import { ChangePasswordModal } from './pages/auth/ChangePasswordModal';
import { DepartmentManagement } from './pages/organization/DepartmentManagement';
import { EmployeeManagement } from './pages/organization/EmployeeManagement';
import { MeetingManagement } from './pages/meeting/MeetingManagement';
import { DailyAttendance } from './pages/attendance/DailyAttendance';
import { AttendanceDashboard } from './pages/dashboard/AttendanceDashboard';
import { SettingsManagement } from './pages/setting/SettingsManagement';
import {
  SidebarNav,
  Tag,
  Button,
  Icon,
  Avatar,
  DropdownMenu,
  PopupModal,
  ToastContainer
} from './design-system';
import { authService } from './services/auth';
import { AuthSession } from './types/auth';

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'attendance' | 'meetings' | 'reports' | 'employees' | 'departments' | 'settings'
  >('dashboard');
  const [meetingSubTab, setMeetingSubTab] = useState<'list' | 'reports'>('list');
  const [settingsSubTab, setSettingsSubTab] = useState<'attendance' | 'rooms' | 'devices'>('attendance');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Khung cuộn dùng chung của mọi module: luôn đưa về đầu trang khi chuyển module
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [currentTab]);

  // Pop-up modals state for user frame
  const [showWardModal, setShowWardModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const existing = authService.getCurrentSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  if (!session) {
    return (
      <div className="attendance-portal-app">
        <Login
          onLoginSuccess={(newSession) => {
            setSession(newSession);
          }}
        />
        <ToastContainer />
      </div>
    );
  }

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'government':
        return 'UBND / Cơ quan Nhà nước';
      case 'hospital':
        return 'Bệnh viện / Y tế';
      case 'enterprise':
        return 'Doanh nghiệp / Phân xưởng';
      default:
        return 'Cơ quan đơn vị';
    }
  };

  return (
    <div
      className="attendance-portal-app"
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Navigation bar on the left: clean, frameless items, only icon + name, no account module */}
      <SidebarNav
        brand={{
          name: 'Finviet Attendance',
          icon: 'fingerprint',
          logoSrc: `${import.meta.env.BASE_URL}brand/finviet-logo.svg`,
          subtitle: 'Cổng Điểm Danh Đơn Vị'
        }}
        activeKey={currentTab === 'reports' ? 'meetings' : currentTab}
        onSelect={(key) => {
          if (key === 'reports') {
            setCurrentTab('meetings');
            setMeetingSubTab('reports');
          } else {
            setCurrentTab(
              key as
                | 'dashboard'
                | 'attendance'
                | 'meetings'
                | 'reports'
                | 'employees'
                | 'departments'
                | 'settings'
            );
            if (key === 'meetings') {
              setMeetingSubTab('list');
            }
            if (key === 'settings') {
              setSettingsSubTab('attendance');
            }
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        items={[
          { key: 'dashboard', label: 'Tổng Quan', icon: 'chart-pie' },
          { key: 'attendance', label: 'Chấm Công', icon: 'clipboard-check' },
          { key: 'meetings', label: 'Cuộc Họp', icon: 'calendar-check' },
          { key: 'employees', label: 'Nhân Sự', icon: 'users' },
          { key: 'departments', label: 'Phòng Ban', icon: 'layer-group' },
          { key: 'settings', label: 'Thiết Lập', icon: 'gear' }
        ]}
      />

      {/* Main Content Area (Top Info Bar + Expanded Sub-module Frame) */}
      <div
        style={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        {/* Top Info Bar: Uỷ ban info on left, User frame with dropdown on right */}
        <header
          className="ecomd-header"
          style={{
            flex: 'none',
            height: '56px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            zIndex: 10
          }}
        >
          {/* Uỷ ban / Đơn vị Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-8)',
                backgroundColor: 'var(--eco-blue-subtle)',
                color: 'var(--eco-blue-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Icon name="scale-balanced" size={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
              <span
                className="body-sm-bold"
                style={{
                  color: 'var(--text-heading)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {session.tenant.orgName}
              </span>
              <Tag variant="default">{getOrgTypeLabel(session.tenant.orgType)}</Tag>
            </div>
          </div>

          {/* User frame with dropdown arrow */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <DropdownMenu
              align="right"
              trigger={
                <button
                  type="button"
                  className="ecomd-user-btn"
                  aria-label="Tùy chọn tài khoản"
                  title="Bấm để xem Thông tin Phường, Tài khoản và Đăng xuất"
                >
                  <Avatar name={session.tenant.orgName} size="sm" />
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span className="body-xs-semibold" style={{ color: 'var(--text-heading)', lineHeight: 1.2 }}>
                      {session.tenant.contactName || 'Quản trị viên'}
                    </span>
                    <span
                      className="body-xs"
                      style={{
                        color: 'var(--text-subtle)',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '11px',
                        lineHeight: 1.2
                      }}
                    >
                      @{session.tenant.username}
                    </span>
                  </div>
                  <Icon
                    name="chevron-down"
                    size={12}
                    style={{ color: 'var(--text-subtle)', marginLeft: '4px' }}
                  />
                </button>
              }
              items={[
                {
                  icon: 'building',
                  label: 'Thông tin Phường',
                  onClick: () => setShowWardModal(true)
                },
                {
                  icon: 'user-shield',
                  label: 'Thông tin tài khoản',
                  onClick: () => setShowAccountModal(true)
                },
                { divider: true },
                {
                  icon: 'right-from-bracket',
                  label: 'Đăng xuất',
                  tone: 'danger',
                  onClick: handleLogout
                }
              ]}
            />
          </div>
        </header>

        {/* Viewport Stage: Expanded Frame ("mở rộng khung") */}
        <main
          ref={mainRef}
          className="attendance-viewport-stage"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px 24px 24px',
            backgroundColor: 'var(--bg-canvas)',
            boxSizing: 'border-box'
          }}
        >
          {/* Expanded module screen container */}
          <div
            className="attendance-module-screen"
            style={{
              width: '100%',
              minHeight: '100%',
              backgroundColor: 'transparent',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {currentTab === 'dashboard' ? (
              <AttendanceDashboard
                tenantId={session.tenant.id}
                onNavigateTab={(tab, subTab) => {
                  if (tab === 'reports') {
                    setCurrentTab('meetings');
                    setMeetingSubTab('reports');
                  } else if (tab === 'settings') {
                    setCurrentTab('settings');
                    setSettingsSubTab((subTab as 'attendance' | 'rooms' | 'devices') || 'attendance');
                  } else {
                    setCurrentTab(tab);
                    if (tab === 'meetings') {
                      setMeetingSubTab('list');
                    }
                  }
                }}
              />
            ) : currentTab === 'attendance' ? (
              <DailyAttendance tenantId={session.tenant.id} />
            ) : currentTab === 'meetings' || currentTab === 'reports' ? (
              <MeetingManagement
                tenantId={session.tenant.id}
                orgName={session.tenant.orgName}
                initialSubTab={meetingSubTab}
                onSubTabChange={(tab) => setMeetingSubTab(tab)}
              />
            ) : currentTab === 'employees' ? (
              <EmployeeManagement tenantId={session.tenant.id} />
            ) : currentTab === 'departments' ? (
              <DepartmentManagement session={session} />
            ) : (
              <SettingsManagement
                tenantId={session.tenant.id}
                initialTab={settingsSubTab}
                onTabChange={(tab) => setSettingsSubTab(tab)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Pop-up Thông tin Phường */}
      {showWardModal && (
        <PopupModal
          open={showWardModal}
          title="Thông Tin Cơ Quan / Phường"
          description="Chi tiết thông tin đơn vị quản trị hệ thống điểm danh Finviet"
          icon="building"
          width={520}
          onClose={() => setShowWardModal(false)}
          primaryAction={{
            label: 'Đóng',
            onClick: () => setShowWardModal(false)
          }}
          secondaryAction={null}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: 'var(--eco-blue-subtle)',
                  color: 'var(--eco-blue-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon name="scale-balanced" size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="title-md" style={{ margin: 0, color: 'var(--text-heading)' }}>
                  {session.tenant.orgName}
                </h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <Tag variant="default">{getOrgTypeLabel(session.tenant.orgType)}</Tag>
                  <Tag variant="success">Hoạt động chính thức</Tag>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-8)' }}>
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Mã định danh đơn vị</div>
                <div className="body-sm-semibold" style={{ color: 'var(--text-heading)', marginTop: '2px' }}>
                  {session.tenant.id}
                </div>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-8)' }}>
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tên đăng nhập hệ thống</div>
                <div className="body-sm-semibold" style={{ color: 'var(--text-heading)', marginTop: '2px', fontFamily: 'monospace' }}>
                  @{session.tenant.username}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-8)' }}>
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Người đại diện / phụ trách</div>
                <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: '2px' }}>
                  {session.tenant.contactName || 'Chưa cập nhật'}
                </div>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-8)' }}>
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Số điện thoại liên hệ</div>
                <div className="body-sm-medium" style={{ color: 'var(--text-heading)', marginTop: '2px' }}>
                  {session.tenant.contactPhone || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-8)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Địa chỉ trụ sở / cơ quan</div>
              <div
                className="body-sm-medium"
                style={{
                  color: 'var(--text-heading)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Icon name="location-dot" size={15} color="var(--eco-blue-strong)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{session.tenant.address || '29 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</span>
              </div>
            </div>

            <div
              className="body-xs"
              style={{
                color: 'var(--text-subtle)',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-6)',
                lineHeight: 1.5
              }}
            >
              🏛️ <b>Cơ chế quản lý:</b> Đơn vị cấp phường/xã vận hành độc lập, tự chủ dữ liệu cơ cấu phòng ban và cán bộ điểm danh theo mô hình Multi-tenancy Finviet.
            </div>
          </div>
        </PopupModal>
      )}

      {/* Pop-up Thông tin tài khoản */}
      {showAccountModal && (
        <PopupModal
          open={showAccountModal}
          title="Thông Tin Tài Khoản Quản Trị"
          description="Hồ sơ tài khoản và phân quyền truy cập hệ thống điểm danh"
          icon="user-shield"
          width={500}
          onClose={() => setShowAccountModal(false)}
          primaryAction={{
            label: 'Đóng',
            onClick: () => setShowAccountModal(false)
          }}
          extraAction={{
            label: 'Đổi mật khẩu',
            icon: 'lock',
            onClick: () => {
              setShowAccountModal(false);
              setShowChangePasswordModal(true);
            }
          }}
          secondaryAction={null}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)'
              }}
            >
              <Avatar name={session.tenant.contactName || session.tenant.orgName} size="md" />
              <div style={{ flex: 1 }}>
                <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                  {session.tenant.contactName || 'Quản trị viên'}
                </div>
                <div className="body-xs" style={{ color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                  @{session.tenant.username}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <Tag variant="success">Quản trị viên (Admin)</Tag>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div className="overline-xs" style={{ color: 'var(--eco-blue-strong)' }}>
                PHÂN QUYỀN TRUY CẬP (SINGLE ADMIN ROLE)
              </div>
              <div className="body-sm" style={{ color: 'var(--text-heading)' }}>
                Tài khoản có quyền <b>Toàn quyền (Admin)</b> truy cập và vận hành tất cả các phân hệ:
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '13px', color: 'var(--text-body)', lineHeight: '20px' }}>
                <li>Quản lý và lên lịch cuộc họp, điểm danh đại biểu (MTG-01, MTG-02)</li>
                <li>Quản lý cơ cấu tổ chức & phòng ban trực thuộc (ORG-01)</li>
                <li>Quản lý hồ sơ nhân sự, đồng bộ Face ID từ camera Hikvision (ORG-02)</li>
                <li>Cấp phát và thu hồi thẻ điểm danh RFID/NFC (ORG-03)</li>
              </ul>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-8)'
              }}
            >
              <div>
                <div className="body-xs-semibold" style={{ color: 'var(--text-heading)' }}>Bảo mật & Mật khẩu</div>
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Nên định kỳ cập nhật mật khẩu để đảm bảo an toàn</div>
              </div>
              <Button
                variant="secondary"
                icon="lock"
                onClick={() => {
                  setShowAccountModal(false);
                  setShowChangePasswordModal(true);
                }}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </PopupModal>
      )}

      {/* Modal Đổi mật khẩu */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          open={showChangePasswordModal}
          session={session}
          isFirstLogin={false}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={(newSession) => {
            setSession(newSession);
            setShowChangePasswordModal(false);
          }}
        />
      )}
      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};
