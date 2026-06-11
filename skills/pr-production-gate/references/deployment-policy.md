# Automatic Deployment Policy

Automatic production deployment is allowed only for trusted same-repo PRs that pass every required local container gate.

Fail closed when:

- The PR is from a fork.
- The PR author is not trusted.
- The PR head SHA changes during validation.
- Any required check is missing, skipped, host-only, or inconclusive.
- Review containers need production secrets.
- Live external providers are contacted during review.
- The repo lacks required mocks for the configured auth provider (e.g. Clerk) or another configured provider.
- A private repo clone, fetch, branch promotion, or review update would run without an authenticated GitHub token.
- Migration sequencing is unsafe.
- Security review has critical or high unresolved findings.
- Secret scan finds a leak.
- The platform preview deployment (e.g. Vercel Git) or preview smoke fails before production promotion.
- A preflight skill returned `BLOCKED` for the changed scope.
- A deploy-guarding lane depends on a quarantined test.
- A cached lane proof would be used outside its content fingerprint, lane scope, or TTL.
- Production smoke cannot confirm the reviewed SHA.

Production credentials must be isolated to the deploy container and only exposed after all pre-deploy checks pass.

For platform Git deployment trains (e.g. Vercel Git), automatic production deployment is a branch-promotion contract, not a direct CLI deploy. The reviewed candidate must promote to the configured preview branch first, match a successful platform preview deployment, pass preview smoke, and only then promote the same candidate to the configured production branch.
