import { useMemo, useState } from 'react';
import { Building2, Search, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  formatINR,
  founderName,
  mentorLoads,
  milestonesForStartup,
  programName,
} from '@/store/selectors';
import type { Startup } from '@/store/types';

export default function AdminStartupsPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [assigning, setAssigning] = useState<Startup | null>(null);

  // Only startups whose application was accepted are in the portfolio.
  const portfolio = useMemo(() => {
    const acceptedIds = new Set(
      state.applications
        .filter((a) => a.status === 'ACCEPTED')
        .map((a) => a.startupId),
    );
    return state.startups
      .filter((s) => acceptedIds.has(s.id))
      .filter((s) => (onlyUnassigned ? !s.mentorId : true))
      .filter((s) => {
        if (!query.trim()) return true;
        const needle = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(needle) ||
          s.sector.toLowerCase().includes(needle) ||
          s.domain.toLowerCase().includes(needle)
        );
      });
  }, [state, query, onlyUnassigned]);

  const unassignedCount = state.startups.filter((s) => {
    const app = applicationForStartup(state, s.id);
    return app?.status === 'ACCEPTED' && !s.mentorId;
  }).length;

  return (
    <>
      <PageHeader
        title="Portfolio Startups"
        subtitle="Accepted startups, their assigned mentor and their milestone progress."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startups…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400/60"
          />
        </div>
        <button
          onClick={() => setOnlyUnassigned((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            onlyUnassigned
              ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
              : 'border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]'
          }`}
        >
          Needs a mentor ({unassignedCount})
        </button>
      </div>

      {portfolio.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No startups match"
          message="Accepted applications appear here as portfolio startups."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {portfolio.map((startup) => {
            const mentor = state.mentors.find((m) => m.id === startup.mentorId);
            const milestones = milestonesForStartup(state, startup.id);
            const average = milestones.length
              ? Math.round(
                  milestones.reduce((sum, m) => sum + m.progress, 0) /
                    milestones.length,
                )
              : 0;
            const overdue = milestones.filter(
              (m) => m.status === 'OVERDUE',
            ).length;

            return (
              <article
                key={startup.id}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white">
                      {startup.name}
                    </h3>
                    <p className="text-[11px] text-white/40">
                      {startup.domain} · {startup.city}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/30">
                      {founderName(state, startup.founderId)}
                      {startup.programId &&
                        ` · ${programName(state, startup.programId)}`}
                    </p>
                  </div>
                  <StatusBadge status={startup.stage.toUpperCase()} label={startup.stage} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/30">
                      Funding raised
                    </dt>
                    <dd className="text-xs font-semibold text-white">
                      {formatINR(startup.fundingRaised)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/30">
                      Milestones
                    </dt>
                    <dd className="text-xs font-semibold text-white">
                      {milestones.filter((m) => m.status === 'COMPLETED').length}
                      /{milestones.length}
                      {overdue > 0 && (
                        <span className="ml-1.5 text-red-300">
                          {overdue} overdue
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <ProgressBar value={average} overdue={overdue > 0} showLabel />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3.5">
                  {mentor ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/80">
                        {mentor.avatarSeed}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-white">
                          {mentor.firstName} {mentor.lastName}
                        </p>
                        <p className="truncate text-[10px] text-white/35">
                          {mentor.expertise.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="rounded-md bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-200">
                      No mentor assigned
                    </span>
                  )}

                  <Button
                    size="sm"
                    variant={mentor ? 'ghost' : 'default'}
                    onClick={() => setAssigning(startup)}
                  >
                    <UserPlus className="mr-1 h-3.5 w-3.5" />
                    {mentor ? 'Change' : 'Assign'}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {assigning && (
        <Modal
          open
          onClose={() => setAssigning(null)}
          size="lg"
          title={`Assign a mentor — ${assigning.name}`}
          description="Capacity and expertise are shown so you can match deliberately."
        >
          <div className="space-y-2">
            {mentorLoads(state).map(({ mentor, startups, atCapacity }) => {
              const current = assigning.mentorId === mentor.id;
              const disabled = atCapacity && !current;
              return (
                <button
                  key={mentor.id}
                  disabled={disabled}
                  onClick={() => {
                    dispatch({
                      type: 'MENTOR_ASSIGN',
                      startupId: assigning.id,
                      mentorId: current ? null : mentor.id,
                    });
                    toast(
                      current
                        ? `Mentor removed from ${assigning.name}`
                        : `${mentor.firstName} ${mentor.lastName} assigned to ${assigning.name}`,
                      current
                        ? undefined
                        : 'Both the mentor and the founder have been notified.',
                      current ? 'warning' : 'success',
                    );
                    setAssigning(null);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                    current
                      ? 'border-emerald-400/40 bg-emerald-500/10'
                      : disabled
                        ? 'cursor-not-allowed border-white/5 bg-white/[0.01] opacity-45'
                        : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/80">
                    {mentor.avatarSeed}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {mentor.firstName} {mentor.lastName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          atCapacity ? 'text-red-300' : 'text-emerald-300'
                        }`}
                      >
                        {startups.length}/{mentor.maxStartups} startups
                      </span>
                      {current && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-200">
                          current — click to unassign
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-white/40">
                      {mentor.title} · {mentor.organization}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {mentor.expertise.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                    {startups.length > 0 && (
                      <span className="mt-1 block text-[10px] text-white/30">
                        Currently: {startups.map((s) => s.name).join(', ')}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
}
