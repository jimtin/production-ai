# Privacy and Redaction Rules

Logging must be useful without becoming a data leak. Prefer structured context with coarse categories over raw values.

## Never Log

- Secrets: API keys, tokens, cookies, session IDs, authorization headers, credentials, webhook secrets, OAuth codes, JWTs, private keys, Vercel/Clerk/Stripe/Resend keys, and signed URLs.
- Personal data: names, emails, phone numbers, exact addresses, IP addresses unless already covered by provider controls, raw user IDs, raw tenant IDs, payment details, and billing addresses.
- Content: uploaded file contents, document text, transcripts, prompts, completions, filenames, storage object names, private URLs, form free text, and full provider payloads.
- Internals in user responses: stack traces, SQL, filesystem paths, env names that reveal sensitive architecture, and provider credential hints.

## Safe Context Fields

- Route or action name, operation name, coarse role label, environment, deployment target, provider name, status code, result category, duration bucket or milliseconds, retry count, queue/job name, parser stage, file type category, size bucket, request/correlation ID, and sanitized error class/message.
- Use hashed or opaque IDs only when the repo already has an approved pattern and the hash cannot be reversed or joined to sensitive data outside the intended system.

## Redaction Pattern

- Normalize unknown errors into `{ name, message, code, status, causeCategory }` and drop everything else by default.
- Redact recursively before logging external provider errors.
- Use allowlists for fields that may be logged. Avoid denylist-only filters for sensitive systems.
- Keep server-side stack traces in protected error providers when available, not in user-facing JSON or public console output.

## Review Questions

- Could this log line identify a person, tenant, secret, document, payment instrument, or private object?
- Could a copied log line grant access to another system?
- Could logs be used to poison dashboards, alerts, or incident searches?
- Does a test prove sensitive fields are excluded from the logger/capture payload?
