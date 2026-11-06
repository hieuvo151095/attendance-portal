import React, { useState, useRef, useEffect, useId } from 'react';
import { Icon, Tag } from '../../design-system';

export interface SearchableComboboxOption {
  id: string;
  value: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: 'default' | 'success' | 'warning' | 'danger';
  icon?: string;
  code?: string;
}

export interface SearchableComboboxProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableComboboxOption[];
  disabled?: boolean;
  emptyText?: string;
  defaultIcon?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  id,
  label,
  required = false,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  emptyText = 'Không tìm thấy kết quả phù hợp. Bạn có thể sử dụng giá trị tùy chỉnh vừa nhập.',
  defaultIcon = 'magnifying-glass'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Close when clicking outside or pressing Escape
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

  const query = value.trim().toLowerCase();
  const filteredOptions = options.filter((opt) => {
    if (!query) return true;
    return (
      opt.title.toLowerCase().includes(query) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query)) ||
      (opt.code && opt.code.toLowerCase().includes(query)) ||
      opt.value.toLowerCase().includes(query)
    );
  });

  const handleSelect = (opt: SearchableComboboxOption) => {
    onChange(opt.value);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className="ecomd-field"
      style={{ position: 'relative', width: '100%' }}
    >
      <label htmlFor={id} className="ecomd-field__label">
        {label}
        {required && <span className="ecomd-field__required">*</span>}
      </label>

      <div className="ecomd-field__control" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="ecomd-text-input has-suffix"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          disabled={disabled}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '42px',
            minHeight: '42px',
            padding: 'var(--space-10) 38px var(--space-10) var(--space-16)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            lineHeight: '20px',
            border: `1px solid ${isOpen ? 'var(--eco-blue-strong)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-8)',
            backgroundColor: disabled ? 'var(--bg-muted)' : 'var(--bg-surface)',
            color: 'var(--text-heading)',
            boxShadow: isOpen ? '0 0 0 2px rgba(0, 112, 206, 0.2)' : 'none',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        />

        {/* Dropdown indicator button */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Mở gợi ý ${label}`}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }
          }}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon
            name="chevron-down"
            size={12}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease'
            }}
          />
        </button>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '260px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-8)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1050,
            padding: '4px 0',
            boxSizing: 'border-box'
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value || opt.title === value;
              return (
                <div
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--eco-blue-strong)' : '3px solid transparent',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: isSelected ? 'var(--eco-blue-subtle)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--eco-blue-strong)' : 'var(--text-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon name={opt.icon || defaultIcon} size={13} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        className="body-sm-bold"
                        style={{
                          color: isSelected ? 'var(--eco-blue-strong)' : 'var(--text-heading)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {opt.title}
                      </div>
                      {opt.subtitle && (
                        <div
                          className="body-xs"
                          style={{
                            color: 'var(--text-subtle)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {opt.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {opt.code && (
                    <Tag variant="code" style={{ flexShrink: 0 }}>
                      {opt.code}
                    </Tag>
                  )}

                  {opt.badge && (
                    <Tag
                      variant={opt.badgeTone === 'warning' ? 'warning' : opt.badgeTone === 'success' ? 'success' : 'default'}
                      style={{ flexShrink: 0 }}
                    >
                      {opt.badge}
                    </Tag>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '12px 16px',
                textAlign: 'center',
                color: 'var(--text-subtle)',
                fontSize: '12px'
              }}
            >
              {emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
