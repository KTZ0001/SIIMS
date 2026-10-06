import { describe, expect, it } from 'vitest';
import type { Action, ActionMeta } from '@/store/actions';
import { reducer } from '@/store/reducer';
import { createSeedState } from '@/store/seed';
import {
  adminKpis,
  applicationForStartup,
  canSubmit,
  feedbackForStartup,
  milestonesForStartup,
  notificationsFor,
  startupForFounder,
  startupsForMentor,
  unreadCount,
} from '@/store/selectors';
import type { AppState, Role } from '@/store/types';

/**
 * Walks the full demo path through the real reducer:
 *   founder submits -> admin sees it -> admin evaluates -> admin accepts ->
 *   admin assigns mentor -> mentor sees startup -> mentor sets milestone and
 *   feedback -> founder sees all three -> founder updates progress ->
 *   admin analytics move.
 */

let counter = 0;
function meta(actorId: string, actorName: string, actorRole: Role): ActionMeta {
  counter += 1;
  return {
    id: `test-id-${counter}`,
    auxIds: [
      `aux-${counter}-a`,
      `aux-${counter}-b`,
      `aux-${counter}-c`,
      `aux-${counter}-d`,
      `aux-${counter}-e`,
    ],
    at: new Date().toISOString(),
    actorId,
    actorName,
    actorRole,
  };
}

const FOUNDER = ['usr-priya', 'Priya Raghunathan', 'FOUNDER'] as const;
const ADMIN = ['usr-kavita', 'Kavita Menon', 'ADMIN'] as const;
const MENTOR = ['mnt-ananya', 'Ananya Iyer', 'MENTOR'] as const;

function run(
  state: AppState,
  actor: readonly [string, string, Role],
  action: Omit<Action, 'meta'>,
): AppState {
  return reducer(state, {
    ...action,
    meta: meta(actor[0], actor[1], actor[2]),
  } as Action);
}

describe('critical demo path', () => {
  it('carries a startup from draft to a moved admin KPI', () => {
    let state = createSeedState();

    /* ---- 0. starting position ------------------------------------- */
    const startup = startupForFounder(state, 'usr-priya');
    expect(startup).not.toBeNull();
    expect(startup!.name).toBe('ShopThread');
    expect(startup!.mentorId).toBeNull();

    let application = applicationForStartup(state, startup!.id);
    expect(application!.status).toBe('DRAFT');

    const before = adminKpis(state);

    /* ---- 1. founder completes and submits -------------------------- */
    // The seeded draft stops at step 3, so it must not be submittable yet.
    expect(canSubmit(application!.form)).toBe(false);

    const completedForm = {
      ...application!.form,
      targetMarket:
        'Independent labels selling direct in metro India, roughly 900 of them at our size band.',
      marketSize: '₹1,400 crore of resale GMV flowing through general marketplaces today.',
      competitors: 'General resale marketplaces that compete with the brand rather than serve it.',
      businessModel: 'Per-item take rate on resale, plus a monthly platform fee per label.',
      revenueStreams: '12% take rate on each resold item, ₹15,000 monthly platform fee.',
      pricingNotes: 'Take rate benchmarked against the margin labels already lose to marketplaces.',
      tractionSummary: 'Three labels signed a letter of intent; intake prototype running with one partner facility.',
      keyMetrics: '3 LOIs · 140 test garments processed · 0 revenue.',
      teamSummary:
        'Priya Raghunathan ran supply chain at a D2C label for five years. Nikhil Menon leads engineering.',
      hiringPlan: 'An operations lead once the first paying label is live.',
      fundingRequested: 4_000_000,
      fundingUse: 'Intake tooling, partner facility deposits and twelve months of runway.',
      incubationGoals:
        'Help pressure-testing the take rate, and introductions to labels in the incubator network.',
    };

    expect(canSubmit(completedForm)).toBe(true);

    state = run(state, FOUNDER, {
      type: 'APPLICATION_SAVE_DRAFT',
      applicationId: application!.id,
      form: completedForm,
      completedSteps: 8,
    });
    state = run(state, FOUNDER, {
      type: 'APPLICATION_SUBMIT',
      applicationId: application!.id,
    });

    application = applicationForStartup(state, startup!.id);
    expect(application!.status).toBe('SUBMITTED');
    expect(application!.submittedAt).not.toBeNull();

    /* ---- 2. admin sees it ------------------------------------------ */
    const adminInbox = notificationsFor(state, 'ADMIN', 'usr-kavita');
    expect(
      adminInbox.some((n) => n.message.includes('ShopThread')),
    ).toBe(true);
    expect(unreadCount(state, 'ADMIN', 'usr-kavita')).toBeGreaterThan(
      0,
    );
    expect(adminKpis(state).awaitingAction).toBe(before.awaitingAction + 1);

    /* ---- 3. admin evaluates (scorecard) ---------------------------- */
    state = run(state, ADMIN, {
      type: 'EVALUATION_SAVE',
      applicationId: application!.id,
      scores: {
        innovation: 8,
        problemRelevance: 8,
        solutionFeasibility: 7,
        marketPotential: 7,
        scalability: 8,
        businessModel: 7,
        teamStrength: 7,
        impact: 6,
      },
      strengths: 'White-label positioning avoids competing with the brand.',
      concerns: 'Take rate is untested and no revenue yet.',
      recommendation: 'Accept with a go-to-market focused mentor.',
    });

    application = applicationForStartup(state, startup!.id);
    const evaluation = state.evaluations.find(
      (e) => e.applicationId === application!.id,
    );

    expect(evaluation).toBeDefined();
    expect(evaluation!.total).toBe(58);
    expect(evaluation!.percentage).toBe(72.5);
    expect(evaluation!.category).toBe('Promising');
    // Scoring advances to Evaluated but must NOT decide acceptance.
    expect(application!.status).toBe('EVALUATED');

    /* ---- 4. admin shortlists, then accepts ------------------------- */
    state = run(state, ADMIN, {
      type: 'APPLICATION_SET_STATUS',
      applicationId: application!.id,
      status: 'SHORTLISTED',
      note: null,
    });
    expect(applicationForStartup(state, startup!.id)!.status).toBe(
      'SHORTLISTED',
    );

    state = run(state, ADMIN, {
      type: 'APPLICATION_SET_STATUS',
      applicationId: application!.id,
      status: 'ACCEPTED',
      note: 'Accepted — strong positioning, mentor assigned for go-to-market.',
    });

    application = applicationForStartup(state, startup!.id);
    expect(application!.status).toBe('ACCEPTED');
    expect(application!.decisionNote).toContain('Accepted');
    expect(adminKpis(state).activeStartups).toBe(before.activeStartups + 1);
    // Accepted but unassigned, so the "needs a mentor" counter rises.
    expect(adminKpis(state).unassignedStartups).toBe(
      before.unassignedStartups + 1,
    );

    /* ---- 5. admin assigns a free mentor ---------------------------- */
    expect(startupsForMentor(state, 'mnt-ananya')).toHaveLength(1);

    state = run(state, ADMIN, {
      type: 'MENTOR_ASSIGN',
      startupId: startup!.id,
      mentorId: 'mnt-ananya',
    });

    expect(adminKpis(state).unassignedStartups).toBe(
      before.unassignedStartups,
    );

    /* ---- 6. mentor sees the startup -------------------------------- */
    const mentorPortfolio = startupsForMentor(state, 'mnt-ananya');
    expect(mentorPortfolio).toHaveLength(2);
    expect(mentorPortfolio.map((s) => s.name)).toContain('ShopThread');
    expect(
      notificationsFor(state, 'MENTOR', 'mnt-ananya').some((n) =>
        n.message.includes('ShopThread'),
      ),
    ).toBe(true);

    /* ---- 7. mentor sets a milestone and leaves feedback ------------ */
    const due = new Date(Date.now() + 30 * 86_400_000).toISOString();
    state = run(state, MENTOR, {
      type: 'MILESTONE_CREATE',
      startupId: startup!.id,
      title: 'Sign the first paying label',
      description: 'Convert one of the three LOIs into a signed contract.',
      dueDate: due,
    });

    const created = milestonesForStartup(state, startup!.id);
    expect(created).toHaveLength(1);
    expect(created[0].status).toBe('NOT_STARTED');
    expect(created[0].progress).toBe(0);
    expect(created[0].createdByName).toBe('Ananya Iyer');

    state = run(state, MENTOR, {
      type: 'FEEDBACK_ADD',
      startupId: startup!.id,
      milestoneId: created[0].id,
      content:
        'Lead with the margin the label is currently losing to marketplaces, not the product.',
      rating: 4,
    });

    /* ---- 8. founder sees mentor, milestone and feedback ------------ */
    const founderStartup = startupForFounder(state, 'usr-priya');
    expect(founderStartup!.mentorId).toBe('mnt-ananya');

    const founderMilestones = milestonesForStartup(state, startup!.id);
    expect(founderMilestones).toHaveLength(1);

    const founderFeedback = feedbackForStartup(state, startup!.id);
    expect(founderFeedback).toHaveLength(1);
    expect(founderFeedback[0].mentorName).toBe('Ananya Iyer');

    const founderInbox = notificationsFor(state, 'FOUNDER', 'usr-priya');
    expect(founderInbox.some((n) => n.title === 'Mentor assigned')).toBe(true);
    expect(founderInbox.some((n) => n.title === 'New milestone set')).toBe(
      true,
    );
    expect(founderInbox.some((n) => n.title === 'New mentor feedback')).toBe(
      true,
    );

    /* ---- 9. founder updates progress ------------------------------- */
    const kpisBeforeProgress = adminKpis(state);

    state = run(state, FOUNDER, {
      type: 'MILESTONE_SET_PROGRESS',
      milestoneId: created[0].id,
      progress: 60,
    });

    const updated = milestonesForStartup(state, startup!.id)[0];
    expect(updated.progress).toBe(60);
    expect(updated.status).toBe('IN_PROGRESS');

    // The mentor is told about it.
    expect(
      notificationsFor(state, 'MENTOR', 'mnt-ananya').some(
        (n) => n.title === 'Milestone progress',
      ),
    ).toBe(true);

    /* ---- 10. admin analytics reflect the update -------------------- */
    const after = adminKpis(state);
    expect(after.milestoneCompletion).not.toBe(
      kpisBeforeProgress.milestoneCompletion,
    );
    expect(state.activities[0].action).toBe('UPDATED_MILESTONE');
    expect(state.activities[0].actorName).toBe('Priya Raghunathan');

    /* ---- completing it flips status and notifies ------------------- */
    state = run(state, FOUNDER, {
      type: 'MILESTONE_SET_PROGRESS',
      milestoneId: created[0].id,
      progress: 100,
    });
    const done = milestonesForStartup(state, startup!.id)[0];
    expect(done.status).toBe('COMPLETED');
    expect(done.completedAt).not.toBeNull();
  });
});

describe('shared state and role switching', () => {
  it('never resets data when the active role changes', () => {
    let state = createSeedState();
    const startupCount = state.startups.length;

    state = run(state, FOUNDER, { type: 'SET_ROLE', role: 'ADMIN' });
    state = run(state, ADMIN, { type: 'SET_ROLE', role: 'MENTOR' });
    state = run(state, MENTOR, { type: 'SET_ROLE', role: 'FOUNDER' });

    expect(state.activeRole).toBe('FOUNDER');
    expect(state.startups).toHaveLength(startupCount);
    expect(state.applications).toHaveLength(10);
    expect(state.evaluations).toHaveLength(7);
  });

  it('seeds a populated demo', () => {
    const state = createSeedState();
    expect(state.startups.length).toBeGreaterThanOrEqual(8);
    expect(state.mentors).toHaveLength(5);
    expect(state.milestones.length).toBeGreaterThan(0);
    expect(state.programs.length).toBeGreaterThan(0);
    expect(state.notifications.length).toBeGreaterThan(0);
    expect(state.activities.length).toBeGreaterThan(0);

    // Every startup name is distinct — no cloned seed rows.
    const names = new Set(state.startups.map((s) => s.name));
    expect(names.size).toBe(state.startups.length);

    // Every application points at a real startup and founder.
    for (const application of state.applications) {
      expect(
        state.startups.some((s) => s.id === application.startupId),
      ).toBe(true);
      expect(state.users.some((u) => u.id === application.founderId)).toBe(
        true,
      );
    }

    // Every assigned mentor exists.
    for (const startup of state.startups) {
      if (startup.mentorId) {
        expect(state.mentors.some((m) => m.id === startup.mentorId)).toBe(
          true,
        );
      }
    }
  });
});

describe('mentor deletion', () => {
  it('unassigns startups instead of leaving dangling references', () => {
    let state = createSeedState();
    expect(startupsForMentor(state, 'mnt-rahul').length).toBeGreaterThan(0);

    state = run(state, ADMIN, {
      type: 'MENTOR_DELETE',
      mentorId: 'mnt-rahul',
    });

    expect(state.mentors.some((m) => m.id === 'mnt-rahul')).toBe(false);
    expect(state.startups.every((s) => s.mentorId !== 'mnt-rahul')).toBe(true);
  });
});
