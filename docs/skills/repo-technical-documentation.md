# repo-technical-documentation

**The failure this prevents:** agent-written docs read beautifully and assert confidently — including the parts the agent guessed. Six months later nobody can tell which sentences were verified against code and which were plausible filler, so the whole document is trusted at the level of its worst sentence.

This skill produces documentation where every material claim carries its epistemic status.

## What it does

Exhaustively documents a repo's technical reality — API endpoints, UI routes, frameworks and rationale, data models, integrations, jobs, testing, deployment, operations — as a split-doc package (default under `docs/repo-map/`) plus a machine-readable `evidence.json`:

1. **Baseline from repo truth**: tracked files via `git ls-files`, manifests, entrypoints, configs, workflows. A deterministic inventory helper (`scripts/repo_inventory.py`) does the first pass.
2. **Build the evidence map** — every subject backed by file paths, manifest entries, or config references.
3. **Reconcile existing docs**: compare documented claims against current evidence instead of writing a parallel truth.
4. **Write or update** using the documentation schema and templates.
5. **Validate**: every material statement has evidence or an explicit `unknown`; the evidence file is regenerated after writes.

## The design choices worth stealing

- **Confidence tags on every claim.** The closed taxonomy — `confirmed / inferred / stale-doc / unknown` — is the whole trick. "Inferred rationale" can never masquerade as fact, and existing docs that contradict the code get marked `stale-doc` rather than silently propagated.
- **`unknown` is a valid deliverable.** Unresolved rationale and ownership are recorded as unknowns instead of being papered over. Docs that admit gaps stay trustworthy.
- **Inventory-only for dangerous files.** Secret-like, generated, binary, and oversized files are path-inventoried but never read or quoted — `.env*` and credentials explicitly off-limits.
- **Update in place, don't duplicate.** Existing technical docs get reconciled and updated; the standard package is only created when nothing suitable exists. No second source of truth.
- **A documentation skill, not a review skill.** Findings-and-fix-plans are explicitly routed to `$full-app-review`. One job per skill.

## Install

```bash
scripts/install-skill.sh repo-technical-documentation
```

Triggers on "document this repo", architecture doc requests, stale-doc reconciliation, repo-map refreshes.

## Adapt it

- Adjust the default doc set in `references/output-templates.md` to your conventions (or point it at your existing docs tree).
- The `evidence.json` enables drift detection: re-run the inventory in CI and diff — docs that no longer match reality flag themselves.
- Pair with the [learning loop](../../docs/patterns/learning-loop.md): repos whose sessions keep hitting "where is X?" questions are repos this skill should visit.
