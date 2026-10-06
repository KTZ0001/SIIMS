import { useState } from 'react';
import {
  Building2,
  MessageSquarePlus,
  Plus,
  Star,
  Target,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField, TextField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  feedbackForStartup,
  formatDate,
  founderName,
  milestonesForStartup,
  relativeDays,
  startupsForMentor,
} from '@/store/selectors';
import type { Startup } from '@/store/types';

function defaultDue(): string {
  return new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
}

export default function MentorStartupsPage() {
  const { state, actor, dispatch } = useStore();
  const toast = useToast();
  const startups = startupsForMentor(state, actor.id);

  const [milestoneFor, setMilestoneFor] = useState<Startup | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Startup | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDue());

  const [content, setContent] = useState('');
  const [rating, setRating] = useState(4);
  const [milestoneId, setMilestoneId] = useState<string>('');

  function openMilestone(startup: Startup) {
    setTitle('');
    setDescription('');
    setDueDate(defaultDue());
    setMilestoneFor(startup);
  }

  function openFeedback(startup: Startup) {
    setContent('');
    setRating(4);
    setMilestoneId('');
    setFeedbackFor(startup);
  }

  function saveMilestone() {
    if (!milestoneFor || !title.trim()) return;
    dispatch({
      type: 'MILESTONE_CREATE',
      startupId: milestoneFor.id,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
    });
    toast(
      'Milestone created',
      `${milestoneFor.name} has been notified and can now report progress.`,
    );
    setMilestoneFor(null);
  }

  function saveFeedback() {
    if (!feedbackFor || !content.trim()) return;
    dispatch({
      type: 'FEEDBACK_ADD',
      startupId: feedbackFor.id,
      milestoneId: milestoneId || null,
      content: content.trim(),
      rating,
    });
    toast('Feedback posted', `${feedbackFor.name} can see it on their milestones page.`);
    setFeedbackFor(null);
  }

  return (
    <>
      <PageHeader
        title="My Startups"
        subtitle="Set milestones and leave feedback. Founders see both immediately."
      />

      {startups.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No startups assigned yet"
          message="The incubation center assigns startups to you once their application is accepted."
        />
      ) : (
        <div className="space-y-4">
          {startups.map((startup) => {
            const milestones = milestonesForStartup(state, startup.id);
            const notes = feedbackForStartup(state, startup.id);
            const application = applicationForStartup(state, startup.id);
            const average = milestones.length
              ? Math.round(
                  milestones.reduce((sum, m) => sum + m.progress, 0) /
                    milestones.length,
                )
              : 0;

            return (
              <article
                key={startup.id}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-white">
                        {startup.name}
                      </h2>
                      {application && (
                        <StatusBadge status={application.status} />
                      )}
                    </div>
                    <p className="text-xs text-white/45">{startup.tagline}</p>
                    <p className="mt-0.5 text-[11px] text-white/30">
                      {founderName(state, startup.founderId)} · {startup.stage}{' '}
                      · {startup.city}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" onClick={() => openMilestone(startup)}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Milestone
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFeedback(startup)}
                    >
                      <MessageSquarePlus className="mr-1 h-3.5 w-3.5" /> Feedback
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Target className="h-3.5 w-3.5 text-purple-300" />
                        Milestones ({milestones.length})
                      </h3>
                      {milestones.length > 0 && (
                        <span className="text-[11px] text-white/40">
                          {average}% average
                        </span>
                      )}
                    </div>

                    {milestones.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/35">
                        No milestones set. Add the first one to give this startup
                        something concrete to work toward.
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {milestones.map((milestone) => (
                          <li
                            key={milestone.id}
                            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] font-semibold text-white">
                                {milestone.title}
                              </p>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <StatusBadge status={milestone.status} />
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Delete milestone "${milestone.title}"?`,
                                      )
                                    ) {
                                      dispatch({
                                        type: 'MILESTONE_DELETE',
                                        milestoneId: milestone.id,
                                      });
                                    }
                                  }}
                                  aria-label="Delete milestone"
                                  className="rounded p-1 text-white/25 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-0.5 text-[10px] text-white/35">
                              due {formatDate(milestone.dueDate)} ·{' '}
                              {relativeDays(milestone.dueDate)}
                            </p>
                            <div className="mt-2">
                              <ProgressBar
                                value={milestone.progress}
                                overdue={milestone.status === 'OVERDUE'}
                                showLabel
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-white">
                      <MessageSquarePlus className="h-3.5 w-3.5 text-blue-300" />
                      Feedback ({notes.length})
                    </h3>
                    {notes.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/35">
                        No feedback left yet.
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {notes.slice(0, 4).map((note) => {
                          const target = milestones.find(
                            (m) => m.id === note.milestoneId,
                          );
                          return (
                            <li
                              key={note.id}
                              className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                            >
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="flex gap-0.5">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-2.5 w-2.5 ${
                                        i < note.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-white/15'
                                      }`}
                                    />
                                  ))}
                                </span>
                                <span className="text-[10px] text-white/30">
                                  {relativeDays(note.createdAt)}
                                </span>
                              </div>
                              {target && (
                                <p className="mb-1 text-[10px] font-semibold text-purple-300/70">
                                  on “{target.title}”
                                </p>
                              )}
                              <p className="text-[11px] leading-relaxed text-white/60">
                                {note.content}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={milestoneFor !== null}
        onClose={() => setMilestoneFor(null)}
        title={`New milestone — ${milestoneFor?.name ?? ''}`}
        description="The founder is notified and reports progress against it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setMilestoneFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveMilestone} disabled={!title.trim()}>
              Create milestone
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextField
              value={title}
              onChange={setTitle}
              placeholder="Sign three pilot customers"
            />
          </Field>
          <Field label="What does done look like?">
            <TextAreaField
              value={description}
              onChange={setDescription}
              rows={4}
              placeholder="Be specific enough that both of you will agree when it is finished."
            />
          </Field>
          <Field label="Due date" required>
            <TextField
              type="date"
              value={dueDate}
              onChange={setDueDate}
              className="max-w-48"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={feedbackFor !== null}
        onClose={() => setFeedbackFor(null)}
        title={`Feedback — ${feedbackFor?.name ?? ''}`}
        description="Appears on the founder's milestone and mentor pages."
        footer={
          <>
            <Button variant="ghost" onClick={() => setFeedbackFor(null)}>
              Cancel
            </Button>
            <Button onClick={saveFeedback} disabled={!content.trim()}>
              Post feedback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {feedbackFor && (
            <Field label="Attach to a milestone" hint="Optional">
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60"
              >
                <option value="" className="bg-[#0b0b0e]">
                  General feedback
                </option>
                {milestonesForStartup(state, feedbackFor.id).map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0b0b0e]">
                    {m.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Feedback" required>
            <TextAreaField value={content} onChange={setContent} rows={5} />
          </Field>

          <Field label="Rating">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  className="rounded p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-5 w-5 ${
                      value <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </>
  );
}
