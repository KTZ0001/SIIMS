import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative my-auto w-full rounded-2xl border border-white/10 bg-[#0b0b0e] shadow-2xl',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
          size === 'xl' && 'max-w-4xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-white/45">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-white/5 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
