# Question Bank

Use this bank selectively. Ask the highest-impact questions for the current planning gap.

## Goal and Scope

- What exact outcome should exist when this is done?
- What problem is this solving, and for whom?
- What is explicitly out of scope?
- Is this a new capability, a replacement, a repair, or a migration?
- Is this a one-off implementation or a reusable pattern for future work?

## Users and Roles

- Which roles can access this feature?
- What can each role view, create, edit, approve, delete, export, or administer?
- Are there anonymous, authenticated, admin, superadmin, support, or service-account paths?
- What should happen when a user lacks permission?
- Are there multi-tenant, organization, workspace, or customer boundaries?

## Product and UX

- What is the shortest successful user path?
- What clicks, screens, or confirmations can be removed?
- What information must be visible before the user acts?
- What are the loading, empty, error, validation, disabled, and success states?
- What should happen on small phone, tablet, short laptop, desktop, and wide desktop?
- Are there visual patterns in the repo that must be reused?
- Does this plan require `$frontend-design-quality` because it changes UI, responsive layout, portals, dashboards, content pages, visual hierarchy, forms, or browser-tested user actions?
- What screenshots or visual assertions will prove the UI is actually good, not just technically present?

## Data and Integrations

- What data is created, read, updated, deleted, imported, exported, or retained?
- What is the source of truth?
- Which existing tables, APIs, files, queues, webhooks, jobs, or third-party services are involved?
- What validation, normalization, deduplication, and idempotency rules are required?
- What data must be auditable?
- What happens if an integration is slow, unavailable, rate-limited, or returns partial data?

## Security and Privacy

- What sensitive data, credentials, tokens, PII, payment data, private content, or tenant data is involved?
- What are the trust boundaries?
- What are realistic abuse paths?
- What authorization checks are required at UI, API, service, and data layers?
- What should be logged, and what must never be logged?
- Does this need `$security-threat-model` before implementation, before push, or both?
- Which critical/high security findings would block implementation or push?

## Technical Constraints

- Which repo, packages, framework versions, runtime, hosting platform, and deployment model are in scope?
- What AGENTS.md rules apply?
- Are package upgrades required to latest stable?
- Are there existing helpers or patterns that should be used?
- Are there line-size, split, architecture, or boundary rules?
- Are there migrations, backfills, feature flags, or compatibility windows?

## Verification

- Which unit tests prove the pure logic?
- Which integration tests prove critical paths and boundaries?
- Which browser/E2E tests prove user actions and role flows?
- Which visual screenshots or viewport checks are required?
- Which `$frontend-design-quality` checks apply?
- Which `$security-threat-model` checks apply?
- Which local container gate proves readiness?
- Which gitleaks, dependency audit, image scan, and security review commands are required?
- What evidence must be reported at completion?

## Rollout and Operations

- How is this deployed?
- Is there a feature flag or staged rollout?
- What rollback path exists?
- What metrics, logs, traces, alerts, receipts, or artifacts prove health?
- What cleanup or migration verification is required?
- What happens if the rollout fails halfway?

## Sequencing

- What must be decided before code starts?
- What can be implemented independently?
- What is the smallest safe delivery slice?
- What must be validated before the next slice begins?
- What follow-up work is acceptable, and who owns it?
