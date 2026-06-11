# Repo Testing Artifact Templates

Use these repo-tracked paths unless the repo already has a stricter convention. If a different path is chosen, record the reason in `docs/testing/repo-testing-design.md`.

## Required Files

- `docs/testing/repo-testing-design.md`: confirmed design and final verdict.
- `docs/testing/tooling-matrix.md`: validation tools, containers, commands, versions, and exceptions.
- `docs/testing/critical-path-inventory.md`: integration-critical paths and evidence.
- `docs/testing/e2e-workflow-inventory.md`: user workflows and browser/E2E evidence.
- `docs/testing/adoption-report.md`: final setup report, validation evidence, and remaining exceptions.

## Tooling Matrix

```md
| Tool | Purpose | Layer | Container/service | Exact command | Version or digest | Update policy | Status | Exception/equivalent |
|---|---|---|---|---|---|---|---|---|
| gitleaks | Secret scan | Security | zricethezav/gitleaks:<pin> | <repo wrapper or docker command> | <pin> | <cadence/owner> | present | |
```

Status values: `present`, `partial`, `missing`, `substituted`, `not-applicable`.

## Critical Path Inventory

```md
| Critical path | Entry point | Data/services | Failure modes covered | Integration evidence | Unit evidence | Status |
|---|---|---|---|---|---|---|
| <path name> | <route/job/service> | <db/provider/queue> | <errors/retries/permissions> | <test file or command> | <test file> | covered |
```

Status values: `covered`, `missing`, `partial`, `blocked`, `deferred by user`.

## E2E Workflow Inventory

Use the `$user-action-coverage-review` matrix shape so downstream agents can reuse it directly:

```md
| User action | Route/surface | Role/persona | Data state | Expected behavior | Playwright/E2E evidence | Unit/integration evidence | Status |
|---|---|---|---|---|---|---|---|
| <action> | <route> | <role> | <state> | <observable result> | <spec/test id> | <test file> | covered |
```

Status values: `covered`, `missing`, `stale`, `partial`, `negative assertion needed`, `blocked`, `deferred by user`.

## Adoption Report

```md
# Testing Foundation Adoption Report

## Verdict

`adopted`, `adopted-with-exceptions`, or `blocked`

## Repo Truth Discovered

- Package manager:
- Frameworks/services:
- Existing commands:
- Existing hook framework:
- Existing CI/deploy config:

## Enforcement Model

- Model: `gate-owned` or `hook-owned`
- Hook install/verify command:
- Full canonical command:

## Validation Evidence

| Check | Command | Container/service | Result | Artifact |
|---|---|---|---|---|

## Ledgers

- Acceptance ledger final status:
- Test ledger final status:
- Parallel work decision:

## Exceptions and Deferred Items

| Item | Reason | Owner decision | Follow-up |
|---|---|---|---|
```
