---
name: full-app-review
description: Orchestrate a full non-mutating app or repo review across architecture, live flows, frontend quality, testing and coverage, security, observability and error instrumentation, analytics, dependencies, deployment, validation readiness, and redundant code paths. The default outcome is an evidence-backed, severity-ordered report plus a prioritized remediation plan — no mutations. Use when the user asks to fully review an app or repo, perform a full app review, app audit, production readiness review, end-to-end review, comprehensive codebase review, or asks what should be fixed before implementation, push, merge, or production. Not for single-dimension requests — route those to the relevant specialist skill directly.
---

# Full App Review

## Purpose

Use this skill when "fully review this app/repo" needs a fixed, repeatable meaning. The default outcome is an evidence-backed report plus prioritized remediation plan, not automatic code changes.

## Operating Rules

- Do not mutate code, config, data, branches, dependencies, or deployment state unless the user separately asks for remediation.
- Start from repo truth: current instructions, scripts, routes, APIs, tests, env examples, deployment config, monitoring code, and live app structure.
- Build the review matrix before making conclusions. Use `references/review-matrix.md`.
- Assess the repo's existing error instrumentation and observability setup. Report gaps; do not impose a universal provider. Use `references/observability-checklist.md`.
- Use `references/report-template.md` for the final report shape unless the user requests a different format.
- Classify findings as `blocking`, `high`, `medium`, or `low`, and attach evidence, affected paths, required tests, and a concrete fix plan to each material finding.
- If a repo-local `AGENTS.md` is stricter than this skill, follow the repo-local rules.
- If review evidence is stale, missing, or blocked by auth/secrets/provider access, say so explicitly and mark the residual risk.

## Specialist Skills

Use these skills as sub-workflows when their dimensions are in scope:

- `$frontend-design-quality`: UI patterns, responsiveness, viewport fill, visual states, portals/admin flows, screenshots, and overflow checks.
- `$feature-design-preflight`: nontrivial workflows, provider limits, data/control flow, failure modes, UX states, and operational constraints.
- `$test-readiness-preflight`: coverage obligations, integration/E2E gaps, local/container gates, migrations, seeds, test doubles, and validation blockers.
- `$repo-testing-setup`: missing or incomplete testing foundation, host-only lanes, absent canonical containerized gate, undeclared hook/gate enforcement model, missing tooling matrix, missing committed workflow inventories, mis-scoped secret scanning, or missing provider stubs. In a review, report this as remediation; do not mutate.
- `$user-action-coverage-review`: the matrix format for user-action browser/E2E evidence. Express the testing dimension's user-action findings as its action matrix (action, surface, role, data state, evidence, status) so gaps convert directly into implementation tasks.
- `$security-threat-model`: trust boundaries, auth/authz, secrets, uploads, parsers, webhooks, admin paths, deployment surfaces, and abuse cases.
- `$codebase-prune-review`: redundant, superseded, legacy, dead, compatibility, or attack-surface-increasing paths.
- `$nextjs-vercel-analytics`: Next.js/Vercel analytics and custom-event instrumentation when analytics is explicitly in scope or already present.
- `$error-logging-instrumentation`: deep error-logging, runtime observability, structured logging, privacy/redaction, alerting evidence, and remediation when observability gaps need fixing.

When a dimension is not applicable, record it as `not applicable` with a short reason instead of silently skipping it.

## Workflow

1. Baseline the repo.
   - Inspect instructions, package scripts, dependency manifests, lockfiles, route trees, API handlers, auth, data stores, background jobs, provider integrations, deployment config, tests, env examples, and monitoring/logging setup.
   - Prefer cheap static inspection first: `rg`, `find`, manifest reads, config reads, test inventory, route inventory, and git status.
   - Do not start expensive full gates by default. For a review, identify what the local/container gates are and whether they appear ready to run.
2. Build the review matrix.
   - Map live flows, critical paths, user roles, mutations, error paths, security boundaries, observability coverage, analytics coverage, legacy paths, release risks, and required tests.
   - Record evidence for each row: files, scripts, configs, commands inspected, and observed gaps.
3. Evaluate each dimension.
   - Frontend: existing UI patterns, responsive behavior, viewport use, clutter, role portals, visual states, overflow risks, and screenshot coverage.
   - Testing: unit coverage targets, integration coverage, browser/E2E user actions expressed in the `$user-action-coverage-review` matrix format, test isolation, seeds, migrations, container/local gates, testing-foundation adoption status per `$repo-testing-setup`, and predictable validation blockers.
   - Security: trust boundaries, auth/authz, secrets, uploads, file parsing, webhooks, admin surfaces, data exposure, CI/CD, and deployment risks.
   - Observability: client/server/runtime error capture, log hygiene, privacy/redaction, alerting/monitoring evidence, and runbook gaps. Use `$error-logging-instrumentation` for detailed logging coverage analysis or remediation.
   - Analytics: only when applicable, verify typed event taxonomy, no-PII payload rules, frontend/backend event connection, and platform plan limitations.
   - Dependencies/deployment: version currency, audit posture, lockfile consistency, git-integration deploy policy, database migration sequencing, and production release readiness.
   - Pruning: old providers, compatibility layers, redundant code, unused env vars, stale scripts, dead routes, and attack-surface-reduction candidates.
4. Produce the report.
   - Lead with findings, ordered by severity.
   - Include a skill coverage matrix showing which specialist workflows were applied, skipped, or blocked.
   - Include commands inspected or run, with pass/fail/not-run status.
   - Group remediation by workstream and include the tests/local gates required to prove each group.
   - Set the overall status by the derivation rule below.

## Severity and Overall Status

- `blocking`: must be fixed before push, merge, deployment, or production approval.
- `high`: important security, data integrity, runtime reliability, or release risk.
- `medium`: meaningful quality, coverage, maintainability, observability, UX, or operational gap.
- `low`: cleanup, polish, documentation, or incremental improvement.

Every `blocking` and `high` finding needs affected paths, user/system impact, and the first safe remediation step.

The report's overall status is derived, not judged:

1. Any `blocking` finding → `blocking issues found`.
2. Else any `high` finding → `high-risk gaps`.
3. Else any `medium`/`low` finding, or any `blocked` dimension → `ready for remediation planning`, with blocked dimensions listed beside the status.
4. Else → `no material findings` — only valid when zero dimensions are `blocked`.

Two reviews of the same repo state must produce the same overall status.

## No User Available

This review can run from automations. In headless contexts:

- Run cheap static inspection only. Never execute state-mutating commands, destructive resets, or expensive full gates headless.
- Record every dimension that cannot be verified as `blocked` in the skill coverage matrix and under residual risk.
- Never report `no material findings` while any dimension is `blocked`.
- Remediation never starts from a headless review; the report is the terminal output.

## Completion Blockers

Do not call the review complete until none of these are true:

- A dimension was skipped without `not applicable` and a reason.
- A material finding lacks evidence paths.
- A `blocking` or `high` finding lacks impact and a first safe remediation step.
- The report omits the skill coverage matrix, or deviates from `references/report-template.md` without the user asking for a different format.
- Anything was mutated during the review.
- Stale, missing, or access-blocked evidence is not recorded under residual risk.
- The overall status does not follow the derivation rule — including `no material findings` while any dimension is `blocked`.

## Example Prompts

- "Use `$full-app-review` to fully review this app and give me a prioritized fix plan."
- "Fully review this repo before we plan the next build."
- "Run a production readiness review of this Next.js app without editing files."
- "Audit this app for testing, observability, security, UI quality, and old code paths."
