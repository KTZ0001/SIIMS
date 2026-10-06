import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type ToastTone = 'success' | 'info' | 'warning';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-emerald-400/30 bg-emerald-500/10',
  info: 'border-blue-400/30 bg-blue-500/10',
  warning: 'border-amber-400/30 bg-amber-500/10',
};

const TONE_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
} as const;

const TONE_ICON_COLORS: Record<ToastTone, string> = {
  success: 'text-emerald-300',
  info: 'text-blue-300',
  warning: 'text-amber-300',
};

type ToastFn = (title: string, message?: string, tone?: ToastTone) => void;

const ToastContext = createContext<ToastFn | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<ToastFn>((title, message, tone = 'success') => {
    nextId += 1;
    const id = nextId;
    setToasts((prev) => [...prev, { id, tone, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-80 flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = TONE_ICONS[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex gap-2.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${TONE_STYLES[toast.tone]}`}
            >
              <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${TONE_ICON_COLORS[toast.tone]}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="mt-0.5 text-[11px] leading-snug text-white/60">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                aria-label="Dismiss"
                className="shrink-0 rounded p-0.5 text-white/30 hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
}
