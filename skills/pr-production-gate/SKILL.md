---
name: pr-production-gate
description: Fully automatic GitHub PR review and production deployment gate for trusted repos. Use when configuring or operating a scheduled PR gate that checks open PRs, downloads them locally, runs complete containerized validation with mocked external services, comments or rejects failing PRs, promotes passing PRs through preview and production deployment branches, and updates repo-specific learning so repeated failures are handled before the next run. Every run ends in exactly one closed status (deployed, rejected, no_eligible_prs, already_running, waiting_on_author, blocked_infra), and idle runs must be cheap.
---

# PR Production Gate

## Purpose

Use this skill to operate or extend the fully automatic PR production gate. The gate reviews GitHub PRs for a configured repo, validates them locally in containers, rejects unsafe PRs with evidence, promotes passing PRs through the configured deployment train, verifies provider deployments, and updates repo-specific learning profiles.

The default outcome is fail closed. If any required proof is missing, inconclusive, host-only, dependent on live providers during review, or tied to a moving SHA, the PR must not deploy.

## Run Statuses

Every run ends in exactly one status from this closed set:

- `deployed`: a candidate passed every gate and the promotion train completed with smoke proof.
- `rejected`: a candidate failed; `REQUEST_CHANGES` posted with redacted evidence.
- `no_eligible_prs`: nothing to review — reached through the no-work fast path, cheaply.
- `already_running`: a healthy lock exists; this run exits without touching it.
- `waiting_on_author`: eligible PRs are all awaiting changes from a previous rejection.
- `blocked_infra`: the doctor preflight failed closed (disk, Docker, orphaned state) — no review work attempted.

A run that cannot name its status is a failed run.

## Run Economics

A gate that is expensive when idle will be turned off. Idle cost is a design requirement:

- Run a no-work fast path before any expensive setup: check the lock, query eligible PRs, and exit `no_eligible_prs` or `already_running` in seconds — never build the full controller to discover there is nothing to do.
- Bounded idle cost: the scheduled run's no-work path must stay cheap enough to run on every tick without anyone noticing.
- Lane proofs may be cached and reused only with integrity constraints: keyed by a content fingerprint of that lane's exact inputs, scoped to the lane, with a bounded TTL. A cached proof never substitutes for the SHA lock, and any doubt about cache validity invalidates it — fail closed, re-run the lane.
- Flaky tests are quarantined, never silently retried: a test that fails then passes without a code change gets a quarantine entry with an expiry date and a tracking issue. Quarantined tests cannot guard deploy lanes, and retry-until-green is forbidden.

## Infrastructure Health

The gate runs unattended on a real machine; the machine is part of the system. Before review work, a doctor preflight must verify and self-heal:

- Locks carry metadata (pid, started-at). A lock whose pid is dead is stale: recover it through the sanctioned doctor path and record the recovery — never by hand-deleting, and never treat a healthy lock as stale.
- Orphaned controller containers, worktrees, and processes from crashed runs are detected and cleaned.
- Disk and image hygiene is family-scoped: prune only this gate's per-run images past a retention window, cap build caches, and preserve stable base anchors. Indiscriminate prune-everything cleanup is forbidden — it destroys unrelated work and the gate's own warm caches.
- Insufficient disk, an unavailable Docker daemon, or unrecoverable orphaned state fails closed as `blocked_infra` before any PR is touched.

## Required Architecture

- The host may only schedule and launch containers.
- The controller, checkout, review, build, test, audit, browser/E2E, and deploy steps must run in containers.
- Review containers must not receive production secrets.
- External services must be mocked by default, including auth, payments, email, storage, analytics, LLMs, queues, webhooks, and third-party APIs.
- Live-provider calls during review must be blocked or detected and treated as failures.
- Production deploy credentials, when needed, are only available to post-validation promotion/deployment containers after every review gate passes for the exact PR head SHA.
- Example Vercel Git deployment train: `devBranchPattern: "dev/*"`, `previewBranch: "preview"`, and `productionBranch: "main"`. The platform builds all three branch classes, but only the gate may promote reviewed candidates to `preview` and then `main`.
- For private repos, the controller must require an authenticated GitHub token before cloning, fetching PR refs, promoting branches, or posting reviews. Runtime state, reports, cloned repos, Buildx state, and real env files stay local-only and must be ignored.
- For platform Git deployment trains, manual CLI deploy commands are fallback-only and must not be part of the automatic path. The automatic path is preview promotion, preview deployment observation, preview smoke, main promotion, production deployment observation, and production smoke for the same reviewed candidate.
- Fork PRs and untrusted authors are review-only unless a repo config explicitly accepts that risk.

## Core Workflow

1. **Doctor preflight.** Self-heal infrastructure per Infrastructure Health; exit `blocked_infra` on failure.
2. **No-work fast path.** Check the lock and query eligible PRs cheaply; exit `already_running`, `no_eligible_prs`, or `waiting_on_author` in seconds when there is nothing to do.
3. **Discover PRs.** Query configured repos for open PRs. Skip drafts, wrong base branches, already-processed SHAs, untrusted authors, missing ready labels, and changed heads.
4. **Lock the SHA.** Record repo, PR number, and head SHA before checkout. Re-check the SHA before deploy.
5. **Create an isolated worktree.** Download the PR into the configured worktree root inside the controller container.
6. **Load repo truth.** Read parent and repo-local `AGENTS.md`, repo scripts, Docker/Compose files, test configs, migrations, provider mocks, E2E inventories, and repo-specific learning profile.
7. **Run preflight.** Apply `$test-readiness-preflight`, `$feature-design-preflight` where nontrivial flows changed, `$user-action-coverage-review` for user-facing changes, `$codebase-prune-review` for removals, and `$security-threat-model` for changed scope. A `BLOCKED` verdict from any preflight is a `REQUEST_CHANGES`, mechanically — the gate never improvises readiness on the author's behalf.
8. **Run the container gate.** Execute static checks, unit coverage, integration tests, browser/E2E, dependency audits, image/filesystem scans, production build, runtime smoke, and repo-scoped containerized gitleaks — reusing lane proofs only within the cache-integrity constraints.
9. **Decide.**
   - Pass with a CLI deploy train: deploy the exact reviewed SHA, smoke-test production, comment with evidence, and mark the SHA deployed.
   - Pass with a platform Git train: promote the reviewed candidate to `preview`, wait for the matching preview deployment, run preview smoke, promote the same candidate to `main`, wait for the matching production deployment, run production smoke, comment with evidence, and mark the SHA deployed. If preview deployment observation or smoke fails, `main` must not advance.
   - Fail: post `REQUEST_CHANGES`, add failure status/labels when configured, include redacted logs and artifact paths, and do not deploy.
10. **Learn.** Update the repo profile with recurring failure signatures, missing mocks, setup requirements, coverage gaps, Playwright gaps, migration issues, flake quarantine entries, and accepted repo-specific fixes.

## Required Checks

Load `references/safety-checks.md` for the full check list when configuring or reviewing a repo gate.

At minimum every automatic deployment must prove:

- PR eligibility and SHA lock.
- Clean isolated worktree.
- Repo instructions loaded.
- Container-only validation.
- Mocked external services, with seeded mock users/sessions/roles/orgs when an auth provider is present.
- Unit coverage `>=90%` for statements, branches, functions, and lines.
- Critical integration paths covered.
- User actions covered by Playwright or equivalent browser/E2E tests.
- Dependency audit and container/file-system scans pass.
- Repo-scoped containerized gitleaks passes.
- Security threat model has no critical/high blockers.
- Schema and migration release sequencing is safe.
- Production deploy uses the exact reviewed candidate that contains the PR head SHA.
- Platform Git branch policy, when used, enables only the configured developer branch pattern, preview branch, and production branch.
- Platform Git branch names are unambiguous: developer branch pattern, preview branch, and production branch cannot collapse onto the same branch.
- Preview deployment and preview smoke pass before the production branch advances.
- Post-deploy smoke confirms the shipped SHA and critical runtime health.

## Automation Tool

Operate the gate through a dedicated controller script rather than ad hoc commands. A starting config shape lives in this repo at `templates/pr-gate.config.example.json`, and the full architecture is described in `docs/patterns/pr-production-gate.md`.

A typical controller supports a safe dry-run:

```bash
node pr-production-gate.mjs --config config.json --dry-run
```

Keep the checked-in sample config intentionally inert. A real repo must provide a config that passes schema validation before the tool will run.

## Completion Blockers

The gate must not deploy, and a run must not report success, while any of these are true:

- Any required check is missing, skipped, inconclusive, or proven only on the host.
- The PR head SHA changed at any point after the lock.
- Preview deployment or preview smoke has not proven out before the production branch advances.
- A review container received a production secret, or a live external provider was contacted during review.
- A preflight skill returned `BLOCKED` and the change was not rejected.
- The security threat model has unresolved critical or high findings, or the secret scan found a leak.
- Migration sequencing is unsafe for the target environment.
- A failing test was passed through silent retry instead of quarantine-with-expiry.
- A cached lane proof was used outside its content-fingerprint, lane scope, or TTL.
- A lock was bypassed or hand-deleted instead of recovered through the doctor path.
- The run cannot name exactly one closed run status.

## Output Expectations

Every run must produce:

- The run status from the closed set, plus JSON report with repo, PR, SHA, decision, checks, command summaries, artifact paths, and learning updates.
- Markdown report for the user.
- GitHub review body for pass/fail decisions.
- Updated repo learning profile.

Do not paste secret scan findings or raw provider logs into GitHub comments. All comments and reports must be redacted.

## Example Prompts

- "Use `$pr-production-gate` to set up an automatic review-and-deploy gate for this repo."
- "Why didn't the gate deploy PR 47?"
- "Add a new repo to the PR gate config — what has to be true first?"
- "The gate run is stuck on a lock — recover it safely."
- "Make idle gate runs cheaper without weakening the checks."

## References

- `references/safety-checks.md`: complete required check matrix, including run economics, infrastructure health, proof-cache integrity, and flake policy.
- `references/repo-config-schema.md`: repo config contract.
- `references/review-comment-template.md`: GitHub review body rules.
- `references/deployment-policy.md`: automatic production deployment policy.
