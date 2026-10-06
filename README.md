# SIIMS — Startup Incubation and Innovation Management System

An academic demo prototype simulating the full startup incubation lifecycle across three roles: **Startup Founder**, **Incubation Center (Admin)** and **Mentor**.

It is a **pure client-side React application**. There is no API server and no database — all state lives in one shared store persisted to `localStorage`, so every role reads and writes the same data and a founder's submission appears in the admin's queue instantly.

---

## Running it

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the app starts on the login screen. The marketing page is at `/landing`.

That's the whole setup. No `.env`, no database, no second terminal.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm test` | Run the critical-path test suite |
| `npm run typecheck` | `tsc --noEmit` |

Optional container build (static Nginx, no backend):

```bash
docker compose -f docker-compose.prod.yml up --build   # http://localhost:8080
```

---

## Requirements coverage

| Req | Where it lives |
|---|---|
| **R1** Registration | `/login` → *Register* tab. Creates a founder, an empty startup and a blank draft application, then opens the founder dashboard. |
| **R2** Login (role-based) | `/login` → four one-click demo accounts. Selecting a role sets the active lens. |
| **R3** Search startups | Investor → *Browse Startups*. Free-text search plus industry and stage filters. |
| **R4–R7** | Application lifecycle, evaluation scorecard, mentor assignment, milestones and analytics — see the demo path below. |

## Roles

Sign in at **`/login`**, or use the **role switcher in the top-right** to move between roles without losing your place. Both do the same thing: change the active lens over one shared dataset. There are no passwords and no per-user sessions — a founder's submission is visible to the admin immediately, which is the property the whole demo rests on.

| Role | Person | Account | Access |
|---|---|---|---|
| Startup Founder | Priya Raghunathan | `founder@siims.demo` | Read / write |
| Incubation Center | Kavita Menon | `admin@siims.demo` | Read / write |
| Mentor | Ananya Iyer | `mentor@siims.demo` | Read / write |
| Investor | Rohan Malhotra | `investor@siims.demo` | **Read-only** |

The investor lens can browse accepted startups, search and filter them, view open funding opportunities and express interest. Expressing interest writes a notification and an activity-log entry and nothing else — it cannot touch applications, evaluations, milestones or mentor assignments.

**Reset demo data** in the top bar re-seeds everything from scratch, including discarding any account you registered.

---

## The demo path

The seeded founder's startup, **ShopThread**, starts as a *draft application with no mentor*. That is deliberate: the entire lifecycle is drivable live rather than pre-baked. Walk it in this order.

1. **Founder → Application.** The draft stops at step 3 of 8. Fill the remaining steps (Market, Business Model, Traction, Team, Ask) and press **Submit application**. *Save draft* at any point survives a refresh.
2. **Switch to Incubation Center.** The notification bell has a new unread count; ShopThread is in **Applications** with status *Submitted*, and the review queue on the dashboard shows it.
3. **Evaluate.** Open ShopThread → **Evaluate**. Score the eight criteria 1–10; the total, percentage and category update live against the thresholds shown beside them. Save — the application moves to *Evaluated*.
4. **Decide.** Scoring never decides on its own. Use **Shortlist**, then **Accept** (or **Reject**) as separate actions, each with a note the founder sees.
5. **Assign a mentor.** Go to **Startups** — ShopThread now appears with a *No mentor assigned* flag. Click **Assign** and pick **Ananya Iyer** or **Meera Krishnan** (both have spare capacity; the dialog shows each mentor's load and blocks anyone at capacity).
6. **Switch to Mentor.** If you assigned Ananya, ShopThread is now in **My Startups** alongside MediQueue.
7. **Set a milestone and leave feedback.** Both notify the founder.
8. **Switch back to Founder.** *My Mentor* shows Ananya's profile, sessions and feedback; *Milestones* shows the new milestone.
9. **Update progress.** Move the slider and save. 
10. **Switch to Incubation Center.** The *Milestone progress* KPI and the *Milestone progress by startup* chart have moved, and the change is at the top of the **Activity Log**.
11. **Switch to Investor.** ShopThread now appears in *Browse Startups* (only accepted startups are listed). Search it by name, industry or stage, open it, and **Express interest** — the founder and the incubation center are both notified.

To demonstrate **R1** instead of using the seeded founder, register a new account at `/login` and drive the same path from step 1 with your own startup.

---

## Architecture

```
frontend/src/
  store/
    types.ts          Typed entities for the whole system
    seed.ts           The demo dataset (10 startups, 5 mentors, …)
    scoring.ts        Rule-based evaluation: criteria, thresholds, categories
    reducer.ts        Pure reducer — also emits notifications + activity rows
    actions.ts        Discriminated union of every action
    selectors.ts      Derived reads: KPIs, chart series, lookups
    persist.ts        localStorage load/save with a version guard
    StoreContext.tsx  Provider, dispatch wrapper, role resolution
  components/
    shared/           StatusBadge, StatCard, Modal, FormField, Toast, …
    layout/           AppShell, Sidebar, Topbar (role switcher, bell, reset)
    admin/            EvaluationScorecard
    ui/               Radix-based primitives
  pages/
    founder/  admin/  mentor/
```

**Design notes**

- The reducer is pure. Ids and timestamps arrive via an injected `meta` field, which is what lets it also append notifications and activity-log rows without reaching for `Date.now()`.
- Notifications are role-targeted (`audienceRole` + optional `audienceId`), so "notify the incubation center" is a single row.
- Milestone status is always *derived* from progress and due date, never set by hand.
- Evaluation scoring is rule-based and transparent — no ML. `buildEvaluation()` is shared by the seed and the scorecard so the two cannot drift.
- Deleting a mentor unassigns their startups rather than leaving dangling references.

---

## Seeded data

10 startups spanning one of every pipeline stage — 1 draft, 1 submitted, 1 under review, 1 evaluated, 1 shortlisted, 4 accepted, 1 rejected — plus 5 mentors, 7 evaluations across all four categories, 10 milestones, mentor feedback and sessions, funding and resource requests in every state, 4 programs, 14 notifications and an 18-entry activity log.

Application content is written, not filler: each has a real problem statement, market sizing, traction numbers and team summary, and the evaluations reference specifics from them.

---

## Testing

```bash
cd frontend && npm test
```

`src/tests/criticalPath.test.ts` drives the full path above through the real reducer and asserts each hand-off — including that scoring does **not** auto-accept, that assignment notifies both sides, and that the admin KPI moves when the founder updates progress.

---

## About the `backend/` directory

An earlier iteration of this project had an Express server backed by JSON files. **It is not part of the running application** — nothing in `frontend/` imports it and no build or test step touches it. It is retained in the tree for reference only and can be deleted without affecting the demo.
