# Repo Testing Design Contract

The design document this skill produces and the user confirms before anything is executed. Persist it in the repo (e.g. `docs/testing/repo-testing-design.md`) and keep it current — it is the testing foundation's source of truth, reviewable in git. Every section is required; write "not applicable" with a reason rather than omitting one.

## 1. Status

`DRAFT - not confirmed` or `CONFIRMED <date>` — execution may only begin from `CONFIRMED`. After execution, append the final verdict: `adopted`, `adopted-with-exceptions`, or `blocked`.

## 2. Inputs Consumed

- Shared Understanding Contract: path or "none — repo predates planning artifacts".
- Feature readiness notes consumed (providers, failure modes, workflows extracted).
- Repo truth discovered: package manager, frameworks, existing commands, hook framework, compose files, CI workflows, platform config.

## 3. Gap Map

| Area | Current state | Target |
|---|---|---|
| Unit lane (containerized) | `present / partial / missing / substituted / not-applicable` | |
| Integration lane (containerized, local services) | | |
| Browser/E2E lane (containerized) | | |
| Static checks lane | | |
| Canonical verify command | | |
| Fast pre-commit lane | | |
| Hook enforcement (installed + verified) | | |
| Secret scanning (repo-scoped, containerized) | | |
| Dependency / vulnerability audits | | |
| Provider stubs and fakes | | |
| Test data, seeds, resets | | |
| Deployment branch policy | | |
| Bounded runners and artifacts | | |

## 4. Tool Matrix

Per validation layer: tool, purpose, container, exact local command, substitution reason if deviating from the workspace defaults. Start from the full default table in the `$test-readiness-preflight` adoption template; record only confirmed rows here.

## 5. Test Layers and Coverage

- Unit: coverage thresholds (constitution floor `>=90%`; changed-scope target `>=95%`), margin policy for container/host variance.
- Integration: the critical-path inventory — derived from the Shared Understanding Contract's acceptance criteria and flows. Each path named.
- Browser/E2E: the workflow inventory — every user-facing workflow, role, and mutation class the repo must prove, in `$user-action-coverage-review` matrix terms where user-facing.

## 6. Stubs, Fakes, and Test Data

- Every external provider present, with its stub/fake decision (tool, location, determinism notes).
- Live-provider lanes, if any: explicitly opt-in, non-canonical, documented.
- Seed/reset strategy: deterministic rebuild from committed migrations alone; run-scoped data; cleanup hooks.

## 7. Enforcement Model

Exactly one, declared:

- **Hook-owned proof**: pre-push runs the full canonical gate. Exact hook commands listed.
- **Gate-owned proof**: a PR production gate re-proves the exact candidate SHA; hooks stay slim (static + security + critical lanes); full verify before push is explicitly not run.

Include the hook install command and the verification command that proves hooks are active.

## 8. Security Setup

- Secret scan wrapper: exact repo-scoped containerized command.
- Audit commands per stack; vulnerability scan commands; image scan when images are built.
- `$security-threat-model` scope for the setup change itself (hooks, CI/CD, deploy policy are attack surface).

## 9. Deployment Policy and Remote CI Role

- Production deploys only via the git integration; platform config restricting deployable branches (e.g. `vercel.json`); branch classes when gate-owned.
- Remote CI role: none by default — local proof is canonical and is never re-run remotely. Any remote-only validation boundary (e.g. provider-managed encrypted secrets) documented here explicitly.

## 10. Bounded Runners and Artifacts

- Hard timeout, stall detection, and heartbeat per long-running lane.
- Artifact paths (reports, coverage, traces, screenshots, container logs); generated artifacts must not dirty tracked files.

## 11. Agent Contract and Inventories

- What the repo-local `AGENTS.md` (and `CLAUDE.md` where applicable) will record: canonical verify command, enforcement model, container-only rule, coverage thresholds, stub policy, secret-scan wrapper, deployment policy.
- Where the critical-path and E2E workflow inventories will live as committed files (e.g. `docs/testing/`), so downstream skills read them as repo truth.

## 12. Exceptions and Deferred Items

Everything that makes the verdict `adopted-with-exceptions`: substitutions, deferred lanes, accepted risks — each with a reason and an owner decision.
