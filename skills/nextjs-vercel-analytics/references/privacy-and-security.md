# Privacy and Security Rules

Default posture: strict no PII.

## Never Send

- Names, emails, phone numbers, addresses, exact birthdays, or demographic free text.
- Raw user IDs, raw tenant IDs, session IDs, auth tokens, invitation tokens, API keys, or provider IDs.
- IP addresses, precise geolocation, device fingerprints, cookies, or local storage values.
- Full URLs with query strings, callback URLs, referrer URLs that may contain sensitive params, or document/file URLs.
- Filenames, document contents, message bodies, prompts, form text, comments, notes, uploaded file contents, or error stacks.
- Payment details, Stripe customer IDs, invoice IDs, subscription IDs, or checkout session IDs.

## Prefer

- Coarse role labels: `anonymous`, `user`, `admin`, `superadmin`.
- Coarse source labels: `hero`, `footer`, `settings`, `dashboard`, `admin_table`.
- Coarse result labels: `success`, `validation_error`, `provider_error`, `permission_denied`.
- Counts, durations, boolean flags, plan tiers, feature labels, and non-sensitive route templates.
- Generated anonymous correlation IDs only if the repo already has a privacy-reviewed pattern and the ID cannot identify a person or tenant.

## Abuse Paths to Check

- A developer accidentally passes a form object, user object, database row, request body, `searchParams`, or error object directly into `track`.
- A server action tracks an event before authz completes, exposing existence or permission information.
- A client event includes user-entered text, URLs, or invite tokens.
- A backend success event fires before the transaction commits, creating misleading metrics.
- Analytics failures throw and block signups, purchases, uploads, or admin actions.
- Raw environment or provider error messages are sent as event properties.

## Required Controls

- Central sanitizer or type guard for analytics properties.
- Typed event names and typed properties.
- Tests that reject known sensitive keys and representative sensitive values.
- Review changed analytics payloads during `$security-threat-model`.
- `gitleaks` before push if analytics code, logs, docs, or fixtures contain copied payload examples.

## Vercel Plan and Privacy Notes

- Check current Vercel docs during implementation. If custom events are requested, verify the target project has the required Vercel plan or entitlement. Current Vercel docs describe Web Analytics pageviews as available on all plans and custom events as available on Pro and Enterprise.
- Vercel Web Analytics is designed to be privacy-friendly and cookie-free, but custom event payloads are still the repo's responsibility.
