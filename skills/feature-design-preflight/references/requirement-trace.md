# Requirement Trace

Use this checklist to follow a feature from requirement to implementable design. The goal is not ceremony; the goal is to prevent a superficially complete feature that fails under realistic use.

## 1. User Outcome

- Primary user, role, or actor
- Job to be done
- Success state visible to the user or system
- Non-goals and deliberately excluded behavior
- Expected volume, size, frequency, concurrency, and latency tolerance
- Business or user consequence of failure

## 2. Current System Fit

- Existing repo instructions and local `AGENTS.md`
- Existing components, services, data models, queues, providers, and test fixtures to reuse
- Current package manager, runtime, framework, and deployment model
- Existing provider choices and integration wrappers
- Current validation, logging, telemetry, and error-handling patterns
- Repo-specific constraints that override generic advice

## 3. Data and Control Flow

- Entry points: UI, API, webhook, CLI, scheduled job, background worker, import, or admin action
- Inputs: files, forms, events, payloads, IDs, credentials, callbacks, or generated content
- Validation: type, schema, MIME, size, shape, state, permission, tenant, and ownership checks
- Processing: synchronous work, asynchronous work, retries, deduplication, idempotency, and cancellation
- Outputs: records, files, messages, emails, notifications, events, logs, reports, or UI changes
- Persistence: tables, documents, blob/object storage, cache, search index, queue, analytics, and audit log
- Schema rollout: migration files, generated clients, compatibility with currently deployed schema, migration order, target-environment verification, and rollback behavior
- Cleanup: failed uploads, partial records, expired jobs, orphaned files, temporary files, and retry exhaustion

## 4. Constraints and Limits

Check limits where they matter:

- File size, payload size, request duration, response duration, memory, CPU, disk, temp storage, and streaming behavior
- Provider API limits, quotas, pricing tiers, rate limits, concurrency, polling rules, and webhook behavior
- Cost at expected scale, pricing-tier boundaries, and the usage level at which the design must change
- SDK and library capability limits, supported formats, platform compatibility, security posture, and maintenance status
- Browser limitations, mobile constraints, slow networks, offline behavior, accessibility, and localization
- Data retention, deletion, privacy, tenant isolation, encryption, and auditability

When any of these are material, verify with current authoritative docs instead of model memory.

## 5. Failure and Recovery

- User cancels, reloads, navigates away, loses network, submits twice, or lacks permission
- File is too large, wrong type, corrupt, malicious, password-protected, truncated, or unsupported
- External provider is slow, returns partial success, rate-limits, changes shape, times out, or is down
- Database write succeeds but file upload fails, or file upload succeeds but database write fails
- Webhook arrives before local state exists, arrives twice, arrives late, or never arrives
- Background job fails, retries forever, dead-letters, or produces stale output
- Cleanup fails or creates orphaned data

For each likely failure, define user behavior, system behavior, observability, and tests.

## 6. Implementation Decision

Before coding, decide:

- Reuse existing pattern or introduce a new abstraction
- Direct upload, proxied upload, stream, chunked upload, signed URL, external hosted flow, queue, worker, or synchronous API call
- Library/package choice and why it fits the file types, runtime, and deployment target
- Version choice, latest stable check, and lockfile impact
- Database and storage model
- Migration/release sequence, including whether schema must be applied before code deployment
- Security and permission boundaries
- User-visible states and admin visibility
- Verification required before completion

Reject any approach that only handles a toy happy path when the likely production path is materially different.
