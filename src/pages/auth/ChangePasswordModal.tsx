import React, { useState } from 'react';
import {
  PopupModal,
  TextField,
  PasswordField,
  InlineNotice,
  Icon,
  toast
} from '../../design-system';
import { authService } from '../../services/auth';
import { AuthSession } from '../../types/auth';

export interface ChangePasswordModalProps {
  open: boolean;
  session: AuthSession;
  onClose: () => void;
  onSuccess: (updatedSession: AuthSession) => void;
  isFirstLogin?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  session,
  onClose,
  onSuccess,
  isFirstLogin = true
}) => {
  const [currentPassword, setCurrentPassword] = useState(
    isFirstLogin ? 'Finviet@2026' : ''
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactName, setContactName] = useState(session.tenant.contactName || '');
  const [contactPhone, setContactPhone] = useState(session.tenant.contactPhone || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Kiểm tra điều kiện mật khẩu real-time
  const rules = {
    length: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    notOld: newPassword.length > 0 && newPassword !== currentPassword,
    matches: newPassword.length > 0 && newPassword === confirmPassword
  };

  const isFormValid =
    rules.length &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.notOld &&
    rules.matches;

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!isFormValid) {
      if (!rules.matches && confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu mới');
      } else {
        setErrorMessage('Mật khẩu mới chưa thỏa mãn toàn bộ tiêu chí bảo mật');
      }
      return;
    }

    setLoading(true);

    try {
      const res = await authService.changePassword(
        session.tenant.id,
        currentPassword,
        newPassword,
        {
          contactName,
          contactPhone
        }
      );

      if (res.success && res.session) {
        toast.success('Đổi mật khẩu tài khoản thành công!');
        onSuccess(res.session);
      } else {
        setErrorMessage(res.error || 'Đổi mật khẩu thất bại');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi trong quá trình cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupModal
      open={open}
      icon="key"
      title={isFirstLogin ? 'Yêu Cầu Đổi Mật Khẩu Lần Đầu' : 'Cập Nhật Mật Khẩu & Hồ Sơ'}
      description={
        isFirstLogin
          ? 'Tài khoản của đơn vị đang dùng mật khẩu mặc định của Finviet. Để bảo vệ dữ liệu điểm danh cơ quan, vui lòng thiết lập mật khẩu mới.'
          : 'Cập nhật mật khẩu bảo mật và thông tin liên hệ của đơn vị'
      }
      width={520}
      onClose={onClose}
      primaryAction={{
        label: loading ? 'Đang cập nhật...' : 'Lưu mật khẩu & Tiếp tục',
        onClick: handleSubmit,
        disabled: loading || !isFormValid,
        icon: 'circle-check'
      }}
      secondaryAction={{
        label: isFirstLogin ? 'Bỏ qua lần này' : 'Đóng',
        onClick: onClose
      }}
    >
      {errorMessage && (
        <InlineNotice tone="danger" style={{ marginBottom: '12px' }}>
          {errorMessage}
        </InlineNotice>
      )}

      {isFirstLogin && (
        <InlineNotice tone="warning">
          <strong>Lưu ý bảo mật:</strong> Mật khẩu mới sẽ được mã hóa an toàn và áp dụng ngay lập tức cho các lần đăng nhập tiếp theo.
        </InlineNotice>
      )}

      <PopupModal.Section label="MẬT KHẨU MỚI BẢO MẬT">
        <PasswordField
          id="modal-current-password"
          label="Mật khẩu hiện tại (hoặc mật khẩu mặc định Finviet cấp)"
          required
          value={currentPassword}
          onChange={(val) => {
            setCurrentPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={loading}
          placeholder="Nhập mật khẩu hiện tại"
        />

        <PasswordField
          id="modal-new-password"
          label="Mật khẩu mới bảo mật"
          required
          value={newPassword}
          onChange={(val) => {
            setNewPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={loading}
          placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, thường và số"
        />

        <PasswordField
          id="modal-confirm-password"
          label="Nhập lại mật khẩu mới"
          required
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={loading}
          placeholder="Nhập lại mật khẩu mới"
        />

        {/* Tiêu chí mật khẩu */}
        <div style={styles.checklist}>
          <div style={styles.checkItem}>
            <Icon
              name={rules.length ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.length ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.length ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Tối thiểu 8 ký tự
            </span>
          </div>

          <div style={styles.checkItem}>
            <Icon
              name={rules.hasUpper ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.hasUpper ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.hasUpper ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Có ít nhất 1 chữ in hoa (A-Z)
            </span>
          </div>

          <div style={styles.checkItem}>
            <Icon
              name={rules.hasLower ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.hasLower ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.hasLower ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Có ít nhất 1 chữ in thường (a-z)
            </span>
          </div>

          <div style={styles.checkItem}>
            <Icon
              name={rules.hasNumber ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.hasNumber ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.hasNumber ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Có ít nhất 1 chữ số (0-9)
            </span>
          </div>

          <div style={styles.checkItem}>
            <Icon
              name={rules.notOld ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.notOld ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.notOld ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Không trùng với mật khẩu cũ
            </span>
          </div>

          <div style={styles.checkItem}>
            <Icon
              name={rules.matches ? 'circle-check' : 'circle-dot'}
              size={12}
              color={rules.matches ? 'var(--semantic-success)' : 'var(--text-subtle)'}
            />
            <span
              className="body-xs"
              style={{
                color: rules.matches ? 'var(--semantic-success-strong)' : 'var(--text-subtle)'
              }}
            >
              Khớp mật khẩu xác nhận
            </span>
          </div>
        </div>
      </PopupModal.Section>

      <PopupModal.Section label="THÔNG TIN LIÊN HỆ ĐƠN VỊ">
        <TextField
          id="modal-contact-name"
          label="Người phụ trách điểm danh / đại diện đơn vị"
          prefixIcon="user"
          value={contactName}
          onChange={(val) => setContactName(val)}
          placeholder="Ví dụ: Đ/c Nguyễn Văn An"
          disabled={loading}
        />

        <TextField
          id="modal-contact-phone"
          label="Số điện thoại / Hotline hỗ trợ đơn vị"
          prefixIcon="phone"
          value={contactPhone}
          onChange={(val) => setContactPhone(val)}
          placeholder="Ví dụ: 028 3829 1234"
          disabled={loading}
        />
      </PopupModal.Section>
    </PopupModal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  checklist: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px 12px',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-canvas)',
    borderRadius: 'var(--radius-8)',
    border: '1px solid var(--border-default)',
    marginTop: '6px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};
