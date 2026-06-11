---
name: user-action-coverage-review
description: Impact-scoped review that maps user actions, critical paths, roles, states, and mutations to Playwright/E2E plus unit/integration evidence. Use after an accepted plan and before implementation for substantial feature, frontend, workflow, route, mutation, auth/role, upload, save/delete, navigation, admin/user portal, or release-readiness work; rerun before final validation if scope changes.
---

# User Action Coverage Review

## Purpose

Use this skill to prevent missing browser, integration, and unit coverage from being discovered only at the full gate. This is an impact-scoped coverage review, not a full app audit. Use `$full-app-review` for whole-app or production-readiness audits.

## When To Use

Use after plan acceptance and before implementation for substantial user-facing or workflow work, including:

- new or changed routes, forms, navigation, mutations, saves, deletes, uploads, imports, exports, toggles, filters, role-gated actions, admin/user portal workflows, and deployed-flow behavior
- frontend changes covered by `$frontend-design-quality`
- release-readiness work where user workflows or critical paths are in scope

Rerun before final validation if implementation scope changes, if a user action is added or removed, or if tests are rewritten.

## Workflow

1. Load repo truth.
   - Read applicable `AGENTS.md`, route/workflow manifests, critical-path inventories, Playwright specs, integration tests, unit tests, and relevant package scripts.
   - Prefer existing repo inventory files over inventing a parallel source of truth.

2. Build the action matrix before implementation.
   - Include every affected click, form submit, save, autosave, upload/import/export, delete/archive, navigation, keyboard path, role-gated mutation, empty/error/retry state, and removed action.
   - Include public, authenticated, admin, and superadmin roles when the surface supports them.

3. Map evidence.
   - Browser/E2E evidence must prove the user can actually perform or cannot perform the action.
   - Integration evidence must cover API routes, persistence boundaries, provider adapters, permissions, workflows, queues/jobs, and cross-module contracts.
   - Unit evidence must cover changed hooks, services, helpers, validation, rendering utilities, state machines, and branch behavior.

4. Convert gaps into implementation tasks.
   - `missing`, `stale`, `partial`, and `negative assertion needed` rows are not observations to defer silently; they become work items before final validation.
   - Removed actions need negative browser assertions where the old UI/action would otherwise be reachable.
   - Update flow inventories and critical-workflow manifests in the same change when the repo has them.

5. Reconcile before the full gate.
   - Rerun the matrix after implementation if scope changed.
   - Do not start the canonical full gate until each in-scope row is `covered`, `blocked`, or explicitly deferred by the user.

## Required Matrix

Use this shape in planning notes, implementation handoff, or final report:

```md
| User action | Route/surface | Role/persona | Data state | Expected behavior | Playwright/E2E evidence | Unit/integration evidence | Status |
|---|---|---|---|---|---|---|---|
| Save profile | /settings/profile | signed-in user | valid form | persists and shows success | WEB-123 | profile-route.test.ts, useProfileSave.test.ts | covered |
```

Allowed status values:

- `covered`
- `missing`
- `stale`
- `partial`
- `negative assertion needed`
- `blocked`
- `deferred by user`

## Acceptance Bar

Do not call the review complete until:

- every in-scope user action is listed
- every critical path maps to browser/E2E plus integration evidence
- changed logic has unit or focused integration coverage identified
- removed actions have absence coverage or a documented reason
- stale tests, stale manifests, and stale flow inventories are listed as implementation tasks
- blockers name the exact missing dependency, fixture, auth, environment, or product decision
