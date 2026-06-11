# Pattern: the learning loop

A nightly automation that reads the agent's own session transcripts, mines them for recurring failure patterns, and feeds the findings back into the skill library — automatically for low-risk changes, by proposal for everything else.

This is the pattern that turns a static prompt library into a system that gets better every week you use it.

## The shape

```
session transcripts (local JSONL)
        │
        ▼
  pattern miner ──────────────► sanitized daily summary (counts + categories, never raw text)
        │                              │
        ▼                              ▼
  classification                 committed to a PRIVATE git repo
   ├─ "eligible for safe update" ─► auto-apply small checklist/reference
   │                                 edits to existing skills, then validate
   ├─ "proposal only" ───────────► skill-proposals/<date>.md for human review
   └─ "watch" ───────────────────► counted, no action
        │
        ▼
  validation gate (skill validator + repo-scoped gitleaks)
        │
        ▼
  commit + push (fail closed) ──► chat notification with report paths
```

A real run produces summaries like:

| Pattern | Occurrences | Sessions | Action |
|---|---:|---:|---|
| Frontend visual verification gaps | 2085 | 19 | eligible for safe update |
| Missed parallelization opportunity | 1217 | 13 | proposal only |
| Schema and release sequencing risk | 756 | 12 | eligible for safe update |
| Coverage failure treated as stop condition | 299 | 7 | eligible for safe update |
| Secret scanning ran against the wrong scope | 3 | 1 | watch |

Each high-frequency pattern is a skill gap with receipts. "Coverage failure treated as stop condition" appearing 299 times across 7 sessions is exactly how the coverage-failure-response reference in [test-readiness-preflight](../../skills/test-readiness-preflight/) earned its existence.

## The safety rails

This pattern is only as good as its discipline, because it reads your most sensitive artifact (raw agent sessions) and writes to your most leveraged one (the skill library):

1. **Sanitize before anything persists.** The miner runs every extracted snippet through a tested redaction function — emails, bearer tokens, git/platform tokens, provider IDs, query-string secrets, connection strings. The sanitizer has its own unit-test suite. Summaries store **counts and categories, not thread text**; evidence snippets stay in local-only reports.
2. **Raw sessions are never committed.** Anywhere. The git repo receives summaries and proposals only.
3. **Auto-apply is bounded.** Only low-risk edits to *existing* skills (checklist items, reference additions) apply automatically, and only after the skill validator passes. New skills and structural changes always go through a human-reviewed proposal file.
4. **Fail closed end to end.** Validation failure, gitleaks finding, push failure, or notification failure stops the run and reports — no retry loops, no partial pushes.
5. **The loop itself gets a threat model.** It holds read access to sessions and write access to skills; treat both as boundaries and document the abuse paths before scheduling it.

## The one rule that matters most

**Never point the loop at a public repo.** The loop's output is derived from your private working sessions; even sanitized, its *shape* leaks what you work on and how often things fail. The loop commits to a private guardrails repo. Promotion from there to a public library (like this one) is always a separate, manual, human-reviewed step that passes a [fail-closed privacy scan](../../scripts/privacy-scan.sh).

## Build your own

1. Find your harness's session storage (Codex CLI: JSONL session files; ignore encrypted reasoning records).
2. Write the miner as a real tested program, not a prompt — pattern definitions are regex/heuristic rules you can review.
3. Define your pattern taxonomy from your actual pain: late-discovered coverage gaps, visual verification skips, schema sequencing risks, wrong-scope secret scans.
4. Start with **everything as proposal-only**. Enable auto-apply for a category only after a few weeks of reading its proposals and agreeing with them.
5. Schedule it nightly before your config-sync automation, so accepted changes ride the same day's backup (see [sync-and-backup](sync-and-backup.md)).
