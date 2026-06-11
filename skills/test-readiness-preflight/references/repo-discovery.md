# Repo Discovery

Use these discovery passes when a repo's validation shape is unclear. Prefer `rg` and repo scripts over broad manual search.

## Instruction Files

- Find applicable guidance: `rg --files -g 'AGENTS.md' -g 'CLAUDE.md' -g 'README.md' -g 'docs/**'`
- Read parent and repo-local `AGENTS.md` first.
- Prefer current workflow docs and live scripts over old root-level historical docs.

## Package and Script Discovery

- Identify package manager from lockfiles: `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `bun.lock`, `uv.lock`, `poetry.lock`, `requirements*.txt`, `Pipfile.lock`.
- Inspect scripts: `jq '.scripts // {}' package.json` when `jq` exists, otherwise read `package.json`.
- Search for gate names: `rg -n '"(verify|ci:local|test|test:coverage|coverage|e2e|playwright|integration|audit|gitleaks|seed|migrate|db:reset|build)"' package.json pnpm-workspace.yaml turbo.json nx.json .github scripts . 2>/dev/null`

## Test Config Discovery

- Locate common configs: `rg --files -g 'playwright.config.*' -g 'vitest.config.*' -g 'jest.config.*' -g 'karma.conf.*' -g 'cypress.config.*' -g 'pytest.ini' -g 'tox.ini' -g 'phpunit.xml*' -g 'go.mod' -g 'Cargo.toml'`
- Locate test directories: `rg --files -g '*test*' -g '*spec*'`
- Search coverage settings: `rg -n 'coverage|threshold|collectCoverage|coverageThreshold|all: true|branches|statements|functions|lines' .`

## Data, Migration, and Seed Discovery

- Locate ORM/database tools: `rg --files -g 'prisma/**' -g 'drizzle/**' -g 'migrations/**' -g 'supabase/**' -g 'db/**' -g 'database/**' -g 'schema.*'`
- Search seed/reset commands: `rg -n 'seed|fixture|factory|migrate|migration|db:reset|reset-db|test-db|prisma|drizzle|knex|typeorm|sequelize|supabase' package.json scripts src app test tests e2e .github 2>/dev/null`
- Check whether test data is created through factories, fixtures, Docker entrypoints, or global setup files.

## Container and Service Discovery

- Locate container files: `rg --files -g 'Dockerfile*' -g 'docker-compose*.yml' -g 'docker-compose*.yaml' -g 'compose*.yml' -g 'compose*.yaml' -g '.dockerignore'`
- Search profiles and healthchecks: `rg -n 'profile|profiles|healthcheck|depends_on|ports|volumes|command' docker-compose*.yml docker-compose*.yaml compose*.yml compose*.yaml 2>/dev/null`
- Prefer checked-in compose profiles over ad hoc host services.

## Environment and External Provider Discovery

- Locate env examples: `rg --files -g '.env*' -g '*.env*' -g 'env.example'`
- Search test doubles: `rg -n 'mock|stub|fake|msw|nock|wiremock|test double|sandbox|stripe-mock|clerk|auth|webhook|resend|openai|s3|blob|redis' src app lib test tests e2e scripts 2>/dev/null`
- Do not read or print real secret values unless required and safe. Prefer env key names and repo docs.

## CI, Deploy, and Security Discovery

- Locate workflows: `rg --files .github/workflows`
- Locate Vercel config: `rg --files -g 'vercel.json' -g '.vercelignore' -g '.vercel/project.json'`
- Search security gates: `rg -n 'gitleaks|secret|audit|trivy|grype|snyk|dependabot|npm audit|pnpm audit|yarn audit|pip-audit|cargo audit|govulncheck' package.json .github scripts . 2>/dev/null`
- Treat any remote-only check as a gap to reproduce locally when feasible.

## Hook Enforcement Discovery

- Search hook managers and wrappers: `rg -n 'husky|lefthook|pre-commit|pre-push|simple-git-hooks|lint-staged|core.hooksPath' package.json .husky .githooks .git-hooks lefthook.yml .pre-commit-config.yaml scripts .github 2>/dev/null`
- Read the active local hook path: `git config --get core.hooksPath`.
- Inspect checked-in hooks before adding a new framework: `.githooks/`, `.git-hooks/`, `.husky/`, `.pre-commit-config.yaml`, `lefthook.yml`, and package-manager hook settings.
- Treat missing, inactive, non-executable, or host-only hooks as adoption gaps for the containerized local validation default.
