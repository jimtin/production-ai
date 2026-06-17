# Surface Checklists

Use this as a prompt list while inspecting code. Only include items with target evidence in the
report.

## Next.js, React, and Web Apps

- Server Actions, route handlers, middleware, API routes, and edge/runtime splits.
- Session creation, cookie flags, CSRF posture, role checks, and object-level authorization.
- Tenant or workspace scoping in queries, cache keys, storage paths, search indexes, and analytics.
- File upload, parser, image/video/PDF/document processing, and cleanup paths.
- Browser-only trust mistakes: hidden fields, disabled buttons, client-side role checks, and form
  validation without server enforcement.
- Webhook handlers: signature checks, replay protection, idempotency, event ordering, and logging.

## Agent, LLM, and Tool-Calling Systems

- Prompt/tool boundary: untrusted content flowing into tool names, arguments, filesystem paths,
  shell commands, database queries, or third-party API calls.
- Retrieval and transcript data: cross-user leakage, stale memory, poisoned instructions, and
  persistence of sensitive context.
- Human approval gates: what the model can draft versus what it can execute or publish.
- Cost and quota abuse: unbounded model calls, retries, tool loops, or file expansion.
- Output sinks: chat, email, comments, issue bodies, PR reviews, logs, and generated artifacts.

## CI/CD and Local Gate Automations

- PR author or branch input reaching build scripts, containers, deploy credentials, or status
  comments.
- Secret isolation between review/test containers and deploy/promotion steps.
- Cache integrity: keys, restore scope, poisoning, stale proof reuse, and exact-SHA binding.
- Lock and state recovery: stale locks, orphaned containers, concurrent runs, and replayed reports.
- Artifact/report redaction before GitHub, chat, or public logs.

## Provider Tokens and OAuth

- Where tokens live, file modes or secret-manager policy, and which runtime steps can read them.
- Scope minimization, refresh-token handling, rotation/revocation path, and service-account reach.
- Callback/webhook validation, redirect URI assumptions, and account/channel/workspace binding.
- Distinguish local-only credential use from credentials exposed to hosted or third-party runners.

## File, Media, and Document Pipelines

- Size/type limits, decompression expansion, parser sandboxing, temporary-file cleanup, and storage
  ACLs.
- Metadata leaks in filenames, EXIF, captions, transcripts, generated thumbnails, and reports.
- Virus/malware posture where files are user-supplied or externally sourced.
- Long-running work: resumability, cancellation, retry policy, and partial artifact cleanup.

## Scheduled Jobs and Background Workers

- Who can enqueue or alter jobs, payload schema, idempotency keys, retry caps, and poison-message
  handling.
- Data freshness and race conditions between scheduler, worker, database, and external provider.
- Report sinks and alerts: what gets posted, redacted, archived, or retried.
