# Discovery Checklist

Use this checklist to build a repo-grounded behavior and ownership map before removing code. Prefer `rg` and repo scripts over broad manual inspection.

## Repo Rules and Shape

- Read parent and repo-local `AGENTS.md`, current workflow docs, release docs, and package scripts.
- Inspect `git status --short`, branch, staged changes, unstaged changes, and untracked files.
- Identify the canonical local/container gate, faster targeted test commands, dependency audit, and secret scan wrapper.
- Locate current deployment config: Vercel, Docker, GitHub Actions, cron, workers, queues, serverless routes, and release scripts.

## Live Entrypoints

- Routes and pages: `app/**`, `pages/**`, `src/app/**`, `src/pages/**`, router config, middleware, redirects, rewrites.
- API and backend: route handlers, controllers, services, RPC handlers, webhooks, server actions, jobs, workers, CLIs, scheduled tasks.
- UI flows: navigation, forms, admin/user portals, settings, upload/download flows, billing, auth, onboarding, dashboards.
- Runtime config: `vercel.json`, Docker/Compose files, process managers, worker configs, cron configs, queue consumers.

## Provider and Integration Traces

- Search package manifests and lockfiles for old and new providers.
- Search imports and literals for SDKs, env var names, domains, route names, webhook names, bucket names, feature flags, and provider-specific error messages.
- Inspect `.env.example`, typed env modules, config loaders, secret names in CI/deploy scripts, and docs. Do not open or paste secret values.
- Check tests, mocks, fixtures, snapshots, webhook samples, and generated clients for old provider assumptions.

Useful patterns:

```sh
rg -n "google|drive|gdrive|vercel blob|blob|s3|cloudinary|mux|stripe|clerk|webhook|upload|storage|bucket|token|secret|legacy|deprecated|compat|TODO|remove" .
rg -n "process\\.env|NEXT_PUBLIC_|DATABASE_URL|WEBHOOK|BUCKET|BLOB|DRIVE|GOOGLE|S3|STORAGE" .
rg -n "cron|schedule|queue|worker|job|webhook|upload|download|sync|ingest|import|export" package.json .github scripts src app server .
```

## Test and Behavior Evidence

- Map critical behavior to existing unit, integration, and browser/E2E tests.
- Identify replacement-path tests before removing old-path tests.
- Confirm local test data, fixtures, auth state, storage state, and provider mocks are deterministic.
- Mark gaps where tests must be added before deletion.

## Candidate Evidence Standard

For every removal candidate, collect:

- Candidate path or integration name
- Classification: `active`, `compatibility`, `superseded`, `dead`, or `unknown`
- Evidence: imports, routes, config, tests, docs, runtime/deployment references, or absence of references
- Required tests before removal
- Security/attack-surface impact
- Rollback or compatibility risk
- When a migration appears complete, search for old provider traces in routes, env vars, tests, fixtures, docs, scripts, webhooks, and deployment config before calling the cleanup done.
