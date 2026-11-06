import React from 'react';
import { Icon, IconName } from './Icon';

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: IconName;
  badge?: React.ReactNode;
  count?: number;
}

export interface SidebarNavProps {
  brand?: {
    name: string;
    icon?: IconName;
    subtitle?: string;
  };
  context?: {
    orgName: string;
    username: string;
  };
  items: SidebarNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  onLogout?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  brand = { name: 'Finviet Attendance', icon: 'fingerprint' },
  items,
  activeKey,
  onSelect,
  collapsed = false,
  onToggleCollapse,
  className = '',
  style = {}
}) => {
  return (
    <aside
      className={`ecomd-sidebar ${collapsed ? 'is-collapsed' : ''} ${className}`}
      style={style}
      aria-label="Thanh điều hướng chính"
    >
      {/* Brand Header */}
      <div className="ecomd-sidebar__top">
        <div className="ecomd-sidebar__brand" title={brand.name}>
          <div className="ecomd-sidebar__logo">
            <Icon name={brand.icon || 'fingerprint'} size={18} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <span className="ecomd-sidebar__name title-md" style={{ fontSize: '15px' }}>
                {brand.name}
              </span>
              {brand.subtitle && (
                <span className="body-xs" style={{ color: 'var(--text-subtle)', lineHeight: 1.2 }}>
                  {brand.subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="ecomd-sidebar__scroll" aria-label="Menu chức năng">
        <div className="ecomd-sidebar__group">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                className={`ecomd-nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelect(item.key)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  background: isActive ? 'var(--bg-selected)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <Icon name={item.icon} size={16} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.count !== undefined && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? 'var(--eco-blue-strong)' : 'var(--bg-muted)',
                      color: isActive ? '#fff' : 'var(--text-subtle)'
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer with collapse toggle (Logout is moved to the top info bar) */}
      <div className="ecomd-sidebar__footer">
        {onToggleCollapse && (
          <button
            type="button"
            className="ecomd-sidebar__toggle"
            onClick={() => onToggleCollapse(!collapsed)}
            aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <Icon name={collapsed ? 'bars' : 'chevron-down'} size={16} style={{ transform: collapsed ? 'none' : 'rotate(90deg)' }} />
            {!collapsed && <span className="body-xs-medium">Thu gọn menu</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
