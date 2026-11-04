import React, { useState, useEffect } from 'react';
import {
  Button,
  InlineNotice,
  Card,
  Icon,
  Tag,
  PopupModal
} from '../../design-system';
import { departmentService } from '../../services/department';
import { authService } from '../../services/auth';
import { Department, DepartmentTreeNode } from '../../types/organization';
import { AuthSession } from '../../types/auth';
import { DepartmentTreeSelector } from './DepartmentTreeSelector';
import { DepartmentModal } from './DepartmentModal';

export interface DepartmentManagementProps {
  session?: AuthSession | null;
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

  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);

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
    <div className="department-management-view" style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="overline-xs" style={{ color: 'var(--eco-blue-strong)' }}>
              TỔ CHỨC & NHÂN SỰ
            </span>
            <Tag variant="default">{session.tenant.orgName}</Tag>
          </div>
          <h1 className="h3" style={{ margin: 0, color: 'var(--text-heading)' }}>
            Cơ Cấu Tổ Chức & Phòng Ban
          </h1>
          <p className="body-sm" style={{ color: 'var(--text-subtle)', margin: '4px 0 0' }}>
            Thiết lập mã định danh, cấp quản lý trực thuộc cha - con và người phụ trách phòng ban
          </p>
        </div>

        <Button
          variant="primary"
          icon="plus"
          onClick={handleOpenCreate}
        >
          Thêm phòng ban mới
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <InlineNotice
          tone="success"
          style={{ marginBottom: '16px' }}
        >
          {successMessage}
        </InlineNotice>
      )}

      {errorMessage && (
        <InlineNotice
          tone="danger"
          style={{ marginBottom: '16px' }}
        >
          {errorMessage}
        </InlineNotice>
      )}

      {/* Thống kê nhanh */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <Icon name="layer-group" size={18} color="var(--eco-blue-strong)" />
          </div>
          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tổng số phòng ban / bộ phận</div>
            <div className="h4" style={{ margin: 0, color: 'var(--text-heading)' }}>
              {departments.length}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconBox}>
            <Icon name="users" size={18} color="var(--semantic-success)" />
          </div>
          <div>
            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tổng nhân sự trực thuộc</div>
            <div className="h4" style={{ margin: 0, color: 'var(--text-heading)' }}>
              {totalEmployees}
            </div>
          </div>
        </div>
      </div>

      {/* Cây phòng ban */}
      <Card
        title="Sơ Đồ Phân Cấp Phòng Ban"
        description="Mỗi phòng ban có mã định danh duy nhất dùng để lọc báo cáo và triệu tập đại biểu họp"
      >
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <span className="body-sm" style={{ color: 'var(--text-subtle)' }}>
              Đang tải danh sách cơ cấu phòng ban...
            </span>
          </div>
        ) : (
          <DepartmentTreeSelector
            nodes={treeNodes}
            onAddSubDepartment={handleAddSub}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

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

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 16px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-8)'
  },
  statIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-8)',
    backgroundColor: 'var(--bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }
};
