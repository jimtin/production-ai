# Client Plan Template

Use this structure for saved client plans. Keep it client-readable, but include enough internal handoff detail that the plan can become the source of truth for later design and build work.

```markdown
# <Client> - <Project> Client Plan

Status: DRAFT - not confirmed
Implementation readiness: BLOCKED
Date: <YYYY-MM-DD>
Owner: <name or team>

## 1. Executive Summary

State the client problem, proposed outcome, and first proof in 3-6 bullets.

## 2. Source Materials Reviewed

List every reviewed source and mark missing evidence.

| Source | Type | Reviewed | Notes |
| --- | --- | --- | --- |

## 3. Goal

Describe the outcome the client wants in plain language.

## 4. Non-Goals

List what this plan deliberately does not include.

## 5. Current State

Describe how the client does the work today, including manual steps, systems, files, people, and pain points.

## 6. Proposed End State

Describe what changes for the client after delivery.

## 7. Users And Actors

| Actor | Role In Workflow | Required Access | Notes |
| --- | --- | --- | --- |

## 8. Source-Of-Truth Model

| Source | Represents | Used For | Conflict Handling |
| --- | --- | --- | --- |

Classify each source as expected state, actual state, user-entered state, derived state, audit evidence, or output/report.

## 9. Numbered Requirements

| ID | Requirement | Source Evidence | Phase | Acceptance Criteria | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |

## 10. Phase Plan

### Phase 0 - Discovery And Evidence

### Phase 1 - Smallest Useful Proof

### Phase 2 - Assessment And Workflow Depth

### Phase 3 - Operational Automation

## 11. Implementation Plan

Break the work into sequenced slices that clear the riskiest unknowns first.

| Slice | Purpose | Work Included | Exit Evidence | Depends On |
| --- | --- | --- | --- | --- |

## 12. Open Questions

### 12.1 Technical Validation - Owner: Us

### 12.2 Client Questions - Phase 1

### 12.3 Later-Phase Questions

### 12.4 Deferred Decisions And Non-Goals

## 13. Assumptions

| Assumption | Why It Is Reasonable | Risk If Wrong | Resolution Plan |
| --- | --- | --- | --- |

## 14. Risks And Mitigations

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |

## 15. Testing And Proof Plan

List unit, integration, browser/E2E or equivalent workflow proof, security checks, local container validation, and any manual client acceptance evidence.

## 16. Security And Privacy Notes

Call out sensitive data, credentials, secrets, personal data, retention, logs, access boundaries, and redaction requirements.

## 17. Production AI Handoff

List the next skills and why each applies.

## 18. Decision Log

| Date | Decision | Owner | Source |
| --- | --- | --- | --- |

## 19. Definition Of Done

List observable completion criteria for the plan and for Phase 1.
```

## Writing Rules

- Keep client-facing language direct and concrete.
- Do not bury blockers in prose; put them in readiness, open questions, risks, and definition of done.
- Use tables for ledgers and registers.
- Prefer `DRAFT - not confirmed` until the client accepts the plan.
- Include enough internal proof language for the Production AI handoff without turning the document into low-level implementation code.
