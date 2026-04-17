import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (m, d) => add(m, 'success', d),
    error:   (m, d) => add(m, 'error',   d),
    info:    (m, d) => add(m, 'info',    d),
    warning: (m, d) => add(m, 'warning', d),
  };

  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 26, right: 26, zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{ICONS[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
