# Content map

The pipeline from repo artifacts to published content. Each row is one piece; the per-skill READMEs are the first drafts. Statuses: `ready` (source material complete in this repo), `partial` (needs material not yet public), `idea`.

## Series 1 — Make your agent prove its work (the gates)

| # | Working title / hook | Source | Format | Status |
|---|---|---|---|---|
| 1 | **Your AI agent thinks "looks done" is done.** Here's the gate that stops it | [README](../../README.md), [skill-anatomy](../skill-anatomy.md) | post / video intro | ready |
| 2 | **Make your agent ask before it builds** — the planning gate that kills vibes-driven specs | [clarify-before-build](../../skills/clarify-before-build/) | post + demo session | ready |
| 3 | **The demo worked. Production didn't.** Requirement tracing before a line of code | [feature-design-preflight](../../skills/feature-design-preflight/) | post | ready |
| 4 | **Stop burning 20-minute test gates on 20-second failures** | [test-readiness-preflight](../../skills/test-readiness-preflight/) | post + video | ready |
| 5 | **Every click needs a test that proves it** — the user-action matrix | [user-action-coverage-review](../../skills/user-action-coverage-review/) | post | ready |
| 6 | **"Done" at 1440px, broken at six other viewports** | [frontend-design-quality](../../skills/frontend-design-quality/) | video (visual diffs) | ready |
| 7 | **"Review my app" should mean the same thing every time** | [full-app-review](../../skills/full-app-review/) | post | ready |
| 8 | **Delete code without deleting behavior** — the 5-class removal taxonomy | [codebase-prune-review](../../skills/codebase-prune-review/) | post | ready |
| 9 | **Can your operator answer "what broke" at 2am?** | [error-logging-instrumentation](../../skills/error-logging-instrumentation/) | post | ready |
| 10 | **Docs that admit what they don't know** — confidence-tagged documentation | [repo-technical-documentation](../../skills/repo-technical-documentation/) | post | ready |
| 11 | **Analytics without the PII liability** — typed events, intent vs. outcome | [nextjs-vercel-analytics](../../skills/nextjs-vercel-analytics/) | post + code walkthrough | ready |

## Series 2 — The system (the patterns)

| # | Working title / hook | Source | Format | Status |
|---|---|---|---|---|
| 12 | **My laptop reviews, tests, and ships every PR** — a fail-closed deployment train | [pr-production-gate pattern](../patterns/pr-production-gate.md) + skill | long post / talk | ready |
| 13 | **I let my agent read its own sessions every night** (and rewrite its skills — safely) | [learning-loop pattern](../patterns/learning-loop.md) | post + video | ready |
| 14 | **Version-control your agent's brain** — config sync with redaction | [sync-and-backup pattern](../patterns/sync-and-backup.md) | post | ready |
| 15 | **One AGENTS.md to govern every repo** — the workspace constitution, annotated | [workspace-constitution](../workspace-constitution.md) + template | long post | ready |
| 16 | **Skills that call skills** — why a graph beats a mega-prompt | [skill-graph](../skill-graph.md) | post | ready |
| 17 | **Threat-model your own automations** — your agent tooling is attack surface | threat-model files in skills + patterns docs | post | ready |
| 18 | **How to publish your agent setup without leaking your life** — the fail-closed privacy pipeline | [privacy-scan.sh](../../scripts/privacy-scan.sh), this repo's own story | post | ready |

## Backlog / needs work before publishable

| Working title | Why not yet |
|---|---|
| Case study: a research-report skill with evidence caching, URL revalidation, and tested rendering | Source skill is business-domain; needs a generic rebuild with synthetic fixtures |
| ChatOps for your gates: a channel-bound review-trigger bot | Bot repo is private; needs extraction into a template |
| Keeping the dev machine current without breaking repos | Maintenance automation needs generalizing |
| Anatomy of a real learning-loop summary, line by line | Wants a fabricated-but-realistic example summary |

## Per-piece checklist

Before any piece ships:

- [ ] Every command/code sample runs from a fresh clone of this repo
- [ ] No private names, paths, IDs, or screenshots of private repos (`./scripts/privacy-scan.sh` the draft if it lives here)
- [ ] Terminology matches the [glossary](glossary.md)
- [ ] Links point at this repo, not local paths
- [ ] The hook states the failure, not the feature
