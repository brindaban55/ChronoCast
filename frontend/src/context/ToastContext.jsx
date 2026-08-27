import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur || 6000),
    warn: (msg, dur) => addToast(msg, 'warn', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const ICONS = {
    success: <CheckCircle2 size={17} color="#10b981" />,
    error: <XCircle size={17} color="#f43f5e" />,
    warn: <AlertTriangle size={17} color="#f59e0b" />,
    info: <Info size={17} color="#00e5ff" />,
  };

  const STYLES = {
    success: { border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.1)' },
    error: { border: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.1)' },
    warn: { border: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.1)' },
    info: { border: 'rgba(0, 229, 255, 0.3)', bg: 'rgba(0, 229, 255, 0.08)' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Notification Stack */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          maxWidth: '380px',
          width: '100%',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${STYLES[t.type]?.border || STYLES.info.border}`,
              background: STYLES[t.type]?.bg || STYLES.info.bg,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              animation: 'slideInToast 0.25s ease',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>{ICONS[t.type]}</div>
            <span style={{ flex: 1, fontSize: '0.88rem', lineHeight: 1.5, color: '#f1f5f9', fontWeight: '500' }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 0,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
