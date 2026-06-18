# Example PR Gate Runner Setup Report

**Status:** DRAFT - not confirmed  
**Updated:** 2026-06-18  
**Visibility:** sanitized public example

## Environment Profile

| Field | Value |
|---|---|
| Runner | `example-windows-runner` |
| Repository | `example-org/example-web-app` |
| Gate | `example-web-pr-gate` |
| Platform | Windows 11 with WSL2 Ubuntu |
| Access | SSH to Windows host, then WSL user shell |
| Scheduler | Windows Task Scheduler launching WSL |
| Skill source | Public `production-ai` checkout |
| Deployment model | Local PR production gate with preview then production promotion |

## Executive Summary

- Public skills are the starting point: install the setup, testing, production gate, Docker cleanup, readiness, and security skills before machine-specific work.
- Target host access, WSL, Docker, Compose, disk, and an initial gate directory are present.
- Setup is blocked until the scheduler PATH is deterministic, `.env.gate` is created from approved secret sources, checkout drift is reconciled, scheduler tasks are installed, and one target-machine gate run reaches a closed status.

## Public Skill Bootstrap

- Install `pr-gate-runner-setup` to drive this workflow.
- Install `repo-testing-setup` to confirm the repo foundation when evidence is missing.
- Install `pr-production-gate` to enforce exact-SHA proof and closed statuses.
- Install `docker-disk-cleanup` before pruning Docker resources.
- Install `test-readiness-preflight` before expensive validation.
- Install `security-threat-model` before changing scheduler, secrets, provider credentials, or public docs.

## Progressive Discovery

| Area | Status | Evidence |
|---|---|---|
| Public skills | planned | Public skill checkout path is known; target skill install still needs readback. |
| Access | verified | `ssh -i ~/.ssh/example_runner_key runner@192.0.2.10` reaches the host and WSL user. |
| Host identity | verified | Host reports Windows 11 with an Ubuntu WSL distro. |
| Gate path | partial | Candidate controller directory exists at `/home/runner/pr-gate/controllers/example-web-pr-gate`. |
| Docker | verified | Docker engine, Docker Compose, and Buildx respond from WSL. |
| Disk | verified | WSL filesystem and Windows system drive have enough headroom for setup. |
| Runtime PATH | blocked | Interactive shell resolved a mounted host runtime first; scheduler must prepend the Linux runtime path before gate scripts run. |
| Repo foundation | pending | Testing artifacts must be inspected before deployment automation is installed. |
| Secret files | partial | Token files are present with restrictive permissions, but `.env.gate` has not been rendered. Values were not inspected. |
| Gate lock | verified | No active gate lock was present during discovery. |
| Checkout drift | blocked | Candidate checkout is behind the source and has local dirty files that must be classified before sync. |
| Docker pulls | planned | Base image pull should be tested with isolated Docker config if host credential helper fails. |
| Scheduler | missing | No `ExampleGate-*` scheduled tasks were found. |

## Acceptance Ledger

| Requirement | Intended change | Evidence | Status |
|---|---|---|---|
| Public skill baseline | Install public skills on the target agent or operator machine. | Skill install readback lists expected public skills. | planned |
| Environment profile | Fill host, runtime, Docker, Git, scheduler, repo, and security rows from target commands. | Discovery table has no inferred `verified` rows. | partial |
| Repo foundation | Confirm or create canonical containerized testing foundation. | `repo-testing-setup` artifacts are confirmed, or setup is blocked. | pending |
| Runtime path | Add Linux runtime path to the gate launcher and scheduler environment. | `node` and package manager resolve from intended runtime in scheduler context. | blocked |
| Gate controller | Clone or sync the approved standalone controller source. | Config render and validation pass on target host. | blocked |
| Docker readiness | Keep Docker available to WSL and use isolated Docker config if credential helper fails. | Pull/build smoke passes from scheduler user context. | planned |
| Docker cleanup | Run conservative Docker cleanup around active services. | Before/after Docker usage summary and no active service removal. | planned |
| Scheduler | Install run, healthcheck, and maintenance tasks. | Scheduler readback shows task names, cadence, working directory, and command. | pending |
| Closed status | Run first target-machine gate proof. | JSON report shows one closed status such as `no_eligible_prs`, `waiting_on_author`, `rejected`, or `deployed`. | pending |

## Proposed Fix Plan

| Priority | Issue | Proposed fix | Proof | Status |
|---|---|---|---|---|
| P0 | Scheduled runs may resolve a host-mounted runtime before the intended Linux runtime. | Add a runner-local runtime normalization helper and source it from gate, healthcheck, and cleanup wrappers. | Scheduler-context healthcheck prints the intended runtime and exits 0. | planned |
| P0 | Scheduler tasks are missing, so no unattended gate run can occur. | Install run, healthcheck, and maintenance tasks from the checked-in installer. | Scheduler readback shows enabled tasks, cadence, command, user, and background-capable logon mode. | pending |
| P1 | Candidate controller checkout is stale or dirty. | Back up local state, classify local changes, then sync the approved controller source. | `git status --short` is clean and config validation passes on the target machine. | blocked |
| P1 | Secret inventory is incomplete for deployment phases. | Render local-only env material from approved secret sources without printing values. | Presence-only secret check confirms required classes and restrictive modes. | pending |
| P2 | Docker cleanup has not been scoped around active services. | Run audit/report-only cleanup first, then apply only gate-scoped or age-scoped cleanup. | Before/after Docker usage is recorded and active services remain running. | planned |

## Install Plan

1. Install the public skill library and verify the expected skills are discoverable.
2. Create base runner directories for controllers, worktrees, reports, logs, secrets, and state.
3. Complete the environment profile with target-machine commands.
4. Install or configure only missing prerequisites discovered in the profile.
5. Confirm repo testing foundation; if missing, stop and run `repo-testing-setup`.
6. Clone or sync the approved standalone controller source.
7. Render local config and `.env.gate` from approved secret sources without printing values.
8. Patch launcher PATH so scheduled runs use the intended runtime.
9. Run Docker pull/build smoke with isolated Docker config if needed.
10. Run conservative Docker cleanup and record before/after usage.
11. Install gate, healthcheck, and maintenance scheduler tasks.
12. Trigger the scheduler command once and confirm the report contains a closed status.

## Docker Cleanup Plan

- Inspect first with Docker usage and active container listings.
- Preserve active containers and shared base images required by other local services.
- Prefer gate-scoped or age-scoped cleanup instead of broad prune commands.
- Re-check disk after cleanup and record reclaimed space separately from gate readiness.
- Treat Docker cleanup as host health work; it does not replace config validation or closed-status proof.

## Scheduler Plan

- `ExampleGate-Run`: every 10 minutes, launches WSL in the gate controller directory.
- `ExampleGate-Healthcheck`: hourly, verifies lock age, Docker availability, latest report status, and disk headroom.
- `ExampleGate-Maintenance`: daily, runs conservative cleanup and report retention.
- Each task writes timestamped logs under `/home/runner/pr-gate/logs/example-web-pr-gate`.
- Scheduler readback must show command, working directory, cadence, user, and enabled state.

## Verification Plan

- Public skill install readback shows expected skills.
- Render local config on target host.
- Validate gate config with target-host runtime.
- Confirm runtime, package manager, Docker, Compose, and Buildx resolve in the scheduler context.
- Run a no-work or dry-run path if supported.
- Trigger the first target-machine gate command and inspect the JSON report.
- Confirm the report status is one of the gate's closed statuses.

## Recovery Plan

- Disable `ExampleGate-*` scheduler tasks on the target host.
- Confirm the target host has no active healthy gate lock.
- Preserve target reports and logs for diagnosis.
- Remove or quarantine incomplete controller state only after reports are saved.
- If another runner exists, re-enable it only after lock state and live PR head/base are rediscovered.

## Open Questions

- Confirm whether the first target-machine run should be idle-only or allowed to process one ready PR.
- Confirm whether the target machine should host multiple gate controllers or only one.
- Confirm the retention period for reports, logs, Docker images, and worktrees.
