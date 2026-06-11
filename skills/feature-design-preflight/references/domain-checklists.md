# Domain Checklists

Use only the sections that match the feature. These are prompts for reasoning, not mandatory architecture choices.

## Uploads, Media, and Video

- Expected file size, duration, formats, codecs, MIME types, and upload frequency
- Direct-to-storage, signed upload, hosted upload widget, multipart/resumable upload, or proxied upload
- Progress, pause/resume, retry, cancel, duplicate submission, timeout, and slow-network behavior
- Virus/malware scanning, MIME sniffing, extension mismatch, file validation, and content moderation
- Ownership, tenant isolation, access control, private/public URLs, expiration, and signed playback
- Transcoding, thumbnailing, metadata extraction, captions, processing state, webhooks, and background jobs
- Storage lifecycle, retention, deletion, orphan cleanup, quotas, billing, and admin visibility
- Browser/E2E tests with oversized files, invalid files, interrupted upload, permission denial, retry, processing delay, and success playback

## PDFs, Documents, and File Parsing

- Required operations: view, upload, parse text, extract images, merge, split, annotate, convert, sign, generate, redact, or OCR
- File types, password-protected files, corrupt files, large files, scanned documents, fonts, images, forms, and embedded content
- Library support in the target runtime, native dependencies, binaries, WASM, worker threads, memory, and container compatibility
- Security risks from untrusted parsers, path traversal, decompression bombs, malicious PDFs, macros, embedded links, and metadata leakage
- Fallbacks for unsupported files and user-facing error messages
- Golden fixtures for representative files, including malformed and large samples
- Unit tests for pure parsing/validation, integration tests for storage and database flow, and E2E tests for the user workflow

## External APIs and Hosted Providers

- API contract, authentication, scopes, rate limits, quotas, pagination, idempotency, retries, timeouts, and webhooks
- Sandbox/test mode availability and local deterministic test doubles
- Data ownership, deletion, export, privacy, audit logs, and regional constraints
- Provider outage, partial success, delayed processing, duplicate webhook, stale status, and version changes
- Cost behavior and whether the implementation can accidentally create expensive loops
- Contract tests or mocked integration tests for success, rate limit, timeout, bad credentials, malformed response, and webhook duplication

## Long-Running Work and Background Jobs

- What must be synchronous versus asynchronous
- Queue, worker, scheduler, cron, webhook callback, polling, or durable workflow choice
- Job idempotency, dedupe keys, retry policy, backoff, dead-letter handling, cancellation, timeout, and progress reporting
- User-visible states: queued, processing, retrying, failed, expired, canceled, complete
- Operational controls: admin retry, audit trail, logs, metrics, alerts, and cleanup
- Tests for retry, duplicate events, timeout, cancellation, crash recovery, and status transitions

## Data Migrations and Model Changes

- Classify each release step as expand, deploy, or contract
- Backward compatibility with the currently deployed app and currently deployed production schema
- Zero-downtime rollout, old data migration, new constraints, generated clients, and seed data
- Verification that the target database migration is applied before any code that depends on it is deployed
- Rollback path that works with both pre-migration and post-migration schema states
- Data repair plan, backfill plan, lock/concurrency risk, and feature flags when needed
- Avoid same-release destructive drops, renames, non-null constraints without defaults/backfills, enum narrowing, policy changes, or generated-client-only assumptions unless the repo has a proven safe release mechanism
- Fixtures/factories updated with new required fields and realistic edge cases
- Integration tests around old records, new records, permission boundaries, migration results, and app behavior before/after the migration

## Auth, Permissions, and Portals

- Roles, ownership, tenant boundaries, admin/user/superadmin differences, impersonation, and audit requirements
- Unauthorized, unauthenticated, expired session, revoked access, and cross-tenant attempts
- UI flow clarity, minimized clicks, error states, empty states, and admin recovery controls
- Browser tests for each relevant role and denied action
- Use `$frontend-design-quality` for UI and `$security-threat-model` for trust boundaries.

## Payments, Billing, and Webhooks

- Source of truth, idempotency keys, retries, duplicate webhooks, delayed webhooks, refunds, cancellation, disputes, trials, and plan changes
- Test mode versus live mode isolation
- Ledger/audit records and reconciliation
- Tests for webhook ordering, duplicate events, failed payment, canceled subscription, and permission changes after billing events
- Use `$security-threat-model` before implementation decisions are final.

## AI, LLM, and Generated Content

- Model/provider choice, prompt ownership, structured output guarantees, token limits, latency, cost caps, retries, and fallback behavior
- User data privacy, retention, redaction, prompt injection, tool permissions, and generated content moderation
- Persistence, traceability, regeneration, cancellation, and partial streaming states
- Tests for schema violations, provider timeout, refusal/empty output, tool failure, and cost guardrails
