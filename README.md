# production-ai

**Skills and guardrails that make an AI coding agent prove its work.**

This is a working library, not a prompt collection. Every artifact here was extracted from a real daily-driver setup where AI agents plan features, write code, run containerized test gates, review pull requests, and promote releases to production — with humans setting policy and agents carrying the proof burden.

The core idea: coding agents optimize for *looks done*. Left alone, they will write plausible code, skip the boring verification, and report success. Everything in this repo exists to redefine "done" as **proven** — with tests, evidence, fail-closed gates, and explicit completion blockers the agent cannot talk its way past.

## The library

Each skill has two layers:

- `skills/<name>/` — the clean installable payload loaded by the agent when the skill triggers.
- `docs/skills/<name>.md` — the public human guide: why the skill exists, the failure it prevents, and how to adapt it.

| Skill | Kind | Guide | Payload |
|---|---|---|---|
| client-requirements-to-plan | Planning intake | [guide](docs/skills/client-requirements-to-plan.md) | [payload](skills/client-requirements-to-plan/) |
| youtube-content-planner | Content workflow | [guide](docs/skills/youtube-content-planner.md) | [payload](skills/youtube-content-planner/) |
| clarify-before-build | Planning gate | [guide](docs/skills/clarify-before-build.md) | [payload](skills/clarify-before-build/) |
| feature-design-preflight | Design gate | [guide](docs/skills/feature-design-preflight.md) | [payload](skills/feature-design-preflight/) |
| user-action-coverage-review | Coverage gate | [guide](docs/skills/user-action-coverage-review.md) | [payload](skills/user-action-coverage-review/) |
| frontend-design-quality | Quality gate | [guide](docs/skills/frontend-design-quality.md) | [payload](skills/frontend-design-quality/) |
| test-readiness-preflight | Validation preflight | [guide](docs/skills/test-readiness-preflight.md) | [payload](skills/test-readiness-preflight/) |
| full-app-review | Review orchestrator | [guide](docs/skills/full-app-review.md) | [payload](skills/full-app-review/) |
| codebase-prune-review | Removal gate | [guide](docs/skills/codebase-prune-review.md) | [payload](skills/codebase-prune-review/) |
| error-logging-instrumentation | Observability review | [guide](docs/skills/error-logging-instrumentation.md) | [payload](skills/error-logging-instrumentation/) |
| repo-technical-documentation | Documentation engine | [guide](docs/skills/repo-technical-documentation.md) | [payload](skills/repo-technical-documentation/) |
| nextjs-vercel-analytics | Implementation guide | [guide](docs/skills/nextjs-vercel-analytics.md) | [payload](skills/nextjs-vercel-analytics/) |
| pr-production-gate | Deployment gate | [guide](docs/skills/pr-production-gate.md) | [payload](skills/pr-production-gate/) |
| security-threat-model | Security gate | [guide](docs/skills/security-threat-model.md) | [payload](skills/security-threat-model/) |
| repo-testing-setup | Foundation gate | [guide](docs/skills/repo-testing-setup.md) | [payload](skills/repo-testing-setup/) |
| laptop-currency-maintenance | Ops automation | [guide](docs/skills/laptop-currency-maintenance.md) | [payload](skills/laptop-currency-maintenance/) |
| docker-disk-cleanup | Ops automation | [guide](docs/skills/docker-disk-cleanup.md) | [payload](skills/docker-disk-cleanup/) |

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
cd production-ai
scripts/install-skill.sh clarify-before-build
```

Then ask your agent to plan something substantial — the skill triggers on planning requests, or invoke it directly with `$clarify-before-build`. For early client discovery work, install `client-requirements-to-plan` first and use it to turn client notes into a saved plan before the build gates begin. For channel content, install `youtube-content-planner` and turn skills into saved episode artifacts.

Adopt the workspace constitution:

```bash
cp production-ai/templates/AGENTS-workspace-template.md ~/workspace/AGENTS.md
```

Then edit it down: delete every rule you cannot or will not enforce. A constitution the gates don't back up is worse than no constitution — the agent learns the rules are decorative.

Validate the library (used by CI on every push):

```bash
./scripts/validate.sh        # structure: frontmatter, references, docs, clean payloads
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

## Published videos

The public companion channel is [Building The Age of AI](https://www.youtube.com/@building-the-age-of-ai). Published videos that map to this repo:

| Video | What it covers | Related artifacts |
|---|---|---|
| [What It Actually Takes to Build the Age of AI](https://www.youtube.com/watch?v=ZxtLxXH-r4U) | Channel introduction: why building reliable AI systems is a systems-design problem, not just a prompting problem. | [Skill anatomy](docs/skill-anatomy.md), [skill graph](docs/skill-graph.md) |
| [How to Actually Scale Your Agentic AI Workflows](https://www.youtube.com/watch?v=FlaiPTj7ifA) | Local automated testing, regression protection, security scans, unit/integration/E2E layers, and Docker as the execution boundary. | [repo-testing-setup](docs/skills/repo-testing-setup.md), [test-readiness-preflight](docs/skills/test-readiness-preflight.md) |
| [Stop Trusting Your AI Agent: Build a GitHub CI/CD Pipeline](https://www.youtube.com/watch?v=A-A2WY4JuSU) | Version control, CI/CD framing, and the move from trusting the agent to making it run checks. | [pr-production-gate](docs/skills/pr-production-gate.md), [repo-testing-setup](docs/skills/repo-testing-setup.md) |
| [What If Your AI Code Fixed Its Own Tech Debt?](https://www.youtube.com/watch?v=_lQJIqvI8_s) | The Production AI skill ecosystem: planning, testing, logging, threat modeling, CI/CD, self-improvement, and reducing technical debt. | [The library](#the-library), [learning loop](docs/patterns/learning-loop.md) |

## License

[MIT](LICENSE). Build on it, ship it, write about it — attribution appreciated.
