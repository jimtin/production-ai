# Common Failure Patterns

Use this as a quick lookup when preflight finds a familiar failure shape.

| Pattern | Likely cause | Preflight action |
| --- | --- | --- |
| Coverage fails after implementation | Tests were deferred until the expensive gate, changed files have no focused unit tests, or coverage config excludes the wrong paths | Add focused tests while implementing the code, then run the cheapest targeted coverage command before full validation; do not lower thresholds |
| Full gate is used to discover missing tests | Test obligations were not mapped from the diff before validation | Stop treating the full gate as discovery. Map changed files to unit/integration/E2E obligations, add the tests, run targeted checks, then rerun the full gate |
| Unit tests pass but integration fails | Persistence boundary, provider adapter, or API contract was not covered | Add integration coverage for the changed boundary and seed the required fixtures |
| Playwright cannot log in | Auth users, roles, storage state, or feature flags are not seeded | Add or run deterministic auth seed/setup; avoid relying on old local browser state |
| Browser tests pass locally once but fail later | Tests share mutable records or rely on fixed names/emails | Use run-scoped records, unique names, cleanup hooks, and isolated tenants/users |
| Tests fail with missing tables or columns | Migration was not generated, applied, or reflected in generated clients | Generate/apply migration in the test lane and update generated clients/types |
| Production errors after deploy with missing table or column | App code was released before the target database migration was applied, or local tests used stale schema state | Complete the migration work and target-environment verification as part of the same task. Use expand -> deploy -> contract, and do not call the work done until both app code and schema readiness are proven |
| Seed command fails on old fixtures | Fixtures or factories drifted from current schema | Update factories, seed files, snapshots, and expected data before full gate |
| Full gate fails only in containers | Docker image, base image, package lock, generated client, or env differs from host | Rebuild images through repo wrapper and align env/test setup inside the container |
| Playwright reports missing browser binaries | Package and browser installations are out of sync | Run the repo's browser install wrapper or align Playwright package plus browsers |
| Visual snapshots fail everywhere | Intended UI changed but screenshots were not reviewed or updated | Inspect screenshots, confirm design intent, then update snapshots through the repo workflow |
| Text overflow or responsive layout fails | UI was built for a single viewport or labels were too short in fixtures | Use `$frontend-design-quality`; add long-copy, mobile, tablet, desktop, and short-height checks |
| Port already in use | Stale dev server, API server, database, or worker from an earlier run | Identify the owning process and stop only the stale process needed for this repo |
| Tests hang | Missing timeout, waiting on live provider, worker not shutting down, or unbounded watcher | Use bounded commands, deterministic test doubles, heartbeat logs, and cleanup hooks |
| CI fails on a command not run locally | Local gate omits a remote requirement | Add the missing check to the local gate or docs before pushing again |
| Remote CI/CD spend grows during debugging | Work is being pushed before local reproduction | Stop reruns, reproduce locally, then push once after local proof |
| Gitleaks catches generated output | Logs, fixtures, reports, or copied env examples contain secret-like values | Remove/redact the artifact and add only deliberate non-secret fixtures to allowlists |
| Gitleaks scans the whole filesystem or workspace | Command ran from `/`, `$HOME`, `/Users`, or a workspace parent, or mounted too much host filesystem into the scanner | Stop the scan, resolve `git rev-parse --show-toplevel`, and rerun via the repo wrapper or a container with only that repo root mounted read-only and `--source /repo` |
| Dependency audit changes unexpectedly | Manifests and lockfiles drifted or latest stable was not checked | Update manifests and lockfiles together, then run the repo's audit and full gate |
| Platform preview deployment is used as validation | Local build/browser coverage was skipped | Run local builds (e.g. `vercel build`) and browser tests; previews are not a substitute for local gates. Leave production deployment to the git integration |
| Provider-managed encrypted secrets block local production validation | Platform-encrypted env values (e.g. Vercel) pull locally as empty placeholders or cannot be decrypted | Treat this as a remote-only secret boundary: run all non-secret local gates, document the gap, and let the platform's production deployment validate those secrets. Do not retry pulls, attempt decryption, paste secrets into local files, bypass env checks, or pursue local prebuilt production deploys |
| Schema-dependent code reaches release before migration proof | App code and database migration work were treated as separate completion states | Require committed migrations, generated clients, clean local/container rebuild from migrations, and target-environment schema readiness before merge or deployment |
| Coverage failure is treated as a stopping point | The agent classified a failed coverage gate as an external blocker instead of triaging and continuing implementation | Classify and respond per `coverage-failure-response.md`: add targeted tests, fix proven config issues, or report the task explicitly incomplete rather than stopping |
| Host coverage barely passes but container coverage fails | Coverage margin is too close to the threshold or Docker accounts branches differently | Add deterministic targeted tests until host coverage has safe buffer above the threshold, then rerun the full container gate |
