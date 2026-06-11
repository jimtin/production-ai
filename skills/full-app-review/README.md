# full-app-review

**The failure this prevents:** "fully review this app" is one of the most common asks and one of the least defined. Without a contract, the agent reads some files, comments on what it happened to see, and calls it a review — different dimensions every time, no record of what was *not* checked, mutations sneaking in alongside observations.

This skill gives "full review" a fixed, repeatable meaning: an evidence-backed report plus prioritized remediation plan, produced without mutating anything — and the same repo state always yields the same overall verdict.

## What it does

1. **Baseline the repo** with cheap static inspection (manifests, routes, tests, configs, deployment files) — expensive gates are identified, not launched.
2. **Build a review matrix** before forming conclusions: sixteen dimensions from repo instructions through frontend, the three coverage layers, security, observability, analytics, dependencies, deployment, and pruning — each row with evidence and a closed status (`covered / gap / blocked / not applicable`).
3. **Evaluate every dimension**, delegating to specialist skills — user-action findings are expressed in the `$user-action-coverage-review` matrix format so gaps convert directly into implementation tasks.
4. **Report findings ordered by severity** (`blocking / high / medium / low`), each with evidence, affected paths, and the first safe remediation step — closed by a *derived* overall status.

## The design choices worth stealing

- **Report-only by default.** "Do not mutate code, config, data, branches, dependencies, or deployment state unless the user separately asks for remediation." Reviews that edit are a different task with different risks.
- **The overall status is derived, not judged.** Any blocking finding → `blocking issues found`; else any high → `high-risk gaps`; else any finding or blocked dimension → `ready for remediation planning`; `no material findings` requires zero findings *and* zero blocked dimensions. Two reviews of the same repo state cannot summarize differently.
- **The skill coverage matrix.** The report must show which specialist skills were applied, skipped, or blocked — and a dimension can only be skipped as `not applicable` *with a reason*. Silent gaps are structurally visible.
- **An orchestrator, not a monolith.** Eight specialists do the deep work (`$frontend-design-quality`, `$test-readiness-preflight`, `$user-action-coverage-review`, `$security-threat-model`, …); this skill owns sequencing, evidence collection, and the severity-ordered synthesis. See [docs/skill-graph.md](../../docs/skill-graph.md).
- **Evidence has grades.** `inspected` vs. `run` vs. `not run`; stale docs are weak evidence unless live code confirms them; production readiness is never inferred from local state.
- **Headless safety.** Run from an automation, it does cheap static inspection only — never state-mutating commands or expensive gates — records unverifiable dimensions as `blocked`, and can never claim "no material findings" while anything is blocked.
- **Completion blockers with teeth.** Findings without evidence paths, blocking/high findings without a first remediation step, a missing skill coverage matrix, any mutation during review — each one blocks "review complete."

## Install

```bash
cp -R skills/full-app-review ~/.codex/skills/
```

Triggers on "fully review this app/repo", production-readiness reviews, comprehensive audits. Single-dimension requests route to the relevant specialist directly.

## Adapt it

- Trim the dimension list to your reality — but keep the rule that skipped dimensions are recorded with reasons.
- Swap in your own specialists; the orchestration contract (matrix → evidence → derived verdict) is what matters.
- `references/report-template.md` defines the output shape — align it with whatever your team already reads, and keep the derivation rule so verdicts stay deterministic.
