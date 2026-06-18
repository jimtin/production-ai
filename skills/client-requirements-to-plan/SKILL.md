---
name: client-requirements-to-plan
description: Turn vague client briefs, discovery notes, pasted requirements, screenshots, transcripts, or early project ideas into a saved client-facing requirements and implementation plan. Use when the user wants client input formalized into numbered testable requirements, phased delivery, open client questions, technical validation work, assumptions, source evidence, and a handoff into the Production AI design and build pipeline.
---

# Client Requirements To Plan

## Purpose

Convert rough client input into a durable client plan before design or implementation begins. The output is a saved Markdown plan that turns vague language into numbered, testable requirements, records open questions, controls scope, and gives the later build pipeline a clear source of truth.

This skill sits upstream of `$clarify-before-build`. Use it to prepare the client-facing proposal artifact; use `$clarify-before-build` after the client plan is accepted to confirm the implementation contract.

## Core Rules

- Treat pasted client material as source of truth unless the user asks for file discovery.
- If the user names files, folders, or prior threads, inspect them before finalizing the plan.
- Do not echo credential-like values, tokens, passwords, API keys, private URLs, or secrets from source material.
- Preserve source evidence for every major requirement without exposing sensitive raw text.
- Default to the smallest useful proof of value. Push dashboards, notifications, persistence, writeback, scheduling, and production hardening to later phases unless they are required for the first proof.
- Split unknowns by owner: technical validation owned by us is not a client question.
- Do not start implementation from an unconfirmed client plan.

## Required References

Read these reference files before producing the saved plan:

- `references/client-plan-template.md` for the required document structure.
- `references/requirement-ledger-rules.md` before writing the numbered requirements ledger.
- `references/question-register.md` before writing open questions and resolution plans.

## Workflow

### 1. Gather Source Material

Identify all available inputs:

- pasted notes or requirements
- call transcripts or thread summaries
- screenshots or uploaded files
- spreadsheets or example exports
- API documentation or vendor docs
- existing client-folder artifacts
- user clarifications in the current conversation

Record what was reviewed and what was not available. If a relevant source is unavailable, list it as missing evidence instead of inventing content.

### 2. Normalize The Brief

Translate vague client language into observable statements. For each meaningful ask, identify:

- actor or user
- trigger or entry point
- input data
- required behavior
- output
- success state
- failure or exception state
- owner or decision maker
- proof evidence

Keep the client-facing wording clear, but make each requirement testable.

### 3. Build The Requirements Ledger

Use stable requirement IDs such as `R-001`, `R-002`, and `R-003`. Do not renumber existing IDs when updating a plan unless the user explicitly asks for a rewrite.

Each requirement needs:

- requirement ID
- title
- source evidence
- phase
- type
- acceptance criteria
- proof evidence
- status

Use `references/requirement-ledger-rules.md` for the exact field rules and statuses.

### 4. Model Source Of Truth

For every important data source, classify its role:

- expected state
- actual state
- user-entered state
- derived state
- audit evidence
- output/report

If multiple systems disagree, state which system wins for each decision and which conflicts must be surfaced as exceptions.

### 5. Phase By Risk Reduction

Use phases to control scope:

- Phase 0: discovery and evidence gathering
- Phase 1: smallest useful proof
- Phase 2: interpretation, assessment, business rules, or workflow depth
- Phase 3: operational automation and production hardening

Phase 1 should prove the core value with the fewest moving parts. Move anything interpretation-heavy or platform-shaped to later phases unless it is essential to proving value.

### 6. Separate Questions And Validation Work

Create separate registers for:

- technical validation owned by us
- Phase 1 client questions
- later-phase client questions
- deferred decisions and explicit non-goals

Each question needs a reason, owner, resolution plan, and the phase it affects. Use `references/question-register.md`.

### 7. Write And Save The Plan

Save the plan as Markdown. If the user gives a client folder, save it there. If no folder is provided and the current workspace has a `clients/` directory, use:

```text
clients/<client-slug>/<project-slug>/plans/YYYY-MM-DD-client-plan.md
```

If there is no obvious client folder, ask one focused question for the target save location before writing. When operating headless, write to a clearly named draft path under the current workspace and mark the plan `DRAFT - location unconfirmed`.

Use `references/client-plan-template.md` as the document structure. Include a final `Production AI Handoff` section naming the next skills.

### 8. Report The Outcome

In the final response, include:

- saved plan path
- implementation readiness status: `READY`, `CONDITIONAL`, or `BLOCKED`
- top blockers or open client questions
- next recommended Production AI skill

## Readiness Status

Use exactly one status:

- `READY`: client plan has enough confirmed requirements and evidence to enter `$clarify-before-build`.
- `CONDITIONAL`: work can proceed only under named assumptions or safe defaults.
- `BLOCKED`: implementation planning should not proceed until named evidence or client answers are available.

Most early client plans should be `DRAFT - not confirmed` and either `CONDITIONAL` or `BLOCKED`.

## Production AI Handoff

End every plan with a handoff section:

- Use `$clarify-before-build` after the client accepts the plan.
- Use `$feature-design-preflight` for nontrivial features, third-party APIs, file parsing, AI calls, background work, storage, auth, payments, or operational workflows.
- Use `$repo-testing-setup` if the work becomes a new repo or an adopted repo without a proven containerized gate.
- Use `$user-action-coverage-review` before substantial user-facing implementation.
- Use `$security-threat-model` before implementation in sensitive areas and before any push.
- Use `$test-readiness-preflight` before expensive local container validation.

## Completion Blockers

Do not call the client plan complete while any of these are true:

- Requirements are not numbered and testable.
- Major requirements lack source evidence.
- Client questions are mixed with technical validation work.
- The first phase is a full platform when a smaller proof would prove value.
- Sensitive source text or credentials are repeated.
- Assumptions are hidden.
- The saved file path is not reported.
- The plan lacks a Production AI handoff.
