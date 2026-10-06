import { cn } from '@/lib/utils';

function toneFor(value: number, overdue: boolean): string {
  if (value >= 100) return 'bg-emerald-400';
  if (overdue) return 'bg-red-400';
  if (value >= 50) return 'bg-blue-400';
  if (value > 0) return 'bg-amber-400';
  return 'bg-white/20';
}

export function ProgressBar({
  value,
  overdue = false,
  showLabel = false,
  className,
}: {
  value: number;
  overdue?: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            toneFor(clamped, overdue),
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-white/60">
          {clamped}%
        </span>
      )}
    </div>
  );
}
