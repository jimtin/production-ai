# Observability and Error Instrumentation Checklist

Assess the repo's existing setup. Report gaps and recommended improvements without forcing a universal provider.

## Inventory

Inspect for:

- Error capture providers: Sentry, OpenTelemetry, Vercel Observability/Logs, Datadog, Honeycomb, Logtail, Axiom, custom logger, or repo-specific wrappers.
- Framework hooks: Next.js `global-error`, route `error` files, API/route-handler try/catch wrappers, middleware logging, server action error handling, background job error hooks, unhandled rejection handling where applicable.
- Client safeguards: React error boundaries, user-safe fallback states, form validation errors, loading/empty/error states, retry behavior, and browser test coverage for common failure paths.
- Server/runtime safeguards: structured logging, correlation/request IDs, sanitized error responses, webhook failure capture, cron/job failure capture, upload/parser failures, provider timeout and retry logging.
- Production operations: alerting thresholds, on-call/channel routing, dashboard or log query links, runbooks, incident notes, and daily runtime monitor coverage where applicable.

## Privacy and Log Hygiene

Flag any evidence of:

- Logging names, emails, raw user IDs, tenant secrets, tokens, session cookies, API keys, payment details, document text, raw file contents, or sensitive URLs.
- Sending PII or secrets in analytics/custom-event payloads.
- Console logging in production code without a structured logger or redaction layer.
- Catch blocks that swallow errors without telemetry, user-safe state, or retry/dead-letter behavior.
- Error messages that expose internal stack traces, SQL, provider credentials, or storage object names to users.

## Client Review

Check whether:

- Every changed or critical route has a user-safe error state.
- Route-level and global errors are captured and do not leave blank screens.
- Browser/E2E tests cover success, validation, permission, empty, loading, and failure states where practical.
- Responsive layouts remain usable when error messages, long labels, or translated-length copy appear.

## Server and Background Review

Check whether:

- API routes, server actions, webhooks, uploads, parsers, payments, auth callbacks, and admin mutations capture failures with enough context to debug safely.
- Provider calls have timeouts, retry/backoff policy, and clear user-facing failure behavior.
- Background jobs and scheduled tasks surface failures outside local logs.
- Database migration failures and schema drift are visible before dependent code is reported ready.

## Reporting Required

For observability, include:

1. Current instrumentation found.
2. Runtime surfaces covered and not covered.
3. Privacy/logging risks.
4. Alerting or monitoring evidence.
5. Recommended provider-agnostic improvements.
6. Tests needed to prove error behavior.
7. Any access, auth, or production-data limits that blocked verification.
