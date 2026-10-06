import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-white/5 text-white/60 border-white/10',
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  progress: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
};

/**
 * One badge for every status in the system, so the same state always reads the
 * same colour wherever it appears.
 */
const STATUS_TONES: Record<string, Tone> = {
  // Application
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'progress',
  EVALUATED: 'progress',
  SHORTLISTED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  // Milestone
  NOT_STARTED: 'neutral',
  IN_PROGRESS: 'progress',
  COMPLETED: 'success',
  OVERDUE: 'danger',
  // Requests
  PENDING: 'warning',
  APPROVED: 'success',
  // Programme
  PLANNED: 'neutral',
  ACTIVE: 'success',
  // Mentor
  INACTIVE: 'neutral',
  // Session
  SCHEDULED: 'info',
  CANCELLED: 'neutral',
  // Evaluation category
  'High Potential': 'success',
  Promising: 'progress',
  'Needs Improvement': 'warning',
  'Not Recommended': 'danger',
};

function toLabel(status: string): string {
  if (status.includes(' ')) return status;
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const tone = STATUS_TONES[status] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label ?? toLabel(status)}
    </span>
  );
}
