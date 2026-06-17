# Security Threat Model Skill Hardening Threat Model

## 1. Summary

- The main risk is integrity loss in generated security reports: agents could still produce generic or forced findings if the skill contract is ambiguous.
- The hardening change reduces that risk with an example report, modern surface checklist, relaxed boundary dismissal rule, and a structural report checker.
- No runtime network surface or credentialed automation is added.
- No critical or high findings were identified for this change.
- The most valuable mitigation is to keep the checker as a quality gate while preserving evidence-based human judgment; the checker must not become a substitute for actual threat analysis.

## 2. Scope and Method

In scope:

- `skills/security-threat-model/SKILL.md`
- `skills/security-threat-model/references/report-contract.md`
- `skills/security-threat-model/references/example-report.md`
- `skills/security-threat-model/references/surface-checklists.md`
- `skills/security-threat-model/scripts/threat-model-report-check.mjs`
- `skills/security-threat-model/scripts/threat-model-report-check.test.mjs`
- `docs/skills/security-threat-model.md`

Out of scope:

- Threat models produced later by users of the skill.
- Private local repos and any generated local reports.

The skill is local documentation plus a local Node.js report checker. Confidence tags:
`confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = not determined.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Skill instructions | Guide agents through threat-model generation | Skill trigger / agent context | `skills/security-threat-model/SKILL.md` | confirmed |
| Surface checklist reference | Prompts inspection of modern security surfaces | Loaded by agent when target surface applies | `references/surface-checklists.md` | confirmed |
| Example report | Shows expected evidence density and structure | Loaded by agent for quality alignment | `references/example-report.md` | confirmed |
| Report checker | Performs structural checks on generated Markdown reports | `node scripts/threat-model-report-check.mjs <report.md>` | `scripts/threat-model-report-check.mjs` | confirmed |
| Checker tests | Prove checker accepts/rejects basic contract cases | `node --test ...test.mjs` | `scripts/threat-model-report-check.test.mjs` | confirmed |

## 4. Trust Boundaries

| Boundary | From -> To | Protections observed | Gaps | Evidence |
|---|---|---|---|---|
| Agent/user -> report checker | Local caller supplies path to Markdown report | Checker reads one explicit path and only prints pass/fail messages | It does not sandbox or redact report contents; reports should already be safe to inspect locally | `scripts/threat-model-report-check.mjs` |
| Skill instructions -> generated report | Agent interprets prose contract and writes report | Completion blockers, report contract, example report, and checker reinforce structure | Quality still depends on agent evidence gathering and judgment | `SKILL.md`, `references/report-contract.md`, `references/example-report.md` |
| Checklist prompts -> target repo evidence | Agent maps generic prompts to real files | Checklist says only include items with target evidence | An agent could still over-include generic checklist items if it ignores the rule | `references/surface-checklists.md` |

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Threat-model report integrity | Generated `<target>-threat-model.md` files | Bad reports can miss real security issues or create noisy fake work |
| Public skill credibility | `skills/security-threat-model` and docs | The skill is a library security escalation point |
| Local report contents | User-supplied report path read by checker | Reports can contain sensitive architecture details if users include them |

## 6. Attacker Profile

Capabilities:

- Can influence a prompt or target report content if they already participate in the local agent workflow.
- Can provide a malformed Markdown report to the checker.

Non-capabilities:

- Cannot trigger the checker remotely; no server or network listener is added.
- Cannot execute shell commands through the checker; it reads a file and analyzes text only.
- Cannot access secrets unless they were already placed in the report by another process.

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-1 | Pass a low-quality report by satisfying only structure | Report file -> checker structural checks -> threat-model report integrity | integrity | medium: structural checks are intentionally lightweight | medium: a superficially valid report could still miss real paths | medium | Skill requires repo evidence, abuse path traceability, and human/agent judgment beyond checker | `SKILL.md`, `scripts/threat-model-report-check.mjs` |
| AP-2 | Leak sensitive architecture through checker output | Sensitive report -> checker diagnostics -> terminal/chat transcript | exfiltration | low: checker prints only failure labels, not report body | medium: reports may contain sensitive context | low | Checker does not echo report text; skill forbids secrets in reports | `scripts/threat-model-report-check.mjs`, `SKILL.md` |
| AP-3 | Create forced fake findings for every boundary | Skill completion rule -> agent report -> public/security remediation backlog | integrity | low: rule now allows evidence-backed boundary dismissal | medium: fake findings waste remediation effort | low | Completion rule explicitly allows dismissed low-relevance boundaries | `SKILL.md`, `references/report-contract.md` |

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location | Control type |
|---|---|---|---|
| AP-1 | Keep the checker framed as structural validation, not security correctness; preserve completion blockers requiring evidence and prioritization reasoning. | `SKILL.md` and checker docs | fail-closed defaults / validation |
| AP-2 | If a future version posts checker output to chat, keep diagnostics summary-only and add redaction before any sink. | future report sink | output redaction |
| AP-3 | Keep boundary dismissal language in both the skill and report contract. | `SKILL.md`, `references/report-contract.md` | quality control |

## 9. Assumptions and Open Questions

- `user-confirmed`: The skill should be hardened before being used as the next public video topic.
- `unvalidated`: Users will run the checker locally and will not feed it reports containing secrets.
- `unvalidated`: The public library remains documentation/script based and does not expose this checker through a hosted service.
