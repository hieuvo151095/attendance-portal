import React from 'react';

export interface EmptyValueProps {
  /** Viết 'Chưa …': 'Chưa chủ nhiệm', 'Chưa phân công'. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  /** In nghiêng khi thiếu dữ liệu định danh: 'Chưa có mã nhân viên'. */
  italic?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyValue: React.FC<EmptyValueProps> = ({
  label,
  children,
  italic = false,
  className = '',
  style
}) => {
  return (
    <span
      className={`ecomd-empty ${italic ? 'is-italic' : ''} ${className}`}
      style={style}
    >
      {label || children}
    </span>
  );
};
