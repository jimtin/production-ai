# Event Contract Reference

Use a typed event contract so client and server instrumentation cannot drift into scattered raw `track()` calls.

## Recommended Shape

Prefer a repo-local analytics module:

```ts
export type AnalyticsEventName =
  | 'cta_clicked'
  | 'signup_started'
  | 'signup_completed'
  | 'invite_accepted'
  | 'purchase_completed'
  | 'file_processed';

export type AnalyticsEventProperties = {
  surface?: 'homepage' | 'pricing' | 'dashboard' | 'admin' | 'portal';
  role?: 'anonymous' | 'user' | 'admin' | 'superadmin';
  source?: 'hero' | 'nav' | 'footer' | 'modal' | 'table' | 'form';
  result?: 'success' | 'validation_error' | 'provider_error' | 'permission_denied';
  plan?: 'free' | 'pro' | 'team' | 'enterprise';
  count?: number;
  durationMs?: number;
};
```

Adapt names to the repo domain. Keep event names stable, lowercase, and action-oriented. Avoid names that expose business-sensitive internals.

## Vercel Custom Data Constraints

Current Vercel custom event data supports primitive values only: strings, numbers, booleans, and null. Nested objects are not supported. Event names, property keys, and property values must be no more than 255 characters each, and the number of custom properties depends on the project plan.

This skill's stricter privacy rule still applies: string values should be closed enums or non-sensitive labels, not user-entered text or identifiers.

## Client Wrapper

The client wrapper should import from `@vercel/analytics` and should validate or narrow properties before calling `track`.

```ts
'use client';

import { track } from '@vercel/analytics';
import type { AnalyticsEventName, AnalyticsEventProperties } from './types';
import { sanitizeAnalyticsProperties } from './sanitize';

export function trackClientEvent(
  name: AnalyticsEventName,
  properties: AnalyticsEventProperties = {},
) {
  track(name, sanitizeAnalyticsProperties(properties));
}
```

## Server Wrapper

The server wrapper should import from `@vercel/analytics/server` and track only authoritative outcomes.

```ts
import { track } from '@vercel/analytics/server';
import type { AnalyticsEventName, AnalyticsEventProperties } from './types';
import { sanitizeAnalyticsProperties } from './sanitize';

export async function trackServerEvent(
  name: AnalyticsEventName,
  properties: AnalyticsEventProperties = {},
) {
  await track(name, sanitizeAnalyticsProperties(properties));
}
```

## Instrumentation Rules

- Track frontend intent when the user interacts with UI.
- Track backend outcome only after the mutation or provider call succeeds or reaches a known failure category.
- Do not track the same business event as both frontend and backend success.
- Do not create analytics calls inline everywhere. Route calls through typed wrappers.
- Do not let analytics failure break the product flow. Catch/log non-sensitive tracking errors when necessary.
- For forms, track coarse outcome categories, not submitted field values.
- For multi-tenant apps, use coarse account type or plan label, not raw tenant identifiers.
