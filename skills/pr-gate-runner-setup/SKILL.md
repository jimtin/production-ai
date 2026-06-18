---
name: pr-gate-runner-setup
description: Set up a PR Gate Runner on a new machine by bootstrapping from the public production-ai skills, progressively discovering the target environment, installing only the missing host/runtime/gate pieces, and proving the runner with a closed $pr-production-gate status. Use when preparing Windows WSL, Linux laptop, mini PC, or server hosts to run local PR review and deployment gates with Docker cleanup, scheduler, secrets inventory, approved gate-controller sync, validation, and public-safe setup reports.
---

# PR Gate Runner Setup

## Purpose

Use this skill to set up a new machine as a PR Gate Runner. The agent must start from the public skill library, build a progressive understanding of the target environment, then install and verify the runner from that evidence.

This skill does not assume the machine is ready. It turns an unknown host into a known runner by layering discovery, public skills, host prerequisites, gate installation, scheduler setup, and first-run proof.

## Operating Rules

- Start from public Production AI skills and public repo artifacts. Do not depend on private machine paths, private reports, or client-specific skills.
- Discover before installing. Each setup step must be justified by the current environment profile.
- Use `$repo-testing-setup` if the target repo lacks a confirmed containerized testing foundation.
- Use `$pr-production-gate` for gate behavior, closed statuses, exact-SHA proof, and deployment policy.
- Use `$docker-disk-cleanup` when Docker disk pressure, stale images, or active service preservation matters.
- Use `$test-readiness-preflight` before expensive validation or the first scheduled run.
- Use `$security-threat-model` when secrets, scheduler jobs, host trust boundaries, provider credentials, deploy branches, or public docs are touched.
- Never print secret values. Record only presence, path class, file mode, source of truth, and missing classes.
- A new runner is not ready until it produces one closed gate status from the target machine, even if that status is `no_eligible_prs`.

## Progressive Setup Workflow

1. **Bootstrap public skills.** Locate or clone the public skill library, install the needed skills with the repo's public install script, and confirm the target agent can load them. Start with this skill, `$repo-testing-setup`, `$pr-production-gate`, `$docker-disk-cleanup`, `$test-readiness-preflight`, and `$security-threat-model`.
2. **Create the environment profile.** Record host platform, access route, shell, user, filesystem, timezone, scheduler type, Docker availability, runtime availability, Git/auth state, disk headroom, and network constraints. Unknowns stay `pending`; do not infer them.
3. **Classify the host.** Mark the machine as `blank`, `partial`, `existing-runner`, or `blocked`. A partial host may already have Docker, runtime bundles, tokens, or a controller checkout.
4. **Install prerequisites from gaps.** Install or configure only what the environment profile proves is missing: Docker/WSL integration, runtime PATH, Git, SSH, package manager, base directories, log directories, and scheduler support.
5. **Confirm repo foundation.** If the repo does not already have confirmed testing artifacts and a canonical containerized gate, route to `$repo-testing-setup` before installing deployment automation.
6. **Install or sync the gate.** Clone, copy, or sync the approved standalone gate controller source. Preserve local-only ignore rules, report roots, worktree roots, state directories, and secret boundaries. The setup plan must prove the resulting controller on this machine.
7. **Configure secrets safely.** Create local-only env files from approved secret sources. Verify presence and restrictive permissions without logging values.
8. **Run cheap proof.** Render config, validate config, check no-work/dry-run path if supported, and prove Docker pulls/builds from the same user context that will run the scheduler.
9. **Plan host hygiene.** Apply `$docker-disk-cleanup` only after inspecting active containers and Docker usage. Cleanup supports readiness; it is not gate proof.
10. **Install scheduler.** Add idempotent run, healthcheck, and maintenance jobs with readback proof for command, working directory, cadence, user, environment loader, and logs.
11. **Prove readiness.** Run the scheduled command manually or trigger the scheduler once, then inspect the JSON report for exactly one closed gate status.
12. **Hand off.** Save the private setup report, sanitized public report if needed, install commands used, open blockers, and the exact recovery steps.

## Environment Profile

Maintain this profile while working:

| Area | Evidence to collect | Status |
|---|---|---|
| Public skills | Skill library location, install command, installed skill list | pending |
| Access | Login route, shell, user, working directory | pending |
| Platform | OS, WSL/distro or Linux release, timezone, filesystem class | pending |
| Runtime | Node or repo runtime, package manager, PATH source | pending |
| Docker | Engine, Compose, Buildx, disk usage, credential helper behavior | pending |
| Git/provider auth | Git, SSH or token auth, repo access, no secret values | pending |
| Repo foundation | Testing artifacts, canonical container gate, hook model | pending |
| Gate controller | Controller path, config, reports, worktrees, state, locks | pending |
| Scheduler | Scheduler type, tasks, env loader, logs, healthcheck | pending |
| Security | Secret file classes, permissions, public-doc redactions | pending |

Do not replace `pending` with `verified` until there is direct evidence from the target machine.

## Required Checks

- Public skills are available before private or repo-specific setup begins.
- The target host profile is explicit enough to explain every install decision.
- Docker daemon and Compose work from the exact user context that will run the scheduler.
- Runtime PATH resolves to the intended runtime, not an accidental mounted or stale runtime.
- Repo testing foundation is confirmed before deployment automation is installed.
- Gate config renders and validates on the target machine.
- Secret values never appear in terminal output, reports, docs, or logs.
- No healthy gate lock is bypassed or hand-deleted.
- Scheduler jobs are idempotent and have readback proof.
- Docker cleanup is scoped and preserves active services.
- First target-machine run exits with exactly one closed gate status.
- Public examples and docs contain only placeholders.

## Report Renderer

Use `scripts/render-setup-report.mjs` when you have structured discovery data and want a repeatable Markdown report:

```bash
node skills/pr-gate-runner-setup/scripts/render-setup-report.mjs setup-input.json > setup-report.md
```

The script accepts JSON shaped by `references/report-contract.md`, applies built-in and caller-provided redactions, and prints a Markdown setup report with environment profile, public skill bootstrap, progressive discovery, acceptance ledger, install plan, Docker cleanup, scheduler, verification, recovery, and open questions.

## Completion Blockers

- Public skills are unavailable or cannot be installed on the target machine.
- Target host access cannot be proven without exposing credentials.
- Docker cannot run from the scheduler user context.
- Required runtime cannot be made deterministic for scheduled runs.
- Repo testing foundation is absent and `$repo-testing-setup` has not completed.
- Gate config cannot render or validate on the target machine.
- Required secret classes or env material are missing.
- The target runner has not produced a closed gate status.
- Public output contains real host, repo, user, path, IP, token, client, provider, or report identifiers.

## Example Prompts

- "Use `$pr-gate-runner-setup` to prepare this new Windows WSL machine as a PR Gate Runner."
- "Set up a fresh Linux mini PC to run the local PR production gate."
- "Build a progressive environment profile for this new gate runner and install only what is missing."
- "Create a sanitized setup report for a public example after configuring a runner."

## References

- `references/report-contract.md`: setup report sections, statuses, redaction rules, and JSON input shape.
- `references/threat-model.md`: threat model for new runner setup and public reporting.
- `scripts/render-setup-report.mjs`: deterministic Markdown report renderer for sanitized setup reports.
