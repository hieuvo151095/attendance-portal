import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export type ToastTone = 'success' | 'danger' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  tone?: ToastTone;
  title?: string;
  message: React.ReactNode;
  duration?: number; // ms, default 3500ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastListener = (toasts: ToastOptions[]) => void;
let activeToastsList: ToastOptions[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((listener) => listener([...activeToastsList]));
}

export const toast = {
  show: (opts: ToastOptions | string): string => {
    const item: ToastOptions =
      typeof opts === 'string'
        ? {
            id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            tone: 'info',
            message: opts,
            duration: 3500
          }
        : {
            id: opts.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            tone: opts.tone || 'info',
            duration: opts.duration ?? 3500,
            ...opts
          };

    activeToastsList = [...activeToastsList, item];
    notify();

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        toast.dismiss(item.id!);
      }, item.duration);
    }
    return item.id!;
  },

  success: (message: React.ReactNode, title?: string, duration = 3500): string =>
    toast.show({ tone: 'success', message, title, duration }),

  danger: (message: React.ReactNode, title?: string, duration = 4000): string =>
    toast.show({ tone: 'danger', message, title, duration }),

  error: (message: React.ReactNode, title?: string, duration = 4000): string =>
    toast.show({ tone: 'danger', message, title, duration }),

  warning: (message: React.ReactNode, title?: string, duration = 3500): string =>
    toast.show({ tone: 'warning', message, title, duration }),

  info: (message: React.ReactNode, title?: string, duration = 3500): string =>
    toast.show({ tone: 'info', message, title, duration }),

  dismiss: (id: string) => {
    activeToastsList = activeToastsList.filter((t) => t.id !== id);
    notify();
  },

  clear: () => {
    activeToastsList = [];
    notify();
  }
};

export const useToast = () => toast;

export interface ToastContainerProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ className = '', style = {} }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    setToasts([...activeToastsList]);
    const listener: ToastListener = (updated) => setToasts(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      data-testid="toast-container"
      className={`ecomd-toast-container ${className}`}
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 48px)',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {toasts.map((t) => {
        const tone = t.tone || 'info';
        const borderColor =
          tone === 'success'
            ? 'var(--semantic-success, #059669)'
            : tone === 'danger'
            ? 'var(--semantic-danger, #dc2626)'
            : tone === 'warning'
            ? 'var(--semantic-warning, #d97706)'
            : 'var(--eco-blue-strong, #0284c7)';

        const iconName =
          tone === 'success'
            ? 'circle-check'
            : tone === 'danger'
            ? 'circle-xmark'
            : tone === 'warning'
            ? 'triangle-exclamation'
            : 'circle-info';

        return (
          <div
            key={t.id}
            data-testid={`toast-${tone}`}
            role="alert"
            aria-live="polite"
            className={`ecomd-toast ecomd-toast--${tone}`}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              minWidth: '340px',
              maxWidth: '460px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              borderRadius: 'var(--radius-8, 8px)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderLeft: `4px solid ${borderColor}`,
              animation: 'ecomd-toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              <Icon name={iconName} size={18} color={borderColor} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <div
                  className="body-sm-bold"
                  style={{ color: 'var(--text-heading)', marginBottom: '2px' }}
                >
                  {t.title}
                </div>
              )}
              <div
                className="body-sm"
                style={{
                  color: 'var(--text-body)',
                  lineHeight: '1.45',
                  wordBreak: 'break-word'
                }}
              >
                {t.message}
              </div>
              {t.action && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={t.action.onClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--eco-blue-strong)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {t.action.label}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              data-testid="toast-close-btn"
              onClick={() => toast.dismiss(t.id!)}
              aria-label="Đóng thông báo"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                margin: '-4px -4px 0 0',
                color: 'var(--text-subtle)',
                borderRadius: 'var(--radius-4, 4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f1f5f9)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Icon name="xmark" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
