import React, { useState, useEffect } from 'react';
import {
  TextField,
  PasswordField,
  Checkbox,
  Button,
  InlineNotice,
  StatusTag,
  Tag,
  Icon
} from '../../design-system';
import { ChangePasswordModal } from './ChangePasswordModal';
import { authService, INITIAL_TENANTS } from '../../services/auth';
import { AuthSession, OrganizationType } from '../../types/auth';

export interface LoginProps {
  onLoginSuccess?: (session: AuthSession) => void;
  showDemoAccounts?: boolean;
}

const ORG_TYPE_LABELS: Record<OrganizationType, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' }> = {
  government: { label: 'Ủy ban / Khối Nhà Nước', tone: 'info' },
  enterprise: { label: 'Doanh nghiệp / Nhà máy', tone: 'warning' },
  hospital: { label: 'Bệnh viện / Cơ sở Y tế', tone: 'success' }
};

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  showDemoAccounts: propShowDemoAccounts
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);

  // Xác định hiển thị danh sách tài khoản demo:
  // - Ở local (localhost, 127.0.0.1, dev server, test): hiển thị để tiện thử nghiệm
  // - Khi đóng gói / đẩy lên Git (production / non-local) hoặc khi ?demo=0: tự động ẩn
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const demoParam = urlParams?.get('demo');

  const isLocalEnvironment =
    demoParam === '1' ||
    (demoParam !== '0' &&
      (import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === 'true' ||
        (import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS !== 'false' &&
          (import.meta.env.DEV ||
            import.meta.env.MODE === 'test' ||
            (typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1'))))));

  const shouldShowDemo = propShowDemoAccounts !== undefined ? propShowDemoAccounts : isLocalEnvironment;

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hiện tại nếu có
    const existingSession = authService.getCurrentSession();
    if (existingSession) {
      setCurrentSession(existingSession);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc mã đơn vị do Finviet cấp');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu xác thực');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        username,
        password,
        rememberMe
      });

      if (result.success && result.session) {
        setCurrentSession(result.session);
        if (result.requirePasswordChange) {
          setShowPasswordModal(true);
        }
        if (onLoginSuccess) {
          onLoginSuccess(result.session);
        }
      } else {
        setErrorMessage(result.error || 'Đăng nhập không thành công');
        setIsLocked(!!result.isLocked);
      }
    } catch {
      setErrorMessage('Có lỗi phát sinh trong quá trình xác thực. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectTenant = (tenantUsername: string) => {
    setUsername(tenantUsername);
    setPassword('Finviet@2026');
    setErrorMessage(null);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentSession(null);
    setUsername('');
    setPassword('');
  };

  // Nếu đã đăng nhập thành công
  if (currentSession) {
    const orgMeta = ORG_TYPE_LABELS[currentSession.tenant.orgType];

    return (
      <div className="login-page-container" style={styles.container}>
        <div style={styles.cardWrapper}>
          <div style={styles.cardHeader}>
            <div style={styles.brandBadge}>
              <Icon name="building" size={20} color="var(--eco-blue-strong)" />
              <span style={styles.brandTitle}>FINVIET ATTENDANCE PORTAL</span>
            </div>
            <h1 className="h3" style={{ margin: '8px 0 4px', color: 'var(--text-heading)' }}>
              Đã Đăng Nhập Thành Công
            </h1>
            <p className="body-sm" style={{ color: 'var(--text-subtle)', margin: 0 }}>
              Phiên làm việc bảo đảm cô lập dữ liệu cho cơ quan đơn vị
            </p>
          </div>

          {passwordSuccessMessage && (
            <InlineNotice tone="success" style={{ marginBottom: '16px' }}>
              {passwordSuccessMessage}
            </InlineNotice>
          )}

          <div style={styles.sessionBox}>
            <div style={styles.sessionRow}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Đơn vị quản trị:</span>
              <strong className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                {currentSession.tenant.orgName}
              </strong>
            </div>

            <div style={styles.sessionRow}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Mã tài khoản / Username:</span>
              <Tag variant="code">{currentSession.tenant.username}</Tag>
            </div>

            <div style={styles.sessionRow}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Loại hình:</span>
              <StatusTag tone={orgMeta.tone}>{orgMeta.label}</StatusTag>
            </div>

            {currentSession.tenant.contactName && (
              <div style={styles.sessionRow}>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Người phụ trách:</span>
                <span className="body-sm-medium" style={{ color: 'var(--text-body)' }}>
                  {currentSession.tenant.contactName}
                </span>
              </div>
            )}

            {currentSession.tenant.contactPhone && (
              <div style={styles.sessionRow}>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Hotline / SĐT:</span>
                <span className="body-sm-medium" style={{ color: 'var(--text-body)' }}>
                  {currentSession.tenant.contactPhone}
                </span>
              </div>
            )}

            <div style={styles.sessionRow}>
              <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Mã phiên (Token ID):</span>
              <span className="body-mono-xs" style={{ color: 'var(--text-subtle)', wordBreak: 'break-all' }}>
                {currentSession.token}
              </span>
            </div>

            {currentSession.tenant.isDefaultPassword ? (
              <InlineNotice
                tone="warning"
                style={{ marginTop: '16px' }}
                action={
                  <Button
                    variant="primary"
                    onClick={() => setShowPasswordModal(true)}
                    icon="key"
                  >
                    Đổi mật khẩu ngay
                  </Button>
                }
              >
                <strong>Yêu cầu bảo mật:</strong> Đơn vị đang sử dụng mật khẩu mặc định của Finviet. Vui lòng đổi mật khẩu mới để bảo vệ an toàn hệ thống.
              </InlineNotice>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusTag tone="success" icon="circle-check">
                  Mật khẩu an toàn đã được cập nhật
                </StatusTag>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              variant="secondary"
              block
              onClick={() => setShowPasswordModal(true)}
              icon="key"
            >
              Cập nhật mật khẩu & Hồ sơ
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              icon="right-from-bracket"
            >
              Đăng xuất
            </Button>
          </div>

          <ChangePasswordModal
            open={showPasswordModal}
            session={currentSession}
            isFirstLogin={currentSession.tenant.isDefaultPassword}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={(updatedSession) => {
              setCurrentSession(updatedSession);
              setShowPasswordModal(false);
              setPasswordSuccessMessage('Đã cập nhật mật khẩu mới và hồ sơ người đại diện thành công!');
              if (onLoginSuccess) {
                onLoginSuccess(updatedSession);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-container" style={styles.container}>
      <div style={styles.cardWrapper}>
        {/* Header / Brand */}
        <div style={styles.cardHeader}>
          <div style={styles.brandBadge}>
            <div style={styles.logoIcon}>
              <Icon name="fingerprint" size={24} color="#ffffff" />
            </div>
            <div>
              <span style={styles.brandTitle}>FINVIET TECH</span>
              <span style={styles.portalSubTitle}>ATTENDANCE PORTAL</span>
            </div>
          </div>
          <h1 className="h3" style={{ margin: '16px 0 6px', color: 'var(--text-heading)' }}>
            Cổng Điểm Danh Đơn Vị
          </h1>
          <p className="body-sm" style={{ color: 'var(--text-subtle)', margin: 0 }}>
            Hệ thống điểm danh & quản lý cuộc họp dành riêng cho cơ quan nhà nước, nhà máy và bệnh viện
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <InlineNotice
            tone="danger"
            style={{ marginBottom: '20px' }}
          >
            {errorMessage}
          </InlineNotice>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <TextField
            id="login-username"
            name="username"
            label="Tên đăng nhập hoặc Mã đơn vị"
            required
            prefixIcon="building"
            placeholder="Ví dụ: ubnd-ben-nghe"
            value={username}
            onChange={(val) => {
              setUsername(val);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={loading || isLocked}
            autoComplete="username"
          />

          <PasswordField
            id="login-password"
            name="password"
            label="Mật khẩu tài khoản"
            required
            prefixIcon="lock"
            placeholder="Nhập mật khẩu do Finviet cấp"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={loading || isLocked}
            autoComplete="current-password"
          />

          <div style={styles.formFooterRow}>
            <Checkbox
              label="Ghi nhớ đơn vị trên máy này"
              checked={rememberMe}
              onChange={(checked) => setRememberMe(checked)}
              disabled={loading}
            />
            <span
              className="body-xs"
              style={{ color: 'var(--text-subtle)', cursor: 'help' }}
              title="Mật khẩu do chuyên viên Finviet bàn giao khi lắp đặt thiết bị Hikvision"
            >
              Hỗ trợ: 1900 2345
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            block
            disabled={loading || isLocked}
            icon={loading ? 'arrows-rotate' : 'arrow-right-to-bracket'}
            style={{ marginTop: '8px', height: '42px' }}
          >
            {loading ? 'Đang xác thực thông tin...' : 'Đăng nhập vào hệ thống'}
          </Button>
        </form>

        {/* Quick select test accounts helper (Chỉ hiển thị ở môi trường local) */}
        {shouldShowDemo && (
          <div style={styles.quickSelectSection}>
            <div style={styles.quickSelectHeader}>
              <span className="overline-xs" style={{ color: 'var(--text-subtle)' }}>
                TÀI KHOẢN MẪU CỦA ĐƠN VỊ KHÁCH HÀNG (DEMO)
              </span>
            </div>

            <div style={styles.quickSelectList}>
              {INITIAL_TENANTS.map((t) => {
                const meta = ORG_TYPE_LABELS[t.orgType];
                const isSelected = username === t.username;

                return (
                  <button
                    key={t.username}
                    type="button"
                    style={{
                      ...styles.quickSelectCard,
                      borderColor: isSelected ? 'var(--eco-blue-strong)' : 'var(--border-default)',
                      backgroundColor: isSelected ? 'var(--semantic-info-soft)' : 'var(--bg-surface)'
                    }}
                    onClick={() => handleQuickSelectTenant(t.username)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong className="body-xs-semibold" style={{ color: 'var(--text-heading)' }}>
                        {t.orgName}
                      </strong>
                      <StatusTag tone={meta.tone}>{meta.label}</StatusTag>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>Mã:</span>
                      <Tag variant="code">{t.username}</Tag>
                      <span className="body-xs" style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                        MK: <code>Finviet@2026</code>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    backgroundColor: 'var(--bg-canvas)'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-12)',
    boxShadow: 'var(--shadow-lg)',
    padding: '36px 32px'
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-8)',
    backgroundColor: 'var(--eco-blue-strong)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 112, 206, 0.3)'
  },
  brandTitle: {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--eco-blue-strong)',
    textAlign: 'left'
  },
  portalSubTitle: {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: 'var(--text-heading)',
    textAlign: 'left'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  formFooterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '2px 0 4px'
  },
  quickSelectSection: {
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-default)'
  },
  quickSelectHeader: {
    marginBottom: '12px',
    textAlign: 'center'
  },
  quickSelectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  quickSelectCard: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-8)',
    border: '1px solid var(--border-default)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  sessionBox: {
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-8)',
    border: '1px solid var(--border-default)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sessionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  }
};
