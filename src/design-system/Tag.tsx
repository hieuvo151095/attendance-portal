import React from 'react';
import { Icon, IconName } from './Icon';

export interface TagProps {
  variant?: 'default' | 'code' | 'success' | 'warning';
  pill?: boolean;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  pill = false,
  label,
  children,
  className = '',
  style = {}
}) => {
  const typeClass =
    variant === 'code' ? 'code' : variant === 'default' ? 'body-xs' : 'body-xs-semibold';

  const classNames = [
    'ecomd-tag',
    `ecomd-tag--${variant}`,
    pill ? 'is-pill' : '',
    typeClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} style={style}>
      {children || label}
    </span>
  );
};

export interface StatusTagProps {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: React.ReactNode;
  children?: React.ReactNode;
  icon?: boolean | IconName;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_STATUS_ICONS: Record<string, string> = {
  success: 'circle-check',
  warning: 'triangle-exclamation',
  danger: 'circle-xmark',
  info: 'circle-info',
  neutral: 'circle-dot'
};

export const StatusTag: React.FC<StatusTagProps> = ({
  tone = 'neutral',
  label,
  children,
  icon,
  className = '',
  style = {}
}) => {
  let iconName: string | null = null;
  if (typeof icon === 'string') {
    iconName = icon;
  } else if (icon === true) {
    iconName = DEFAULT_STATUS_ICONS[tone] || 'circle-dot';
  }

  return (
    <span
      className={`ecomd-status ecomd-status--${tone} ecomd-status-tag ecomd-status-tag--${tone} body-xs-medium ${className}`}
      style={style}
    >
      {iconName && <Icon name={iconName} size={12} />}
      <span>{children || label}</span>
    </span>
  );
};
