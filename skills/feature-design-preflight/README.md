# feature-design-preflight

**The failure this prevents:** the agent ships a file-upload feature that works in the demo — then a real user uploads a 2GB video, the serverless function times out at 60 seconds, and you discover the chosen library never supported resumable uploads anyway. Naive implementations satisfy the surface request and fail in production, where the constraints live.

This skill forces the requirement through reality *before* code: platform limits, provider capabilities, data flow, failure modes, schema sequencing, and proof.

## What it does

Produces an **implementation readiness note** — either "ready to implement" with concrete decisions, or a blocker list with the exact clarifications needed. On the way there the agent must:

1. Restate the real requirement (user, job, scale, consequence of failure).
2. Map the current system and prefer existing repo patterns.
3. Trace data and control flow end to end — inputs, validation, permissions, storage, background work, cleanup, user-visible states.
4. Capture constraints: payload limits, timeouts, rate limits, quotas, memory, runtime, retention, cost.
5. **Verify dependency fit against current docs** — never from model memory.
6. Classify schema work as expand / deploy / contract.
7. Design failure handling and define the proof plan.

## The design choices worth stealing

- **Tool-agnostic by rule.** The skill explicitly bans assuming any provider "is the right answer until the repo and requirement prove it" — which neutralizes the agent's habit of reaching for whatever was most common in training data.
- **The requirement trace is a question list.** Eleven questions ("what limits could make a straightforward implementation fail?", "what must be synchronous?") that turn architecture review into fill-in-the-blanks.
- **Clarify-triggers are enumerated.** The agent asks the user only for genuinely blocking unknowns — expected file sizes, paid-provider behavior, sync-vs-async tradeoffs — and must state its default recommendation plus the risk of proceeding unanswered.
- **A gate, not a document.** The readiness note is deliberately short. This is a "stop and check" ritual, not an architecture-astronaut deliverable.

## Install

```bash
cp -R skills/feature-design-preflight ~/.codex/skills/
```

Triggers before nontrivial features — uploads, media, documents, third-party APIs, long-running jobs, migrations, auth, payments, AI calls, portals.

## Adapt it

- `references/domain-checklists.md` carries per-domain gotchas (uploads, media, payments…) — extend it with your scars.
- Wire its output into your planning gate: in this library, `$clarify-before-build` won't close a contract until this skill's findings are represented.
- If you have an ADR habit, emit the readiness note as a lightweight ADR.
