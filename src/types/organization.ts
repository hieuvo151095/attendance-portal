export interface Department {
  id: string;
  tenantId: string;
  code: string; // Mã phòng ban (ví dụ: VP-UBND, PX-MAY-1, K-KHAM)
  name: string; // Tên phòng ban
  parentId: string | null; // ID phòng ban cấp trên (nếu là phòng ban con)
  managerName?: string; // Người phụ trách phòng ban
  managerPhone?: string; // Số điện thoại người phụ trách
  employeeCount: number; // Số lượng nhân viên trực thuộc
  order?: number; // Thứ tự hiển thị
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  level: number;
}

export interface CreateDepartmentDTO {
  code: string;
  name: string;
  parentId?: string | null;
  managerName?: string;
  managerPhone?: string;
}

export interface UpdateDepartmentDTO {
  code?: string;
  name?: string;
  parentId?: string | null;
  managerName?: string;
  managerPhone?: string;
}
