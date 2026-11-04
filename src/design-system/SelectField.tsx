import React from 'react';
import { Icon } from './Icon';

export interface SelectOptionObject {
  value: string;
  label: string;
}

export type SelectOption = string | SelectOptionObject;

export interface SelectFieldProps {
  /** Lựa chọn đầu tiên là mặc định "Tất cả …". */
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** aria-label; mặc định = nhãn lựa chọn đầu. */
  label?: string;
  disabled?: boolean;
  state?: 'default' | 'focus';
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  label,
  disabled = false,
  state = 'default',
  className = '',
  style,
  id
}) => {
  const normalizedOptions: SelectOptionObject[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const defaultLabel = normalizedOptions[0]?.label || 'Lựa chọn';
  const ariaLabel = label || defaultLabel;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const selectClasses = [
    'ecomd-select',
    'body-sm-medium',
    state === 'focus' ? 'is-focus' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`ecomd-select-wrap ${className}`} style={style}>
      <select
        id={id}
        className={selectClasses}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={12} className="ecomd-icon" />
    </div>
  );
};
