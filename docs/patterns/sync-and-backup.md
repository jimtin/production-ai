# Pattern: sync and backup for agent configuration

Your agent configuration — skills, workspace rules, automations, harness settings — is real infrastructure. If your laptop died tonight, how long until your agent works the way it does now? This pattern makes the answer "one clone and one script."

## Two private repos, two jobs

**1. The guardrails repo** — the behavioral layer:

```
guardrails-repo/            (PRIVATE)
├── AGENTS.md               # workspace constitution
├── skills/                 # every custom skill (system-managed skills excluded)
├── learning-summaries/     # sanitized daily learning-loop output
├── skill-proposals/        # pending skill changes awaiting approval
└── scripts/
    ├── sync-from-local.sh  # local → repo
    ├── sync-to-local.sh    # repo → local (with timestamped backup first)
    ├── sync-and-push.sh    # sync + validate + commit + push, fail closed
    └── validate.sh
```

**2. The config mirror** — the harness layer:

```
config-repo/                (PRIVATE)
├── codex/AGENTS.md         # global agent rules
├── codex/config.toml       # model, profiles, MCP servers — secret values REDACTED
├── codex/automations/<id>/automation.toml   # every automation's prompt + schedule
└── restore-to-laptop.sh    # rebuild a new machine, prints a manual-restore checklist
```

Keeping them separate keeps the blast radius honest: the guardrails repo is shareable with a teammate; the config mirror is personal-machine state.

## The rules

1. **Allowlist, never blocklist.** The sync scripts copy a named list of files. New file types don't leak by default — they don't sync until explicitly added.
2. **Redact at sync time, fail closed.** Secret-shaped values (MCP API keys in headers, tokens) are stripped during the copy, then gitleaks runs over the result. If credential-shaped content survives redaction, the sync refuses to finish. Restores print a checklist of what to re-enter by hand.
3. **Some things are never mirrored.** Credentials, auth state, env files. Session transcripts and app databases. Runtime state, logs, reports, worktrees. Configuration is what you *decided*; state is what *happened*. Mirror decisions, recreate state.
4. **Restore makes a backup first.** `sync-to-local.sh` snapshots the live config under a timestamped backup directory before overwriting — a restore should never be the thing that destroys the only good copy.
5. **Automate the push, schedule it after the learning loop.** A nightly automation runs sync-and-push; it commits only when something actually changed, and validation + gitleaks gate every push. Running it after the [learning loop](learning-loop.md) means accepted skill updates ride the same day's backup.

## Config as reviewable diffs

A side benefit that ends up mattering most day-to-day: every skill edit, constitution change, and automation tweak becomes a git diff. You can see what the learning loop changed last night, bisect a behavior regression to a specific skill edit, and review your own policy drift over time. Agent configuration that only exists as live files on one machine is unauditable.

## The public derivative

A public library (this repo) is **not** a third sync target — it is a manually curated derivative. Promotion flow:

```
~/.codex (live) ──nightly──► guardrails repo (private)
                                   │
                              manual, per-skill:
                              sanitize → README layer → privacy scan
                                   │
                                   ▼
                          production-ai (public, CI re-scans every push)
```

Nothing automated ever writes to the public side. The privacy scan ([scripts/privacy-scan.sh](../../scripts/privacy-scan.sh)) runs locally before any push *and* in CI after it, so a slip has to get past the same gate twice.
