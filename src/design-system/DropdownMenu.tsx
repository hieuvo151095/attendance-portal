import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon, IconName } from './Icon';

export interface DropdownMenuItem {
  icon?: IconName;
  label: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  divider?: false;
}

export interface DropdownMenuDivider {
  divider: true;
}

export type DropdownMenuItemOrDivider = DropdownMenuItem | DropdownMenuDivider;

export interface DropdownMenuProps {
  items: DropdownMenuItemOrDivider[];
  trigger?: React.ReactElement<any>;
  align?: 'left' | 'right';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  align = 'right',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className = '',
  style = {}
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    openUpwards?: boolean;
  }>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback((val: boolean) => {
    if (!isControlled) {
      setInternalOpen(val);
    }
    if (onOpenChange) {
      onOpenChange(val);
    }
  }, [isControlled, onOpenChange]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 230; // Tiêu chuẩn độ rộng menu
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    // Nếu phía dưới còn ít hơn 220px và phía trên rộng hơn, mở hướng lên trên
    const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow;

    let top: number | undefined;
    let bottom: number | undefined;
    let left: number | undefined;
    let right: number | undefined;

    if (openUpwards) {
      bottom = Math.max(8, vh - rect.top + 4);
    } else {
      top = Math.max(8, rect.bottom + 4);
    }

    if (align === 'left') {
      left = Math.max(8, Math.min(rect.left, vw - menuWidth - 8));
    } else {
      right = Math.max(8, vw - rect.right);
    }

    setCoords({ top, bottom, left, right, openUpwards });
  }, [align]);

  // Khi mở menu, cập nhật vị trí tọa độ ngay lập tức
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Lắng nghe sự kiện click ra ngoài, phím Escape, cuộn trang và đổi kích thước màn hình
  useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Nếu sự kiện cuộn xảy ra bên trong chính menu thì bỏ qua
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, setOpen, updatePosition]);

  const renderedItems = items.map((it, idx) => {
    if ('divider' in it && it.divider) {
      return <div key={idx} className="ecomd-menu__divider" role="separator" />;
    }

    const item = it as DropdownMenuItem;
    const isDanger = item.tone === 'danger';

    const handleClick = (e: React.MouseEvent) => {
      if (item.disabled) return;
      if (item.onClick) item.onClick(e);
      setOpen(false);
    };

    const content = (
      <>
        {item.icon && <Icon name={item.icon} size={14} />}
        <span>{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <a
          key={idx}
          href={item.href}
          role="menuitem"
          className={`ecomd-menu__item body-xs-medium ${isDanger ? 'is-danger' : ''}`}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={idx}
        type="button"
        role="menuitem"
        className={`ecomd-menu__item body-xs-medium ${isDanger ? 'is-danger' : ''}`}
        disabled={item.disabled}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  });

  const menuPanel = (
    <div
      ref={trigger ? menuRef : undefined}
      className={`ecomd-menu ${trigger ? 'is-floating' : ''} ${
        coords.openUpwards ? 'is-upwards' : ''
      } ${align === 'left' ? 'is-left' : 'is-right'} ${!trigger ? className : ''}`}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={
        trigger
          ? {
              position: 'fixed',
              zIndex: 99999, // Đảm bảo luôn nằm ở lớp cao nhất (top layer), không bị bảng hay footer che khuất
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              margin: 0,
              minWidth: '220px',
              boxShadow: 'var(--shadow-xl)',
              ...style
            }
          : style
      }
    >
      {renderedItems}
    </div>
  );

  if (!trigger) return menuPanel;

  const clonedTrigger = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (trigger.props.onClick) trigger.props.onClick(e);

      if (!isOpen) {
        updatePosition();
        setOpen(true);
      } else {
        setOpen(false);
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen
  });

  return (
    <div ref={triggerRef} className={`ecomd-menu-wrap ${className}`} style={{ display: 'inline-block' }}>
      {clonedTrigger}
      {isOpen && typeof document !== 'undefined'
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
};
