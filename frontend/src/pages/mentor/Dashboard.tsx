import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  MessageSquare,
  Target,
  TriangleAlert,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { useStore } from '@/store/StoreContext';
import {
  feedbackForStartup,
  formatDate,
  founderName,
  milestonesForStartup,
  relativeDays,
  sessionsForMentor,
  startupsForMentor,
} from '@/store/selectors';

export default function MentorDashboard() {
  const { state, actor } = useStore();

  const startups = startupsForMentor(state, actor.id);
  const sessions = sessionsForMentor(state, actor.id);
  const mentor = actor.mentor;

  const allMilestones = startups.flatMap((s) =>
    milestonesForStartup(state, s.id),
  );
  const overdue = allMilestones.filter((m) => m.status === 'OVERDUE');
  const completed = allMilestones.filter((m) => m.status === 'COMPLETED');
  const upcoming = sessions.filter((s) => s.status === 'SCHEDULED');
  const feedbackCount = startups.reduce(
    (sum, s) => sum + feedbackForStartup(state, s.id).length,
    0,
  );

  const chart = startups.map((s) => {
    const rows = milestonesForStartup(state, s.id);
    return {
      name: s.name,
      value: rows.length
        ? Math.round(rows.reduce((sum, m) => sum + m.progress, 0) / rows.length)
        : 0,
      overdue: rows.some((m) => m.status === 'OVERDUE'),
    };
  });

  return (
    <>
      <PageHeader
        title={`Welcome, ${actor.name.split(' ')[0]}`}
        subtitle={
          mentor
            ? `${mentor.title} · ${mentor.organization} — mentoring ${startups.length} of a maximum ${mentor.maxStartups} startups.`
            : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Assigned startups"
          value={startups.length}
          hint={mentor ? `capacity ${mentor.maxStartups}` : undefined}
          icon={Building2}
          accent="purple"
        />
        <StatCard
          label="Milestones tracked"
          value={allMilestones.length}
          hint={`${completed.length} complete`}
          icon={Target}
          accent="emerald"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          icon={TriangleAlert}
          accent={overdue.length > 0 ? 'red' : 'slate'}
        />
        <StatCard
          label="Upcoming sessions"
          value={upcoming.length}
          hint={`${feedbackCount} feedback notes given`}
          icon={CalendarClock}
          accent="blue"
        />
      </div>

      {startups.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No startups assigned yet"
          message="The incubation center assigns startups to you once their application is accepted. Your dashboard will fill in as soon as that happens."
        />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-sm font-bold text-white">
                Progress across your startups
              </h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{
                        backgroundColor: '#0b0b0e',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value}%`, 'Avg progress']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {chart.map((row) => (
                        <Cell
                          key={row.name}
                          fill={row.overdue ? '#f87171' : '#60a5fa'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">
                  Upcoming sessions
                </h2>
                <Link
                  to="/mentor/sessions"
                  className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200"
                >
                  All sessions <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Nothing scheduled"
                  message="Schedule a session from the Sessions page."
                />
              ) : (
                <ul className="space-y-2.5">
                  {upcoming.slice(0, 4).map((session) => {
                    const startup = startups.find(
                      (s) => s.id === session.startupId,
                    );
                    return (
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
                          {startup?.name} · {formatDate(session.scheduledAt)} ·{' '}
                          {relativeDays(session.scheduledAt)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Your startups</h2>
              <Link
                to="/mentor/startups"
                className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {startups.map((startup) => {
                const milestones = milestonesForStartup(state, startup.id);
                const notes = feedbackForStartup(state, startup.id);
                const average = milestones.length
                  ? Math.round(
                      milestones.reduce((sum, m) => sum + m.progress, 0) /
                        milestones.length,
                    )
                  : 0;
                const isOverdue = milestones.some(
                  (m) => m.status === 'OVERDUE',
                );
                return (
                  <Link
                    key={startup.id}
                    to="/mentor/startups"
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {startup.name}
                        </p>
                        <p className="truncate text-[11px] text-white/40">
                          {founderName(state, startup.founderId)} ·{' '}
                          {startup.stage}
                        </p>
                      </div>
                      {isOverdue && (
                        <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-red-300" />
                      )}
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        value={average}
                        overdue={isOverdue}
                        showLabel
                      />
                    </div>
                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-white/35">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {milestones.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {notes.length}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}
