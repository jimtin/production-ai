# Output Templates

Use these templates as the default shape. Remove sections that are not applicable only when the repo evidence shows they truly do not apply.

## `README.md`

```markdown
# Repo Technical Map

## Summary

| Claim | Confidence | Evidence |
| --- | --- | --- |
| <what this repo does> | confirmed | <path> |

## Architecture

- Runtime/frameworks:
- Main entrypoints:
- Data stores:
- External providers:
- Background work:

## Documentation Index

- [API Inventory](api-inventory.md)
- [UI Inventory](ui-inventory.md)
- [Dependencies and Rationale](dependencies-and-rationale.md)
- [Data, Integrations, and Jobs](data-integrations-and-jobs.md)
- [Validation and Operations](validation-and-operations.md)
- [Evidence JSON](evidence.json)

## Open Unknowns

| Unknown | Why unresolved | Next evidence to check |
| --- | --- | --- |
```

## `api-inventory.md`

```markdown
# API Inventory

| Confidence | Method | Path | Handler/source | Auth/role | Inputs | Outputs | Persistence/external calls | Tests/docs evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

## `ui-inventory.md`

```markdown
# UI Inventory

| Confidence | Route/screen | Entry component | User role/persona | User actions | UI/design choices | State coverage | Browser/E2E evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

## `dependencies-and-rationale.md`

```markdown
# Dependencies and Rationale

| Confidence | Tool/library | Layer | Manifest/config evidence | Usage evidence | Why it appears to be used | Replacement or stale signals |
| --- | --- | --- | --- | --- | --- | --- |
```

## `data-integrations-and-jobs.md`

```markdown
# Data, Integrations, and Jobs

## Data Models

| Confidence | Model/schema | Source | Persistence boundary | Tests/docs evidence | Notes |
| --- | --- | --- | --- | --- | --- |

## Integrations

| Confidence | Provider/service | Adapter/source | Local stub/fake | Live-provider policy | Tests/docs evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |

## Jobs and Background Work

| Confidence | Job/workflow | Trigger | Source | Dependencies | Tests/docs evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
```

## `validation-and-operations.md`

```markdown
# Validation and Operations

## Canonical Commands

| Confidence | Lane | Command | Container/service | Artifacts/logs | Notes |
| --- | --- | --- | --- | --- | --- |

## Hook Enforcement

| Confidence | Hook | Command | Verification evidence | Notes |
| --- | --- | --- | --- | --- |

## Runtime and Deployment

| Confidence | Surface | Source | Evidence | Notes |
| --- | --- | --- | --- | --- |

## Failure Reproduction

| Scenario | Local reproduction | Artifacts | Notes |
| --- | --- | --- | --- |
```

## `evidence.json`

```json
{
  "schema_version": 1,
  "inventory_command": "<skill-dir>/scripts/repo_inventory.py <repo> --format json",
  "repo_root": "<absolute path>",
  "tracked_file_count": 0,
  "files": [],
  "skipped_files": [],
  "manifests": [],
  "dependencies": [],
  "dependency_usage": [],
  "frameworks": [],
  "package_scripts": [],
  "api_endpoints": [],
  "ui_routes": [],
  "tests": [],
  "infra": [],
  "docs": [],
  "doc_references": []
}
```
