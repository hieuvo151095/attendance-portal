import React from 'react';
import { Icon, IconName } from './Icon';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'text';
  active?: boolean;
  indicator?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  block?: boolean;
  disabled?: boolean;
  state?: 'default' | 'hover' | 'focus';
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  active = false,
  indicator = false,
  icon,
  iconPosition = 'left',
  block = false,
  disabled = false,
  state = 'default',
  href,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  children,
  className = '',
  style = {}
}) => {
  const typeClass =
    variant === 'primary'
      ? 'body-sm-semibold'
      : variant === 'text'
      ? 'body-xs-medium'
      : 'body-sm-medium';

  const classNames = [
    'ecomd-btn',
    `ecomd-btn--${variant}`,
    typeClass,
    variant === 'secondary' && active ? 'is-active' : '',
    block ? 'is-block' : '',
    state === 'hover' ? 'is-hover' : '',
    state === 'focus' ? 'is-focus' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = icon ? (
    <Icon key="btn-icon" name={icon} size={14} />
  ) : null;
  const isRight = iconPosition === 'right';

  const content = (
    <>
      {!isRight && iconElement}
      {children && <span key="btn-label">{children}</span>}
      {isRight && iconElement}
      {indicator && (
        <span key="btn-dot" className="ecomd-btn__dot" aria-hidden="true" />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a
        className={classNames}
        href={href}
        onClick={onClick}
        style={style}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={classNames}
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-pressed={
        variant === 'secondary' && active !== undefined ? !!active : undefined
      }
      onClick={onClick}
      style={style}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};
