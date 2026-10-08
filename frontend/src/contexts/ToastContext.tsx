import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  actionText?: string;
  actionPath?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => void;
  error: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => void;
  info: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => void;
  warning: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const navigate = useNavigate();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => {
      showToast({ type: 'success', message, ...options });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => {
      showToast({ type: 'error', message, ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => {
      showToast({ type: 'info', message, ...options });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'message'>>) => {
      showToast({ type: 'warning', message, ...options });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100vw-40px)] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-500/40 shadow-emerald-950/20'
                : t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-500/40 shadow-rose-950/20'
                : t.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-500/40 shadow-amber-950/20'
                : 'bg-slate-900/90 text-white border-slate-700/50 shadow-black/20'
            }`}
          >
            {/* Icon */}
            <span className="material-symbols-outlined text-2xl flex-shrink-0 mt-0.5">
              {t.type === 'success' && 'check_circle'}
              {t.type === 'error' && 'error'}
              {t.type === 'warning' && 'warning'}
              {t.type === 'info' && 'info'}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {t.title && <h4 className="font-semibold text-sm leading-snug">{t.title}</h4>}
              <p className="text-sm font-medium leading-relaxed opacity-95 break-words">{t.message}</p>
              {t.actionText && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      if (t.onAction) {
                        t.onAction();
                      } else if (t.actionPath) {
                        navigate(t.actionPath);
                      }
                      removeToast(t.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <span>{t.actionText}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/70 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-full flex-shrink-0"
              aria-label="Đóng thông báo"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
