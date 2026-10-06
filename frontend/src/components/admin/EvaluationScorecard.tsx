import { useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { evaluationForApplication } from '@/store/selectors';
import {
  CATEGORY_BANDS,
  CATEGORY_STYLES,
  EVALUATION_CRITERIA,
  MAX_SCORE,
  MAX_TOTAL,
  MIN_SCORE,
  emptyScores,
  summarize,
} from '@/store/scoring';
import type { Application, CriterionKey } from '@/store/types';

/**
 * Eight criteria scored 1–10. The total, percentage and category update live as
 * the sliders move. Saving records the score and moves the application to
 * Evaluated — accepting or rejecting stays a separate decision.
 */
export function EvaluationScorecard({
  application,
  open,
  onClose,
}: {
  application: Application;
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const existing = evaluationForApplication(state, application);

  const [scores, setScores] = useState<Record<CriterionKey, number>>(
    existing ? { ...existing.scores } : emptyScores(),
  );
  const [strengths, setStrengths] = useState(existing?.strengths ?? '');
  const [concerns, setConcerns] = useState(existing?.concerns ?? '');
  const [recommendation, setRecommendation] = useState(
    existing?.recommendation ?? '',
  );

  const summary = summarize(scores);

  function save() {
    dispatch({
      type: 'EVALUATION_SAVE',
      applicationId: application.id,
      scores,
      strengths: strengths.trim(),
      concerns: concerns.trim(),
      recommendation: recommendation.trim(),
    });
    toast(
      `Scored ${summary.percentage}% — ${summary.category}`,
      'Accept, shortlist or reject is still a separate decision.',
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={`Evaluate — ${application.form.companyName}`}
      description="Score each criterion from 1 to 10. The category is derived from the total; the accept or reject decision stays yours."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>
            {existing ? 'Update evaluation' : 'Save evaluation'}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0 space-y-4">
          {EVALUATION_CRITERIA.map((criterion) => {
            const value = scores[criterion.key];
            return (
              <div key={criterion.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">
                      {criterion.label}
                    </p>
                    <p className="text-[11px] leading-snug text-white/35">
                      {criterion.hint}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-purple-200">
                    {value}
                    <span className="text-[11px] font-normal text-white/30">
                      /{MAX_SCORE}
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_SCORE}
                  max={MAX_SCORE}
                  step={1}
                  value={value}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [criterion.key]: Number(e.target.value),
                    }))
                  }
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-400"
                />
              </div>
            );
          })}

          <div className="space-y-4 border-t border-white/5 pt-4">
            <Field label="Strengths">
              <TextAreaField
                value={strengths}
                onChange={setStrengths}
                rows={3}
                placeholder="What is genuinely strong about this application?"
              />
            </Field>
            <Field label="Concerns">
              <TextAreaField
                value={concerns}
                onChange={setConcerns}
                rows={3}
                placeholder="What would have to be true for this to work?"
              />
            </Field>
            <Field label="Recommendation">
              <TextAreaField
                value={recommendation}
                onChange={setRecommendation}
                rows={2}
                placeholder="Accept, shortlist, or send back — and why."
              />
            </Field>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Total score
            </p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums">
              {summary.total}
              <span className="text-base font-normal text-white/30">
                /{MAX_TOTAL}
              </span>
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-purple-200">
              {summary.percentage}%
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[summary.category]}`}
              >
                {summary.category}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Category thresholds
            </p>
            <ul className="space-y-1.5">
              {CATEGORY_BANDS.map((band) => (
                <li
                  key={band.category}
                  className={`flex items-center justify-between text-[11px] ${
                    band.category === summary.category
                      ? 'font-semibold text-white'
                      : 'text-white/40'
                  }`}
                >
                  <span>{band.category}</span>
                  <span className="tabular-nums">≥ {band.min}%</span>
                </li>
              ))}
            </ul>
          </div>

          {existing && (
            <p className="text-[11px] leading-relaxed text-amber-300/70">
              This application already has a scorecard. Saving replaces it.
            </p>
          )}
        </aside>
      </div>
    </Modal>
  );
}
