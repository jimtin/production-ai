# error-logging-instrumentation

**The failure this prevents:** production breaks at 2am and the only artifact is a toast that said "Something went wrong." No correlation ID, no operation name, no provider status — or the opposite failure: logs so enthusiastic they contain user emails, tokens, and raw document contents, which is now an incident of its own.

This skill audits (and on request, fixes) error logging against one standard: *can an operator answer "what failed, where, why, for whom, and what next" without reading sensitive data?*

## Video

Published companion: [What If Your AI Code Fixed Its Own Tech Debt?](https://www.youtube.com/watch?v=_lQJIqvI8_s) introduces logging as part of the Production AI proof system this skill hardens.

## What it does

1. **Baseline the app**: framework, routes, server actions, jobs, auth, uploads, providers, existing logging. A static inventory script (`scripts/logging_inventory.py`) collects evidence — explicitly evidence only, never the sufficiency verdict.
2. **Map critical failure surfaces** with the coverage matrix: API handlers, webhooks, cron, admin mutations, parsers, payments, auth callbacks, migrations, provider calls.
3. **Evaluate sufficiency** per surface: failure, user impact, operator question, current evidence, missing proof.
4. **Remediate** (only when asked): existing logger wrappers first, context at the boundary that knows it, redaction before logs leave the process, stack traces for operators only.
5. **Verify**: focused tests proving both the failure behavior *and* the logging call.

## The design choices worth stealing

- **Operator questions as the sufficiency bar.** Not "is there a log line" but "can an operator identify what failed, where, why, affected scope, retry status, and next action." Coverage is judged against questions, not line counts.
- **Provider-aware, not provider-pushy.** The skill works with the app's existing logging/error provider and platform patterns; adding a new vendor requires explicit user approval. (Agents *love* adding Sentry to everything.)
- **The redaction reference is a contract.** `references/privacy-redaction.md` enumerates safe context (route, operation, coarse role, correlation ID, status, duration, sanitized error class) versus banned payloads (PII, tokens, cookies, raw prompts, file contents) — so "log more" never quietly becomes "leak more."
- **Tests prove the logging.** Changed failure paths get tests asserting the capture call fires with safe context — logging that exists only until the next refactor isn't observability.
- **It threat-models itself.** The skill ships with its own threat-model file, because a tool that rewrites what your app logs is itself a privacy attack surface.

## Install

```bash
scripts/install-skill.sh error-logging-instrumentation
```

Triggers on audit/add/fix/harden requests for logging, error capture, observability, error boundaries, production debuggability.

## Adapt it

- Swap the platform-first remediation patterns (`references/remediation-patterns.md`) for your stack's idioms.
- Extend the redaction rules with your compliance reality (HIPAA/PCI add categories).
- Wire the coverage matrix into incident postmortems: every "we couldn't see it" finding becomes a matrix row.
