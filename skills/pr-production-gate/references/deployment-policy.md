# Automatic Deployment Policy

Automatic production deployment is allowed only for trusted same-repo PRs that pass every required local container gate.

Fail closed when:

- The PR is from a fork.
- The PR author is not trusted.
- The PR head SHA changes during validation.
- Any required check is missing, skipped, host-only, or inconclusive.
- Review containers need production secrets.
- Live external providers are contacted during review.
- The repo lacks required mocks for Clerk or another configured provider.
- A private repo clone, fetch, branch promotion, or review update would run without an authenticated GitHub token.
- Migration sequencing is unsafe.
- Security review has critical or high unresolved findings.
- Secret scan finds a leak.
- Vercel Git preview deployment or preview smoke fails before `main` promotion.
- Production smoke cannot confirm the reviewed SHA.

Production credentials must be isolated to the deploy container and only exposed after all pre-deploy checks pass.

For Vercel Git deployment trains, automatic production deployment is a branch-promotion contract, not a direct CLI deploy. The reviewed candidate must promote to the configured preview branch first, match a successful Vercel preview deployment, pass preview smoke, and only then promote the same candidate to the configured production branch.
