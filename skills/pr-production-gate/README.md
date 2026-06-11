# pr-production-gate

**The failure this prevents:** "CI is green" quietly becoming "deploy it" — when green meant *some* checks passed, on a commit that may no longer be the head, with external services live instead of mocked, and nobody re-verifying what actually shipped. Add an autonomous agent to that pipeline and the gap between "approved" and "proven" becomes the whole risk.

This skill is the contract for a fully automatic, fail-closed PR review and production deployment gate that runs on your own machine — and, just as importantly, the contract for a gate that's *cheap enough to leave on*. The architecture write-up lives at [docs/patterns/pr-production-gate.md](../../docs/patterns/pr-production-gate.md).

## What it does

Defines the required behavior for a scheduled gate that:

1. **Heals itself first.** A doctor preflight recovers dead-PID locks, cleans orphaned containers and worktrees, enforces disk thresholds — or exits `blocked_infra` before touching any PR.
2. **Costs nothing when idle.** A no-work fast path checks the lock and eligibility in seconds; idle ticks never build the controller.
3. **Locks the head SHA** before checkout and re-checks it before deploy — reviews approve commits, not branches.
4. **Validates entirely in containers**: static checks, ≥90% unit coverage, critical-path integration, browser/E2E, dependency audit, image scan, production build, runtime smoke, repo-scoped secret scan — with per-lane proof caching under strict integrity rules.
5. **Mocks every external service** during review; live-provider calls are failures; review containers hold zero production secrets.
6. **Decides mechanically**: failures (including any `BLOCKED` preflight verdict) get `REQUEST_CHANGES` with redacted evidence; passes ride the promotion train — preview → observed deployment → smoke → main → observed → production smoke — same candidate at every stage.
7. **Ends in exactly one closed status**: `deployed / rejected / no_eligible_prs / already_running / waiting_on_author / blocked_infra`.
8. **Learns per repo**: failure signatures, missing mocks, flake quarantine entries — read by the next run.

## The war story (why the economics section exists)

The first production version of this gate was *safe* and nearly got turned off anyway: **211 scheduled runs with under 1% doing useful work**, each idle tick paying full controller-build cost — and **one PR that took 3h18m, executing the full validation suite roughly seven times** across hook, gate, and deploy layers. Fail-closed discipline without run economics is a gate that eats the machine it lives on.

The fixes became contract requirements: the no-work fast path (idle runs in seconds), the doctor (self-healing instead of haunted locks), family-scoped image pruning (never `prune -a` — it destroys your own warm caches along with everything else), and the proof ledger (per-lane, content-fingerprinted, TTL'd reuse, so unchanged lanes don't re-run).

## The design choices worth stealing

- **Fail closed as the default outcome.** Missing, inconclusive, host-only, or moving-SHA proof = no deploy. The gate never extends benefit of the doubt.
- **A run that can't name its status is a failed run.** The closed status set makes "what happened?" a one-word answer — and makes silent half-runs structurally impossible.
- **Review containers get no production secrets.** Credentials exist only in post-validation promotion containers. A malicious PR that compromises the review environment finds nothing worth stealing.
- **Preview must prove out before main advances.** Deployment *observation* — waiting for the platform to confirm the matching deployment, then smoking it — is a required stage, not a courtesy.
- **Cached proof has integrity rules.** Content-fingerprinted, lane-scoped, TTL'd, never a substitute for the SHA lock — and any doubt invalidates. Speed never outranks proof.
- **Flakes are quarantined, never retried-until-green.** Expiry date plus tracking issue; quarantined tests can't guard deploy lanes.
- **Fork PRs are review-only.** Untrusted authors can receive feedback; they cannot reach the deploy path without explicit per-repo risk acceptance.
- **It pairs with a constitution model.** Repos under a gate declare *gate-owned proof*: push hooks stay slim because the gate re-proves everything on the exact candidate SHA — see the two enforcement models in [the workspace constitution](../../docs/workspace-constitution.md).

## Install

```bash
cp -R skills/pr-production-gate ~/.codex/skills/
```

Start from [templates/pr-gate.config.example.json](../../templates/pr-gate.config.example.json) (intentionally inert) and schedule with [templates/automation.toml.example](../../templates/automation.toml.example).

## Adapt it

- Map the promotion train to your platform — the preview/production branch pattern is an example shape, not a requirement.
- Keep the references (`safety-checks.md`, `repo-config-schema.md`, `deployment-policy.md`, `review-comment-template.md`) as your gate's living spec.
- Threat-model your implementation before trusting it with deploy credentials — it is the most privileged automation you'll run.
- Watch your idle costs from day one. The safety rules keep the gate honest; the economics rules keep it alive.
