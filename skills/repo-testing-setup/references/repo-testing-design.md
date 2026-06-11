# Repo Testing Design Contract

The design document this skill produces and the user confirms before anything is executed. Persist it in the repo as `docs/testing/repo-testing-design.md` and keep it current — it is the testing foundation's source of truth, reviewable in git. Every section is required; write "not applicable" with a reason rather than omitting one. Use `repo-artifact-templates.md` for the companion file names and table shapes.

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
| Tool and runner version policy | | |
| Flake/quarantine policy | | |
| Agent contract and inventories | | |

## 4. Tool Matrix

Per validation layer: tool, purpose, container, exact local command, pinned version or image digest, update policy, status, and substitution reason if deviating from the workspace defaults. Start from the full default table in the `$test-readiness-preflight` adoption template; record only confirmed rows here. Persist the full matrix as `docs/testing/tooling-matrix.md`.

## 5. Test Layers and Coverage

- Unit: coverage thresholds (constitution floor `>=90%`; changed-scope target `>=95%`), margin policy for container/host variance.
- Integration: the critical-path inventory — derived from the Shared Understanding Contract's acceptance criteria and flows. Each path named and persisted as `docs/testing/critical-path-inventory.md`.
- Browser/E2E: the workflow inventory — every user-facing workflow, role, and mutation class the repo must prove, in `$user-action-coverage-review` matrix terms where user-facing. Persist as `docs/testing/e2e-workflow-inventory.md`.

## 6. Stubs, Fakes, and Test Data

- Every external provider present, with its stub/fake decision (tool, location, determinism notes).
- Live-provider lanes, if any: explicitly opt-in, non-canonical, documented.
- Seed/reset strategy: deterministic rebuild from committed migrations alone; run-scoped data; cleanup hooks.

## 7. Enforcement Model

Exactly one, declared:

- **Hook-owned proof**: pre-push runs the full canonical gate. Exact hook commands listed.
- **Gate-owned proof**: a PR production gate re-proves the exact candidate SHA; hooks stay slim (static + security + critical lanes); full verify before push is explicitly not run.

If a parent or repo-local agent contract says a standalone PR/release gate owns full proof, choose gate-owned proof unless the user explicitly overrides it. Include the hook install command and the verification command that proves hooks are active.

## 8. Security Setup

- Secret scan wrapper: exact repo-scoped containerized command.
- Audit commands per stack; vulnerability scan commands; image scan when images are built.
- `$security-threat-model` scope for the setup change itself (hooks, CI/CD, deploy policy are attack surface).
- Secret scan and vulnerability scan tooling versions or image digests, plus update cadence.

## 9. Deployment Policy and Remote CI Role

- Production deploys only via the git integration; platform config restricting deployable branches (e.g. `vercel.json`); branch classes when gate-owned.
- Remote CI role: none by default — local proof is canonical and is never re-run remotely. Any remote-only validation boundary (e.g. provider-managed encrypted secrets) documented here explicitly.

## 10. Bounded Runners and Artifacts

- Hard timeout, stall detection, and heartbeat per long-running lane.
- Artifact paths (reports, coverage, traces, screenshots, container logs); generated artifacts must not dirty tracked files.
- Retry policy: retry-until-green is not proof. Known flakes require quarantine with expiry, owner, tracking reference, and a rule that quarantined tests cannot guard deploy lanes.

## 11. Agent Contract and Inventories

- What the repo-local `AGENTS.md` (and `CLAUDE.md` where applicable) will record: canonical verify command, enforcement model, container-only rule, coverage thresholds, stub policy, secret-scan wrapper, deployment policy.
- Where the critical-path and E2E workflow inventories will live as committed files, so downstream skills read them as repo truth.

## 12. Acceptance Ledger, Test Ledger, and Parallel Work

- Acceptance ledger: each setup requirement, intended change, evidence, status (`pending`, `implemented`, `verified`, or `blocked`), and accepted deferred items.
- Test ledger: production/config files to change, focused verification for each, and the cheap check to run before moving to the next layer.
- Parallel Work decision: independent workers and disjoint ownership boundaries, or a concrete reason parallel agents are not applicable. The main agent owns integration, final ledger reconciliation, `$security-threat-model`, gitleaks, and final proof.

## 13. Version and Currency Policy

- Runner images, scanner images, package-manager tools, browser tooling, and base images: pinned version or digest, source for latest-stable check, date checked, update owner/cadence.
- Floating tags or unpinned tools: explicit exception reason and how reproducibility is preserved.

## 14. Exceptions and Deferred Items

Everything that makes the verdict `adopted-with-exceptions`: substitutions, deferred lanes, accepted risks — each with a reason and an owner decision.
