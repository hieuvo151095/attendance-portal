import { describe, it, expect, beforeEach } from 'vitest';
import { employeeService } from '../services/employee';
import { authService } from '../services/auth';
import { CreateEmployeeDTO, ImportEmployeeRow } from '../types/employee';

describe('Dịch Vụ Quản Lý Nhân Sự (ORG-02: Employee Service)', () => {
  const ubndTenant = 'tenant-ubnd-001';
  const factoryTenant = 'tenant-factory-002';

  beforeEach(async () => {
    authService.resetMockData();
    // Authenticate as UBND
    await authService.login({ username: 'ubnd-ben-nghe', password: 'Finviet@2026' });
    employeeService.resetMockData();
  });

  it('Lấy danh sách nhân sự thuộc đơn vị được phân quyền (cách ly đa đơn vị multi-tenancy)', async () => {
    const list = await employeeService.getEmployeesByTenant(ubndTenant);
    expect(list.length).toBeGreaterThan(0);
    // All items must belong to ubndTenant
    list.forEach((e) => {
      expect(e.tenantId).toBe(ubndTenant);
    });

    // Cannot access factoryTenant without logging in as factory
    await expect(employeeService.getEmployeesByTenant(factoryTenant)).rejects.toThrow(
      /không có quyền/i
    );
  });

  it('Hỗ trợ tìm kiếm nhân viên theo họ tên, mã NV, CCCD hoặc chức vụ', async () => {
    const searchByCode = await employeeService.getEmployeesByTenant(ubndTenant, {
      search: 'UBND-001'
    });
    expect(searchByCode.length).toBe(1);
    expect(searchByCode[0].fullName).toContain('Nguyễn Văn An');

    const searchByName = await employeeService.getEmployeesByTenant(ubndTenant, {
      search: 'Phạm Thị Cúc'
    });
    expect(searchByName.length).toBe(1);
    expect(searchByName[0].employeeCode).toBe('UBND-002');

    const searchByCCCD = await employeeService.getEmployeesByTenant(ubndTenant, {
      search: '079085001234'
    });
    expect(searchByCCCD.length).toBe(1);
  });

  it('Lọc nhân viên theo trạng thái Face ID (Đã lấy mẫu vs Chờ thiết lập tại Camera)', async () => {
    const enrolledList = await employeeService.getEmployeesByTenant(ubndTenant, {
      faceIdStatus: 'enrolled'
    });
    expect(enrolledList.length).toBeGreaterThanOrEqual(1);
    enrolledList.forEach((e) => expect(e.faceIdStatus).toBe('enrolled'));

    const pendingList = await employeeService.getEmployeesByTenant(ubndTenant, {
      faceIdStatus: 'pending'
    });
    expect(pendingList.length).toBeGreaterThanOrEqual(1);
    pendingList.forEach((e) => expect(e.faceIdStatus).toBe('pending'));
  });

  it('Thêm mới nhân sự với đầy đủ mã nhân viên duy nhất, CCCD, chức danh, phòng ban', async () => {
    const dto: CreateEmployeeDTO = {
      employeeCode: 'UBND-NEW-99',
      fullName: 'Trương Gia Bình',
      identityNumber: '079088899999',
      position: 'Chuyên viên Văn phòng',
      departmentId: 'dept-ubnd-01',
      email: 'binh.truong@ubnd.gov.vn',
      phoneNumber: '0903 888 999',
      gender: 'male'
    };

    const created = await employeeService.createEmployee(ubndTenant, dto);
    expect(created.id).toBeDefined();
    expect(created.employeeCode).toBe('UBND-NEW-99');
    expect(created.fullName).toBe('Trương Gia Bình');
    expect(created.identityNumber).toBe('079088899999');
    expect(created.faceIdStatus).toBe('pending'); // Chờ đồng bộ camera

    const found = await employeeService.getEmployeeById(ubndTenant, created.id);
    expect(found.employeeCode).toBe('UBND-NEW-99');
  });

  it('Từ chối thêm nhân viên khi trùng mã nhân viên trong cùng đơn vị', async () => {
    const dto: CreateEmployeeDTO = {
      employeeCode: 'UBND-001', // Đã tồn tại
      fullName: 'Người Trùng Mã',
      identityNumber: '079099999999',
      position: 'Cán bộ',
      departmentId: 'dept-ubnd-01'
    };

    await expect(employeeService.createEmployee(ubndTenant, dto)).rejects.toThrow(
      /Mã nhân viên "UBND-001" đã tồn tại/i
    );
  });

  it('Từ chối thêm nhân viên khi trùng số CCCD/Hộ chiếu trong cùng đơn vị', async () => {
    const dto: CreateEmployeeDTO = {
      employeeCode: 'UBND-UNIQUE-01',
      fullName: 'Người Trùng CCCD',
      identityNumber: '079085001234', // Trùng CCCD của Nguyễn Văn An
      position: 'Cán bộ',
      departmentId: 'dept-ubnd-01'
    };

    await expect(employeeService.createEmployee(ubndTenant, dto)).rejects.toThrow(
      /Số CCCD "079085001234" đã được sử dụng/i
    );
  });

  it('Từ chối khi thiếu các trường thông tin bắt buộc hoặc phòng ban không hợp lệ', async () => {
    // Thiếu mã NV
    await expect(
      employeeService.createEmployee(ubndTenant, {
        employeeCode: '',
        fullName: 'Test',
        identityNumber: '123',
        position: 'Test',
        departmentId: 'dept-ubnd-01'
      })
    ).rejects.toThrow(/Mã nhân viên \(Employee ID\) không được để trống/i);

    // Phòng ban không tồn tại trong tenant
    await expect(
      employeeService.createEmployee(ubndTenant, {
        employeeCode: 'UBND-TEST',
        fullName: 'Test',
        identityNumber: '123456789012',
        position: 'Test',
        departmentId: 'dept-invalid-999'
      })
    ).rejects.toThrow(/Phòng ban được chọn không thuộc cơ quan đơn vị này/i);
  });

  it('Đồng bộ dữ liệu khuôn mặt và ảnh chân dung từ Camera AI Hikvision (Camera Face ID sync)', async () => {
    // Tìm nhân viên chưa có Face ID
    const pendingList = await employeeService.getEmployeesByTenant(ubndTenant, {
      faceIdStatus: 'pending'
    });
    const targetEmp = pendingList[0];
    expect(targetEmp.faceIdStatus).toBe('pending');

    const synced = await employeeService.syncFaceIdFromCamera(ubndTenant, {
      employeeId: targetEmp.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      faceScore: 99.2
    });

    expect(synced.faceIdStatus).toBe('enrolled');
    expect(synced.avatarUrl).toBeDefined();
    expect(synced.cameraSyncInfo?.deviceName).toContain('Camera AI Hikvision');
    expect(synced.cameraSyncInfo?.faceScore).toBe(99.2);

    // Kiểm tra dữ liệu được lưu bền vững
    const reloaded = await employeeService.getEmployeeById(ubndTenant, targetEmp.id);
    expect(reloaded.faceIdStatus).toBe('enrolled');
    expect(reloaded.cameraSyncInfo?.faceScore).toBe(99.2);
  });

  it('Hỗ trợ Import danh sách nhân sự từ file Excel kèm kiểm tra tính duy nhất', async () => {
    const importRows: ImportEmployeeRow[] = [
      {
        employeeCode: 'UBND-IMP-01',
        fullName: 'Đoàn Văn Vươn',
        identityNumber: '079089001122',
        position: 'Chuyên viên Hộ tịch',
        departmentCodeOrName: 'VP-UBND',
        email: 'vuon.doan@ubnd.gov.vn'
      },
      {
        employeeCode: 'UBND-001', // Trùng mã đã có -> phải bỏ qua
        fullName: 'Trần Trùng Lặp',
        identityNumber: '079089002233',
        position: 'Chuyên viên',
        departmentCodeOrName: 'VP-UBND'
      },
      {
        employeeCode: 'UBND-IMP-02',
        fullName: 'Nguyễn Thị Nở',
        identityNumber: '079089003344',
        position: 'Cán bộ Y tế',
        departmentCodeOrName: 'Tư pháp',
        email: 'no.nguyen@ubnd.gov.vn'
      }
    ];

    const result = await employeeService.importFromExcel(ubndTenant, importRows);
    expect(result.total).toBe(3);
    expect(result.importedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Mã nhân viên "UBND-001" đã tồn tại');

    // Kiểm tra nhân sự mới import đã có trong danh sách
    const list = await employeeService.getEmployeesByTenant(ubndTenant, { search: 'UBND-IMP' });
    expect(list.length).toBe(2);
  });

  it('Cập nhật thông tin nhân sự và xóa nhân sự', async () => {
    const list = await employeeService.getEmployeesByTenant(ubndTenant);
    const emp = list[0];

    const updated = await employeeService.updateEmployee(ubndTenant, emp.id, {
      fullName: 'Nguyễn Văn An (Cập nhật)',
      position: 'Quyền Chủ tịch UBND'
    });
    expect(updated.fullName).toBe('Nguyễn Văn An (Cập nhật)');
    expect(updated.position).toBe('Quyền Chủ tịch UBND');

    // Xóa nhân sự
    await employeeService.deleteEmployee(ubndTenant, emp.id);
    await expect(employeeService.getEmployeeById(ubndTenant, emp.id)).rejects.toThrow(
      /Không tìm thấy thông tin nhân viên/i
    );
  });
});
