import type { Action, ActionMeta } from './actions';
import { createSeedState } from './seed';
import { buildEvaluation } from './scoring';
import type {
  Activity,
  AppState,
  Application,
  ApplicationForm,
  Milestone,
  MilestoneStatus,
  Notification,
  NotificationType,
  Role,
  StatusEvent,
} from './types';

/* ------------------------------------------------------------------ utils */

function replace<T extends { id: string }>(
  rows: T[],
  id: string,
  patch: (row: T) => T,
): T[] {
  return rows.map((row) => (row.id === id ? patch(row) : row));
}

/** Milestone status is always derived, never set by hand. */
export function deriveMilestoneStatus(
  progress: number,
  dueDate: string,
  now: string,
): MilestoneStatus {
  if (progress >= 100) return 'COMPLETED';
  if (new Date(dueDate).getTime() < new Date(now).getTime()) return 'OVERDUE';
  if (progress > 0) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

interface NotifyInput {
  id: string;
  audienceRole: Role;
  audienceId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  at: string;
}

function notify(input: NotifyInput): Notification {
  return {
    id: input.id,
    audienceRole: input.audienceRole,
    audienceId: input.audienceId,
    title: input.title,
    message: input.message,
    type: input.type,
    read: false,
    link: input.link,
    createdAt: input.at,
  };
}

function logActivity(
  meta: ActionMeta,
  id: string,
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
): Activity {
  return {
    id,
    actorName: meta.actorName,
    actorRole: meta.actorRole,
    action,
    entityType,
    entityId,
    summary,
    createdAt: meta.at,
  };
}

function statusEvent(
  meta: ActionMeta,
  id: string,
  status: Application['status'],
  note: string | null,
): StatusEvent {
  return {
    id,
    status,
    at: meta.at,
    byName: meta.actorName,
    byRole: meta.actorRole,
    note,
  };
}

/* ---------------------------------------------------------------- reducer */

export function reducer(state: AppState, action: Action): AppState {
  const { meta } = action;

  switch (action.type) {
    /* -------------------------------------------------------- session */

    case 'SET_ROLE':
      return { ...state, activeRole: action.role };

    case 'RESET_DEMO':
      // The one deliberately impure branch: re-seeding needs a fresh clock.
      return createSeedState();

    case 'REGISTER_FOUNDER': {
      const userId = meta.id;
      const startupId = meta.auxIds[0];
      const applicationId = meta.auxIds[1];
      const name = `${action.firstName} ${action.lastName}`.trim();
      const initials =
        `${action.firstName[0] ?? ''}${action.lastName[0] ?? ''}`.toUpperCase();

      const blankForm: ApplicationForm = {
        companyName: action.startupName,
        domain: '',
        sector: '',
        stage: 'Ideation',
        city: '',
        website: '',
        foundedYear: new Date(meta.at).getFullYear(),
        problemStatement: '',
        targetCustomer: '',
        solution: '',
        uniqueValue: '',
        targetMarket: '',
        marketSize: '',
        competitors: '',
        businessModel: '',
        revenueStreams: '',
        pricingNotes: '',
        tractionSummary: '',
        keyMetrics: '',
        teamSummary: '',
        teamSize: 1,
        hiringPlan: '',
        fundingRequested: 0,
        fundingUse: '',
        incubationGoals: '',
      };

      return {
        ...state,
        activeRole: 'FOUNDER',
        // Point the founder lens at the new account. The seeded founder's
        // data stays in the store so the admin and mentor views are unchanged.
        identities: state.identities.map((i) =>
          i.role === 'FOUNDER'
            ? {
                ...i,
                name,
                email: action.email,
                refId: userId,
                blurb: `Founder of ${action.startupName} — newly registered`,
              }
            : i,
        ),
        users: [
          ...state.users,
          {
            id: userId,
            firstName: action.firstName,
            lastName: action.lastName,
            email: action.email,
            role: 'FOUNDER',
            title: `Founder, ${action.startupName}`,
            avatarSeed: initials || 'NF',
            joinedAt: meta.at,
          },
        ],
        startups: [
          ...state.startups,
          {
            id: startupId,
            founderId: userId,
            name: action.startupName,
            tagline: '',
            domain: '',
            sector: '',
            stage: 'Ideation',
            description: '',
            website: '',
            city: '',
            foundedYear: new Date(meta.at).getFullYear(),
            logoSeed: (action.startupName.slice(0, 2) || 'NS').toUpperCase(),
            teamMembers: [],
            mentorId: null,
            programId: null,
            fundingGoal: 0,
            fundingRaised: 0,
            createdAt: meta.at,
          },
        ],
        applications: [
          ...state.applications,
          {
            id: applicationId,
            startupId,
            founderId: userId,
            status: 'DRAFT',
            form: blankForm,
            completedSteps: 0,
            programId: null,
            evaluationId: null,
            decisionNote: null,
            history: [
              statusEvent(meta, meta.auxIds[2], 'DRAFT', 'Account registered.'),
            ],
            createdAt: meta.at,
            updatedAt: meta.at,
            submittedAt: null,
          },
        ],
        notifications: [
          notify({
            id: meta.auxIds[3],
            audienceRole: 'FOUNDER',
            audienceId: userId,
            title: 'Welcome to SIIMS',
            message: `Your ${action.startupName} application is saved as a draft. Complete all eight steps to submit.`,
            type: 'APPLICATION',
            link: '/founder/application',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          {
            id: meta.auxIds[4],
            actorName: name,
            actorRole: 'FOUNDER',
            action: 'REGISTERED',
            entityType: 'User',
            entityId: userId,
            summary: `${name} registered and created ${action.startupName}.`,
            createdAt: meta.at,
          },
          ...state.activities,
        ],
      };
    }

    case 'EXPRESS_INTEREST': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      return {
        ...state,
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'FOUNDER',
            audienceId: startup.founderId,
            title: 'An investor expressed interest',
            message: `${meta.actorName} flagged interest in ${startup.name}.`,
            type: 'SYSTEM',
            link: '/founder',
            at: meta.at,
          }),
          notify({
            id: meta.auxIds[1],
            audienceRole: 'ADMIN',
            audienceId: null,
            title: 'Investor interest',
            message: `${meta.actorName} expressed interest in ${startup.name}.`,
            type: 'SYSTEM',
            link: '/admin/startups',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[2],
            'EXPRESSED_INTEREST',
            'Startup',
            startup.id,
            `${meta.actorName} expressed interest in ${startup.name}.`,
          ),
          ...state.activities,
        ],
      };
    }

    /* --------------------------------------------------- applications */

    case 'APPLICATION_SAVE_DRAFT': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app) return state;

      const startup = state.startups.find((s) => s.id === app.startupId);

      return {
        ...state,
        applications: replace(state.applications, app.id, (a) => ({
          ...a,
          form: action.form,
          completedSteps: Math.max(a.completedSteps, action.completedSteps),
          updatedAt: meta.at,
        })),
        // Keep the startup card in step with the form's identity fields.
        startups: startup
          ? replace(state.startups, startup.id, (s) => ({
              ...s,
              name: action.form.companyName || s.name,
              domain: action.form.domain || s.domain,
              sector: action.form.sector || s.sector,
              stage: action.form.stage,
              city: action.form.city || s.city,
              website: action.form.website,
            }))
          : state.startups,
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'SAVED_DRAFT',
            'Application',
            app.id,
            `${action.form.companyName || 'Application'} draft saved at step ${action.completedSteps}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'APPLICATION_SUBMIT': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app || app.status !== 'DRAFT') return state;

      const name = app.form.companyName;

      return {
        ...state,
        applications: replace(state.applications, app.id, (a) => ({
          ...a,
          status: 'SUBMITTED',
          submittedAt: meta.at,
          updatedAt: meta.at,
          history: [
            ...a.history,
            statusEvent(meta, meta.auxIds[0], 'SUBMITTED', null),
          ],
        })),
        notifications: [
          notify({
            id: meta.auxIds[1],
            audienceRole: 'ADMIN',
            audienceId: null,
            title: 'New application submitted',
            message: `${name} submitted an application for review.`,
            type: 'APPLICATION',
            link: '/admin/applications',
            at: meta.at,
          }),
          notify({
            id: meta.auxIds[2],
            audienceRole: 'FOUNDER',
            audienceId: app.founderId,
            title: 'Application submitted',
            message: `Your ${name} application is now with the incubation center.`,
            type: 'APPLICATION',
            link: '/founder/application',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[3],
            'SUBMITTED_APPLICATION',
            'Application',
            app.id,
            `${name} submitted its incubation application.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'APPLICATION_SET_STATUS': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app) return state;

      const name = app.form.companyName;
      const label = action.status.replace(/_/g, ' ').toLowerCase();
      const isDecision =
        action.status === 'ACCEPTED' || action.status === 'REJECTED';

      // Accepting into a programme adds the startup to that programme's roster.
      const programs =
        action.status === 'ACCEPTED' && app.programId
          ? replace(state.programs, app.programId, (p) => ({
              ...p,
              startupIds: p.startupIds.includes(app.startupId)
                ? p.startupIds
                : [...p.startupIds, app.startupId],
            }))
          : state.programs;

      return {
        ...state,
        programs,
        applications: replace(state.applications, app.id, (a) => ({
          ...a,
          status: action.status,
          decisionNote: isDecision ? action.note : a.decisionNote,
          updatedAt: meta.at,
          history: [
            ...a.history,
            statusEvent(meta, meta.auxIds[0], action.status, action.note),
          ],
        })),
        notifications: [
          notify({
            id: meta.auxIds[1],
            audienceRole: 'FOUNDER',
            audienceId: app.founderId,
            title: `Application ${label}`,
            message:
              action.note ??
              `Your ${name} application has been marked ${label}.`,
            type: 'APPLICATION',
            link: '/founder/application',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[2],
            `SET_${action.status}`,
            'Application',
            app.id,
            `${name} moved to ${label}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'APPLICATION_SET_PROGRAM':
      return {
        ...state,
        applications: replace(state.applications, action.applicationId, (a) => ({
          ...a,
          programId: action.programId,
          updatedAt: meta.at,
        })),
      };

    /* ---------------------------------------------------- evaluations */

    case 'EVALUATION_SAVE': {
      const app = state.applications.find((a) => a.id === action.applicationId);
      if (!app) return state;

      const existing = state.evaluations.find(
        (e) => e.applicationId === app.id,
      );

      const evaluation = buildEvaluation({
        id: existing ? existing.id : meta.id,
        applicationId: app.id,
        startupId: app.startupId,
        evaluatorId: meta.actorId,
        evaluatorName: meta.actorName,
        scores: action.scores,
        strengths: action.strengths,
        concerns: action.concerns,
        recommendation: action.recommendation,
        createdAt: meta.at,
      });

      const evaluations = existing
        ? state.evaluations.map((e) => (e.id === existing.id ? evaluation : e))
        : [evaluation, ...state.evaluations];

      // Recording a score moves the application to Evaluated. Accepting,
      // shortlisting and rejecting stay separate, explicit admin decisions —
      // the score never decides on its own.
      const advances =
        app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';

      return {
        ...state,
        evaluations,
        applications: replace(state.applications, app.id, (a) => ({
          ...a,
          evaluationId: evaluation.id,
          status: advances ? 'EVALUATED' : a.status,
          updatedAt: meta.at,
          history: advances
            ? [
                ...a.history,
                statusEvent(
                  meta,
                  meta.auxIds[0],
                  'EVALUATED',
                  `Scored ${evaluation.percentage}% — ${evaluation.category}.`,
                ),
              ]
            : a.history,
        })),
        notifications: [
          notify({
            id: meta.auxIds[1],
            audienceRole: 'FOUNDER',
            audienceId: app.founderId,
            title: 'Application evaluated',
            message: `${app.form.companyName} scored ${evaluation.percentage}% — ${evaluation.category}.`,
            type: 'EVALUATION',
            link: '/founder/application',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[2],
            existing ? 'RE_EVALUATED' : 'EVALUATED',
            'Application',
            app.id,
            `${app.form.companyName} evaluated — ${evaluation.percentage}%, ${evaluation.category}.`,
          ),
          ...state.activities,
        ],
      };
    }

    /* -------------------------------------------------------- mentors */

    case 'MENTOR_ASSIGN': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      const mentor = action.mentorId
        ? state.mentors.find((m) => m.id === action.mentorId)
        : null;
      const mentorName = mentor
        ? `${mentor.firstName} ${mentor.lastName}`
        : null;

      const extras: Notification[] = [];
      if (mentor) {
        extras.push(
          notify({
            id: meta.auxIds[0],
            audienceRole: 'MENTOR',
            audienceId: mentor.id,
            title: 'New startup assigned',
            message: `You have been assigned as mentor to ${startup.name}.`,
            type: 'MENTOR',
            link: '/mentor/startups',
            at: meta.at,
          }),
          notify({
            id: meta.auxIds[1],
            audienceRole: 'FOUNDER',
            audienceId: startup.founderId,
            title: 'Mentor assigned',
            message: `${mentorName} is now your mentor.`,
            type: 'MENTOR',
            link: '/founder/mentor',
            at: meta.at,
          }),
        );
      }

      return {
        ...state,
        startups: replace(state.startups, startup.id, (s) => ({
          ...s,
          mentorId: action.mentorId,
        })),
        notifications: [...extras, ...state.notifications],
        activities: [
          logActivity(
            meta,
            meta.auxIds[2],
            mentor ? 'ASSIGNED_MENTOR' : 'UNASSIGNED_MENTOR',
            'Startup',
            startup.id,
            mentor
              ? `${mentorName} assigned as mentor to ${startup.name}.`
              : `Mentor removed from ${startup.name}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'MENTOR_CREATE': {
      const initials =
        `${action.draft.firstName[0] ?? ''}${action.draft.lastName[0] ?? ''}`.toUpperCase();
      return {
        ...state,
        mentors: [
          ...state.mentors,
          {
            ...action.draft,
            id: meta.id,
            avatarSeed: initials,
            createdAt: meta.at,
          },
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'CREATED_MENTOR',
            'Mentor',
            meta.id,
            `${action.draft.firstName} ${action.draft.lastName} added to the mentor directory.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'MENTOR_UPDATE':
      return {
        ...state,
        mentors: replace(state.mentors, action.mentorId, (m) => ({
          ...m,
          ...action.patch,
        })),
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'UPDATED_MENTOR',
            'Mentor',
            action.mentorId,
            'Mentor profile updated.',
          ),
          ...state.activities,
        ],
      };

    case 'MENTOR_DELETE': {
      const mentor = state.mentors.find((m) => m.id === action.mentorId);
      if (!mentor) return state;

      return {
        ...state,
        mentors: state.mentors.filter((m) => m.id !== action.mentorId),
        // Never leave a startup pointing at a mentor that no longer exists.
        startups: state.startups.map((s) =>
          s.mentorId === action.mentorId ? { ...s, mentorId: null } : s,
        ),
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'DELETED_MENTOR',
            'Mentor',
            action.mentorId,
            `${mentor.firstName} ${mentor.lastName} removed from the mentor directory.`,
          ),
          ...state.activities,
        ],
      };
    }

    /* ----------------------------------------------------- milestones */

    case 'MILESTONE_CREATE': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      const milestone: Milestone = {
        id: meta.id,
        startupId: action.startupId,
        title: action.title,
        description: action.description,
        dueDate: action.dueDate,
        progress: 0,
        status: deriveMilestoneStatus(0, action.dueDate, meta.at),
        createdByRole: meta.actorRole,
        createdById: meta.actorId,
        createdByName: meta.actorName,
        createdAt: meta.at,
        lastUpdatedAt: meta.at,
        completedAt: null,
      };

      return {
        ...state,
        milestones: [...state.milestones, milestone],
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'FOUNDER',
            audienceId: startup.founderId,
            title: 'New milestone set',
            message: `${meta.actorName} set a new milestone: "${action.title}".`,
            type: 'MILESTONE',
            link: '/founder/progress',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            'CREATED_MILESTONE',
            'Milestone',
            milestone.id,
            `"${action.title}" created for ${startup.name}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'MILESTONE_SET_PROGRESS': {
      const milestone = state.milestones.find(
        (m) => m.id === action.milestoneId,
      );
      if (!milestone) return state;

      const startup = state.startups.find((s) => s.id === milestone.startupId);
      const progress = Math.max(0, Math.min(100, Math.round(action.progress)));
      const status = deriveMilestoneStatus(
        progress,
        milestone.dueDate,
        meta.at,
      );
      const justCompleted = status === 'COMPLETED' && milestone.progress < 100;

      const extras: Notification[] = [];
      if (startup?.mentorId) {
        extras.push(
          notify({
            id: meta.auxIds[0],
            audienceRole: 'MENTOR',
            audienceId: startup.mentorId,
            title: justCompleted ? 'Milestone completed' : 'Milestone progress',
            message: justCompleted
              ? `${startup.name} completed "${milestone.title}".`
              : `${startup.name} moved "${milestone.title}" to ${progress}%.`,
            type: 'MILESTONE',
            link: '/mentor/startups',
            at: meta.at,
          }),
        );
      }

      return {
        ...state,
        milestones: replace(state.milestones, milestone.id, (m) => ({
          ...m,
          progress,
          status,
          lastUpdatedAt: meta.at,
          completedAt: status === 'COMPLETED' ? (m.completedAt ?? meta.at) : null,
        })),
        notifications: [...extras, ...state.notifications],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            justCompleted ? 'COMPLETED_MILESTONE' : 'UPDATED_MILESTONE',
            'Milestone',
            milestone.id,
            justCompleted
              ? `"${milestone.title}" marked complete.`
              : `"${milestone.title}" progress updated to ${progress}%.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'MILESTONE_UPDATE': {
      const milestone = state.milestones.find(
        (m) => m.id === action.milestoneId,
      );
      if (!milestone) return state;

      const dueDate = action.patch.dueDate ?? milestone.dueDate;

      return {
        ...state,
        milestones: replace(state.milestones, milestone.id, (m) => ({
          ...m,
          ...action.patch,
          dueDate,
          status: deriveMilestoneStatus(m.progress, dueDate, meta.at),
          lastUpdatedAt: meta.at,
        })),
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'EDITED_MILESTONE',
            'Milestone',
            milestone.id,
            `"${action.patch.title ?? milestone.title}" updated.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'MILESTONE_DELETE':
      return {
        ...state,
        milestones: state.milestones.filter(
          (m) => m.id !== action.milestoneId,
        ),
        // Detach feedback that pointed at it rather than deleting the note.
        feedback: state.feedback.map((f) =>
          f.milestoneId === action.milestoneId
            ? { ...f, milestoneId: null }
            : f,
        ),
      };

    /* ------------------------------------------------------- feedback */

    case 'FEEDBACK_ADD': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      return {
        ...state,
        feedback: [
          {
            id: meta.id,
            startupId: action.startupId,
            mentorId: meta.actorId,
            mentorName: meta.actorName,
            milestoneId: action.milestoneId,
            content: action.content,
            rating: action.rating,
            createdAt: meta.at,
          },
          ...state.feedback,
        ],
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'FOUNDER',
            audienceId: startup.founderId,
            title: 'New mentor feedback',
            message: `${meta.actorName} left feedback on ${startup.name}.`,
            type: 'MENTOR',
            link: '/founder/progress',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            'ADDED_FEEDBACK',
            'Startup',
            startup.id,
            `Feedback added on ${startup.name}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'FEEDBACK_DELETE':
      return {
        ...state,
        feedback: state.feedback.filter((f) => f.id !== action.feedbackId),
      };

    /* ------------------------------------------------------- sessions */

    case 'SESSION_CREATE': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      return {
        ...state,
        sessions: [
          ...state.sessions,
          {
            id: meta.id,
            startupId: action.startupId,
            mentorId: meta.actorId,
            title: action.title,
            agenda: action.agenda,
            scheduledAt: action.scheduledAt,
            durationMins: action.durationMins,
            status: 'SCHEDULED',
            notes: null,
            createdAt: meta.at,
          },
        ],
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'FOUNDER',
            audienceId: startup.founderId,
            title: 'Mentoring session scheduled',
            message: `${meta.actorName} scheduled "${action.title}".`,
            type: 'SESSION',
            link: '/founder/mentor',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            'SCHEDULED_SESSION',
            'Session',
            meta.id,
            `"${action.title}" scheduled with ${startup.name}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'SESSION_COMPLETE':
      return {
        ...state,
        sessions: replace(state.sessions, action.sessionId, (s) => ({
          ...s,
          status: 'COMPLETED',
          notes: action.notes,
        })),
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'COMPLETED_SESSION',
            'Session',
            action.sessionId,
            'Mentoring session marked complete.',
          ),
          ...state.activities,
        ],
      };

    case 'SESSION_CANCEL':
      return {
        ...state,
        sessions: replace(state.sessions, action.sessionId, (s) => ({
          ...s,
          status: 'CANCELLED',
        })),
      };

    /* -------------------------------------------------------- funding */

    case 'FUNDING_REQUEST_CREATE': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      return {
        ...state,
        fundingRequests: [
          {
            id: meta.id,
            startupId: action.startupId,
            amount: action.amount,
            category: action.category,
            purpose: action.purpose,
            status: 'PENDING',
            requestedAt: meta.at,
            decidedAt: null,
            decidedBy: null,
            note: null,
            disbursed: false,
          },
          ...state.fundingRequests,
        ],
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'ADMIN',
            audienceId: null,
            title: 'Funding request pending',
            message: `${startup.name} requested ₹${action.amount.toLocaleString('en-IN')}.`,
            type: 'FUNDING',
            link: '/admin/funding',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            'REQUESTED_FUNDING',
            'FundingRequest',
            meta.id,
            `${startup.name} requested ₹${action.amount.toLocaleString('en-IN')}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'FUNDING_DECIDE': {
      const request = state.fundingRequests.find(
        (f) => f.id === action.requestId,
      );
      if (!request) return state;

      const startup = state.startups.find((s) => s.id === request.startupId);
      const approved = action.status === 'APPROVED';

      return {
        ...state,
        fundingRequests: replace(state.fundingRequests, request.id, (f) => ({
          ...f,
          status: action.status,
          note: action.note,
          decidedAt: meta.at,
          decidedBy: meta.actorName,
          disbursed: approved,
        })),
        // Approved funding is reflected in the startup's raised total, which
        // is what the admin funding KPI reads.
        startups:
          approved && startup
            ? replace(state.startups, startup.id, (s) => ({
                ...s,
                fundingRaised: s.fundingRaised + request.amount,
              }))
            : state.startups,
        notifications: startup
          ? [
              notify({
                id: meta.auxIds[0],
                audienceRole: 'FOUNDER',
                audienceId: startup.founderId,
                title: approved ? 'Funding approved' : 'Funding declined',
                message:
                  action.note ??
                  `Your ₹${request.amount.toLocaleString('en-IN')} request was ${approved ? 'approved' : 'declined'}.`,
                type: 'FUNDING',
                link: '/founder/funding',
                at: meta.at,
              }),
              ...state.notifications,
            ]
          : state.notifications,
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            approved ? 'APPROVED_FUNDING' : 'REJECTED_FUNDING',
            'FundingRequest',
            request.id,
            `${startup?.name ?? 'Request'} — ₹${request.amount.toLocaleString('en-IN')} ${approved ? 'approved' : 'declined'}.`,
          ),
          ...state.activities,
        ],
      };
    }

    /* ------------------------------------------------------ resources */

    case 'RESOURCE_REQUEST_CREATE': {
      const startup = state.startups.find((s) => s.id === action.startupId);
      if (!startup) return state;

      return {
        ...state,
        resourceRequests: [
          {
            id: meta.id,
            startupId: action.startupId,
            resourceType: action.resourceType,
            title: action.title,
            details: action.details,
            quantity: action.quantity,
            status: 'PENDING',
            requestedAt: meta.at,
            decidedAt: null,
            decidedBy: null,
            note: null,
          },
          ...state.resourceRequests,
        ],
        notifications: [
          notify({
            id: meta.auxIds[0],
            audienceRole: 'ADMIN',
            audienceId: null,
            title: 'Resource request pending',
            message: `${startup.name} requested ${action.resourceType}.`,
            type: 'RESOURCE',
            link: '/admin/resources',
            at: meta.at,
          }),
          ...state.notifications,
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            'REQUESTED_RESOURCE',
            'ResourceRequest',
            meta.id,
            `${startup.name} requested ${action.resourceType}.`,
          ),
          ...state.activities,
        ],
      };
    }

    case 'RESOURCE_DECIDE': {
      const request = state.resourceRequests.find(
        (r) => r.id === action.requestId,
      );
      if (!request) return state;

      const startup = state.startups.find((s) => s.id === request.startupId);
      const approved = action.status === 'APPROVED';

      return {
        ...state,
        resourceRequests: replace(state.resourceRequests, request.id, (r) => ({
          ...r,
          status: action.status,
          note: action.note,
          decidedAt: meta.at,
          decidedBy: meta.actorName,
        })),
        notifications: startup
          ? [
              notify({
                id: meta.auxIds[0],
                audienceRole: 'FOUNDER',
                audienceId: startup.founderId,
                title: approved ? 'Resource approved' : 'Resource declined',
                message:
                  action.note ??
                  `Your request for ${request.resourceType} was ${approved ? 'approved' : 'declined'}.`,
                type: 'RESOURCE',
                link: '/founder/funding',
                at: meta.at,
              }),
              ...state.notifications,
            ]
          : state.notifications,
        activities: [
          logActivity(
            meta,
            meta.auxIds[1],
            approved ? 'APPROVED_RESOURCE' : 'REJECTED_RESOURCE',
            'ResourceRequest',
            request.id,
            `${request.resourceType} for ${startup?.name ?? 'a startup'} ${approved ? 'approved' : 'declined'}.`,
          ),
          ...state.activities,
        ],
      };
    }

    /* ------------------------------------------------------- programs */

    case 'PROGRAM_CREATE':
      return {
        ...state,
        programs: [
          ...state.programs,
          { ...action.draft, id: meta.id, startupIds: [] },
        ],
        activities: [
          logActivity(
            meta,
            meta.auxIds[0],
            'CREATED_PROGRAM',
            'Program',
            meta.id,
            `Programme "${action.draft.name}" created.`,
          ),
          ...state.activities,
        ],
      };

    case 'PROGRAM_UPDATE':
      return {
        ...state,
        programs: replace(state.programs, action.programId, (p) => ({
          ...p,
          ...action.patch,
        })),
      };

    case 'PROGRAM_DELETE':
      return {
        ...state,
        programs: state.programs.filter((p) => p.id !== action.programId),
        startups: state.startups.map((s) =>
          s.programId === action.programId ? { ...s, programId: null } : s,
        ),
        applications: state.applications.map((a) =>
          a.programId === action.programId ? { ...a, programId: null } : a,
        ),
      };

    /* -------------------------------------------------------- startup */

    case 'STARTUP_UPDATE':
      return {
        ...state,
        startups: replace(state.startups, action.startupId, (s) => ({
          ...s,
          ...action.patch,
        })),
      };

    /* -------------------------------------------------- notifications */

    case 'NOTIFICATION_MARK_READ':
      return {
        ...state,
        notifications: replace(
          state.notifications,
          action.notificationId,
          (n) => ({ ...n, read: true }),
        ),
      };

    case 'NOTIFICATION_MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.audienceRole === action.role &&
          (n.audienceId === null || n.audienceId === action.audienceId)
            ? { ...n, read: true }
            : n,
        ),
      };

    default:
      return state;
  }
}
