import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  IndianRupee,
  Package,
  Target,
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
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  completedStepCount,
  feedbackForStartup,
  formatDate,
  formatINR,
  fundingForStartup,
  mentorById,
  milestonesForStartup,
  relativeDays,
  resourcesForStartup,
  startupForFounder,
} from '@/store/selectors';
import { APPLICATION_STEPS } from '@/store/types';

export default function FounderDashboard() {
  const { state, actor } = useStore();

  const startup = startupForFounder(state, actor.id);
  if (!startup) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState title="No startup profile" />
      </>
    );
  }

  const application = applicationForStartup(state, startup.id);
  const mentor = mentorById(state, startup.mentorId);
  const milestones = milestonesForStartup(state, startup.id);
  const feedback = feedbackForStartup(state, startup.id);
  const funding = fundingForStartup(state, startup.id);
  const resources = resourcesForStartup(state, startup.id);

  const avgProgress = milestones.length
    ? Math.round(
        milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length,
      )
    : 0;
  const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
  const pendingFunding = funding.filter((f) => f.status === 'PENDING').length;
  const pendingResources = resources.filter(
    (r) => r.status === 'PENDING',
  ).length;

  const stepsDone = application ? completedStepCount(application.form) : 0;

  const chartData = milestones.map((m) => ({
    name: m.title.length > 22 ? `${m.title.slice(0, 22)}…` : m.title,
    value: m.progress,
    status: m.status,
  }));

  const barColor = (status: string) =>
    status === 'COMPLETED'
      ? '#34d399'
      : status === 'OVERDUE'
        ? '#f87171'
        : status === 'IN_PROGRESS'
          ? '#60a5fa'
          : '#4b5563';

  return (
    <>
      <PageHeader
        title={startup.name}
        subtitle={`${startup.tagline} · ${startup.domain} · ${startup.city}`}
        actions={
          application && <StatusBadge status={application.status} />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Application"
          value={
            application
              ? application.status === 'DRAFT'
                ? `${stepsDone}/${APPLICATION_STEPS.length}`
                : application.status.replace(/_/g, ' ').toLowerCase()
              : '—'
          }
          hint={
            application?.status === 'DRAFT'
              ? 'steps complete'
              : 'current stage'
          }
          icon={Target}
          accent="purple"
        />
        <StatCard
          label="Milestone progress"
          value={`${avgProgress}%`}
          hint={`${completed} of ${milestones.length} complete`}
          icon={Target}
          accent="emerald"
        />
        <StatCard
          label="Funding raised"
          value={formatINR(startup.fundingRaised)}
          hint={`goal ${formatINR(startup.fundingGoal)}`}
          icon={IndianRupee}
          accent="blue"
        />
        <StatCard
          label="Open requests"
          value={pendingFunding + pendingResources}
          hint={`${pendingFunding} funding · ${pendingResources} resource`}
          icon={Package}
          accent="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                Milestone progress
              </h2>
              <Link
                to="/founder/progress"
                className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200"
              >
                Update progress <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {milestones.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No milestones yet"
                message="Your mentor will set milestones once you are accepted and assigned."
              />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
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
                      width={150}
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
                      formatter={(value) => [`${value}%`, 'Progress']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {chartData.map((row) => (
                        <Cell key={row.name} fill={barColor(row.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-sm font-bold text-white">
              Recent mentor feedback
            </h2>
            {feedback.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No feedback yet"
                message="Feedback from your assigned mentor will appear here."
              />
            ) : (
              <ul className="space-y-3">
                {feedback.slice(0, 3).map((note) => (
                  <li
                    key={note.id}
                    className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {note.mentorName}
                      </span>
                      <span className="text-[10px] text-white/35">
                        {relativeDays(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-white/60">
                      {note.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          {application && (
            <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-sm font-bold text-white">
                Application status
              </h2>
              <StatusTimeline application={application} />
              {application.status === 'DRAFT' && (
                <Button asChild className="mt-4 w-full">
                  <Link to="/founder/application">
                    Continue application <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </section>
          )}

          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-sm font-bold text-white">Your mentor</h2>
            {mentor ? (
              <Link to="/founder/mentor" className="block group">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/60 to-pink-500/60 text-[11px] font-bold text-white">
                    {mentor.avatarSeed}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-purple-200">
                      {mentor.firstName} {mentor.lastName}
                    </p>
                    <p className="text-[11px] text-white/45">
                      {mentor.title} · {mentor.organization}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {mentor.expertise.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <p className="text-xs leading-relaxed text-white/40">
                No mentor assigned yet. The incubation center assigns a mentor
                once your application is accepted.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Funding requests</h2>
              <Link
                to="/founder/funding"
                className="text-[11px] font-medium text-purple-300 hover:text-purple-200"
              >
                View all
              </Link>
            </div>
            {funding.length === 0 ? (
              <p className="text-xs text-white/40">No requests raised yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {funding.slice(0, 3).map((request) => (
                  <li key={request.id} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">
                        {formatINR(request.amount)}
                      </p>
                      <p className="truncate text-[10px] text-white/35">
                        {request.category} · {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {milestones.some((m) => m.status === 'OVERDUE') && (
            <section className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <h2 className="mb-2 text-sm font-bold text-red-200">
                Needs attention
              </h2>
              {milestones
                .filter((m) => m.status === 'OVERDUE')
                .map((m) => (
                  <div key={m.id} className="mb-3 last:mb-0">
                    <p className="text-xs font-medium text-white">{m.title}</p>
                    <p className="mb-1.5 text-[10px] text-red-300/70">
                      Due {relativeDays(m.dueDate)}
                    </p>
                    <ProgressBar value={m.progress} overdue showLabel />
                  </div>
                ))}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
