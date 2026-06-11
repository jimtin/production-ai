---
name: repo-testing-setup
description: Design-then-execute setup of a repository's complete testing and security validation foundation. Containerized lanes for every test layer, a canonical verify command, hook enforcement under a declared model, repo-scoped secret scanning, dependency and image audits, deterministic stubs for external providers, and deployment branch policy. Use after $clarify-before-build and $feature-design-preflight when a new project needs its testing approach designed, when a repo has no canonical containerized gate, when tests run on the host, or when security scanning is missing or mis-scoped. Produces a Repo Testing Design for explicit confirmation, then executes it, records the rules in the repo's agent contract (AGENTS.md/CLAUDE.md), and proves it with a green canonical gate run. Not for writing feature tests or fixing individual test failures — that is implementation work behind $test-readiness-preflight.
---

# Repo Testing Setup

## Purpose

Use this skill to design and stand up how a repository proves itself: every test layer containerized, the security toolset wired, hooks enforcing the gates, providers stubbed, and one canonical verify command that means the same thing on every machine.

The default flow is design → confirm → execute. The skill produces a Repo Testing Design, waits for explicit confirmation, then executes the setup in layers — and is finished only when the new canonical gate runs green. The final verdict is one of `adopted`, `adopted-with-exceptions` (documented substitutions or deferred items), or `blocked`.

## Pipeline Position

This is the third stage of the build pipeline: `$clarify-before-build` agrees what to build, `$feature-design-preflight` designs features against reality, and this skill designs the testing foundation those features will be proven against — before feature implementation begins.

- Consume the upstream artifacts when they exist: the Shared Understanding Contract supplies critical paths, roles, and acceptance criteria; feature readiness notes supply the providers to stub, the failure modes to test, and the E2E workflows to inventory.
- This skill covers testing, validation, and security setup only. Folder layout, package structure, and application scaffolding are not its business — how the repo is organized belongs to the repo; how it proves itself belongs here.
- It runs roughly once per repo. When a repo is already adopted, run the short path: re-audit against the standard and report deltas (`present / partial / missing / substituted / not-applicable` per area) instead of redoing setup.

## Operating Rules

- Containerization of all testing is non-negotiable. The host may orchestrate Docker, Compose, package scripts, and checked-in wrappers; every lint, test, audit, build, and browser lane executes in containers. Host-run results are never canonical proof, and a setup that leaves any test lane host-only is incomplete.
- Start from repo truth and preserve repo-native entrypoints. Discover existing commands, hook frameworks, compose files, and CI before adding anything; never force a new hook framework when the established one can enforce the same behavior.
- Local proof is canonical; remote CI never re-runs it. GitHub is transport. Any remote-only check (e.g. provider-managed encrypted secrets) is documented explicitly as a remote-only boundary, not mirrored locally by workaround.
- Deployment branch policy is part of setup for production-bound repos: production deploys only via the git integration, platform config restricting deployable branches, and the dev/preview/production branch classes when the repo will be gate-owned.
- Every external provider present in the repo gets a deterministic stub or fake decision — auth, payments, email, storage, analytics, LLMs, queues, webhooks, third-party APIs. Live-provider validation is explicitly non-canonical and opt-in.
- The enforcement model is declared, not implied: hook-owned proof (full pre-push) or gate-owned proof (slim hooks, the PR gate re-proves the exact candidate SHA). Exactly one, recorded in the tooling matrix.
- Secret scanning is repo-scoped and containerized from day one: resolve the git repo root, mount it read-only, never scan a workspace parent.
- Coverage thresholds meet or exceed the workspace constitution (`>=90%` unit; critical paths under integration; user actions under browser/E2E). Setup never lowers a standard to make adoption easier — substitutions are documented, not silent.
- Design before mutation. Nothing is installed, rewritten, or committed until the Repo Testing Design is explicitly confirmed.
- The setup is not done until agents are told about it. The repo-local agent contract (`AGENTS.md`, merged into `CLAUDE.md` where Claude Code is in use) must record what the foundation established — the canonical verify command as the only acceptable full proof, the declared enforcement model, container-only validation, coverage thresholds, stub policy, the secret-scan wrapper, and the deployment policy. It states only commands and rules that actually exist: no aspirational lines.

## Workflow

1. **Gather inputs.** Read the Shared Understanding Contract and feature readiness notes when they exist. Discover repo truth — package scripts, lockfiles, test configs, compose files, hook configs, CI workflows, platform config — using the repo-discovery reference shipped with `$test-readiness-preflight`.
2. **Build the gap map.** For each area of the standard (test layers, containerization, canonical command, hooks, secret scanning, audits, stubs, seeds, deployment policy, runners/artifacts), classify the repo's current state: `present`, `partial`, `missing`, `substituted`, or `not-applicable` with a reason. Greenfield repos are a gap map where everything is `missing` — same workflow, shorter discovery.
3. **Draft the Repo Testing Design.** Use `references/repo-testing-design.md` as the contract. Derive the critical-path integration inventory and E2E workflow inventory from the upstream artifacts; the tool matrix starts from the workspace defaults (the adoption template shipped with `$test-readiness-preflight` carries the full table) with substitutions justified per row.
4. **Confirm.** Present the design and wait for explicit confirmation. Material changes during execution reopen the design.
5. **Execute in layers.** Follow `references/execution-checklist.md`: container lanes and inner commands → canonical verify command → fast pre-commit lane → hook installation with active verification → security tooling → stubs, fakes, and seeds → deployment branch policy → bounded runners and artifact paths → the repo agent contract. Verify each layer with its cheap check before the next.
6. **Prove it.** Run the fast lane, then the full canonical gate, in containers, to green. A setup whose own gate has never passed is not a setup.
7. **Record and hand off.** Commit the tooling matrix, the design document, and the critical-path and E2E workflow inventories into the repo (e.g. `docs/testing/`) — they become the repo-native truth that `$user-action-coverage-review` and the gate read instead of re-deriving. Declare the verdict. From here, `$test-readiness-preflight` has a canonical gate to preflight, and the repo is eligible for `$pr-production-gate` configuration.

## Security Setup

The security layer is part of testing setup, not an optional extra:

- Repo-scoped containerized gitleaks wrapper, wired into the fast lane and the full gate.
- Dependency audit (stack-native), `osv-scanner`, and `trivy fs`; `trivy image` when the repo builds runtime images.
- `$security-threat-model` for the setup change itself when it touches CI/CD, deployment policy, or hook execution paths — this skill rewires what runs on every commit, which is attack surface.

## No User Available

Invoked headless, this skill stops at the design:

- Produce the gap map and the Repo Testing Design labeled `DRAFT - not confirmed`.
- Never install hooks, rewrite scripts, or change platform config without confirmation.
- In a gate or automation context, a repo without an adopted testing foundation is reported `blocked` — not silently set up.

## Completion Blockers

Do not declare `adopted` while any of these are true:

- Any test, lint, audit, build, or browser lane executes on the host as canonical proof.
- A tooling-matrix row lacks its container, its exact command, or a documented exception.
- Hooks are not both installed and verified active (an install command that was never verified does not count).
- A security layer — secret scan, dependency audit, vulnerability scan — is absent without a documented substitute.
- The secret-scan command could scan outside the repo root.
- An external provider present in the repo has no stub/fake decision.
- The enforcement model is undeclared, or a production-bound repo has no deployment branch policy.
- The canonical gate has not run green since setup completed.
- Execution started without a confirmed design (interactive), or a headless run mutated anything at all.
- The design document and tooling matrix are not committed to the repo.
- The repo-local agent contract does not record the canonical gate, the enforcement model, and the container-only rule — or records commands that do not exist.
- The critical-path and E2E workflow inventories are not committed as repo-native files.

## Example Prompts

- "Use `$repo-testing-setup` to design the testing approach for this new project."
- "This repo's tests run on my machine directly — containerize the whole validation story."
- "Set up the full security scanning and hooks for this repo."
- "We finished planning and feature design — stand up the repo's testing foundation."
- "Audit this repo against the validation standard and tell me the gaps." (short path: gap map only)

## References

- `references/repo-testing-design.md`: the design document contract — every section the design must contain.
- `references/execution-checklist.md`: the ordered execution layers, per-layer verification, and final proof requirements.
- The full default tool matrix and adoption worksheet ship with `$test-readiness-preflight` (repo-quality-gate-adoption template); this skill consumes them rather than duplicating the table.

## Used By

`$clarify-before-build` schedules this skill before feature implementation when the plan targets a new repo or one without a canonical gate. `$test-readiness-preflight` escalates here when it finds no canonical gate to preflight. `$pr-production-gate` requires a repo to be adopted before it joins the gate's configuration.
