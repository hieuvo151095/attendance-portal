import React, { useState, useEffect } from 'react';
import { Login } from './pages/auth/Login';
import { DepartmentManagement } from './pages/organization/DepartmentManagement';
import { EmployeeManagement } from './pages/organization/EmployeeManagement';
import { Button, Tag, Icon } from './design-system';
import { authService } from './services/auth';
import { AuthSession } from './types/auth';

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentTab, setCurrentTab] = useState<'employees' | 'departments' | 'session'>('employees');

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
      </div>
    );
  }

  return (
    <div className="attendance-portal-app" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* App Header */}
      <header
        style={{
          height: '56px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-6)',
                backgroundColor: 'var(--eco-blue-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="fingerprint" size={18} color="#ffffff" />
            </div>
            <strong className="title-md" style={{ color: 'var(--text-heading)', fontSize: '15px' }}>
              Finviet Attendance
            </strong>
          </div>

          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-default)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag variant="default">{session.tenant.orgName}</Tag>
            <Tag variant="code">{session.tenant.username}</Tag>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant={currentTab === 'employees' ? 'secondary' : 'ghost'}
            active={currentTab === 'employees'}
            onClick={() => setCurrentTab('employees')}
            icon="users"
          >
            Nhân Sự
          </Button>

          <Button
            variant={currentTab === 'departments' ? 'secondary' : 'ghost'}
            active={currentTab === 'departments'}
            onClick={() => setCurrentTab('departments')}
            icon="layer-group"
          >
            Phòng Ban
          </Button>

          <Button
            variant={currentTab === 'session' ? 'secondary' : 'ghost'}
            active={currentTab === 'session'}
            onClick={() => setCurrentTab('session')}
            icon="building"
          >
            Tài Khoản
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            icon="right-from-bracket"
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '24px 16px', maxWidth: '1440px', margin: '0 auto' }}>
        {currentTab === 'employees' ? (
          <EmployeeManagement tenantId={session.tenant.id} />
        ) : currentTab === 'departments' ? (
          <DepartmentManagement session={session} />
        ) : (
          <Login onLoginSuccess={setSession} />
        )}
      </main>
    </div>
  );
};
