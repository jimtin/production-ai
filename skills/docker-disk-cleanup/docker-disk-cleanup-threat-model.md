# Docker Disk Cleanup Threat Model

## 1. Summary

- The primary risk is integrity and availability loss from over-broad Docker cleanup removing state that active local services or PR gates still need.
- The skill is local-only and has no network listener; exposure is through a human or scheduler running the bundled CLI.
- Existing controls are conservative: audit-first workflow, lock directory, active-gate detection, age-filtered prune mode, volume attachment checks, and no manual file deletion.
- No critical or high findings were identified for the current public payload.
- The most valuable mitigation is to keep the cleanup boundary Docker-native and reject future direct filesystem deletion of Docker Desktop internals, repo folders, databases, or auth files.

## 2. Scope and Method

In scope:

- `skills/docker-disk-cleanup/SKILL.md`
- `skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs`
- `skills/docker-disk-cleanup/scripts/docker-disk-cleanup-core.mjs`
- `skills/docker-disk-cleanup/references/safety-policy.md`
- `docs/skills/docker-disk-cleanup.md`

Out of scope:

- Docker Desktop internals.
- Host scheduler configuration outside this repo.
- Any private local automation state or generated reports.

How it runs: the skill is a local CLI invoked by an agent, user, cron, or automation. It shells out to `df` and `docker`, writes a JSON report to a local report directory, and does not expose a server. Confidence tags: `confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = not determined.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Skill instructions | Tell agents when and how to clean Docker disk use | Skill trigger / agent context | `skills/docker-disk-cleanup/SKILL.md` | confirmed |
| CLI runner | Parses command line and prints a short status | `node scripts/docker-disk-cleanup.mjs audit|cleanup` | `skills/docker-disk-cleanup/scripts/docker-disk-cleanup.mjs` | confirmed |
| Core cleanup module | Builds prune plan, detects active gate containers, acquires lock, runs Docker commands, writes report | Called by CLI runner | `skills/docker-disk-cleanup/scripts/docker-disk-cleanup-core.mjs` | confirmed |
| Safety reference | Defines allowed and forbidden cleanup behavior | Loaded by agent before behavior changes | `skills/docker-disk-cleanup/references/safety-policy.md` | confirmed |
| Local Docker daemon | Removes Docker-managed unused resources | Docker CLI commands | `docker container/network/image/builder/volume prune` args in core module | confirmed |
| JSON report | Records audit, plan, blockers, and command results | Local filesystem write | `finishReport()` in core module | confirmed |

CI/build/dev-test surface:

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Focused unit test | Proves argument parsing, active-gate detection, and prune planning | `node --test` or direct test file execution | `skills/docker-disk-cleanup/scripts/docker-disk-cleanup-core.test.mjs` | confirmed |
| Public repo validator | Checks skill structure, docs, agents metadata, and referenced resources | `./scripts/validate.sh` | `scripts/validate.sh` | confirmed |

## 4. Trust Boundaries

| Boundary | From -> To | Protections observed | Gaps | Evidence |
|---|---|---|---|---|
| User/agent/scheduler -> CLI | Local caller supplies command and flags | Explicit command allowlist, option parsing, no server exposure | Scheduler configuration not modeled | `parseArgs()` in core module |
| CLI -> Docker daemon | Script invokes Docker prune commands | Docker-native prune only; no direct file deletion; serialized order | Docker itself decides unused state; misuse can still remove stopped-but-valued resources | `buildPrunePlan()` in core module |
| Cleanup process -> local report file | Report written to report directory | Lock directory prevents overlap; report mode `0600` | Report can include local paths from Docker output | `finishReport()` in core module |
| Cleanup process -> volumes | Volume prune requested after attachment checks | Dangling volume list plus per-volume container reference check; `--skip-volumes` escape hatch | Docker volume metadata can change after check | `checkDanglingVolumeAttachments()` in core module |

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Local service state | Docker volumes and containers | Removing state can break databases, local apps, and test environments |
| PR-gate work | Docker images, BuildKit cache, containers, networks, volumes | Removing fresh artifacts can fail or slow active validation runs |
| Operator evidence | JSON cleanup reports | Needed to distinguish no-op, blocked Docker, skipped volumes, and real cleanup |
| Host compute/disk | Docker Desktop VM and host filesystem | Cleanup can recover capacity, but misuse can also disrupt work |

## 6. Attacker Profile

Capabilities:

- Can convince a local agent or user to run the skill with risky flags, if they can influence the prompt or schedule.
- Can race Docker state by starting/stopping containers while cleanup runs, if they already have local Docker access.
- Can read reports if they have host filesystem access to the report directory.

Non-capabilities:

- Cannot trigger the skill remotely through a network listener; none exists in this payload.
- Cannot receive production secrets through the cleanup script; it does not read env files or auth stores.
- Cannot delete arbitrary host files through the script unless future code adds direct filesystem deletion.

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-1 | Remove state needed by active gates | Prompt/scheduler runs cleanup -> Docker daemon prune -> PR-gate images/cache/volumes | integrity / availability | medium: cleanup is designed to run daily | medium: active validation may fail or slow down | medium | Active-gate detection, `--active-gate-mode`, age-filtered image/builder prune, volume checks | `detectActiveGate()`, `buildPrunePlan()` |
| AP-2 | Delete valuable project volumes | Caller runs cleanup -> volume prune -> local service state | integrity / availability | low: Docker only prunes unused volumes and script checks attachments | high: database state loss can be costly | medium | `--skip-volumes`, dangling-volume attachment checks, no manual volume removal | `checkDanglingVolumeAttachments()`, `safety-policy.md` |
| AP-3 | Hide or confuse cleanup outcome | Cleanup writes incomplete report -> operator cannot tell what happened | detection-evasion | low: report is always written on normal paths | medium: poor evidence can lead to repeated unsafe cleanup | low | JSON report includes status, blockers, plan, audit, and report path | `finishReport()` and report object in `runCleanup()` |
| AP-4 | Leak host path details through reports | Docker output -> JSON report -> local report reader | exfiltration | low: attacker already needs local report access | low: local paths are sensitive context but not credentials | low | Reports avoid env/auth reads; docs forbid secrets in reports | `runCleanup()` command set, `SKILL.md` operating rules |

Likelihood/impact notes: priorities are conditional on this remaining a local-only developer automation and not being exposed through a remotely triggerable service.

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location (file/component/boundary) | Control type |
|---|---|---|---|
| AP-1 | Keep active-gate mode as the default whenever gate-like running containers are detected; test any pattern changes. | `detectActiveGate()` and core tests | validation / fail-closed defaults |
| AP-2 | Preserve `--skip-volumes` and attachment checks; do not add manual `docker volume rm` by name. | `checkDanglingVolumeAttachments()` and `safety-policy.md` | safety boundary |
| AP-3 | Keep status values closed and report blockers explicitly. | `runCleanup()` report construction | audit logging |
| AP-4 | If reports are ever sent to chat, add a sanitizer before the sink. | future notification adapter | output redaction |

## 9. Assumptions and Open Questions

- `user-confirmed`: The skill is used frequently and has a daily scheduled use case.
- `unvalidated`: The public version is intended for local developer machines, not shared multi-user Docker hosts.
- `unvalidated`: Generated reports remain local unless a future notification sink is added.
- `unvalidated`: Docker Desktop and Docker CLI semantics remain compatible with `docker volume prune -a`; the script falls back to plain `docker volume prune -f` when `--all` is not supported.
