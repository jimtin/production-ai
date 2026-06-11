# nextjs-vercel-analytics

**The failure this prevents:** "add analytics" is a privacy incident with good intentions. The agent instruments everything, the payloads carry emails and raw user IDs "for debugging," the same business event gets counted on the client *and* the server, and three months of funnel data turns out to be double-counted PII you now have to delete.

This skill implements Vercel Web Analytics in Next.js behind a typed, no-PII event contract shared by frontend and backend.

## What it does

1. **Establish the starting point**: router mode (App vs. Pages), existing instrumentation (`rg` for analytics/telemetry vendors), current official docs and package version — *checked at implementation time, never from model memory* — and whether the project actually has the custom-events entitlement.
2. **Add pageview analytics** in the correct root location for the router mode, preserving layout and server/client boundaries.
3. **Create a typed analytics module**: `AnalyticsEventName`, `AnalyticsEventProperties`, `trackClientEvent`, `trackServerEvent`.
4. **Instrument with intent/outcome separation.**
5. **Enforce strict no-PII payloads** and verify with tests, including network/mock assertions that no sensitive payload leaves the app.

## The design choices worth stealing

- **Intent on the client, outcomes on the server.** Frontend events represent interaction ("checkout clicked"); backend events represent authoritative results ("purchase completed"). One business event, one count, no client/server double-counting — most analytics messes die right here.
- **The event contract is a type.** Event names and property shapes live in one typed module both sides import. Free-text event names and ad hoc property bags are how taxonomies rot.
- **The PII ban is enumerated.** Banned: names, emails, raw user/tenant IDs, tokens, session IDs, IPs, exact URLs with query strings, free text, filenames, error stacks. Allowed: coarse enums, booleans, counts, durations, plan tiers, result categories. Enumerated lists beat "be careful."
- **Entitlement checked before code.** Custom events are plan-gated; the skill confirms the project tier *before* building a custom-event system that silently no-ops in production.
- **Scope fences.** Speed Insights, OpenTelemetry, dashboards, log drains — explicitly out of scope unless asked. Analytics requests have a way of becoming observability rewrites.

## Install

```bash
scripts/install-skill.sh nextjs-vercel-analytics
```

Triggers on adding/reviewing/fixing Vercel Web Analytics, custom events, funnel tracking, analytics privacy in Next.js.

## Adapt it

- The pattern ports to any analytics vendor — keep the typed contract, intent/outcome split, and PII denylist; swap the SDK calls.
- Extend `references/event-contract.md` with your domain's event taxonomy.
- Add a CI grep for `track(` calls outside the typed module — drift guard for the contract.
