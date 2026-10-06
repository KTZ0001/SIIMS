import { IndianRupee, MapPin, Target, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  formatDate,
  formatINR,
  founderName,
  investmentOpportunities,
  mentorById,
  milestonesForStartup,
} from '@/store/selectors';

export default function InvestorOpportunitiesPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();

  const opportunities = investmentOpportunities(state);
  const totalSought = opportunities.reduce(
    (sum, o) => sum + o.requestedTotal,
    0,
  );
  const openRequests = opportunities.reduce(
    (sum, o) => sum + o.openRequests.length,
    0,
  );

  return (
    <>
      <PageHeader
        title="Investment Opportunities"
        subtitle="Portfolio startups with open funding requests. Read-only — expressing interest notifies the founder and the incubation center, nothing more."
        actions={
          <span className="self-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/55">
            Read-only
          </span>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Open opportunities"
          value={opportunities.length}
          icon={TrendingUp}
          accent="amber"
        />
        <StatCard
          label="Open requests"
          value={openRequests}
          icon={IndianRupee}
        />
        <StatCard
          label="Total sought"
          value={formatINR(totalSought)}
          icon={IndianRupee}
          accent="emerald"
        />
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No open opportunities"
          message="No portfolio startup currently has a pending funding request."
        />
      ) : (
        <div className="space-y-3">
          {opportunities.map(({ startup, openRequests: requests, requestedTotal }) => {
            const mentor = mentorById(state, startup.mentorId);
            const milestones = milestonesForStartup(state, startup.id);
            const average = milestones.length
              ? Math.round(
                  milestones.reduce((sum, m) => sum + m.progress, 0) /
                    milestones.length,
                )
              : 0;

            return (
              <article
                key={startup.id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-500/40 text-xs font-bold text-white">
                      {startup.logoSeed}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {startup.name}
                        </h3>
                        <StatusBadge
                          status={startup.stage.toUpperCase()}
                          label={startup.stage}
                        />
                      </div>
                      <p className="text-[11px] text-white/45">
                        {startup.tagline}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-white/30">
                        <span>{startup.domain}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {startup.city}
                        </span>
                        <span>{founderName(state, startup.founderId)}</span>
                        {mentor && (
                          <span>
                            mentored by {mentor.firstName} {mentor.lastName}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/35">
                      Seeking
                    </p>
                    <p className="text-lg font-bold text-amber-200">
                      {formatINR(requestedTotal)}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {requests.map((request) => (
                    <li
                      key={request.id}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">
                            {formatINR(request.amount)}
                            <span className="ml-2 text-[10px] font-normal text-white/40">
                              {request.category}
                            </span>
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">
                            {request.purpose}
                          </p>
                          <p className="mt-1 text-[10px] text-white/30">
                            Requested {formatDate(request.requestedAt)}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3.5">
                  <div className="min-w-40 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/30">
                        <Target className="h-3 w-3" /> Milestone progress
                      </span>
                      <span className="text-[10px] text-white/45">
                        {milestones.length
                          ? `${average}% across ${milestones.length}`
                          : 'none set'}
                      </span>
                    </div>
                    <ProgressBar value={average} />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: 'EXPRESS_INTEREST',
                        startupId: startup.id,
                      });
                      toast(
                        'Interest registered',
                        `${startup.name} and the incubation center have been notified.`,
                      );
                    }}
                  >
                    Express interest
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
