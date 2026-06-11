# PR Production Gate Review Comment Rules

## Failure Review

Use `REQUEST_CHANGES`.

Include:

- Decision and exact PR head SHA.
- Failed checks, grouped by validation layer.
- Redacted command summaries.
- Local artifact/report paths.
- Required remediation steps.
- Statement that production deploy did not run.

Do not include:

- Raw secrets or unredacted scanner findings.
- Full logs when snippets are enough.
- Production credentials, provider tokens, cookies, session IDs, or raw webhook payloads.

## Passing Review

Use approval or a success comment only after:

- Every required local container check passed.
- The PR head SHA was rechecked.
- Production deployed the reviewed SHA.
- Production smoke passed.

Include:

- Reviewed SHA.
- Deployment URL or provider deployment id when available.
- Gate summary.
- Production smoke summary.
- Report path.
