import React from 'react';
import { Icon, IconName } from './Icon';

export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: IconName;
  /** neutral (mặc định) · success · info · warning · purple. */
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'purple';
  className?: string;
  style?: React.CSSProperties;
}

interface StatCardComponent extends React.FC<StatCardProps> {
  Group: React.FC<{
    columns?: number;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export const StatCard: StatCardComponent = (({
  label,
  value,
  icon,
  tone = 'neutral',
  className = '',
  style
}: StatCardProps) => {
  const toneClass = tone !== 'neutral' ? `ecomd-stat--${tone}` : '';

  return (
    <div className={`ecomd-stat ${toneClass} ${className}`} style={style}>
      <div className="ecomd-stat__label body-xs-medium">{label}</div>
      <div className="ecomd-stat__value h3">
        <span>{value}</span>
        {icon && <Icon name={icon} size={16} className="ecomd-icon" />}
      </div>
    </div>
  );
}) as StatCardComponent;

StatCard.Group = ({ columns = 5, children, className = '', style }) => {
  return (
    <div
      className={`ecomd-stat-group ${className}`}
      style={{
        ...style,
        ...(columns ? ({ '--ecomd-cols': columns } as React.CSSProperties) : {})
      }}
    >
      {children}
    </div>
  );
};
