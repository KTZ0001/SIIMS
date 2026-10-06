import { useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField, TextField } from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  formatDate,
  relativeDays,
  sessionsForMentor,
  startupById,
  startupsForMentor,
} from '@/store/selectors';
import type { MentorSession } from '@/store/types';

function defaultSlot(): string {
  const when = new Date(Date.now() + 3 * 86_400_000);
  when.setHours(11, 0, 0, 0);
  return when.toISOString().slice(0, 16);
}

export default function MentorSessionsPage() {
  const { state, actor, dispatch } = useStore();

  const startups = startupsForMentor(state, actor.id);
  const sessions = sessionsForMentor(state, actor.id);

  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState<MentorSession | null>(null);

  const [startupId, setStartupId] = useState('');
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledAt, setScheduledAt] = useState(defaultSlot());
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  const upcoming = sessions.filter((s) => s.status === 'SCHEDULED');
  const past = sessions
    .filter((s) => s.status !== 'SCHEDULED')
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );

  function openCreate() {
    setStartupId(startups[0]?.id ?? '');
    setTitle('');
    setAgenda('');
    setScheduledAt(defaultSlot());
    setDuration('60');
    setCreating(true);
  }

  function save() {
    if (!startupId || !title.trim()) return;
    dispatch({
      type: 'SESSION_CREATE',
      startupId,
      title: title.trim(),
      agenda: agenda.trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMins: Number(duration) || 60,
    });
    setCreating(false);
  }

  function complete() {
    if (!completing) return;
    dispatch({
      type: 'SESSION_COMPLETE',
      sessionId: completing.id,
      notes: notes.trim(),
    });
    setCompleting(null);
    setNotes('');
  }

  return (
    <>
      <PageHeader
        title="Mentoring Sessions"
        subtitle="Schedule sessions with your startups and record what was agreed."
        actions={
          <Button onClick={openCreate} disabled={startups.length === 0}>
            <Plus className="mr-1.5 h-4 w-4" /> Schedule session
          </Button>
        }
      />

      {startups.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No startups assigned"
          message="You need at least one assigned startup before you can schedule a session."
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-bold text-white">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled"
                action={
                  <Button onClick={openCreate}>
                    <Plus className="mr-1.5 h-4 w-4" /> Schedule session
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {upcoming.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white">
                          {session.title}
                        </h3>
                        <p className="text-[11px] text-white/45">
                          {startupById(state, session.startupId)?.name}
                        </p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>

                    <p className="mt-2 text-[11px] text-white/50">
                      {formatDate(session.scheduledAt)} ·{' '}
                      {new Date(session.scheduledAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {session.durationMins} min ·{' '}
                      {relativeDays(session.scheduledAt)}
                    </p>

                    {session.agenda && (
                      <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                        {session.agenda}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2 border-t border-white/5 pt-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setCompleting(session);
                          setNotes('');
                        }}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark
                        complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(`Cancel "${session.title}"?`)) {
                            dispatch({
                              type: 'SESSION_CANCEL',
                              sessionId: session.id,
                            });
                          }
                        }}
                        className="text-red-300 hover:bg-red-500/10"
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-white">
                Past sessions ({past.length})
              </h2>
              <div className="space-y-2.5">
                {past.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-4 opacity-85"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white">
                          {session.title}
                        </h3>
                        <p className="text-[11px] text-white/40">
                          {startupById(state, session.startupId)?.name} ·{' '}
                          {formatDate(session.scheduledAt)}
                        </p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                    {session.notes && (
                      <p className="mt-2 rounded border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-relaxed text-white/55">
                        {session.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Schedule a session"
        description="The founder is notified and sees it on their mentor page."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!startupId || !title.trim()}>
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Startup" required>
            <select
              value={startupId}
              onChange={(e) => setStartupId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b0b0e]">
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title" required>
            <TextField
              value={title}
              onChange={setTitle}
              placeholder="Pricing and packaging review"
            />
          </Field>
          <Field label="Agenda">
            <TextAreaField value={agenda} onChange={setAgenda} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date and time" required>
              <TextField
                type="datetime-local"
                value={scheduledAt}
                onChange={setScheduledAt}
              />
            </Field>
            <Field label="Duration (minutes)">
              <TextField type="number" value={duration} onChange={setDuration} />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={completing !== null}
        onClose={() => setCompleting(null)}
        title={`Complete — ${completing?.title ?? ''}`}
        description="Record what was agreed. The founder sees these notes."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCompleting(null)}>
              Cancel
            </Button>
            <Button onClick={complete}>Mark complete</Button>
          </>
        }
      >
        <Field label="Session notes">
          <TextAreaField value={notes} onChange={setNotes} rows={5} />
        </Field>
      </Modal>
    </>
  );
}
