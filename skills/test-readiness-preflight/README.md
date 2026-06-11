# test-readiness-preflight

**The failure this prevents:** the agent finishes a feature, launches the 20-minute containerized full gate, and it dies in minute two on something entirely predictable — an unapplied migration, a missing Playwright browser, a stale seed, coverage that was never going to clear 90%. Repeat four times and an afternoon is gone, with the agent treating each failure as a surprise.

This skill converts predictable validation failures into implementation tasks *before* the expensive gate runs.

## What it does

A mandatory cheap pass before full-suite/container/E2E/push validation:

1. Load repo requirements (instructions, scripts, test configs, compose files, migrations).
2. Inventory changed scope and map it to required unit / integration / browser coverage — adding missing tests now, not after the gate fails.
3. Prepare data: deterministic resets, seeds, migrations applied, fixtures matching schema.
4. Prepare tooling: lockfiles, containers, browsers, env, test doubles, ports.
5. Run only preflight-level checks (types, focused tests, migration status) until the checklist is clean.
6. Declare readiness with the exact full-gate command to run next.

## The design choices worth stealing

- **"A coverage failure is not a stop condition."** The skill's most distinctive rule. Failures get classified — changed-code gap, inherited debt, mis-scoped denominator, command misuse, host/container variance — and each class has a prescribed response (`references/coverage-failure-response.md`). The agent is banned from both lowering thresholds *and* from stopping with "coverage is blocking."
- **Coverage margin, not coverage exactly.** Container and host runtimes count branches differently; a host result of exactly 90.00% is treated as too fragile to start the container gate.
- **Schema changes are release work.** The preflight refuses push-readiness while app code depends on schema that isn't committed, applied locally, and sequenced expand → deploy → contract for production.
- **Secret scans are scoped and containerized.** The skill hard-bans running gitleaks from `/`, `$HOME`, or any workspace parent — the repo root gets resolved and mounted read-only. (This rule exists because the failure happened.)
- **Failure patterns are a catalog.** `references/common-failure-patterns.md` is a symptom → root cause → response table that grows every time the gate finds something the preflight should have caught.

## Install

```bash
cp -R skills/test-readiness-preflight ~/.codex/skills/
```

Triggers before full verification or push-readiness, and after substantial implementation.

## Adapt it

- Set the coverage thresholds and margin policy to your repo's reality.
- `references/repo-quality-gate-adoption-template.md` is a complete worksheet for bringing a repo up to containerized-gate standard — tool matrix, hook policy, stub policy, artifact policy. Adopt repos with it.
- Grow the failure-pattern catalog from your own gate logs; that's where its value compounds.
