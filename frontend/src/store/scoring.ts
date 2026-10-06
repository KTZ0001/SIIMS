import type {
  Criterion,
  CriterionKey,
  Evaluation,
  EvaluationCategory,
} from './types';

/**
 * Rule-based evaluation scoring. No model, no randomness — the same scores
 * always produce the same category, and the thresholds are shown in the UI.
 */

export const MIN_SCORE = 1;
export const MAX_SCORE = 10;

export const EVALUATION_CRITERIA: Criterion[] = [
  {
    key: 'innovation',
    label: 'Innovation',
    hint: 'How novel is the idea relative to what already exists?',
  },
  {
    key: 'problemRelevance',
    label: 'Problem Relevance',
    hint: 'Is this a real, urgent problem for a definable group?',
  },
  {
    key: 'solutionFeasibility',
    label: 'Solution Feasibility',
    hint: 'Can this team actually build it with the time and money available?',
  },
  {
    key: 'marketPotential',
    label: 'Market Potential',
    hint: 'Size and reachability of the addressable market.',
  },
  {
    key: 'scalability',
    label: 'Scalability',
    hint: 'Can it grow without cost growing at the same rate?',
  },
  {
    key: 'businessModel',
    label: 'Business Model',
    hint: 'Is the path from product to sustainable revenue credible?',
  },
  {
    key: 'teamStrength',
    label: 'Team Strength',
    hint: 'Domain depth, completeness and track record of the founding team.',
  },
  {
    key: 'impact',
    label: 'Social / Economic Impact',
    hint: 'Wider benefit beyond the founders and investors.',
  },
];

export const CRITERION_KEYS: CriterionKey[] = EVALUATION_CRITERIA.map(
  (c) => c.key,
);

export const MAX_TOTAL = EVALUATION_CRITERIA.length * MAX_SCORE;

/** Percentage thresholds, highest first. */
export const CATEGORY_BANDS: { min: number; category: EvaluationCategory }[] = [
  { min: 80, category: 'High Potential' },
  { min: 65, category: 'Promising' },
  { min: 45, category: 'Needs Improvement' },
  { min: 0, category: 'Not Recommended' },
];

export function emptyScores(): Record<CriterionKey, number> {
  return CRITERION_KEYS.reduce(
    (acc, key) => {
      acc[key] = 5;
      return acc;
    },
    {} as Record<CriterionKey, number>,
  );
}

export function totalScore(scores: Record<CriterionKey, number>): number {
  return CRITERION_KEYS.reduce((sum, key) => sum + (scores[key] || 0), 0);
}

export function categorize(percentage: number): EvaluationCategory {
  const band = CATEGORY_BANDS.find((b) => percentage >= b.min);
  return band ? band.category : 'Not Recommended';
}

export interface ScoreSummary {
  total: number;
  maxTotal: number;
  percentage: number;
  category: EvaluationCategory;
}

export function summarize(
  scores: Record<CriterionKey, number>,
): ScoreSummary {
  const total = totalScore(scores);
  const percentage = Math.round((total / MAX_TOTAL) * 1000) / 10;
  return {
    total,
    maxTotal: MAX_TOTAL,
    percentage,
    category: categorize(percentage),
  };
}

/** Tailwind classes per category, so badges read the same everywhere. */
export const CATEGORY_STYLES: Record<EvaluationCategory, string> = {
  'High Potential': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Promising: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Needs Improvement': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Not Recommended': 'bg-red-500/15 text-red-300 border-red-500/30',
};

/**
 * Builds a complete Evaluation from raw scores. Used by both the seed and the
 * admin scorecard so the two can never drift.
 */
export function buildEvaluation(input: {
  id: string;
  applicationId: string;
  startupId: string;
  evaluatorId: string;
  evaluatorName: string;
  scores: Record<CriterionKey, number>;
  strengths: string;
  concerns: string;
  recommendation: string;
  createdAt: string;
}): Evaluation {
  const summary = summarize(input.scores);
  return {
    id: input.id,
    applicationId: input.applicationId,
    startupId: input.startupId,
    evaluatorId: input.evaluatorId,
    evaluatorName: input.evaluatorName,
    scores: input.scores,
    total: summary.total,
    maxTotal: summary.maxTotal,
    percentage: summary.percentage,
    category: summary.category,
    strengths: input.strengths,
    concerns: input.concerns,
    recommendation: input.recommendation,
    createdAt: input.createdAt,
  };
}
