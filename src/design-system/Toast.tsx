import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export type ToastTone = 'success' | 'danger' | 'warning' | 'info';

export const DEFAULT_TOAST_DURATION = 10000; // 10s auto-dismiss per Finviet portal requirements

export interface ToastOptions {
  id?: string;
  tone?: ToastTone;
  title?: string;
  message: React.ReactNode;
  duration?: number; // ms, default 10000ms (10s)
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastListener = (toasts: ToastOptions[]) => void;
let activeToastsList: ToastOptions[] = [];
const listeners = new Set<ToastListener>();

// Singleton tracking for ToastContainer so rendering <ToastContainer /> in multiple components
// (e.g. App and sub-modules/tests) never creates duplicate toast instances in the DOM.
let activeContainerId: string | null = null;
const registeredContainers = new Set<string>();

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
            duration: DEFAULT_TOAST_DURATION
          }
        : {
            id: opts.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            tone: opts.tone || 'info',
            duration: opts.duration ?? DEFAULT_TOAST_DURATION,
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

  success: (message: React.ReactNode, title?: string, duration = DEFAULT_TOAST_DURATION): string =>
    toast.show({ tone: 'success', message, title, duration }),

  danger: (message: React.ReactNode, title?: string, duration = DEFAULT_TOAST_DURATION): string =>
    toast.show({ tone: 'danger', message, title, duration }),

  error: (message: React.ReactNode, title?: string, duration = DEFAULT_TOAST_DURATION): string =>
    toast.show({ tone: 'danger', message, title, duration }),

  warning: (message: React.ReactNode, title?: string, duration = DEFAULT_TOAST_DURATION): string =>
    toast.show({ tone: 'warning', message, title, duration }),

  info: (message: React.ReactNode, title?: string, duration = DEFAULT_TOAST_DURATION): string =>
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
  const [instanceId] = useState(() => `tc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [isPrimary, setIsPrimary] = useState(false);
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    registeredContainers.add(instanceId);
    if (!activeContainerId) {
      activeContainerId = instanceId;
      setIsPrimary(true);
    } else if (activeContainerId === instanceId) {
      setIsPrimary(true);
    }

    return () => {
      registeredContainers.delete(instanceId);
      if (activeContainerId === instanceId) {
        const next = registeredContainers.values().next().value;
        activeContainerId = next || null;
      }
    };
  }, [instanceId]);

  useEffect(() => {
    setToasts([...activeToastsList]);
    const listener: ToastListener = (updated) => setToasts(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // If another container is already the active mounted container, skip rendering duplicate DOM nodes
  if (!isPrimary && activeContainerId !== instanceId && activeContainerId !== null) {
    return null;
  }

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

        const toastDuration = t.duration ?? DEFAULT_TOAST_DURATION;

        return (
          <div
            key={t.id}
            data-testid={`toast-${tone}`}
            role="alert"
            aria-live="polite"
            className={`ecomd-toast ecomd-toast--${tone}`}
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              minWidth: '340px',
              maxWidth: '460px',
              padding: '12px 16px 14px 16px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              borderRadius: 'var(--radius-8, 8px)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-default, #e2e8f0)',
              borderLeft: `4px solid ${borderColor}`,
              animation: 'ecomd-toast-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
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
              title="Đóng thông báo (Tự đóng sau 10s)"
              aria-label="Đóng thông báo (Tự đóng sau 10s)"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                margin: '-4px -4px 0 0',
                color: 'var(--text-subtle, #64748b)',
                borderRadius: 'var(--radius-4, 4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease, color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f1f5f9)';
                e.currentTarget.style.color = 'var(--text-heading, #0f172a)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-subtle, #64748b)';
              }}
            >
              <Icon name="xmark" size={14} />
            </button>

            {/* Subtle animated progress bar indicating 10s countdown */}
            {toastDuration > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: borderColor,
                    animation: `ecomd-toast-progress ${toastDuration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
