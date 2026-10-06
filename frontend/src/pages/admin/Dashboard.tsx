import { Link } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  IndianRupee,
  Target,
  TriangleAlert,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useStore } from '@/store/StoreContext';
import {
  adminKpis,
  applicationsByStatus,
  evaluationsByCategory,
  formatINR,
  milestoneProgressByStartup,
  relativeDays,
  submissionsOverTime,
} from '@/store/selectors';
import { CATEGORY_STYLES } from '@/store/scoring';

const TOOLTIP_STYLE = {
  backgroundColor: '#0b0b0e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 12,
} as const;

const PIPELINE_COLORS = [
  '#6b7280',
  '#38bdf8',
  '#60a5fa',
  '#818cf8',
  '#fbbf24',
  '#34d399',
  '#f87171',
];

const CATEGORY_COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171'];

export default function AdminDashboard() {
  const { state } = useStore();

  const kpis = adminKpis(state);
  const pipeline = applicationsByStatus(state);
  const categories = evaluationsByCategory(state);
  const progress = milestoneProgressByStartup(state);
  const submissions = submissionsOverTime(state);

  const queue = state.applications
    .filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')
    .sort(
      (a, b) =>
        new Date(a.submittedAt ?? a.updatedAt).getTime() -
        new Date(b.submittedAt ?? b.updatedAt).getTime(),
    );

  const recent = state.activities.slice(0, 8);

  return (
    <>
      <PageHeader
        title="Incubation Center"
        subtitle="Live view of the application pipeline, portfolio health and outstanding decisions."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Applications"
          value={kpis.totalApplications}
          hint={`${kpis.awaitingAction} awaiting action`}
          icon={FileText}
          accent="purple"
        />
        <StatCard
          label="Portfolio startups"
          value={kpis.activeStartups}
          hint={`${kpis.unassignedStartups} without a mentor`}
          icon={Building2}
          accent={kpis.unassignedStartups > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          label="Average score"
          value={kpis.averageScore ? `${kpis.averageScore}%` : '—'}
          hint={`${state.evaluations.length} evaluations`}
          icon={ClipboardCheck}
          accent="blue"
        />
        <StatCard
          label="Milestone progress"
          value={`${kpis.milestoneCompletion}%`}
          hint={`${kpis.overdueMilestones} overdue`}
          icon={Target}
          accent={kpis.overdueMilestones > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          label="Active mentors"
          value={kpis.activeMentors}
          icon={Users}
        />
        <StatCard
          label="Funding approved"
          value={formatINR(kpis.fundingApproved)}
          hint={`${kpis.pendingFunding} pending`}
          icon={IndianRupee}
          accent="emerald"
        />
        <StatCard
          label="Pending funding"
          value={kpis.pendingFunding}
          icon={IndianRupee}
          accent={kpis.pendingFunding > 0 ? 'amber' : 'slate'}
        />
        <StatCard
          label="Pending resources"
          value={kpis.pendingResources}
          icon={ActivityIcon}
          accent={kpis.pendingResources > 0 ? 'amber' : 'slate'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-bold text-white">
            Application pipeline
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={26}>
                  {pipeline.map((row, i) => (
                    <Cell key={row.name} fill={PIPELINE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-bold text-white">
            Evaluation outcomes
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
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
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {categories.map((row, i) => (
                    <Cell key={row.name} fill={CATEGORY_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-bold text-white">
            Milestone progress by startup
          </h2>
          {progress.length === 0 ? (
            <EmptyState title="No milestones yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress} layout="vertical" margin={{ left: 30 }}>
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
                    width={100}
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`${value}%`, 'Avg progress']}
                  />
                  <Bar
                    dataKey="value"
                    fill="#818cf8"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-bold text-white">
            Submissions — last 6 months
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissions} margin={{ left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#a78bfa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Review queue</h2>
            <Link
              to="/admin/applications"
              className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200"
            >
              Open <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {queue.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Queue is clear"
              message="No applications are waiting on a decision."
            />
          ) : (
            <ul className="space-y-2">
              {queue.map((application) => {
                const evaluation = state.evaluations.find(
                  (e) => e.applicationId === application.id,
                );
                return (
                  <li
                    key={application.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {application.form.companyName}
                      </p>
                      <p className="text-[10px] text-white/35">
                        {application.submittedAt
                          ? `submitted ${relativeDays(application.submittedAt)}`
                          : 'not submitted'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {evaluation && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[evaluation.category]}`}
                        >
                          {evaluation.percentage}%
                        </span>
                      )}
                      <StatusBadge status={application.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recent activity</h2>
            <Link
              to="/admin/activity"
              className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200"
            >
              Full log <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {recent.map((entry) => (
              <li key={entry.id} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400/60" />
                <div className="min-w-0">
                  <p className="text-[11px] leading-snug text-white/70">
                    {entry.summary}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {entry.actorName} · {relativeDays(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {kpis.unassignedStartups > 0 && (
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-amber-100">
                {kpis.unassignedStartups} accepted startup
                {kpis.unassignedStartups === 1 ? '' : 's'} without a mentor
              </h2>
              <p className="mt-0.5 text-xs text-amber-200/60">
                Milestones and feedback only start once a mentor is assigned.
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={
                    ((kpis.activeStartups - kpis.unassignedStartups) /
                      Math.max(1, kpis.activeStartups)) *
                    100
                  }
                  showLabel
                />
              </div>
              <Link
                to="/admin/startups"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200 hover:text-amber-100"
              >
                Assign mentors <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
