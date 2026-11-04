import React from 'react';
import { Icon, IconName } from './Icon';

export interface TextFieldProps {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  required?: boolean;
  prefixIcon?: IconName;
  suffix?: React.ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  autoComplete?: string;
  type?: string;
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  name,
  label,
  required = false,
  prefixIcon,
  suffix,
  placeholder,
  value,
  defaultValue,
  error,
  helper,
  disabled = false,
  autoComplete,
  type = 'text',
  onChange,
  onBlur,
  onKeyDown,
  className = '',
  style = {},
  'aria-label': ariaLabel
}) => {
  const inputId = id || (name ? `field-${name}` : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const inputClasses = [
    'ecomd-text-input',
    prefixIcon ? 'has-prefix' : '',
    suffix ? 'has-suffix' : '',
    error ? 'is-error' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`ecomd-field ${className}`} style={style}>
      {label && (
        <label htmlFor={inputId} className="ecomd-field__label">
          {label}
          {required && <span className="ecomd-field__required">*</span>}
        </label>
      )}
      <div className="ecomd-field__control">
        {prefixIcon && (
          <span className="ecomd-field__prefix-icon">
            <Icon name={prefixIcon} size={15} />
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={inputClasses}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helper
              ? `${inputId}-helper`
              : undefined
          }
          aria-label={label ? undefined : ariaLabel || placeholder}
        />
        {suffix}
      </div>
      {error && (
        <div id={`${inputId}-error`} className="ecomd-field__error" role="alert">
          {error}
        </div>
      )}
      {!error && helper && (
        <div id={`${inputId}-helper`} className="ecomd-field__helper">
          {helper}
        </div>
      )}
    </div>
  );
};
