import React from 'react';
import { Icon, IconName } from './Icon';

export interface IconButtonProps {
  icon: IconName;
  label: string;
  size?: 'sm' | 'md';
  badge?: boolean;
  active?: boolean;
  disabled?: boolean;
  state?: 'default' | 'hover' | 'focus';
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'dialog';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'sm',
  badge = false,
  active = false,
  disabled = false,
  state = 'default',
  href,
  onClick,
  className = '',
  style = {},
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup
}) => {
  const classNames = [
    'ecomd-icon-btn',
    `ecomd-icon-btn--${size}`,
    active ? 'is-active' : '',
    state === 'hover' ? 'is-hover' : '',
    state === 'focus' ? 'is-focus' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <Icon name={icon} size={size === 'md' ? 16 : 14} />
      {badge && <span className="ecomd-icon-btn__dot" aria-hidden="true" />}
    </>
  );

  const commonProps = {
    className: classNames,
    'aria-label': label,
    title: label,
    onClick,
    style,
    'aria-pressed': active !== undefined ? active : undefined,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup
  };

  if (href && !disabled) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} {...commonProps}>
      {content}
    </button>
  );
};
