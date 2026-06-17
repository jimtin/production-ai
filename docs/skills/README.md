# Skill guides

These pages are the human-facing guides for the public skill library. They explain why each skill exists, the failure mode it prevents, and how to adapt it.

The installable Codex payloads live separately under `skills/<name>/`. Install through `scripts/install-skill.sh <name>` so only runtime files are copied into your Codex skills directory.

| Skill | Kind | Guide | Installable payload |
|---|---|---|---|
| clarify-before-build | Planning gate | [guide](clarify-before-build.md) | [payload](../../skills/clarify-before-build/) |
| feature-design-preflight | Design gate | [guide](feature-design-preflight.md) | [payload](../../skills/feature-design-preflight/) |
| user-action-coverage-review | Coverage gate | [guide](user-action-coverage-review.md) | [payload](../../skills/user-action-coverage-review/) |
| frontend-design-quality | Quality gate | [guide](frontend-design-quality.md) | [payload](../../skills/frontend-design-quality/) |
| test-readiness-preflight | Validation preflight | [guide](test-readiness-preflight.md) | [payload](../../skills/test-readiness-preflight/) |
| full-app-review | Review orchestrator | [guide](full-app-review.md) | [payload](../../skills/full-app-review/) |
| codebase-prune-review | Removal gate | [guide](codebase-prune-review.md) | [payload](../../skills/codebase-prune-review/) |
| error-logging-instrumentation | Observability review | [guide](error-logging-instrumentation.md) | [payload](../../skills/error-logging-instrumentation/) |
| repo-technical-documentation | Documentation engine | [guide](repo-technical-documentation.md) | [payload](../../skills/repo-technical-documentation/) |
| nextjs-vercel-analytics | Implementation guide | [guide](nextjs-vercel-analytics.md) | [payload](../../skills/nextjs-vercel-analytics/) |
| pr-production-gate | Deployment gate | [guide](pr-production-gate.md) | [payload](../../skills/pr-production-gate/) |
| security-threat-model | Security gate | [guide](security-threat-model.md) | [payload](../../skills/security-threat-model/) |
| repo-testing-setup | Foundation gate | [guide](repo-testing-setup.md) | [payload](../../skills/repo-testing-setup/) |
| laptop-currency-maintenance | Ops automation | [guide](laptop-currency-maintenance.md) | [payload](../../skills/laptop-currency-maintenance/) |
| docker-disk-cleanup | Ops automation | [guide](docker-disk-cleanup.md) | [payload](../../skills/docker-disk-cleanup/) |
