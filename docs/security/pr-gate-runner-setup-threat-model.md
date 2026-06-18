# PR Gate Runner Setup Threat Model

## 1. Summary

- The highest-value asset is future runner integrity: the skill instructs agents that may later configure Docker, scheduler jobs, local env files, and deploy credentials.
- The main abuse path is integrity risk from unsafe public instructions causing a future agent to install deployment automation before the repo foundation, secret boundaries, or scheduler context are proven.
- The main exfiltration path is accidental publication of real runner hostnames, IPs, user paths, provider identifiers, or token values in setup reports.
- No critical or high abuse path is identified for this publish when structural validation, renderer tests, privacy scan, and gitleaks pass.
- The most valuable mitigation is the skill's discovery-first environment profile: unknowns remain `pending` until proven directly on the target machine.

## 2. Scope and Method

In scope:

- `skills/pr-gate-runner-setup/`
- `docs/skills/pr-gate-runner-setup.md`
- `docs/patterns/pr-gate-runner-setup-report-example.md`
- public index updates in `README.md`, `docs/skills/README.md`, and `docs/skill-graph.md`

Out of scope:

- A real PR gate controller repository.
- Live Windows, Linux, Docker, GitHub, Vercel, or scheduler mutations.
- Private runner hosts, private secret files, and private setup reports.

How the system runs and where it is exposed:

- The repo is a public skill library. Users install skill payloads from `skills/<name>/` using the repo install script (confirmed: `README.md`, `scripts/install-skill.sh`).
- The new setup skill is Markdown instructions plus a local Node report renderer; it does not contact providers or mutate hosts by itself (confirmed: `skills/pr-gate-runner-setup/SKILL.md`, `scripts/render-setup-report.mjs`).
- The skill is intended to guide agents that later inspect and configure a local runner host (confirmed: `skills/pr-gate-runner-setup/SKILL.md`).

Confidence legend: `confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = not determined from repo evidence.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Installable setup skill | Agent instructions for setting up a new PR Gate Runner | `SKILL.md` frontmatter/body | `skills/pr-gate-runner-setup/SKILL.md` | confirmed |
| Report renderer | Converts structured setup data into Markdown and redacts common sensitive values | `node skills/pr-gate-runner-setup/scripts/render-setup-report.mjs setup-input.json` | `skills/pr-gate-runner-setup/scripts/render-setup-report.mjs`, `render-setup-report.test.mjs` | confirmed |
| Setup report contract | Defines required report sections and sanitization rules | Agent loads as reference when producing reports | `skills/pr-gate-runner-setup/references/report-contract.md` | confirmed |
| Public docs example | Human-readable sanitized example of the progressive setup report | GitHub Markdown | `docs/patterns/pr-gate-runner-setup-report-example.md` | confirmed |
| Public indexes | Advertise the new skill and graph dependencies | GitHub Markdown | `README.md`, `docs/skills/README.md`, `docs/skill-graph.md` | confirmed |
| Privacy scan | Denylist and gitleaks check before public push | `./scripts/privacy-scan.sh` | `scripts/privacy-scan.sh`, `scripts/privacy-denylist.txt` | confirmed |

## 4. Trust Boundaries

| Boundary | From -> To | Protections observed (auth, validation, rate limits) | Gaps | Evidence |
|---|---|---|---|---|
| Public skill text -> future agent actions | Public `SKILL.md` -> agent configuring runner host | Discovery-first rules, completion blockers, public skills first, no secret-value logging | Markdown cannot technically enforce future agent behavior | `skills/pr-gate-runner-setup/SKILL.md` |
| Structured setup input -> public Markdown report | JSON input -> renderer output | Built-in redaction for token prefixes, private keys, home paths, private network IPs; caller redactions; tests | Redaction may miss future token formats or meaningful private names | `render-setup-report.mjs`, `render-setup-report.test.mjs` |
| Private runner data -> public docs | Setup findings -> public example/report | Contract requires placeholders, documentation IP ranges, no raw env/log/provider output | Human-authored examples can still include private context if scan patterns miss it | `references/report-contract.md`, `docs/patterns/pr-gate-runner-setup-report-example.md`, `scripts/privacy-scan.sh` |
| New runner setup -> deploy credentials | Agent instructions -> local secret files/provider tokens | Presence-only inventory, no values logged, deploy credentials excluded from review lanes | Real host policy is outside this public repo | `SKILL.md`, `references/threat-model.md` |
| Scheduler -> gate controller | Scheduled command -> local controller execution | Requires readback proof, exact user context, lock discipline, closed-status proof | Real scheduler ACLs are target-host-specific | `SKILL.md` |

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Future runner secrets | Target host secret files and env material | Exposure enables provider, repo, or deploy abuse |
| Scheduler integrity | Target host scheduler tasks | Unsafe tasks could run wrong code, wrong PATH, or concurrent gates |
| PR gate proof integrity | Gate controller config, reports, state, locks | Bad setup could approve or deploy without exact-SHA proof |
| Public skill integrity | `skills/pr-gate-runner-setup/SKILL.md` and references | Instructions shape future agent behavior on sensitive hosts |
| Private setup details | Private runner reports and transcripts | Public leakage exposes hosts, paths, repos, provider IDs, or operational state |

## 6. Attacker Profile

Capabilities:

- Can read the public GitHub repository after publish.
- Can copy and install public skill payloads.
- Can supply crafted setup JSON to the renderer if they run it locally.
- Can search public docs for leaked hostnames, paths, tokens, repo names, or provider identifiers.

Non-capabilities:

- Cannot access private runner hosts, local secret files, or provider tokens from this public repo alone.
- Cannot make the setup skill mutate a host unless a user runs an agent with local access.
- Cannot bypass a real PR gate solely by reading the public instructions.

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-001 | Cause future agents to install unsafe runner automation | Public skill text -> future agent actions -> scheduler integrity / PR gate proof integrity | integrity | low: skill repeatedly requires public bootstrap, direct evidence, readback, and closed-status proof before readiness | high: unsafe gate automation could affect deployment decisions | medium | Discovery-first workflow, completion blockers, test-readiness and security escalation, closed-status requirement | `SKILL.md` |
| AP-002 | Harvest private runner identifiers from public docs | Private setup data -> public Markdown -> private setup details | exfiltration | medium: examples are derived from operational patterns | medium: host/repo/provider identifiers would become public | medium | Sanitization contract, placeholder example, privacy denylist, gitleaks | `references/report-contract.md`, `docs/patterns/pr-gate-runner-setup-report-example.md`, `scripts/privacy-scan.sh` |
| AP-003 | Leak token material through generated reports | Structured setup input -> renderer output -> future report sink | exfiltration | low: renderer redacts common token prefixes, private keys, local home paths, and private network IPs | high: real token leakage would be severe | medium | Built-in redactors, caller-provided redactions, focused tests, no raw env/log rule | `render-setup-report.mjs`, `render-setup-report.test.mjs`, `SKILL.md` |
| AP-004 | Run gate with wrong runtime or scheduler context | Agent setup instructions -> scheduler boundary -> PR gate proof integrity | integrity / availability | low: skill explicitly requires scheduler-user context, PATH proof, and scheduler readback | medium: wrong runtime could fail closed or run stale code | low | Environment profile, PATH proof, scheduler readback, closed-status requirement | `SKILL.md` |

Likelihood/impact notes:

- AP-001 remains medium priority because impact is high even though the instructions include strong fail-closed language.
- AP-002 is medium likelihood because public examples often start from real operational reports.
- AP-003 is low likelihood from current tests but medium priority because impact is high if a new token pattern is missed.
- AP-004 is low priority because the skill directly targets this failure mode and requires proof from the scheduler context.

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location (file/component/boundary) | Control type |
|---|---|---|---|
| AP-001 | Keep the closed-status requirement and completion blockers in the skill before publishing | `skills/pr-gate-runner-setup/SKILL.md` | fail-closed defaults |
| AP-002 | Run `./scripts/privacy-scan.sh` and gitleaks before public push | public repo push boundary | secret isolation and audit logging |
| AP-002 | Keep public examples generic and placeholder-only | `docs/patterns/pr-gate-runner-setup-report-example.md` | output redaction |
| AP-003 | Add targeted renderer tests before supporting new token formats or report sinks | `skills/pr-gate-runner-setup/scripts/render-setup-report.test.mjs` | output redaction |
| AP-004 | Preserve scheduler-context and PATH proof as required checks | `skills/pr-gate-runner-setup/SKILL.md` | runtime validation |

## 9. Assumptions and Open Questions

- `unvalidated`: The repository remains public and this branch is intended for public consumption.
- `unvalidated`: Real runner installation will happen from private operator context, not from this public repo alone.
- `unvalidated`: The first Windows trial will remain discovery-first until explicit setup changes are selected.
- No ranking-critical user questions were asked during this pre-push review because the requested action was to save the public skill and the file evidence was sufficient to rank all identified abuse paths as medium or low priority.
