import { useState } from 'react';
import { CalendarClock, MessageSquare, Target } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  feedbackForStartup,
  formatDate,
  milestonesForStartup,
  relativeDays,
  startupForFounder,
} from '@/store/selectors';

const STEPS = [0, 25, 50, 75, 100];

export default function FounderProgressPage() {
  const { state, actor, dispatch } = useStore();
  const toast = useToast();
  const startup = startupForFounder(state, actor.id);

  const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});

  if (!startup) {
    return (
      <>
        <PageHeader title="Milestones" />
        <EmptyState title="No startup profile" />
      </>
    );
  }

  const milestones = milestonesForStartup(state, startup.id);
  const feedback = feedbackForStartup(state, startup.id);

  const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
  const overdue = milestones.filter((m) => m.status === 'OVERDUE').length;
  const average = milestones.length
    ? Math.round(
        milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length,
      )
    : 0;

  function commit(milestoneId: string, progress: number) {
    dispatch({ type: 'MILESTONE_SET_PROGRESS', milestoneId, progress });
    toast(
      `Progress saved at ${progress}%`,
      'Your mentor and the incubation center can see this now.',
    );
    setDraftProgress((prev) => {
      const next = { ...prev };
      delete next[milestoneId];
      return next;
    });
  }

  return (
    <>
      <PageHeader
        title="Milestones & Progress"
        subtitle="Milestones are set by your mentor. You report progress here — your mentor and the incubation center see it immediately."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Milestones" value={milestones.length} icon={Target} />
        <StatCard
          label="Completed"
          value={completed}
          accent="emerald"
          icon={Target}
        />
        <StatCard
          label="Overdue"
          value={overdue}
          accent={overdue > 0 ? 'red' : 'slate'}
          icon={CalendarClock}
        />
        <StatCard
          label="Average progress"
          value={`${average}%`}
          accent="blue"
          icon={Target}
        />
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No milestones yet"
          message="Once your application is accepted and a mentor is assigned, they will set milestones for you here."
        />
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const pending = draftProgress[milestone.id];
            const shown = pending ?? milestone.progress;
            const dirty = pending !== undefined && pending !== milestone.progress;
            const notes = feedback.filter(
              (f) => f.milestoneId === milestone.id,
            );

            return (
              <article
                key={milestone.id}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {milestone.title}
                      </h3>
                      <StatusBadge status={milestone.status} />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      {milestone.description}
                    </p>
                    <p className="mt-1.5 text-[11px] text-white/35">
                      Set by {milestone.createdByName} · due{' '}
                      {formatDate(milestone.dueDate)} (
                      {relativeDays(milestone.dueDate)})
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <ProgressBar
                    value={shown}
                    overdue={milestone.status === 'OVERDUE'}
                    showLabel
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-white/40">
                      Set progress
                    </span>
                    {STEPS.map((step) => (
                      <button
                        key={step}
                        onClick={() =>
                          setDraftProgress((prev) => ({
                            ...prev,
                            [milestone.id]: step,
                          }))
                        }
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          shown === step
                            ? 'border-purple-400/50 bg-purple-500/20 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.07]'
                        }`}
                      >
                        {step}%
                      </button>
                    ))}

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={shown}
                      onChange={(e) =>
                        setDraftProgress((prev) => ({
                          ...prev,
                          [milestone.id]: Number(e.target.value),
                        }))
                      }
                      className="ml-1 h-1 flex-1 min-w-32 cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-400"
                    />

                    <Button
                      size="sm"
                      disabled={!dirty}
                      onClick={() => commit(milestone.id, shown)}
                    >
                      {dirty ? `Save ${shown}%` : 'Saved'}
                    </Button>
                  </div>
                </div>

                {notes.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                    {notes.map((note) => (
                      <div key={note.id} className="flex gap-2">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-300/70" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-white/80">
                            {note.mentorName}
                            <span className="ml-2 font-normal text-white/30">
                              {relativeDays(note.createdAt)}
                            </span>
                          </p>
                          <p className="text-[11px] leading-relaxed text-white/55">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
