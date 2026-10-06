import type {
  AppState,
  Application,
  ApplicationStatus,
  Evaluation,
  EvaluationCategory,
  Mentor,
  Milestone,
  Role,
  Startup,
} from './types';
import {
  APPLICATION_STEP_FIELDS,
  OPTIONAL_APPLICATION_FIELDS,
  type ApplicationForm,
} from './types';

/* ------------------------------------------------------------ base lookups */

export function startupById(s: AppState, id: string | null): Startup | null {
  if (!id) return null;
  return s.startups.find((x) => x.id === id) ?? null;
}

export function mentorById(s: AppState, id: string | null): Mentor | null {
  if (!id) return null;
  return s.mentors.find((x) => x.id === id) ?? null;
}

export function programName(s: AppState, id: string | null): string | null {
  if (!id) return null;
  return s.programs.find((p) => p.id === id)?.name ?? null;
}

export function founderName(s: AppState, founderId: string): string {
  const u = s.users.find((x) => x.id === founderId);
  return u ? `${u.firstName} ${u.lastName}` : 'Unknown founder';
}

/** The startup owned by a founder. The demo gives each founder exactly one. */
export function startupForFounder(
  s: AppState,
  founderId: string,
): Startup | null {
  return s.startups.find((x) => x.founderId === founderId) ?? null;
}

export function applicationForStartup(
  s: AppState,
  startupId: string | null,
): Application | null {
  if (!startupId) return null;
  return s.applications.find((a) => a.startupId === startupId) ?? null;
}

export function evaluationForApplication(
  s: AppState,
  application: Application | null,
): Evaluation | null {
  if (!application) return null;
  return (
    s.evaluations.find((e) => e.applicationId === application.id) ?? null
  );
}

export function startupsForMentor(s: AppState, mentorId: string): Startup[] {
  return s.startups.filter((x) => x.mentorId === mentorId);
}

export function milestonesForStartup(
  s: AppState,
  startupId: string,
): Milestone[] {
  return s.milestones
    .filter((m) => m.startupId === startupId)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
}

export function feedbackForStartup(s: AppState, startupId: string) {
  return s.feedback
    .filter((f) => f.startupId === startupId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function sessionsForStartup(s: AppState, startupId: string) {
  return s.sessions
    .filter((x) => x.startupId === startupId)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
}

export function sessionsForMentor(s: AppState, mentorId: string) {
  return s.sessions
    .filter((x) => x.mentorId === mentorId)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
}

export function fundingForStartup(s: AppState, startupId: string) {
  return s.fundingRequests
    .filter((f) => f.startupId === startupId)
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );
}

export function resourcesForStartup(s: AppState, startupId: string) {
  return s.resourceRequests
    .filter((r) => r.startupId === startupId)
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );
}

/* ---------------------------------------------------------- notifications */

export function notificationsFor(s: AppState, role: Role, actorId: string) {
  return s.notifications
    .filter(
      (n) =>
        n.audienceRole === role &&
        (n.audienceId === null || n.audienceId === actorId),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function unreadCount(s: AppState, role: Role, actorId: string): number {
  return notificationsFor(s, role, actorId).filter((n) => !n.read).length;
}

/* ------------------------------------------------------- application form */

/** A step counts as complete when every non-optional field on it has a value. */
export function isStepComplete(form: ApplicationForm, step: number): boolean {
  const fields = APPLICATION_STEP_FIELDS[step];
  if (!fields) return false;
  return fields.every((field) => {
    if (OPTIONAL_APPLICATION_FIELDS.includes(field)) return true;
    const value = form[field];
    if (typeof value === 'number') return value > 0;
    return String(value ?? '').trim().length > 0;
  });
}

export function completedStepCount(form: ApplicationForm): number {
  return APPLICATION_STEP_FIELDS.reduce(
    (count, _fields, index) => (isStepComplete(form, index) ? count + 1 : count),
    0,
  );
}

export function canSubmit(form: ApplicationForm): boolean {
  return APPLICATION_STEP_FIELDS.every((_f, i) => isStepComplete(form, i));
}

/* ------------------------------------------------------------- admin KPIs */

export interface AdminKpis {
  totalApplications: number;
  awaitingAction: number;
  accepted: number;
  activeStartups: number;
  activeMentors: number;
  unassignedStartups: number;
  averageScore: number;
  milestoneCompletion: number;
  overdueMilestones: number;
  pendingFunding: number;
  fundingApproved: number;
  pendingResources: number;
}

const AWAITING: ApplicationStatus[] = ['SUBMITTED', 'UNDER_REVIEW'];

export function adminKpis(s: AppState): AdminKpis {
  const accepted = s.applications.filter((a) => a.status === 'ACCEPTED');
  const acceptedIds = new Set(accepted.map((a) => a.startupId));

  const scored = s.evaluations;
  const averageScore = scored.length
    ? Math.round(
        (scored.reduce((sum, e) => sum + e.percentage, 0) / scored.length) * 10,
      ) / 10
    : 0;

  const milestones = s.milestones;
  const milestoneCompletion = milestones.length
    ? Math.round(
        milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length,
      )
    : 0;

  return {
    totalApplications: s.applications.length,
    awaitingAction: s.applications.filter((a) => AWAITING.includes(a.status))
      .length,
    accepted: accepted.length,
    activeStartups: acceptedIds.size,
    activeMentors: s.mentors.filter((m) => m.status === 'ACTIVE').length,
    unassignedStartups: s.startups.filter(
      (x) => acceptedIds.has(x.id) && !x.mentorId,
    ).length,
    averageScore,
    milestoneCompletion,
    overdueMilestones: milestones.filter((m) => m.status === 'OVERDUE').length,
    pendingFunding: s.fundingRequests.filter((f) => f.status === 'PENDING')
      .length,
    fundingApproved: s.fundingRequests
      .filter((f) => f.status === 'APPROVED')
      .reduce((sum, f) => sum + f.amount, 0),
    pendingResources: s.resourceRequests.filter((r) => r.status === 'PENDING')
      .length,
  };
}

/* ---------------------------------------------------------------- charts */

export interface ChartPoint {
  name: string;
  value: number;
}

const PIPELINE_ORDER: ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'EVALUATED',
  'SHORTLISTED',
  'ACCEPTED',
  'REJECTED',
];

const PIPELINE_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'In Review',
  EVALUATED: 'Evaluated',
  SHORTLISTED: 'Shortlisted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export function applicationsByStatus(s: AppState): ChartPoint[] {
  return PIPELINE_ORDER.map((status) => ({
    name: PIPELINE_LABELS[status],
    value: s.applications.filter((a) => a.status === status).length,
  }));
}

const CATEGORY_ORDER: EvaluationCategory[] = [
  'High Potential',
  'Promising',
  'Needs Improvement',
  'Not Recommended',
];

export function evaluationsByCategory(s: AppState): ChartPoint[] {
  return CATEGORY_ORDER.map((category) => ({
    name: category,
    value: s.evaluations.filter((e) => e.category === category).length,
  }));
}

/** Average milestone progress per active startup — moves when a founder updates. */
export function milestoneProgressByStartup(s: AppState): ChartPoint[] {
  return s.startups
    .filter((x) => s.milestones.some((m) => m.startupId === x.id))
    .map((x) => {
      const rows = s.milestones.filter((m) => m.startupId === x.id);
      return {
        name: x.name,
        value: Math.round(
          rows.reduce((sum, m) => sum + m.progress, 0) / rows.length,
        ),
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function fundingBySector(s: AppState): ChartPoint[] {
  const totals = new Map<string, number>();
  for (const request of s.fundingRequests) {
    if (request.status !== 'APPROVED') continue;
    const startup = s.startups.find((x) => x.id === request.startupId);
    if (!startup) continue;
    totals.set(
      startup.sector,
      (totals.get(startup.sector) ?? 0) + request.amount,
    );
  }
  return [...totals.entries()].map(([name, value]) => ({ name, value }));
}

/** Submissions per month over the trailing six months, oldest first. */
export function submissionsOverTime(s: AppState): ChartPoint[] {
  const now = new Date();
  const buckets: ChartPoint[] = [];

  for (let offset = 5; offset >= 0; offset--) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const count = s.applications.filter((a) => {
      if (!a.submittedAt) return false;
      const at = new Date(a.submittedAt).getTime();
      return at >= start.getTime() && at < end.getTime();
    }).length;
    buckets.push({
      name: start.toLocaleDateString('en-IN', { month: 'short' }),
      value: count,
    });
  }

  return buckets;
}

/* ------------------------------------------------------------ mentor load */

export interface MentorLoad {
  mentor: Mentor;
  startups: Startup[];
  atCapacity: boolean;
}

export function mentorLoads(s: AppState): MentorLoad[] {
  return s.mentors.map((mentor) => {
    const assigned = startupsForMentor(s, mentor.id);
    return {
      mentor,
      startups: assigned,
      atCapacity: assigned.length >= mentor.maxStartups,
    };
  });
}

/* ------------------------------------------------------ investor (R3) */

export interface StartupSearchFilters {
  query: string;
  /** '' means "any". */
  domain: string;
  stage: string;
}

/** Startups an investor may see: accepted into the programme. */
export function investableStartups(s: AppState): Startup[] {
  const acceptedIds = new Set(
    s.applications
      .filter((a) => a.status === 'ACCEPTED')
      .map((a) => a.startupId),
  );
  return s.startups.filter((x) => acceptedIds.has(x.id));
}

/** Distinct domains across the investable set, for the filter dropdown. */
export function startupDomains(s: AppState): string[] {
  return [...new Set(investableStartups(s).map((x) => x.domain))]
    .filter(Boolean)
    .sort();
}

export function startupStages(s: AppState): string[] {
  return [...new Set(investableStartups(s).map((x) => x.stage))].sort();
}

/** R3 — search by name, domain/industry and stage. */
export function searchStartups(
  s: AppState,
  filters: StartupSearchFilters,
): Startup[] {
  const needle = filters.query.trim().toLowerCase();

  return investableStartups(s).filter((x) => {
    if (filters.domain && x.domain !== filters.domain) return false;
    if (filters.stage && x.stage !== filters.stage) return false;
    if (!needle) return true;
    return (
      x.name.toLowerCase().includes(needle) ||
      x.domain.toLowerCase().includes(needle) ||
      x.sector.toLowerCase().includes(needle) ||
      x.tagline.toLowerCase().includes(needle) ||
      x.city.toLowerCase().includes(needle)
    );
  });
}

export interface Opportunity {
  startup: Startup;
  /** Open funding requests driving the opportunity. */
  openRequests: AppState['fundingRequests'];
  requestedTotal: number;
}

/**
 * Investment opportunities = investable startups with at least one pending
 * funding request. Read-only: there is no money model behind this.
 */
export function investmentOpportunities(s: AppState): Opportunity[] {
  return investableStartups(s)
    .map((startup) => {
      const openRequests = s.fundingRequests.filter(
        (f) => f.startupId === startup.id && f.status === 'PENDING',
      );
      return {
        startup,
        openRequests,
        requestedTotal: openRequests.reduce((sum, f) => sum + f.amount, 0),
      };
    })
    .filter((row) => row.openRequests.length > 0)
    .sort((a, b) => b.requestedTotal - a.requestedTotal);
}

/* ---------------------------------------------------------------- format */

export function formatINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function relativeDays(iso: string): string {
  const diff = Math.round(
    (new Date(iso).getTime() - Date.now()) / 86_400_000,
  );
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}
