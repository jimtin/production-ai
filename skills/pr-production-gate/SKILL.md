---
name: pr-production-gate
description: Fully automatic GitHub PR review and production deployment gate for trusted repos. Use when configuring or operating a scheduled PR gate that checks open PRs, downloads them locally, runs complete containerized validation with mocked external services, comments or rejects failing PRs, promotes passing PRs through preview and production deployment branches, and updates repo-specific learning so repeated failures are handled before the next run.
---

# PR Production Gate

## Purpose

Use this skill to operate or extend the fully automatic PR production gate. The gate reviews GitHub PRs for a configured repo, validates them locally in containers, rejects unsafe PRs with evidence, promotes passing PRs through the configured deployment train, verifies provider deployments, and updates repo-specific learning profiles.

The default outcome is fail closed. If any required proof is missing, inconclusive, host-only, dependent on live providers during review, or tied to a moving SHA, the PR must not deploy.

## Required Architecture

- The host may only schedule and launch containers.
- The controller, checkout, review, build, test, audit, browser/E2E, and deploy steps must run in containers.
- Review containers must not receive production secrets.
- External services must be mocked by default, including Clerk, Stripe, email, storage, analytics, LLMs, queues, webhooks, and third-party APIs.
- Live-provider calls during review must be blocked or detected and treated as failures.
- Production deploy credentials, when needed, are only available to post-validation promotion/deployment containers after every review gate passes for the exact PR head SHA.
- Example Vercel Git deployment train: `devBranchPattern: "dev/*"`, `previewBranch: "preview"`, and `productionBranch: "main"`. Vercel builds all three branch classes, but only the gate may promote reviewed candidates to `preview` and then `main`.
- For private repos, the controller must require an authenticated GitHub token before cloning, fetching PR refs, promoting branches, or posting reviews. Runtime state, reports, cloned repos, Buildx state, and real env files stay local-only and must be ignored.
- For Vercel Git deployment trains, `deployProduction`/manual CLI deploy commands are fallback-only and must not be part of the automatic path. The automatic path is preview promotion, preview deployment observation, preview smoke, main promotion, production deployment observation, and production smoke for the same reviewed candidate.
- Fork PRs and untrusted authors are review-only unless a repo config explicitly accepts that risk.

## Core Workflow

1. **Discover PRs.** Query configured repos for open PRs. Skip drafts, wrong base branches, already-processed SHAs, untrusted authors, missing ready labels, and changed heads.
2. **Lock the SHA.** Record repo, PR number, and head SHA before checkout. Re-check the SHA before deploy.
3. **Create an isolated worktree.** Download the PR into the configured worktree root inside the controller container.
4. **Load repo truth.** Read parent and repo-local `AGENTS.md`, repo scripts, Docker/Compose files, test configs, migrations, provider mocks, E2E inventories, and repo-specific learning profile.
5. **Run preflight.** Apply `$test-readiness-preflight`, `$feature-design-preflight` where nontrivial flows changed, `$user-action-coverage-review` for user-facing changes, `$codebase-prune-review` for removals, and `$security-threat-model` for changed scope.
6. **Run the container gate.** Execute static checks, unit coverage, integration tests, browser/E2E, dependency audits, image/filesystem scans, production build, runtime smoke, and repo-scoped containerized gitleaks.
7. **Decide.**
   - Pass with `laptop_cli_deploy`: deploy the exact reviewed SHA, smoke-test production, comment with evidence, and mark the SHA deployed.
   - Pass with `vercel_git`: promote the reviewed candidate to `preview`, wait for the matching Vercel preview deployment, run preview smoke, promote the same candidate to `main`, wait for the matching production deployment, run production smoke, comment with evidence, and mark the SHA deployed. If preview deployment observation or smoke fails, `main` must not advance.
   - Fail: post `REQUEST_CHANGES`, add failure status/labels when configured, include redacted logs and artifact paths, and do not deploy.
8. **Learn.** Update the repo profile with recurring failure signatures, missing mocks, setup requirements, coverage gaps, Playwright gaps, migration issues, and accepted repo-specific fixes.

## Required Checks

Load `references/safety-checks.md` for the full check list when configuring or reviewing a repo gate.

At minimum every automatic deployment must prove:

- PR eligibility and SHA lock.
- Clean isolated worktree.
- Repo instructions loaded.
- Container-only validation.
- Mocked external services, with Clerk mock users/sessions/roles/orgs when Clerk is present.
- Unit coverage `>=90%` for statements, branches, functions, and lines.
- Critical integration paths covered.
- User actions covered by Playwright or equivalent browser/E2E tests.
- Dependency audit and container/file-system scans pass.
- Repo-scoped containerized gitleaks passes.
- Security threat model has no critical/high blockers.
- Schema and migration release sequencing is safe.
- Production deploy uses the exact reviewed candidate that contains the PR head SHA.
- Vercel Git branch policy, when used, enables only the configured developer branch pattern, preview branch, and production branch.
- Vercel Git branch names are unambiguous: developer branch pattern, preview branch, and production branch cannot collapse onto the same branch.
- Preview deployment and preview smoke pass before the production branch advances.
- Post-deploy smoke confirms the shipped SHA and critical runtime health.

## Automation Tool

Operate the gate through a dedicated controller script rather than ad hoc commands. A starting config shape lives in this repo at `templates/pr-gate.config.example.json`, and the full architecture is described in `docs/patterns/pr-production-gate.md`.

A typical controller supports a safe dry-run:

```bash
node pr-production-gate.mjs --config config.json --dry-run
```

Keep the checked-in sample config intentionally inert. A real repo must provide a config that passes schema validation before the tool will run.

## Output Expectations

Every run must produce:

- JSON report with repo, PR, SHA, decision, checks, command summaries, artifact paths, and learning updates.
- Markdown report for the user.
- GitHub review body for pass/fail decisions.
- Updated repo learning profile.

Do not paste secret scan findings or raw provider logs into GitHub comments. All comments and reports must be redacted.

## References

- `references/safety-checks.md`: complete required check matrix.
- `references/repo-config-schema.md`: repo config contract.
- `references/review-comment-template.md`: GitHub review body rules.
- `references/deployment-policy.md`: automatic production deployment policy.
