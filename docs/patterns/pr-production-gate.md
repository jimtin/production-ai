# Pattern: the PR production gate

A fully automatic review-and-deploy train where **your own machine is the reviewer, the CI runner, and the deploy authority** — and GitHub is just transport. The full skill contract lives at [skills/pr-production-gate/](../../skills/pr-production-gate/); this doc explains the architecture and the reasoning.

## The problem

Cloud CI gives you minutes-metered, hard-to-debug, sometimes-flaky proof — and an agent with push access will happily use it as a discovery mechanism, burning runs to find failures it could have found locally. Meanwhile "the PR is green" quietly becomes "deploy it," even when green means *some* checks passed on *some* commit that may no longer be the head.

## The shape

```
┌─────────────────────────── your machine ───────────────────────────┐
│  scheduler (cron/automation)                                        │
│      └─> controller container                                       │
│            1. discover open PRs (skip drafts, untrusted, stale)     │
│            2. LOCK the head SHA                                     │
│            3. isolated worktree checkout                            │
│            4. load repo truth (AGENTS.md, scripts, compose, mocks)  │
│            5. preflight skills (readiness, coverage, prune, threat) │
│            6. container gate: static ▸ unit ▸ integration ▸ E2E     │
│               ▸ audits ▸ image scan ▸ build ▸ smoke ▸ secret scan   │
│            7. decide                                                │
│               ├─ FAIL → REQUEST_CHANGES + redacted evidence         │
│               └─ PASS → promotion train                             │
│                    preview branch → observe deploy → preview smoke  │
│                    → main → observe deploy → production smoke       │
│            8. learn: update the repo's failure-pattern profile      │
└─────────────────────────────────────────────────────────────────────┘
```

## The rules that make it safe

**Fail closed.** The default outcome is *no deploy*. Missing proof, inconclusive proof, host-only proof, proof tied to a moving SHA — all of these are failures, not judgment calls.

**SHA lock.** The gate records the PR head SHA before checkout and re-checks it before deploy. If the head moved, the run is void. Deploys ship *the exact reviewed candidate*, never "the branch."

**The host only schedules.** Checkout, review, build, test, and deploy all run in containers. The host machine's job is to start them and read the reports.

**Review containers get no secrets.** External services — auth, payments, email, storage, analytics, LLMs, queues, webhooks — are mocked by default. Live-provider calls during review are detected and treated as failures. Production credentials exist only in post-validation promotion containers, and only after every gate passed for the locked SHA.

**The promotion train is observable.** For a Vercel-Git-style setup: promote to `preview` → wait for the matching deployment → smoke it → only then promote the same candidate to `main` → wait → smoke production. If preview observation fails, `main` never advances. Manual CLI deploys are break-glass, never part of the automatic path.

**Untrusted PRs are review-only.** Fork PRs and unknown authors can receive reviews but never trigger the deploy path unless a repo config explicitly accepts the risk.

**Comments are redacted.** Pass/fail reviews carry evidence summaries and artifact paths — never raw logs, secret-scan findings, or provider payloads.

## The learning profile

Every run ends by updating a per-repo learning profile: recurring failure signatures, missing mocks, setup requirements, coverage gaps, migration issues. The next run reads it first. This is what turns a dumb cron job into something that stops tripping over the same root cause twice.

## Build your own

1. Start from the [skill contract](../../skills/pr-production-gate/SKILL.md) — it is the full required-checks list.
2. Copy [templates/pr-gate.config.example.json](../../templates/pr-gate.config.example.json); keep the checked-in config inert (`repositories: []`) so the tool cannot run by accident.
3. Schedule it with your agent harness's automation (see [templates/automation.toml.example](../../templates/automation.toml.example)) or plain cron.
4. Wire results into chat if you want visibility (a channel-bound bot posting review id, PR number, status, blocker summary — and nothing else). Keep the bot away from the gate's lock and state files; it queues runs, it never bypasses them.
5. Write a threat model for the gate itself before trusting it: it holds a GitHub token and deploy credentials, so its config, state, and report paths are attack surface.
