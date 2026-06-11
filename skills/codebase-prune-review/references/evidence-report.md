# Evidence Report Format

Use this format for prune plans and completion reports. Keep it concise but evidence-backed.

## Summary

- Goal:
- Replacement/live path:
- Old path being reviewed:
- Overall recommendation:
- Residual unknowns:

## Behavior and Ownership Map

| Behavior | Live entrypoint | Current provider/path | Owner/module | Existing tests | Missing proof |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Removal Candidates

| Candidate | Classification | Evidence | Risk | Required proof | Action |
| --- | --- | --- | --- | --- | --- |
|  | active/compatibility/superseded/dead/unknown |  | low/medium/high |  | keep/remove/defer |

## Progressive Removal Plan

| Layer | Scope | Changes | Targeted tests | Security review | Rollback note |
| --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |

## Validation Log

For each layer, report:

- Layer:
- Files removed/changed:
- Tests added or updated:
- Targeted commands run:
- Pass/fail status:
- Follow-up:

Final completion must include:

- Canonical full local/container gate
- Coverage result or enforcement point
- Integration and browser/E2E coverage
- Dependency audit
- Containerized repo-scoped gitleaks before push
- `$security-threat-model` status when security-sensitive surfaces were removed
- Removed paths, retained compatibility paths, and remaining unknowns
