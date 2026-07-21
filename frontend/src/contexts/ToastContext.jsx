import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';
import { Portal } from '@/components/ui/Portal';
import { cn } from '@/utils/cn';

const ToastContext = createContext(null);

const ICONS = {
  success: FiCheckCircle,
  error: FiXCircle,
  warning: FiAlertCircle,
  info: FiInfo,
};

const STYLES = {
  success: 'border-success/30 text-success-dark',
  error: 'border-error/30 text-error-dark',
  warning: 'border-warning/30 text-warning-dark',
  info: 'border-brand-300 text-brand-700',
};

/**
 * Toast provider. Exposes `toast.success/error/info/warning(message, opts)` via
 * the `useToast` hook, and renders a live region so announcements are accessible.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, { duration = 4000, title } = {}) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, type, message, title }]);
      if (duration > 0) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (msg, opts) => push('success', msg, opts),
      error: (msg, opts) => push('error', msg, opts),
      warning: (msg, opts) => push('warning', msg, opts),
      info: (msg, opts) => push('info', msg, opts),
      dismiss: remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Portal>
        <div
          aria-live="polite"
          aria-atomic="false"
          className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        >
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.type];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  role="status"
                  className={cn(
                    'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-surface px-4 py-3 shadow-elevated',
                    STYLES[t.type]
                  )}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    {t.title && <p className="text-sm font-semibold text-navy-900">{t.title}</p>}
                    <p className="text-sm text-navy-700">{t.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    aria-label="Dismiss notification"
                    className="-mr-1 rounded-full p-1 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

/** Access the toast API. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;
