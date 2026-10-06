import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ClipboardCheck,
  Eye,
  FileText,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField } from '@/components/shared/FormField';
import { EvaluationScorecard } from '@/components/admin/EvaluationScorecard';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { CATEGORY_STYLES, EVALUATION_CRITERIA } from '@/store/scoring';
import {
  formatDate,
  formatINR,
  founderName,
  programName,
  relativeDays,
} from '@/store/selectors';
import {
  APPLICATION_STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from '@/store/types';

type SortKey = 'recent' | 'score' | 'name';

const FILTERS: (ApplicationStatus | 'ALL')[] = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'EVALUATED',
  'SHORTLISTED',
  'ACCEPTED',
  'REJECTED',
  'DRAFT',
];

/** Which decisions make sense from a given stage. */
function nextActions(status: ApplicationStatus): ApplicationStatus[] {
  switch (status) {
    case 'SUBMITTED':
      return ['UNDER_REVIEW', 'REJECTED'];
    case 'UNDER_REVIEW':
      return ['REJECTED'];
    case 'EVALUATED':
      return ['SHORTLISTED', 'ACCEPTED', 'REJECTED'];
    case 'SHORTLISTED':
      return ['ACCEPTED', 'REJECTED'];
    default:
      return [];
  }
}

export default function AdminApplicationsPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState<SortKey>('recent');

  const [detail, setDetail] = useState<Application | null>(null);
  const [scoring, setScoring] = useState<Application | null>(null);
  const [decision, setDecision] = useState<{
    application: Application;
    status: ApplicationStatus;
  } | null>(null);
  const [note, setNote] = useState('');

  const rows = useMemo(() => {
    const scoreOf = (a: Application) =>
      state.evaluations.find((e) => e.applicationId === a.id)?.percentage ?? -1;

    return state.applications
      .filter((a) => (filter === 'ALL' ? true : a.status === filter))
      .filter((a) => {
        if (!query.trim()) return true;
        const needle = query.toLowerCase();
        return (
          a.form.companyName.toLowerCase().includes(needle) ||
          a.form.domain.toLowerCase().includes(needle) ||
          a.form.sector.toLowerCase().includes(needle) ||
          founderName(state, a.founderId).toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        if (sort === 'name')
          return a.form.companyName.localeCompare(b.form.companyName);
        if (sort === 'score') return scoreOf(b) - scoreOf(a);
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
  }, [state, query, filter, sort]);

  function openDecision(application: Application, status: ApplicationStatus) {
    setDecision({ application, status });
    setNote('');
  }

  function confirmDecision() {
    if (!decision) return;
    dispatch({
      type: 'APPLICATION_SET_STATUS',
      applicationId: decision.application.id,
      status: decision.status,
      note: note.trim() || null,
    });
    toast(
      `${decision.application.form.companyName} — ${APPLICATION_STATUS_LABELS[decision.status].toLowerCase()}`,
      decision.status === 'ACCEPTED'
        ? 'Assign a mentor next so milestones can begin.'
        : 'The founder has been notified.',
      decision.status === 'REJECTED' ? 'warning' : 'success',
    );
    setDecision(null);
    setDetail(null);
  }

  const counts = FILTERS.reduce<Record<string, number>>((acc, key) => {
    acc[key] =
      key === 'ALL'
        ? state.applications.length
        : state.applications.filter((a) => a.status === key).length;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Application Management"
        subtitle="Review, score and decide on incoming applications. Every change is visible to the founder immediately."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, founder, domain or sector…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400/60"
          />
        </div>
        <button
          onClick={() =>
            setSort((s) =>
              s === 'recent' ? 'score' : s === 'score' ? 'name' : 'recent',
            )
          }
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.08]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sort === 'recent'
            ? 'Most recent'
            : sort === 'score'
              ? 'Highest score'
              : 'Name A–Z'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              filter === key
                ? 'border-purple-400/50 bg-purple-500/15 text-white'
                : 'border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.07]'
            }`}
          >
            {key === 'ALL'
              ? 'All'
              : APPLICATION_STATUS_LABELS[key as ApplicationStatus]}
            <span className="ml-1.5 text-white/30">{counts[key]}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications match"
          message="Try a different search term or filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                {['Startup', 'Founder', 'Stage', 'Score', 'Status', 'Updated', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((application) => {
                const evaluation = state.evaluations.find(
                  (e) => e.applicationId === application.id,
                );
                return (
                  <tr
                    key={application.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-white">
                        {application.form.companyName}
                      </p>
                      <p className="text-[11px] text-white/35">
                        {application.form.domain}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {founderName(state, application.founderId)}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {application.form.stage}
                    </td>
                    <td className="px-4 py-3">
                      {evaluation ? (
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[evaluation.category]}`}
                        >
                          {evaluation.percentage}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-white/35">
                      {relativeDays(application.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDetail(application)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {application.status !== 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setScoring(application)}
                          >
                            <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                            {evaluation ? 'Re-score' : 'Evaluate'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {detail && (
        <ApplicationDetail
          application={detail}
          onClose={() => setDetail(null)}
          onEvaluate={() => {
            setScoring(detail);
            setDetail(null);
          }}
          onDecide={(status) => openDecision(detail, status)}
        />
      )}

      {scoring && (
        <EvaluationScorecard
          key={scoring.id}
          application={scoring}
          open
          onClose={() => setScoring(null)}
        />
      )}

      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={
          decision
            ? `${APPLICATION_STATUS_LABELS[decision.status]} — ${decision.application.form.companyName}`
            : ''
        }
        description="The founder sees this note on their application timeline."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDecision}>
              Confirm{' '}
              {decision
                ? APPLICATION_STATUS_LABELS[decision.status].toLowerCase()
                : ''}
            </Button>
          </>
        }
      >
        <Field
          label="Note to founder"
          hint="Optional, but a rejection without a reason is not much use to anyone."
        >
          <TextAreaField value={note} onChange={setNote} rows={4} />
        </Field>
      </Modal>
    </>
  );
}

function ApplicationDetail({
  application,
  onClose,
  onEvaluate,
  onDecide,
}: {
  application: Application;
  onClose: () => void;
  onEvaluate: () => void;
  onDecide: (status: ApplicationStatus) => void;
}) {
  const { state } = useStore();
  const evaluation = state.evaluations.find(
    (e) => e.applicationId === application.id,
  );
  const form = application.form;
  const actions = nextActions(application.status);

  const blocks: [string, string][] = [
    ['Problem', form.problemStatement],
    ['Target customer', form.targetCustomer],
    ['Solution', form.solution],
    ['Unique value', form.uniqueValue],
    ['Target market', form.targetMarket],
    ['Market size', form.marketSize],
    ['Competitors', form.competitors],
    ['Business model', form.businessModel],
    ['Revenue streams', form.revenueStreams],
    ['Traction', form.tractionSummary],
    ['Key metrics', form.keyMetrics],
    ['Team', form.teamSummary],
    ['Use of funds', form.fundingUse],
    ['Incubation goals', form.incubationGoals],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={form.companyName}
      description={`${form.domain} · ${form.city} · ${form.stage} · founded ${form.foundedYear}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {application.status !== 'DRAFT' && (
            <Button variant="outline" onClick={onEvaluate}>
              <ClipboardCheck className="mr-1.5 h-4 w-4" />
              {evaluation ? 'Re-score' : 'Evaluate'}
            </Button>
          )}
          {actions.map((status) => (
            <Button
              key={status}
              variant={status === 'REJECTED' ? 'destructive' : 'default'}
              onClick={() => onDecide(status)}
            >
              {APPLICATION_STATUS_LABELS[status]}
            </Button>
          ))}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={application.status} />
          {evaluation && (
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[evaluation.category]}`}
            >
              {evaluation.percentage}% · {evaluation.category}
            </span>
          )}
          <span className="text-[11px] text-white/35">
            {application.submittedAt
              ? `Submitted ${formatDate(application.submittedAt)}`
              : 'Not yet submitted'}
          </span>
          {application.programId && (
            <span className="text-[11px] text-white/35">
              · {programName(state, application.programId)}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Founder" value={founderName(state, application.founderId)} />
          <MiniStat label="Team size" value={String(form.teamSize)} />
          <MiniStat
            label="Funding requested"
            value={formatINR(form.fundingRequested)}
          />
        </div>

        {evaluation && (
          <section className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-bold text-white">
              Scorecard by {evaluation.evaluatorName} ·{' '}
              {formatDate(evaluation.createdAt)}
            </p>
            <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {EVALUATION_CRITERIA.map((criterion) => (
                <div
                  key={criterion.key}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-[11px] text-white/45">
                    {criterion.label}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-white/75">
                    {evaluation.scores[criterion.key]}/10
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
              {evaluation.strengths && (
                <Block label="Strengths" body={evaluation.strengths} />
              )}
              {evaluation.concerns && (
                <Block label="Concerns" body={evaluation.concerns} />
              )}
              {evaluation.recommendation && (
                <Block
                  label="Recommendation"
                  body={evaluation.recommendation}
                />
              )}
            </div>
          </section>
        )}

        <div className="space-y-3">
          {blocks.map(([label, body]) => (
            <Block key={label} label={label} body={body || '—'} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
