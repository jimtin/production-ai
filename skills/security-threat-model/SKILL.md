---
name: security-threat-model
description: Evidence-grounded threat modeling for a repository, subsystem, or automation. Builds a system model from the actual code, derives trust boundaries and assets, enumerates realistic abuse paths with likelihood/impact priorities, and writes a reviewable Markdown threat model. Use when asked to threat model a codebase or path, enumerate threats or abuse paths, assess attack surface, or when another skill escalates security-sensitive scope (auth, uploads, parsers, webhooks, payments, secrets, admin paths, deployment, CI/CD) before push-readiness. Do not use for generic code review, compliance paperwork, or non-security design discussion.
---

# Security Threat Model

## Purpose

Produce a written threat model that is specific to the target system — grounded in files that exist, attackers that are realistic, and impacts that matter — and save it as `<target-name>-threat-model.md`. The default outcome is a report and a prioritized mitigation list. This skill does not change code; remediation is separate work.

The quality bar: a reader who knows the repo should recognize every component, and a reader who knows security should find no threat they cannot trace to a boundary and an asset.

## Operating Rules

- Start from repo truth: entrypoints, route handlers, jobs, parsers, configs, deployment files, CI workflows. Do not model from the README alone.
- Tag every material claim `confirmed` (file evidence), `inferred` (reasonable reading of evidence), or `unknown`. Never present inferred architecture as fact.
- Model the system that runs. Separate runtime surface from build/CI/dev tooling and from tests/examples — they have different attackers and different blast radii.
- Calibrate the attacker. State capabilities *and* non-capabilities explicitly; severity inflation comes from imaginary attackers with unlimited access.
- Prefer a small set of high-quality abuse paths over a long generic checklist. Every threat must name the boundary it crosses and the asset it reaches.
- Existing mitigations need evidence; recommended mitigations need a location and a control type. No "validate inputs" hand-waving.
- In interactive work, pause before final priorities: surface the ranking-critical assumptions to the user and ask up to 3 targeted questions. If the user cannot answer, keep the assumptions listed and mark affected priorities conditional.
- In headless or gate contexts, do not wait for user input and do not fabricate answers. Record ranking-critical assumptions as `unvalidated`, mark affected priorities conditional, and fail closed only when an unknown prevents a defensible risk decision.
- Do not paste secrets, tokens, or sensitive payloads into the report — reference their locations instead.

## Workflow

1. **Scope the target.** Record the repo or path in scope, what is explicitly out of scope, how the system runs (server, CLI, worker, library, agent automation), deployment model, and internet exposure as far as evidence shows.
2. **Build the system model.** Enumerate components, entrypoints (endpoints, upload surfaces, parsers, job triggers, admin tooling, webhooks), data stores, and external integrations — each with a file-path evidence reference and a confidence tag. Use `references/surface-checklists.md` when the target touches modern web, agent, CI/CD, file/media, LLM, scheduler, or provider-token surfaces.
3. **Derive boundaries and assets.** Trust boundaries are concrete edges between components: note the protocol, authentication, validation, and rate limiting observed on each. Assets are whatever drives real risk: credentials, tokens, PII, tenant data, integrity-critical state, deploy/CI control, compute, audit logs. Use `references/boundaries-assets-controls.md` when surveying.
4. **Calibrate the attacker.** From exposure and usage, state what a realistic attacker can do (anonymous internet client, authenticated tenant, malicious PR author, compromised dependency) and what they cannot. Non-capabilities are part of the model.
5. **Enumerate abuse paths.** For each attacker goal, trace the path: entrypoint → boundary crossed → asset reached → impact. Classify each path with the closed taxonomy below. Keep the list short and real.
6. **Prioritize.** Assign likelihood and impact (`low / medium / high`, one line of justification each), then priority `critical / high / medium / low` from the combination, adjusted for existing controls that have evidence. Name the assumptions that most influence the ranking.
7. **Validate assumptions.** In interactive work, present the ranking-critical assumptions and up to 3 questions (exposure, tenancy, data sensitivity, who can trigger what), then wait for answers before finalizing. In headless or gate contexts, record those assumptions as unvalidated instead of waiting.
8. **Recommend mitigations.** Two lists, never merged: existing mitigations with their evidence, and recommended mitigations each tied to an abuse path, a concrete location, and a control type (authorization check, schema validation, sandboxing, rate limit, secret isolation, audit logging, etc.).
9. **Write and check the report.** Follow `references/report-contract.md` and save `<target-name>-threat-model.md` at the target root (use the in-scope directory's basename when modeling a subpath). Read `references/example-report.md` when quality alignment is needed. When available, run `scripts/threat-model-report-check.mjs <report-path>` before delivery and fix contract failures rather than explaining them away.

## Abuse-Path Taxonomy

Classify every path as one or more of:

- `access`: authentication or authorization bypass, privilege escalation, cross-tenant reach
- `exfiltration`: reading data, secrets, or models the attacker should not see
- `integrity`: tampering with data, config, artifacts, code, or decision state
- `execution`: attacker-influenced code or command execution, injection, sandbox escape
- `availability`: denial of service against components that matter
- `detection-evasion`: poisoning or suppressing logs, metrics, or audit trails

## Required Coverage

The model is not complete until:

- Every discovered entrypoint was considered, and each is either represented in a threat or marked low-relevance with a reason.
- Every trust boundary appears in at least one abuse path or is explicitly dismissed with a low-relevance reason.
- Runtime, CI/build, and dev/test surfaces are separated.
- The attacker profile lists non-capabilities, not just capabilities.
- Assumptions and open questions are explicit and tagged.

## No User Available

This skill can be invoked from automations and PR gates where nobody can answer questions:

- Use cheap repo-grounded inspection only; do not mutate code or environment.
- Do not wait for confirmation and do not invent deployment, exposure, tenancy, or data-sensitivity facts.
- Mark unknowns as `unvalidated`; mark affected priorities conditional.
- If an unknown prevents deciding whether a critical/high abuse path is plausible, return a `BLOCKED` security verdict for the gate rather than downgrading the risk.
- If enough evidence exists to rank the abuse paths defensibly, write the report with the assumptions section clearly marked conditional.

## Completion Blockers

Do not deliver the threat model while any of these are true:

- A material architectural claim lacks evidence or a confidence tag.
- A priority was assigned without recorded likelihood and impact reasoning.
- The abuse-path list is a generic checklist not traceable to this system's boundaries and assets.
- A discovered trust boundary is neither traced through an abuse path nor dismissed with evidence-backed low relevance.
- Ranking-critical assumptions were neither validated interactively nor recorded as unvalidated/conditional in a headless context.
- Existing and recommended mitigations are mixed into one list.
- The report file was not written, or deviates from `references/report-contract.md` without the user asking for a different format.
- `scripts/threat-model-report-check.mjs` was available but not run, or reported failures that were left unresolved.

## Example Prompts

- "Use `$security-threat-model` on this repo before we push."
- "Threat model the upload and parsing pipeline under `src/ingest/`."
- "Enumerate abuse paths for the admin portal and rank them."
- "We're adding webhook handlers — what's the attack surface?"
- "Threat model this PR gate automation before I trust it with deploy credentials."

## References

- `references/report-contract.md`: required report structure and section contracts.
- `references/boundaries-assets-controls.md`: survey lists for boundaries, assets, and control types by surface.
- `references/surface-checklists.md`: focused prompts for common web, agent, CI/CD, LLM, file/media, and provider-token surfaces.
- `references/example-report.md`: compact example showing the expected evidence density and report shape.
- `scripts/threat-model-report-check.mjs`: lightweight structural checker for generated reports.

## Used By

Other skills in this library escalate to this skill when scope turns security-sensitive: `$clarify-before-build` (plans touching auth/data/payments), `$feature-design-preflight` (step 8), `$test-readiness-preflight` (push-readiness), `$full-app-review` (security dimension), `$codebase-prune-review` (removals touching trust surfaces), `$error-logging-instrumentation` (log privacy), and `$pr-production-gate` (changed scope per PR).
