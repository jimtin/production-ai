# Error Logging Instrumentation Threat Model

## Scope

In scope: the `$error-logging-instrumentation` skill, its reference guidance, and the read-only `scripts/logging_inventory.py` helper under `skills/error-logging-instrumentation/`.

Out of scope: the target applications that may later use this skill, external observability vendors, and provider dashboards except where the skill instructs Codex how to interact with them.

Assumptions: the skill runs locally inside Codex with access to user-selected repositories; target apps may contain secrets, PII, logs, and provider config; no new runtime dependency is introduced by this skill.

## System Model

- Codex reads `SKILL.md` and selected reference files, then inspects a target web app.
- `logging_inventory.py` statically scans text-like source files, excluding common generated directories and `.env*` files.
- The helper emits Markdown or JSON evidence for human/agent review.
- The skill may guide future code changes in target apps, including logging wrappers, redaction, Vercel runtime checks, and tests.

## Assets and Boundaries

- Assets: repository source, secrets accidentally committed to source, PII in fixtures, logging configuration, operator reports, generated findings, and future target-app logs.
- Boundary: target repo files enter the helper as untrusted input.
- Boundary: helper output may be copied into chat, reports, commits, or issue trackers.
- Boundary: Codex instructions may cause future edits to production-facing app instrumentation.
- Boundary: optional Vercel/provider log checks cross from local repo review into external observability systems.

## Threats and Mitigations

| Priority | Threat | Impact | Existing Mitigations | Follow-up |
| --- | --- | --- | --- | --- |
| High | Sensitive data disclosure from scanning or reporting `.env`, generated logs, or raw app content. | Secrets or PII could be copied into chat or reports. | Helper skips `.env*`, generated/build directories, large files, and reports only paths/terms instead of line content. References prohibit logging secrets, PII, raw payloads, file contents, and provider bodies. | Keep helper output path/metadata-only; do not add snippets without a redaction pass. |
| High | Skill guidance could normalize unsafe logging patterns in target apps. | Future apps could leak tokens, cookies, emails, payments, documents, or prompts into logs. | `privacy-redaction.md` requires allowlist-style payloads, recursive redaction, and tests for sensitive fields. `SKILL.md` forbids new providers without approval and requires security review before push-readiness. | Review any future remediation against target app data sensitivity and provider behavior. |
| Medium | False assurance from static inventory. | Codex may treat detected files as sufficient production observability. | `SKILL.md` and helper docstring state the script collects evidence only and does not decide sufficiency. Verification checklist requires targeted failure tests and runtime/provider proof. | Keep report wording explicit: inventory is not proof. |
| Medium | Log injection or alert poisoning through untrusted error messages. | Operators may receive misleading dashboards, alerts, or incident data. | References require normalized/sanitized error class/message and discourage raw provider payloads or request bodies. | Future target-app wrappers should escape/control multiline strings and use structured fields. |
| Low | Overbroad filesystem scanning. | Slow runs or accidental inspection outside intended repo. | Helper requires an explicit repo path and excludes common large/generated directories. Workspace gitleaks guidance remains repo-root scoped. | Future enhancements should preserve explicit path scoping. |

## Residual Risk

The main residual risk is not in this guardrails repo; it is future target-app misuse. The skill reduces that risk by making privacy-safe structured logging, targeted tests, Vercel/provider proof, and security review explicit prerequisites before push-readiness.
