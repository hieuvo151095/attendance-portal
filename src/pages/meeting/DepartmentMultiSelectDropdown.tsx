import React, { useState, useRef, useEffect } from 'react';
import { Icon, Tag } from '../../design-system';
import { Department } from '../../types/organization';
import { Employee } from '../../types/employee';
import { AttendeeRole } from '../../types/meeting';

export interface DepartmentMultiSelectDropdownProps {
  departments: Department[];
  employees: Employee[];
  selectedAttendees: Map<string, { selected: boolean; role: AttendeeRole }>;
  onToggleDepartment: (deptId: string) => void;
  onSelectAllDepartments: () => void;
  onClearAllDepartments: () => void;
  disabled?: boolean;
}

export const DepartmentMultiSelectDropdown: React.FC<DepartmentMultiSelectDropdownProps> = ({
  departments,
  employees,
  selectedAttendees,
  onToggleDepartment,
  onSelectAllDepartments,
  onClearAllDepartments,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Determine which departments have all members selected
  const fullySelectedDepts = departments.filter((dept) => {
    const deptEmps = employees.filter((e) => e.departmentId === dept.id);
    return deptEmps.length > 0 && deptEmps.every((e) => selectedAttendees.get(e.id)?.selected);
  });

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <label
        htmlFor="quick-dept-select-trigger"
        className="body-xs-bold"
        style={{
          display: 'block',
          marginBottom: 'var(--space-6)',
          color: 'var(--text-subtle)'
        }}
      >
        Chọn nhanh theo phòng ban:
      </label>

      {/* The Single Field (Click to show dropdown) */}
      <div
        id="quick-dept-select-trigger"
        data-testid="dept-multiselect-trigger"
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Chọn nhanh theo phòng ban"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          minHeight: '40px',
          padding: '6px 12px',
          border: `1px solid ${isOpen ? 'var(--eco-blue-strong)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-8)',
          backgroundColor: disabled ? 'var(--bg-muted)' : 'var(--bg-surface)',
          boxShadow: isOpen ? '0 0 0 3px var(--eco-blue-subtle)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Selected department chips or placeholder */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
            flex: 1,
            minWidth: 0
          }}
        >
          {fullySelectedDepts.length === 0 ? (
            <span className="body-sm" style={{ color: 'var(--text-disabled)' }}>
              Nhấp để chọn một hoặc nhiều phòng ban...
            </span>
          ) : (
            fullySelectedDepts.map((dept) => {
              const count = employees.filter((e) => e.departmentId === dept.id).length;
              return (
                <span
                  key={dept.id}
                  className="body-xs-medium"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--eco-blue-subtle)',
                    color: 'var(--eco-blue-strong)',
                    borderRadius: 'var(--radius-6)',
                    border: '1px solid var(--border-subtle)',
                    userSelect: 'none'
                  }}
                >
                  <span>{dept.name} ({count})</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Bỏ chọn ${dept.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDepartment(dept.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onToggleDepartment(dept.id);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  >
                    ✕
                  </span>
                </span>
              );
            })
          )}
        </div>

        {/* Right: Clear all button & Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {fullySelectedDepts.length > 0 && (
            <button
              type="button"
              aria-label="Xóa tất cả phòng ban đã chọn"
              title="Bỏ chọn tất cả"
              onClick={(e) => {
                e.stopPropagation();
                onClearAllDepartments();
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
          <Icon
            name="chevron-down"
            size={14}
            style={{
              color: 'var(--text-subtle)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease'
            }}
          />
        </div>
      </div>

      {/* Multi-Select Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-8)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1050,
            boxSizing: 'border-box'
          }}
        >
          {/* Header with Quick Actions */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-subtle)'
            }}
          >
            <span
              className="caption-bold"
              style={{ color: 'var(--text-subtle)', textTransform: 'uppercase' }}
            >
              Danh sách phòng ban ({departments.length})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="body-xs-semibold"
                onClick={onSelectAllDepartments}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--eco-blue-strong)',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                Chọn tất cả
              </button>
              <span style={{ color: 'var(--border-default)' }}>|</span>
              <button
                type="button"
                className="body-xs"
                onClick={onClearAllDepartments}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>

          {/* Department Items */}
          <div style={{ padding: '4px 0' }}>
            {departments.map((dept) => {
              const deptEmps = employees.filter((e) => e.departmentId === dept.id);
              const isAllSelected =
                deptEmps.length > 0 &&
                deptEmps.every((e) => selectedAttendees.get(e.id)?.selected);
              const isPartiallySelected =
                !isAllSelected &&
                deptEmps.some((e) => selectedAttendees.get(e.id)?.selected);

              return (
                <button
                  key={dept.id}
                  type="button"
                  role="button"
                  aria-pressed={isAllSelected}
                  onClick={() => onToggleDepartment(dept.id)}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background: isAllSelected ? 'var(--bg-selected)' : 'transparent',
                    color: isAllSelected ? 'var(--eco-blue-strong)' : 'var(--text-body)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAllSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAllSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Custom Checkbox indicator */}
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: 'var(--radius-4)',
                        border: `1.5px solid ${
                          isAllSelected
                            ? 'var(--eco-blue-strong)'
                            : isPartiallySelected
                            ? 'var(--eco-blue-strong)'
                            : 'var(--border-default)'
                        }`,
                        backgroundColor: isAllSelected
                          ? 'var(--eco-blue-strong)'
                          : isPartiallySelected
                          ? 'var(--eco-blue-subtle)'
                          : 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAllSelected ? '#fff' : 'var(--eco-blue-strong)',
                        fontSize: '10px',
                        flexShrink: 0
                      }}
                    >
                      {isAllSelected ? (
                        <Icon name="check" size={10} />
                      ) : isPartiallySelected ? (
                        <span style={{ fontWeight: 'bold', lineHeight: 1 }}>-</span>
                      ) : null}
                    </div>

                    <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                      {dept.name}
                    </span>
                  </div>

                  <Tag variant={isAllSelected ? 'success' : 'default'}>
                    {deptEmps.length} nhân sự
                  </Tag>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
