# Pattern: the PR production gate

A fully automatic review-and-deploy train where **your own machine is the reviewer, the CI runner, and the deploy authority** — and GitHub is just transport. The full skill contract lives at [skills/pr-production-gate/](../../skills/pr-production-gate/); this doc explains the architecture and the reasoning.

## The problem

Cloud CI gives you minutes-metered, hard-to-debug, sometimes-flaky proof — and an agent with push access will happily use it as a discovery mechanism, burning runs to find failures it could have found locally. Meanwhile "the PR is green" quietly becomes "deploy it," even when green means *some* checks passed on *some* commit that may no longer be the head.

## The shape

```
┌─────────────────────────── your machine ───────────────────────────┐
│  scheduler (cron/automation)                                        │
│      └─> controller container                                       │
│            0. doctor preflight (self-heal or exit blocked_infra)    │
│            1. no-work fast path (idle exit in seconds)              │
│            2. discover open PRs, LOCK the head SHA                  │
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

## The rules that make it survivable

The first version of this gate nearly got turned off — not for being unsafe, but for being expensive. The fixes are part of the pattern now:

- **Closed run statuses.** Every run ends in exactly one of `deployed / rejected / no_eligible_prs / already_running / waiting_on_author / blocked_infra` — a run that can't name its status is a failed run, and idle statuses must be reached cheaply.
- **The no-work fast path.** Lock check + eligibility query before any expensive setup. An idle tick costs seconds, not a controller build.
- **The doctor.** Locks carry pid metadata, so dead-pid locks are recovered through a sanctioned path instead of haunting the gate forever; orphaned containers and worktrees get cleaned; low disk fails closed before any PR is touched.
- **Family-scoped pruning.** The gate prunes its own per-run images past a retention window and caps caches — never `prune -a`, which destroys unrelated work and its own warm layers.
- **The proof ledger.** Per-lane proofs cached by content fingerprint with a bounded TTL, so an unchanged lane doesn't re-run — with hard integrity rules: lane-scoped, never a substitute for the SHA lock, any doubt invalidates.
- **Flake quarantine.** A test that fails then passes without a code change gets quarantined with an expiry and an issue. Quarantined tests can't guard deploy lanes; retry-until-green is forbidden.

## The learning profile

Every run ends by updating a per-repo learning profile: recurring failure signatures, missing mocks, setup requirements, coverage gaps, migration issues. The next run reads it first. This is what turns a dumb cron job into something that stops tripping over the same root cause twice.

## Build your own

1. Start from the [skill contract](../../skills/pr-production-gate/SKILL.md) — it is the full required-checks list.
2. Copy [templates/pr-gate.config.example.json](../../templates/pr-gate.config.example.json); keep the checked-in config inert (`repositories: []`) so the tool cannot run by accident.
3. Schedule it with your agent harness's automation (see [templates/automation.toml.example](../../templates/automation.toml.example)) or plain cron.
4. Give it a doctor and a no-work fast path on day one — idle cost decides whether the gate survives its first month.
5. Wire results into chat if you want visibility (a channel-bound bot posting review id, PR number, status, blocker summary — and nothing else). Keep the bot away from the gate's lock and state files; it queues runs, it never bypasses them.
6. Write a threat model for the gate itself before trusting it: it holds a GitHub token and deploy credentials, so its config, state, and report paths are attack surface.
