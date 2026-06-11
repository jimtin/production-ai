---
name: error-logging-instrumentation
description: Vercel-first, provider-aware review and remediation workflow for web app error logging. Use when a user asks to audit, add, fix, harden, or verify logging, error capture, runtime observability, error boundaries, structured logs, correlation IDs, alerting evidence, or production debuggability in an existing web app.
---

# Error Logging Instrumentation

## Purpose

Use this skill to decide whether an existing web app has enough error logging to debug production failures safely, then patch gaps when the user asks for remediation. The default stance is Vercel-first and provider-aware: prefer the app's existing logging/error provider and Vercel runtime patterns before proposing a new vendor.

## Operating Rules

- Start from repo truth: instructions, package scripts, routes, API handlers, server actions, jobs, auth, upload/parsing surfaces, deployment config, tests, and existing logging code.
- Use `$full-app-review` for broad non-mutating app audits. Use this skill for the deeper observability/error-logging workstream or for remediation.
- Use Vercel observability patterns first when the repo is Vercel/Next.js based. Use `vercel:observability` for Vercel-specific logs, drains, OpenTelemetry, dashboards, and production log checks when available.
- Do not add Sentry, Datadog, Axiom, Logtail, Honeycomb, or another provider unless the repo already uses it or the user explicitly approves.
- Do not log secrets, PII, raw document/file contents, raw prompts, tokens, cookies, session IDs, payment details, or full provider payloads.
- For code changes, add targeted unit, integration, and browser/E2E coverage for each changed failure path. Run `$test-readiness-preflight` before expensive gates.
- Before push-readiness, run `$security-threat-model` for logging/privacy surfaces, dependency audit, and a repo-root scoped gitleaks scan.

## Workflow

1. **Baseline the app.**
   - Read repo instructions and canonical local/container gates.
   - Identify framework, deployment target, route tree, API/server actions, background jobs, auth, storage, uploads, external providers, admin paths, and tests.
   - Run `scripts/logging_inventory.py <repo> --format markdown` when useful for a static first pass. Treat it as evidence collection only, not a sufficiency decision.

2. **Map critical failure surfaces.**
   - Use `references/coverage-matrix.md`.
   - Include client routes, API handlers, server actions, webhooks, cron/jobs, admin mutations, uploads/parsers, payments, auth callbacks, database migrations, provider calls, and deployment/runtime failures.
   - For each surface, record the failure, user impact, operator question, current logging/capture evidence, and missing proof.

3. **Evaluate sufficiency.**
   Logging is sufficient only when an operator can identify what failed, where it failed, why it likely failed, affected category/scope, retry/dead-letter status where relevant, and the next action without exposing sensitive data.
   - Structured logs or provider events include safe context such as route/action, operation name, coarse role/tenant category, request/correlation ID where available, provider name, status code, duration, retry count, and sanitized error class/message.
   - Users receive safe fallback states or sanitized errors.
   - Critical failures are surfaced outside local logs through Vercel logs/drains, an existing error provider, alerting, dashboards, or documented manual log queries.
   - Tests prove both the failure behavior and the expected logging/capture call where practical.

4. **Remediate gaps.**
   - Prefer existing logger/error-reporting wrappers. If none exist, add a small local wrapper instead of scattering ad hoc `console.*`.
   - Keep logging close to the boundary that knows the useful context: route/action/job/webhook/provider adapter.
   - Add redaction/normalization before logs leave the process.
   - Preserve stack traces for server-side operators only; never expose internals to users.
   - Add retries, timeouts, dead-letter capture, or alert routing only when the current failure mode needs it.
   - Read `references/remediation-patterns.md` and `references/privacy-redaction.md` before editing.

5. **Verify and report.**
   - Read `references/verification-checklist.md`.
   - Run focused tests for changed failure paths before the full local/container gate.
   - Report current instrumentation found, surfaces covered/not covered, privacy risks, alerting/monitoring evidence, commands run, coverage status, residual gaps, and any provider access limits.

## Output Expectations

For audits, lead with findings ordered by severity and include evidence paths. For remediation, completion reports must include changed logging surfaces, tests added, focused test results, full local/container gate status, `$security-threat-model` status when push-readiness is in scope, gitleaks status, dependency audit status, and any remaining production-only validation gaps.

## References

- `references/coverage-matrix.md`: failure-surface checklist.
- `references/privacy-redaction.md`: safe and unsafe log payload rules.
- `references/remediation-patterns.md`: Vercel/Next.js-first and provider-neutral implementation patterns.
- `references/verification-checklist.md`: proof requirements.
