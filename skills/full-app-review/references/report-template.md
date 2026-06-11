# Full App Review Report Template

Use this structure unless the user asks for a different output format. Keep it evidence-first and concise.

## Executive Summary

- Repo:
- Review date:
- Review mode: read-only / commands run / validation run
- Overall status: blocking issues found / high-risk gaps / ready for remediation planning / no material findings (derived per the SKILL.md rule — highest severity present, with any `blocked` dimension barring `no material findings`)
- Highest-priority workstreams:

## Skill Coverage Matrix

| Dimension | Skill or Reference | Status | Evidence | Gaps |
| --- | --- | --- | --- | --- |
| Frontend and visual quality | `$frontend-design-quality` |  |  |  |
| Feature/workflow design | `$feature-design-preflight` |  |  |  |
| Test readiness and coverage | `$test-readiness-preflight` |  |  |  |
| User-action coverage | `$user-action-coverage-review` matrix |  |  |  |
| Security | `$security-threat-model` |  |  |  |
| Code pruning | `$codebase-prune-review` |  |  |  |
| Analytics | `$nextjs-vercel-analytics` when applicable |  |  |  |
| Observability | `observability-checklist.md` |  |  |  |
| Dependencies and deployment | `review-matrix.md` |  |  |  |

## Findings

Order findings by severity.

| ID | Severity | Area | Finding | Evidence | Impact | Required Fix | Required Tests/Gates |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-001 | blocking/high/medium/low |  |  |  |  |  |  |

## Observability Assessment

- Current instrumentation:
- Client runtime error coverage:
- Server/API/job error coverage:
- Alerting and runtime monitoring:
- Privacy/log hygiene:
- Gaps:
- Recommended improvements:

## Testing and Validation Readiness

- Unit coverage target and evidence:
- Integration coverage:
- Browser/E2E coverage:
- Local/container gate:
- Predictable blockers before full validation:
- Commands inspected:
- Commands run:
- Commands intentionally not run and why:

## Security and Privacy Scope

- Trust boundaries:
- Auth/authz surfaces:
- Sensitive data and secrets:
- Upload/parser/webhook/admin surfaces:
- Threat model gaps:
- Secret scan posture:

## Redundant or Superseded Code Paths

- Candidates:
- Classification: `active`, `compatibility`, `superseded`, `dead`, or `unknown`
- Evidence:
- Safe removal layers:
- Tests needed before removal:

## Prioritized Remediation Plan

Group by workstream. Each item needs a verification path.

| Priority | Workstream | Change | Proof Required | Blocks Push/Deploy |
| --- | --- | --- | --- | --- |
| 1 |  |  |  | yes/no |

## Residual Risk

- Unknowns:
- Access or secret limitations:
- Production-only validation gaps:
- Deferred questions:
