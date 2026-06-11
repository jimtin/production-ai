# Repo Quality Gate Adoption Template

Use this template when adopting or hardening the workspace default that all validation runs locally in containers and git hooks enforce the same gates. The host may orchestrate Docker, Docker Compose, package scripts, `make`, `just`, `uv`, or checked-in wrappers, but host-run lint/test/build commands are not canonical readiness evidence.

## Adoption Scope

- State whether the repo is being fully adopted now, partially inventoried, or marked pending adoption.
- List in-scope stacks, apps, services, packages, workers, Docker images, and browser/API surfaces.
- List non-goals, especially live-provider checks, deploys, unrelated dependency upgrades, and unrelated dirty files.

## Repo-Native Command Discovery

- Read parent and repo-local `AGENTS.md`, `README`, release docs, package scripts, Docker files, hook configs, and CI workflows.
- Identify the authoritative full local command, fast pre-commit command, hook install command, and any inner-container command.
- Preserve repo-native entrypoints such as `make`, `just`, `npm run`, `pnpm`, `uv run`, checked-in scripts, Husky, `.githooks`, `.git-hooks`, or `pre-commit`.

## Tool Matrix

Create or update a checked-in matrix with these columns:

| Tool name | Purpose | Validation layer | Container or service used | Exact local command | Equivalent or exception reason |
| --- | --- | --- | --- | --- | --- |
| `editorconfig-checker` | EditorConfig conformance | Static | `<tool container>` | `<command>` | Required unless not applicable |
| `shellcheck` | Shell linting | Static | `<tool container>` | `<command>` | Required when shell scripts exist |
| `actionlint` | GitHub Actions linting | Static | `<tool container>` | `<command>` | Required when workflows exist |
| `yamllint` | YAML linting | Static | `<tool container>` | `<command>` | Required when YAML exists |
| `markdownlint-cli2` | Markdown linting | Static | `<tool container>` | `<command>` | Required when Markdown docs exist |
| `hadolint` | Dockerfile linting | Static | `<tool container>` | `<command>` | Required when Dockerfiles exist |
| `ruff check` | Python linting | Static | `<test/tool container>` | `<command>` | Python repos |
| `ruff format --check` | Python format check | Static | `<test/tool container>` | `<command>` | Python repos |
| `pyright` or established `mypy` | Python type checking | Static | `<test/tool container>` | `<command>` | Use one type checker |
| `eslint` or `biome check` | JS/TS linting | Static | `<node/tool container>` | `<command>` | Node/TypeScript repos |
| `prettier --check` | Format check | Static | `<node/tool container>` | `<command>` | When Prettier is formatter |
| `tsc --noEmit` | TypeScript type checking | Static | `<node/tool container>` | `<command>` | TypeScript repos |
| `terraform fmt -check` | Terraform formatting | Static | `<infra container>` | `<command>` | Terraform repos |
| `terraform validate` | Terraform validation | Static | `<infra container>` | `<command>` | Terraform repos |
| `tflint` | Terraform linting | Static | `<infra container>` | `<command>` | Terraform repos |
| `helm lint` | Helm linting | Static | `<infra container>` | `<command>` | Helm repos |
| `kubeconform` | Kubernetes schema validation | Static | `<infra container>` | `<command>` | Kubernetes repos |
| `gitleaks` | Secret scan | Cybersecurity | `<tool container>` | `docker run --rm -v "$repo_root:/repo:ro" -w /repo zricethezav/gitleaks:latest detect --source /repo --redact --no-banner` | Repo wrapper may replace this only if repo-scoped |
| `osv-scanner` | Open-source vulnerability scan | Cybersecurity | `<tool container>` | `<command>` | Required unless documented equivalent |
| `trivy fs` | Filesystem vulnerability/config scan | Cybersecurity | `<tool container>` | `<command>` | Required unless documented equivalent |
| `trivy image` | Image vulnerability scan | Cybersecurity | `<tool container>` | `<command>` | Required for image/container repos |
| `pip-audit` | Python dependency audit | Cybersecurity | `<python/tool container>` | `<command>` | Python repos |
| Stack-native audit | Dependency audit | Cybersecurity | `<package-manager container>` | `npm audit --audit-level=high` or `pnpm audit` or equivalent | Node repos |
| `semgrep` | SAST | Cybersecurity | `<tool container>` | `<command>` | Only if already used or clearly justified |
| `pytest` plus coverage | Unit/integration tests | Unit/Integration | `<test container>` | `<command>` | Python repos |
| `vitest` or `jest` plus coverage | Unit/integration tests | Unit/Integration | `<test container>` | `<command>` | Node/TypeScript repos |
| `go test -cover` | Go tests | Unit/Integration | `<go container>` | `<command>` | Go repos |
| `cargo test` and `cargo llvm-cov` | Rust tests and coverage | Unit/Integration | `<rust container>` | `<command>` | Rust repos |
| `Playwright` | Browser/user-flow E2E | E2E | `<browser container>` | `<command>` | Web apps by default |

## Containerized Validation

- Provide one authoritative local full-gate command, such as `make verify`, `just verify`, `npm run verify:local`, `pnpm verify:local`, or `uv run scripts/verify.py`.
- The host command may only orchestrate; all static, cybersecurity, unit, integration, build, and E2E validation work must execute inside containers.
- Required local orchestration: Docker, Docker Compose v2, and one repo-standard checked-in entrypoint.
- Runner images or tool containers must provide `sh` or `bash`, `git`, `jq`, `yq`, and `curl`.
- Inner-container commands must be documented separately and marked as not intended for direct host use.

## Pre-Commit Enforcement

- Install a checked-in `pre-commit` hook through the repo-native hook manager.
- The hook must invoke a fast containerized gate before every commit.
- Required lanes: static checks, fast cybersecurity checks, and a fast unit smoke lane only if it remains quick.
- The hook must fail closed when Docker, Docker Compose, required tool containers, or required local env/test-double config are unavailable.

## Pre-Push Enforcement

- Install a checked-in `pre-push` hook through the repo-native hook manager.
- The hook must invoke the full local containerized verification command before every push.
- Required lanes: static, cybersecurity, unit coverage, critical integration coverage, and E2E coverage.
- Do not recommend bypassing hooks. Do not use `git push --no-verify` as a normal workflow.

## Stubs, Fakes, and Test Isolation

- Use local stubs, fakes, or deterministic test doubles by default for auth, email, payments, storage, LLM, analytics, webhooks, queues, and third-party APIs when present.
- Live-provider validation must be opt-in, non-canonical for normal push readiness, and documented as manual, staging, production-smoke, or remote-only.
- Tests must use local databases, queues, caches, storage, seeded users/roles, run-scoped data, and cleanup hooks.

## Bounded Runners and Timeouts

- Every long-running lane must have a hard timeout, stall detection, heartbeat output, and readable logs.
- Record the timeout value, stall threshold, heartbeat interval, and cleanup policy for each major lane.
- Fail fast on missing prerequisites before starting expensive suites.

## Artifacts and Reports

- Define stable artifact paths for logs, JUnit or JSON reports, coverage summaries, Playwright traces, screenshots, videos, and container stdout/stderr.
- Generated artifacts must not dirty tracked repo files.
- If a tracked receipt is intentionally required, document how it avoids stale proof and self-hash problems.

## Repo-Native Hooks

- Detect existing hook managers before adding new ones: `.githooks`, `.git-hooks`, `.husky`, `.pre-commit-config.yaml`, `lefthook.yml`, `simple-git-hooks`, `lint-staged`, and `core.hooksPath`.
- Preserve the repo's established hook style when it can enforce the same behavior.
- Add an install/verify command that fails when hooks are missing, not executable, pointed at the wrong path, or not wired to the required gate.

## Secret Scanning and Dependency Audit

- Prefer the repo's wrapper when it already scopes scans correctly and redacts findings.
- Otherwise run gitleaks in a container with only the exact git repo root mounted read-only, never a workspace parent.
- Add `osv-scanner`, `trivy fs`, stack-native dependency audit, and `trivy image` where applicable.
- Treat findings as blocking until fixed, narrowly allowlisted as non-secret fixtures, or explicitly accepted.

## Coverage and Test Layer Proof

- Unit coverage must be at least `90%` for statements, branches, functions, and lines.
- Map every critical path to integration coverage.
- Map every user action, role flow, mutation, and responsive/mobile path to Playwright or equivalent E2E coverage.
- For API-only systems, define E2E as full service-journey coverage through containerized clients and seeded dependencies.

## Open Gaps and Blockers

- List missing tools, missing container lanes, inactive hooks, missing docs, missing critical-path tests, missing E2E coverage, live-provider dependencies, and generated artifact dirtiness.
- Mark each gap as `must fix before push`, `repo adoption follow-up`, or `explicitly out of scope`.

## Completion Report Checklist

Every repo adoption completion report must include:

1. Repo truth discovered.
2. Target local enforcement model.
3. Container topology.
4. Tool matrix by validation layer.
5. Hook enforcement design.
6. Commands implemented.
7. Validation results.
8. Remaining intentionally unimplemented items.
