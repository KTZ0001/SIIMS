import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Field,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/shared/FormField';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  applicationForStartup,
  canSubmit,
  completedStepCount,
  evaluationForApplication,
  isStepComplete,
  startupForFounder,
} from '@/store/selectors';
import { CATEGORY_STYLES, EVALUATION_CRITERIA } from '@/store/scoring';
import {
  APPLICATION_STEPS,
  STARTUP_STAGES,
  type ApplicationForm,
  type StartupStage,
} from '@/store/types';
import { FileText } from 'lucide-react';

const STAGE_OPTIONS = STARTUP_STAGES.map((s) => ({ value: s, label: s }));

export default function FounderApplicationPage() {
  const { state, actor, dispatch } = useStore();
  const toast = useToast();

  const startup = startupForFounder(state, actor.id);
  const application = applicationForStartup(state, startup?.id ?? null);
  const evaluation = evaluationForApplication(state, application);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ApplicationForm | null>(
    application ? application.form : null,
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Keep the local draft in step with the store if the application changes
  // underneath us (for example after a demo reset).
  const formKey = application?.id ?? '';
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setLastKey(formKey);
    setDraft(application ? application.form : null);
    setStep(0);
  }

  const stepsDone = useMemo(
    () => (draft ? completedStepCount(draft) : 0),
    [draft],
  );
  const submittable = draft ? canSubmit(draft) : false;

  if (!application || !startup || !draft) {
    return (
      <>
        <PageHeader title="Application" />
        <EmptyState
          icon={FileText}
          title="No application found"
          message="This founder account has no startup profile attached."
        />
      </>
    );
  }

  const editable = application.status === 'DRAFT';

  function set<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K],
  ) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveDraft() {
    if (!draft || !application) return;
    dispatch({
      type: 'APPLICATION_SAVE_DRAFT',
      applicationId: application.id,
      form: draft,
      completedSteps: completedStepCount(draft),
    });
    setSavedAt(new Date().toLocaleTimeString());
    toast('Draft saved', 'Your progress is stored locally and survives a refresh.');
  }

  function submit() {
    if (!draft || !application) return;
    dispatch({
      type: 'APPLICATION_SAVE_DRAFT',
      applicationId: application.id,
      form: draft,
      completedSteps: completedStepCount(draft),
    });
    dispatch({ type: 'APPLICATION_SUBMIT', applicationId: application.id });
    toast(
      'Application submitted',
      'It is now in the incubation center review queue.',
    );
  }

  return (
    <>
      <PageHeader
        title="Incubation Application"
        subtitle={
          editable
            ? 'Complete all eight steps, then submit for review by the incubation center.'
            : 'Your application has been submitted. Track its progress on the timeline.'
        }
        actions={<StatusBadge status={application.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-5">
          {editable ? (
            <>
              {/* Step rail */}
              <div className="flex flex-wrap gap-1.5">
                {APPLICATION_STEPS.map((name, index) => {
                  const done = isStepComplete(draft, index);
                  const active = index === step;
                  return (
                    <button
                      key={name}
                      onClick={() => setStep(index)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        active
                          ? 'border-purple-400/50 bg-purple-500/15 text-white'
                          : done
                            ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200/80 hover:bg-emerald-500/15'
                            : 'border-white/10 bg-white/[0.03] text-white/40 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                          done
                            ? 'bg-emerald-400/25 text-emerald-200'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {done ? <Check className="h-2.5 w-2.5" /> : index + 1}
                      </span>
                      {name}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6">
                <div className="mb-5 flex items-baseline justify-between gap-3">
                  <h2 className="text-base font-bold text-white">
                    Step {step + 1} · {APPLICATION_STEPS[step]}
                  </h2>
                  <span className="text-[11px] text-white/35">
                    {stepsDone} of {APPLICATION_STEPS.length} steps complete
                  </span>
                </div>

                <StepFields step={step} form={draft} set={set} />

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-5">
                  <Button
                    variant="ghost"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>

                  <div className="flex items-center gap-2">
                    {savedAt && (
                      <span className="text-[11px] text-emerald-300/70">
                        Draft saved {savedAt}
                      </span>
                    )}
                    <Button variant="outline" onClick={saveDraft}>
                      <Save className="mr-1.5 h-4 w-4" /> Save draft
                    </Button>
                    {step < APPLICATION_STEPS.length - 1 ? (
                      <Button
                        onClick={() =>
                          setStep((s) =>
                            Math.min(APPLICATION_STEPS.length - 1, s + 1),
                          )
                        }
                      >
                        Next <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button disabled={!submittable} onClick={submit}>
                        <Send className="mr-1.5 h-4 w-4" /> Submit application
                      </Button>
                    )}
                  </div>
                </div>

                {step === APPLICATION_STEPS.length - 1 && !submittable && (
                  <p className="mt-3 text-[11px] text-amber-300/80">
                    Every step needs its required fields filled before you can
                    submit. {APPLICATION_STEPS.length - stepsDone} step
                    {APPLICATION_STEPS.length - stepsDone === 1 ? '' : 's'} still
                    incomplete.
                  </p>
                )}
              </div>
            </>
          ) : (
            <SubmittedSummary form={application.form} />
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h3 className="mb-4 text-sm font-bold text-white">
              Application status
            </h3>
            <StatusTimeline application={application} />
          </section>

          {evaluation && (
            <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
              <h3 className="mb-3 text-sm font-bold text-white">
                Evaluation result
              </h3>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {evaluation.percentage}%
                </span>
                <span className="text-xs text-white/40">
                  {evaluation.total}/{evaluation.maxTotal}
                </span>
              </div>
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[evaluation.category]}`}
              >
                {evaluation.category}
              </span>

              <dl className="mt-4 space-y-1.5">
                {EVALUATION_CRITERIA.map((criterion) => (
                  <div
                    key={criterion.key}
                    className="flex items-center justify-between gap-2"
                  >
                    <dt className="truncate text-[11px] text-white/45">
                      {criterion.label}
                    </dt>
                    <dd className="shrink-0 text-[11px] font-semibold tabular-nums text-white/70">
                      {evaluation.scores[criterion.key]}/10
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 space-y-3 border-t border-white/5 pt-3">
                <Note label="Strengths" body={evaluation.strengths} />
                <Note label="Concerns" body={evaluation.concerns} />
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function Note({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">{body}</p>
    </div>
  );
}

function SubmittedSummary({ form }: { form: ApplicationForm }) {
  const sections: { heading: string; rows: [string, string][] }[] = [
    {
      heading: 'Venture Basics',
      rows: [
        ['Company', form.companyName],
        ['Domain', form.domain],
        ['Sector', form.sector],
        ['Stage', form.stage],
        ['City', form.city],
        ['Founded', String(form.foundedYear)],
      ],
    },
    {
      heading: 'Problem & Solution',
      rows: [
        ['Problem', form.problemStatement],
        ['Target customer', form.targetCustomer],
        ['Solution', form.solution],
        ['Unique value', form.uniqueValue],
      ],
    },
    {
      heading: 'Market & Model',
      rows: [
        ['Target market', form.targetMarket],
        ['Market size', form.marketSize],
        ['Competitors', form.competitors],
        ['Business model', form.businessModel],
        ['Revenue streams', form.revenueStreams],
      ],
    },
    {
      heading: 'Traction, Team & Ask',
      rows: [
        ['Traction', form.tractionSummary],
        ['Key metrics', form.keyMetrics],
        ['Team', form.teamSummary],
        ['Team size', String(form.teamSize)],
        ['Funding requested', `₹${form.fundingRequested.toLocaleString('en-IN')}`],
        ['Use of funds', form.fundingUse],
        ['Incubation goals', form.incubationGoals],
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section
          key={section.heading}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
        >
          <h3 className="mb-3 text-sm font-bold text-white">
            {section.heading}
          </h3>
          <dl className="space-y-3">
            {section.rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {label}
                </dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-white/70">
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function StepFields({
  step,
  form,
  set,
}: {
  step: number;
  form: ApplicationForm;
  set: <K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K],
  ) => void;
}) {
  switch (step) {
    case 0:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required>
            <TextField
              value={form.companyName}
              onChange={(v) => set('companyName', v)}
              placeholder="ShopThread"
            />
          </Field>
          <Field label="Domain" required>
            <TextField
              value={form.domain}
              onChange={(v) => set('domain', v)}
              placeholder="Retail Technology"
            />
          </Field>
          <Field label="Sector" required>
            <TextField
              value={form.sector}
              onChange={(v) => set('sector', v)}
              placeholder="Commerce"
            />
          </Field>
          <Field label="Stage" required>
            <SelectField<StartupStage>
              value={form.stage}
              onChange={(v) => set('stage', v)}
              options={STAGE_OPTIONS}
            />
          </Field>
          <Field label="City" required>
            <TextField value={form.city} onChange={(v) => set('city', v)} />
          </Field>
          <Field label="Year founded" required>
            <TextField
              type="number"
              value={form.foundedYear}
              onChange={(v) => set('foundedYear', Number(v) || 0)}
            />
          </Field>
          <Field label="Website" hint="Optional" className="sm:col-span-2">
            <TextField
              type="url"
              value={form.website}
              onChange={(v) => set('website', v)}
              placeholder="https://"
            />
          </Field>
        </div>
      );

    case 1:
      return (
        <div className="space-y-4">
          <Field
            label="What problem are you solving?"
            required
            hint="Describe the problem as the person experiencing it would."
          >
            <TextAreaField
              value={form.problemStatement}
              onChange={(v) => set('problemStatement', v)}
              rows={5}
            />
          </Field>
          <Field label="Who has this problem?" required>
            <TextAreaField
              value={form.targetCustomer}
              onChange={(v) => set('targetCustomer', v)}
              rows={3}
            />
          </Field>
        </div>
      );

    case 2:
      return (
        <div className="space-y-4">
          <Field label="Your solution" required>
            <TextAreaField
              value={form.solution}
              onChange={(v) => set('solution', v)}
              rows={5}
            />
          </Field>
          <Field
            label="What makes it different?"
            required
            hint="Why can't an incumbent do this tomorrow?"
          >
            <TextAreaField
              value={form.uniqueValue}
              onChange={(v) => set('uniqueValue', v)}
              rows={4}
            />
          </Field>
        </div>
      );

    case 3:
      return (
        <div className="space-y-4">
          <Field label="Target market" required>
            <TextAreaField
              value={form.targetMarket}
              onChange={(v) => set('targetMarket', v)}
              rows={3}
            />
          </Field>
          <Field label="Market size" required hint="Show your working.">
            <TextAreaField
              value={form.marketSize}
              onChange={(v) => set('marketSize', v)}
              rows={3}
            />
          </Field>
          <Field label="Competitors" required>
            <TextAreaField
              value={form.competitors}
              onChange={(v) => set('competitors', v)}
              rows={3}
            />
          </Field>
        </div>
      );

    case 4:
      return (
        <div className="space-y-4">
          <Field label="Business model" required>
            <TextAreaField
              value={form.businessModel}
              onChange={(v) => set('businessModel', v)}
              rows={3}
            />
          </Field>
          <Field label="Revenue streams" required>
            <TextAreaField
              value={form.revenueStreams}
              onChange={(v) => set('revenueStreams', v)}
              rows={3}
            />
          </Field>
          <Field label="Pricing notes" hint="Optional">
            <TextAreaField
              value={form.pricingNotes}
              onChange={(v) => set('pricingNotes', v)}
              rows={3}
            />
          </Field>
        </div>
      );

    case 5:
      return (
        <div className="space-y-4">
          <Field label="Traction to date" required>
            <TextAreaField
              value={form.tractionSummary}
              onChange={(v) => set('tractionSummary', v)}
              rows={4}
            />
          </Field>
          <Field
            label="Key metrics"
            required
            hint="Numbers only — revenue, users, retention, whatever you actually track."
          >
            <TextAreaField
              value={form.keyMetrics}
              onChange={(v) => set('keyMetrics', v)}
              rows={3}
            />
          </Field>
        </div>
      );

    case 6:
      return (
        <div className="space-y-4">
          <Field label="Founding team" required>
            <TextAreaField
              value={form.teamSummary}
              onChange={(v) => set('teamSummary', v)}
              rows={4}
            />
          </Field>
          <Field label="Team size" required>
            <TextField
              type="number"
              value={form.teamSize}
              onChange={(v) => set('teamSize', Number(v) || 0)}
              className="max-w-32"
            />
          </Field>
          <Field label="Hiring plan" hint="Optional">
            <TextAreaField
              value={form.hiringPlan}
              onChange={(v) => set('hiringPlan', v)}
              rows={3}
            />
          </Field>
        </div>
      );

    case 7:
      return (
        <div className="space-y-4">
          <Field label="Funding requested (₹)" required>
            <TextField
              type="number"
              value={form.fundingRequested}
              onChange={(v) => set('fundingRequested', Number(v) || 0)}
              className="max-w-48"
            />
          </Field>
          <Field label="How will the funds be used?" required>
            <TextAreaField
              value={form.fundingUse}
              onChange={(v) => set('fundingUse', v)}
              rows={3}
            />
          </Field>
          <Field
            label="What do you want from incubation?"
            required
            hint="Be specific — this is what the mentor engagement will be built around."
          >
            <TextAreaField
              value={form.incubationGoals}
              onChange={(v) => set('incubationGoals', v)}
              rows={4}
            />
          </Field>
        </div>
      );

    default:
      return null;
  }
}
