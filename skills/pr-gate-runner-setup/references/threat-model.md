# PR Gate Runner Setup Threat Model

## Assets

- Public skill checkout and installed skill payloads.
- Gate controller config, reports, state, worktrees, and learning profiles.
- Provider tokens, deploy credentials, automation bypass secrets, and local env files.
- Scheduler jobs that can review and promote candidates.
- Docker daemon access and image/build cache.
- Public documentation derived from private setup reports.

## Trust Boundaries

- Operator machine to target runner.
- Public skill library to target machine.
- Target host shell to WSL or Linux runtime.
- Scheduler user context to interactive shell context.
- Review containers to deploy containers.
- Local reports to public docs.
- Docker credential store to gate build and pull commands.

## Main Threats And Controls

| Threat | Control |
|---|---|
| Private assumptions copied into a new host | Bootstrap from public skills first, then derive installs from the environment profile. |
| Secret leakage in reports | Record presence and permissions only, redact values, run privacy scan and gitleaks before publishing. |
| Scheduler runs with a different PATH than manual tests | Verify runtime resolution from the exact scheduler user context and log the effective PATH class. |
| Deployment automation installed before tests exist | Require confirmed repo testing foundation, or route to `$repo-testing-setup` before controller setup. |
| Active gate run interrupted during setup on a partial host | Respect lock metadata, do not hand-delete healthy locks, and install only when lock state is clear. |
| Stale target checkout deploys old policy | Compare revisions, classify dirty files, and validate config from the target checkout. |
| Docker cleanup removes unrelated services | Use `$docker-disk-cleanup`, inspect first, preserve active containers, and prefer gate-scoped or age-scoped pruning. |
| Review containers receive deploy secrets | Keep production credentials out of review lanes; inject deploy credentials only after exact-SHA validation passes. |
| Public example reveals private infrastructure | Use placeholder hosts, paths, repos, IPs, and report data; scan with the repo privacy tooling. |
| Proposed fix plan publishes private commands or paths | Treat fix-plan rows as report data: sanitize hostnames, paths, task names, repo slugs, tokens, and provider identifiers before public examples. |

## Required Security Evidence

- `$security-threat-model` applied before real runner setup changes scheduler, provider credentials, deploy branches, or public docs.
- Secret files checked for presence and restrictive permissions without printing values.
- Public docs pass the repo privacy scan.
- Recovery disables scheduler tasks before reusing any previous runner or partial controller state.
