import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon, IconName } from './Icon';
import { IconButton } from './IconButton';
import { Button } from './Button';

export interface PopupModalAction {
  label: React.ReactNode;
  icon?: IconName;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export interface PopupModalProps {
  open?: boolean;
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose?: ((e?: React.MouseEvent | React.KeyboardEvent) => void) | false;
  primaryAction?: PopupModalAction;
  secondaryAction?: PopupModalAction | null;
  extraAction?: PopupModalAction;
  footer?: React.ReactNode;
  width?: number | string;
  closeOnOverlay?: boolean;
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

let modalCounter = 0;

export const PopupModal: React.FC<PopupModalProps> & {
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
  inline = false,
  children,
  className = '',
  style = {}
}) => {
  const idRef = useRef(`ecomd-modal-${++modalCounter}`);

  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const id = idRef.current;
  const sec =
    secondaryAction === undefined && onClose
      ? { label: 'Đóng', onClick: () => onClose() }
      : secondaryAction;

  const pri = primaryAction;
  const ext = extraAction;
  const hasFooter = footer !== undefined ? Boolean(footer) : Boolean(pri || sec || ext);

  const renderFooter =
    footer !== undefined
      ? footer
      : hasFooter ? (
      <div className="ecomd-modal__footer">
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
        <div className="ecomd-modal__actions">
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
    ) : null;

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose && closeOnOverlay !== false) {
      onClose(e);
    }
  };

  const modalContent = (
    <div
      className={`ecomd-modal-overlay ${inline ? 'is-inline' : ''}`}
      onMouseDown={handleOverlayMouseDown}
      style={{ zIndex: 2000 }}
    >
      <div
        className={`ecomd-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        style={{
          ...(width ? { maxWidth: typeof width === 'number' ? `${width}px` : width } : {}),
          ...style
        }}
      >
        <div className="ecomd-modal__header">
          <div className="ecomd-modal__heading">
            {icon && (
              <div className="ecomd-modal__icon">
                <Icon name={icon} size={18} />
              </div>
            )}
            <div>
              <h3 id={`${id}-t`} className="ecomd-modal__title title-md">
                {title}
              </h3>
              {description && (
                <p className="ecomd-modal__desc body-xs">{description}</p>
              )}
            </div>
          </div>
          {onClose !== false && (
            <IconButton
              icon="xmark"
              size="md"
              label="Đóng hộp thoại"
              onClick={() => onClose && onClose()}
            />
          )}
        </div>

        <div className="ecomd-modal__body">
          {children}
          {renderFooter}
        </div>
      </div>
    </div>
  );

  if (inline || typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
};

PopupModal.Section = ({ label, children, className = '', style = {} }) => {
  return (
    <div className={`ecomd-modal__section ${className}`} style={style}>
      {label && <div className="ecomd-modal__section-label overline-xs">{label}</div>}
      {children}
    </div>
  );
};
