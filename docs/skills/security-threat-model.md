# security-threat-model

**The failure this prevents:** ask an agent for a "security review" and you get OWASP-flavored boilerplate — ten generic risks, none traceable to your code, with "validate all inputs" as the remediation plan. It reads like security and proves nothing. The opposite failure is just as common: a wall of theoretical threats from an imaginary attacker with unlimited access, inflating severity until the report is unactionable.

This skill produces a threat model that is *specific*: every component cited to a file, every threat traced through a real boundary to a real asset, every severity justified, and the attacker explicitly told what they *cannot* do.

## What it does

Builds and writes `<target>-threat-model.md` for a repo, subsystem, or automation:

1. Scope and system model — components, entrypoints, stores, integrations, each with file evidence and a confidence tag (`confirmed / inferred / unknown`).
2. Trust boundaries as concrete edges (protections observed, gaps) and the assets that drive risk.
3. An attacker profile with **capabilities and non-capabilities** — the severity-inflation guard.
4. A short list of real abuse paths, classified (`access / exfiltration / integrity / execution / availability / detection-evasion`) and prioritized by justified likelihood × impact, adjusted for evidenced controls.
5. Interactive assumption validation when a user is available, or explicit `unvalidated` assumptions in headless gate runs.
6. Mitigations in two never-merged lists: existing (with evidence) and recommended (with a location and control type).
7. A lightweight report-contract check so generated reports prove their structure before they are handed back.

## The bundled support

- `references/example-report.md` — a compact example showing the expected evidence density.
- `references/surface-checklists.md` — prompts for common web, agent, LLM, CI/CD, provider-token, file/media, and scheduled-job surfaces.
- `scripts/threat-model-report-check.mjs` — a structural checker for generated reports.

## The design choices worth stealing

- **Evidence tags on architecture claims.** The same `confirmed / inferred / unknown` discipline as [repo-technical-documentation](repo-technical-documentation.md) — inferred architecture can't masquerade as fact, which is where most wrong threat models start.
- **Non-capabilities are part of the model.** Writing down what the attacker *can't* do is what keeps a single-tenant internal tool from collecting ten "critical" findings written for a public multi-tenant SaaS.
- **Runtime ≠ CI ≠ dev.** Three surfaces, three different attackers, three blast radii — modeled separately instead of smeared together.
- **Assumption validation without deadlock.** Ranking-critical assumptions go to the user as 1–3 targeted questions when a user is available; headless PR gates record those assumptions as `unvalidated`, mark affected priorities conditional, and fail closed only when the unknown prevents a defensible risk decision. Same house pattern as [clarify-before-build](clarify-before-build.md).
- **Few threats, fully traced.** The completion blockers kill checklist dumps: any threat that can't name its entrypoint, boundary, and asset doesn't ship.
- **Dismissed boundaries are allowed.** A boundary does not need a fake abuse path; it can be marked low relevance with evidence. Forced findings are just another kind of noise.
- **It's the library's security escalation point.** Seven other skills route to `$security-threat-model` when scope turns sensitive — see [docs/skill-graph.md](../../docs/skill-graph.md).

## Bad finding vs. good abuse path

Bad:

> Validate webhook inputs.

Good:

> `AP-1`: Replay a valid provider event through `POST /api/webhooks/payments` -> webhook boundary without event-id idempotency -> invoice payment state. Class: `integrity`. Likelihood: `medium` because the route is public and replay storage was not found. Impact: `high` because duplicate state transitions can corrupt billing. Mitigation: persist processed provider event IDs before invoice mutation.

The good version names the entrypoint, boundary, asset, class, likelihood, impact, existing evidence gap, and exact mitigation location.

## Install

```bash
scripts/install-skill.sh security-threat-model
node ~/.codex/skills/security-threat-model/scripts/threat-model-report-check.mjs <target>-threat-model.md
```

Triggers on threat-modeling and attack-surface requests, and via escalation from the other gates.

## Adapt it

- Extend `references/boundaries-assets-controls.md` with your stack's recurring boundaries (mobile clients, IoT, internal RPC meshes).
- If your org uses a risk register, map the report's priority levels onto it in `references/report-contract.md`.
- Threat model your own agent automations with it — anything holding tokens or deploy rights qualifies. The library's gate and learning-loop docs assume you will.

## Provenance

The role this skill plays was originally filled in the private setup by the Apache-2.0 curated `security-threat-model` skill from [openai/skills](https://github.com/openai/skills) (curated by Trail of Bits) — worth a look in its own right. This skill is a from-scratch rewrite in this library's house style — its own structure, text, taxonomies, and completion contract — written so the whole library ships under one MIT license. Threat-modeling methodology itself (boundaries, assets, attacker calibration, likelihood × impact) is long-standing public practice.
