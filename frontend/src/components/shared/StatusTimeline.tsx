import { Check, Circle, X } from 'lucide-react';
import {
  APPLICATION_FLOW,
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/store/types';
import { formatDate } from '@/store/selectors';

/**
 * Renders the happy path as a fixed spine so a founder can always see what is
 * still ahead. A rejection is drawn as a terminal branch off whichever stage it
 * happened at, rather than as another step.
 */
export function StatusTimeline({ application }: { application: Application }) {
  const rejected = application.status === 'REJECTED';
  const reachedIndex = rejected
    ? APPLICATION_FLOW.length
    : APPLICATION_FLOW.indexOf(application.status);

  const eventFor = (status: string) =>
    [...application.history].reverse().find((h) => h.status === status) ?? null;

  const rejection = rejected ? eventFor('REJECTED') : null;

  return (
    <ol className="space-y-0">
      {APPLICATION_FLOW.map((status, index) => {
        const event = eventFor(status);
        const done = !rejected && index < reachedIndex;
        const current = !rejected && index === reachedIndex;
        const reachedBeforeRejection = rejected && Boolean(event);
        const last = index === APPLICATION_FLOW.length - 1;

        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done || reachedBeforeRejection
                    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                    : current
                      ? 'border-purple-400/60 bg-purple-500/20 text-purple-200'
                      : 'border-white/10 bg-white/5 text-white/25'
                }`}
              >
                {done || reachedBeforeRejection ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Circle
                    className={`h-2 w-2 ${current ? 'fill-current' : ''}`}
                  />
                )}
              </span>
              {!last && (
                <span
                  className={`w-px flex-1 min-h-6 ${
                    done || reachedBeforeRejection
                      ? 'bg-emerald-400/25'
                      : 'bg-white/8'
                  }`}
                />
              )}
            </div>

            <div className={`min-w-0 flex-1 ${last ? 'pb-0' : 'pb-5'}`}>
              <p
                className={`text-sm font-semibold leading-6 ${
                  done || current || reachedBeforeRejection
                    ? 'text-white'
                    : 'text-white/30'
                }`}
              >
                {APPLICATION_STATUS_LABELS[status]}
                {current && (
                  <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-200">
                    current
                  </span>
                )}
              </p>
              {event ? (
                <p className="text-[11px] text-white/40">
                  {formatDate(event.at)} · {event.byName}
                  {event.note && (
                    <span className="mt-1 block text-white/55">
                      {event.note}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-[11px] text-white/25">Not yet reached</p>
              )}
            </div>
          </li>
        );
      })}

      {rejection && (
        <li className="flex gap-3 pt-1">
          <div className="flex flex-col items-center">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20 text-red-300">
              <X className="h-3 w-3" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-300">Not Accepted</p>
            <p className="text-[11px] text-white/40">
              {formatDate(rejection.at)} · {rejection.byName}
            </p>
            {application.decisionNote && (
              <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                {application.decisionNote}
              </p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
