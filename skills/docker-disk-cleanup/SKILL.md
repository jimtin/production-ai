---
name: docker-disk-cleanup
description: Conservative Docker-native disk cleanup for developer machines and local PR-gate hosts. Use when asked to clean Docker disk usage, reclaim Docker image/build-cache/volume space, run daily Docker cleanup, diagnose Docker disk pressure, or safely prune containers, networks, images, BuildKit cache, and unused volumes while preserving active services and gate work.
---

# Docker Disk Cleanup

## Purpose

Use this skill to reclaim Docker disk space without damaging active local services, test databases,
or PR-gate runs. Prefer the bundled script over ad hoc prune commands.

## Operating Rules

- Start with an audit: filesystem free space, `docker info`, `docker system df`, containers, and
  volumes.
- Use `scripts/docker-disk-cleanup.mjs`; do not hand-roll prune order unless the script is missing
  or cannot run.
- Do not use `sudo`.
- Do not delete named project volumes manually. Let Docker remove only volumes it reports as
  dangling, after attachment checks.
- Do not run overlapping cleanup jobs. The script uses a lock in the report directory.
- Preserve active services. If gate-like containers are running, or the user says a gate is active,
  run active-gate mode so image and builder pruning use an age filter.
- Treat Docker race errors such as containers disappearing between list and prune as recheck-and-
  continue signals unless the script reports a hard failure.
- Keep reports sanitized: do not print env values, tokens, auth files, or secret-looking strings.

## Quick Start

Run a dry run first:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs audit
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --dry-run
```

Run cleanup:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup
```

For a known active PR gate or long validation run:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --active-gate-mode
```

When volume risk is unclear:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --skip-volumes
```

## Workflow

1. **Confirm the target path.** Probe the filesystem that actually holds Docker data or the active
   workspace. Pass it with `--workspace <path>` or set `DOCKER_DISK_CLEANUP_WORKSPACE`. If unsure,
   use the current working directory and say so.
2. **Audit first.** Run `audit` or `cleanup --dry-run`. Read `docker system df` before deciding how
   aggressive cleanup should be.
3. **Check active work.** Inspect running containers and the script's `activeGateMode` decision.
   Use `--active-gate-mode` when a PR gate, test gate, or build is active.
4. **Run serialized cleanup.** The script plans commands in this order:
   - `docker container prune -f`
   - `docker network prune -f`
   - `docker image prune -a ... -f`
   - `docker builder prune -a ... -f`
   - dangling volume attachment checks
   - `docker volume prune -a -f` when supported, otherwise `docker volume prune -f`
   - final `docker image prune -a ... -f`
5. **Report the outcome.** Include initial/final disk usage, Docker usage, mode, commands run,
   report path, removed-space summary when Docker provides one, skipped steps, and blockers.

## Daily Automation Contract

A daily cleanup automation should run:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --workspace <workspace-path>
```

Use a report directory under the local agent home, for example:

```bash
--report-dir ~/.codex/automations/daily-docker-cleanup
```

Schedule dry runs first when moving the automation to a new machine.

## Safety Policy

Read `references/safety-policy.md` before changing cleanup behavior, adding new destructive
operations, or adapting the skill to a non-Docker-Desktop host.

The threat model lives in `docker-disk-cleanup-threat-model.md`; review it before publishing
changes to cleanup behavior, report sinks, or scheduler integration.

## Completion Blockers

- Cleanup ran without a prior audit or dry-run-level evidence.
- A second cleanup was launched while one was already running.
- Active gate work was detected but broad image/build-cache pruning ran without an age filter.
- Volumes were deleted manually by name instead of through Docker's unused-volume prune with
  attachment checks.
- The report omits skipped steps, blockers, or whether active-gate mode was used.
- Secret material or local auth paths were printed in a report or chat response.
