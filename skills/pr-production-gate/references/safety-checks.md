# PR Production Gate Safety Checks

## Eligibility

- PR is open, not draft, and targets the configured production branch.
- Head SHA is locked before checkout and rechecked before deploy.
- Source branch and author are trusted for auto-deploy.
- Fork PRs are rejected for auto-deploy unless explicitly allowed in repo config.
- Private repo clone/fetch/review/promotion operations have an authenticated GitHub token.
- Required ready label is present when configured.
- Previously processed passing/failing SHAs are skipped unless re-run is requested.

## Run Economics

- A no-work fast path runs before any expensive setup: lock check and eligibility query, exiting `no_eligible_prs`, `already_running`, or `waiting_on_author` in seconds.
- Idle runs never build the full controller.
- Every run ends in exactly one closed status: `deployed`, `rejected`, `no_eligible_prs`, `already_running`, `waiting_on_author`, or `blocked_infra`.

## Infrastructure Health

- A doctor preflight runs before review work and fails closed as `blocked_infra` when it cannot self-heal.
- Locks carry pid and started-at metadata; dead-pid locks are recovered through the doctor path and the recovery is recorded.
- Orphaned controller containers, worktrees, and processes from crashed runs are detected and cleaned.
- Disk thresholds are enforced before runs; image/cache pruning is family-scoped with retention windows and cache caps, preserving stable base anchors. Indiscriminate prune-everything cleanup is forbidden.

## Local Isolation

- Worktree path is inside the configured automation worktree root.
- Checkout happens in the controller container.
- Review containers mount only the target worktree and report directories.
- Generated artifacts do not dirty tracked files unless the repo explicitly permits them.

## Container-Only Validation

- Static checks run in containers.
- Unit tests and coverage run in containers.
- Integration tests run in containers against local services.
- Playwright or equivalent browser/E2E runs in containers.
- Dependency audits and filesystem/image scans run in containers.
- Production build and runtime smoke run in containers.
- Gitleaks runs in a container with the exact repo mounted read-only at `/repo`.

## External-Service Mocks

Substitute your stack's equivalents — these are examples:

- Auth provider (e.g. Clerk): seeded mock users, sessions, roles, organizations, auth states, and negative unauthorized states.
- Payments (e.g. Stripe): test double or local fake; no live charges.
- Email: local capture service such as MailHog.
- Storage: local fake such as MinIO or repo-native blob fake.
- Analytics and telemetry: no live provider calls.
- LLM and AI calls: deterministic local stubs.
- Queues, webhooks, and third-party APIs: local fakes with deterministic fixtures.
- Outbound calls to live providers during review are blocked or detected and fail the PR.

## Test Layers

- Unit coverage is `>=90%` for statements, branches, functions, and lines.
- Changed-scope coverage target is `>=95%` for new or materially changed logic.
- Integration tests cover API routes, persistence, auth/authz boundaries, provider adapters, jobs, queues, webhooks, uploads, and role transitions.
- Browser/E2E tests cover changed user actions, role flows, navigation, forms, mutations, saves, deletes, uploads, toggles, error states, empty states, loading states, and responsive paths.
- Tests use deterministic fixtures and local test data only.

## Proof Cache Integrity

- Lane proofs may be cached only when keyed by a content fingerprint of that lane's exact inputs.
- Cached proofs are lane-scoped with a bounded TTL, and never substitute for the SHA lock.
- Any doubt about cache validity invalidates the entry: fail closed and re-run the lane.

## Flake Policy

- A test that fails then passes without a code change is quarantined: entry with expiry date plus a tracking issue.
- Quarantined tests cannot guard deploy lanes.
- Silent retry-until-green is forbidden.

## Security

- `$security-threat-model` completes for changed scope.
- Critical/high findings block deployment.
- Secrets are never mounted into review containers.
- Logs and GitHub comments are redacted.
- Dependency audit, `osv-scanner`, `trivy fs`, and image scans run when applicable.
- CI/CD, deployment, auth, upload, parser, payment, and webhook changes receive extra scrutiny.

## Database And Migrations

- Migrations, generated clients, fixtures, and seeds are committed together.
- Fresh local container DB can be built from committed migrations.
- Expand -> deploy -> contract sequencing is enforced.
- Destructive or lock-prone migrations fail automatic deployment unless a repo policy explicitly authorizes the sequence.
- Production deploy is blocked when code depends on schema that is not guaranteed in the target environment.

## Deployment

- Deploy container receives production credentials only after all review gates pass.
- Deploy command uses the exact reviewed SHA.
- For platform Git trains (e.g. Vercel Git), the reviewed candidate promotes to preview first, the matching preview deployment is observed, and preview smoke passes before production advances.
- Production receives the same reviewed candidate that passed preview; direct CLI production deploy commands are fallback-only.
- Production smoke verifies the deployed SHA, health route, critical public routes, and safe authenticated flows where available.
- Runtime logs are checked when provider access exists.
- Smoke failure marks the run failed and triggers the configured rollback/failure path.

## Learning

- Record recurring failure signatures by hash.
- Record missing mocks, env gaps, coverage gaps, migration issues, Playwright failures, flake quarantine entries, and known setup fixes.
- Use the repo learning profile before the next run to prepare mocks, seeds, browser states, and targeted checks.
