# Requirement Ledger Rules

The requirements ledger is the backbone of the client plan. It must be numbered, testable, source-backed, and stable across revisions.

## Required Fields

Use these fields for every requirement:

- `ID`: stable identifier such as `R-001`.
- `Requirement`: one clear behavior or outcome.
- `Source Evidence`: source note, file, transcript section, screenshot, client answer, API evidence, or assumption.
- `Phase`: `Phase 0`, `Phase 1`, `Phase 2`, or `Phase 3`.
- `Type`: functional, data, integration, UX, reporting, security, operational, testing, or compliance.
- `Acceptance Criteria`: observable pass/fail criteria.
- `Proof`: unit, integration, browser/E2E, API evidence, sample output, manual acceptance, or security validation.
- `Status`: confirmed, assumed, open, blocked, or deferred.

## Requirement Quality Bar

A good requirement has:

- one actor or system owner
- one trigger or condition
- one behavior
- one observable output or state
- at least one failure or exception behavior when relevant
- a proof method

Weak:

> The system should automate reporting.

Strong:

> `R-007`: When the operator runs the Phase 1 proof, the system must generate an output workbook with one row per input record, the match status, the matched system identifier when available, and a reason for unclear or failed matches.

## Status Rules

- `confirmed`: explicitly supported by client source material or accepted by the user.
- `assumed`: reasonable but not yet confirmed; include risk and resolution plan.
- `open`: needs an answer before final acceptance.
- `blocked`: implementation planning cannot proceed until resolved.
- `deferred`: deliberately moved to a later phase or out of scope.

## Source Evidence Rules

- Prefer source labels over long quotes.
- Do not paste sensitive raw text.
- If evidence came from an uploaded file or thread, name the source and the section if available.
- If evidence is inferred, label it as an inference.
- If no evidence exists, do not write the requirement as confirmed.

## Phase Rules

Phase 1 should be the smallest useful proof. If a requirement needs complex interpretation, production operations, notifications, scheduling, persistence, dashboards, or writeback, it usually belongs in Phase 2 or Phase 3.

Keep later-phase requirements visible so they are not forgotten, but do not let them block Phase 1 unless they are needed to prove the core value.

## Renumbering Rules

- Do not renumber requirements during updates.
- Add new requirements at the end of the relevant section with the next available ID.
- If a requirement is removed, mark it deferred or superseded in the decision log instead of silently deleting it when the plan is already in use.
