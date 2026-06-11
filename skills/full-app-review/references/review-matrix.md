# Full App Review Matrix

Use this matrix before conclusions. Each row needs evidence, status, severity where relevant, and the next proof needed.

## Status Values

- `covered`: evidence is sufficient for the review depth requested.
- `gap`: missing, weak, risky, or incomplete.
- `blocked`: cannot verify because of missing access, secrets, auth, tooling, or runtime state.
- `not applicable`: dimension does not apply to this repo or request.

## Matrix Rows

| Area | What to Inspect | Evidence Examples | Specialist Workflow |
| --- | --- | --- | --- |
| Repo instructions | Root and repo-local `AGENTS.md`, README, release docs, workflow docs | instruction paths, conflicting rules, local gates | none |
| App shape | framework, package manager, routes, API handlers, jobs, workers, cron, server actions, middleware | route inventory, scripts, config files | `$feature-design-preflight` for nontrivial flows |
| Users and roles | public, authenticated user, admin, superadmin, tenant/organization boundaries | route guards, auth middleware, role tests | `$security-threat-model`, `$frontend-design-quality` |
| Critical paths | signup/login, purchase, upload, invite, mutation, dashboard, admin actions, background processing | flow map, tests, API contracts | `$feature-design-preflight`, `$test-readiness-preflight` |
| Frontend quality | existing patterns, click count, viewport fill, responsive behavior, portals, clutter, visual states, overflow | component paths, screenshots/tests, CSS/layout risks | `$frontend-design-quality` |
| Unit coverage | current thresholds, changed/high-risk files, helpers/hooks/services | coverage config, reports, test files | `$test-readiness-preflight` |
| Integration coverage | API routes, persistence, providers, permissions, workflow orchestration | integration test inventory, fixtures, DB setup | `$test-readiness-preflight` |
| Browser/E2E coverage | user actions, routes, roles, mutations, responsive and visual checks | `$user-action-coverage-review` action matrix, Playwright/Cypress specs, screenshots, traces | `$user-action-coverage-review`, `$frontend-design-quality`, `$test-readiness-preflight` |
| Test isolation | seeds, test doubles, local DBs, cleanup, deterministic provider behavior | setup files, compose files, fixtures | `$test-readiness-preflight` |
| Security | trust boundaries, auth/authz, secrets, uploads, parsers, webhooks, admin surfaces, deployment scripts | threat model notes, sensitive routes, secret scan posture | `$security-threat-model` |
| Observability | client/server/runtime errors, log hygiene, privacy, alerting, monitoring evidence, runbooks | error boundaries, logger, Sentry/OTel/Vercel config | `references/observability-checklist.md` |
| Analytics | pageviews, typed events, no-PII payload rules, frontend/backend event linkage | analytics modules, event schemas, tests | `$nextjs-vercel-analytics` when applicable |
| Dependencies | latest stable posture, lockfile health, audit scripts, risky package classes | manifests, lockfiles, audit command | none |
| Deployment | git-integration deploy policy (e.g. GitHub/Vercel), local-first gates, DB migration sequence, env boundaries, CI spend | workflows, platform config, scripts, migration tooling | `$test-readiness-preflight`, `$security-threat-model` |
| Code pruning | superseded providers, dead routes, old env vars, compatibility layers, stale scripts/tests/docs | references, imports, configs, runtime usage evidence | `$codebase-prune-review` |
| Local validation readiness | canonical local/container gate, cheap targeted checks, blockers before full gate | scripts, Docker files, browser setup, migration state | `$test-readiness-preflight` |

## Evidence Standard

- Prefer exact file paths and commands over broad claims.
- Distinguish `inspected`, `run`, and `not run`.
- Mark stale docs as weak evidence unless live code confirms them.
- Do not infer production readiness from local state when deployment, database, or provider-managed secrets are involved.
- For unknown legacy paths, classify them as `unknown` until references, tests, runtime config, logs, or user confirmation prove their status.

## Severity Hints

Examples only — the definitions and the overall-status derivation rule live in `SKILL.md`.

- `blocking`: missing migration before dependent code, auth bypass, secret exposure, no required local gate before push, critical user flow without E2E coverage, production-only runtime error with no safe release path.
- `high`: weak authz coverage, unsafe upload/parser handling, no server error capture on critical mutations, fragile deployment path, major provider migration leftovers.
- `medium`: missing visual state coverage, insufficient integration coverage, incomplete alerting, stale docs/scripts, dependency drift without immediate exploitability.
- `low`: naming, small cleanup, redundant docs, minor UI polish, optional observability enhancements.
