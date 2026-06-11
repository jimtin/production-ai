# full-app-review

**The failure this prevents:** "fully review this app" is one of the most common asks and one of the least defined. Without a contract, the agent reads some files, comments on what it happened to see, and calls it a review — different dimensions every time, no record of what was *not* checked, mutations sneaking in alongside observations.

This skill gives "full review" a fixed, repeatable meaning: an evidence-backed report plus prioritized remediation plan, produced without mutating anything.

## What it does

1. **Baseline the repo** with cheap static inspection (manifests, routes, tests, configs, deployment files) — expensive gates are identified, not launched.
2. **Build a review matrix** before forming conclusions: live flows, critical paths, roles, mutations, security boundaries, observability, legacy paths — each row with evidence.
3. **Evaluate every dimension** — frontend, testing, security, observability, analytics, dependencies/deployment, pruning — delegating to specialist skills where they exist.
4. **Report findings ordered by severity** (`blocking / high / medium / low`), each with evidence, affected paths, and the first safe remediation step.

## The design choices worth stealing

- **Report-only by default.** "Do not mutate code, config, data, branches, dependencies, or deployment state unless the user separately asks for remediation." Reviews that edit are a different task with different risks.
- **The skill coverage matrix.** The report must show which specialist skills were applied, skipped, or blocked — and a dimension can only be skipped as `not applicable` *with a reason*. This makes silent gaps structurally visible.
- **An orchestrator, not a monolith.** Seven specialist skills do the deep work (`$frontend-design-quality`, `$test-readiness-preflight`, `$codebase-prune-review`, `$error-logging-instrumentation`, …); this skill owns sequencing, evidence collection, and the severity-ordered synthesis. See [docs/skill-graph.md](../../docs/skill-graph.md).
- **Stale evidence is declared.** If review evidence is blocked by auth/secrets/provider access, the report says so and marks the residual risk — instead of quietly reviewing around it.
- **Severity definitions with teeth.** `blocking` means "must be fixed before push/merge/deploy" — and every `blocking`/`high` finding must carry paths, impact, and a first remediation step, so the report converts directly into a work plan.

## Install

```bash
cp -R skills/full-app-review ~/.codex/skills/
```

Triggers on "fully review this app/repo", production-readiness reviews, comprehensive audits.

## Adapt it

- Trim the dimension list to your reality — but keep the rule that skipped dimensions are recorded with reasons.
- Swap in your own specialists; the orchestration contract is what matters.
- `references/report-template.md` defines the output shape — align it with whatever your team already reads (Linear docs, ADRs, runbooks).
