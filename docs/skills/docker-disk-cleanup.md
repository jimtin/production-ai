# docker-disk-cleanup

**The failure this prevents:** a dev machine fills up with Docker images, stopped containers, BuildKit cache, and old volumes; the agent responds with a broad prune; then an active PR gate, test database, or local service loses state it still needed.

This skill is the daily, conservative Docker cleanup lane. It treats disk cleanup as operational work with a report, a lock, and a narrow deletion boundary.

## What it does

1. **Audits first**: filesystem free space, Docker daemon status, `docker system df`, containers, and volumes.
2. **Serializes cleanup**: container prune, network prune, image prune, builder prune, volume checks, unused-volume prune, final image prune.
3. **Protects active work**: detects gate-like running containers and switches image/build-cache cleanup to age-filtered mode.
4. **Checks volumes before pruning**: dangling volumes are inspected for container attachments before Docker is allowed to prune unused volumes.
5. **Writes reports**: JSON reports land under the local agent automation folder by default, with status, commands, blockers, and before/after Docker usage.

## The bundled tool

The installable payload includes:

- `scripts/docker-disk-cleanup.mjs` — CLI runner: `audit` or `cleanup`, plus `--dry-run`, `--active-gate-mode`, `--skip-volumes`, `--workspace`, `--report-dir`, and `--json`.
- `scripts/docker-disk-cleanup-core.mjs` — planning, lock handling, Docker command execution, report writing, and safety checks.
- `scripts/docker-disk-cleanup-core.test.mjs` — focused tests for argument parsing, active-gate detection, prune planning, and volume-skip behavior.
- `references/safety-policy.md` — the deletion boundary and adaptation rules.

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs audit
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --dry-run
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup
```

For a daily automation, pass the workspace that shares the relevant Docker pressure:

```bash
node ~/.codex/skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs cleanup --workspace /path/to/workspace
```

## Design choices worth stealing

- **Cleanup has a lock.** If yesterday's or another thread's cleanup is still running, the next run stops instead of launching overlapping Docker prune commands.
- **The script is conservative when gates are active.** Age-filtered image and builder pruning preserves fresh validation artifacts while still reclaiming older debris.
- **Volumes get a separate safety step.** Docker is trusted to prune unused volumes, but only after a cheap attachment check.
- **The report is the operator contract.** A no-op, a blocked Docker daemon, a skipped volume prune, and a successful reclaim all produce a report path and explicit status.

## Install

```bash
scripts/install-skill.sh docker-disk-cleanup
```

Then run the dry-run command before putting it on a schedule.

## Adapt it

- Tune `--age-filter` for machines with very long-running validation gates.
- Use `--skip-volumes` on shared machines or when project volumes are not well understood.
- Keep the cleanup Docker-native. Do not add `rm -rf` cleanup of Docker Desktop internals, repo folders, databases, or auth files.
