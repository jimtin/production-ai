---
name: repo-technical-documentation
description: Exhaustively document an existing repository's technical architecture and implementation details. Use when asked to work through a whole repo and create, update, reconcile, or refresh technical docs covering API endpoints, UI routes and choices, frameworks, libraries and rationale, data models, integrations, jobs, testing, deployment, observability, operational scripts, or stale documentation.
---

# Repo Technical Documentation

## Purpose

Use this skill to produce durable, repo-grounded technical documentation. The default output is split Markdown docs plus a machine-readable evidence file. Existing technical docs are updated in place when they exist; otherwise create the standard package under `docs/repo-map/`.

This is a documentation and inventory skill, not a remediation review. Use `$full-app-review` when the user wants prioritized findings or a fix plan.

## Operating Rules

- Start from repo truth: applicable `AGENTS.md`, tracked files, manifests, source entrypoints, tests, docs, configs, scripts, workflows, and deployment files.
- Enumerate git-tracked files by default with `git ls-files`. Consider every tracked file, but path-inventory only for secret-like, generated/build, binary, unreadable, or oversized files.
- Never print or document secret values. Do not read `.env*`, credential, token, private-key, local provider state, or similar files unless the user explicitly provides a safe fixture.
- Tag every material claim as `confirmed`, `inferred`, `stale-doc`, or `unknown`. Do not present inferred rationale as fact.
- In Plan Mode or report-only requests, do not write docs. Return the proposed doc targets and update plan instead.
- Prefer updating existing technical docs over creating duplicate docs. If no suitable docs exist, create `docs/repo-map/`.
- Keep generated artifacts deterministic and repo-contained. Do not dirty unrelated tracked files.

## Workflow

1. **Baseline the repo.**
   - Read parent and repo-local instructions.
   - Check `git status --short --untracked-files=all`.
   - Identify existing technical docs, source roots, test roots, package managers, deployment targets, and canonical validation commands.
   - Run this skill's helper, `skills/repo-technical-documentation/scripts/repo_inventory.py <repo> --format json`, for a deterministic first-pass fact inventory when useful.

2. **Build the evidence map.**
   - Use `references/discovery-checklist.md`.
   - Map API endpoints, UI routes, user actions, frameworks, libraries, data schemas, integrations, auth/roles, jobs, scripts, tests, deployment/runtime, observability, and docs.
   - Record evidence as file paths, line references when inspected directly, manifest entries, config files, and test/doc references.

3. **Reconcile existing docs.**
   - Find docs that already describe architecture, APIs, routes, dependencies, operations, testing, or runbooks.
   - Compare documented claims with current repo evidence.
   - Mark missing current facts as `confirmed`, outdated claims as `stale-doc`, inferred rationale as `inferred`, and unresolved rationale or ownership as `unknown`.

4. **Write or propose docs.**
   - Use `references/documentation-schema.md` for required sections and confidence labels.
   - Use `references/output-templates.md` for the split-doc package.
   - Default files under `docs/repo-map/` are:
     - `README.md`
     - `api-inventory.md`
     - `ui-inventory.md`
     - `dependencies-and-rationale.md`
     - `data-integrations-and-jobs.md`
     - `validation-and-operations.md`
     - `evidence.json`
   - If existing docs cover the same subjects, update those files and add only missing companion files.

5. **Validate the documentation.**
   - Confirm every material statement has evidence or an explicit `unknown`.
   - Re-run the inventory helper after writes and verify `evidence.json` is current.
   - Run lightweight doc checks available in the repo, such as markdown lint or link checks, before broader validation.

## Output Expectations

Completion reports must include:

- Docs created or updated.
- Repo truth discovered.
- Existing docs reconciled and stale claims removed or marked.
- Evidence commands run.
- Gaps left as `unknown`.
- Validation results and any blocked checks.

## References

- `references/discovery-checklist.md`: what to inspect during the repo pass.
- `references/documentation-schema.md`: confidence tags, evidence rules, and required doc sections.
- `references/output-templates.md`: Markdown and JSON output templates.
- `scripts/repo_inventory.py`: deterministic tracked-file inventory helper.
