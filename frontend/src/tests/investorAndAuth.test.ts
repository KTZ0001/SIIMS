import { describe, expect, it } from 'vitest';
import type { Action, ActionMeta } from '@/store/actions';
import { reducer } from '@/store/reducer';
import { createSeedState } from '@/store/seed';
import {
  applicationForStartup,
  canSubmit,
  investableStartups,
  investmentOpportunities,
  notificationsFor,
  searchStartups,
  startupDomains,
  startupForFounder,
  startupStages,
} from '@/store/selectors';
import type { AppState, ApplicationForm, Role } from '@/store/types';

let counter = 0;
function meta(actorId: string, actorName: string, actorRole: Role): ActionMeta {
  counter += 1;
  return {
    id: `t-${counter}`,
    auxIds: [
      `t-${counter}-a`,
      `t-${counter}-b`,
      `t-${counter}-c`,
      `t-${counter}-d`,
      `t-${counter}-e`,
    ],
    at: new Date().toISOString(),
    actorId,
    actorName,
    actorRole,
  };
}

const ADMIN = ['usr-kavita', 'Kavita Menon', 'ADMIN'] as const;
const INVESTOR = ['usr-rohan', 'Rohan Malhotra', 'INVESTOR'] as const;
const ANON = ['anon', 'Anonymous', 'FOUNDER'] as const;

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

function completeForm(base: ApplicationForm, name: string): ApplicationForm {
  return {
    ...base,
    companyName: name,
    domain: 'Retail Technology',
    sector: 'Commerce',
    stage: 'Prototype',
    city: 'Bengaluru',
    foundedYear: 2026,
    problemStatement: 'Independent labels lose the customer on resale.',
    targetCustomer: 'Direct-to-consumer clothing labels.',
    solution: 'A branded resale storefront embedded in their own site.',
    uniqueValue: 'White-label infrastructure rather than a rival marketplace.',
    targetMarket: 'Roughly 900 labels in our size band.',
    marketSize: '₹1,400 crore of resale GMV.',
    competitors: 'General resale marketplaces.',
    businessModel: 'Take rate plus a platform fee.',
    revenueStreams: '12% take rate, ₹15,000 monthly fee.',
    pricingNotes: 'Benchmarked against marketplace margin loss.',
    tractionSummary: 'Three signed letters of intent.',
    keyMetrics: '3 LOIs · 140 test garments · 0 revenue.',
    teamSummary: 'Two founders, supply chain and engineering.',
    teamSize: 2,
    hiringPlan: 'An operations lead once the first label is live.',
    fundingRequested: 4_000_000,
    fundingUse: 'Intake tooling and twelve months of runway.',
    incubationGoals: 'Pressure-test the take rate.',
  };
}

/* ------------------------------------------------------------- R1 register */

describe('R1 — registration', () => {
  it('creates a founder, a startup and a draft application', () => {
    const before = createSeedState();
    const state = run(before, ANON, {
      type: 'REGISTER_FOUNDER',
      firstName: 'Aisha',
      lastName: 'Khan',
      email: 'aisha@loopcart.in',
      startupName: 'Loopcart',
    });

    expect(state.users).toHaveLength(before.users.length + 1);
    expect(state.startups).toHaveLength(before.startups.length + 1);
    expect(state.applications).toHaveLength(before.applications.length + 1);
    expect(state.activeRole).toBe('FOUNDER');

    const user = state.users.find((u) => u.email === 'aisha@loopcart.in');
    expect(user).toBeDefined();
    expect(user!.role).toBe('FOUNDER');

    const startup = startupForFounder(state, user!.id);
    expect(startup).not.toBeNull();
    expect(startup!.name).toBe('Loopcart');
    expect(startup!.mentorId).toBeNull();

    const application = applicationForStartup(state, startup!.id);
    expect(application!.status).toBe('DRAFT');
    expect(application!.form.companyName).toBe('Loopcart');
    expect(canSubmit(application!.form)).toBe(false);

    // The founder lens now points at the new account.
    const founderIdentity = state.identities.find((i) => i.role === 'FOUNDER');
    expect(founderIdentity!.refId).toBe(user!.id);
    expect(founderIdentity!.email).toBe('aisha@loopcart.in');

    // Registration must not disturb anyone else's data.
    expect(state.evaluations).toEqual(before.evaluations);
    expect(state.milestones).toEqual(before.milestones);
    expect(state.mentors).toEqual(before.mentors);
    expect(state.identities.filter((i) => i.role !== 'FOUNDER')).toEqual(
      before.identities.filter((i) => i.role !== 'FOUNDER'),
    );
  });

  it('keeps connected state: a registered founder submits and the admin sees it', () => {
    let state = run(createSeedState(), ANON, {
      type: 'REGISTER_FOUNDER',
      firstName: 'Aisha',
      lastName: 'Khan',
      email: 'aisha@loopcart.in',
      startupName: 'Loopcart',
    });

    const user = state.users.find((u) => u.email === 'aisha@loopcart.in')!;
    const startup = startupForFounder(state, user.id)!;
    let application = applicationForStartup(state, startup.id)!;
    const FOUNDER = [user.id, 'Aisha Khan', 'FOUNDER'] as const;

    const filled = completeForm(application.form, 'Loopcart');
    expect(canSubmit(filled)).toBe(true);

    state = run(state, FOUNDER, {
      type: 'APPLICATION_SAVE_DRAFT',
      applicationId: application.id,
      form: filled,
      completedSteps: 8,
    });
    state = run(state, FOUNDER, {
      type: 'APPLICATION_SUBMIT',
      applicationId: application.id,
    });

    application = applicationForStartup(state, startup.id)!;
    expect(application.status).toBe('SUBMITTED');

    // The admin lens sees it without any per-user session handoff.
    expect(
      notificationsFor(state, 'ADMIN', 'usr-kavita').some((n) =>
        n.message.includes('Loopcart'),
      ),
    ).toBe(true);
    expect(
      state.applications.some(
        (a) => a.form.companyName === 'Loopcart' && a.status === 'SUBMITTED',
      ),
    ).toBe(true);
  });
});

/* --------------------------------------------------------- R3 investor */

describe('R3 — investor search', () => {
  it('only exposes accepted startups', () => {
    const state = createSeedState();
    const visible = investableStartups(state);

    expect(visible.length).toBeGreaterThan(0);
    for (const startup of visible) {
      const application = applicationForStartup(state, startup.id);
      expect(application!.status).toBe('ACCEPTED');
    }

    // The seeded draft must not be browsable.
    expect(visible.some((s) => s.name === 'ShopThread')).toBe(false);
  });

  it('searches by name, industry and stage', () => {
    const state = createSeedState();
    const blank = { query: '', domain: '', stage: '' };

    const byName = searchStartups(state, { ...blank, query: 'nexus' });
    expect(byName).toHaveLength(1);
    expect(byName[0].name).toBe('Nexus AI');

    // Case-insensitive and matches sector/city too.
    expect(searchStartups(state, { ...blank, query: 'NEXUS' })).toHaveLength(1);
    expect(
      searchStartups(state, { ...blank, query: 'chennai' })[0].name,
    ).toBe('Nexus AI');

    const domain = startupDomains(state)[0];
    const byDomain = searchStartups(state, { ...blank, domain });
    expect(byDomain.length).toBeGreaterThan(0);
    expect(byDomain.every((s) => s.domain === domain)).toBe(true);

    const stage = startupStages(state)[0];
    const byStage = searchStartups(state, { ...blank, stage });
    expect(byStage.every((s) => s.stage === stage)).toBe(true);

    // Filters combine, and a miss returns empty rather than everything.
    expect(
      searchStartups(state, { ...blank, query: 'zzzzz-no-such-startup' }),
    ).toHaveLength(0);
  });

  it('lists only startups with pending funding as opportunities', () => {
    const state = createSeedState();
    const opportunities = investmentOpportunities(state);

    expect(opportunities.length).toBeGreaterThan(0);
    for (const row of opportunities) {
      expect(row.openRequests.length).toBeGreaterThan(0);
      expect(row.openRequests.every((f) => f.status === 'PENDING')).toBe(true);
      expect(row.requestedTotal).toBe(
        row.openRequests.reduce((sum, f) => sum + f.amount, 0),
      );
    }
  });
});

describe('investor is read-only', () => {
  it('express interest notifies without mutating the pipeline', () => {
    const before = createSeedState();
    const target = investableStartups(before)[0];

    const after = run(before, INVESTOR, {
      type: 'EXPRESS_INTEREST',
      startupId: target.id,
    });

    // Nothing in the pipeline moved.
    expect(after.applications).toEqual(before.applications);
    expect(after.evaluations).toEqual(before.evaluations);
    expect(after.milestones).toEqual(before.milestones);
    expect(after.startups).toEqual(before.startups);
    expect(after.fundingRequests).toEqual(before.fundingRequests);
    expect(after.mentors).toEqual(before.mentors);

    // But the founder and the incubation center were told.
    expect(after.notifications.length).toBe(before.notifications.length + 2);
    expect(
      notificationsFor(after, 'FOUNDER', target.founderId).some((n) =>
        n.title.includes('investor'),
      ),
    ).toBe(true);
    expect(
      notificationsFor(after, 'ADMIN', 'usr-kavita').some(
        (n) => n.title === 'Investor interest',
      ),
    ).toBe(true);
    expect(after.activities[0].action).toBe('EXPRESSED_INTEREST');
    expect(after.activities[0].actorRole).toBe('INVESTOR');
  });

  it('ignores a request to express interest in an unknown startup', () => {
    const before = createSeedState();
    const after = run(before, INVESTOR, {
      type: 'EXPRESS_INTEREST',
      startupId: 'stp-does-not-exist',
    });
    expect(after).toBe(before);
  });
});

/* ------------------------------------------------------------ R2 roles */

describe('R2 — role selection', () => {
  it('exposes all four demo accounts and never resets data on switch', () => {
    let state = createSeedState();

    const emails = state.identities.map((i) => i.email).sort();
    expect(emails).toEqual([
      'admin@siims.demo',
      'founder@siims.demo',
      'investor@siims.demo',
      'mentor@siims.demo',
    ]);

    const startupCount = state.startups.length;
    const applicationCount = state.applications.length;

    for (const role of [
      'ADMIN',
      'MENTOR',
      'INVESTOR',
      'FOUNDER',
    ] as const) {
      state = run(state, ADMIN, { type: 'SET_ROLE', role });
      expect(state.activeRole).toBe(role);
      expect(state.startups).toHaveLength(startupCount);
      expect(state.applications).toHaveLength(applicationCount);
    }
  });

  it('resolves every identity to a real record', () => {
    const state = createSeedState();
    for (const identity of state.identities) {
      const found =
        identity.role === 'MENTOR'
          ? state.mentors.some((m) => m.id === identity.refId)
          : state.users.some((u) => u.id === identity.refId);
      expect(found, `${identity.role} identity refId is dangling`).toBe(true);
    }
  });
});
