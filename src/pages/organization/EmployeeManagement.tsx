import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SearchField,
  SelectField,
  Button,
  DataTable,
  Tag,
  StatusTag,
  IconButton,
  EmptyValue
} from '../../design-system';
import { Employee } from '../../types/employee';
import { Department } from '../../types/organization';
import { employeeService } from '../../services/employee';
import { departmentService } from '../../services/department';
import { EmployeeModal } from './EmployeeModal';
import { CameraSyncModal } from './CameraSyncModal';
import { ExcelImportModal } from './ExcelImportModal';

export interface EmployeeManagementProps {
  tenantId: string;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ tenantId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [faceIdStatusFilter, setFaceIdStatusFilter] = useState<string>('all');

  // Modals
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [cameraSyncModalOpen, setCameraSyncModalOpen] = useState(false);
  const [employeeToSyncCamera, setEmployeeToSyncCamera] = useState<Employee | null>(null);

  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptList, empList] = await Promise.all([
        departmentService.getDepartmentsByTenant(tenantId),
        employeeService.getEmployeesByTenant(tenantId, {
          departmentId: selectedDeptId || undefined,
          search: searchTerm || undefined,
          faceIdStatus:
            faceIdStatusFilter === 'enrolled'
              ? 'enrolled'
              : faceIdStatusFilter === 'pending'
              ? 'pending'
              : undefined
        })
      ]);
      setDepartments(deptList);
      setEmployees(empList);
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedDeptId, searchTerm, faceIdStatusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistics
  const totalCount = employees.length;
  const enrolledCount = employees.filter((e) => e.faceIdStatus === 'enrolled').length;
  const pendingCount = employees.filter((e) => e.faceIdStatus === 'pending').length;

  const departmentMap = new Map<string, string>();
  departments.forEach((d) => departmentMap.set(d.id, d.name));

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setEmployeeModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setEmployeeModalOpen(true);
  };

  const handleOpenSyncCamera = (emp: Employee) => {
    setEmployeeToSyncCamera(emp);
    setCameraSyncModalOpen(true);
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${emp.fullName}" (${emp.employeeCode})?`)) {
      try {
        await employeeService.deleteEmployee(tenantId, emp.id);
        loadData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi xóa nhân sự';
        alert(msg);
      }
    }
  };

  const departmentFilterOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))
  ];

  const faceIdFilterOptions = [
    { value: 'all', label: 'Tất cả trạng thái Face ID' },
    { value: 'enrolled', label: 'Đã có Face ID từ Camera' },
    { value: 'pending', label: 'Chờ lấy mẫu tại Camera' }
  ];

  const columns = [
    {
      key: 'fullName',
      title: 'Nhân viên',
      width: '260px',
      render: (emp: Employee) => (
        <DataTable.Person
          name={emp.fullName}
          avatar={emp.avatarUrl}
          meta={emp.email || emp.phoneNumber || 'Chưa có thông tin liên hệ'}
        />
      )
    },
    {
      key: 'employeeCode',
      title: 'Mã nhân viên',
      width: '130px',
      render: (emp: Employee) => <Tag variant="code">{emp.employeeCode}</Tag>
    },
    {
      key: 'identityNumber',
      title: 'Số CCCD',
      width: '140px',
      render: (emp: Employee) => (
        <span className="body-mono-xs">{emp.identityNumber}</span>
      )
    },
    {
      key: 'position',
      title: 'Chức danh',
      width: '180px',
      render: (emp: Employee) => emp.position
    },
    {
      key: 'departmentId',
      title: 'Phòng ban',
      width: '180px',
      render: (emp: Employee) => (
        <span>{departmentMap.get(emp.departmentId) || 'Phòng ban khác'}</span>
      )
    },
    {
      key: 'faceIdStatus',
      title: 'Trạng thái Face ID',
      width: '170px',
      render: (emp: Employee) =>
        emp.faceIdStatus === 'enrolled' ? (
          <StatusTag tone="success" label="Đã có Face ID" icon="circle-check" />
        ) : (
          <StatusTag tone="warning" label="Chờ lấy mẫu camera" icon="camera" />
        )
    },
    {
      key: 'cameraSyncInfo',
      title: 'Đồng bộ Camera',
      width: '200px',
      render: (emp: Employee) => {
        if (!emp.cameraSyncInfo) {
          return <EmptyValue italic>Chưa kết nối</EmptyValue>;
        }
        return (
          <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
            <div style={{ color: 'var(--text-body)', fontWeight: 500 }}>
              {emp.cameraSyncInfo.deviceName}
            </div>
            <div>
              Khớp: <b>{emp.cameraSyncInfo.faceScore}%</b>
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '140px',
      render: (emp: Employee) => (
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
          <IconButton
            icon="camera"
            label="Đồng bộ Face ID từ Camera Hikvision"
            size="sm"
            onClick={() => handleOpenSyncCamera(emp)}
          />
          <IconButton
            icon="pen"
            label="Chỉnh sửa hồ sơ"
            size="sm"
            onClick={() => handleOpenEditModal(emp)}
          />
          <IconButton
            icon="trash"
            label="Xóa nhân sự"
            size="sm"
            onClick={() => handleDeleteEmployee(emp)}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
      {/* Page Title & Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="h2" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Quản Lý Hồ Sơ Nhân Sự
          </h1>
          <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
            Đặc tả ORG-02: Quản lý mã nhân viên, CCCD, chức danh, phòng ban và dữ liệu nhận diện khuôn mặt (Face ID) từ Camera AI Hikvision.
          </p>
        </div>
      </div>

      {/* Summary StatCards */}
      <StatCard.Group columns={3}>
        <StatCard
          label="Tổng nhân sự"
          value={totalCount}
          icon="users"
          tone="neutral"
        />
        <StatCard
          label="Đã đồng bộ Face ID từ Camera"
          value={enrolledCount}
          icon="circle-check"
          tone="success"
        />
        <StatCard
          label="Chờ lấy mẫu tại Camera"
          value={pendingCount}
          icon="camera"
          tone="warning"
        />
      </StatCard.Group>

      {/* Toolbar & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-12)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-16)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-12)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)', alignItems: 'center', flex: 1 }}>
          <SearchField
            placeholder="Tìm theo tên, mã NV, CCCD, chức danh..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            style={{ minWidth: '280px' }}
          />

          <SelectField
            options={departmentFilterOptions}
            value={selectedDeptId}
            onChange={(val) => setSelectedDeptId(val)}
          />

          <SelectField
            options={faceIdFilterOptions}
            value={faceIdStatusFilter}
            onChange={(val) => setFaceIdStatusFilter(val)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <Button
            variant="secondary"
            icon="file-excel"
            onClick={() => setExcelModalOpen(true)}
          >
            Nhập từ Excel
          </Button>
          <Button
            variant="primary"
            icon="plus"
            onClick={handleOpenAddModal}
          >
            Thêm nhân sự mới
          </Button>
        </div>
      </div>

      {/* Employees Data Table */}
      <DataTable
        columns={columns}
        rows={employees}
        rowKey="id"
        emptyText={
          loading
            ? 'Đang tải danh sách nhân sự...'
            : 'Không tìm thấy cán bộ nhân viên nào phù hợp với bộ lọc.'
        }
        emptyIcon="users"
        footer={
          <span>
            Hiển thị <b>{employees.length}</b> cán bộ nhân sự
          </span>
        }
      />

      {/* Modals */}
      <EmployeeModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        tenantId={tenantId}
        employeeToEdit={employeeToEdit}
        onSuccess={loadData}
      />

      <CameraSyncModal
        open={cameraSyncModalOpen}
        onClose={() => setCameraSyncModalOpen(false)}
        tenantId={tenantId}
        employee={employeeToSyncCamera}
        onSuccess={loadData}
      />

      <ExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        tenantId={tenantId}
        onSuccess={loadData}
      />
    </div>
  );
};
