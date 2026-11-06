import React from 'react';

export interface MeterProps {
  value: number;
  max?: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  text?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Meter: React.FC<MeterProps> = ({
  value,
  max = 100,
  tone = 'default',
  text,
  showLabel = true,
  label,
  className = '',
  style = {}
}) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const displayLabel = text !== undefined ? text : `${pct}%`;

  return (
    <div
      className={`ecomd-meter ${tone !== 'default' ? `ecomd-meter--${tone}` : ''} ${className}`}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      style={style}
    >
      <div className="ecomd-meter__track">
        <div className="ecomd-meter__fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="ecomd-meter__label body-xs">{displayLabel}</span>
      )}
    </div>
  );
};
