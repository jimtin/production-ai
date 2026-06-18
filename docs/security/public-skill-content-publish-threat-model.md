# Public Skill Content Publish Threat Model

## 1. Summary

- The main risk is accidental exfiltration: private client/source details, local paths, provider IDs, or operational state landing in public skill guides or episode documents.
- The second risk is integrity: installable skill instructions could accidentally authorize future agents to mutate live YouTube, Notion, repo, or host-tooling state without the expected gates.
- The laptop maintenance changes add automation surface, but the changed code keeps the v1 boundary to unpinned Homebrew formulae and report-only repo dependency drift.
- No critical or high abuse path is identified for this publish when the structural validator, privacy scan, gitleaks, and focused laptop tests pass.
- The most valuable mitigation is to keep privacy scanning and focused tests mandatory before public pushes that add skills or automation instructions.

## 2. Scope and Method

In scope:

- `skills/client-requirements-to-plan/` and `docs/skills/client-requirements-to-plan.md`
- `docs/content/*-video-breakdown.md` episode explanation documents
- `skills/laptop-currency-maintenance/` changes, its public guide, and its automation template
- public index updates in `README.md`, `docs/skills/README.md`, and `docs/skill-graph.md`

Out of scope:

- Live YouTube, Notion, Drive, Discord, or channel operations.
- Private source chats, private client folders, and local automation state.
- The unrelated untracked PR-gate learner/adoption skill folders in the original worktree.

How the system runs and where it is exposed:

- The repo is a public skill library. Users install skill payloads from `skills/<name>/` using `scripts/install-skill.sh` (confirmed: `scripts/validate.sh`, `README.md`).
- The laptop maintenance skill contains local Node scripts that can run on a developer laptop only after installation and local configuration (confirmed: `skills/laptop-currency-maintenance/SKILL.md`, `scripts/config.example.json`).
- Episode explanation documents are public Markdown artifacts and do not upload, schedule, or mutate live channel state (confirmed: `docs/content/*-video-breakdown.md`).

Confidence legend: `confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = not determined from repo evidence.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Public skill payloads | Agent instructions loaded after skill trigger | `SKILL.md` frontmatter and body | `skills/client-requirements-to-plan/SKILL.md`, `skills/laptop-currency-maintenance/SKILL.md` | confirmed |
| Public human guides | GitHub-readable explanation and install guidance | Markdown pages under `docs/skills/` | `docs/skills/client-requirements-to-plan.md`, `docs/skills/laptop-currency-maintenance.md` | confirmed |
| Episode explanation documents | Public YouTube planning summaries | Markdown pages under `docs/content/` | `docs/content/client-requirements-to-plan-video-breakdown.md`, `docs/content/docker-disk-cleanup-video-breakdown.md`, `docs/content/laptop-currency-maintenance-video-breakdown.md`, `docs/content/security-threat-model-video-breakdown.md` | confirmed |
| Laptop maintenance automation | Local host-tooling audit/update runner | `node .../laptop-currency-maintenance.mjs audit|update` | `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance.mjs`, `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.mjs` | confirmed |
| Structural validator | Public package consistency check | `scripts/validate.sh` | `scripts/validate.sh` | confirmed |
| Privacy and secret scan | Public denylist plus gitleaks | `scripts/privacy-scan.sh` | `scripts/privacy-scan.sh`, `scripts/privacy-denylist.txt` | confirmed |

## 4. Trust Boundaries

| Boundary | From -> To | Protections observed (auth, validation, rate limits) | Gaps | Evidence |
|---|---|---|---|---|
| Draft/local source -> public repo | Local skill/content drafts -> GitHub-visible Markdown and payloads | Privacy scan, gitleaks, denylist, structural validation | No semantic scanner can prove all client-specific context is absent | `scripts/privacy-scan.sh`, `scripts/validate.sh` |
| Skill text -> future agent behavior | Public `SKILL.md` instructions -> installed agent workflow | Completion blockers, explicit non-mutation rules, required source reading | A future agent could still ignore skill instructions; mitigated by validation and review, not enforceable in Markdown alone | `skills/client-requirements-to-plan/SKILL.md`, `skills/laptop-currency-maintenance/SKILL.md` |
| Laptop automation -> host package manager | Installed script -> Homebrew commands | Only unpinned Homebrew formulae are auto-updated; casks and repos are report-only; fail-closed Homebrew audit checks | Homebrew itself remains a trusted upstream | `skills/laptop-currency-maintenance/SKILL.md`, `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.mjs` |
| Laptop automation -> report sinks | Command output -> Markdown/JSON/Discord summary | Redaction for tokens, emails, provider IDs, and local home paths; Discord disabled until configured | Redaction patterns may miss a new secret format | `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.mjs`, `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.test.mjs` |
| Public repo -> user installer | Public payload -> user local Codex skills folder | Install path is explicit; config examples are inert until copied and edited | Users can still adapt templates unsafely after installation | `README.md`, `docs/skills/laptop-currency-maintenance.md`, `templates/laptop-currency-maintenance.automation.toml.example` |

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Private client/source details | Source chats, local folders, unpublished operational notes | Public leakage would expose private work context |
| Local paths and provider IDs | Developer machine reports, automation configs, source snippets | Public leakage can identify systems, accounts, or workflows |
| Public skill integrity | `skills/<name>/SKILL.md` and references | Bad instructions can route future agents into unsafe actions |
| Developer machine safety | Homebrew formulae, local CLI tooling, repo worktrees | Over-broad maintenance can break local proof loops |
| Discord bot token and report output | Local secrets file and generated reports | Token or report leakage can expose private operations |

## 6. Attacker Profile

Capabilities:

- Can read the public GitHub repository after publish.
- Can copy and install public skill payloads.
- Can look for leaked private identifiers, local paths, tokens, or operational state in committed text.
- Can submit or suggest malicious content in future public contributions.

Non-capabilities:

- Cannot read private local files, source chats, local automation config, or local secrets merely from this public repo.
- Cannot trigger live YouTube, Notion, Discord, or laptop maintenance operations from the public Markdown alone.
- Cannot make the laptop automation run unless a user installs it and configures local paths/secrets.

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-001 | Harvest private identifiers from public content | Episode docs or skill guides -> draft/local source to public repo -> private client/source details | exfiltration | medium: content was derived from prior work and could accidentally include specifics | medium: leaked private context would be public | medium | Privacy denylist and gitleaks | `scripts/privacy-scan.sh` |
| AP-002 | Break developer machine or repo state through maintenance automation | Installed laptop skill -> laptop automation to host package manager -> developer machine safety | availability | low: changed logic keeps repo dependencies, casks, global npm, Docker Desktop, and system updates out of auto-update scope | medium: broad updates could disrupt local proof if the boundary regressed | low | Auto-update only unpinned Homebrew formulae, fail-closed Homebrew audit, focused unit tests | `skills/laptop-currency-maintenance/SKILL.md`, `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.test.mjs` |
| AP-003 | Leak secrets or local home paths through laptop reports | Command output -> report sink -> Discord/report output | exfiltration | low: sanitizer is tested for token, email, provider ID, and local path patterns | high: a real token leak would be serious | medium | Redaction layer and focused tests; Discord disabled until configured | `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.mjs`, `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.test.mjs` |

Likelihood/impact notes:

- AP-001 is medium likelihood because public writing often starts from private source material, even when the resulting document is intended to be sanitized.
- AP-002 is low likelihood because tests cover the changed fail-closed and do-not-touch behavior.
- AP-003 remains medium priority because impact is high if a new secret shape bypasses redaction.

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location (file/component/boundary) | Control type |
|---|---|---|---|
| AP-001 | Run `scripts/privacy-scan.sh` and gitleaks before public push; do not publish if denylist hits remain | public repo push boundary | secret isolation and audit logging |
| AP-001 | Keep episode examples sanitized and generic unless a future artifact is explicitly private | `docs/content/*-video-breakdown.md` | output redaction |
| AP-002 | Keep focused tests for any change to Homebrew classification, update planning, or report status | `skills/laptop-currency-maintenance/scripts/*test.mjs` | regression testing |
| AP-003 | Add targeted redaction tests before supporting any new report sink or secret format | `skills/laptop-currency-maintenance/scripts/laptop-currency-maintenance-core.test.mjs` | output redaction |

## 9. Assumptions and Open Questions

- `unvalidated`: The GitHub repository remains public and these changes are intended for public consumption.
- `unvalidated`: The user wants the episode explanation documents visible in GitHub, not only available locally.
- `unvalidated`: Live publishing state was intentionally out of scope for this push.
- No ranking-critical user questions were asked during this pre-push review because the scope was a publish request and the evidence was sufficient to rank all identified abuse paths as medium or low priority.
