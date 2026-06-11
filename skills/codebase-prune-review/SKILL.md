---
name: codebase-prune-review
description: Review an existing codebase for redundant, legacy, dead, superseded, or attack-surface-increasing code paths and guide progressive removal with behavior mapping, test coverage, security review, and validation. Use when asked to remove old providers or integrations, clean redundant code paths, reduce tech debt, reduce attack surface, review dead code, retire obsolete routes, remove stale compatibility layers, or clean up after migrations such as Google Drive uploads to Vercel Blob.
---

# Codebase Prune Review

## Purpose

Use this skill to safely remove obsolete code from an existing repo without losing live functionality. It audits current behavior, classifies removal candidates, proves test coverage, removes in small layers, and validates after each layer.

This is not a generic refactor pass. The goal is to reduce tech debt and attack surface by retiring code paths that are proven superseded, dead, or no longer part of the live product.

## Operating Rules

- Start from current repo truth and live entrypoints. Prefer code, runtime config, package scripts, deployment config, tests, and workflows over historical docs.
- Build a behavior and ownership map before deleting anything.
- Classify each candidate as `active`, `compatibility`, `superseded`, `dead`, or `unknown`.
- Do not remove `unknown` paths until usage is disproven by references, tests, runtime config, logs, or explicit user confirmation.
- Add or update tests before removing a path when current behavior is not already covered.
- Remove one coherent layer at a time and run targeted tests after each layer.
- Keep rollback simple. Do not mix unrelated cleanup, formatting, dependency churn, or feature work into a prune layer.
- Use `$security-threat-model` when removals touch auth, uploads, parsers, webhooks, admin paths, secrets, provider clients, storage, payments, or deployment surfaces.
- Use `$test-readiness-preflight` before expensive validation and after each removal layer to clear predictable blockers.
- Use `$feature-design-preflight` when the prune follows a provider/platform replacement or migration whose new path still needs requirement tracing.

## Workflow

1. **Baseline the repo.** Read instructions, package scripts, deployment config, routes, jobs, API handlers, provider integrations, env examples, and tests. Use `references/discovery-checklist.md`.
2. **Map live behavior.** List the functionality that must remain unchanged, the entrypoints that serve it, the providers it depends on, and the tests that prove it.
3. **Classify candidates.** Mark each old path as `active`, `compatibility`, `superseded`, `dead`, or `unknown`. Record evidence for every classification.
4. **Build the proof plan first.** Map each behavior to unit, integration, browser/E2E, visual, migration, security, and local/container validation as applicable. Add missing tests before deletion.
5. **Remove progressively.** Follow `references/removal-layers.md`; remove one coherent layer, then run targeted tests. Update docs, env examples, fixtures, workflows, and dependency manifests as obsolete paths disappear.
6. **Validate and report.** Run the final local/container gate, dependency audit, containerized repo-scoped gitleaks, and security review when push/readiness is in scope. Use `references/evidence-report.md` for the completion report.

## Classification Rules

- `active`: Used by current production behavior, runtime config, route handling, jobs, tests, or documented release flow. Do not remove.
- `compatibility`: Preserved intentionally for migrations, old clients, rollback, data backfills, redirects, or external integrations. Keep unless a retirement plan exists.
- `superseded`: Replaced by a newer live path and no longer needed after compatibility obligations are satisfied. Remove in a planned layer.
- `dead`: No reachable runtime use, tests, config, imports, scripts, or deployment references. Remove once the evidence is recorded.
- `unknown`: Usage cannot be proven or disproven. Keep by default and ask for confirmation only after reasonable repo evidence is exhausted.

## Example Requests

- "Use `$codebase-prune-review` to remove old Google Drive upload paths now that this repo uses Vercel Blob."
- "Review this repo for superseded provider code and reduce attack surface."
- "Find legacy compatibility routes and produce a progressive removal plan with tests."
- "Clean redundant upload, webhook, and storage code after the migration."

## References

- Read `references/discovery-checklist.md` before proposing removal candidates.
- Read `references/removal-layers.md` before editing or deleting code.
- Read `references/evidence-report.md` for the behavior map, removal plan, and completion report format.
