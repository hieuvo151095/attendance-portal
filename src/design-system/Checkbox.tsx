import React, { useRef, useEffect } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  'aria-label'?: string;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  indeterminate,
  disabled = false,
  label,
  description,
  'aria-label': ariaLabel,
  onChange,
  className = '',
  style = {}
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked, e);
    }
  };

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    type: 'checkbox',
    className: 'ecomd-checkbox__box',
    disabled,
    'aria-label': label ? undefined : ariaLabel,
    onChange: handleChange
  };

  if (checked !== undefined) {
    inputProps.checked = checked;
    if (!onChange) inputProps.readOnly = true;
  } else if (defaultChecked !== undefined) {
    inputProps.defaultChecked = defaultChecked;
  }

  if (!label) {
    return (
      <input
        ref={ref}
        {...inputProps}
        className={`ecomd-checkbox__box ${className}`}
        style={style}
      />
    );
  }

  if (description) {
    return (
      <label
        className={`ecomd-checkbox ecomd-checkbox--desc ${
          disabled ? 'is-disabled' : ''
        } ${className}`}
        style={style}
      >
        <input ref={ref} {...inputProps} />
        <span className="ecomd-checkbox__text">
          <span className="ecomd-checkbox__label body-sm-medium">{label}</span>
          <span className="ecomd-checkbox__desc body-xs">{description}</span>
        </span>
      </label>
    );
  }

  return (
    <label
      className={`ecomd-checkbox body-sm ${
        disabled ? 'is-disabled' : ''
      } ${className}`}
      style={style}
    >
      <input ref={ref} {...inputProps} />
      <span>{label}</span>
    </label>
  );
};
