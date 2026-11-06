import React, { useState, useEffect } from 'react';
import {
  Button,
  InlineNotice,
  Icon,
  Tag,
  PopupModal,
  DataTable,
  DataTableColumn,
  SearchField,
  StatCard,
  EmptyValue
} from '../../design-system';
import { departmentService } from '../../services/department';
import { authService } from '../../services/auth';
import { Department, DepartmentTreeNode } from '../../types/organization';
import { AuthSession } from '../../types/auth';
import { DepartmentModal } from './DepartmentModal';

export interface DepartmentManagementProps {
  session?: AuthSession | null;
}

export interface DepartmentRow extends Department {
  level: number;
  hasChildren?: boolean;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ session: propsSession }) => {
  const [session, setSession] = useState<AuthSession | null>(
    propsSession || authService.getCurrentSession()
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [treeNodes, setTreeNodes] = useState<DepartmentTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [parentDeptHint, setParentDeptHint] = useState<Department | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<Department | null>(null);

  useEffect(() => {
    if (!session) {
      const cur = authService.getCurrentSession();
      if (cur) setSession(cur);
    }
  }, [propsSession, session]);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const [list, tree] = await Promise.all([
        departmentService.getDepartmentsByTenant(session.tenant.id),
        departmentService.getDepartmentTree(session.tenant.id)
      ]);
      setDepartments(list);
      setTreeNodes(tree);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách phòng ban';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setParentDeptHint(null);
    setModalOpen(true);
  };

  const handleAddSub = (parentDept: Department) => {
    setEditingDept(null);
    setParentDeptHint(parentDept);
    setModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setParentDeptHint(null);
    setModalOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setDeleteConfirmDept(dept);
  };

  const handleConfirmDelete = async () => {
    if (!session || !deleteConfirmDept) return;
    try {
      await departmentService.deleteDepartment(session.tenant.id, deleteConfirmDept.id);
      setDeleteConfirmDept(null);
      setSuccessMessage(`Đã xóa phòng ban "${deleteConfirmDept.name}" thành công`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi xóa phòng ban';
      setErrorMessage(msg);
    }
  };

  // Flatten hierarchical tree nodes preserving preorder traversal
  const flattenTree = (
    nodes: DepartmentTreeNode[],
    term: string
  ): DepartmentRow[] => {
    const dfs = (treeList: DepartmentTreeNode[], level: number): DepartmentRow[] => {
      let rows: DepartmentRow[] = [];
      for (const node of treeList) {
        rows.push({
          ...node,
          level,
          hasChildren: Boolean(node.children && node.children.length > 0)
        });
        if (node.children && node.children.length > 0) {
          rows = rows.concat(dfs(node.children, level + 1));
        }
      }
      return rows;
    };

    let flat = dfs(nodes, 0);

    const normalizedTerm = term.trim().toLowerCase();
    if (normalizedTerm) {
      flat = flat.filter((d) => {
        const matchName = d.name.toLowerCase().includes(normalizedTerm);
        const matchCode = d.code.toLowerCase().includes(normalizedTerm);
        const matchManager = d.managerName && d.managerName.toLowerCase().includes(normalizedTerm);
        const matchPhone = d.managerPhone && d.managerPhone.includes(normalizedTerm);
        return matchName || matchCode || matchManager || matchPhone;
      });
    }

    return flat;
  };

  const filteredRows = flattenTree(treeNodes, searchTerm);
  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);
  // Only count the main (root) departments, not subs
  const mainDepartmentsCount = departments.filter((d) => !d.parentId).length;

  // Redesigned Columns matching user requirements:
  // 1. Tên phòng ban + Mã phòng ban
  // 2. Người phụ trách + Số điện thoại
  // 3. Số nhân sự (guaranteed spacing between number and text)
  // 4. Thao tác (three-dots icon dropdown with NO standalone "+ Thêm con" button)
  const columns: DataTableColumn<DepartmentRow>[] = [
    {
      key: 'name_and_code',
      title: 'Tên phòng ban & Mã định danh',
      render: (dept: DepartmentRow) => {
        const isSub = dept.level > 0;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              paddingLeft: isSub ? `${dept.level * 24}px` : '0px'
            }}
          >
            {isSub ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-subtle)',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '13px', marginRight: '4px', opacity: 0.6 }}>└─</span>
                <Icon name="layer-group" size={13} color="var(--text-subtle)" />
              </div>
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-6)',
                  backgroundColor: 'var(--eco-blue-subtle)',
                  color: 'var(--eco-blue-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon name="building" size={14} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
              <span
                className="body-sm-semibold"
                style={{ color: 'var(--text-heading)' }}
              >
                {dept.name}
              </span>
              <Tag variant="code">{dept.code}</Tag>
            </div>
          </div>
        );
      }
    },
    {
      key: 'manager_and_phone',
      title: 'Người phụ trách & Số điện thoại',
      render: (dept: DepartmentRow) => {
        if (!dept.managerName) {
          return <EmptyValue label="Chưa bổ nhiệm" />;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="user-tie" size={13} color="var(--text-subtle)" />
              <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                {dept.managerName}
              </span>
            </div>
            {dept.managerPhone ? (
              <span className="body-xs" style={{ color: 'var(--text-subtle)', paddingLeft: '19px' }}>
                {dept.managerPhone}
              </span>
            ) : (
              <span className="body-xs" style={{ color: 'var(--text-muted)', paddingLeft: '19px' }}>
                Chưa có SĐT
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'employeeCount',
      title: 'Số nhân sự',
      width: '140px',
      render: (dept: DepartmentRow) => {
        const count = dept.employeeCount || 0;
        if (count > 0) {
          return (
            <Tag variant="default">
              {`${count} nhân sự`}
            </Tag>
          );
        }
        return <EmptyValue label="0 nhân sự" />;
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right' as const,
      actions: true,
      width: '90px',
      render: (dept: DepartmentRow) => (
        <DataTable.RowAction
          label="Thao tác"
          items={[
            {
              icon: 'plus',
              label: 'Thêm phòng ban con',
              onClick: () => handleAddSub(dept)
            },
            {
              icon: 'pen',
              label: 'Chỉnh sửa phòng ban',
              onClick: () => handleEdit(dept)
            },
            {
              divider: true
            },
            {
              icon: 'trash',
              label: 'Xóa phòng ban',
              tone: 'danger',
              onClick: () => handleDelete(dept)
            }
          ]}
        />
      )
    }
  ];

  if (!session) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <InlineNotice tone="warning">
          Vui lòng đăng nhập để quản lý cơ cấu tổ chức và phòng ban của cơ quan đơn vị.
        </InlineNotice>
      </div>
    );
  }

  return (
    <div
      className="department-management-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Page Header (OUTSIDE all sections) */}
      <div
        data-testid="department-page-header"
        style={{
          padding: '4px 0 16px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Cơ Cấu Tổ Chức & Phòng Ban
          </h1>
          <p className="body-sm" style={{ color: 'var(--text-subtle)', margin: 'var(--space-4) 0 0' }}>
            Thiết lập mã định danh, cấp quản lý trực thuộc cha - con và người phụ trách phòng ban
          </p>
        </div>
      </div>

      {/* Main Body Card */}
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
        {/* Notifications */}
        {successMessage && (
          <InlineNotice
            tone="success"
            style={{ marginBottom: '8px' }}
          >
            {successMessage}
          </InlineNotice>
        )}

        {errorMessage && (
          <InlineNotice
            tone="danger"
            style={{ marginBottom: '8px' }}
          >
            {errorMessage}
          </InlineNotice>
        )}

        {/* Quick Stat Cards: Only 2 cards, main departments only */}
        <StatCard.Group columns={2}>
          <StatCard
            label="Tổng số phòng ban"
            value={mainDepartmentsCount}
            icon="layer-group"
            tone="neutral"
          />
          <StatCard
            label="Tổng nhân sự trực thuộc"
            value={totalEmployees}
            icon="users"
            tone="success"
          />
        </StatCard.Group>

        {/* Search & Action Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-12)',
            flexWrap: 'wrap'
          }}
        >
          <SearchField
            placeholder="Tìm phòng ban theo tên, mã định danh, người phụ trách..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            width={360}
          />

          <Button
            variant="primary"
            icon="plus"
            onClick={handleOpenCreate}
          >
            Thêm phòng ban mới
          </Button>
        </div>

        {/* Redesigned Department DataTable */}
        <DataTable
          columns={columns}
          rows={filteredRows}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => (
              <span>
                Hiển thị <b>{total === 0 ? 0 : range[0]} - {range[1]}</b> trên <b>{total}</b> phòng ban / bộ phận
              </span>
            )
          }}
          emptyText={
            loading
              ? 'Đang tải danh sách cơ cấu phòng ban...'
              : 'Không tìm thấy phòng ban nào phù hợp với từ khóa tìm kiếm.'
          }
          emptyIcon="building"
        />
      </div>

      {/* Modal Thêm / Sửa phòng ban */}
      {modalOpen && (
        <DepartmentModal
          open={modalOpen}
          tenantId={session.tenant.id}
          department={editingDept}
          parentDepartment={parentDeptHint}
          availableParents={departments}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            setSuccessMessage(
              editingDept
                ? `Đã cập nhật phòng ban "${editingDept.name}" thành công`
                : 'Đã tạo mới phòng ban thành công'
            );
            loadData();
          }}
        />
      )}

      {/* Modal Xác nhận Xóa phòng ban */}
      {deleteConfirmDept && (
        <PopupModal
          open={!!deleteConfirmDept}
          icon="triangle-exclamation"
          title="Xác Nhận Xóa Phòng Ban"
          description={`Bạn có chắc chắn muốn xóa phòng ban "${deleteConfirmDept.name}" (${deleteConfirmDept.code}) không?`}
          width={440}
          onClose={() => setDeleteConfirmDept(null)}
          primaryAction={{
            label: 'Xóa phòng ban',
            onClick: handleConfirmDelete,
            icon: 'trash'
          }}
          secondaryAction={{
            label: 'Hủy bỏ',
            onClick: () => setDeleteConfirmDept(null)
          }}
        >
          <InlineNotice tone="warning">
            Các phòng ban con trực thuộc (nếu có) sẽ được chuyển lên cấp quản lý của phòng ban này.
          </InlineNotice>
        </PopupModal>
      )}
    </div>
  );
};
