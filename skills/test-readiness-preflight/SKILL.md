---
name: test-readiness-preflight
description: Pre-test readiness workflow that finds and fixes predictable validation blockers before running expensive local or container test gates. Use before full verification, before push readiness checks, after substantial implementation, or when work is likely to hit common failures such as missing unit/integration/E2E coverage, unseeded or stale test databases, unapplied migrations, production schema not ready for deployed code, missing fixtures, Playwright browser setup gaps, stale snapshots, container drift, env/test-double gaps, unsafe broad gitleaks scans, lockfile/package drift, or CI-only assumptions.
---

# Test Readiness Preflight

## Purpose

Use this skill to turn obvious future test failures into implementation tasks before starting the full test gate. The output should be either a repo-ready "safe to start validation" note or a short incomplete-work list with fixes applied or still needed. Do not claim the development task is done until code, schema, migrations, generated clients, fixtures, and release-order proof are all handled.

## Operating Rules

- Treat this as a mandatory gate before expensive full-suite, container, Playwright, release, or push-readiness validation.
- Start from repo truth: parent and repo-local `AGENTS.md`, package scripts, test configs, Docker files, seed/migration scripts, and workflow docs.
- Prefer repo-provided wrappers and container lanes. Do not invent a parallel validation path when the repo already defines one.
- Develop tests alongside code. Do not wait for the expensive full gate to discover missing unit coverage, missing integration coverage, or untested user actions.
- Fix missing tests, data setup, migrations, fixtures, browser setup, env gaps, and stale local state before running the full gate.
- For changed logic, services, hooks, helpers, API routes, components, or workflows, add focused tests in the same implementation pass and run the cheapest relevant targeted test or coverage command before the full gate.
- Treat schema-affecting changes as release-sequencing work, not just test setup. Code must not be pushed, merged, deployed, or promoted when it depends on a database schema that is not already present in the target environment or safely introduced through the repo's migration release process.
- Prefer expand -> deploy -> contract for production databases: add backward-compatible schema first, deploy compatible code second, and remove old schema only in a later release after compatibility is proven.
- Secret scans must be repo-scoped and containerized when no repo wrapper already provides that isolation. Resolve the git repo root first and mount only that repo read-only into the gitleaks container.
- Never run gitleaks against `/`, `$HOME`, the OS user-folder root, your workspace root (e.g. `~/workspace`), or any parent workspace. Never use an unqualified `--source .` unless the command is already running inside the repo-scoped container or a verified repo wrapper.
- Do not lower thresholds, skip required suites, delete failing assertions, or rely on remote CI/CD to find issues.
- A coverage failure is not a stop condition. Classify it, fix changed-scope gaps, correct proven coverage misconfiguration, or report the task explicitly incomplete.
- In container-gated repos, aim for coverage margin above the threshold before the expensive container gate. A host result of exactly `90.00%` is too fragile when Docker can account branches differently.
- Use cheap inspection and setup commands freely. Avoid launching the full expensive gate until the checklist is clean.
- Ask before destructive resets that could erase user data, local dev databases, non-test Docker volumes, or uncommitted work.

## Core Workflow

1. **Load repo requirements.** Read applicable instructions, package scripts, test configs, Docker Compose files, CI workflows, env examples, seed/migration tooling, and release docs. Use `references/repo-discovery.md` when the repo shape is unfamiliar.
2. **Inventory changed scope.** Use `git status` and diffs to classify changes as UI, API, data model, persistence, auth/authz, background jobs, deployment, dependency, security, or tests.
3. **Close test obligations while coding.** Map the changed scope to required unit, integration, browser/E2E, visual, and role/permission tests. Add or update those tests as part of the implementation, before starting the full gate. For UI work, use `$frontend-design-quality`.
4. **Prepare data and migrations.** Confirm test databases can reset and seed deterministically, migrations are generated/applied, fixtures match current schema, old test data is not required, and tests use run-scoped data plus cleanup where practical. For schema changes, also classify the release as expand, deploy, or contract, and prove the target database will have the required schema before dependent production code runs.
5. **Prepare tooling and environment.** Confirm package manager state, lockfiles, latest-stable dependency updates when dependencies were touched, Docker/container readiness, Playwright browsers, env vars, test doubles, ports, and local CLIs.
6. **Clean stale local state.** Remove safe generated test artifacts, stale reports, caches, old browser traces, dead ports, and repo-sanctioned test database/container state. Use repo cleanup scripts when present.
7. **Run only preflight-level checks.** Use cheap commands that validate setup, configuration, types, dependency install state, migration status, seed readiness, targeted tests, or focused coverage. Do not begin the canonical full gate until blockers are closed.
8. **Respond to coverage failures as work.** If a focused or full coverage check fails, use `references/coverage-failure-response.md` before stopping. Classify the failure, add targeted tests or fix proven scope/config issues, and rerun the cheapest relevant check before returning to the full gate.
9. **Prepare secret scanning safely.** Locate the repo's secret-scan wrapper first. If none exists, use a containerized gitleaks command with the repo root mounted read-only, for example: `repo_root="$(git rev-parse --show-toplevel)" && docker run --rm -v "$repo_root:/repo:ro" -w /repo zricethezav/gitleaks:latest detect --source /repo --redact --no-banner`. Do not run the fallback from a workspace parent.
10. **Escalate security-sensitive changes.** If auth, permissions, secrets, uploads, parsers, payments, webhooks, deployment, CI/CD, or data boundaries changed, include `$security-threat-model` in the readiness plan.
11. **Declare readiness.** Report the blockers found, fixes made, remaining risks, and the exact full-gate command that should run next.

## Mandatory Checks

Before full validation begins, confirm:

- Unit tests exist or are updated for changed pure logic, services, hooks, helpers, validation, and rendering utilities.
- Integration tests cover changed API routes, persistence boundaries, provider adapters, workflows, queues/jobs, permissions, and cross-module contracts.
- Browser/E2E tests cover changed user actions, route transitions, forms, mutations, auth/role paths, and responsive UI behavior.
- New or changed code has meaningful tests committed with it before the expensive full gate starts. The full gate should confirm coverage, not be the first place missing tests are discovered.
- The cheapest relevant targeted test command has run for the changed test files or changed subsystem, and any obvious coverage gap has been closed before full validation.
- Coverage thresholds will be enforced by the repo's normal coverage command and are not expected to miss changed code.
- If coverage has already failed, the failure has been classified and acted on instead of being treated as a stopping point.
- Container-gated repos have enough deterministic coverage margin to survive host/container accounting differences.
- Test databases, fixtures, storage buckets, queues, caches, auth state, and seeded users/roles can be recreated locally without production or shared third-party state.
- Migrations, generated clients, schemas, fixtures, factories, and snapshots are in sync.
- A clean local/container database can be built from the committed migration history alone, then run the changed app code and tests without manual schema edits.
- Schema changes have a safe release sequence: backward-compatible migration first, dependent code second, destructive cleanup later. Any code path that reads/writes new columns or tables is gated until the target environment migration is confirmed.
- Docker, local services, ports, Playwright browsers, package manager installs, and env/test doubles are ready for the repo's canonical gate.
- Secret scanning, dependency auditing, and `$security-threat-model` are planned or already complete when push/readiness is in scope.
- Secret scanning command is repo-scoped and containerized, or uses a repo wrapper that provides equivalent scoping. The command must not scan the parent workspace or host filesystem.

## Completion Blockers

Do not claim the task is done, start the full gate, or proceed to push/release readiness until these are fixed or explicitly documented as still incomplete:

- Required test layers are missing for the changed scope.
- New or changed logic, routes, components, or workflows were implemented without focused tests in the same change.
- Coverage is likely to fall below the required threshold and no targeted coverage check has been run yet.
- A coverage failure has been reported as a blocker without first classifying it and attempting the appropriate targeted fix.
- Test data depends on stale local database contents, production data, or undocumented manual setup.
- Migrations or generated artifacts are out of sync with code.
- Changed app code depends on a table, column, enum value, index, constraint, function, policy, or generated client that has not been committed, applied in local/container validation, and accounted for in the production release sequence.
- A migration is destructive, non-backward-compatible, or requires a backfill/lock-prone operation and there is no explicit expand -> deploy -> contract plan, rollback plan, and user-approved production run step.
- The deploy path would let Vercel, GitHub `main`, or any production runner ship dependent code before the target database migration is confirmed complete.
- A destructive reset is needed and the user has not approved it.
- The repo has no clear canonical gate and no defensible fallback set has been assembled.
- A security-sensitive change has not had the required threat-model and secret-scan plan.
- The only available gitleaks command would scan outside the target repo, run directly on a host parent directory, or mount more than the repo root into the scanner.
- Dependency or tooling versions are stale after being touched and the latest stable version has not been checked.

## References

- Read `references/preflight-checklist.md` for the full readiness checklist.
- Read `references/common-failure-patterns.md` when diagnosing predictable repeated failures.
- Read `references/coverage-failure-response.md` when a focused, full, host, or container coverage command fails.
- Read `references/repo-discovery.md` when locating the repo's test, seed, Docker, env, and CI conventions.
- Read `references/repo-quality-gate-adoption-template.md` when adopting or hardening a repo for containerized validation, local pre-commit/pre-push enforcement, tool matrices, stubs/fakes, bounded runners, and artifact reporting.
