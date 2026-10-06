/**
 * SIIMS shared data model.
 *
 * Every role reads and writes these same entities through the single store in
 * `StoreContext`. There is no per-role storage: a founder's submission and an
 * admin's evaluation are rows in the same arrays.
 */

/* ------------------------------------------------------------------ roles */

export type Role = 'FOUNDER' | 'ADMIN' | 'MENTOR' | 'INVESTOR';

export const ROLES: Role[] = ['FOUNDER', 'ADMIN', 'MENTOR', 'INVESTOR'];

export const ROLE_LABELS: Record<Role, string> = {
  FOUNDER: 'Startup Founder',
  ADMIN: 'Incubation Center',
  MENTOR: 'Mentor',
  INVESTOR: 'Investor',
};

/**
 * Roles that may write to the store. INVESTOR is a read-only lens: it can
 * browse and express interest (which only writes a notification and an
 * activity row) but never touches applications, evaluations, milestones or
 * mentor assignments.
 */
export const READ_ONLY_ROLES: Role[] = ['INVESTOR'];

/**
 * The role switcher picks one of these. `refId` points at the entity that
 * "is" this person: a User for founders, admins and investors, a Mentor for
 * mentors. Switching never clears data — it only changes the active lens.
 */
export interface DemoIdentity {
  role: Role;
  name: string;
  email: string;
  refId: string;
  blurb: string;
}

/* ------------------------------------------------------------------ people */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  title: string;
  avatarSeed: string;
  joinedAt: string;
}

export type MentorStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Self-contained so mentor CRUD touches exactly one collection.
 */
export interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  title: string;
  expertise: string[];
  bio: string;
  yearsExperience: number;
  maxStartups: number;
  status: MentorStatus;
  avatarSeed: string;
  createdAt: string;
}

/* ---------------------------------------------------------------- startups */

export type StartupStage =
  | 'Ideation'
  | 'Prototype'
  | 'MVP'
  | 'Early Revenue'
  | 'Growth';

export const STARTUP_STAGES: StartupStage[] = [
  'Ideation',
  'Prototype',
  'MVP',
  'Early Revenue',
  'Growth',
];

export interface TeamMember {
  name: string;
  role: string;
}

export interface Startup {
  id: string;
  founderId: string;
  name: string;
  tagline: string;
  domain: string;
  sector: string;
  stage: StartupStage;
  description: string;
  website: string;
  city: string;
  foundedYear: number;
  logoSeed: string;
  teamMembers: TeamMember[];
  /** Set by the admin's assign-mentor action. Null until then. */
  mentorId: string | null;
  programId: string | null;
  fundingGoal: number;
  fundingRaised: number;
  createdAt: string;
}

/* ------------------------------------------------------------ applications */

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'EVALUATED'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED';

/** The happy path the timeline component renders as its spine. */
export const APPLICATION_FLOW: ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'EVALUATED',
  'SHORTLISTED',
  'ACCEPTED',
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  EVALUATED: 'Evaluated',
  SHORTLISTED: 'Shortlisted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

/**
 * Eight steps, matching the eight panels of the application form. There is no
 * document or upload step — the incubation center reviews written answers only.
 */
export interface ApplicationForm {
  // Step 1 — Venture Basics
  companyName: string;
  domain: string;
  sector: string;
  stage: StartupStage;
  city: string;
  website: string;
  foundedYear: number;

  // Step 2 — Problem
  problemStatement: string;
  targetCustomer: string;

  // Step 3 — Solution
  solution: string;
  uniqueValue: string;

  // Step 4 — Market
  targetMarket: string;
  marketSize: string;
  competitors: string;

  // Step 5 — Business Model
  businessModel: string;
  revenueStreams: string;
  pricingNotes: string;

  // Step 6 — Traction
  tractionSummary: string;
  keyMetrics: string;

  // Step 7 — Team
  teamSummary: string;
  teamSize: number;
  hiringPlan: string;

  // Step 8 — Ask & Goals
  fundingRequested: number;
  fundingUse: string;
  incubationGoals: string;
}

export const APPLICATION_STEPS = [
  'Venture Basics',
  'Problem',
  'Solution',
  'Market',
  'Business Model',
  'Traction',
  'Team',
  'Ask & Goals',
] as const;

export const TOTAL_APPLICATION_STEPS = APPLICATION_STEPS.length;

/**
 * Which fields belong to which step. Drives both the form panels and the
 * "is this step complete" check, so the two can never disagree.
 */
export const APPLICATION_STEP_FIELDS: (keyof ApplicationForm)[][] = [
  ['companyName', 'domain', 'sector', 'stage', 'city', 'website', 'foundedYear'],
  ['problemStatement', 'targetCustomer'],
  ['solution', 'uniqueValue'],
  ['targetMarket', 'marketSize', 'competitors'],
  ['businessModel', 'revenueStreams', 'pricingNotes'],
  ['tractionSummary', 'keyMetrics'],
  ['teamSummary', 'teamSize', 'hiringPlan'],
  ['fundingRequested', 'fundingUse', 'incubationGoals'],
];

/** Fields a founder may leave blank without blocking submission. */
export const OPTIONAL_APPLICATION_FIELDS: (keyof ApplicationForm)[] = [
  'website',
  'hiringPlan',
  'pricingNotes',
];

export interface StatusEvent {
  id: string;
  status: ApplicationStatus;
  at: string;
  byName: string;
  byRole: Role;
  note: string | null;
}

export interface Application {
  id: string;
  startupId: string;
  founderId: string;
  status: ApplicationStatus;
  form: ApplicationForm;
  /** How far the founder got in the multi-step form; lets a draft resume. */
  completedSteps: number;
  programId: string | null;
  evaluationId: string | null;
  decisionNote: string | null;
  history: StatusEvent[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

/* ------------------------------------------------------------- evaluations */

export type CriterionKey =
  | 'innovation'
  | 'problemRelevance'
  | 'solutionFeasibility'
  | 'marketPotential'
  | 'scalability'
  | 'businessModel'
  | 'teamStrength'
  | 'impact';

export interface Criterion {
  key: CriterionKey;
  label: string;
  hint: string;
}

export type EvaluationCategory =
  | 'High Potential'
  | 'Promising'
  | 'Needs Improvement'
  | 'Not Recommended';

export interface Evaluation {
  id: string;
  applicationId: string;
  startupId: string;
  evaluatorId: string;
  evaluatorName: string;
  /** Each criterion scored 1–10. */
  scores: Record<CriterionKey, number>;
  total: number;
  maxTotal: number;
  percentage: number;
  category: EvaluationCategory;
  strengths: string;
  concerns: string;
  recommendation: string;
  createdAt: string;
}

/* -------------------------------------------------------------- milestones */

export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE';

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
};

export interface Milestone {
  id: string;
  startupId: string;
  title: string;
  description: string;
  dueDate: string;
  /** 0–100. The founder moves this; status is derived from it. */
  progress: number;
  status: MilestoneStatus;
  createdByRole: Role;
  createdById: string;
  createdByName: string;
  createdAt: string;
  lastUpdatedAt: string;
  completedAt: string | null;
}

/* ---------------------------------------------------------------- feedback */

export interface FeedbackNote {
  id: string;
  startupId: string;
  mentorId: string;
  mentorName: string;
  /** Optional anchor to the milestone the note is about. */
  milestoneId: string | null;
  content: string;
  rating: number;
  createdAt: string;
}

/* ---------------------------------------------------------------- sessions */

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface MentorSession {
  id: string;
  startupId: string;
  mentorId: string;
  title: string;
  agenda: string;
  scheduledAt: string;
  durationMins: number;
  status: SessionStatus;
  notes: string | null;
  createdAt: string;
}

/* ---------------------------------------------------- funding & resources */

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type FundingCategory =
  | 'Seed Grant'
  | 'Prototype Grant'
  | 'Working Capital'
  | 'Travel & Events'
  | 'Equipment';

export interface FundingRequest {
  id: string;
  startupId: string;
  amount: number;
  category: FundingCategory;
  purpose: string;
  status: RequestStatus;
  requestedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  note: string | null;
  disbursed: boolean;
}

export type ResourceType =
  | 'Lab Space'
  | 'Office Desk'
  | 'Cloud Credits'
  | 'Legal Advisory'
  | 'Prototyping Equipment'
  | 'Marketing Support';

export const RESOURCE_TYPES: ResourceType[] = [
  'Lab Space',
  'Office Desk',
  'Cloud Credits',
  'Legal Advisory',
  'Prototyping Equipment',
  'Marketing Support',
];

export interface ResourceRequest {
  id: string;
  startupId: string;
  resourceType: ResourceType;
  title: string;
  details: string;
  quantity: number;
  status: RequestStatus;
  requestedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  note: string | null;
}

/* ---------------------------------------------------------------- programs */

export type ProgramStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface Program {
  id: string;
  name: string;
  cohort: string;
  description: string;
  focusAreas: string[];
  startDate: string;
  endDate: string;
  status: ProgramStatus;
  capacity: number;
  startupIds: string[];
}

/* ----------------------------------------------- notifications & activity */

export type NotificationType =
  | 'APPLICATION'
  | 'EVALUATION'
  | 'MENTOR'
  | 'MILESTONE'
  | 'FUNDING'
  | 'RESOURCE'
  | 'SESSION'
  | 'SYSTEM';

export interface Notification {
  id: string;
  /** Who should see it. Role-targeted so "notify the incubation center" is one row. */
  audienceRole: Role;
  /** Narrows to a single person when set (e.g. one founder, one mentor). */
  audienceId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: string;
}

/** Append-only audit trail shown in the admin's Activity Log tab. */
export interface Activity {
  id: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

/* ------------------------------------------------------------- root state */

export interface AppState {
  /** Bumped when the shape changes so stale localStorage is re-seeded. */
  version: number;
  activeRole: Role;
  identities: DemoIdentity[];
  users: User[];
  mentors: Mentor[];
  startups: Startup[];
  applications: Application[];
  evaluations: Evaluation[];
  milestones: Milestone[];
  feedback: FeedbackNote[];
  sessions: MentorSession[];
  fundingRequests: FundingRequest[];
  resourceRequests: ResourceRequest[];
  programs: Program[];
  notifications: Notification[];
  activities: Activity[];
}
