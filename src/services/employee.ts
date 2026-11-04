import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  CameraFaceSyncPayload,
  ImportEmployeeRow,
  ImportEmployeeResult
} from '../types/employee';
import { authService } from './auth';
import { departmentService } from './department';

const STORAGE_EMPLOYEES_KEY = 'finviet_attendance_employees';

// Pre-seeded employees with realistic Vietnamese non-school data
export const INITIAL_EMPLOYEES: Employee[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001)
  {
    id: 'emp-ubnd-01',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-001',
    fullName: 'Đ/c Nguyễn Văn An',
    identityNumber: '079085001234',
    position: 'Chủ tịch UBND Phường',
    departmentId: 'dept-ubnd-01',
    email: 'an.nguyen@ubnd.gov.vn',
    phoneNumber: '0903 111 222',
    gender: 'male',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:30:00Z',
      faceScore: 98.6
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:30:00Z'
  },
  {
    id: 'emp-ubnd-02',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-002',
    fullName: 'Bà Phạm Thị Cúc',
    identityNumber: '079186002345',
    position: 'Trưởng bộ phận Địa chính - Xây dựng',
    departmentId: 'dept-ubnd-02',
    email: 'cuc.pham@ubnd.gov.vn',
    phoneNumber: '0903 333 444',
    gender: 'female',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera AI Hikvision Cổng 1 - Trụ sở UBND',
      syncedAt: '2026-11-01T08:35:00Z',
      faceScore: 99.1
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:35:00Z'
  },
  {
    id: 'emp-ubnd-03',
    tenantId: 'tenant-ubnd-001',
    employeeCode: 'UBND-003',
    fullName: 'Ông Hoàng Văn Đức',
    identityNumber: '079090003456',
    position: 'Cán bộ Tư pháp - Hộ tịch',
    departmentId: 'dept-ubnd-03',
    email: 'duc.hoang@ubnd.gov.vn',
    phoneNumber: '0903 555 666',
    gender: 'male',
    faceIdStatus: 'pending', // Chờ lấy mẫu tại camera
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 2. Nhà Máy Tân Bình (tenant-factory-002)
  {
    id: 'emp-tb-01',
    tenantId: 'tenant-factory-002',
    employeeCode: 'TB-001',
    fullName: 'Bà Trần Thị Mai',
    identityNumber: '079180004567',
    position: 'Giám đốc Điều hành Nhà máy',
    departmentId: 'dept-tb-01',
    email: 'mai.tran@tanbinhfactory.com',
    phoneNumber: '0918 111 222',
    gender: 'female',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Cổng Chính Nhà Máy',
      syncedAt: '2026-11-01T07:15:00Z',
      faceScore: 97.8
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-tb-02',
    tenantId: 'tenant-factory-002',
    employeeCode: 'TB-002',
    fullName: 'Ông Lê Văn Hải',
    identityNumber: '079083005678',
    position: 'Quản đốc Phân xưởng May 1',
    departmentId: 'dept-tb-03',
    email: 'hai.le@tanbinhfactory.com',
    phoneNumber: '0918 555 666',
    gender: 'male',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Phân Xưởng May',
      syncedAt: '2026-11-01T07:20:00Z',
      faceScore: 98.9
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 3. Bệnh Viện Nhi Đồng 1 (tenant-hospital-003)
  {
    id: 'emp-bv-01',
    tenantId: 'tenant-hospital-003',
    employeeCode: 'BV-001',
    fullName: 'BS. Lê Hoàng Nam',
    identityNumber: '079081006789',
    position: 'Phó Giám Đốc KHTH',
    departmentId: 'dept-bv-01',
    email: 'nam.le@nhidong1.org.vn',
    phoneNumber: '0922 111 222',
    gender: 'male',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Khu Hành Chính BV',
      syncedAt: '2026-11-01T08:00:00Z',
      faceScore: 99.4
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'emp-bv-02',
    tenantId: 'tenant-hospital-003',
    employeeCode: 'BV-002',
    fullName: 'BSCK2 Nguyễn Thị Huệ',
    identityNumber: '079184007890',
    position: 'Trưởng Khoa Khám Bệnh',
    departmentId: 'dept-bv-02',
    email: 'hue.nguyen@nhidong1.org.vn',
    phoneNumber: '0922 333 444',
    gender: 'female',
    faceIdStatus: 'enrolled',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813590-785a97576442?w=150',
    cameraSyncInfo: {
      deviceName: 'Camera Face ID Hikvision Khu Khám Bệnh',
      syncedAt: '2026-11-01T08:10:00Z',
      faceScore: 98.7
    },
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  }
];

class EmployeeService {
  private memoryEmployees: Map<string, Employee> = new Map();

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
      const stored = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      }
    } else {
      INITIAL_EMPLOYEES.forEach((e) => this.memoryEmployees.set(e.id, { ...e }));
    }
  }

  private getAllEmployees(): Employee[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return INITIAL_EMPLOYEES;
        }
      }
      return INITIAL_EMPLOYEES;
    }
    return Array.from(this.memoryEmployees.values());
  }

  private saveEmployees(employees: Employee[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(employees));
    } else {
      this.memoryEmployees.clear();
      employees.forEach((e) => this.memoryEmployees.set(e.id, e));
    }
  }

  /**
   * Lấy danh sách nhân viên thuộc đơn vị (kèm bộ lọc phòng ban, tìm kiếm, trạng thái Face ID)
   */
  public async getEmployeesByTenant(
    tenantId: string,
    filters?: { departmentId?: string; search?: string; faceIdStatus?: 'enrolled' | 'pending' }
  ): Promise<Employee[]> {
    authService.assertTenantAccess(tenantId);
    let list = this.getAllEmployees().filter((e) => e.tenantId === tenantId);

    if (filters?.departmentId) {
      list = list.filter((e) => e.departmentId === filters.departmentId);
    }

    if (filters?.faceIdStatus) {
      list = list.filter((e) => e.faceIdStatus === filters.faceIdStatus);
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.employeeCode.toLowerCase().includes(term) ||
          e.fullName.toLowerCase().includes(term) ||
          e.identityNumber.toLowerCase().includes(term) ||
          (e.position && e.position.toLowerCase().includes(term)) ||
          (e.email && e.email.toLowerCase().includes(term)) ||
          (e.phoneNumber && e.phoneNumber.toLowerCase().includes(term))
      );
    }

    return list.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  }

  public async getEmployeeById(tenantId: string, id: string): Promise<Employee> {
    authService.assertTenantAccess(tenantId);
    const emp = this.getAllEmployees().find((e) => e.id === id && e.tenantId === tenantId);
    if (!emp) {
      throw new Error('Không tìm thấy thông tin nhân viên');
    }
    return emp;
  }

  /**
   * Thêm nhân sự mới (ORG-02)
   */
  public async createEmployee(tenantId: string, dto: CreateEmployeeDTO): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const employeeCode = dto.employeeCode.trim().toUpperCase();
    const fullName = dto.fullName.trim();
    const identityNumber = dto.identityNumber.trim();
    const position = dto.position.trim();

    if (!employeeCode) throw new Error('Mã nhân viên (Employee ID) không được để trống');
    if (!fullName) throw new Error('Họ và tên nhân viên không được để trống');
    if (!identityNumber) throw new Error('Số CCCD / Hộ chiếu không được để trống');
    if (!dto.departmentId) throw new Error('Vui lòng chọn phòng ban trực thuộc');

    // Kiểm tra phòng ban có thuộc cùng đơn vị không
    const depts = await departmentService.getDepartmentsByTenant(tenantId);
    const deptExists = depts.some((d) => d.id === dto.departmentId);
    if (!deptExists) throw new Error('Phòng ban được chọn không thuộc cơ quan đơn vị này');

    const all = this.getAllEmployees();

    // 1. Kiểm tra tính duy nhất của mã nhân viên trong cùng đơn vị
    if (all.some((e) => e.tenantId === tenantId && e.employeeCode.toUpperCase() === employeeCode)) {
      throw new Error(`Mã nhân viên "${employeeCode}" đã tồn tại trong cơ quan`);
    }

    // 2. Kiểm tra tính duy nhất của số CCCD/Hộ chiếu trong cùng đơn vị
    if (all.some((e) => e.tenantId === tenantId && e.identityNumber === identityNumber)) {
      throw new Error(`Số CCCD "${identityNumber}" đã được sử dụng cho nhân viên khác`);
    }

    const now = new Date().toISOString();
    const newEmp: Employee = {
      id: `emp-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}`,
      tenantId,
      employeeCode,
      fullName,
      identityNumber,
      position,
      departmentId: dto.departmentId,
      email: dto.email?.trim() || '',
      phoneNumber: dto.phoneNumber?.trim() || '',
      gender: dto.gender || 'male',
      faceIdStatus: dto.avatarUrl ? 'enrolled' : 'pending',
      avatarUrl: dto.avatarUrl,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    all.push(newEmp);
    this.saveEmployees(all);

    return newEmp;
  }

  /**
   * Cập nhật thông tin nhân sự (ORG-02)
   */
  public async updateEmployee(
    tenantId: string,
    id: string,
    dto: UpdateEmployeeDTO
  ): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === id && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy hồ sơ nhân viên cần cập nhật');

    const emp = all[index];

    if (dto.employeeCode !== undefined) {
      const code = dto.employeeCode.trim().toUpperCase();
      if (!code) throw new Error('Mã nhân viên không được để trống');
      const dup = all.some(
        (e) => e.tenantId === tenantId && e.id !== id && e.employeeCode.toUpperCase() === code
      );
      if (dup) throw new Error(`Mã nhân viên "${code}" đã tồn tại`);
      emp.employeeCode = code;
    }

    if (dto.fullName !== undefined) {
      const name = dto.fullName.trim();
      if (!name) throw new Error('Họ tên không được để trống');
      emp.fullName = name;
    }

    if (dto.identityNumber !== undefined) {
      const cccd = dto.identityNumber.trim();
      if (!cccd) throw new Error('Số CCCD không được để trống');
      const dup = all.some(
        (e) => e.tenantId === tenantId && e.id !== id && e.identityNumber === cccd
      );
      if (dup) throw new Error(`Số CCCD "${cccd}" đã được sử dụng`);
      emp.identityNumber = cccd;
    }

    if (dto.departmentId !== undefined) {
      const depts = await departmentService.getDepartmentsByTenant(tenantId);
      if (!depts.some((d) => d.id === dto.departmentId)) {
        throw new Error('Phòng ban không tồn tại trong cơ quan');
      }
      emp.departmentId = dto.departmentId;
    }

    if (dto.position !== undefined) emp.position = dto.position.trim();
    if (dto.email !== undefined) emp.email = dto.email.trim();
    if (dto.phoneNumber !== undefined) emp.phoneNumber = dto.phoneNumber.trim();
    if (dto.gender !== undefined) emp.gender = dto.gender;
    if (dto.avatarUrl !== undefined) {
      emp.avatarUrl = dto.avatarUrl;
      emp.faceIdStatus = dto.avatarUrl ? 'enrolled' : 'pending';
    }
    if (dto.status !== undefined) emp.status = dto.status;

    emp.updatedAt = new Date().toISOString();
    all[index] = emp;
    this.saveEmployees(all);

    return emp;
  }

  /**
   * Xóa nhân sự
   */
  public async deleteEmployee(tenantId: string, id: string): Promise<void> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === id && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy nhân viên cần xóa');

    all.splice(index, 1);
    this.saveEmployees(all);
  }

  /**
   * ĐỒNG BỘ ẢNH CHÂN DUNG & DỮ LIỆU FACE ID TỪ CAMERA SANG PORTAL (ORG-02)
   * Yêu cầu từ PO: "Về ảnh chân dung, sẽ được chuyển từ camera sang.
   * Người dùng khi thiết lập face id trên camera sẽ được lưu trữ trên portal."
   */
  public async syncFaceIdFromCamera(
    tenantId: string,
    payload: CameraFaceSyncPayload
  ): Promise<Employee> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllEmployees();
    const index = all.findIndex((e) => e.id === payload.employeeId && e.tenantId === tenantId);
    if (index === -1) throw new Error('Không tìm thấy nhân viên để đồng bộ dữ liệu Face ID');

    const emp = all[index];
    const now = new Date().toISOString();

    emp.avatarUrl = payload.avatarUrl;
    emp.faceIdStatus = 'enrolled';
    emp.cameraSyncInfo = {
      deviceName: payload.deviceName || 'Camera AI Hikvision Cổng 1',
      syncedAt: now,
      faceScore: payload.faceScore || 98.8
    };
    emp.updatedAt = now;

    all[index] = emp;
    this.saveEmployees(all);

    return emp;
  }

  /**
   * Import danh sách nhân viên từ file Excel
   */
  public async importFromExcel(
    tenantId: string,
    rows: ImportEmployeeRow[]
  ): Promise<ImportEmployeeResult> {
    authService.assertTenantAccess(tenantId);

    const depts = await departmentService.getDepartmentsByTenant(tenantId);
    const all = this.getAllEmployees();

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIdx = i + 1;

      try {
        const code = row.employeeCode.trim().toUpperCase();
        const fullName = row.fullName.trim();
        const identityNumber = row.identityNumber.trim();

        if (!code || !fullName || !identityNumber) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Thiếu thông tin bắt buộc (mã, họ tên hoặc CCCD)`);
          continue;
        }

        // Kiểm tra trùng mã
        if (all.some((e) => e.tenantId === tenantId && e.employeeCode.toUpperCase() === code)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Mã nhân viên "${code}" đã tồn tại`);
          continue;
        }

        // Kiểm tra trùng CCCD
        if (all.some((e) => e.tenantId === tenantId && e.identityNumber === identityNumber)) {
          skippedCount++;
          errors.push(`Dòng ${rowIdx}: Số CCCD "${identityNumber}" đã tồn tại`);
          continue;
        }

        // Tìm phòng ban theo mã hoặc tên
        const deptTerm = row.departmentCodeOrName.trim().toLowerCase();
        let targetDept = depts.find(
          (d) =>
            d.code.toLowerCase() === deptTerm ||
            d.name.toLowerCase() === deptTerm ||
            d.name.toLowerCase().includes(deptTerm)
        );

        if (!targetDept) {
          // Mặc định gắn vào phòng ban đầu tiên nếu không khớp
          targetDept = depts[0];
        }

        const now = new Date().toISOString();
        const newEmp: Employee = {
          id: `emp-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}-${i}`,
          tenantId,
          employeeCode: code,
          fullName,
          identityNumber,
          position: row.position?.trim() || 'Nhân viên',
          departmentId: targetDept ? targetDept.id : '',
          email: row.email?.trim() || '',
          phoneNumber: row.phoneNumber?.trim() || '',
          gender: 'male',
          faceIdStatus: 'pending', // Mặc định chờ lấy mẫu tại Camera
          status: 'active',
          createdAt: now,
          updatedAt: now
        };

        all.push(newEmp);
        importedCount++;
      } catch (err: unknown) {
        skippedCount++;
        const msg = err instanceof Error ? err.message : 'Lỗi xử lý hàng dữ liệu';
        errors.push(`Dòng ${rowIdx}: ${msg}`);
      }
    }

    this.saveEmployees(all);

    return {
      total: rows.length,
      importedCount,
      skippedCount,
      errors
    };
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    }
    this.memoryEmployees.clear();
    INITIAL_EMPLOYEES.forEach((e) => this.memoryEmployees.set(e.id, { ...e }));
  }
}

export const employeeService = new EmployeeService();
