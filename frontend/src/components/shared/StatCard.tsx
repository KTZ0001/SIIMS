import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCENTS = {
  purple: 'text-purple-300',
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  blue: 'text-blue-300',
  red: 'text-red-300',
  slate: 'text-white/50',
} as const;

export type StatAccent = keyof typeof ACCENTS;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'slate',
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: StatAccent;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl border border-white/5 bg-white/[0.03] p-4 flex flex-col gap-2',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-white/50 leading-tight">
          {label}
        </span>
        {Icon && <Icon className={cn('h-4 w-4 shrink-0', ACCENTS[accent])} />}
      </div>
      <span className="text-2xl font-bold tracking-tight text-white">
        {value}
      </span>
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </div>
  );
}
