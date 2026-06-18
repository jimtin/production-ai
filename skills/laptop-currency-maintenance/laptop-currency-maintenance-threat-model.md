# Laptop Currency Maintenance Threat Model

## Scope

In scope: the installable `~/.codex/skills/laptop-currency-maintenance/` payload, the `Laptop Currency Maintenance` scheduled automation, Homebrew formula upgrade behavior, repo dependency audit/report-only behavior, local reports, state files, and Discord reporting.

Out of scope: Homebrew internals, npm/yarn/pnpm registries, macOS software update, App Store updates, Docker Desktop updates, and future repo dependency upgrade implementation work.

## System Model

- Local scheduled automation runs `node ~/.codex/skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance.mjs update`.
- The tool reads `config.json`, audits Homebrew, global npm, CLI versions, and local repo package metadata.
- In update mode it runs `brew update`, upgrades only unpinned Homebrew formulae with `brew upgrade --formula ...`, then runs `brew cleanup`.
- Repo package manifests and lockfiles are not edited; repo dependency output is report-only.
- Reports are written under `~/.codex/automation-reports/laptop-currency-maintenance/` and state under `~/.codex/automation-state/laptop-currency-maintenance/`.
- Discord posting uses a token read from a local secrets file (e.g. `~/.codex/secrets/discord-bot-token`) and posts to the configured channel ID.

## Assets And Trust Boundaries

- Assets: Discord bot token, local developer tooling integrity, Homebrew-installed CLIs, repo manifests/lockfiles, local report files, command output, and developer workstation availability.
- Boundaries:
  - Local automation to Homebrew package manager commands.
  - Local automation to npm/yarn/pnpm package metadata commands.
  - Local automation to Discord API.
  - Local automation to configured workspace repos.
  - Local report files to future learning-loop and guardrails sync processes.

## Threats

| Threat | Likelihood | Impact | Priority | Existing Controls |
| --- | --- | --- | --- | --- |
| Over-broad update mutates repos or lockfiles | Medium | High | High | Tool only runs package-manager outdated/audit commands for repos; tests assert no repo install/update commands are used. |
| Cask, macOS, Docker Desktop, or global npm updates run unintentionally | Medium | Medium | Medium | Skill and cron prompt restrict auto-updates to Homebrew formulae; code uses `brew upgrade --formula`. |
| Failed `brew update` still proceeds to upgrade/cleanup | Medium | Medium | Medium | `runBrewUpgrade` returns `failedClosed` and skips upgrade/cleanup when `brew update` fails. |
| Secret or provider identifier leaks to Discord/report files | Low | High | Medium | Discord summaries and command output use redaction for bot token, auth headers, common token formats, env values, emails, and provider IDs. |
| Malicious package update compromises host tooling | Low | High | Medium | Updates are limited to Homebrew stable formulae and version proof is captured; this risk remains inherent to trusting Homebrew taps. |
| Automation causes workstation disruption by upgrading high-impact CLIs daily | Medium | Medium | Medium | Reports include before/after versions and failures; repo dependency changes are not automatic. |
| Command output overwhelms reports or exposes noisy data | Medium | Low | Low | Command output is truncated in JSON/report summaries; Markdown stays summary-oriented. |
| Local absolute paths leak through outbound summaries | Medium | Low | Low | Report and Discord text are sanitized to redact local home paths before leaving the process. |

## Recommendations

- Keep repo dependency upgrades out of this automation until a separate repo-specific workflow is approved.
- Keep casks and macOS/App Store updates report-only unless a later plan adds approval and rollback handling.
- Review the first real daily run for CLI disruption, especially `node`, `vercel-cli`, `gh`, `powershell`, and `dotnet`.
- If Discord reports ever include sensitive output, add a targeted redaction test before the next run.
- Keep changes in this public skill payload covered by focused unit tests, structural validation, privacy scanning, and gitleaks before publishing.

## Assumptions

- The workstation owner accepts daily Homebrew formula updates for developer tooling.
- Homebrew formulae are trusted as the authoritative latest-stable source for host CLI tooling.
- The Discord channel is private enough for sanitized maintenance summaries.
- Repo package currency findings are not completion claims and require separate implementation/validation work.
