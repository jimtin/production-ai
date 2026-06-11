# Remediation Patterns

Prefer the narrowest change that makes the failure debuggable and safe. Reuse existing repo patterns before introducing abstractions.

## Vercel and Next.js First

- Use `instrumentation.ts` for supported app-wide instrumentation and OpenTelemetry hooks when the repo already uses them or the Vercel stack needs them.
- Use route-level `error.tsx` and `global-error.tsx` for user-safe React/App Router failure states.
- In API route handlers and server actions, log at the boundary with route/action, operation, status, duration, and sanitized error context.
- For Vercel runtime proof, use Dashboard/CLI/API log checks through `vercel:observability` or `vercel:vercel-api` when provider access is available.
- For post-deploy checks, scan recent runtime errors only after local/container gates have passed.

## Provider-Aware Fallbacks

- If the repo already uses Sentry, Datadog, Axiom, Logtail, Honeycomb, Pino, Winston, or another wrapper, route new capture through that wrapper.
- If no wrapper exists, create a small local module that normalizes errors, redacts unsafe fields, and emits structured `console.error(JSON.stringify(...))` for server/runtime logs.
- Keep client capture minimal and privacy-safe. Do not send raw form values, URLs with query strings, user identifiers, or free text.

## Boundary Patterns

- Provider calls: capture provider, operation, status, duration, retry count, timeout category, and sanitized provider error.
- Webhooks: capture verification failure category, event type if safe, idempotency result, and handler outcome. Do not log raw payloads or signatures.
- Uploads/parsers: capture file category, size bucket, processing stage, storage/provider, duration, and cleanup outcome. Do not log filenames or object keys.
- Jobs/cron: capture job name, run ID/correlation ID, stage, retry count, dead-letter outcome, and next scheduled/retry state.
- Auth/admin: capture role category, permission result, route/action, and sanitized denial reason. Do not log identities or session material.

## Anti-Patterns

- Swallowing `catch` blocks with only a user-facing fallback.
- Scattering raw `console.log` or `console.error` calls without redaction.
- Adding a vendor SDK to solve one missing log line.
- Logging entire request bodies, provider errors, database errors, webhook payloads, or uploaded content.
- Treating a build pass as proof that runtime failures are observable.
