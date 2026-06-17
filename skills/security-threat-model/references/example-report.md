# Example Threat Model Report

This compact example illustrates the expected density and traceability. It is not a template to
copy verbatim; adapt the report contract to the target.

## 1. Summary

- The main risk is unauthenticated webhook replay causing duplicate invoice state transitions.
- The app has a reasonable server-side authorization split, but tenant scoping is only confirmed
  for the API route inspected here.
- No critical findings were identified; one high-priority mitigation is to add webhook idempotency
  keyed by provider event ID.

## 2. Scope and Method

In scope: `src/api/webhooks/payments.ts`, `src/billing/invoices.ts`, and
`src/db/invoice-store.ts`. Out of scope: frontend billing screens and provider dashboard config.
The system is an HTTP webhook receiver deployed as a server route. Confidence tags:
`confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = not
determined.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Payment webhook route | Receives provider events and calls billing service | `POST /api/webhooks/payments` | `src/api/webhooks/payments.ts:12` | confirmed |
| Billing service | Applies invoice state transitions | `applyPaymentEvent(event)` | `src/billing/invoices.ts:41` | confirmed |
| Invoice store | Reads/writes tenant invoice records | `markPaid(invoiceId, tenantId)` | `src/db/invoice-store.ts:18` | confirmed |

## 4. Trust Boundaries

| Boundary | From -> To | Protections observed | Gaps | Evidence |
|---|---|---|---|---|
| Internet -> webhook route | Provider or attacker sends HTTP request | Signature verification before parsing business fields | No replay/idempotency check found | `src/api/webhooks/payments.ts:17` |
| Billing service -> invoice store | Internal service writes invoice state | Tenant ID passed into store method | Caller controls tenant ID from event mapping | `src/billing/invoices.ts:52` |
| Operator CLI -> local seed script | Developer-only command seeds test invoices | Local-only, not deployed | Low relevance: no network or scheduler entrypoint found | `scripts/seed-invoices.ts:1` |

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Invoice payment state | `invoices` table through `invoice-store.ts` | Incorrect state can grant service or corrupt billing |
| Webhook signing secret | Runtime env var read by webhook route | Compromise allows forged events |

## 6. Attacker Profile

Capabilities:

- Can send arbitrary HTTP requests to the public webhook URL.
- Can replay a previously captured valid provider event if they obtained one from logs or traffic.

Non-capabilities:

- Cannot read runtime environment variables from this threat model's evidence.
- Cannot call internal billing functions directly without going through the route.

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-1 | Duplicate invoice transition | Public webhook -> missing replay check -> invoice payment state | integrity | medium: public route and no event-ID check found | high: billing state can be corrupted | high | Signature check blocks forged events | `src/api/webhooks/payments.ts:17`, `src/billing/invoices.ts:52` |
| AP-2 | Cross-tenant invoice update | Public webhook -> event tenant mapping -> invoice store | access / integrity | low: tenant ID is passed to store and scoped query is confirmed | high: tenant billing corruption | medium | Store writes include tenant ID | `src/db/invoice-store.ts:18` |

Likelihood/impact notes: AP-1 priority assumes provider events can be replayed if exposed in logs;
if provider guarantees one-time delivery with signed timestamps, likelihood drops.

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location | Control type |
|---|---|---|---|
| AP-1 | Persist processed provider event IDs and reject duplicates before invoice mutation. | `src/api/webhooks/payments.ts` and billing event table | idempotency |
| AP-2 | Keep tenant ID in the invoice-store predicate and add a regression test for wrong-tenant invoice IDs. | `src/db/invoice-store.ts` | tenancy scoping |

## 9. Assumptions and Open Questions

- `unvalidated`: Provider events may be replayed if event payloads leak through logs or third-party tooling.
- `unvalidated`: Frontend billing routes were out of scope and may need a separate model.
