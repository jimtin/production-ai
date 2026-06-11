# Documentation Schema

## Confidence Tags

Use one tag on every material claim:

- `confirmed`: direct evidence from code, manifests, config, tests, or current docs.
- `inferred`: supported by usage patterns, imports, or framework conventions, but not explicitly documented.
- `stale-doc`: found in existing docs but contradicted by current repo evidence.
- `unknown`: not resolved after inspecting reasonable repo evidence.

## Evidence Rules

- Prefer file paths and line references for hand-inspected claims.
- Use manifest entries for dependencies and tool versions.
- Use route/config/test file paths for API and UI claims.
- Do not quote secrets, raw tokens, full env files, private keys, cookies, provider payloads, user data, or local machine state.
- Mark skipped files by path and skip reason only.
- Treat historical docs as evidence of past intent, not current truth, unless current code/config confirms the claim.

## Required Docs

### `README.md`

- Repo purpose and architecture summary.
- Primary runtime/framework stack.
- Main entrypoints.
- Documentation index.
- Top unknowns or stale-doc items.

### `api-inventory.md`

Columns:

- Confidence
- Method
- Path
- Handler/source
- Auth/role
- Inputs
- Outputs
- Persistence/external calls
- Tests/docs evidence
- Notes

### `ui-inventory.md`

Columns:

- Confidence
- Route/screen
- Entry component
- User role/persona
- User actions
- UI/design choices
- State coverage
- Browser/E2E evidence
- Notes

### `dependencies-and-rationale.md`

Columns:

- Confidence
- Tool/library
- Layer
- Manifest/config evidence
- Usage evidence
- Why it appears to be used
- Replacement or stale signals

### `data-integrations-and-jobs.md`

Sections:

- Data models and migrations.
- Persistence boundaries.
- External providers and local fakes/stubs.
- Jobs, queues, cron, webhooks, and background workflows.
- Unknown or stale integration claims.

### `validation-and-operations.md`

Sections:

- Canonical local/container commands.
- Hook enforcement.
- Unit, integration, E2E, security, dependency, and build lanes.
- Logs, artifacts, reports, and failure reproduction.
- Deployment/runtime/observability notes.

### `evidence.json`

Use deterministic JSON. Include:

- Schema version.
- Inventory command.
- Tracked-file counts.
- File classifications and skipped-file reasons.
- Detected manifests, dependencies, frameworks, package scripts, API endpoints, UI routes, tests, infra, docs, doc references, and dependency usage evidence.
- Unknowns or stale-doc candidates when discovered.
