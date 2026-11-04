import React from 'react';
import { Icon } from './Icon';

export interface SearchFieldProps {
  size?: 'md' | 'sm';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  block?: boolean;
  state?: 'default' | 'focus';
  className?: string;
  style?: React.CSSProperties;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  size = 'md',
  placeholder = 'Tìm kiếm...',
  value,
  defaultValue,
  onChange,
  label,
  block = false,
  state = 'default',
  className = '',
  style = {}
}) => {
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    className: `ecomd-input ${size === 'md' ? 'body-sm' : 'body-xs'} ${
      state === 'focus' ? 'is-focus' : ''
    }`,
    type: 'search',
    placeholder,
    'aria-label': label || placeholder,
    onChange: onChange ? (e) => onChange(e.target.value, e) : undefined
  };

  if (value !== undefined) {
    inputProps.value = value;
    if (!onChange) inputProps.readOnly = true;
  } else if (defaultValue !== undefined) {
    inputProps.defaultValue = defaultValue;
  }

  return (
    <label
      className={`ecomd-search ecomd-search--${size} ${
        block ? 'is-block' : ''
      } ${className}`}
      style={style}
    >
      <Icon name="magnifying-glass" size={14} className="ecomd-search__icon" />
      <input {...inputProps} />
    </label>
  );
};
