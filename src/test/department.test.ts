import { describe, it, expect, beforeEach } from 'vitest';
import { departmentService } from '../services/department';
import { authService, TenantIsolationError } from '../services/auth';

describe('Quản lý Cơ Cấu Tổ Chức & Phòng Ban (ORG-01: Department Hierarchy)', () => {
  const ubndTenantId = 'tenant-ubnd-001';
  const hospitalTenantId = 'tenant-hospital-003';

  beforeEach(async () => {
    departmentService.resetMockData();
    authService.resetMockData();
    // Đăng nhập làm UBND Bến Nghé
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Lấy danh sách phòng ban trực thuộc đúng cơ quan đơn vị đang đăng nhập', async () => {
    const list = await departmentService.getDepartmentsByTenant(ubndTenantId);
    expect(list.length).toBeGreaterThanOrEqual(5);

    const codes = list.map((d) => d.code);
    expect(codes).toContain('VP-UBND');
    expect(codes).toContain('DC-XD');
    expect(codes).toContain('TP-HT');
  });

  it('Dựng cây phân cấp phòng ban cha - con chính xác', async () => {
    const tree = await departmentService.getDepartmentTree(ubndTenantId);

    // Tìm Văn phòng HĐND & UBND (root)
    const vpNode = tree.find((node) => node.code === 'VP-UBND');
    expect(vpNode).toBeDefined();
    expect(vpNode?.level).toBe(0);

    // Văn phòng có 2 bộ phận con: Địa chính - Xây dựng và Tư pháp - Hộ tịch
    const childCodes = vpNode?.children.map((c) => c.code);
    expect(childCodes).toContain('DC-XD');
    expect(childCodes).toContain('TP-HT');
    expect(vpNode?.children[0].level).toBe(1);
  });

  it('Tạo phòng ban mới thành công với mã định danh duy nhất và người phụ trách', async () => {
    const newDept = await departmentService.createDepartment(ubndTenantId, {
      code: 'KT-XH',
      name: 'Ban Kinh Tế - Xã Hội',
      managerName: 'Bà Nguyễn Thị Lan',
      managerPhone: '0909 999 111'
    });

    expect(newDept.id).toBeDefined();
    expect(newDept.code).toBe('KT-XH');
    expect(newDept.name).toBe('Ban Kinh Tế - Xã Hội');
    expect(newDept.tenantId).toBe(ubndTenantId);
    expect(newDept.managerName).toBe('Bà Nguyễn Thị Lan');

    const updatedList = await departmentService.getDepartmentsByTenant(ubndTenantId);
    expect(updatedList.some((d) => d.code === 'KT-XH')).toBe(true);
  });

  it('Từ chối tạo phòng ban có mã định danh đã tồn tại trong cùng cơ quan', async () => {
    await expect(
      departmentService.createDepartment(ubndTenantId, {
        code: 'VP-UBND', // Đã tồn tại
        name: 'Văn phòng trùng lặp'
      })
    ).rejects.toThrow(/đã tồn tại/i);
  });

  it('Từ chối gắn phòng ban cha không tồn tại', async () => {
    await expect(
      departmentService.createDepartment(ubndTenantId, {
        code: 'TEST-CHILD',
        name: 'Phòng ban thử nghiệm',
        parentId: 'id-khong-ton-tai'
      })
    ).rejects.toThrow(/không tồn tại/i);
  });

  it('Cập nhật thông tin phòng ban và kiểm soát ngăn chặn vòng lặp cha - con', async () => {
    const list = await departmentService.getDepartmentsByTenant(ubndTenantId);
    const vpDept = list.find((d) => d.code === 'VP-UBND')!;
    const dcDept = list.find((d) => d.code === 'DC-XD')!; // DC-XD là con của VP-UBND

    // Cập nhật tên và người phụ trách
    const updated = await departmentService.updateDepartment(ubndTenantId, dcDept.id, {
      name: 'Bộ phận Địa chính - Quy hoạch Đô thị mới',
      managerName: 'Bà Phạm Thị Cúc (Đã thăng chức)'
    });
    expect(updated.name).toBe('Bộ phận Địa chính - Quy hoạch Đô thị mới');
    expect(updated.managerName).toBe('Bà Phạm Thị Cúc (Đã thăng chức)');

    // Ngăn chặn: Không thể đặt chính mình làm cha
    await expect(
      departmentService.updateDepartment(ubndTenantId, vpDept.id, {
        parentId: vpDept.id
      })
    ).rejects.toThrow(/chính nó/i);

    // Ngăn chặn: Không thể chuyển phòng ban cha trực thuộc một phòng ban con của chính nó (vòng lặp)
    await expect(
      departmentService.updateDepartment(ubndTenantId, vpDept.id, {
        parentId: dcDept.id
      })
    ).rejects.toThrow(/vòng lặp|phòng ban con/i);
  });

  it('Xóa phòng ban và kế thừa lại cấp bậc cho phòng ban con', async () => {
    const list = await departmentService.getDepartmentsByTenant(ubndTenantId);
    const vpDept = list.find((d) => d.code === 'VP-UBND')!;

    // Xóa VP-UBND
    await departmentService.deleteDepartment(ubndTenantId, vpDept.id);

    const afterList = await departmentService.getDepartmentsByTenant(ubndTenantId);
    expect(afterList.some((d) => d.id === vpDept.id)).toBe(false);

    // Các con trước đó (DC-XD, TP-HT) có parentId chuyển về null (cấp cao nhất)
    const dcDept = afterList.find((d) => d.code === 'DC-XD');
    expect(dcDept?.parentId).toBeNull();
  });

  it('Bảo đảm tính cô lập dữ liệu đa cơ quan (Multi-tenancy Isolation)', async () => {
    // Đang đăng nhập là UBND Bến Nghé (tenant-ubnd-001)
    // Cố tình truy vấn phòng ban của Bệnh viện Nhi Đồng 1 (tenant-hospital-003) -> Bị chặn
    await expect(
      departmentService.getDepartmentsByTenant(hospitalTenantId)
    ).rejects.toThrow(TenantIsolationError);

    // Cố tình tạo phòng ban cho đơn vị khác -> Bị chặn
    await expect(
      departmentService.createDepartment(hospitalTenantId, {
        code: 'HACK',
        name: 'Phòng hack'
      })
    ).rejects.toThrow(TenantIsolationError);
  });
});
