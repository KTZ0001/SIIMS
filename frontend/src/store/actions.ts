import type {
  ApplicationForm,
  ApplicationStatus,
  CriterionKey,
  FundingCategory,
  Mentor,
  Program,
  RequestStatus,
  ResourceType,
  Role,
  StartupStage,
} from './types';

/**
 * Every action carries `meta`, injected by the dispatch wrapper in
 * StoreContext. Keeping ids and timestamps out of the reducer leaves it pure,
 * which is what lets the reducer also append notifications and activity-log
 * rows without reaching for Date.now() or crypto.randomUUID().
 */
export interface ActionMeta {
  /** Pre-generated id for whatever the action creates. */
  id: string;
  /** Extra pre-generated ids for side-effect rows (notification, activity). */
  auxIds: string[];
  at: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
}

export interface WithMeta {
  meta: ActionMeta;
}

export type Action = WithMeta &
  (
    /* ---------------------------------------------------------- session */
    | { type: 'SET_ROLE'; role: Role }
    | { type: 'RESET_DEMO' }

    /**
     * R1 — registration. Creates a founder user, an empty startup and a blank
     * draft application, then points the FOUNDER demo identity at the new user
     * so the founder lens becomes them. Nothing else in the store is touched,
     * so every other role keeps seeing the same shared data.
     */
    | {
        type: 'REGISTER_FOUNDER';
        firstName: string;
        lastName: string;
        email: string;
        startupName: string;
      }

    /**
     * Investor read-only lens. Writes a notification and an activity row only —
     * never an application, evaluation, milestone or assignment.
     */
    | { type: 'EXPRESS_INTEREST'; startupId: string }

    /* ----------------------------------------------------- applications */
    | {
        type: 'APPLICATION_SAVE_DRAFT';
        applicationId: string;
        form: ApplicationForm;
        completedSteps: number;
      }
    | { type: 'APPLICATION_SUBMIT'; applicationId: string }
    | {
        type: 'APPLICATION_SET_STATUS';
        applicationId: string;
        status: ApplicationStatus;
        note: string | null;
      }
    | {
        type: 'APPLICATION_SET_PROGRAM';
        applicationId: string;
        programId: string | null;
      }

    /* ------------------------------------------------------ evaluations */
    | {
        type: 'EVALUATION_SAVE';
        applicationId: string;
        scores: Record<CriterionKey, number>;
        strengths: string;
        concerns: string;
        recommendation: string;
      }

    /* ---------------------------------------------------------- mentors */
    | { type: 'MENTOR_ASSIGN'; startupId: string; mentorId: string | null }
    | {
        type: 'MENTOR_CREATE';
        draft: Omit<Mentor, 'id' | 'createdAt' | 'avatarSeed'>;
      }
    | { type: 'MENTOR_UPDATE'; mentorId: string; patch: Partial<Mentor> }
    | { type: 'MENTOR_DELETE'; mentorId: string }

    /* ------------------------------------------------------- milestones */
    | {
        type: 'MILESTONE_CREATE';
        startupId: string;
        title: string;
        description: string;
        dueDate: string;
      }
    | { type: 'MILESTONE_SET_PROGRESS'; milestoneId: string; progress: number }
    | {
        type: 'MILESTONE_UPDATE';
        milestoneId: string;
        patch: { title?: string; description?: string; dueDate?: string };
      }
    | { type: 'MILESTONE_DELETE'; milestoneId: string }

    /* --------------------------------------------------------- feedback */
    | {
        type: 'FEEDBACK_ADD';
        startupId: string;
        milestoneId: string | null;
        content: string;
        rating: number;
      }
    | { type: 'FEEDBACK_DELETE'; feedbackId: string }

    /* --------------------------------------------------------- sessions */
    | {
        type: 'SESSION_CREATE';
        startupId: string;
        title: string;
        agenda: string;
        scheduledAt: string;
        durationMins: number;
      }
    | {
        type: 'SESSION_COMPLETE';
        sessionId: string;
        notes: string;
      }
    | { type: 'SESSION_CANCEL'; sessionId: string }

    /* ---------------------------------------------------------- funding */
    | {
        type: 'FUNDING_REQUEST_CREATE';
        startupId: string;
        amount: number;
        category: FundingCategory;
        purpose: string;
      }
    | {
        type: 'FUNDING_DECIDE';
        requestId: string;
        status: RequestStatus;
        note: string | null;
      }

    /* -------------------------------------------------------- resources */
    | {
        type: 'RESOURCE_REQUEST_CREATE';
        startupId: string;
        resourceType: ResourceType;
        title: string;
        details: string;
        quantity: number;
      }
    | {
        type: 'RESOURCE_DECIDE';
        requestId: string;
        status: RequestStatus;
        note: string | null;
      }

    /* --------------------------------------------------------- programs */
    | {
        type: 'PROGRAM_CREATE';
        draft: Omit<Program, 'id' | 'startupIds'>;
      }
    | { type: 'PROGRAM_UPDATE'; programId: string; patch: Partial<Program> }
    | { type: 'PROGRAM_DELETE'; programId: string }

    /* ---------------------------------------------------------- startup */
    | {
        type: 'STARTUP_UPDATE';
        startupId: string;
        patch: Partial<{
          name: string;
          tagline: string;
          domain: string;
          sector: string;
          stage: StartupStage;
          description: string;
          website: string;
          city: string;
          fundingGoal: number;
        }>;
      }

    /* ---------------------------------------------------- notifications */
    | { type: 'NOTIFICATION_MARK_READ'; notificationId: string }
    | { type: 'NOTIFICATION_MARK_ALL_READ'; role: Role; audienceId: string }
  );
