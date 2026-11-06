import {
  Department,
  DepartmentTreeNode,
  CreateDepartmentDTO,
  UpdateDepartmentDTO
} from '../types/organization';
import { authService } from './auth';

const STORAGE_DEPARTMENTS_KEY = 'finviet_attendance_departments';

export const INITIAL_DEPARTMENTS: Department[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001)
  {
    id: 'dept-ubnd-01',
    tenantId: 'tenant-ubnd-001',
    code: 'VP-UBND',
    name: 'Văn phòng HĐND & UBND',
    parentId: null,
    managerName: 'Ông Nguyễn Văn An',
    managerPhone: '0903 111 222',
    employeeCount: 6,
    order: 1,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-ubnd-02',
    tenantId: 'tenant-ubnd-001',
    code: 'DC-XD',
    name: 'Bộ phận Địa chính - Xây dựng - Đô thị',
    parentId: 'dept-ubnd-01',
    managerName: 'Bà Phạm Thị Cúc',
    managerPhone: '0903 333 444',
    employeeCount: 5,
    order: 2,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-ubnd-03',
    tenantId: 'tenant-ubnd-001',
    code: 'TP-HT',
    name: 'Bộ phận Tư pháp - Hộ tịch',
    parentId: 'dept-ubnd-01',
    managerName: 'Ông Hoàng Văn Đức',
    managerPhone: '0903 555 666',
    employeeCount: 4,
    order: 3,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-ubnd-04',
    tenantId: 'tenant-ubnd-001',
    code: 'BCH-QS',
    name: 'Ban Chỉ huy Quân sự Phường',
    parentId: null,
    managerName: 'Ông Lê Văn Hùng',
    managerPhone: '0903 777 888',
    employeeCount: 4,
    order: 4,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-ubnd-05',
    tenantId: 'tenant-ubnd-001',
    code: 'CAP',
    name: 'Công An Phường Bến Nghé',
    parentId: null,
    managerName: 'Trung tá Trần Quốc Toản',
    managerPhone: '0903 999 000',
    employeeCount: 6,
    order: 5,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 2. Công Ty May & Sản Xuất Tân Bình (tenant-factory-002)
  {
    id: 'dept-tb-01',
    tenantId: 'tenant-factory-002',
    code: 'VP-DH',
    name: 'Khối Văn phòng & Ban Điều hành',
    parentId: null,
    managerName: 'Bà Trần Thị Mai',
    managerPhone: '0918 111 222',
    employeeCount: 12,
    order: 1,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-tb-02',
    tenantId: 'tenant-factory-002',
    code: 'QC-KCS',
    name: 'Bộ phận Kiểm thử Chất lượng (KCS)',
    parentId: 'dept-tb-01',
    managerName: 'Kỹ sư Phạm Văn Hưng',
    managerPhone: '0918 333 444',
    employeeCount: 8,
    order: 2,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-tb-03',
    tenantId: 'tenant-factory-002',
    code: 'PX-MAY-1',
    name: 'Phân xưởng May Xuất khẩu 1',
    parentId: null,
    managerName: 'Quản đốc Lê Văn Hải',
    managerPhone: '0918 555 666',
    employeeCount: 45,
    order: 3,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },

  // 3. Bệnh Viện Nhi Đồng 1 (tenant-hospital-003)
  {
    id: 'dept-bv-01',
    tenantId: 'tenant-hospital-003',
    code: 'BGD-KHTH',
    name: 'Ban Giám đốc & Phòng Kế hoạch Tổng hợp',
    parentId: null,
    managerName: 'BS. Lê Hoàng Nam',
    managerPhone: '0922 111 222',
    employeeCount: 10,
    order: 1,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-bv-02',
    tenantId: 'tenant-hospital-003',
    code: 'K-KHAM',
    name: 'Khoa Khám Bệnh',
    parentId: null,
    managerName: 'BSCK2 Nguyễn Thị Huệ',
    managerPhone: '0922 333 444',
    employeeCount: 28,
    order: 2,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'dept-bv-03',
    tenantId: 'tenant-hospital-003',
    code: 'K-DUOC',
    name: 'Khoa Dược & Vật tư Y tế',
    parentId: 'dept-bv-01',
    managerName: 'Dược sĩ CKI Võ Minh Trí',
    managerPhone: '0922 555 666',
    employeeCount: 14,
    order: 3,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  }
];

class DepartmentService {
  private memoryDepts: Map<string, Department> = new Map();

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
      const stored = localStorage.getItem(STORAGE_DEPARTMENTS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_DEPARTMENTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
      }
    } else {
      INITIAL_DEPARTMENTS.forEach((d) => this.memoryDepts.set(d.id, { ...d }));
    }
  }

  private getAllDepartments(): Department[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_DEPARTMENTS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return INITIAL_DEPARTMENTS;
        }
      }
      return INITIAL_DEPARTMENTS;
    }
    return Array.from(this.memoryDepts.values());
  }

  private saveDepartments(departments: Department[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_DEPARTMENTS_KEY, JSON.stringify(departments));
    } else {
      this.memoryDepts.clear();
      departments.forEach((d) => this.memoryDepts.set(d.id, d));
    }
  }

  /**
   * Lấy danh sách toàn bộ phòng ban thuộc về một đơn vị (Multi-tenancy isolation)
   */
  public async getDepartmentsByTenant(tenantId: string): Promise<Department[]> {
    authService.assertTenantAccess(tenantId);
    const all = this.getAllDepartments();
    return all.filter((d) => d.tenantId === tenantId).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Dựng cây cấu trúc phân cấp phòng ban cha - con
   */
  public async getDepartmentTree(tenantId: string): Promise<DepartmentTreeNode[]> {
    const list = await this.getDepartmentsByTenant(tenantId);
    return this.buildTree(list, null, 0);
  }

  private buildTree(list: Department[], parentId: string | null, level: number): DepartmentTreeNode[] {
    return list
      .filter((item) => (parentId === null ? !item.parentId : item.parentId === parentId))
      .map((item) => ({
        ...item,
        level,
        children: this.buildTree(list, item.id, level + 1)
      }));
  }

  /**
   * Thêm mới một phòng ban / bộ phận trực thuộc (ORG-01)
   */
  public async createDepartment(tenantId: string, dto: CreateDepartmentDTO): Promise<Department> {
    authService.assertTenantAccess(tenantId);

    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();

    if (!code) {
      throw new Error('Mã phòng ban không được để trống');
    }
    if (!name) {
      throw new Error('Tên phòng ban không được để trống');
    }

    const all = this.getAllDepartments();

    // 1. Kiểm tra tính duy nhất của mã phòng ban trong cùng một đơn vị
    const exists = all.some((d) => d.tenantId === tenantId && d.code.toUpperCase() === code);
    if (exists) {
      throw new Error(`Mã phòng ban "${code}" đã tồn tại trong cơ quan đơn vị`);
    }

    // 2. Nếu có parentId, kiểm tra phòng ban cha phải thuộc cùng đơn vị
    if (dto.parentId) {
      const parent = all.find((d) => d.id === dto.parentId && d.tenantId === tenantId);
      if (!parent) {
        throw new Error('Phòng ban cấp trên trực thuộc không tồn tại');
      }
    }

    const now = new Date().toISOString();
    const newDept: Department = {
      id: `dept-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}`,
      tenantId,
      code,
      name,
      parentId: dto.parentId || null,
      managerName: dto.managerName?.trim() || '',
      managerPhone: dto.managerPhone?.trim() || '',
      employeeCount: 0,
      order: all.filter((d) => d.tenantId === tenantId).length + 1,
      createdAt: now,
      updatedAt: now
    };

    all.push(newDept);
    this.saveDepartments(all);

    return newDept;
  }

  /**
   * Cập nhật thông tin phòng ban (ORG-01)
   */
  public async updateDepartment(
    tenantId: string,
    id: string,
    dto: UpdateDepartmentDTO
  ): Promise<Department> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllDepartments();
    const index = all.findIndex((d) => d.id === id && d.tenantId === tenantId);

    if (index === -1) {
      throw new Error('Không tìm thấy phòng ban cần cập nhật');
    }

    const dept = all[index];

    // 1. Kiểm tra mã mới nếu có
    if (dto.code !== undefined) {
      const newCode = dto.code.trim().toUpperCase();
      if (!newCode) throw new Error('Mã phòng ban không được để trống');
      const dup = all.some(
        (d) => d.tenantId === tenantId && d.id !== id && d.code.toUpperCase() === newCode
      );
      if (dup) {
        throw new Error(`Mã phòng ban "${newCode}" đã được sử dụng`);
      }
      dept.code = newCode;
    }

    if (dto.name !== undefined) {
      const newName = dto.name.trim();
      if (!newName) throw new Error('Tên phòng ban không được để trống');
      dept.name = newName;
    }

    if (dto.managerName !== undefined) {
      dept.managerName = dto.managerName.trim();
    }

    if (dto.managerPhone !== undefined) {
      dept.managerPhone = dto.managerPhone.trim();
    }

    // 2. Kiểm tra quan hệ cha - con: Không thể chọn chính mình hoặc con cháu làm cha (ngăn ngừa vòng lặp vô tận)
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new Error('Một phòng ban không thể trực thuộc chính nó');
      }

      if (dto.parentId) {
        const parent = all.find((d) => d.id === dto.parentId && d.tenantId === tenantId);
        if (!parent) {
          throw new Error('Phòng ban cấp trên trực thuộc không tồn tại');
        }

        // Kiểm tra xem parentId có phải là một con cháu của phòng ban hiện tại không
        const descendants = this.getDescendantIds(all, id);
        if (descendants.includes(dto.parentId)) {
          throw new Error('Không thể chuyển phòng ban trực thuộc một phòng ban con của chính nó');
        }
      }

      dept.parentId = dto.parentId || null;
    }

    dept.updatedAt = new Date().toISOString();
    all[index] = dept;
    this.saveDepartments(all);

    return dept;
  }

  private getDescendantIds(all: Department[], parentId: string): string[] {
    const children = all.filter((d) => d.parentId === parentId);
    let ids: string[] = children.map((c) => c.id);
    for (const child of children) {
      ids = ids.concat(this.getDescendantIds(all, child.id));
    }
    return ids;
  }

  /**
   * Xóa phòng ban: Nếu có phòng ban con, chuyển các phòng ban con lên cấp của cha hoặc ngăn xóa
   */
  public async deleteDepartment(tenantId: string, id: string): Promise<void> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllDepartments();
    const index = all.findIndex((d) => d.id === id && d.tenantId === tenantId);

    if (index === -1) {
      throw new Error('Không tìm thấy phòng ban cần xóa');
    }

    const dept = all[index];
    const children = all.filter((d) => d.parentId === id);

    // Chuyển các phòng ban con sang kế thừa parentId của phòng ban vừa bị xóa
    children.forEach((child) => {
      child.parentId = dept.parentId;
      child.updatedAt = new Date().toISOString();
    });

    // Xóa phòng ban
    all.splice(index, 1);
    this.saveDepartments(all);
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_DEPARTMENTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
    }
    this.memoryDepts.clear();
    INITIAL_DEPARTMENTS.forEach((d) => this.memoryDepts.set(d.id, { ...d }));
  }
}

export const departmentService = new DepartmentService();
