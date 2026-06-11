# user-action-coverage-review

**The failure this prevents:** a release goes out, and nobody can say which of the forty clickable things in the app are actually proven to work — because tests accreted around features, not around what users can *do*. The save button has three unit tests; the delete button has none; the admin-only export was silently broken two sprints ago.

This skill builds the inventory the test suite should have been built from: every user action, mapped to evidence.

## What it does

After a plan is accepted and before implementation starts (and again before final validation if scope changed), the agent must produce an **action matrix**:

| User action | Route/surface | Role/persona | Data state | Expected behavior | Browser/E2E evidence | Unit/integration evidence | Status |
|---|---|---|---|---|---|---|---|

with a closed status vocabulary: `covered / missing / stale / partial / negative assertion needed / blocked / deferred by user`.

Gap rows are not observations — they become implementation tasks before the full gate runs.

## The design choices worth stealing

- **Actions, not features, as the unit of coverage.** "Save profile as a signed-in user with a valid form" is testable; "profile feature" is not. The matrix forces role and data-state columns, which is where untested paths hide (admin vs. user, empty vs. populated, error vs. success).
- **Removed actions need negative assertions.** When UI is deleted, a browser test must prove it's *gone* where it used to be reachable. Stale E2E specs describing removed buttons are treated as bugs.
- **Three evidence layers per row.** Browser proof that the user can perform the action; integration proof of the API/persistence boundary; unit proof of the changed logic. One layer can't stand in for another.
- **Scoped by impact, not the whole app.** This is a per-change review; whole-app audits are explicitly routed to `$full-app-review`. Boundary statements keep sibling skills from half-doing each other's jobs.

## Install

```bash
scripts/install-skill.sh user-action-coverage-review
```

Triggers for substantial user-facing work: routes, forms, mutations, uploads, role-gated actions, portals, release readiness.

## Adapt it

- If your repo keeps a flow inventory or critical-workflow manifest, make the matrix update it in the same change — one source of truth.
- Add personas to match your auth model (the default set is public / authenticated / admin / superadmin).
- Wire the matrix into PR descriptions: it doubles as reviewable proof of coverage thinking.
