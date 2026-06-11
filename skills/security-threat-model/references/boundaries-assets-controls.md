# Boundaries, Assets, and Controls Survey

Use these lists while building the system model — as a survey of what to look for, not as content to paste into the report. Only items with repo evidence belong in the model.

## Common trust boundaries by surface

**Web application runtime**
- Anonymous internet → public routes, marketing pages, auth endpoints
- Authenticated user → session-gated routes, API handlers, server actions
- Tenant ↔ tenant — every query and storage path that should be tenant-scoped
- User → admin: role checks on admin routes, admin mutations, impersonation paths
- App → database, cache, queue, object storage
- App → third-party providers (auth, payments, email, LLMs, analytics) and back again via webhooks/callbacks
- File upload → parser/decoder → storage (uploads are code-shaped data)

**Background and scheduled work**
- Scheduler → job runner: who can enqueue, what payloads are trusted
- Job → shared state: idempotency, poisoned-message handling

**Build, CI, and deployment**
- PR author → CI runner: what untrusted code executes, with which secrets in reach
- CI → artifact registry / deploy target: who can promote what
- Dependency registry → build: lockfile integrity, install scripts

**Agent automations (gates, bots, loops)**
- Reviewed/untrusted code → validation containers: what escapes the sandbox
- Automation → credentials: which steps can read which tokens
- Automation → chat/report sinks: what leaks through messages and logs
- Session/transcript data → any persisted or committed output

## Assets that drive risk

- Credentials and tokens: API keys, deploy tokens, bot tokens, session cookies, signing keys
- User data: PII, tenant business data, uploaded files, messages
- Integrity-critical state: balances, permissions, configs, migrations, feature flags
- Code and artifacts: source, build outputs, container images, skill/prompt files
- Control surfaces: CI configuration, deploy pipelines, admin tooling, automation configs
- Compute and quota: anything an attacker can spend (LLM calls, build minutes, email sends)
- Audit and detection: logs, metrics, alerts — valuable precisely because attackers want them gone

## Control types to name in mitigations

Authorization checks (route/object level) · schema and input validation · output encoding · tenancy scoping at the query layer · secret isolation (file/manager, never inline) · sandboxing and least-privilege containers · rate limiting and quotas · idempotency keys · signed webhooks and replay protection · dependency pinning and audit · audit logging with redaction · fail-closed defaults on missing proof.

When recommending one, say where it attaches: "tenancy scoping in the storage adapter," not "add access control."
