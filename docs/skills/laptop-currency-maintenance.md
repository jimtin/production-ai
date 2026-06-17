# laptop-currency-maintenance

**The failure this prevents:** dev-machine drift breaks builds in ways that look like code bugs — a stale `gh` that can't read new API fields, an old Node that fails a lockfile, a CLI that silently changed flags. The obvious fix, "automate the updates," is its own hazard: an agent that upgrades everything will eventually upgrade the one thing that breaks your week (Docker Desktop mid-project, a major runtime bump, a cask that needs a reboot).

This skill automates machine currency with a **strict do-not-touch list** — and ships the actual tested automation tool, not just instructions.

## Video

Published companion: [What If Your AI Code Fixed Its Own Tech Debt?](https://www.youtube.com/watch?v=_lQJIqvI8_s) discusses self-updating systems and the maintenance loop this skill supports.

## What it does

A daily audit-first maintenance pass:

1. **Audit everything**: Homebrew formulae, global npm packages, CLI versions, plus dependency drift for every repo in the workspace — outdated packages by manager with patch/minor/major gaps and security-audit status.
2. **Auto-update almost nothing**: only *unpinned Homebrew formulae*, with before/after version proof, then `brew cleanup`. No `sudo`, ever.
3. **Never touch**: casks, macOS/system updates, App Store apps, Docker Desktop, repo manifests and lockfiles, global npm packages, language runtime managers.
4. **Escalate repo upgrades** instead of doing them: outdated repo dependencies become proposals; acting on one is separate repo-specific work behind `$test-readiness-preflight` and the full validation gate.
5. **Report safely**: sanitized Markdown report, optionally posted to a Discord channel via a bot token read from a local secrets file — never inline config. Fail closed on command errors.

## The bundled tool

`scripts/` contains the real implementation (~720 lines + unit tests, run with `node --test`):

- `laptop-currency-maintenance.mjs` — CLI runner: `audit` | `update`, `--dry-run`, `--no-discord`, `--config <path>`.
- `laptop-currency-maintenance-core.mjs` — the logic: Homebrew classification (unpinned vs. pinned vs. cask), repo scanning with dirty/active detection, report building, and a tested `sanitizeText()` redaction pass over everything that leaves the process.
- `config.example.json` — copy to `config.json` beside the runner; use absolute paths (`~` is not expanded); Discord disabled by default.

```bash
cd ~/.codex/skills/laptop-currency-maintenance/scripts
cp config.example.json config.json   # edit paths
node laptop-currency-maintenance.mjs audit
node laptop-currency-maintenance.mjs update --dry-run
```

## The design choices worth stealing

- **The auto-update boundary is a hard contract, not a preference.** The skill's completion blockers fail the run if the tool *attempts* to upgrade casks, repo packages, lockfiles, or system software — a boundary violation is an incident, not an oops.
- **Audit before update, always.** `update` without a prior audit is a blocked outcome; dry-run exists so the schedule can be rehearsed.
- **Repos are read-only territory.** Dependency drift gets *reported with evidence*; mutation requires a human starting a repo-scoped task with the full gate treatment. Machine maintenance never silently becomes repo maintenance.
- **Dirty/active repo detection.** The repo scan flags repos with uncommitted changes or running dev processes, so even recommendations carry "don't touch this one right now" context.
- **Redaction before any sink.** Reports and chat posts pass through a tested sanitizer (tokens, bearer headers, provider IDs, emails, secret-shaped assignments) — the same pattern as the [learning loop](../../docs/patterns/learning-loop.md).
- **It ships its own threat model.** [laptop-currency-maintenance-threat-model.md](../../skills/laptop-currency-maintenance/laptop-currency-maintenance-threat-model.md) — an automation that runs daily with your shell and a bot token is attack surface, and is modeled as one.

## Install

```bash
scripts/install-skill.sh laptop-currency-maintenance
```

Schedule the daily run with your harness's automation (see [templates/automation.toml.example](../../templates/automation.toml.example)) or plain cron.

## Adapt it

- Tune `highImpactFormulae` to the CLIs whose major bumps you want flagged loudly.
- Swap the Discord sink for whatever you read daily — the report is plain Markdown; the sanitizer is the part to keep.
- If you manage Linux boxes, the Homebrew lane generalizes to apt/dnf with the same pinned/unpinned split — keep the do-not-touch list philosophy intact.
