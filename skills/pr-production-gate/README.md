# pr-production-gate

**The failure this prevents:** "CI is green" quietly becoming "deploy it" — when green meant *some* checks passed, on a commit that may no longer be the branch head, with external services live instead of mocked, and nobody re-verifying what actually shipped. Add an autonomous agent to that pipeline and the gap between "approved" and "proven" becomes the whole risk.

This skill is the contract for a fully automatic, fail-closed PR review and production deployment gate that runs on your own machine. The architecture write-up lives at [docs/patterns/pr-production-gate.md](../../docs/patterns/pr-production-gate.md).

## What it does

Defines the required behavior for a scheduled gate that:

1. **Discovers** open PRs (skipping drafts, wrong bases, untrusted authors, already-processed SHAs).
2. **Locks the head SHA** before checkout and re-checks it before deploy — reviews approve commits, not branches.
3. **Validates entirely in containers**: static checks, ≥90% unit coverage, critical-path integration, browser/E2E for user actions, dependency audit, image scan, production build, runtime smoke, repo-scoped secret scan.
4. **Mocks every external service** during review — auth, payments, email, storage, LLMs, queues, webhooks — and treats live-provider calls as failures.
5. **Decides**: failures get `REQUEST_CHANGES` with redacted evidence; passes ride the promotion train (preview branch → observed deployment → smoke → main → observed → production smoke), with the same reviewed candidate at every stage.
6. **Learns**: recurring failure signatures, missing mocks, and setup requirements update a per-repo learning profile read by the next run.

## The design choices worth stealing

- **Fail closed as the default outcome.** Missing, inconclusive, host-only, or moving-SHA proof = no deploy. The gate never extends benefit of the doubt.
- **Review containers get no production secrets.** Credentials exist only in post-validation promotion containers, after every gate passed for the locked SHA. A malicious PR that compromises the review environment finds nothing worth stealing.
- **The host only schedules.** Everything consequential happens in containers, which makes the gate reproducible and keeps the host's credentials out of reach of reviewed code.
- **Preview must prove out before main advances.** Deployment *observation* — waiting for the platform to confirm the matching deployment, then smoking it — is a required stage, not a courtesy.
- **Fork PRs are review-only.** Untrusted authors can receive feedback; they cannot reach the deploy path without explicit per-repo risk acceptance.
- **Redacted comments.** Review bodies carry decisions and evidence summaries — never raw logs, scan findings, or provider payloads.

## Install

```bash
cp -R skills/pr-production-gate ~/.codex/skills/
```

Start from [templates/pr-gate.config.example.json](../../templates/pr-gate.config.example.json) (intentionally inert) and schedule with [templates/automation.toml.example](../../templates/automation.toml.example).

## Adapt it

- Map the promotion train to your platform — the preview/production branch pattern is an example shape, not a requirement.
- Keep the references (`safety-checks.md`, `repo-config-schema.md`, `deployment-policy.md`, `review-comment-template.md`) as your gate's living spec.
- Threat-model your implementation before trusting it with deploy credentials — it is the most privileged automation you'll run.
