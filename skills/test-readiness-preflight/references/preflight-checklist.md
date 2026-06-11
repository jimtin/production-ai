# Preflight Checklist

Use this checklist before starting the canonical full test gate. Mark an item clean only when it is confirmed from the current repo, not assumed from memory.

## 1. Scope and Repo Rules

- Read applicable parent and repo-local `AGENTS.md`.
- Inspect current branch, `git status --short`, staged changes, unstaged changes, and untracked files.
- Identify the canonical local gate and any faster iteration commands.
- Identify whether the repo requires containers for tests.
- Identify repo-owned cleanup, reset, seed, migration, browser install, and audit scripts.
- Resolve the exact git repo root with `git rev-parse --show-toplevel` before planning secret scans. Do not treat a workspace parent as the repo root.

## 2. Test Obligation Closure

- Tests are written or updated during implementation, not deferred until after the expensive full gate.
- Unit tests cover changed logic, hooks, helpers, services, validators, serializers, rendering utilities, and error handling.
- Integration tests cover changed API routes, database boundaries, provider adapters, workflow orchestration, queues/jobs, auth/authz, permissions, and cross-module contracts.
- Browser/E2E tests cover every changed user action, form, mutation, route transition, auth/role flow, and error state.
- The cheapest relevant targeted test or coverage command has been run against changed files, changed packages, or the changed subsystem before the canonical full gate.
- Any changed file that can reasonably be unit-tested has a focused test. Broad smoke tests do not count as coverage closure for new logic.
- UI changes include responsive and visual checks through `$frontend-design-quality`.
- Security-sensitive changes include `$security-threat-model` in the readiness plan.
- Coverage thresholds are enforced by the repo's normal coverage command and no changed code is hidden from coverage.
- If coverage has failed already, the failure has been classified and acted on per `coverage-failure-response.md` before stopping or reporting incomplete work.
- Container-gated repos have coverage buffer above the required threshold before the expensive container lane starts.

## 3. Data and Migration Readiness

- Migrations exist for schema changes and generated clients/types are updated.
- Schema-affecting changes are classified as expand, deploy, or contract. The release plan proves target databases get compatible schema before dependent code runs.
- New app code remains backward-compatible with the currently deployed production schema unless the migration is already applied and verified before code deployment.
- Destructive changes, new required fields, enum changes, unique constraints, RLS/policy changes, index-heavy migrations, and large backfills have an explicit rollout, rollback, and verification plan.
- Test DB reset and seed commands are known and safe for local test data.
- A clean test database can be created from committed migrations alone, with no manual local schema edits or stale DB state.
- Fixtures, factories, seed scripts, mock data, snapshots, and expected files match the current schema.
- Tests use run-scoped tenants/users/records where possible.
- Cleanup hooks remove records, files, queues, caches, and auth state created by tests.
- No normal test depends on production data, third-party mutable state, or old local database contents.

## 4. Container and Local Service Readiness

- Docker is running when the repo uses containers.
- Compose files and profiles needed for tests are identified.
- Images are rebuilt when dependencies, base images, Dockerfiles, package locks, or generated clients changed.
- Test volumes, networks, and local service data are reset only through repo-sanctioned commands or explicit user approval.
- Ports needed by dev servers, APIs, databases, queues, and browser tests are free or owned by the current test process.

## 5. Tooling and Dependency Readiness

- The package manager is identified from lockfiles and repo docs.
- Manifests and lockfiles are synchronized.
- Dependencies touched in the change are checked against the latest stable release from an authoritative source.
- Playwright package and browser binaries are aligned.
- TypeScript, ESLint parser/plugins, test runners, framework adapters, Docker base images, and GitHub Actions versions remain compatible.
- Local CLIs are selected through repo scripts or documented with `which` and `--version` when direct use is unavoidable.

## 6. Environment and Test Doubles

- Required local env vars are documented through `.env.example`, `.env.test`, repo docs, or setup scripts.
- Secrets are not committed, pasted into logs, or copied into fixtures.
- External providers use deterministic test doubles by default: auth, email, payment, LLM, storage, analytics, webhooks, and third-party APIs.
- Feature flags, tenant flags, roles, permissions, and auth state are seeded or mocked explicitly.
- Live-provider validation is separated into a manual/staging lane, not the normal local gate.

## 7. Stale State Cleanup

- Remove safe generated artifacts such as coverage directories, Playwright reports, stale screenshots, traces, temporary test output, and obsolete generated clients when the repo expects regeneration.
- Stop stale dev servers or workers that own required ports. Do not kill unrelated processes without checking ownership.
- Clear package/test caches only when they are implicated by the failure mode or when the repo wrapper does so.
- Reset test databases, queues, caches, buckets, and volumes only through known test reset commands or explicit approval.

## 8. Push and Release Readiness

- Schema/release ordering is confirmed when database changes are in scope. Do not merge, deploy, promote, or approve production release if app code requires a schema that is not already present in the target database or guaranteed by the repo's migration pipeline before app startup.
- Migration status for the target environment is verified through the repo's canonical DB tool, migration table, migration logs, provider dashboard, or controlled production migration job. Do not infer production readiness from local DB state.
- Rollback is compatible with the schema state. If rolling back code after migration would break old code, the migration must be redesigned or guarded by feature flags/compatibility code.
- Secret scanning is planned for the changed scope during iteration and full repo before push.
- Secret scanning uses the repo wrapper when present; otherwise it runs gitleaks in a container with only the git repo root mounted read-only, such as `docker run --rm -v "$repo_root:/repo:ro" -w /repo zricethezav/gitleaks:latest detect --source /repo --redact --no-banner`.
- Secret scanning must not run from `/`, `$HOME`, the OS user-folder root, your workspace root (e.g. `~/workspace`), or another workspace parent. Do not use host-level `gitleaks detect --source .` unless a repo wrapper has already scoped the working directory safely.
- Dependency audit is planned or complete.
- Image/container scan is planned when runtime containers changed.
- `$security-threat-model` is planned or complete before any push.
- Deployment-platform work (e.g. Vercel) uses local non-deploying validation and leaves production deployment to the git integration unless the user explicitly approves break-glass deployment.
- If production validation depends on platform-encrypted env values that cannot be pulled or decrypted locally (e.g. Vercel), record it as remote-only validation after all non-secret local gates pass. Do not repeatedly retry pulls, attempt to extract secrets, paste secrets into local env files, bypass env checks, or pursue local prebuilt production deployment as the workaround.

## 9. Ready-to-Test Output

Before starting full validation, report:

- Verdict: `READY`, `CONDITIONAL`, or `BLOCKED`.
- Blockers found and fixed.
- Blockers that remain and why.
- New or updated tests added for the changed code.
- Targeted test or focused coverage command already run before the full gate.
- Classification and next action for any coverage failure encountered.
- Any destructive action skipped pending approval.
- The canonical full-gate command to run next.
- Any required follow-up checks after the full gate.
