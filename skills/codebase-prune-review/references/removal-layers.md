# Removal Layers

Remove obsolete code in small, coherent layers. Each layer should have a clear reason, limited file scope, targeted tests, and a simple rollback.

## Required Sequence

1. **Protect current behavior.** Add or update tests for the replacement path and any behavior that must remain unchanged.
2. **Remove unreachable UI entrypoints.** Delete obsolete links, pages, forms, buttons, or route entries only after browser coverage proves the live flow.
3. **Remove dead services and helpers.** Delete unused client wrappers, service functions, adapters, validators, mappers, and mocks after import/reference checks.
4. **Remove obsolete API routes, webhooks, jobs, and workers.** Treat upload, parser, auth, payment, storage, and admin surfaces as security-sensitive.
5. **Remove provider config and env references.** Clean typed env modules, `.env.example`, docs, CI variables, deployment scripts, and feature flags only after runtime code no longer needs them.
6. **Remove obsolete dependencies.** Update manifests and lockfiles together after all imports and scripts are gone.
7. **Remove stale tests, fixtures, snapshots, and docs.** Keep replacement-path tests. Remove old-path tests only when they assert behavior that no longer exists.

## Layer Gate

Before each layer:

- Confirm candidates are not `active` or `unknown`.
- Confirm tests exist for behavior that must remain.
- Identify targeted tests and cheap coverage checks.
- Identify whether `$security-threat-model` is needed for the layer.

After each layer:

- Run targeted unit/integration/browser tests for affected behavior.
- Run static checks that quickly catch broken imports or route references.
- Run `$test-readiness-preflight` before expensive validation when the layer is substantial.
- Record what was removed, what stayed, and why.

## High-Risk Removals

Use extra care and `$security-threat-model` for:

- Auth/authz, admin tooling, tenant boundaries, impersonation, sessions, and middleware
- Uploads, downloads, file parsing, storage deletion, signed URLs, and background processing
- Webhooks, payment flows, billing state, provider callbacks, queues, and cron jobs
- Deployment scripts, CI/CD, secrets, env loading, feature flags, and database migrations

High-risk paths can still be removed, but only with explicit behavior mapping, targeted regression tests, security review, and final local/container validation.

## Do Not Remove By Default

- `unknown` paths
- Compatibility code with a current rollback, migration, redirect, or external-client purpose
- Generated files unless the repo documents regeneration and the generated output is updated consistently
- Shared helpers that still have dynamic or indirect use that cannot be disproven
