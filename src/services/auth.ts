import {
  TenantAccount,
  AuthSession,
  LoginCredentials,
  AuthResult
} from '../types/auth';

const STORAGE_SESSION_KEY = 'finviet_attendance_session';
const STORAGE_TENANTS_KEY = 'finviet_attendance_tenants';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 phút
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 tiếng

// Danh sách tài khoản đơn vị mẫu do Finviet cấp phát
export const INITIAL_TENANTS: TenantAccount[] = [
  {
    id: 'tenant-ubnd-001',
    username: 'ubnd-ben-nghe',
    passwordHash: hashPassword('Finviet@2026'),
    orgName: 'Ủy Ban Nhân Dân Phường Bến Nghé',
    orgType: 'government',
    isDefaultPassword: true,
    status: 'active',
    failedAttempts: 0,
    lockedUntil: null,
    contactName: 'Đ/c Nguyễn Văn An',
    contactPhone: '028 3829 1234',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'tenant-factory-002',
    username: 'tanbinh-factory',
    passwordHash: hashPassword('Finviet@2026'),
    orgName: 'Công Ty May & Sản Xuất Tân Bình',
    orgType: 'enterprise',
    isDefaultPassword: true,
    status: 'active',
    failedAttempts: 0,
    lockedUntil: null,
    contactName: 'Bà Trần Thị Mai',
    contactPhone: '028 3844 5678',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'tenant-hospital-003',
    username: 'bv-nhidong-1',
    passwordHash: hashPassword('Finviet@2026'),
    orgName: 'Bệnh Viện Nhi Đồng 1',
    orgType: 'hospital',
    isDefaultPassword: true,
    status: 'active',
    failedAttempts: 0,
    lockedUntil: null,
    contactName: 'BS. Lê Hoàng Nam',
    contactPhone: '028 3927 1119',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  }
];

export function hashPassword(plainText: string): string {
  // Simple deterministic hash representation for standard test/client auth
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export class TenantIsolationError extends Error {
  constructor(message: string = 'Truy cập bị từ chối: Dữ liệu thuộc về cơ quan đơn vị khác') {
    super(message);
    this.name = 'TenantIsolationError';
  }
}

class AuthService {
  private memorySession: AuthSession | null = null;
  private memoryTenants: Map<string, TenantAccount> = new Map();

  constructor() {
    this.initStorage();
  }

  private hasLocalStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private initStorage(): void {
    if (this.hasLocalStorage()) {
      const storedTenants = localStorage.getItem(STORAGE_TENANTS_KEY);
      if (!storedTenants) {
        localStorage.setItem(STORAGE_TENANTS_KEY, JSON.stringify(INITIAL_TENANTS));
      }
    } else {
      INITIAL_TENANTS.forEach((t) => this.memoryTenants.set(t.id, { ...t }));
    }
  }

  public getTenants(): TenantAccount[] {
    if (this.hasLocalStorage()) {
      const data = localStorage.getItem(STORAGE_TENANTS_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return INITIAL_TENANTS;
        }
      }
      return INITIAL_TENANTS;
    }
    return Array.from(this.memoryTenants.values());
  }

  private saveTenants(tenants: TenantAccount[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_TENANTS_KEY, JSON.stringify(tenants));
    } else {
      this.memoryTenants.clear();
      tenants.forEach((t) => this.memoryTenants.set(t.id, t));
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    const trimmedUsername = credentials.username.trim().toLowerCase();
    const tenants = this.getTenants();
    const tenantIndex = tenants.findIndex(
      (t) => t.username.toLowerCase() === trimmedUsername
    );

    if (tenantIndex === -1) {
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mã đơn vị không tồn tại trong hệ thống'
      };
    }

    const tenant = tenants[tenantIndex];
    const now = Date.now();

    // 1. Kiểm tra trạng thái khóa tài khoản do nhập sai > 5 lần
    if (tenant.lockedUntil) {
      const lockEnd = new Date(tenant.lockedUntil).getTime();
      if (now < lockEnd) {
        const remainingMinutes = Math.ceil((lockEnd - now) / 60000);
        return {
          success: false,
          isLocked: true,
          lockRemainingMinutes: remainingMinutes,
          error: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút.`
        };
      } else {
        // Hết thời gian khóa, tự động mở lại
        tenant.status = 'active';
        tenant.failedAttempts = 0;
        tenant.lockedUntil = null;
      }
    }

    // 2. Xác thực mật khẩu
    const inputHash = hashPassword(credentials.password);
    const isPasswordValid = tenant.passwordHash === inputHash;

    if (!isPasswordValid) {
      tenant.failedAttempts += 1;
      let errorMsg = `Mật khẩu không chính xác.`;

      if (tenant.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntilDate = new Date(now + LOCKOUT_DURATION_MS).toISOString();
        tenant.status = 'locked';
        tenant.lockedUntil = lockedUntilDate;
        tenants[tenantIndex] = tenant;
        this.saveTenants(tenants);

        return {
          success: false,
          isLocked: true,
          lockRemainingMinutes: 15,
          error:
            'Tài khoản tạm thời bị khóa 15 phút do nhập sai mật khẩu 5 lần liên tiếp. Vui lòng liên hệ Finviet hoặc thử lại sau.'
        };
      } else {
        const remainingAttempts = MAX_FAILED_ATTEMPTS - tenant.failedAttempts;
        errorMsg += ` Bạn còn ${remainingAttempts} lần thử trước khi tài khoản bị khóa tạm thời.`;
        tenants[tenantIndex] = tenant;
        this.saveTenants(tenants);

        return {
          success: false,
          error: errorMsg
        };
      }
    }

    // 3. Đăng nhập thành công -> Reset số lần sai
    tenant.failedAttempts = 0;
    tenant.lockedUntil = null;
    tenant.status = 'active';
    tenants[tenantIndex] = tenant;
    this.saveTenants(tenants);

    // 4. Cấp token phiên làm việc gắn với đơn vị (Multi-tenancy isolation)
    const token = `fv_att_${tenant.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(now + SESSION_EXPIRY_MS).toISOString();

    const session: AuthSession = {
      token,
      tenant: {
        id: tenant.id,
        username: tenant.username,
        orgName: tenant.orgName,
        orgType: tenant.orgType,
        isDefaultPassword: tenant.isDefaultPassword,
        contactName: tenant.contactName,
        contactPhone: tenant.contactPhone
      },
      expiresAt
    };

    this.saveSession(session);

    return {
      success: true,
      session,
      requirePasswordChange: tenant.isDefaultPassword
    };
  }

  public saveSession(session: AuthSession): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } else {
      this.memorySession = session;
    }
  }

  public getCurrentSession(): AuthSession | null {
    let session: AuthSession | null = null;
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (raw) {
        try {
          session = JSON.parse(raw);
        } catch {
          session = null;
        }
      }
    } else {
      session = this.memorySession;
    }

    if (!session) return null;

    // Kiểm tra hết hạn phiên
    const expiresAtTime = new Date(session.expiresAt).getTime();
    if (Date.now() > expiresAtTime) {
      this.logout();
      return null;
    }

    return session;
  }

  public logout(): void {
    if (this.hasLocalStorage()) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
    this.memorySession = null;
  }

  /**
   * Đổi mật khẩu tài khoản đơn vị (AUTH-02: Đổi mật khẩu lần đầu hoặc định kỳ)
   */
  public async changePassword(
    tenantId: string,
    currentPassword: string,
    newPassword: string,
    profile?: { contactName?: string; contactPhone?: string }
  ): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
    const tenants = this.getTenants();
    const tenantIndex = tenants.findIndex((t) => t.id === tenantId);

    if (tenantIndex === -1) {
      return { success: false, error: 'Không tìm thấy tài khoản đơn vị trong hệ thống' };
    }

    const tenant = tenants[tenantIndex];

    // 1. Xác thực mật khẩu hiện tại
    if (tenant.passwordHash !== hashPassword(currentPassword)) {
      return { success: false, error: 'Mật khẩu hiện tại không chính xác' };
    }

    // 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
    if (currentPassword === newPassword) {
      return {
        success: false,
        error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại hoặc mật khẩu mặc định'
      };
    }

    // 3. Kiểm tra độ phức tạp mật khẩu: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số
    if (newPassword.length < 8) {
      return { success: false, error: 'Mật khẩu mới bắt buộc phải có tối thiểu 8 ký tự' };
    }

    if (!/[A-Z]/.test(newPassword)) {
      return { success: false, error: 'Mật khẩu mới phải chứa ít nhất 1 chữ in hoa (A-Z)' };
    }

    if (!/[a-z]/.test(newPassword)) {
      return { success: false, error: 'Mật khẩu mới phải chứa ít nhất 1 chữ in thường (a-z)' };
    }

    if (!/[0-9]/.test(newPassword)) {
      return { success: false, error: 'Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9)' };
    }

    // 4. Cập nhật mật khẩu mới và gỡ bỏ cờ mật khẩu mặc định
    tenant.passwordHash = hashPassword(newPassword);
    tenant.isDefaultPassword = false;
    tenant.updatedAt = new Date().toISOString();

    // 5. Cập nhật thông tin người đại diện và hotline nếu có
    if (profile?.contactName !== undefined) {
      tenant.contactName = profile.contactName.trim();
    }
    if (profile?.contactPhone !== undefined) {
      tenant.contactPhone = profile.contactPhone.trim();
    }

    tenants[tenantIndex] = tenant;
    this.saveTenants(tenants);

    // 6. Cập nhật phiên làm việc hiện tại
    const currentSession = this.getCurrentSession();
    let updatedSession: AuthSession;

    if (currentSession && currentSession.tenant.id === tenantId) {
      updatedSession = {
        ...currentSession,
        tenant: {
          ...currentSession.tenant,
          isDefaultPassword: false,
          contactName: tenant.contactName,
          contactPhone: tenant.contactPhone
        }
      };
      this.saveSession(updatedSession);
    } else {
      const now = Date.now();
      const token = `fv_att_${tenant.id}_${now}_${Math.random().toString(36).substring(2, 10)}`;
      updatedSession = {
        token,
        tenant: {
          id: tenant.id,
          username: tenant.username,
          orgName: tenant.orgName,
          orgType: tenant.orgType,
          isDefaultPassword: false,
          contactName: tenant.contactName,
          contactPhone: tenant.contactPhone
        },
        expiresAt: new Date(now + SESSION_EXPIRY_MS).toISOString()
      };
      this.saveSession(updatedSession);
    }

    return {
      success: true,
      session: updatedSession
    };
  }

  /**
   * Cập nhật thông tin người phụ trách & hotline hỗ trợ của đơn vị (AUTH-02)
   */
  public async updateTenantProfile(
    tenantId: string,
    profile: { contactName?: string; contactPhone?: string }
  ): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
    const tenants = this.getTenants();
    const tenantIndex = tenants.findIndex((t) => t.id === tenantId);

    if (tenantIndex === -1) {
      return { success: false, error: 'Không tìm thấy tài khoản đơn vị' };
    }

    const tenant = tenants[tenantIndex];
    if (profile.contactName !== undefined) {
      tenant.contactName = profile.contactName.trim();
    }
    if (profile.contactPhone !== undefined) {
      tenant.contactPhone = profile.contactPhone.trim();
    }
    tenant.updatedAt = new Date().toISOString();

    tenants[tenantIndex] = tenant;
    this.saveTenants(tenants);

    const currentSession = this.getCurrentSession();
    let updatedSession: AuthSession | undefined;

    if (currentSession && currentSession.tenant.id === tenantId) {
      updatedSession = {
        ...currentSession,
        tenant: {
          ...currentSession.tenant,
          contactName: tenant.contactName,
          contactPhone: tenant.contactPhone
        }
      };
      this.saveSession(updatedSession);
    }

    return { success: true, session: updatedSession };
  }

  /**
   * Đảm bảo nguyên tắc cô lập dữ liệu đa cơ quan (Multi-tenancy isolation).
   * Bất kỳ thao tác đọc hoặc ghi dữ liệu nào đều phải thuộc phạm vi của đơn vị hiện tại.
   */
  public assertTenantAccess(resourceTenantId: string): void {
    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      throw new TenantIsolationError('Yêu cầu đăng nhập trước khi thao tác dữ liệu');
    }
    if (currentSession.tenant.id !== resourceTenantId) {
      throw new TenantIsolationError(
        `Từ chối truy cập: Đơn vị [${currentSession.tenant.orgName}] không có quyền xem dữ liệu của đơn vị khác`
      );
    }
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_TENANTS_KEY, JSON.stringify(INITIAL_TENANTS));
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
    this.memorySession = null;
    this.memoryTenants.clear();
    INITIAL_TENANTS.forEach((t) => this.memoryTenants.set(t.id, { ...t }));
  }
}

export const authService = new AuthService();
