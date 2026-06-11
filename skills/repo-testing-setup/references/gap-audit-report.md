# Gap Audit Report

Use this report for the short path: an already-adopted repo, a request to audit against the validation standard, or a headless/non-mutating review. Do not install hooks, rewrite scripts, change platform config, or run expensive full gates unless the user separately asks for remediation.

## Report Shape

```md
# Repo Testing Foundation Gap Audit

## Scope

- Repo:
- Commit/SHA or working-tree state:
- Audit mode: `interactive` or `headless`
- Mutation policy: `none`

## Current Foundation

- Canonical full gate:
- Fast hook lane:
- Production build/build-smoke lane:
- Hook framework and active verification:
- Enforcement model:
- Tooling matrix path:
- Critical-path inventory path:
- E2E workflow inventory path:
- Agent contract path:

## Gap Map

| Area | Current state | Evidence | Required remediation | Status |
|---|---|---|---|---|
| Unit lane | present/partial/missing/substituted/not-applicable | <path/command> | <next action> | <severity> |

## Security and Version Policy

- Repo-scoped secret scan:
- Dependency/vulnerability scans:
- Image scan:
- Tool/runner pinning:
- Update policy:

## Flake Policy

- Retry policy:
- Quarantine file/path:
- Open quarantines:
- Deploy-lane blockers:

## Verdict

`adopted`, `adopted-with-exceptions`, or `blocked`

## Remediation Plan

List only the changes needed to close the gaps. If remediation is requested later, run the full design-confirm-execute path before mutating.
```

Use severity values `blocking`, `high`, `medium`, and `low` for required remediation.
