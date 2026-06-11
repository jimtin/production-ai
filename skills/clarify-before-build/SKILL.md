---
name: clarify-before-build
description: Question-led planning gate for implementation work. Use when the user wants a project plan, roadmap, feature plan, technical design, implementation plan, migration plan, product workflow, architecture change, or any substantial build before code changes begin. Forces Codex to repeatedly question assumptions, resolve ambiguity, identify risks and dependencies, and reach an explicit shared understanding before implementation starts.
---

# Clarify Before Build

## Core Rule

Do not start implementation while material planning ambiguity remains. Keep questioning until the plan is specific enough that another capable engineer could execute it without guessing.

This skill is not for producing a quick plan and moving on. It is a planning gate: ask, refine, challenge, restate, and only then produce an implementation-ready plan.

## Operating Mode

1. State that planning mode is active.
2. Summarize the current understanding in 3-6 bullets.
3. Identify unknowns, assumptions, contradictions, risks, and decisions.
4. Ask the next most important questions in a focused batch.
5. Wait for answers before finalizing the plan.
6. Repeat until no material ambiguity remains.
7. Produce a Shared Understanding Contract and ask for explicit confirmation.
8. Only after confirmation, offer implementation sequencing.

Ask 3-7 questions per round when the problem is broad. Ask fewer questions when only one blocker remains. Do not bury the user in a giant questionnaire unless the scope is genuinely large.

## Related Skill Checks

Use related skills during planning when they apply:

- Use `$frontend-design-quality` when the plan touches frontend UI, portals, dashboards, forms, content pages, responsive layout, visual design, navigation, or user actions. Include its viewport, click-minimization, pattern reuse, visual verification, and Playwright expectations in the plan.
- Use `$security-threat-model` when the plan touches auth/authz, user data, tenant boundaries, payments, secrets, file upload/parsing, admin tools, deployment, CI/CD, external integrations, webhooks, background jobs, logs, or any security-sensitive path. Include threat boundaries, abuse paths, mitigations, and blocking findings in the plan.
- Use `$feature-design-preflight` when the plan touches nontrivial features or integrations where a naive implementation could pass the surface request but fail in real use, including uploads, media/video, PDFs/documents, file parsing, third-party APIs, long-running jobs, background work, data migrations, auth/permissions, payments, AI calls, storage, or admin/user portal workflows. Include requirement trace, constraints, provider/library fit, failure modes, and proof requirements in the plan.

If any related skill applies, do not finish the Shared Understanding Contract until its relevant design requirements are represented in acceptance criteria, risks, and verification.

## Questioning Standard

Be direct and persistent. Question vague terms such as "simple", "robust", "admin", "portal", "done", "beautiful", "secure", "fast", "full coverage", "latest", "integration", "critical", "production-ready", and "MVP".

For each vague term, translate it into an observable requirement:

- user or role
- trigger or entry point
- exact behavior
- data involved
- success state
- failure state
- test evidence
- owner or decision maker

If the user answers partially, keep the answered parts and ask only about the remaining gaps.

## Planning Ledger

Maintain a visible planning ledger during the conversation:

- Confirmed decisions
- Open questions
- Assumptions
- Out of scope
- Risks and mitigations
- Acceptance criteria
- Test and verification requirements

Update the ledger after each answer round. Do not let stale assumptions survive silently.

## Required Coverage

Before the plan can be called complete, cover:

1. Goal and non-goals
2. Users, roles, and permissions
3. Current state and constraints
4. Desired end state
5. User flows or system flows
6. Data model, persistence, integrations, and side effects
7. Edge cases and failure modes
8. Security, privacy, abuse, and operational risks
9. UX and frontend requirements when applicable
10. Test strategy: unit, integration, browser/E2E, visual, security, and local container validation
11. Rollout, migration, rollback, and observability
12. Dependencies, sequencing, and risks
13. Definition of done

Read `references/question-bank.md` when the topic is broad, ambiguous, high-risk, or multi-role.

Read `references/shared-understanding-contract.md` before producing the final plan.

## Challenge Rules

Challenge the user when:

- a requested plan conflicts with repo constraints or AGENTS.md
- success criteria are not testable
- the plan skips security, data integrity, or rollback
- the plan touches UI but skips `$frontend-design-quality` considerations
- the plan touches sensitive systems but skips `$security-threat-model` considerations
- the plan touches a nontrivial feature but skips `$feature-design-preflight` requirement tracing
- the plan relies on GitHub/Vercel/CI to discover preventable failures
- the plan would create avoidable user friction
- the scope is too large to verify safely in one delivery stream
- the implementation path is chosen before the problem is understood

Challenge by explaining the concrete risk and asking for a decision. Do not patronize or lecture.

## Exit Gate

Do not mark planning complete until all are true:

- Open questions are either answered or explicitly deferred.
- Assumptions are listed and accepted by the user.
- Acceptance criteria are observable and testable.
- Verification covers repo rules, local container gates, security review, secret scan, dependency audit, and frontend visual checks when applicable.
- Applicable feature, UI, and security design checks from `$feature-design-preflight`, `$frontend-design-quality`, and `$security-threat-model` are included.
- The plan separates must-have from later work.
- The user explicitly confirms the Shared Understanding Contract.

If the user asks to skip planning and implement immediately, summarize the remaining ambiguity and ask for explicit approval to proceed with those risks. Do not silently skip the planning gate.
