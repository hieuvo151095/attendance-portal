import { describe, it, expect, beforeEach } from 'vitest';
import { authService, TenantIsolationError } from '../services/auth';

describe('Dịch vụ Xác thực & Đa đơn vị (AUTH-01: Multi-tenancy Auth)', () => {
  beforeEach(() => {
    authService.resetMockData();
  });

  it('Cho phép đăng nhập thành công với tài khoản Finviet cấp cho cơ quan nhà nước (UBND)', async () => {
    const result = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session?.tenant.orgName).toBe('Ủy Ban Nhân Dân Phường Bến Nghé');
    expect(result.session?.tenant.orgType).toBe('government');
    expect(result.session?.tenant.address).toBe('29 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
    expect(result.session?.tenant.isDefaultPassword).toBe(true);
    expect(result.session?.token).toContain('fv_att_tenant-ubnd-001');
  });

  it('Cho phép đăng nhập thành công với tài khoản Doanh nghiệp / Nhà máy', async () => {
    const result = await authService.login({
      username: 'tanbinh-factory',
      password: 'Finviet@2026'
    });

    expect(result.success).toBe(true);
    expect(result.session?.tenant.orgType).toBe('enterprise');
    expect(result.session?.tenant.orgName).toBe('Công Ty May & Sản Xuất Tân Bình');
    expect(result.session?.tenant.address).toBe('Lô B2-3, Đường CN13, KCN Tân Bình, Phường Tây Thạnh, Quận Tân Phú, TP. Hồ Chí Minh');
  });

  it('Cho phép đăng nhập thành công với tài khoản Bệnh viện', async () => {
    const result = await authService.login({
      username: 'bv-nhidong-1',
      password: 'Finviet@2026'
    });

    expect(result.success).toBe(true);
    expect(result.session?.tenant.orgType).toBe('hospital');
    expect(result.session?.tenant.orgName).toBe('Bệnh Viện Nhi Đồng 1');
    expect(result.session?.tenant.address).toBe('341 Sư Vạn Hạnh, Phường 10, Quận 10, TP. Hồ Chí Minh');
  });

  it('Báo lỗi rõ ràng khi tên đăng nhập hoặc mã đơn vị không tồn tại', async () => {
    const result = await authService.login({
      username: 'khong-ton-tai',
      password: 'Finviet@2026'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('không tồn tại');
  });

  it('Báo lỗi và đếm số lần sai khi nhập sai mật khẩu', async () => {
    const result = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'MatKhauSai@123'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mật khẩu không chính xác');
    expect(result.error).toContain('còn 4 lần thử');
  });

  it('Khóa tài khoản tạm thời 15 phút khi nhập sai mật khẩu 5 lần liên tiếp', async () => {
    // 4 lần đầu
    for (let i = 0; i < 4; i++) {
      const res = await authService.login({
        username: 'ubnd-ben-nghe',
        password: 'SaiMatKhau'
      });
      expect(res.success).toBe(false);
      expect(res.isLocked).toBeFalsy();
    }

    // Lần thứ 5 -> Khóa 15 phút
    const finalRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'SaiMatKhau'
    });

    expect(finalRes.success).toBe(false);
    expect(finalRes.isLocked).toBe(true);
    expect(finalRes.lockRemainingMinutes).toBe(15);
    expect(finalRes.error).toContain('bị khóa 15 phút');

    // Thử lại ngay cả khi nhập đúng mật khẩu lúc đang bị khóa
    const retryRes = await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    expect(retryRes.success).toBe(false);
    expect(retryRes.isLocked).toBe(true);
  });

  it('Thực thi nguyên tắc cô lập dữ liệu đa cơ quan (Multi-tenancy isolation boundary)', async () => {
    // Đăng nhập với tư cách UBND Bến Nghé (tenant-ubnd-001)
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });

    // Thao tác với tài nguyên thuộc chính đơn vị mình: Thành công
    expect(() => {
      authService.assertTenantAccess('tenant-ubnd-001');
    }).not.toThrow();

    // Thao tác với tài nguyên thuộc đơn vị khác (Bệnh viện Nhi Đồng 1: tenant-hospital-003): Bị chặn tuyệt đối
    expect(() => {
      authService.assertTenantAccess('tenant-hospital-003');
    }).toThrow(TenantIsolationError);
  });

  it('Đăng xuất thành công xoá phiên làm việc và từ chối truy cập dữ liệu', async () => {
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });

    expect(authService.getCurrentSession()).not.toBeNull();

    authService.logout();

    expect(authService.getCurrentSession()).toBeNull();
    expect(() => {
      authService.assertTenantAccess('tenant-ubnd-001');
    }).toThrow(TenantIsolationError);
  });
});
