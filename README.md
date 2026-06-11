# production-ai

**Skills and guardrails that make an AI coding agent prove its work.**

This is a working library, not a prompt collection. Every artifact here was extracted from a real daily-driver setup where AI agents plan features, write code, run containerized test gates, review pull requests, and promote releases to production — with humans setting policy and agents carrying the proof burden.

The core idea: coding agents optimize for *looks done*. Left alone, they will write plausible code, skip the boring verification, and report success. Everything in this repo exists to redefine "done" as **proven** — with tests, evidence, fail-closed gates, and explicit completion blockers the agent cannot talk its way past.

## The library

Each skill is a self-contained directory under [skills/](skills/) with two layers:

- `SKILL.md` — the machine layer. Loaded by the agent when the skill triggers.
- `README.md` — the human layer. Why the skill exists, the failure it prevents, and how to adapt it.

| Skill | Kind | The failure it prevents |
|---|---|---|
| [clarify-before-build](skills/clarify-before-build/) | Planning gate | Building from a spec that is still vibes |
| [feature-design-preflight](skills/feature-design-preflight/) | Design gate | The demo that works until real traffic, real files, and real failure modes arrive |
| [user-action-coverage-review](skills/user-action-coverage-review/) | Coverage gate | Shipped buttons nobody can prove still work |
| [frontend-design-quality](skills/frontend-design-quality/) | Quality gate | "Done" at one viewport, broken at the other six |
| [test-readiness-preflight](skills/test-readiness-preflight/) | Validation preflight | Burning a 20-minute test gate on a 20-second predictable failure |
| [full-app-review](skills/full-app-review/) | Review orchestrator | "Review my app" meaning something different every time you ask |
| [codebase-prune-review](skills/codebase-prune-review/) | Removal gate | Deleting live behavior along with the dead code |
| [error-logging-instrumentation](skills/error-logging-instrumentation/) | Observability review | Production failures an operator cannot debug at 2am |
| [repo-technical-documentation](skills/repo-technical-documentation/) | Documentation engine | Docs that assert confidently instead of admitting what is unknown |
| [nextjs-vercel-analytics](skills/nextjs-vercel-analytics/) | Implementation guide | Analytics instrumentation that quietly ships PII |
| [pr-production-gate](skills/pr-production-gate/) | Deployment gate | Unproven code reaching production because CI was green-ish |
| [security-threat-model](skills/security-threat-model/) | Security gate | "Security reviews" that are checklist dumps untraceable to your code |
| [laptop-currency-maintenance](skills/laptop-currency-maintenance/) | Ops automation | Machine drift breaking builds — or auto-updates breaking the machine |

## The patterns

The skills are instances of a small set of system-level patterns, documented in [docs/](docs/):

- [Skill anatomy](docs/skill-anatomy.md) — the structure every skill follows, and why each part earns its place.
- [The skill graph](docs/skill-graph.md) — skills that invoke skills: orchestrators, specialist gates, and composition rules.
- [The workspace constitution](docs/workspace-constitution.md) — one `AGENTS.md` that governs every repo in a workspace ([template](templates/AGENTS-workspace-template.md)).
- [PR production gate](docs/patterns/pr-production-gate.md) — a fail-closed, container-only review-and-deploy train owned by your own machine.
- [The learning loop](docs/patterns/learning-loop.md) — a nightly automation that mines the agent's own sessions and proposes skill improvements, safely.
- [Sync and backup](docs/patterns/sync-and-backup.md) — version-controlling your agent configuration with redaction and fail-closed pushes.

## Quickstart

Install a skill into Codex CLI:

```bash
git clone https://github.com/jimtin/production-ai.git
cp -R production-ai/skills/clarify-before-build ~/.codex/skills/
```

Then ask your agent to plan something substantial — the skill triggers on planning requests, or invoke it directly with `$clarify-before-build`.

Adopt the workspace constitution:

```bash
cp production-ai/templates/AGENTS-workspace-template.md ~/workspace/AGENTS.md
```

Then edit it down: delete every rule you cannot or will not enforce. A constitution the gates don't back up is worse than no constitution — the agent learns the rules are decorative.

Validate the library (used by CI on every push):

```bash
./scripts/validate.sh        # structure: frontmatter, references, README layers
./scripts/privacy-scan.sh    # denylist sweep + gitleaks, fail closed
```

## Portability

These artifacts are written for [OpenAI Codex CLI](https://github.com/openai/codex) (skills live in `~/.codex/skills/`, workspace rules in `AGENTS.md`, cross-references use `$skill-name`). The patterns port directly to other agent harnesses:

- **Claude Code**: skills go to `~/.claude/skills/`, workspace rules go in `CLAUDE.md`, and `$skill-name` references become skill-name mentions or slash commands. The anatomy (frontmatter description as trigger, progressive-disclosure references, scripts with tests) is identical.
- **Anything else**: the gates are prose contracts. Any harness that can load instructions conditionally can run them.

## What is deliberately not here

This is the public, sanitized derivative of a private setup. Excluded on purpose:

- Client-specific CI integrations and business-domain skills (a market-research/ROI reporting skill, client API contracts).
- Cached data of any kind — API responses, market data, databases, fixtures with real-world records.
- Session logs, learning-loop summaries, and automation state — even sanitized ones.
- Real channel IDs, hostnames, repo names, and absolute paths — replaced with placeholders.

The privacy guarantee is structural, not a one-time cleanup: [CI runs a fail-closed denylist sweep plus gitleaks](.github/workflows/ci.yml) on every push, using the same approach as the private setup it came from. Promotion from the private library into this repo is always a manual, reviewed step — never automated.

## Creating content from this repo

The [content map](docs/content/content-map.md) tracks which artifacts are ready to become posts, videos, or talks, with the hook for each. The [glossary](docs/content/glossary.md) keeps terminology consistent across pieces. Each skill README is structured to be the first draft of its own article.

## License

[MIT](LICENSE). Build on it, ship it, write about it — attribution appreciated.
