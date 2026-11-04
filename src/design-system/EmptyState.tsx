import React from 'react';
import { Icon, IconName } from './Icon';

export interface EmptyStateProps {
  /** Icon 30px màu border-strong; mặc định 'magnifying-glass'; false = không icon. */
  icon?: IconName | false;
  /** Một câu nói rõ không có gì: 'Không tìm thấy nhân sự nào phù hợp'. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'magnifying-glass',
  label,
  children,
  className = '',
  style
}) => {
  return (
    <div className={`ecomd-empty-state ${className}`} style={style}>
      {icon !== false && (
        <Icon
          name={icon}
          size={30}
          className="ecomd-empty-state__icon"
        />
      )}
      <span className="body-sm">{label || children}</span>
    </div>
  );
};
