---
name: nextjs-vercel-analytics
description: Add privacy-safe Vercel Web Analytics to Next.js apps, including pageview setup, typed client and server custom events, strict no-PII payload rules, App Router or Pages Router placement, and local verification. Use when a user asks to add, implement, instrument, review, or fix Vercel analytics, Vercel Web Analytics, analytics custom events, product tracking, funnel tracking, frontend or backend event tracking, or analytics privacy in a Next.js repo.
---

# Next.js Vercel Analytics

## Purpose

Use this skill to implement Vercel Web Analytics in a Next.js repo with a typed, privacy-safe event contract shared by frontend and backend tracking. Default scope is analytics only: pageviews plus custom client/server events.

Out of scope unless explicitly requested: Speed Insights, OpenTelemetry, tracing, runtime log drains, dashboards, alerts, third-party analytics, and querying analytics data from Vercel.

## Required Starting Point

Before editing code:

1. Read repo instructions: root `AGENTS.md`, repo-local `AGENTS.md`, package manager files, and existing test commands.
2. Identify router mode:
   - App Router: `app/layout.*` or `src/app/layout.*`
   - Pages Router: `pages/_app.*` or `src/pages/_app.*`
3. Search existing instrumentation before adding anything:
   - `rg -n "@vercel/analytics|Analytics|track\\(|analytics|telemetry|posthog|plausible|segment|gtag|dataLayer" .`
4. Check current official Vercel docs and latest stable `@vercel/analytics` version at implementation time. Do not rely on model memory for version freshness.
5. Confirm that Web Analytics is enabled, or must be enabled, in the target Vercel project dashboard.
6. Confirm whether custom events are expected. If yes, ask whether the Vercel project has the required custom-event entitlement. Current Vercel docs state Web Analytics is available on all plans, while custom events require Pro or Enterprise.

## Implementation Workflow

1. **Install package.**
   - Use the repo's package manager.
   - Install latest stable `@vercel/analytics`.
   - Update package manifest and lockfile together.

2. **Add pageview analytics.**
   - App Router: import `{ Analytics }` from `@vercel/analytics/next` in the root layout and render `<Analytics />` near the end of `<body>`.
   - Pages Router: import `{ Analytics }` from `@vercel/analytics/next` in `_app` and render `<Analytics />` with the app shell.
   - Preserve existing layout structure, providers, metadata, and server/client component boundaries.

3. **Create typed analytics module.**
   - Prefer an existing convention. If none exists, use `src/lib/analytics/` or `lib/analytics/`.
   - Provide at least:
     - `AnalyticsEventName`
     - `AnalyticsEventProperties`
     - `trackClientEvent(eventName, properties)`
     - `trackServerEvent(eventName, properties)`
   - Read `references/event-contract.md` before designing event names or properties.

4. **Instrument flows with intent and outcome separation.**
   - Frontend events represent user intent or UI interaction, such as button clicked, form started, filter applied, or CTA selected.
   - Backend events represent authoritative outcomes, such as signup completed, invite accepted, purchase completed, file processed, or mutation failed safely.
   - Do not double-count the same business event on both sides. Use frontend for interaction intent and server for confirmed outcomes.

5. **Keep payloads strict no-PII.**
   - Never send names, emails, phone numbers, raw user IDs, tenant IDs, tokens, session IDs, IPs, addresses, exact URLs with query strings, raw prompts, free text, filenames, document contents, or error stacks.
   - Prefer coarse enums, booleans, counts, durations, plan tiers, source surfaces, role labels, and result categories.
   - Read `references/privacy-and-security.md` before adding properties.

6. **Security and planning gates.**
   - Use `$feature-design-preflight` before implementing analytics for nontrivial flows, funnels, auth, billing, admin portals, uploads, AI, storage, or sensitive workflows.
   - Use `$security-threat-model` for analytics payload/privacy review before push-readiness.
   - Use `$frontend-design-quality` if analytics changes require UI controls, banners, dashboards, consent surfaces, or visible tracking state.

## Verification

Read `references/verification-checklist.md` and run the repo's canonical local/container gate.

Minimum proof:

- Typecheck/build pass.
- Unit tests for event name/property validation and no-PII guard helpers.
- Integration tests for server-side tracking wrappers or route/action instrumentation.
- Browser/E2E coverage for changed user actions.
- Network or module-mock verification that expected analytics calls are made without sensitive payloads.
- `gitleaks` before push.
- `$security-threat-model` review completed for changed analytics surfaces.

## Example Requests

This skill should trigger for prompts like:

- "Add Vercel analytics tracking to this Next.js app."
- "Instrument signup and purchase flows with Vercel custom events."
- "Review this app's Vercel analytics for PII leakage."
- "Connect frontend CTA events with backend successful mutation events."
- "Add typed Vercel Web Analytics events to the admin portal."

## References

- Read `references/event-contract.md` for the shared typed event model.
- Read `references/privacy-and-security.md` for payload and abuse-path rules.
- Read `references/verification-checklist.md` for tests and local validation.
- Official docs to check during implementation:
  - https://vercel.com/docs/analytics
  - https://vercel.com/docs/analytics/quickstart
  - https://vercel.com/docs/analytics/custom-events
  - https://vercel.com/docs/observability
