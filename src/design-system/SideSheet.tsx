import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon, IconName } from './Icon';
import { IconButton } from './IconButton';
import { Button } from './Button';

export interface SideSheetAction {
  label: React.ReactNode;
  icon?: IconName;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export interface SideSheetProps {
  open?: boolean;
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose?: ((e?: React.MouseEvent | React.KeyboardEvent) => void) | false;
  primaryAction?: SideSheetAction;
  secondaryAction?: SideSheetAction | null;
  extraAction?: SideSheetAction;
  footer?: React.ReactNode;
  width?: number | string;
  closeOnOverlay?: boolean;
  fixed?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

let sheetCounter = 0;

export const SideSheet: React.FC<SideSheetProps> & {
  Section: React.FC<{ label?: React.ReactNode; children?: React.ReactNode; className?: string; style?: React.CSSProperties }>;
} = ({
  open = true,
  icon,
  title,
  description,
  onClose,
  primaryAction,
  secondaryAction,
  extraAction,
  footer,
  width,
  closeOnOverlay = true,
  fixed = false,
  children,
  className = '',
  style = {}
}) => {
  const idRef = useRef(`ecomd-sidesheet-${++sheetCounter}`);

  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll when sidesheet is active
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const id = idRef.current;
  const sec =
    secondaryAction === undefined && onClose
      ? { label: 'Đóng', onClick: () => onClose() }
      : secondaryAction;

  const pri = primaryAction;
  const ext = extraAction;
  const hasFooter = footer || pri || sec || ext;

  const renderFooter =
    footer ||
    (hasFooter ? (
      <div className="ecomd-sidesheet__footer">
        <div>
          {ext && (
            <Button
              variant="text"
              icon={ext.icon}
              onClick={ext.onClick}
              disabled={ext.disabled}
            >
              {ext.label}
            </Button>
          )}
        </div>
        <div className="ecomd-sidesheet__actions">
          {sec && (
            <Button variant="ghost" onClick={sec.onClick}>
              {sec.label}
            </Button>
          )}
          {pri && (
            <Button
              variant="primary"
              icon={pri.icon}
              onClick={pri.onClick}
              disabled={pri.disabled}
            >
              {pri.label}
            </Button>
          )}
        </div>
      </div>
    ) : null);

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose && closeOnOverlay !== false) {
      onClose(e);
    }
  };

  const sheetElement = (
    <div
      className={`ecomd-sidesheet-overlay ${fixed ? 'is-fixed' : ''}`}
      onMouseDown={handleOverlayMouseDown}
      data-testid="sidesheet-overlay"
    >
      <div
        className={`ecomd-sidesheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        style={{
          ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
          ...style
        }}
      >
        <div className="ecomd-sidesheet__header">
          <div className="ecomd-sidesheet__heading">
            {icon && (
              <div className="ecomd-sidesheet__icon">
                <Icon name={icon} size={18} />
              </div>
            )}
            <div>
              <h3 id={`${id}-t`} className="ecomd-sidesheet__title title-md">
                {title}
              </h3>
              {description && (
                <p className="ecomd-sidesheet__desc body-xs">{description}</p>
              )}
            </div>
          </div>
          {onClose !== false && (
            <IconButton
              icon="xmark"
              size="md"
              label="Đóng bảng bên"
              onClick={() => onClose && onClose()}
            />
          )}
        </div>

        <div className="ecomd-sidesheet__body">
          {children}
        </div>

        {renderFooter}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(sheetElement, document.body)
    : sheetElement;
};

SideSheet.Section = ({ label, children, className = '', style = {} }) => {
  return (
    <div className={`ecomd-sidesheet__section ${className}`} style={style}>
      {label && <div className="ecomd-sidesheet__section-label overline-xs">{label}</div>}
      {children}
    </div>
  );
};
