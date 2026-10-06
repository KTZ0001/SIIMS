import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 h-7 w-7 text-white/20" />}
      <p className="text-sm font-semibold text-white/70">{title}</p>
      {message && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/40">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
