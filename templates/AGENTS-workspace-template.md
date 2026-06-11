<!--
TEMPLATE: workspace-level AGENTS.md (the "constitution").
Place at your workspace root (e.g. ~/workspace/AGENTS.md). Repo-local
AGENTS.md files may only make these rules stricter. Before adopting:
delete every rule you will not actually enforce — see
docs/workspace-constitution.md for the guided tour and adoption steps.
Claude Code users: merge into CLAUDE.md.
-->

# AGENTS.md instructions for ~/workspace

These rules apply to all repos under `~/workspace` unless a repo-local `AGENTS.md` is stricter or more specific. Latest user instructions still win for the current task.

## Core Quality Bar

All code changes must meet these standards before being treated as complete:

1. Unit test coverage must be `>= 90%` for statements, branches, functions, and lines.
2. Critical paths must be covered by integration tests.
3. All user actions, routes, role flows, and mutations must be covered by Playwright or an equivalent browser/E2E test layer.
4. Frontend UI work must use `$frontend-design-quality` and must be visually verified across real viewport sizes.
5. Any GitHub push must be preceded by a secret scan with `gitleaks` or the repo's canonical secret-scan command.
6. Any GitHub push must be preceded by an explicit `$security-threat-model` review for the changed scope.
7. Substantial plans, roadmap work, architecture changes, migrations, and feature builds must use `$clarify-before-build` before implementation begins. If the current collaboration mode is Plan Mode, `$clarify-before-build` is mandatory for the turn, even if the user did not name the skill.
8. Nontrivial feature work must use `$feature-design-preflight` before implementation when requirements touch uploads, media/video, PDFs/documents, file parsing, third-party APIs, long-running work, background jobs, data migrations, auth/permissions, payments, AI calls, storage, admin/user portals, or any area where a naive implementation could pass a surface request but fail in real use.
9. Before starting expensive full-suite, container, Playwright, release, or push-readiness validation, use `$test-readiness-preflight` to clear predictable blockers such as missing tests, stale seeds, unapplied migrations, browser setup gaps, container drift, env/test-double gaps, and lockfile/package drift.
10. Database schema changes must have committed migrations, generated clients, clean local/container migration proof, and a safe production release sequence before dependent code can be pushed, merged, deployed, promoted, or reported as done.
11. Provider migrations, platform replacements, major refactors, legacy cleanup, redundant code removal, and attack-surface reduction must use `$codebase-prune-review` to map live behavior, classify obsolete paths, remove in tested layers, and prove no functionality was lost.
12. Requests to "fully review this app", "fully review this repo", run a full app review, perform a production readiness review, or perform a comprehensive app audit must use `$full-app-review` and produce an evidence-backed report plus prioritized remediation plan by default.
13. Substantial user-facing feature, frontend, workflow, route, mutation, auth/role, upload, save/delete, navigation, admin/user portal, or release-readiness work must use `$user-action-coverage-review` after plan acceptance and before implementation. Rerun it before final validation if implementation scope changes.
14. All validation lanes for code changes must run locally in containers. The host machine may orchestrate Docker, Docker Compose, package scripts, `make`, `just`, `uv`, or checked-in wrappers, but host-run lint/test/build commands are not canonical readiness evidence.
15. Every adopted repo must block `git commit` with a fast local containerized pre-commit gate, and must declare one of the two full-proof enforcement models (hook-owned or gate-owned — see Containerized Local Validation Default) in its tooling matrix. Hooks must be installed locally and verified active before work is reported push-ready.

Do not lower coverage thresholds, remove gates, or bypass hooks to land a change.

Tests must be developed alongside code. Do not implement a batch of code and then use the expensive full gate to discover that coverage is missing. For every changed logic path, route, component, service, hook, helper, workflow, or mutation, add or update the appropriate unit, integration, and browser/E2E tests in the same implementation pass.

## Execution Controls

For any implementation, remediation, release, or production-fix task with more than one user requirement, maintain an acceptance ledger before and during execution. The ledger must map each numbered or named user requirement to:

1. The intended code, configuration, or documentation change.
2. The focused unit, integration, and browser/E2E evidence that will prove it.
3. The current status: `pending`, `implemented`, `verified`, or `blocked`.
4. Any explicit non-goal or deferred follow-up accepted by the user.

Do not start the expensive full gate until each requirement in the ledger is either verified by a focused check or marked blocked with a concrete reason. Do not claim completion if any requirement was only addressed indirectly or inferred from a broader pass.

Maintain a test ledger alongside the acceptance ledger. Before or while changing each production file, identify the unit/integration/browser test that will cover the changed behavior. If no focused test exists, add the testable seam or extraction first, then implement against it. Do not batch implementation first and defer all test discovery to the final gate.

After each meaningful implementation slice, run the cheapest focused test or coverage command for that slice before moving to the next slice. Examples include a single hook test, one route-handler test, one shared-domain test, or one browser spec filtered to the changed journey. Treat a failed focused test as the next implementation task, not as a final-report blocker.

For changed or new user-facing behavior, maintain a user-action inventory before editing. List each action a user can perform, including button clicks, form submissions, route changes, keyboard-triggered actions, file uploads, deletes, saves, toggles, role-gated mutations, and empty/error/retry flows. Map every action to at least one browser/E2E or equivalent test, and update any repo flow inventory or critical-workflow manifest in the same change.

When a user action is removed or intentionally disabled, add or update negative browser coverage that proves the old action is absent or unavailable where relevant. Do not leave stale E2E steps or manifests describing removed actions.

When `$user-action-coverage-review` applies, use its matrix as the source of truth for the user-action inventory. Rows marked `missing`, `stale`, `partial`, or `negative assertion needed` are implementation tasks, not optional follow-up, unless the user explicitly defers them.

For removals, run a deleted-surface sweep before final validation. Search for old UI copy, test IDs, routes, API paths, feature flags, docs, tests, fixtures, telemetry names, and helper functions related to the removed surface. If any references remain, classify each as `expected negative assertion`, `active replacement`, `unrelated same wording`, or `must remove`. Removal work is incomplete until that sweep is clean or explicitly documented.

Parallel workers must share the same final behavior contract before any worker edits files. Each worker needs disjoint write ownership, the expected tests or evidence for its lane, and a reminder that it is not alone in the codebase. The main agent owns integration, stale-test updates, final acceptance-ledger reconciliation, and the canonical gate. If a worker adds tests for final behavior before production code is integrated, treat early failures as acceptance signals unless inspection proves the test is wrong.

When a Next.js, Vite, Playwright, or browser-visible app can reuse a stale compiled build, browser validation after source edits must force a fresh build or explicitly remove the stale build artifact before testing. Do not accept browser evidence from a cached build when the source changed in the same task.

Before the canonical full gate, run changed-scope focused coverage for new or extracted files, especially hooks, domain modules, route handlers, parser/validation logic, and shared helpers. If coverage later fails in the full gate, add targeted tests for the changed files first rather than rerunning the full gate blindly.

## Local-First Verification

Prefer the repo's canonical full local gate over ad-hoc commands. Common names include `npm run verify`, `npm run verify:local`, `npm run verify:full`, `npm run ci:local`, `docker compose --profile test up --build --abort-on-container-exit test`, and `./scripts/test-full.sh`.

Run `$test-readiness-preflight` after substantial implementation work and before the canonical full gate. Fix obvious readiness blockers first: missing test layers, targeted coverage gaps on changed code, outdated fixtures, unseeded or stale test databases, unapplied migrations, stale generated clients, Playwright browser installation, stale Docker images/volumes, occupied ports, env/test-double gaps, and lockfile drift.

Before starting the expensive full-suite/container gate, run the cheapest relevant targeted tests or focused coverage command for the changed files or subsystem. The full gate should confirm readiness, not be the first signal that new code lacks tests.

Before claiming substantial code work is done, run the canonical full gate locally. If a repo has both a quick gate and a full gate, use the quick gate for iteration only; the full gate is required for completion and before push.

All validation for code changes must run locally in containers. Prefer checked-in Docker Compose or wrapper scripts over host-machine test commands to avoid host-specific runtime, browser, database, and dependency anomalies. If a repo has no container lane yet, adding or documenting a repo-native container lane is part of adoption work before the repo can claim push-ready validation under this workspace default.

Do not push speculative commits just to discover failures in GitHub Actions, Vercel, or another remote runner. Remote CI/CD spend should be treated as scarce: reproduce and fix locally first, then use remote systems only for the narrow checks that cannot be proven on this machine.

If a required production validation step depends on provider-managed encrypted secrets that cannot be decrypted or pulled locally, do not loop on local secret retrieval, mutate env loading, or weaken validation. Run all secret-independent local gates, document the exact remote-only validation gap, and use the approved remote environment as the first place that can validate those production secrets.

If no canonical gate exists, create or identify the closest complete containerized local set before claiming readiness:

1. Typecheck
2. Lint/static checks
3. Unit tests with coverage
4. Critical-path integration tests
5. Browser/E2E tests for all changed user actions
6. Production build or build smoke
7. Dependency audit
8. Secret scan

## Containerized Local Validation Default

This workspace defaults to host-orchestrated, container-executed validation. Host commands may install hooks, invoke Docker/Docker Compose, pass environment variables, aggregate reports, and clean repo-approved generated artifacts, but they must not be treated as the canonical lint, test, build, audit, or browser proof.

Every adopted repo must expose repo-native equivalents for these three commands:

1. `verify:local` or equivalent: the authoritative full local containerized suite.
2. `precommit` or equivalent: a fast containerized gate for every `git commit`.
3. `hooks:install` or equivalent: installs repo hooks and verifies they are active.

Repo-native wrappers are preferred over forcing one hook framework. `.githooks`, `.git-hooks`, Husky, `pre-commit`, or another checked-in hook mechanism is acceptable only when it enforces the same behavior and has an install verification check that fails closed when hooks are absent or inactive.

Pre-commit must run a fast containerized gate before every commit. It must include static checks, fast cybersecurity checks, and a fast unit smoke lane only when that lane stays quick and deterministic.

For full proof, every repo declares exactly one of two enforcement models in its tooling matrix:

1. **Hook-owned proof** (no gate automation operates for the repo): pre-push runs the full local containerized verification program before every push — static validation, cybersecurity validation, unit coverage, critical-path integration coverage, and browser/E2E or equivalent service-journey coverage.
2. **Gate-owned proof** (a PR production gate operates for the repo): the gate runs the full program on the exact candidate SHA before any merge or deploy, and owns that proof exclusively. Push hooks stay slim — static checks, security checks, and the critical lanes — and developers must not run the full verify before push; that duplicates the gate's proof. Never bypass a failing hook or the gate itself.

The default toolset is required by validation layer unless a documented equivalent is already established or clearly better for the repo stack. Substitutions must be listed in the repo tooling matrix with the reason and equivalent coverage.

Static validation defaults:

1. Universal: `editorconfig-checker`, `shellcheck`, `actionlint`, `yamllint`, `markdownlint-cli2`, and `hadolint` when Dockerfiles exist.
2. Python: `ruff check`, `ruff format --check`, and one type checker, preferring `pyright` unless `mypy` is already established.
3. Node/TypeScript: `eslint` or `biome check`, `prettier --check` when Prettier is the formatter, and `tsc --noEmit` when TypeScript exists.
4. Terraform: `terraform fmt -check`, `terraform validate`, and `tflint`.
5. Kubernetes/Helm: `helm lint` and `kubeconform` or equivalent schema validation.

Cybersecurity validation defaults:

1. Universal: `gitleaks`, `osv-scanner`, and `trivy fs`.
2. Container/image repos: `trivy image`.
3. Python: `pip-audit`.
4. Node: the stack-native dependency audit command for the existing package manager, such as `npm audit --audit-level=high`, `pnpm audit`, or `yarn audit`.
5. Higher-noise SAST tools such as `semgrep` should be added only when the repo already uses them or the signal is clearly justified.

Testing defaults:

1. Unit tests run in containers with a minimum `90%` coverage gate for statements, branches, functions, and lines.
2. Integration tests run in containers against local databases, queues, caches, storage fakes, and service dependencies. Use Docker Compose and/or testcontainers where useful.
3. Web app E2E uses Playwright by default, runs in containers, and covers all user flows, roles, major mutations, and responsive/mobile paths where relevant.
4. API-only E2E means full service-journey coverage through containerized clients and seeded local dependencies.

Operational requirements for every long-running lane:

1. Hard timeout.
2. Stall detection.
3. Heartbeat output.
4. Readable logs.
5. Machine-readable reports where possible.
6. Failure artifacts where useful, including JUnit or JSON reports, coverage reports, Playwright traces/screenshots/videos, and container stdout/stderr.
7. Generated artifacts must not dirty tracked repo files.

Local stubs, fakes, and deterministic test doubles are the default for auth, email, payment, LLM, storage, analytics, webhooks, queues, and third-party APIs. Live-provider validation must be explicit, non-canonical for normal push readiness, and documented as a manual, staging, production-smoke, or remote-only lane.

Every repo adoption must add or update a checked-in tooling matrix that lists the tool name, purpose, validation layer, container or service used, and exact local command. It must also document the authoritative local verify command, exact pre-commit command, exact pre-push command, coverage thresholds, critical integration path list, E2E workflow inventory, stubbed vs live-provider policy, log/artifact locations, and local failure reproduction steps.

## Database Schema and Migration Releases

Treat database changes as deployment-sequencing work. It is not enough for code to compile or tests to pass against a stale local database.

For every schema-affecting change:

1. Commit the migration, schema definition, generated clients/types, fixtures, seeds, and tests together.
2. Prove a clean local/container database can be built from committed migrations alone. Do not rely on manually altered local database state.
3. Use expand -> deploy -> contract for production: add backward-compatible schema first, deploy compatible code second, and remove old schema only in a later release.
4. Complete both sides of the change before reporting completion: the app code and the schema/migration work it depends on. Do not push, merge, deploy, promote, approve a release, or call the task done when app code reads/writes a table, column, enum value, policy, function, index, or constraint that is not already present in the target database or guaranteed to be applied before the app starts.
5. Verify target-environment migration status through the repo's canonical DB tool, migration table, provider dashboard, migration logs, or controlled production migration job. Do not infer production schema readiness from local or test DB state.
6. Treat destructive or locking migrations as high-risk. Drops, renames, non-null constraints without safe defaults/backfills, enum narrowing, policy changes, and large backfills need an explicit rollout, rollback, and user-approved production run step.
7. Rollback must be compatible with the schema state. If old code cannot run after a migration, add compatibility code, feature flags, or split the release.
8. If the repo lacks a reliable migration-before-deploy mechanism, add or use a repo-appropriate mechanism as part of the work when feasible. If that cannot be completed in the current task, report the development task as incomplete rather than done.

## Test Strategy

Use focused unit tests for pure logic, hooks, helpers, rendering utilities, services, and validation rules. Use integration tests for API routes, persistence boundaries, provider adapters, workflow orchestration, permissions, and cross-module contracts. Use browser/E2E tests for user-visible workflows, auth/role behavior, forms, navigation, mutations, responsive UI, and visual layout.

When adding or changing code, add the test at the same time as the implementation. New logic without focused tests is incomplete work, even if the code compiles. If a file is hard to test, extract the testable behavior rather than waiting for the full coverage gate to fail.

Use `>=95%` changed-scope coverage as the default engineering target for new or materially changed hooks, services, route handlers, domain modules, parsers, validators, state machines, storage helpers, and shared utilities. The repo-wide hard gate remains `>=90%`, but agents should build enough changed-scope margin that the global gate is not fragile.

If focused changed-scope coverage or a recent full coverage result shows any global metric below `92%`, treat the repo as low-margin for coverage. Add targeted tests for changed or adjacent high-risk files before push, release prep, or deployment work continues.

Do not add shallow tests only to satisfy the `95%` target. Coverage-buffer tests must assert meaningful behavior: successful paths, failure paths, validation, permissions, edge cases, state transitions, and branch outcomes.

For large or low-coverage files, decompose first rather than adding broad brittle tests around a large module. Prefer extracting domain services, hooks, and pure helpers, then test those seams directly.

Do not add broad bulk-coverage harnesses as a substitute for meaningful unit and integration coverage. Existing bulk harnesses should shrink over time.

## Coverage Failure Response

A coverage failure is not a reason to stop progressing. Treat it as an implementation signal that must be triaged and acted on before claiming completion.

When coverage fails, classify the failure before deciding what to do:

1. Changed-code coverage gap: add targeted tests for the changed logic, route, component, workflow, or branch.
2. Existing repo-wide debt: separate changed-scope coverage from inherited debt; continue fixing any changed-scope gaps, and only report the task incomplete if unrelated debt cannot be safely resolved in scope.
3. Mis-scoped coverage denominator: fix the coverage config only when evidence shows integration-owned, generated, legacy, or non-runtime files are incorrectly counted by the unit lane.
4. Command misuse: do not treat a single-file focused test run as a valid global coverage signal when the runner enforces global thresholds.
5. Host/container variance: add enough deterministic targeted coverage buffer so the container gate clears reliably. For container-gated repos, aim for margin above `90%`, not a fragile `90.00%`.

Do not lower thresholds, delete meaningful assertions, exclude changed runtime code from coverage, or stop at "coverage is blocking" as a final answer. If the coverage gap genuinely cannot be fixed safely in the current task, say the work is incomplete and provide the exact remaining coverage work.

## Parallel Agent Use

For nontrivial implementation, review, migration, cleanup, frontend, testing, security, or release-readiness work, default to a parallel work plan when the Codex environment supports multiple agents or threads.

Every substantial plan must include a `Parallel Work` decision before implementation can be considered ready. The decision must either list the independent side threads/workers to use, with ownership boundaries and expected outputs, or state why parallel agents are not applicable for this task. Do not omit this section just because the user did not ask for parallelization.

The main agent owns the critical path: overall plan, immediate blocking work, file-integration decisions, final validation, `$security-threat-model`, gitleaks, and the completion report.

Use side threads for independent work that can run without blocking the main path, such as repo mapping, test-gap analysis, Playwright/browser verification, migration/schema review, dependency/audit investigation, security review, dead-code discovery, or bounded implementation with disjoint file ownership.

Each worker must be given clear ownership, told it is not alone in the codebase, told not to revert others' edits, and asked to report changed files plus validation evidence. Avoid parallel edits to the same files or tightly coupled modules.

During execution, actually use parallel agents for the side-thread work identified in the plan when the current Codex environment and tool policy permit it. If parallel agents are unavailable, blocked by current policy, or unsafe for the task, state that explicitly and continue with the same ownership boundaries locally.

Do not create extra threads for tiny single-file tasks, urgent blockers that the main path needs immediately, dirty/conflicted areas where ownership is unclear, tasks that require user approval before any exploration can continue, or work where coordinating agents would cost more than doing the task directly.

## Codebase Pruning and Legacy Removal

Use `$codebase-prune-review` before or during provider migrations, platform replacements, major refactors, dead-code cleanup, compatibility-layer retirement, old workflow removal, or attack-surface reduction work.

Do not remove old code just because it looks unused. First map live behavior, current entrypoints, provider integrations, env/config, scripts, jobs, tests, and deployment paths. Classify candidates as `active`, `compatibility`, `superseded`, `dead`, or `unknown`; keep `unknown` paths until repo evidence or user confirmation resolves them.

Do not call cleanup done until each removed layer has targeted tests, affected integration/E2E proof, `$security-threat-model` review when security-sensitive surfaces are touched, and the repo's final local/container gate.

## Full App Reviews

Use `$full-app-review` when the user asks to "fully review" an app/repo, run a full app review, perform a production readiness review, perform a comprehensive codebase audit, or identify what should be fixed before implementation, push, merge, or production.

Default output is a report plus prioritized fix plan. Do not mutate code, dependencies, branches, data, deployment state, or environment state during the review unless the user separately asks for remediation.

A complete full-app review must cover frontend/UI quality, testing and coverage, security, observability and error instrumentation, dependencies, deployment/release readiness, redundant or superseded code paths, and local/container validation readiness. It must include a skill coverage matrix, evidence, commands inspected or run, gaps, blocked checks, severity-ranked findings, required tests, and a prioritized remediation plan.

Do not claim an app was fully reviewed if any required dimension was skipped without being marked `not applicable` or `blocked` with a concrete reason.

## Planning Before Implementation

Use `$clarify-before-build` before implementation begins for substantial project plans, product workflows, technical designs, migrations, architecture changes, new features, or ambiguous work requests.

If the current collaboration mode is Plan Mode, start by using `$clarify-before-build` as the governing workflow. Do not produce a final plan from ordinary reasoning alone. In Plan Mode, maintain the planning ledger required by the skill, resolve discoverable facts through non-mutating inspection before asking questions, and produce the final `<proposed_plan>` only after the plan is decision-complete.

Use `$feature-design-preflight` during planning and before coding nontrivial features. Trace the requirement through current repo patterns, provider or library limits, data and control flow, UX states, security/privacy, failure modes, operational concerns, and verification. If the requirement cannot be safely inferred, stop and ask targeted questions before implementing.

Use `$user-action-coverage-review` after plan acceptance for substantial user-facing work, before files are edited. Do not treat a plan as implementation-ready until changed user actions, critical paths, roles, states, and removed actions are mapped to browser/E2E, integration, and unit evidence or explicitly blocked/deferred.

Do not treat a plan as complete until:

1. The goal, non-goals, users, constraints, data, flows, risks, tests, rollout, rollback, and definition of done are clear.
2. Material assumptions are stated and accepted.
3. Open questions are answered or explicitly deferred by the user.
4. Acceptance criteria are observable and testable.
5. The plan includes a `Parallel Work` decision with explicit side-thread ownership or a concrete reason parallel agents are not applicable.
6. The user confirms the Shared Understanding Contract.

If the user asks to skip planning, state the unresolved ambiguity and get explicit approval before implementing with those risks.

## Browser and Frontend Coverage

Every changed user-facing route and mutation needs browser coverage. Cover public, authenticated user, admin, and superadmin roles when the surface supports them.

For frontend changes:

1. Use `$frontend-design-quality`.
2. Verify desktop, mobile, tablet, and at least one short-height viewport.
3. Assert no unintended horizontal overflow.
4. Stress long labels, names, emails, URLs, headings, and translated-length copy.
5. Capture screenshots or visual snapshots where layout quality is part of the work.
6. Cover loading, empty, error, validation, disabled, success, and permission states when they can occur.

When a repo maintains a flow inventory or critical workflow manifest, update it in the same change as the implementation and tests.

## Determinism and Test Isolation

Local and CI validation should use deterministic test doubles by default for external providers such as auth, email, payment, LLM, storage, analytics, and third-party APIs. Live-provider validation is opt-in and belongs in explicit manual, staging, or production smoke lanes.

Tests must control their data. Use seeded fixtures, run-scoped namespaces, isolated tenants/users, cleanup hooks, and local databases where practical. Do not rely on shared mutable production or third-party state for normal validation.

Use bounded runners, timeouts, heartbeat logging, or repo-provided cleanup wrappers for long-running typecheck, unit, integration, and Playwright commands. Do not let `tsc`, Jest, Vitest, Playwright, mypy, audit tools, or background jobs run indefinitely.

Retry-only pass is still a signal of instability. Fix flakes rather than accepting repeated retries as proof.

## Security and Dependency Gates

Before any push:

1. Run `$security-threat-model` against the repo or changed scope and address any critical/high findings before push.
2. Run the repo's secret scan. If no wrapper exists, resolve the git repo root and run gitleaks containerized with only that repo mounted read-only, for example: `repo_root="$(git rev-parse --show-toplevel)" && docker run --rm -v "$repo_root:/repo:ro" -w /repo zricethezav/gitleaks:latest detect --source /repo --redact --no-banner`.
3. Run the repo's dependency audit.
4. Run image/container scanning when deployment image or runtime container changes are in scope.

Do not commit `.env` files, local tokens, generated secrets, credential receipts, Vercel state, Clerk/Stripe/Resend keys, or other machine-local secret material.

Dependency audit allowlists must be minimal, dated, and explicit.

## Version Currency

Keep software, packages, CLIs, runtimes, base images, browser test tooling, GitHub Actions, and generated lockfiles on the latest stable versions by default.

Disk cleanup is not package currency proof. Use `$laptop-currency-maintenance` for host tooling and local repo dependency currency reviews. The laptop maintenance automation may update unpinned Homebrew formulae, but repo package manifests and lockfiles remain report-only until a separate repo-specific upgrade task is approved and validated through that repo's local/container gates.

When adding or touching dependencies:

1. Check the current latest stable version from an authoritative source at the time of work, such as the package registry, official docs, release feed, Homebrew, Docker registry, or GitHub releases. Do not rely on model memory for version freshness.
2. Prefer stable releases. Do not use alpha, beta, canary, nightly, experimental, or release-candidate versions unless the user explicitly approves or the repo already requires them.
3. Update package manifests and lockfiles together.
4. Update related tool versions together when they must stay aligned, such as Playwright package and browser binaries, TypeScript/ESLint parser packages, framework adapters, Docker base images, or GitHub Actions versions.
5. Run the repo's full local verification gate after upgrades, not just install/build checks.
6. Treat security, auth, payment, deployment, database, serialization, parsing, and file-upload dependency updates as high-risk changes that require targeted regression tests and `$security-threat-model` review.
7. If a repo deliberately pins an older version, preserve the pin only when there is a documented compatibility reason; otherwise upgrade to latest stable and document the change.
8. If latest stable introduces breaking changes, perform the migration in the same change or stop and report the blocker with the safest upgrade path.

Use gitleaks extensively:

1. Run staged/diff scans during iteration when touching secrets, auth, env handling, deployment scripts, CI files, fixtures, generated artifacts, or docs that may contain copied logs.
2. Run a full repo scan before any push, release prep, deployment, or PR handoff.
3. Prefer the repo's wrapper when present because it may pin config, Docker image, report path, and redaction behavior.
4. When no wrapper exists, use a containerized gitleaks invocation with a read-only mount of the exact git repo root and `--source /repo`.
5. Never run gitleaks from `/`, `$HOME`, the OS user-folder root, your workspace root (e.g. `~/workspace`), or another workspace parent. Never mount the whole home directory or filesystem into the gitleaks container.
6. Treat any gitleaks finding as blocking until it is removed or documented as a deliberate, non-secret test fixture in the repo's allowlist.
7. Do not paste secret scan findings into chat unless they are already redacted.

Use `$security-threat-model` before every GitHub push:

1. Scope the review to the whole repo for broad changes, and to the changed subsystem for narrow changes.
2. Include runtime entry points, trust boundaries, auth/authz, data stores, external integrations, background jobs, file upload/parsing surfaces, admin tooling, deployment scripts, and CI/CD changes that are in scope.
3. Treat critical/high findings as blocking until fixed, mitigated, or explicitly accepted by the user.
4. For medium findings, either fix them or document the risk and follow-up owner before push.
5. Do not let the time cost of the review justify skipping it; account for it in the delivery timeline.

## Git and Push Discipline

Do not push to GitHub until the repo's required local gates pass. There are no exceptions for normal feature/fix work.

Use `codex/<description>` branches for standard delivery unless the repo specifies a stricter workflow. Do not work directly on `main` for feature or fix work unless a repo explicitly uses a different controlled process or the user gives break-glass authorization.

Keep the working tree clean before switching unrelated tasks, asking for review, or pushing. Commit only files in the intended scope. Never stage unrelated user or agent changes silently.

Do not use `git push --no-verify` or bypass pre-push hooks except for a documented break-glass incident explicitly approved by the user.

## CI and Deployment

GitHub Actions is not a substitute for local validation. "CI will catch it" is not acceptable proof of completion.

Minimize GitHub CI/CD spend aggressively:

1. Prove static checks, unit coverage, integration coverage, browser/E2E, build, audit, and secret scanning locally before pushing.
2. Keep PR workflows short, high-signal, path-filtered where practical, and free of duplicate validation already proven locally.
3. Prefer one consolidated workflow over chained or overlapping workflows.
4. Use concurrency cancellation for remote workflows so superseded commits do not keep running.
5. Reserve expensive cross-browser, live-provider, staging, production, soak, and scheduled validation for main/manual lanes unless a repo explicitly requires more.
6. Do not re-run GitHub jobs repeatedly as a debugging loop; reproduce the failure locally, fix the root cause, then push once.
7. If CI fails with something that should have been caught locally, treat that as a local gate/process gap and update the local gate or documentation.

For deployment-sensitive repos, respect repo-local release rules. Do not deploy, promote, or merge to `main` unless the repo's local readiness gate, branch requirements, worktree requirements, and user approval requirements are satisfied.

If database schema changes are in scope, do not merge to `main`, approve Vercel production deployment, or otherwise trigger production app deployment until the migration release sequence above is satisfied and target schema readiness is explicitly reported.

## Vercel and CLI Discipline

Several repos in this workspace are linked to Vercel projects, and this machine may have multiple CLI entrypoints or versions available. Do not assume the global CLI is the intended one.

Before using Vercel or other deployment CLIs directly:

1. Check the repo's `package.json`, release scripts, `vercel.json`, `.vercelignore`, repo-local `AGENTS.md`, and `.vercel/project.json` expectations.
2. Prefer repo-provided scripts over direct CLI commands.
3. If a repo pins a Vercel CLI version through `npx vercel@...`, use that pinned version for that repo.
4. If no repo wrapper exists, record `which -a vercel vc` and `vercel --version` before deployment-affecting work.
5. Use explicit, non-interactive project linking when linking is required: `vercel link --yes --project <name-or-id> --scope <team>`.
6. Never expose or paste `.vercel/project.json` org/project IDs, Vercel tokens, pulled env files, or deployment secrets into chat or commits.

Vercel deployment policy:

1. Vercel production deployments must be triggered from GitHub `main`. Do not run local CLI production deploys such as `vercel --prod`, `vercel deploy --prod`, or repo scripts that directly deploy production from the laptop unless the user gives explicit break-glass approval for that incident.
2. Feature branches must not create Vercel deployments unless the repo explicitly uses sandbox preview deployments and the user asks for one.
3. Use local Vercel commands only for non-deploying validation and inspection unless explicitly approved: `vercel pull`, `vercel build`, `vercel inspect`, `vercel logs`, and project/env checks.
4. Local `vercel build` is encouraged before merging to `main` when Vercel build behavior is in scope, but the final deploy should come from the GitHub `main` integration.
5. `vercel pull` and local Vercel env files may not provide usable values for provider-managed encrypted production secrets. If pulled values are empty placeholders or otherwise unavailable, treat that as a known remote-only secret boundary, not a local bug to solve. Do not repeatedly retry pulls, attempt to decrypt/extract secrets, paste secrets into local files, change code to bypass env checks, or pursue the local prebuilt production deploy path as a workaround.
6. When a production build or runtime check genuinely requires those encrypted Vercel secrets, run all non-secret local validation first, record that production-secret validation is remote-only, and let the GitHub `main` Vercel deployment validate the encrypted production environment after release approval.
7. Repos should restrict Vercel Git deployments to `main` via `vercel.json` when the project is production-bound. Disable Vercel Git deployments only for repos that intentionally use a separate guarded deployment mechanism.
8. Do not use Vercel preview deployments as a substitute for local Playwright, integration, coverage, audit, or secret-scan gates.
9. If a repo has a main-only production project and an active preview target appears, stop and report it; do not continue deploying until the repo's cleanup rule is followed.

## Completion Reports

Completion claims must include:

1. Exact commands run
2. Pass/fail status for each command
3. Coverage result or where coverage was enforced, including changed-scope `95%` target status when code changed
4. New or updated tests added for changed code
5. Targeted test or focused coverage command run before the expensive full gate
6. Integration and E2E/browser coverage run
7. `$feature-design-preflight` status when nontrivial feature design was in scope
8. `$codebase-prune-review` status when legacy cleanup, provider migration cleanup, or redundant path removal was in scope
9. `$full-app-review` status, skill coverage matrix, and blocked dimensions when a full app/repo review was in scope
10. `$test-readiness-preflight` status before full validation when substantial testing was in scope
11. Container/local environment used
12. `$security-threat-model` review status and unresolved findings when push/readiness is in scope
13. Secret scan and dependency audit status when push/readiness is in scope
14. Any suites intentionally not run and why
15. Migration status and target-environment schema readiness when database changes are in scope
16. Known residual risk or follow-up work
17. Acceptance-ledger status for each numbered or named user requirement when the task had multiple requirements.
18. Clear release stage labels when applicable: local-only, committed, pushed, deployed, and production-smoke-tested are separate states.
19. `$user-action-coverage-review` status when substantial user-facing work, workflow changes, or release-readiness work was in scope, including any missing/stale/blocked rows.

If work is docs-only, analysis-only, or otherwise exempt from the full gate, say that explicitly.
