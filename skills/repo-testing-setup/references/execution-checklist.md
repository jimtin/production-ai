# Execution Checklist

Run only from a `CONFIRMED` design. Execute in order; verify each layer with its cheap check before starting the next. A layer whose verification fails is fixed before proceeding — never skipped. Keep the acceptance ledger and test ledger current while executing, not only in the final report.

## Layer 0 — Ledgers and Parallel Work

- Create the acceptance ledger from the confirmed design: requirement, intended change, evidence, status, and accepted deferrals.
- Create the test ledger before changing production/config files: changed file or surface, focused verification, cheap check, and status.
- Record the Parallel Work decision. If workers are used, give each disjoint file ownership, expected evidence, and a reminder not to revert others' edits. The main agent owns integration and final proof.
- Verify: every design requirement has a ledger row, every planned edit has test evidence, and parallel work is either assigned or explicitly not applicable.

## Layer 1 — Container lanes

- Stand up the test/tool containers: compose services or runner images for unit, integration, browser/E2E, static checks, and audits.
- Inner-container commands documented separately and marked not-for-host use.
- Pin runner and scanner images or record the exception and update policy in the tooling matrix.
- Verify: each lane runs standalone in its container against the current repo state.

## Layer 2 — Canonical verify command

- One authoritative full-gate entrypoint (`npm run verify`, `make verify`, or repo-native equivalent) that orchestrates every lane in containers.
- Verify: the command exists, is checked in, and is documented as the only acceptable full proof.

## Layer 3 — Fast pre-commit lane

- Static checks + fast security checks (+ unit smoke only if it stays quick and deterministic).
- Verify: cold and warm timings recorded; fast enough to run on every commit without resentment.

## Layer 4 — Hooks

- Install through the repo-native hook framework; wire pre-commit to the fast lane and pre-push per the declared enforcement model (full gate, or slim lanes when gate-owned).
- In gate-owned repos, developer pre-push must not duplicate the standalone full gate unless the repo contract explicitly requires it; it should run the repo's slim hook lanes and leave exact-SHA full proof to the gate.
- Hooks fail closed when Docker or required containers are unavailable.
- Verify: the hooks-active verification command passes; a deliberate violation is actually blocked (prove the hook fires, not just that it exists).

## Layer 5 — Security tooling

- Repo-scoped containerized gitleaks wrapper; stack-native dependency audit; `osv-scanner`; `trivy fs`; `trivy image` when images are built.
- Pin tool images or exact package versions where feasible; when not feasible, document the update policy and reproducibility tradeoff.
- Verify: each command runs green (or findings are triaged); the secret-scan command cannot scan outside the repo root.

## Layer 6 — Stubs, fakes, seeds

- Deterministic test doubles for every provider in the design; seed/reset commands that rebuild from committed migrations alone.
- Verify: integration and E2E lanes pass against stubs with no network egress to live providers.

## Layer 7 — Deployment branch policy

- Platform config restricting production deploys to the git integration; branch classes per the enforcement model.
- Verify: config is committed; a non-production branch cannot reach production by policy.

## Layer 8 — Bounded runners and artifacts

- Timeouts, stall detection, heartbeats on long lanes; stable artifact paths; generated output ignored by git.
- Define the flake policy: retry-until-green is not accepted proof; quarantines need expiry, owner, tracking reference, and must not guard deploy lanes.
- Verify: a full run leaves the tree clean (`git status` empty apart from intended commits).

## Layer 9 — Agent contract

- Write or update the repo-local `AGENTS.md` (merge into `CLAUDE.md` where Claude Code operates in the repo) recording: the canonical verify command as the only acceptable full proof, the declared enforcement model (including "do not run the full verify before push" when gate-owned), container-only validation, coverage thresholds, stub/live-provider policy, the secret-scan wrapper, and the deployment policy.
- Commit the critical-path and E2E workflow inventories from the design as repo-native files alongside `docs/testing/repo-testing-design.md`, `docs/testing/tooling-matrix.md`, and `docs/testing/adoption-report.md`.
- Verify: every command the contract names exists and runs; no aspirational rules — the same "delete every rule you won't enforce" principle as the workspace constitution.

## Final Proof

1. Fast lane green.
2. Full canonical gate green, in containers, end to end.
3. Acceptance ledger and test ledger reconciled: every row is `verified`, `blocked`, or explicitly deferred in the design exceptions.
4. Tooling matrix, design document, workflow inventories, adoption report, and the agent contract committed to the repo.
5. Verdict declared: `adopted` or `adopted-with-exceptions` (with the exceptions/deferred-items section of the design filled in).

## Hand-offs

- `$test-readiness-preflight` now preflights against the new canonical gate, and agents landing in the repo read the contract that explains it.
- `$user-action-coverage-review` builds its matrix from the committed workflow inventories instead of re-deriving them.
- `$pr-production-gate` may add the repo to its configuration.
- Any deferred item from the design's exceptions section becomes scheduled work, not a silent gap.
