# Verification Checklist

Use the repo's canonical local/container gate for final proof. Before that, run the cheapest targeted tests that exercise the changed failure paths.

## Focused Proof

- Unit tests for error normalization, redaction, field allowlists, logger wrappers, and retry/error classification.
- Integration tests for API routes, server actions, provider adapters, webhooks, uploads, jobs, and database boundaries that now log or capture errors.
- Browser/E2E tests for user-visible failure states, validation errors, permission failures, retry flows, and no blank-screen route failures.
- Module-mock assertions that expected logger/provider calls happen with safe payloads and without sensitive fields.

## Vercel and Provider Proof

- Confirm Vercel runtime log access path when Vercel is in scope: Dashboard, CLI, MCP/REST, drain, or documented operator query.
- Confirm existing Sentry/Datadog/Axiom/Logtail/Honeycomb/etc. capture paths when those providers are already present.
- If provider-managed encrypted secrets block local proof, run all secret-independent local gates and report the remote-only validation gap.

## Privacy and Security Proof

- Test that token, cookie, authorization, password, secret, email, name, raw user ID, tenant ID, payment, file content, and raw URL fields are dropped or redacted.
- Run `$security-threat-model` for logging/privacy surfaces before push-readiness.
- Run the repo's dependency audit if dependencies changed.
- Run the repo's secret scan. If no wrapper exists, use a repo-root scoped containerized gitleaks scan.

## Completion Report

Include:

- Current instrumentation found.
- Critical surfaces covered and not covered.
- Code paths changed and tests added.
- Focused test and full local/container gate results.
- Coverage result or where coverage was enforced.
- Integration and E2E/browser proof.
- Vercel/provider log verification status.
- `$security-threat-model`, gitleaks, and dependency audit status when push-readiness is in scope.
- Known residual risk and production-only validation gaps.
