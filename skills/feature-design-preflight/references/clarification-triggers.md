# Clarification Triggers

Ask before coding when the next engineering step depends on one of these decisions.

## Product Clarification

- The target user, role, or workflow is unclear.
- Success could mean multiple different outcomes.
- The requested feature has hidden policy, compliance, privacy, billing, or retention implications.
- There is no stated acceptable limit for size, duration, volume, concurrency, or latency.
- Failure behavior affects trust, money, data loss, or user access.

## Architecture Clarification

- The straightforward implementation conflicts with platform, provider, runtime, library, or repo constraints.
- Multiple viable architectures exist with meaningful tradeoffs in cost, speed, reliability, UX, or security.
- The feature probably needs asynchronous processing, but the user asked for something that sounds synchronous.
- A new external service, paid tier, queue, storage system, worker, parser, or runtime dependency may be required.
- Existing repo architecture is inconsistent, deprecated, or insufficient for the requested feature.
- The feature changes persisted schema and it is unclear whether migrations are automatic, manual, target-environment verified, backward-compatible, or safe to deploy before code.

## Dependency Clarification

- The required library capability is uncertain or depends on native binaries, browser APIs, runtime support, file formats, or provider plan features.
- Latest stable versions introduce breaking changes or conflict with the repo.
- Existing package choices are stale, abandoned, insecure, or unsuited to the real requirement.
- A dependency update broadens the blast radius beyond the requested feature.

## Verification Clarification

- There is no realistic local way to prove the feature without new fixtures, mocks, containers, seeded data, or sandbox credentials.
- There is no realistic local/container way to rebuild a clean database from migrations and prove the changed code against that schema.
- Required E2E flows depend on a provider sandbox, webhook forwarding, file fixtures, background workers, or browser permissions.
- Acceptance criteria are too vague to produce meaningful tests.
- The feature cannot meet workspace coverage, integration, E2E, security, or local-container requirements without extra scope.

## Recurrence and Production Evidence

- The same feature class has failed before because a requirement was not traced through provider limits, file size, timeout, dependency, or failure behavior. Stop and clarify the concrete production constraint before coding.
- Production runtime reports show quota, transient database, provider, or connection-limit failures in the affected area. Treat resilience as part of the requirement: define graceful degradation, retry/backoff behavior, alerting, and tests before implementing the fix.

## How to Ask

Use a short format:

1. State the blocking uncertainty.
2. State the default recommendation.
3. State the risk of proceeding without an answer.
4. Ask the smallest question that resolves the block.

Example:

```text
The upload requirement does not state expected file size or whether uploads must survive a network interruption. I recommend designing for direct/resumable upload because video files are likely too large for a normal request body. Proceeding with a simple API upload risks production failures. What maximum file size and retry/resume behavior should this support?
```
