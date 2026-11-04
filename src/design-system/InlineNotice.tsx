import React from 'react';
import { Icon, IconName } from './Icon';

export interface InlineNoticeProps {
  tone?: 'info' | 'warning' | 'success' | 'danger';
  icon?: IconName;
  action?: React.ReactNode;
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_TONE_ICONS: Record<string, string> = {
  info: 'circle-info',
  warning: 'triangle-exclamation',
  success: 'circle-check',
  danger: 'circle-exclamation'
};

export const InlineNotice: React.FC<InlineNoticeProps> = ({
  tone = 'info',
  icon,
  action,
  label,
  children,
  className = '',
  style = {}
}) => {
  const iconName = icon || DEFAULT_TONE_ICONS[tone] || 'circle-info';
  const role = tone === 'danger' ? 'alert' : 'note';

  return (
    <div
      className={`ecomd-notice ecomd-notice--${tone} body-sm ${className}`}
      role={role}
      style={style}
    >
      <Icon name={iconName} size={14} />
      <div className="ecomd-notice__body">{children || label}</div>
      {action && <div className="ecomd-notice__action">{action}</div>}
    </div>
  );
};
