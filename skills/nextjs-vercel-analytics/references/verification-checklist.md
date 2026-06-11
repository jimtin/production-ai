# Verification Checklist

Use the repo's canonical local/container gate. Do not rely on Vercel preview or GitHub CI as the first proof.

## Static and Build

- Package manager install succeeds and lockfile is updated.
- Latest stable `@vercel/analytics` was checked from the registry at implementation time.
- Typecheck passes.
- Lint/static checks pass.
- Production build passes.

## Unit Tests

- Event names are restricted to the typed taxonomy.
- Property sanitizer allows only approved keys and primitive/coarse values.
- Sensitive keys are rejected or dropped: `email`, `name`, `userId`, `tenantId`, `token`, `session`, `phone`, `address`, `url`, `query`, `prompt`, `message`, `error`, `stack`, `fileName`.
- Representative sensitive values are rejected or dropped: emails, bearer tokens, UUID-like IDs if raw IDs are banned, URLs with query strings, long free-text strings.

## Integration Tests

- Server action, route handler, or API route emits expected server event only after the authoritative outcome.
- Failed auth/authz does not emit success events.
- Tracking failure does not fail the business operation unless the user explicitly requested fail-closed analytics.
- Server events contain coarse result categories, not raw errors.

## Browser/E2E Tests

- Changed user actions are covered with Playwright or the repo equivalent.
- Client tracking wrapper is mocked or intercepted to verify event name and safe payload.
- Pageview component does not break hydration or route navigation.
- No consent or visible UI was changed unless explicitly in scope.

## Security and Release Gates

- `$security-threat-model` covers analytics trust boundaries and payload privacy.
- `gitleaks` passes before push.
- Dependency audit passes.
- Full local/container gate passes before GitHub push.
- Completion report lists commands, pass/fail status, coverage evidence, security review status, and residual privacy risks.
