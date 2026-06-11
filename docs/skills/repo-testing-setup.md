# repo-testing-setup

**The failure this prevents:** the plan was confirmed, the features were designed — and then implementation starts on a repo where tests run on whoever's machine, "verify" means something different to everyone, secret scanning doesn't exist, and the first PR gate run discovers all of it at once. Every downstream gate in this library assumes a foundation that nothing, until now, was responsible for building.

This skill designs and stands up how a repository proves itself — then refuses to call itself done until the new canonical gate runs green.

## What it does

The third stage of the build pipeline: `$clarify-before-build` agrees *what*, `$feature-design-preflight` designs *how it survives reality*, and this skill builds *how it gets proven* — before feature implementation begins.

1. **Gathers the inputs**: the Shared Understanding Contract and feature readiness notes (critical paths, providers, workflows fall out of them), plus discovered repo truth.
2. **Builds a gap map** against the standard — `present / partial / missing / substituted / not-applicable` per area. Greenfield is just a gap map where everything is missing.
3. **Drafts the Repo Testing Design**: tool matrix, test layers and coverage targets, critical-path and E2E inventories, production build/build-smoke lane, stub/fake plan for every provider, seeds and resets, the declared enforcement model, pinned tool policy, flake policy, security tooling, deployment branch policy, bounded runners.
4. **Waits for your confirmation.** Nothing mutates from a draft.
5. **Executes in verified layers**: ledgers and parallel-work decision → container lanes → canonical verify command → fast pre-commit lane → hooks (installed *and proven to fire*) → security tooling → stubs and seeds → deployment policy → runners and artifacts → the repo agent contract.
6. **Proves it**: fast lane green, then the full canonical gate green, in containers, end to end. Verdict: `adopted`, `adopted-with-exceptions`, or `blocked`.

## The design choices worth stealing

- **Containerization is non-negotiable, structurally.** A setup that leaves any lane host-only cannot reach `adopted` — host results are never canonical proof, on any machine, including yours.
- **Testing scope only.** It has no opinions about your folder layout or package structure. How the repo is organized is the repo's business; how it proves itself is this skill's business.
- **Design → confirm → execute.** The Repo Testing Design is a reviewable repo artifact and an explicit checkpoint — the skill rewires what runs on every commit, which is not something to do on a draft.
- **Local proof is canonical; CI never re-runs it.** GitHub is transport. Remote-only boundaries (like provider-managed encrypted secrets) get documented, not worked around.
- **The enforcement model is declared in writing.** Hook-owned proof (full pre-push) or gate-owned proof (slim hooks, the PR gate re-proves the exact SHA) — exactly one, in the tooling matrix.
- **Gate-owned proof is a first-class model.** When a parent or repo contract says a standalone gate owns exact-SHA proof, developer hooks stay slim and deterministic instead of duplicating the full gate before every push.
- **Hooks are proven, not just installed.** Layer 4's verification includes a deliberate violation to watch the hook actually block it.
- **Security setup is testing setup.** Repo-scoped containerized gitleaks, dependency audits, vulnerability scans — wired in the same pass, and the setup change itself gets a `$security-threat-model` look, because hook and CI/CD rewiring is attack surface.
- **Production build is a proof lane.** Buildable/runtime repos need a containerized production build or build-smoke check, not just tests and audits.
- **Artifacts have predictable names.** The skill writes `docs/testing/repo-testing-design.md`, `tooling-matrix.md`, `critical-path-inventory.md`, `e2e-workflow-inventory.md`, and `adoption-report.md` unless the repo already has a stricter convention.
- **Tool versions and flakes are part of proof.** Runner/scanner versions are pinned or exceptions are documented; retry-until-green is not accepted proof, and quarantines need expiry, owner, and tracking.
- **It tells the agents what it built.** The final layer writes the repo-local agent contract — `AGENTS.md` (merged into `CLAUDE.md` for Claude Code) recording the canonical command, enforcement model, and container-only rule — and records the workflow inventories as repo truth. Hooks enforce; the contract explains; the inventories inform. A rule the contract names must actually exist: no aspirational lines.
- **It closes the graph's last dead end.** `$test-readiness-preflight`'s "repo has no canonical gate" blocker now escalates here instead of stopping; the PR gate requires adoption before a repo joins its config.

## Install

```bash
scripts/install-skill.sh repo-testing-setup
```

Triggers on "design the testing approach," "containerize the tests," "set up security scanning," "this repo has no verify command" — or the short path, "audit this repo against the validation standard."

## Adapt it

- The tool matrix starts from the workspace defaults (the adoption template shipped with `$test-readiness-preflight`) — substitute per stack, but document every substitution in the design.
- If your team genuinely wants remote CI as a second opinion, add it — but keep local proof canonical, or the constitution's local-first rules stop meaning anything.
- The execution layers are ordered by dependency; keep the order even if you trim layers (deployment policy means nothing before the canonical command exists, and the agent contract comes last because it may only name what exists).
