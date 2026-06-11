# feature-design-preflight

**The failure this prevents:** the agent ships a file-upload feature that works in the demo — then a real user uploads a 2GB video, the serverless function times out at 60 seconds, and you discover the chosen library never supported resumable uploads anyway. Naive implementations satisfy the surface request and fail in production, where the constraints live.

This skill forces the requirement through reality *before* code: platform limits, provider capabilities, data flow, failure modes, schema sequencing, and proof.

## What it does

Produces an **implementation readiness note** with an explicit status — `READY` with concrete decisions, `CONDITIONAL` with safe defaults and listed assumptions, or `BLOCKED` with the exact clarifications needed. On the way there the agent must:

1. Restate the real requirement (user, job, scale, consequence of failure).
2. Map the current system, prefer existing repo patterns, and flag any path this feature supersedes.
3. Trace data and control flow end to end — inputs, validation, permissions, storage, background work, cleanup, user-visible states.
4. Capture constraints: payload limits, timeouts, rate limits, quotas, memory, runtime, retention, **cost at expected scale**.
5. **Verify dependency fit against current docs** — never from model memory — and record each load-bearing limit with its value, source, and date checked.
6. Classify schema work as expand / deploy / contract.
7. Design failure handling and define the proof plan, handing user-action coverage to `$user-action-coverage-review` and feeding the proof plan into `$test-readiness-preflight`.

## The design choices worth stealing

- **Status-coded readiness.** `READY / CONDITIONAL / BLOCKED` is a closed vocabulary — there is no "probably fine." And in a review-gate context, `BLOCKED` fails closed: the gate never guesses on the author's behalf.
- **"Docs checked" is not evidence — values are.** Every load-bearing limit lands in the note as a receipt: *max request body 4.5MB, provider docs, checked 2026-06-11*. The claim is auditable, and so is its staleness.
- **Tool-agnostic by rule.** The skill explicitly bans assuming any provider "is the right answer until the repo and requirement prove it" — which neutralizes the agent's habit of reaching for whatever was most common in training data.
- **The naive approach must be named and rejected.** Even when the obvious implementation is fine, the note must say *why* it survives the constraints. "We considered nothing" is not a design decision.
- **Completion blockers with teeth.** Unverified capabilities, unclassified schema changes, happy-path-only proof plans, unenumerated UX states — any of these blocks `READY`. The gate cannot be satisfied by assertion.
- **It right-sizes itself.** A field added to an existing form using the proven pattern end to end gets a recorded assumption and a green light — not a ceremony note. New provider, new failure mode, new schema, or new user-visible state means the full preflight.
- **Clarify-triggers are enumerated — and they learn.** The trigger list includes recurrence evidence: if the same feature class failed before, or production runtime reports show quota/transient failures in the area, resilience becomes part of the requirement. (Those triggers were added by the nightly [learning loop](../../docs/patterns/learning-loop.md) — this skill's reference files are where its lessons land.)
- **The note survives the session.** Substantial features write the readiness note to a file — reviewable in git, immune to context compaction, and appended to the plan when invoked from `$clarify-before-build`.

## Install

```bash
cp -R skills/feature-design-preflight ~/.codex/skills/
```

Triggers before nontrivial features — uploads, media, documents, third-party APIs, long-running jobs, migrations, auth, payments, AI calls, portals.

## Adapt it

- `references/domain-checklists.md` carries per-domain gotchas (uploads, parsing, providers, jobs, migrations, auth, payments, AI) — extend it with your scars.
- Wire its output into your planning gate: in this library, `$clarify-before-build` won't close a contract until this skill's findings are represented.
- If you have an ADR habit, emit the readiness note as a lightweight ADR — the status line and verified-limits receipts port directly.
