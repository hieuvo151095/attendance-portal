import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

export interface SelectOptionObject {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectOption = string | SelectOptionObject;

export interface SelectFieldProps {
  /** Danh sách lựa chọn, phần tử đầu thường là "Tất cả …" */
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, e?: any) => void;
  /** aria-label hoặc nhãn hiển thị; mặc định lấy nhãn lựa chọn đầu */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  state?: 'default' | 'focus';
  size?: 'sm' | 'md';
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder,
  disabled = false,
  state = 'default',
  size = 'md',
  width,
  className = '',
  style,
  id,
  name
}) => {
  const normalizedOptions: SelectOptionObject[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const initialVal =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : normalizedOptions[0]?.value ?? '';

  const [internalValue, setInternalValue] = useState<string>(initialVal);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  const defaultLabel = normalizedOptions[0]?.label || 'Lựa chọn';
  const ariaLabel = label || defaultLabel;

  const currentOption =
    normalizedOptions.find((opt) => opt.value === currentValue) ||
    normalizedOptions[0];

  const displayLabel = currentOption ? currentOption.label : placeholder || defaultLabel;

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectOption = (optValue: string, e?: React.MouseEvent) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalValue(optValue);
    }
    setIsOpen(false);

    if (selectRef.current) {
      selectRef.current.value = optValue;
    }

    if (onChange) {
      onChange(optValue, e);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    if (!isControlled) {
      setInternalValue(newVal);
    }
    if (onChange) {
      onChange(newVal, e);
    }
  };

  const selectStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width, minWidth: width, maxWidth: width } : {})
  };

  return (
    <div
      ref={containerRef}
      className={`ecomd-select-custom ${size === 'sm' ? 'ecomd-select-custom--sm' : ''} ${className}`}
      style={selectStyle}
    >
      {/* Hidden native select for accessibility, form submission, and test harnesses */}
      <select
        ref={selectRef}
        id={id}
        name={name}
        className="ecomd-select-custom__native"
        value={currentValue}
        onChange={handleNativeChange}
        disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Trigger Button */}
      <button
        type="button"
        className={`ecomd-select-custom__trigger ${isOpen ? 'is-open' : ''} ${
          state === 'focus' ? 'is-focus' : ''
        } ${disabled ? 'is-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={displayLabel}
      >
        <span className="ecomd-select-custom__label" title={displayLabel}>
          {displayLabel}
        </span>
        <span className="ecomd-select-custom__arrow">
          <Icon name="chevron-down" size={12} />
        </span>
      </button>

      {/* Custom Popover Options List */}
      {isOpen && (
        <div className="ecomd-select-custom__menu" role="listbox" aria-label={ariaLabel}>
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                className={`ecomd-select-custom__option ${isSelected ? 'is-selected' : ''} ${
                  opt.disabled ? 'is-disabled' : ''
                }`}
                onClick={(e) => handleSelectOption(opt.value, e)}
                title={opt.label}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="ecomd-select-custom__check">
                    <Icon name="circle-check" size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Dropdown is an alias of SelectField for semantic flexibility
export const Dropdown = SelectField;
