# Glossary

Consistent terminology for everything written from this repo. If a piece of content uses one of these concepts, use this word for it.

**Gate** — a checkpoint that work cannot pass without proof. Gates *block*; they don't advise. A gate the agent can talk its way past is a suggestion.

**Fail closed** — when proof is missing, inconclusive, or stale, the answer is *no* (no deploy, no push, no "done"). The opposite — proceeding because nothing said stop — is fail open, and is how agents ship regressions politely.

**Preflight** — a cheap check pass that runs *before* an expensive gate to convert predictable failures into work items. Preflights protect gate time; they never replace the gate.

**Canonical gate** — the one repo-blessed command that constitutes full local proof (e.g. `npm run verify`). If it didn't run, the work isn't verified, whatever else passed.

**Lane** — one isolated validation track inside a gate (static checks, unit, integration, browser/E2E, audit, build). Lanes run in containers; the host only orchestrates.

**Container-first / host-orchestrated** — the host may schedule Docker and read reports; only container output counts as evidence.

**Evidence** — artifacts that prove a claim: test output, coverage reports, screenshots, scan results, file/line references. Reviews and reports attach evidence per finding or say explicitly that they couldn't.

**Ledger** — a live table the agent must keep current during a task. *Acceptance ledger*: requirement → change → evidence → status. *Test ledger*: changed file → covering test. Ledgers are the anti-drift mechanism for long sessions.

**Completion blockers** — a skill section listing conditions under which the agent must not report success. The structural antidote to "looks done."

**Closed taxonomy** — a fixed classification vocabulary (`active / compatibility / superseded / dead / unknown`) that removes the agent's option to invent a soothing middle category.

**SHA lock** — recording the exact commit under review and re-checking it before any consequential action. Reviews approve *commits*, not branches.

**Promotion train** — the ordered, observable path a reviewed candidate takes to production (e.g. preview branch → deployment observed → smoke → main → observed → smoke). No stage advances if the previous one didn't prove out.

**Expand → deploy → contract** — the safe schema sequence: backward-compatible migration first, compatible code second, destructive cleanup in a later release.

**Learning profile** — per-repo memory of recurring failure signatures and required setup, updated by automation runs and read before the next one.

**Learning loop** — the nightly session-mining automation that proposes (and conservatively auto-applies) skill improvements. See [the pattern](../patterns/learning-loop.md).

**Sanitize / redact** — removing secret- and identity-shaped content *before* it persists anywhere shareable, with tested code rather than good intentions.

**Denylist scan** — a fail-closed grep for terms that must never appear in public content (names, hosts, IDs, paths). Cheap, dumb, extremely effective.

**Progressive disclosure** — keeping `SKILL.md` small and loading `references/` depth only when a workflow step needs it.

**Orchestrator / specialist** — the two skill roles: orchestrators sequence an engagement and account for coverage; specialists own one dimension and define "covered" for it.

**Constitution** — the workspace-level `AGENTS.md` that governs every repo underneath; repo-local rules may only tighten it.
