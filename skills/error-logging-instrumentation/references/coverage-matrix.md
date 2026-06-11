# Error Logging Coverage Matrix

Use this matrix to map critical failures before judging sufficiency. Each row should capture: surface, failure mode, user impact, operator question, current evidence, missing instrumentation, tests needed, and severity.

## Client and UI

- Route-level render failures, global error handlers, React error boundaries, and empty/loading/error states.
- Form validation, failed submissions, optimistic mutation rollback, retry affordances, and permission-denied states.
- Browser console errors that indicate broken assets, failed fetches, hydration issues, or uncaught client exceptions.

## Server and API

- API routes, route handlers, server actions, loaders, mutations, and RPC endpoints.
- Auth callbacks, session refresh, role/tenant checks, rate limits, and permission failures.
- Sanitized error responses for users plus structured operator logs with route/action, status, duration, request/correlation ID, and safe error class.

## Admin and Operations

- Admin mutations, impersonation or support tooling, bulk actions, exports, imports, and destructive operations.
- Audit trails and error logs must distinguish user-safe public failures from operator-only details.

## Uploads, Parsing, and Media

- File uploads, virus/type/size validation, storage writes, parser failures, transcoding, OCR, PDF/doc/video processing, and cleanup.
- Logs should include safe file category, size bucket, processing stage, provider, duration, and retry/dead-letter status. Do not log filenames, object keys, document text, raw prompts, or raw file contents unless explicitly approved and redacted.

## Payments, Webhooks, and External Providers

- Payment creation, checkout redirects, subscriptions, webhook verification, idempotency, provider timeouts, quota/rate limits, and partial failures.
- Logs should include provider, operation, status/category, idempotency result, retry count, and sanitized provider error. Do not log card data, provider secrets, raw webhook payloads, or customer PII.

## Background Jobs and Cron

- Scheduled tasks, queues, durable workflows, sync jobs, retries, dead letters, lock contention, and long-running operations.
- Failures must surface outside local logs through Vercel runtime logs/drains, an existing provider, alerting, dashboards, or documented operator queries.

## Database and Migrations

- Connection failures, transaction failures, constraint violations, migration drift, seed/reset failures, and schema incompatibility.
- Logs should distinguish operational failure from user input failure and avoid SQL with sensitive values.

## Deployment and Runtime

- Vercel build/runtime logs, function timeouts, memory pressure, cold-start sensitive code, missing env vars, edge/node runtime mismatches, and post-deploy smoke failures.
- For production readiness, record how early runtime errors will be detected after deploy.
