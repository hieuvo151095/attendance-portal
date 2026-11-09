import React, { useState, useEffect, useCallback } from 'react';
import {
  StatCard,
  SearchField,
  SelectField,
  Button,
  DataTable,
  Tag,
  StatusTag,
  EmptyValue,
  Icon,
  PopupModal,
  InlineNotice,
  toast
} from '../../design-system';
import { Employee } from '../../types/employee';
import { Department } from '../../types/organization';
import { EmployeeCard } from '../../types/card';
import { employeeService } from '../../services/employee';
import { departmentService } from '../../services/department';
import { cardService } from '../../services/card';
import { EmployeeModal } from './EmployeeModal';
import { ExcelImportModal } from './ExcelImportModal';
import { CardManagementModal } from './CardManagementModal';
import { CameraSyncModal } from './CameraSyncModal';

export interface EmployeeManagementProps {
  tenantId: string;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ tenantId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cards, setCards] = useState<EmployeeCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [faceIdStatusFilter, setFaceIdStatusFilter] = useState<string>('all');
  const [cardStatusFilter, setCardStatusFilter] = useState<string>('all');

  // Modals
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [cameraSyncModalOpen, setCameraSyncModalOpen] = useState(false);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [employeeForCard, setEmployeeForCard] = useState<Employee | null>(null);
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);
  const [isDeletingEmp, setIsDeletingEmp] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptList, empList, cardList] = await Promise.all([
        departmentService.getDepartmentsByTenant(tenantId),
        employeeService.getEmployeesByTenant(tenantId, {
          departmentId: selectedDeptId || undefined,
          search: searchTerm || undefined
        }),
        cardService.getCardsByTenant(tenantId)
      ]);
      setDepartments(deptList);
      setEmployees(empList);
      setCards(cardList);
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedDeptId, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active card map per employee
  const activeCardMap = new Map<string, EmployeeCard>();
  cards.forEach((c) => {
    if (c.status !== 'revoked') {
      activeCardMap.set(c.employeeId, c);
    }
  });

  // Filter employees by card status and camera/face ID status
  const filteredEmployees = employees.filter((emp) => {
    if (cardStatusFilter !== 'all') {
      const card = activeCardMap.get(emp.id);
      if (cardStatusFilter === 'active' && card?.status !== 'active') return false;
      if (cardStatusFilter === 'locked' && card?.status !== 'locked') return false;
      if (cardStatusFilter === 'none' && card) return false;
    }
    if (faceIdStatusFilter === 'synced' && !emp.cameraSyncInfo) return false;
    if (faceIdStatusFilter === 'pending' && Boolean(emp.cameraSyncInfo)) return false;
    if (faceIdStatusFilter === 'enrolled' && !emp.avatarUrl && emp.faceIdStatus !== 'enrolled') return false;
    if (faceIdStatusFilter === 'hasPhoto' && !emp.avatarUrl) return false;
    return true;
  });

  // Statistics
  const totalCount = employees.length;
  const syncedCount = employees.filter((e) => Boolean(e.cameraSyncInfo)).length;
  const unsyncedCount = employees.filter((e) => !e.cameraSyncInfo).length;
  const activeCardCount = employees.filter((e) => activeCardMap.get(e.id)?.status === 'active').length;

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

  const handleOpenCardModal = (emp: Employee) => {
    setEmployeeForCard(emp);
    setCardModalOpen(true);
  };

  const handleSyncSingleEmployee = async (emp: Employee) => {
    try {
      await employeeService.syncEmployeesToCamera(tenantId, [emp.id]);
      toast.success(`Đã đồng bộ thành công hồ sơ của "${emp.fullName}" đến các thiết bị Camera AI.`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đồng bộ đến Camera';
      toast.danger(msg);
    }
  };

  const handleDeleteEmployee = (emp: Employee) => {
    setEmpToDelete(emp);
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!empToDelete) return;
    setIsDeletingEmp(true);
    try {
      await employeeService.deleteEmployee(tenantId, empToDelete.id);
      const empName = empToDelete.fullName;
      setEmpToDelete(null);
      loadData();
      toast.success(`Đã xóa hồ sơ nhân sự "${empName}" thành công.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa nhân sự';
      toast.danger(msg);
    } finally {
      setIsDeletingEmp(false);
    }
  };

  const departmentFilterOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` }))
  ];

  const faceIdFilterOptions = [
    { value: 'all', label: 'Tất cả trạng thái Face ID' },
    { value: 'synced', label: 'Đã đồng bộ đến Camera' },
    { value: 'pending', label: 'Chưa đồng bộ đến Camera' },
    { value: 'hasPhoto', label: 'Đã có ảnh Face ID' }
  ];

  const cardFilterOptions = [
    { value: 'all', label: 'Tất cả trạng thái thẻ' },
    { value: 'active', label: 'Đã cấp thẻ (Đang hoạt động)' },
    { value: 'locked', label: 'Thẻ đang tạm khóa' },
    { value: 'none', label: 'Chưa có thẻ vật lý' }
  ];

  const columns = [
    {
      key: 'fullName',
      title: 'Nhân viên',
      width: '220px',
      render: (emp: Employee) => (
        <DataTable.Person
          name={emp.fullName}
          avatar={emp.avatarUrl}
          meta={emp.gender === 'female' ? 'Nữ' : 'Nam'}
        />
      )
    },
    {
      key: 'contact',
      title: 'Liên lạc',
      width: '210px',
      render: (emp: Employee) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--text-body)', fontSize: '12px' }}>
            <Icon name="envelope" size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '175px'
              }}
              title={emp.email || 'Chưa có email'}
            >
              {emp.email || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có email</span>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--text-body)', fontSize: '12px' }}>
            <Icon name="phone" size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-subtle)' }}>
              {emp.phoneNumber || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có SĐT</span>}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'employeeCode',
      title: 'Mã NV & CCCD',
      width: '160px',
      render: (emp: Employee) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <Tag variant="code">{emp.employeeCode}</Tag>
          <span className="body-mono-xs" style={{ color: 'var(--text-subtle)' }}>
            {emp.identityNumber}
          </span>
        </div>
      )
    },
    {
      key: 'position',
      title: 'Chức danh & Phòng ban',
      width: '220px',
      render: (emp: Employee) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
            {emp.position}
          </span>
          <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
            {departmentMap.get(emp.departmentId) || 'Phòng ban khác'}
          </span>
        </div>
      )
    },
    {
      key: 'attendanceMethods',
      title: 'Hình thức điểm danh',
      width: '180px',
      render: (emp: Employee) => {
        const card = activeCardMap.get(emp.id);
        const hasCard = Boolean(card);
        const hasFaceId = Boolean(emp.avatarUrl) || emp.faceIdStatus === 'enrolled';
        const hasFingerprint = (emp.fingerprintStatus ?? 'enrolled') === 'enrolled';

        const allowed = emp.allowedMethods || {
          faceId: hasFaceId,
          fingerprint: hasFingerprint,
          card: hasCard
        };

        const methods = [];

        // 1. Face ID:
        if (hasFaceId) {
          const isAllowed = allowed.faceId !== false;
          const isSynced = Boolean(emp.cameraSyncInfo);
          methods.push({
            key: 'faceId',
            name: 'Khuôn mặt (Face ID)',
            icon: 'camera' as const,
            allowed: isAllowed,
            isSynced,
            statusText: isAllowed
              ? (isSynced
                  ? 'Đang bật nhận diện Face ID qua Camera AI (Đã đồng bộ)'
                  : 'Đã có ảnh Face ID trên Portal (Chưa đồng bộ đến Camera)')
              : 'Đã có Face ID nhưng Quản trị viên tạm tắt'
          });
        }

        // 2. Vân tay:
        if (hasFingerprint) {
          const isAllowed = allowed.fingerprint !== false;
          methods.push({
            key: 'fingerprint',
            name: 'Vân tay',
            icon: 'fingerprint' as const,
            allowed: isAllowed,
            isSynced: true,
            statusText: isAllowed
              ? 'Đang bật xác thực sinh trắc học vân tay'
              : 'Đã có mẫu vân tay nhưng Quản trị viên tạm tắt'
          });
        }

        // 3. Thẻ nhân viên:
        if (hasCard && card) {
          const isAllowed = (allowed.card !== false) && card.status === 'active';
          methods.push({
            key: 'card',
            name: 'Thẻ nhân viên',
            icon: 'id-badge' as const,
            allowed: isAllowed,
            isSynced: true,
            statusText: isAllowed
              ? `Đang bật quẹt thẻ (${card.cardUid})`
              : card.status === 'locked'
              ? `Thẻ tạm khóa (${card.cardUid})`
              : `Đã cấp thẻ (${card.cardUid}) nhưng Quản trị viên tạm tắt`
          });
        }

        if (methods.length === 0) {
          return <EmptyValue italic>Chưa kích hoạt</EmptyValue>;
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            {methods.map((m) => (
              <div
                key={m.key}
                title={`${m.name}: ${m.statusText}`}
                data-testid={`method-${m.key}-${emp.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: m.allowed ? 'var(--primary-50)' : 'var(--bg-subtle)',
                  color: m.allowed ? 'var(--primary-700)' : 'var(--text-disabled)',
                  border: `1px solid ${m.allowed ? 'var(--primary-200)' : 'var(--border-neutral-subtle)'}`,
                  opacity: m.allowed ? 1 : 0.45,
                  cursor: 'default'
                }}
              >
                <Icon name={m.icon} size={15} />
                {m.key === 'faceId' && !m.isSynced && (
                  <span
                    title="Chưa đồng bộ đến Camera AI"
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      border: '1.5px solid #ffffff'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      key: 'cardUid',
      title: 'Mã thẻ',
      width: '160px',
      render: (emp: Employee) => {
        const card = activeCardMap.get(emp.id);
        if (!card) {
          return <EmptyValue italic>Chưa cấp thẻ</EmptyValue>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <Tag variant="code">{card.cardUid}</Tag>
            {card.status === 'active' ? (
              <StatusTag tone="success" label="Hoạt động" />
            ) : (
              <StatusTag tone="warning" label="Tạm khóa" icon="lock" />
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '90px',
      render: (emp: Employee) => (
        <DataTable.RowAction
          label="Thao tác"
          items={[
            {
              icon: 'id-badge',
              label: 'Quản lý thẻ nhân viên',
              onClick: () => handleOpenCardModal(emp)
            },
            {
              icon: 'pen',
              label: 'Chỉnh sửa hồ sơ',
              onClick: () => handleOpenEditModal(emp)
            },
            {
              icon: 'rotate-right',
              label: emp.cameraSyncInfo ? 'Đồng bộ lại đến Camera' : 'Đồng bộ đến Camera AI',
              onClick: () => handleSyncSingleEmployee(emp)
            },
            {
              divider: true
            },
            {
              icon: 'trash',
              label: 'Xóa nhân sự',
              tone: 'danger',
              onClick: () => handleDeleteEmployee(emp)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div
      className="employee-management-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Page Title & Overview (OUTSIDE all sections) */}
      <div
        data-testid="employee-page-header"
        style={{
          padding: '4px 0 16px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-16)'
        }}
      >
        <div>
          <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Quản Lý Hồ Sơ Nhân Sự
          </h1>
          <p className="body-sm" style={{ margin: 'var(--space-4) 0 0', color: 'var(--text-subtle)' }}>
            Quản lý thông tin nhân sự và hình thức điểm danh.
          </p>
        </div>
      </div>

      <div
        className="dashboard-card"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-12)',
          padding: '22px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)'
        }}
      >
        {/* Summary StatCards */}
        <StatCard.Group columns={4}>
          <StatCard
            label="Tổng nhân sự"
            value={totalCount}
            icon="users"
            tone="neutral"
          />
          <StatCard
            label="Đã đồng bộ đến Camera"
            value={syncedCount}
            icon="circle-check"
            tone="success"
          />
          <StatCard
            label="Chưa đồng bộ đến Camera"
            value={unsyncedCount}
            icon="camera"
            tone="warning"
          />
          <StatCard
            label="Đã cấp thẻ RFID/NFC"
            value={activeCardCount}
            icon="id-badge"
            tone="info"
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)', alignItems: 'center' }}>
            <SearchField
              placeholder="Tìm theo tên, mã NV, CCCD..."
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              width={260}
            />

            <SelectField
              options={departmentFilterOptions}
              value={selectedDeptId}
              onChange={(val) => setSelectedDeptId(val)}
              width={175}
            />

            <SelectField
              options={faceIdFilterOptions}
              value={faceIdStatusFilter}
              onChange={(val) => setFaceIdStatusFilter(val)}
              width={195}
            />

            <SelectField
              options={cardFilterOptions}
              value={cardStatusFilter}
              onChange={(val) => setCardStatusFilter(val)}
              width={175}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon="rotate-right"
              onClick={() => setCameraSyncModalOpen(true)}
            >
              Đồng bộ dữ liệu đến Camera
              {unsyncedCount > 0 && (
                <span
                  style={{
                    marginLeft: '6px',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}
                >
                  {unsyncedCount}
                </span>
              )}
            </Button>
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
          rows={filteredEmployees}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => (
              <span>
                Hiển thị <b>{total === 0 ? 0 : range[0]} - {range[1]}</b> trên <b>{total}</b> cán bộ nhân sự
              </span>
            )
          }}
          emptyText={
            loading
              ? 'Đang tải danh sách nhân sự...'
              : 'Không tìm thấy cán bộ nhân viên nào phù hợp với bộ lọc.'
          }
          emptyIcon="users"
        />
      </div>

      {/* Modals / SideSheets */}
      <EmployeeModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        tenantId={tenantId}
        employeeToEdit={employeeToEdit}
        onSuccess={() => {
          loadData();
          toast.success(
            employeeToEdit
              ? `Đã cập nhật thông tin nhân sự "${employeeToEdit.fullName}" thành công.`
              : 'Đã thêm mới nhân sự thành công.'
          );
        }}
      />

      <ExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        tenantId={tenantId}
        onSuccess={() => {
          loadData();
          toast.success('Đã nạp danh sách nhân sự từ Excel thành công.');
        }}
      />

      <CardManagementModal
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        tenantId={tenantId}
        employee={employeeForCard}
        onSuccess={loadData}
      />

      <CameraSyncModal
        open={cameraSyncModalOpen}
        onClose={() => setCameraSyncModalOpen(false)}
        tenantId={tenantId}
        departments={departments}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Delete Employee Confirmation PopupModal */}
      {empToDelete && (
        <PopupModal
          open={!!empToDelete}
          icon="triangle-exclamation"
          title="Xác Nhận Xóa Hồ Sơ Nhân Sự"
          description={`Bạn có chắc chắn muốn xóa nhân sự "${empToDelete.fullName}" (${empToDelete.employeeCode}) khỏi hệ thống không?`}
          width={460}
          onClose={() => !isDeletingEmp && setEmpToDelete(null)}
          primaryAction={{
            label: isDeletingEmp ? 'Đang xóa...' : 'Xóa nhân sự',
            icon: 'trash',
            onClick: handleConfirmDeleteEmployee,
            disabled: isDeletingEmp
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            onClick: () => setEmpToDelete(null),
            disabled: isDeletingEmp
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)',
                fontSize: '13px',
                lineHeight: '20px',
                color: 'var(--text-body)'
              }}
            >
              <div><strong>Họ và tên:</strong> {empToDelete.fullName}</div>
              <div><strong>Mã cán bộ:</strong> <Tag variant="code">{empToDelete.employeeCode}</Tag></div>
              {empToDelete.position && <div style={{ marginTop: '2px' }}><strong>Chức vụ:</strong> {empToDelete.position}</div>}
              <div><strong>CCCD / ĐDCN:</strong> {empToDelete.identityNumber}</div>
            </div>

            <InlineNotice tone="warning">
              Hành động này sẽ hủy liên kết thẻ nhân viên và xóa dữ liệu nhận diện Face ID của cán bộ khỏi hệ thống điểm danh.
            </InlineNotice>
          </div>
        </PopupModal>
      )}
    </div>
  );
};
