import { createContext, useCallback, useContext, useState } from 'react';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-emerald-200 bg-white text-emerald-700',
  error: 'border-red-200 bg-white text-red-700',
  info: 'border-violet-200 bg-white text-violet-700',
};

function ToastItem({ toast, onClose }) {
  const Icon = icons[toast.type];
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border shadow-md px-4 py-3 animate-[slideIn_0.2s_ease-out] ${styles[toast.type]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm flex-1 text-gray-700">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.showToast;
}
