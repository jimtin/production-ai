---
name: feature-design-preflight
description: Tool-agnostic feature design preflight that traces a requirement through production constraints, dependencies, user and system flows, edge cases, security, operations, and tests before implementation, and emits a READY, CONDITIONAL, or BLOCKED implementation readiness note. Use before implementing nontrivial features or integrations, especially uploads, media or video, PDFs or documents, file parsing, third-party APIs, long-running operations, background jobs, data migrations, auth or permissions, payments, admin or user portal workflows, AI calls, storage, or any request where a naive implementation could satisfy a surface requirement but fail in real use. Use when the agent must stop and clarify if requirements, provider limits, library choices, failure behavior, or verification are unclear.
---

# Feature Design Preflight

## Purpose

Use this skill to prevent half-built features. Trace the requirement from user intent through the actual repo, platform, provider, library, data, failure modes, and tests before writing code.

The output is a short implementation readiness note with an explicit status: `READY` with concrete decisions, `CONDITIONAL` with safe defaults applied and assumptions listed, or `BLOCKED` with the exact clarifications or research needed.

## Right-Sizing

This gate is for nontrivial features. When the request genuinely reuses a proven repo pattern end to end — one more field on an existing form, one more column in an existing report — say so, record that assumption in the completion report, and proceed without a readiness note. If the trace would surface a new provider, new failure mode, new schema, or new user-visible state, it is not trivial; run the preflight.

## Operating Rules

- Be tool agnostic. Do not assume Vercel, S3, Cloudinary, Mux, Stripe, Clerk, Prisma, Playwright, a PDF library, or any other provider is the right answer until the repo and requirement prove it.
- Discover the repo's current stack, provider choices, constraints, and conventions before selecting architecture.
- Check authoritative current docs when provider limits, library capabilities, SDK versions, file-size limits, timeouts, pricing-sensitive behavior, or API contracts affect the design. Record each load-bearing limit or capability in the readiness note with the concrete value, the source, and the date checked. "Docs checked" without the value is not evidence.
- Prefer boring, proven architecture over clever shortcuts. Reject naive implementations that are likely to fail at realistic scale or in production.
- Stop and ask when a requirement cannot be safely inferred, when tradeoffs need product approval, or when the implementation path materially changes cost, UX, security, data retention, or operational burden.
- Leave a traceable decision record before implementation begins. For substantial features, write the readiness note to a file (for example `docs/plans/<feature>-readiness.md`, or append it to the planning file when invoked from `$clarify-before-build`) so the record survives the session and is reviewable in git. In plan modes that prohibit file writes, keep the note in-message and restate it after any context loss.

## Core Workflow

1. **Restate the real requirement.** Identify the user, job to be done, success state, non-goals, expected scale, and business consequence of failure.
2. **Map the current system.** Inspect repo instructions, existing patterns, providers, SDKs, package versions, config, data models, workflows, and tests. Prefer existing established patterns unless they are the problem. If the feature supersedes an existing path, note it — the readiness note must flag the eventual `$codebase-prune-review` retirement of the old path.
3. **Follow the data and control flow.** Trace inputs, validation, permissions, client behavior, server behavior, storage, external calls, background work, persistence, cleanup, notifications, and user-visible states.
4. **Identify constraints.** Capture file sizes, payload limits, timeouts, rate limits, quotas, concurrency, memory, runtime, browser/device behavior, offline/slow-network behavior, retention, privacy, and cost boundaries.
5. **Verify dependency fit.** Confirm chosen libraries and external APIs actually support the needed capability. For packages and SDKs, check latest stable versions and compatibility with the repo.
6. **Design schema rollout.** When the feature touches persisted data, define whether the change is expand, deploy, or contract. Ensure app code remains compatible with the currently deployed schema until the target database migration is verified, and plan destructive cleanup as a later release.
7. **Design failure handling.** Include retries, cancellation, resume behavior, idempotency, partial failure, backpressure, validation messages, cleanup, audit logs, and observability where relevant.
8. **Check UI and security.** Use `$frontend-design-quality` for user-facing flows and `$security-threat-model` for security-sensitive paths.
9. **Define proof.** Specify unit, integration, browser/E2E, visual, contract, fixture, performance, migration, and local container validation required to prove the feature works. For user-facing features, name `$user-action-coverage-review` to enumerate the action-level browser/E2E coverage. The proof plan becomes `$test-readiness-preflight` input before the full gate runs.
10. **Decide or clarify.** If material uncertainty remains, ask targeted questions before coding. If ready, produce the implementation readiness note and proceed.

## Requirement Trace

For every nontrivial feature, answer these before implementation:

- Who uses it and what are they trying to accomplish?
- What exact inputs, outputs, states, and side effects exist?
- What current repo pattern should be reused?
- What external systems, libraries, files, or services does it depend on?
- What limits or assumptions could make a straightforward implementation fail?
- What does this cost at expected scale, and at what usage level does the design need to change?
- What happens when the user, network, provider, database, queue, file parser, browser, or worker fails?
- What data must be stored, secured, retained, deleted, indexed, or migrated?
- What schema must exist before the code runs in production, and how is that migration applied and verified before deployment?
- What must be synchronous, and what should be asynchronous?
- What must be visible in the UI: progress, loading, empty, error, retry, cancel, processing, success, and permission states?
- What tests and local validation prove the real workflow, not just the happy path?

## Clarify Before Coding

Ask the user before implementation when:

- expected file sizes, duration, formats, throughput, retention, or quotas are unknown
- the chosen provider or library cannot satisfy the likely production requirement
- a requirement could be implemented synchronously but should probably be asynchronous
- the feature needs paid-provider behavior, higher quotas, or a new external service
- failure behavior affects user trust, billing, data loss, privacy, or compliance
- there are multiple valid architectures with meaningful UX, cost, security, or delivery tradeoffs
- acceptance criteria are not observable enough to test

Ask only the blocking questions. State the default recommendation and the risk of proceeding without an answer.

## No User Available

This preflight gets invoked from automations — including PR review gates — where nobody can answer questions. In those contexts, do not fabricate answers:

- Record each blocking unknown in the readiness note with its lowest-risk reading and the consequence if that reading is wrong.
- Apply lowest-risk defaults only where a wrong default is cheap to reverse.
- Emit the readiness note as `CONDITIONAL` (safe defaults applied, assumptions listed) or `BLOCKED` (a blocking unknown has no safe default).
- In a review or gate context, `BLOCKED` is a fail-closed outcome for the change under review. The gate must not guess on the author's behalf.

## Readiness Note Format

Before implementation, provide:

- Status: `READY`, `CONDITIONAL`, or `BLOCKED`
- Requirement summary
- Existing repo pattern to follow
- Proposed architecture and rejected naive approach
- Verified limits and capabilities: concrete value, source, and date checked for each load-bearing constraint
- Data model and lifecycle
- Schema rollout sequence and rollback compatibility when persistence changes
- UX states
- Security and privacy considerations
- Failure modes and recovery behavior
- Test and verification plan
- Superseded paths and the planned `$codebase-prune-review` follow-up when the feature replaces an existing flow
- Open questions, accepted risks, or explicit "ready to implement"

Keep this concise. It is a design gate, not a long architecture document.

## Completion Blockers

Do not report `READY` while any of these are true:

- A load-bearing provider, library, or platform capability was asserted from memory instead of verified against current docs with the value, source, and date recorded.
- The feature touches persisted data and the schema change has no expand/deploy/contract classification.
- No naive approach was named and rejected — if the obvious implementation is fine, say why it survives the constraints.
- User-visible states (progress, loading, empty, error, retry, cancel, processing, success, permission) are unenumerated for user-facing work.
- A realistic failure mode from the trace has no defined user behavior, system behavior, and test.
- A blocking question is unanswered and the user has not explicitly accepted the risk of proceeding — or, headless, the note is not marked `CONDITIONAL` or `BLOCKED`.
- The proof plan is missing or covers only the happy path.
- No readiness note was produced, or a substantial feature's note was not persisted per the operating rules.

## Example Prompts

- "Use `$feature-design-preflight` before we build the video upload feature."
- "Trace this CSV import requirement through real constraints before coding."
- "We're adding a webhook integration — what could break in production?"
- "Design the document parsing pipeline and check the library actually supports it."
- "Add a field to the profile form." (trivial when it reuses the proven pattern end to end — say so, record the assumption, and proceed)

## References

- Read `references/requirement-trace.md` for the full trace checklist.
- Read `references/domain-checklists.md` when the feature touches uploads, media, documents, external APIs, long-running work, data migrations, auth, payments, AI, or portals.
- Read `references/clarification-triggers.md` when deciding whether to ask the user before coding.
