import { CalendarClock, GraduationCap, MessageSquare, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  feedbackForStartup,
  formatDate,
  mentorById,
  milestonesForStartup,
  relativeDays,
  sessionsForStartup,
  startupForFounder,
} from '@/store/selectors';

export default function FounderMentorPage() {
  const { state, actor } = useStore();
  const startup = startupForFounder(state, actor.id);

  if (!startup) {
    return (
      <>
        <PageHeader title="My Mentor" />
        <EmptyState title="No startup profile" />
      </>
    );
  }

  const mentor = mentorById(state, startup.mentorId);
  const application = applicationForStartup(state, startup.id);
  const feedback = feedbackForStartup(state, startup.id);
  const sessions = sessionsForStartup(state, startup.id);
  const milestones = milestonesForStartup(state, startup.id);

  if (!mentor) {
    return (
      <>
        <PageHeader title="My Mentor" />
        <EmptyState
          icon={GraduationCap}
          title="No mentor assigned yet"
          message={
            application && application.status === 'ACCEPTED'
              ? 'Your application has been accepted. The incubation center will assign a mentor shortly.'
              : 'A mentor is assigned once the incubation center accepts your application.'
          }
        />
      </>
    );
  }

  const upcoming = sessions.filter((s) => s.status === 'SCHEDULED');
  const past = sessions.filter((s) => s.status !== 'SCHEDULED');

  return (
    <>
      <PageHeader
        title="My Mentor"
        subtitle="Your assigned mentor, the milestones they have set, and the feedback they have left."
      />

      <section className="rounded-xl border border-white/8 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-start gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/60 to-pink-500/60 text-base font-bold text-white">
            {mentor.avatarSeed}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">
              {mentor.firstName} {mentor.lastName}
            </h2>
            <p className="text-sm text-white/55">
              {mentor.title} · {mentor.organization}
            </p>
            <p className="mt-0.5 text-xs text-white/35">
              {mentor.email} · {mentor.yearsExperience} years experience
            </p>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/60">
              {mentor.bio}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mentor.expertise.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <MessageSquare className="h-4 w-4 text-purple-300" />
            Feedback ({feedback.length})
          </h2>
          {feedback.length === 0 ? (
            <EmptyState
              title="No feedback yet"
              message="Your mentor's notes will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {feedback.map((note) => {
                const milestone = milestones.find(
                  (m) => m.id === note.milestoneId,
                );
                return (
                  <li
                    key={note.id}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < note.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-white/15'
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-[10px] text-white/35">
                        {relativeDays(note.createdAt)}
                      </span>
                    </div>
                    {milestone && (
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300/70">
                        on “{milestone.title}”
                      </p>
                    )}
                    <p className="text-xs leading-relaxed text-white/65">
                      {note.content}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <CalendarClock className="h-4 w-4 text-blue-300" />
            Sessions
          </h2>

          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              message="Your mentor schedules sessions from their dashboard."
            />
          ) : (
            <div className="space-y-4">
              {upcoming.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    Upcoming
                  </p>
                  <ul className="space-y-2">
                    {upcoming.map((session) => (
                      <li
                        key={session.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white">
                            {session.title}
                          </p>
                          <StatusBadge status={session.status} />
                        </div>
                        <p className="mt-1 text-[11px] text-white/45">
                          {formatDate(session.scheduledAt)} ·{' '}
                          {relativeDays(session.scheduledAt)} ·{' '}
                          {session.durationMins} min
                        </p>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
                          {session.agenda}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    Past
                  </p>
                  <ul className="space-y-2">
                    {past.map((session) => (
                      <li
                        key={session.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 opacity-80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white">
                            {session.title}
                          </p>
                          <StatusBadge status={session.status} />
                        </div>
                        <p className="mt-1 text-[11px] text-white/40">
                          {formatDate(session.scheduledAt)}
                        </p>
                        {session.notes && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">
                            {session.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
