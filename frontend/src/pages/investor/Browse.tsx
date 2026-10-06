import { useMemo, useState } from 'react';
import { Building2, Eye, MapPin, Search, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  formatDate,
  formatINR,
  founderName,
  fundingForStartup,
  investableStartups,
  mentorById,
  milestonesForStartup,
  programName,
  searchStartups,
  startupDomains,
  startupStages,
} from '@/store/selectors';
import type { Startup } from '@/store/types';

export default function InvestorBrowsePage() {
  const { state, dispatch } = useStore();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [stage, setStage] = useState('');
  const [detail, setDetail] = useState<Startup | null>(null);

  const domains = useMemo(() => startupDomains(state), [state]);
  const stages = useMemo(() => startupStages(state), [state]);
  const all = useMemo(() => investableStartups(state), [state]);
  const results = useMemo(
    () => searchStartups(state, { query, domain, stage }),
    [state, query, domain, stage],
  );

  const filtered = query.trim() !== '' || domain !== '' || stage !== '';

  function expressInterest(startup: Startup) {
    dispatch({ type: 'EXPRESS_INTEREST', startupId: startup.id });
    toast(
      'Interest registered',
      `${startup.name} and the incubation center have been notified.`,
    );
  }

  return (
    <>
      <PageHeader
        title="Browse Startups"
        subtitle="Accepted portfolio startups. This is a read-only lens — you can search, review and express interest."
        actions={
          <span className="self-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/55">
            Read-only
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Portfolio startups"
          value={all.length}
          icon={Building2}
          accent="amber"
        />
        <StatCard
          label="Showing"
          value={results.length}
          hint={filtered ? 'filtered' : 'all'}
          icon={Search}
        />
        <StatCard label="Industries" value={domains.length} icon={Sparkles} />
        <StatCard label="Stages" value={stages.length} icon={Users} />
      </div>

      {/* R3 — search and filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, industry, sector or city…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400/60"
          />
        </div>

        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-purple-400/60"
        >
          <option value="" className="bg-[#0b0b0e]">
            All industries
          </option>
          {domains.map((d) => (
            <option key={d} value={d} className="bg-[#0b0b0e]">
              {d}
            </option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-purple-400/60"
        >
          <option value="" className="bg-[#0b0b0e]">
            All stages
          </option>
          {stages.map((s) => (
            <option key={s} value={s} className="bg-[#0b0b0e]">
              {s}
            </option>
          ))}
        </select>

        {filtered && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery('');
              setDomain('');
              setStage('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No startups match"
          message="Try a different search term, industry or stage."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((startup) => {
            const milestones = milestonesForStartup(state, startup.id);
            const average = milestones.length
              ? Math.round(
                  milestones.reduce((sum, m) => sum + m.progress, 0) /
                    milestones.length,
                )
              : 0;
            const mentor = mentorById(state, startup.mentorId);

            return (
              <article
                key={startup.id}
                className="flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-500/40 text-xs font-bold text-white">
                    {startup.logoSeed}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white">
                      {startup.name}
                    </h3>
                    <p className="text-[11px] text-white/45">
                      {startup.tagline}
                    </p>
                  </div>
                  <StatusBadge
                    status={startup.stage.toUpperCase()}
                    label={startup.stage}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55">
                    {startup.domain}
                  </span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55">
                    {startup.sector}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55">
                    <MapPin className="h-2.5 w-2.5" />
                    {startup.city}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/30">
                      Raised
                    </dt>
                    <dd className="text-xs font-semibold text-white">
                      {formatINR(startup.fundingRaised)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-white/30">
                      Goal
                    </dt>
                    <dd className="text-xs font-semibold text-white">
                      {formatINR(startup.fundingGoal)}
                    </dd>
                  </div>
                </dl>

                {startup.fundingGoal > 0 && (
                  <div className="mt-2.5">
                    <ProgressBar
                      value={
                        (startup.fundingRaised / startup.fundingGoal) * 100
                      }
                      showLabel
                    />
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3.5">
                  <span className="min-w-0 text-[10px] text-white/35">
                    {mentor
                      ? `Mentored by ${mentor.firstName} ${mentor.lastName}`
                      : 'No mentor assigned'}
                    {milestones.length > 0 && ` · ${average}% milestones`}
                  </span>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetail(startup)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => expressInterest(startup)}
                    >
                      Express interest
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detail && (
        <StartupDetail
          startup={detail}
          onClose={() => setDetail(null)}
          onInterest={() => {
            expressInterest(detail);
            setDetail(null);
          }}
        />
      )}
    </>
  );
}

function StartupDetail({
  startup,
  onClose,
  onInterest,
}: {
  startup: Startup;
  onClose: () => void;
  onInterest: () => void;
}) {
  const { state } = useStore();
  const application = applicationForStartup(state, startup.id);
  const mentor = mentorById(state, startup.mentorId);
  const milestones = milestonesForStartup(state, startup.id);
  const funding = fundingForStartup(state, startup.id);
  const form = application?.form;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={startup.name}
      description={`${startup.domain} · ${startup.city} · ${startup.stage} · founded ${startup.foundedYear}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onInterest}>Express interest</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Mini label="Founder" value={founderName(state, startup.founderId)} />
          <Mini
            label="Mentor"
            value={
              mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Unassigned'
            }
          />
          <Mini
            label="Programme"
            value={programName(state, startup.programId) ?? '—'}
          />
          <Mini label="Raised" value={formatINR(startup.fundingRaised)} />
          <Mini label="Goal" value={formatINR(startup.fundingGoal)} />
          <Mini label="Team" value={`${startup.teamMembers.length} listed`} />
        </div>

        <Block label="About" body={startup.description} />

        {form && (
          <>
            <Block label="Problem" body={form.problemStatement} />
            <Block label="Solution" body={form.solution} />
            <Block label="Target market" body={form.targetMarket} />
            <Block label="Business model" body={form.businessModel} />
            <Block label="Traction" body={form.tractionSummary} />
            <Block label="Key metrics" body={form.keyMetrics} />
            <Block label="Team" body={form.teamSummary} />
          </>
        )}

        {milestones.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Milestones
            </p>
            <ul className="space-y-2">
              {milestones.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold text-white">
                      {m.title}
                    </p>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={m.progress}
                      overdue={m.status === 'OVERDUE'}
                      showLabel
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {funding.length > 0 && (
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Funding history
            </p>
            <ul className="space-y-2">
              {funding.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">
                      {formatINR(f.amount)}
                      <span className="ml-2 text-[10px] font-normal text-white/40">
                        {f.category}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/35">
                      {formatDate(f.requestedAt)}
                    </p>
                  </div>
                  <StatusBadge status={f.status} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
