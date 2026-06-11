# PR Production Gate Repo Config

The automation config contains global directories plus one or more repo entries.

Required repo fields:

- `slug`: GitHub repo slug, for example `owner/repo`.
- `localPath`: existing local repo path.
- `productionBranch`: branch that can deploy to production.
- `trustedAuthors`: GitHub logins allowed for automatic deployment.
- `allowForkAutoDeploy`: default `false`.
- `container.composeFile`: repo-relative Compose file for review validation.
- `container.service`: service that runs review commands.
- `commands.reviewGate`: full local container gate command.
- `commands.secretScan`: repo-scoped containerized gitleaks command or repo wrapper.
- `commands.productionSmoke`: post-deploy smoke command.
- `commands.postReview`: GitHub PR review update command, usually `gh pr review`.
- `externalServices`: mock policy for Clerk and other providers.

For `deploymentProvider: "laptop_cli_deploy"`, `commands.deployProduction` is required.

For `deploymentProvider: "vercel_git"`, use the branch-promotion train instead of `commands.deployProduction`:

- `devBranchPattern`: developer branch pattern, for example `dev/*`.
- `previewBranch`: branch that triggers preview deployment.
- `productionBranch`: branch that triggers production deployment.
- `commands.promotePreview`: push the reviewed candidate to preview.
- `commands.observePreviewDeployment`: wait for the matching preview deployment.
- `commands.previewSmoke`: smoke-test preview before production can advance.
- `commands.promoteMain`: push the same candidate to production.
- `commands.observeProductionDeployment`: wait for the matching production deployment.
- `commands.productionSmoke`: smoke-test production.

The developer branch pattern, preview branch, and production branch must not collapse onto the same managed branch. `commands.deployProduction` is fallback-only and should not be configured for the automatic `vercel_git` path.

Every command must be marked `containerized: true`. The tool rejects host-only commands for review, validation, secret scanning, deploy, and smoke.

Example command:

```json
{
  "run": "npm run verify:local",
  "containerized": true,
  "timeoutMs": 7200000
}
```

Example review command:

```json
{
  "run": "gh pr review {number} --repo {repoSlug} --event {reviewEvent} --body-file {reviewBodyContainerPath}",
  "containerized": true,
  "timeoutMs": 120000
}
```

Example Clerk mock policy:

```json
{
  "name": "clerk",
  "mock": "required",
  "seededIdentities": ["unauthenticated", "user", "admin"],
  "blockLiveCalls": true
}
```
