# PR Gate Runner Setup Report Contract

Use this contract for new-machine runner setup plans and sanitized public examples. The report should show how the agent built understanding progressively before installing or changing anything.

## Required Sections

Every report must include:

1. **Status header** with title, verdict, updated date, and whether the report is private or sanitized.
2. **Environment profile** naming runner, repo, gate, platform, access route, scheduler, skill source, and deployment model.
3. **Executive summary** with current state, exact blocker, and next action.
4. **Public skill bootstrap** listing the public skills installed or required before machine-specific work.
5. **Progressive discovery** for access, host OS, runtime PATH, Docker, disk, Git/provider auth, repo foundation, gate controller, secrets, locks, scheduler, and security.
6. **Acceptance ledger** mapping requirements to intended changes, proof, status, and blockers.
7. **Install plan** with ordered steps derived from discovered gaps.
8. **Docker cleanup plan** including inspection commands, scope, active-service safeguards, and expected retention.
9. **Scheduler plan** with task names, cadence, working directory, env loader, logs, and readback.
10. **Verification plan** from public-skill readback through the first closed gate status.
11. **Recovery plan** naming how to disable tasks, preserve evidence, and recover if setup fails.
12. **Open questions** only for decisions that cannot be discovered safely.

## Status Vocabulary

Use one of these report-level statuses:

- `DRAFT - not confirmed`: discovery is useful but setup is not approved or complete.
- `READY - awaiting install`: public skills and prerequisites are verified; installation remains.
- `BLOCKED`: a required condition is missing or unsafe.
- `SETUP COMPLETE`: the new runner has produced a closed gate status and recovery is defined.

Use these ledger statuses:

- `pending`
- `planned`
- `partial`
- `implemented`
- `verified`
- `blocked`
- `not-applicable`

## Sanitization Rules

Public reports must replace:

- real usernames with `runner`
- real hostnames with `example-runner`
- real IPs with documentation ranges such as `192.0.2.10`
- real repo names with `example-web-app`
- real gate names with `example-web-pr-gate`
- real absolute paths with `/home/runner/pr-gate/controllers/example-web-pr-gate`
- real key paths with `~/.ssh/example_runner_key`
- tokens, provider IDs, webhook URLs, and log excerpts with `[redacted]`

Sanitized reports may mention the class of secret, not the value:

- `github-token`: present, mode `600`
- `deploy-token`: present, mode `600`
- `automation-bypass-secret`: present, mode `600`

Do not include copied provider logs, secret scan findings, raw `.env` files, private report paths, real scheduler task names from a private machine, or private skill names.

## JSON Input Shape

`scripts/render-setup-report.mjs` accepts this shape:

```json
{
  "title": "Example PR Gate Runner Setup Report",
  "status": "DRAFT - not confirmed",
  "updated": "2026-06-18",
  "visibility": "sanitized",
  "profile": {
    "runner": "example-runner",
    "repo": "example-org/example-web-app",
    "gate": "example-web-pr-gate",
    "platform": "Windows 11 with WSL2 Ubuntu",
    "access": "SSH to host, then WSL user shell",
    "scheduler": "Windows Task Scheduler launching WSL",
    "skillSource": "Public production-ai checkout",
    "deploymentModel": "local PR production gate"
  },
  "summary": [
    "Public skills are planned as the setup baseline.",
    "Setup remains blocked until env material and scheduler tasks are installed."
  ],
  "bootstrap": [
    "Install pr-gate-runner-setup.",
    "Install pr-production-gate."
  ],
  "discovery": [
    {
      "area": "Docker",
      "status": "verified",
      "evidence": "Docker engine and Compose respond from the scheduler user context."
    }
  ],
  "acceptance": [
    {
      "requirement": "Public skill baseline",
      "change": "Install required public skills.",
      "evidence": "Skill install readback lists expected skills.",
      "status": "planned"
    }
  ],
  "installPlan": ["Create base runner directories.", "Render and validate config."],
  "dockerCleanup": ["Run Docker usage inspection first.", "Prune only stale gate-scoped resources."],
  "scheduler": ["Install one gate task and one healthcheck task.", "Read back both tasks after install."],
  "verification": ["Skill install readback passes.", "First target-machine run exits with a closed status."],
  "recovery": ["Disable scheduler tasks.", "Preserve reports and logs."],
  "openQuestions": ["Confirm whether the first run should be idle-only."],
  "redactions": [
    { "pattern": "internal-hostname", "replacement": "example-runner" }
  ]
}
```

Unknown fields are ignored. Missing optional arrays render as `None recorded.`
