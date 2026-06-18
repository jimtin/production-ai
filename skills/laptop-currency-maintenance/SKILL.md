---
name: laptop-currency-maintenance
description: Keep this macOS developer laptop current without unsafe repo mutation. Use when asked to update Homebrew, PowerShell, Vercel CLI, Node, gh, dotnet, global developer tooling, package currency, stale CLIs, or to keep the laptop up to date while safely auditing local repo dependencies.
---

# Laptop Currency Maintenance

## Purpose

Use this skill to keep host developer tooling current while preserving repo safety. The default v1 boundary is strict: Homebrew formulae may be updated by the approved automation, while repo package manifests and lockfiles are audited only unless the user starts a separate repo-specific upgrade task.

## Operating Rules

- Start with a read-only audit before any update.
- Use the bundled automation tool: `scripts/laptop-currency-maintenance.mjs` (installed at `~/.codex/skills/laptop-currency-maintenance/scripts/`). Copy `scripts/config.example.json` to `config.json` beside it and set absolute paths — `~` is not expanded.
- Auto-update only unpinned Homebrew formulae in v1.
- Do not use `sudo`.
- Do not auto-update Homebrew casks, macOS system updates, App Store apps, Docker Desktop, repo dependencies, lockfiles, language runtime managers, or global npm packages.
- Skip and report pinned Homebrew formulae, unavailable tools, casks, and failed checks.
- Highlight configured `highImpactFormulae` in reports when they are outdated.
- Use `completed_with_warnings` when audits complete but checks are unavailable or fail.
- Treat repo dependency upgrades as implementation work: they need repo-local planning, `$test-readiness-preflight`, local/container validation, dependency audit, repo-scoped containerized gitleaks, and `$security-threat-model` when push/readiness is in scope.
- Disk cleanup is not package currency proof. Use this skill for version freshness and package drift.
- Sanitize reports and Discord messages. Do not print tokens, auth headers, env values, provider IDs, or secret-looking strings.

## Workflow

1. **Audit first.** Run `laptop-currency-maintenance.mjs audit` or `update --dry-run` to collect Homebrew, global npm, repo package, audit, CLI version, and cleanup evidence.
2. **Classify host tooling.** Separate auto-upgradeable Homebrew formulae from pinned formulae, casks, missing tools, and manual-only update sources.
3. **Apply safe host updates only.** If updating, run the tool in `update` mode. It refreshes Homebrew metadata, upgrades unpinned formulae, proves before/after versions, then runs `brew cleanup`.
4. **Audit repos without mutating them.** Report outdated repo dependencies by repo, package manager, patch/minor/major gap, security audit status, dirty/active status, and recommended next action.
5. **Escalate repo upgrades separately.** If the user asks to upgrade repo dependencies, switch to repo-specific work and use `$test-readiness-preflight` before expensive validation. Include `$security-threat-model` when the changed scope touches security-sensitive dependencies or push/readiness is in scope.
6. **Report completion.** Include exact commands, pass/fail status, upgraded formulae, skipped items, before/after versions, report paths, Discord status, and any repo dependency proposals.

## Automation Contract

The daily `Laptop Currency Maintenance` cron should run:

```bash
node ~/.codex/skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance.mjs update
```

It should post to the configured Discord channel (`<DISCORD_CHANNEL_ID>` in the config), attach the Markdown report, and fail closed on command errors. It must not mutate repos.

## Completion Blockers

- Audit did not run before update.
- A Homebrew command failed and the report hides or ignores the failure.
- The tool attempts to upgrade casks, repo packages, lockfiles, global npm packages, macOS updates, App Store apps, or Docker Desktop.
- A repo dependency recommendation is reported as completed without repo-local validation.
- Report output includes unredacted secrets or provider identifiers.
- Report output exposes local absolute home paths in Discord or Markdown summaries.
