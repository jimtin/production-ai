# pr-gate-runner-setup

**The failure this prevents:** an agent treats a new machine as "basically ready", copies a PR gate onto it, then discovers the scheduler uses a different runtime, Docker cannot build unattended, public skills are missing, secrets are incomplete, or the repo never had a confirmed local proof foundation.

This skill sets up a new machine as a PR Gate Runner. It starts with the public Production AI skills, progressively maps the environment, installs only the missing pieces, and proves readiness with a closed PR gate status.

## What it does

For a new runner host, the skill:

1. Bootstraps the public skill library and installs the public skills needed for setup.
2. Builds an environment profile before installing anything machine-specific.
3. Classifies the host as blank, partial, existing runner, or blocked.
4. Checks Docker, Compose, disk, Buildx, runtime PATH, Git, provider auth class, scheduler context, and filesystem behavior.
5. Confirms the target repo has a testing foundation before deployment automation is installed.
6. Clones, copies, or syncs the approved standalone gate controller source.
7. Coordinates conservative Docker cleanup through `docker-disk-cleanup`.
8. Plans scheduler tasks, healthchecks, maintenance, logs, and readback commands.
9. Requires at least one closed gate status from the target machine before setup is complete.
10. Produces a private setup report or sanitized public example using the bundled renderer.

## Why public skills come first

The new machine should not inherit private assumptions from the source environment. Installing the public skills first gives the agent the same operating contracts every time: testing foundation, production gate policy, Docker cleanup, readiness preflight, and threat modeling.

After that, the agent can inspect the machine and decide what to install. A Windows WSL machine, a Linux laptop, and a small server might need different runtime, scheduler, Docker, and path work, but they should all follow the same proof sequence.

## The bundled tool

`scripts/render-setup-report.mjs` renders structured JSON into the report shape used by the skill. It includes built-in redactions for common token prefixes, private key blocks, local home paths, and private network addresses, plus caller-provided redactions for environment-specific names.

Run it with:

```bash
node skills/pr-gate-runner-setup/scripts/render-setup-report.mjs setup-input.json > setup-report.md
```

Run tests with:

```bash
node --test skills/pr-gate-runner-setup/scripts/*.test.mjs
```

The JSON contract lives in `skills/pr-gate-runner-setup/references/report-contract.md`.

## Design choices worth stealing

- **Public bootstrap first.** The runner starts from public skills, not private memory.
- **Progressive understanding.** Unknowns stay explicit until the host proves them.
- **Install from gaps.** The plan installs only what the environment profile shows is missing.
- **Scheduler context matters.** Manual shell checks are not enough when scheduled jobs resolve different PATH entries, credentials, mounts, or Docker config.
- **Closed status required.** Installation is not completion. The new runner must produce a closed gate status, even if it is a cheap idle status.
- **Presence-only secrets inventory.** Reports can say a token file exists and has restrictive permissions; they must not include the value.

## Install

```bash
scripts/install-skill.sh pr-gate-runner-setup
```

Then invoke it directly:

```text
Use $pr-gate-runner-setup to set up this new machine as a PR Gate Runner.
```

## Adapt it

- Replace Windows Task Scheduler with cron, launchd, systemd timers, or another runner-native scheduler, but keep readback and lock discipline.
- Add platform-specific checks for remote Docker daemons, self-hosted runners, WSL, or virtualization layers.
- Keep public examples as documentation artifacts only; private reports should remain local and scanned before any publication.
