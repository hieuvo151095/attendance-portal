import React, { useState } from 'react';
import {
  Icon,
  Tag,
  IconButton,
  SearchField,
  DropdownMenu
} from '../../design-system';
import { DepartmentTreeNode, Department } from '../../types/organization';

export interface DepartmentTreeSelectorProps {
  nodes: DepartmentTreeNode[];
  selectedId?: string | null;
  onSelect?: (department: Department) => void;
  onAddSubDepartment?: (parentDepartment: Department) => void;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
}

export const DepartmentTreeSelector: React.FC<DepartmentTreeSelectorProps> = ({
  nodes,
  selectedId,
  onSelect,
  onAddSubDepartment,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterTree = (list: DepartmentTreeNode[]): DepartmentTreeNode[] => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();

    return list.reduce<DepartmentTreeNode[]>((acc, node) => {
      const matchSelf =
        node.name.toLowerCase().includes(term) ||
        node.code.toLowerCase().includes(term) ||
        (node.managerName && node.managerName.toLowerCase().includes(term));

      const filteredChildren = filterTree(node.children);

      if (matchSelf || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        });
      }
      return acc;
    }, []);
  };

  const filteredNodes = filterTree(nodes);

  const renderNode = (node: DepartmentTreeNode) => {
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="dept-node-wrapper" style={{ marginBottom: '6px' }}>
        <div
          className={`dept-item-row ${isSelected ? 'is-selected' : ''}`}
          style={{
            ...styles.nodeRow,
            paddingLeft: `${12 + node.level * 24}px`,
            backgroundColor: isSelected ? 'var(--semantic-info-soft)' : 'var(--bg-surface)',
            borderColor: isSelected ? 'var(--eco-blue-strong)' : 'var(--border-default)'
          }}
        >
          {/* Icon nhánh cây */}
          <div style={styles.iconCol}>
            <Icon
              name={hasChildren ? 'layer-group' : 'building'}
              size={15}
              color={isSelected ? 'var(--eco-blue-strong)' : 'var(--text-subtle)'}
            />
          </div>

          {/* Thông tin phòng ban */}
          <div
            style={styles.infoCol}
            onClick={() => onSelect && onSelect(node)}
            role="button"
            tabIndex={0}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                {node.name}
              </span>
              <Tag variant="code">{node.code}</Tag>
              {node.employeeCount > 0 ? (
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  ({node.employeeCount} nhân sự)
                </span>
              ) : (
                <span className="body-xs" style={{ color: 'var(--text-muted)' }}>
                  (Chưa có nhân sự)
                </span>
              )}
            </div>

            {node.managerName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Icon name="user-tie" size={11} color="var(--text-muted)" />
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Phụ trách: <strong>{node.managerName}</strong>
                </span>
                {node.managerPhone && (
                  <span className="body-xs" style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                    ({node.managerPhone})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={styles.actionsCol}>
            <DropdownMenu
              align="right"
              trigger={
                <IconButton
                  icon="ellipsis-vertical"
                  size="sm"
                  label="Thao tác"
                />
              }
              items={[
                ...(onAddSubDepartment
                  ? [
                      {
                        icon: 'plus' as const,
                        label: 'Thêm phòng ban con',
                        onClick: () => onAddSubDepartment(node)
                      }
                    ]
                  : []),
                ...(onEdit
                  ? [
                      {
                        icon: 'pen' as const,
                        label: 'Chỉnh sửa phòng ban',
                        onClick: () => onEdit(node)
                      }
                    ]
                  : []),
                { divider: true as const },
                ...(onDelete
                  ? [
                      {
                        icon: 'trash' as const,
                        label: 'Xóa phòng ban',
                        tone: 'danger' as const,
                        onClick: () => onDelete(node)
                      }
                    ]
                  : [])
              ]}
            />
          </div>
        </div>

        {/* Children nodes */}
        {hasChildren && (
          <div className="dept-children-container">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dept-tree-container" style={{ width: '100%' }}>
      {/* Thanh tìm kiếm */}
      <div style={{ marginBottom: '14px' }}>
        <SearchField
          placeholder="Tìm phòng ban theo tên, mã định danh, người phụ trách..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          block
        />
      </div>

      {/* Danh sách cây phòng ban */}
      {filteredNodes.length > 0 ? (
        <div style={styles.treeList}>
          {filteredNodes.map((rootNode) => renderNode(rootNode))}
        </div>
      ) : (
        <div style={styles.emptyBox}>
          <Icon name="building" size={28} color="var(--border-strong)" />
          <p className="body-sm" style={{ color: 'var(--text-subtle)', margin: '8px 0 0' }}>
            {searchTerm
              ? `Không tìm thấy phòng ban nào khớp với từ khóa "${searchTerm}"`
              : 'Chưa có phòng ban nào được thiết lập'}
          </p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  treeList: {
    display: 'flex',
    flexDirection: 'column'
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-8)',
    border: '1px solid var(--border-default)',
    transition: 'all 0.15s ease'
  },
  iconCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    flexShrink: 0
  },
  infoCol: {
    flex: 1,
    cursor: 'pointer',
    minWidth: 0
  },
  actionsCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0
  },
  emptyBox: {
    padding: '36px 16px',
    textAlign: 'center',
    border: '1px dashed var(--border-strong)',
    borderRadius: 'var(--radius-8)',
    backgroundColor: 'var(--bg-canvas)'
  }
};
