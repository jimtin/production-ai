# Discovery Checklist

Use this checklist to make the repo pass exhaustive without turning it into a remediation review.

## Baseline

- Applicable parent and repo-local `AGENTS.md`, README files, and docs.
- `git status --short --untracked-files=all`.
- `git ls-files` inventory, including path-inventory-only files that are sensitive, binary, generated, unreadable, or oversized.
- Package managers, lockfiles, workspaces, monorepo packages, source roots, test roots, and scripts.
- Existing technical docs and runbooks that need reconciliation.

## API and Service Surface

- HTTP route handlers, framework route files, API folders, controller modules, RPC handlers, webhooks, GraphQL schemas/resolvers, OpenAPI specs, and generated clients.
- For each endpoint: method, path, handler file, auth/role expectation, input validation source, response shape source, persistence boundary, external calls, tests, and docs.
- API-only E2E or service-journey clients.

## UI Surface

- Route trees, pages, layouts, client components, navigation shells, role-specific portals, modals, forms, tables, dashboards, and major mutations.
- Design system sources: component libraries, styling framework, tokens/theme files, icon libraries, charts, typography, and layout primitives.
- For each route or screen: path, entry component, role/persona, user actions, state coverage, responsive/mobile relevance, and browser/E2E evidence.

## Frameworks and Libraries

- Runtime frameworks, build tools, test runners, linters/formatters, component systems, data clients, auth/storage/email/payment/LLM providers, logging/observability, queues/jobs, deployment adapters, and scripts.
- For each material dependency: package/tool name, manifest evidence, usage evidence, why it appears to be used, replacement/supersession signals, and confidence tag.
- If rationale is not evidenced by repo usage or docs, mark `unknown`.

## Data, Integrations, and Jobs

- Schemas, migrations, ORM/client config, seed files, fixtures, background jobs, cron/workflow definitions, queues, caches, storage buckets, webhook consumers, provider adapters, and local stubs/fakes.
- Record local-vs-live provider policy, test doubles, and any remote-only validation gaps.

## Validation and Operations

- Canonical local/container validation commands, hooks, CI workflows, Docker/Compose files, artifact locations, coverage thresholds, dependency audits, secret scans, and release/deploy commands.
- Observability/error instrumentation, dashboards/runbooks if documented, log redaction rules, alerting paths, and local failure reproduction steps.

## Documentation Reconciliation

- Compare existing docs to current repo evidence.
- Classify every material mismatch:
  - `confirmed`: current repo evidence supports the claim.
  - `inferred`: repo usage supports a likely rationale, but no direct statement exists.
  - `stale-doc`: docs describe a path, command, provider, or behavior no longer present.
  - `unknown`: reasonable inspection did not resolve the claim.
