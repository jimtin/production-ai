# Coverage Failure Response

Use this when a focused, full, host, or container coverage command fails. This file is the single source for the coverage-failure classification — other documents point here rather than restating the classes.

Do not stop at "coverage is blocking." Classify the failure and take the next implementation step.

## Classification

1. **Changed-code gap**: changed logic, branches, routes, components, hooks, services, or workflows lack focused tests.
2. **Existing repo-wide debt**: unrelated legacy files keep the global denominator below the gate.
3. **Mis-scoped denominator**: generated files, integration-owned surfaces, legacy compatibility paths, or non-runtime files are incorrectly counted by the unit lane.
4. **Command misuse**: a single-file focused run is being judged against global coverage thresholds.
5. **Host/container variance**: host coverage barely clears the threshold, but Docker reports a small deficit.

## Required Response

- For changed-code gaps, add targeted tests for the actual behavior and rerun the cheapest relevant coverage command.
- For existing debt, still close changed-scope gaps first. If the unrelated debt cannot be safely resolved in scope, report the task as incomplete with exact files and coverage numbers.
- For mis-scoped denominators, adjust coverage config only with evidence from repo ownership, test layer responsibility, generated-file status, or legacy classification.
- For command misuse, rerun the correct repo-level coverage command before drawing conclusions.
- For host/container variance, add deterministic branch/function coverage buffer before rerunning the expensive container gate. Do not rely on `90.00%`.

## Not Allowed

- Do not lower thresholds.
- Do not delete meaningful assertions.
- Do not exclude changed runtime code to make the number pass.
- Do not call the implementation done when coverage remains below the required gate.
