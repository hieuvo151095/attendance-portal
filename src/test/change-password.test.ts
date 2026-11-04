import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/auth';

describe('Đổi mật khẩu lần đầu & Hồ sơ đơn vị (AUTH-02: Password Change & Tenant Profile)', () => {
  beforeEach(() => {
    authService.resetMockData();
  });

  it('Từ chối đổi mật khẩu khi nhập sai mật khẩu hiện tại', async () => {
    const loginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    expect(loginRes.success).toBe(true);

    const changeRes = await authService.changePassword(
      loginRes.session!.tenant.id,
      'SaiMatKhauHienTai',
      'MatKhauMoi@2026'
    );

    expect(changeRes.success).toBe(false);
    expect(changeRes.error).toContain('Mật khẩu hiện tại không chính xác');
  });

  it('Từ chối đổi mật khẩu khi mật khẩu mới trùng mật khẩu cũ', async () => {
    const loginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });

    const changeRes = await authService.changePassword(
      loginRes.session!.tenant.id,
      'Finviet@2026',
      'Finviet@2026'
    );

    expect(changeRes.success).toBe(false);
    expect(changeRes.error).toContain('không được trùng');
  });

  it('Kiểm tra quy tắc độ phức tạp mật khẩu: tối thiểu 8 ký tự, chữ hoa, chữ thường và số', async () => {
    const loginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    const tenantId = loginRes.session!.tenant.id;

    // Quá ngắn (< 8 ký tự)
    const shortRes = await authService.changePassword(tenantId, 'Finviet@2026', 'Abc12');
    expect(shortRes.success).toBe(false);
    expect(shortRes.error).toContain('tối thiểu 8 ký tự');

    // Thiếu chữ in hoa
    const noUpperRes = await authService.changePassword(tenantId, 'Finviet@2026', 'matkhaumoi123');
    expect(noUpperRes.success).toBe(false);
    expect(noUpperRes.error).toContain('chữ in hoa');

    // Thiếu chữ in thường
    const noLowerRes = await authService.changePassword(tenantId, 'Finviet@2026', 'MATKHAUMOI123');
    expect(noLowerRes.success).toBe(false);
    expect(noLowerRes.error).toContain('chữ in thường');

    // Thiếu số
    const noDigitRes = await authService.changePassword(tenantId, 'Finviet@2026', 'MatKhauMoiKhongSo');
    expect(noDigitRes.success).toBe(false);
    expect(noDigitRes.error).toContain('chữ số');
  });

  it('Đổi mật khẩu thành công: Cập nhật hash, tắt cờ isDefaultPassword và cho phép đăng nhập bằng mật khẩu mới', async () => {
    const loginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    const tenantId = loginRes.session!.tenant.id;
    expect(loginRes.session?.tenant.isDefaultPassword).toBe(true);

    const changeRes = await authService.changePassword(
      tenantId,
      'Finviet@2026',
      'UBND@BenNghe2026',
      {
        contactName: 'Đ/c Trần Văn Trực',
        contactPhone: '0903 123 456'
      }
    );

    expect(changeRes.success).toBe(true);
    expect(changeRes.session?.tenant.isDefaultPassword).toBe(false);
    expect(changeRes.session?.tenant.contactName).toBe('Đ/c Trần Văn Trực');
    expect(changeRes.session?.tenant.contactPhone).toBe('0903 123 456');

    // Đăng xuất và đăng nhập lại bằng mật khẩu cũ -> Thất bại
    authService.logout();
    const oldLoginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    expect(oldLoginRes.success).toBe(false);

    // Đăng nhập bằng mật khẩu mới -> Thành công
    const newLoginRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'UBND@BenNghe2026'
    });
    expect(newLoginRes.success).toBe(true);
    expect(newLoginRes.session?.tenant.isDefaultPassword).toBe(false);
    expect(newLoginRes.requirePasswordChange).toBe(false);
  });

  it('Cập nhật thông tin người đại diện và hotline hỗ trợ của đơn vị', async () => {
    const loginRes = await authService.login({
      username: 'tanbinh-factory',
      password: 'Finviet@2026'
    });
    const tenantId = loginRes.session!.tenant.id;

    const updateRes = await authService.updateTenantProfile(tenantId, {
      contactName: 'Kỹ sư Vũ Minh Tâm',
      contactPhone: '0918 888 999'
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.session?.tenant.contactName).toBe('Kỹ sư Vũ Minh Tâm');
    expect(updateRes.session?.tenant.contactPhone).toBe('0918 888 999');
  });
});
