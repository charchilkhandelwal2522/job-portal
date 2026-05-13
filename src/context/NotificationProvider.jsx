import { useCallback, useMemo, useState } from 'react';
import { NotificationContext } from './notificationContext';

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, variant = 'info') => {
    setToast({ text, variant });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast ? (
        <div className={`app-toast app-toast--${toast.variant}`} role="status">
          {toast.text}
        </div>
      ) : null}
    </NotificationContext.Provider>
  );
}
