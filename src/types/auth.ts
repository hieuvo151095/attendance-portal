export type OrganizationType = 'government' | 'enterprise' | 'hospital';

export interface TenantAccount {
  id: string;
  username: string; // Mã đơn vị hoặc tên đăng nhập Finviet cấp
  passwordHash: string; // Mật khẩu mã hóa
  orgName: string; // Tên cơ quan đơn vị
  orgType: OrganizationType; // Loại hình đơn vị
  isDefaultPassword: boolean; // Cờ kiểm tra mật khẩu mặc định (yêu cầu đổi mật khẩu cho AUTH-02)
  status: 'active' | 'locked';
  failedAttempts: number;
  lockedUntil?: string | null; // ISO timestamp
  contactName?: string;
  contactPhone?: string;
  address?: string; // Địa chỉ trụ sở cơ quan đơn vị
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  tenant: {
    id: string;
    username: string;
    orgName: string;
    orgType: OrganizationType;
    isDefaultPassword: boolean;
    contactName?: string;
    contactPhone?: string;
    address?: string; // Địa chỉ trụ sở cơ quan đơn vị
  };
  expiresAt: string; // ISO timestamp
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  isLocked?: boolean;
  lockRemainingMinutes?: number;
  requirePasswordChange?: boolean;
}
