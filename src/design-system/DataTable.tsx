import React from 'react';
import { IconName } from './Icon';
import { Avatar } from './Avatar';
import { Checkbox } from './Checkbox';
import { IconButton } from './IconButton';
import { EmptyState } from './EmptyState';

export interface DataTableColumn<R = any> {
  key: string;
  title: React.ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  render?: (row: R, index: number) => React.ReactNode;
  actions?: boolean;
}

export interface DataTableProps<R = any> {
  columns: DataTableColumn<R>[];
  rows: R[];
  rowKey?: string | ((row: R) => string | number);
  selectable?: boolean;
  selected?: Array<string | number>;
  onSelect?: (keys: Array<string | number>) => void;
  rowLabel?: (row: R) => string;
  selectAllLabel?: string;
  footer?: React.ReactNode;
  emptyText?: React.ReactNode;
  emptyIcon?: IconName;
  empty?: React.ReactNode;
  hoverIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface DataTableComponent {
  <R = any>(props: DataTableProps<R>): JSX.Element;
  Person: React.FC<{
    name: string;
    meta?: React.ReactNode;
    avatar?: string;
    href?: string;
  }>;
  Tags: React.FC<{ children?: React.ReactNode }>;
  RowAction: React.FC<{
    icon?: IconName;
    label?: string;
    onClick?: (e: React.MouseEvent) => void;
  }>;
}

export const DataTable: DataTableComponent = (<R,>({
  columns,
  rows,
  rowKey,
  selectable = false,
  selected = [],
  onSelect,
  rowLabel,
  selectAllLabel = 'Chọn tất cả',
  footer,
  emptyText = 'Không có dữ liệu',
  emptyIcon,
  empty,
  hoverIndex,
  className = '',
  style
}: DataTableProps<R>): JSX.Element => {
  const getRowKey = (row: R, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(row);
    if (typeof rowKey === 'string' && (row as any)[rowKey] !== undefined) {
      return (row as any)[rowKey];
    }
    return (row as any).id ?? index;
  };

  const allKeys = rows.map((r, i) => getRowKey(r, i));
  const isAllSelected = rows.length > 0 && allKeys.every((k) => selected.includes(k));
  const isPartiallySelected =
    rows.length > 0 && !isAllSelected && allKeys.some((k) => selected.includes(k));

  const handleSelectAll = (checked: boolean) => {
    if (!onSelect) return;
    if (checked) {
      onSelect(allKeys);
    } else {
      onSelect([]);
    }
  };

  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (!onSelect) return;
    if (checked) {
      onSelect([...selected, key]);
    } else {
      onSelect(selected.filter((k) => k !== key));
    }
  };

  const totalCols = columns.length + (selectable ? 1 : 0);

  return (
    <div className={`ecomd-table-card ${className}`} style={style}>
      <div className="ecomd-table-scroll">
        <table className="ecomd-table">
          <thead>
            <tr>
              {selectable && (
                <th className="is-check">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                    aria-label={selectAllLabel}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`body-xs-bold ${col.align === 'right' ? 'is-right' : ''} ${
                    col.actions ? 'is-actions' : ''
                  } ${idx === 0 ? 'is-primary' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="ecomd-table__none">
                  {empty || (
                    <EmptyState
                      icon={emptyIcon || 'magnifying-glass'}
                      label={emptyText}
                    />
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
                const key = getRowKey(row, rIdx);
                const isSelected = selected.includes(key);
                const isHover = hoverIndex === rIdx;

                return (
                  <tr
                    key={key}
                    className={`${isSelected ? 'is-selected' : ''} ${
                      isHover ? 'is-hover' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="is-check">
                        <Checkbox
                          checked={isSelected}
                          aria-label={rowLabel ? rowLabel(row) : `Chọn hàng ${rIdx + 1}`}
                          onChange={(checked) => handleSelectRow(key, checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key}
                        className={`body-sm ${col.align === 'right' ? 'is-right' : ''} ${
                          col.actions ? 'is-actions' : ''
                        } ${cIdx === 0 ? 'is-primary' : ''}`}
                      >
                        <span className="ecomd-cell__label body-xs-medium" aria-hidden="true">
                          {col.title}
                        </span>
                        <div className="ecomd-cell__value">
                          {col.render
                            ? col.render(row, rIdx)
                            : (row as any)[col.key]}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="ecomd-table__footer body-xs">{footer}</div>}
    </div>
  );
}) as DataTableComponent;

DataTable.Person = ({ name, meta, avatar, href }) => {
  return (
    <div className="ecomd-person" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
      <Avatar src={avatar} name={name} size="md" />
      <div>
        {href ? (
          <a
            className="ecomd-person__name body-sm-medium"
            href={href}
            style={{ color: 'var(--text-heading)', textDecoration: 'none' }}
          >
            {name}
          </a>
        ) : (
          <div
            className="ecomd-person__name body-sm-medium"
            style={{ color: 'var(--text-heading)' }}
          >
            {name}
          </div>
        )}
        {meta && (
          <div
            className="ecomd-person__meta body-xs"
            style={{ color: 'var(--text-subtle)' }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
};

DataTable.Tags = ({ children }) => {
  return (
    <div
      className="ecomd-tags"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', maxWidth: '200px' }}
    >
      {children}
    </div>
  );
};

DataTable.RowAction = ({ icon = 'ellipsis-vertical', label = 'Thao tác', onClick }) => {
  return <IconButton icon={icon} label={label} size="sm" onClick={onClick} />;
};
