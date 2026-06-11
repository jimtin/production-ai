# Anatomy of a learning-loop summary

This is what lands in the private guardrails repo after one nightly [learning-loop](learning-loop.md) run — first the artifact, then what every section is for.

> **Everything below is fabricated.** The structure, field names, and status vocabulary match the real tooling; every number, pattern count, and run ID was invented for this document. No session data — sanitized or otherwise — was used to produce it. That rule is the pattern: real summaries live in a *private* repo, and even they contain only counts and categories.

## The artifact

One Markdown file per run, committed under `learning-summaries/<date>/`:

```markdown
# Codex Learning Loop - 2026-06-10

Run ID: `2026-06-10T22-30-08-114Z`
Sessions processed: 31
Artifacts processed: 2
Encrypted reasoning records ignored: 81427
Compacted session markers observed: 1042

## Pattern Summary

| Pattern | Occurrences | Sessions | Action |
| --- | ---: | ---: | --- |
| Frontend visual verification gaps | 1418 | 16 | eligible for safe update |
| Coverage or missing-test failures discovered late | 612 | 9 | eligible for safe update |
| Schema and production release sequencing risk | 415 | 7 | eligible for safe update |
| Missed parallelization opportunity | 388 | 11 | proposal only |
| Coverage failure treated as stop condition | 173 | 5 | eligible for safe update |
| Potential new skill candidate | 96 | 14 | proposal only |
| Runtime monitor found repeated production errors | 58 | 4 | proposal only |
| Secret scanning ran against the wrong scope | 2 | 1 | watch |
| Background work running in user-facing request paths | 1 | 1 | watch |

## Auto-Applied Skill Updates

- `test-readiness-preflight`: added one checklist line to
  `references/coverage-failure-response.md` (classify host/container
  variance before rerunning the full gate). Validation: skill validator
  passed, repo-scoped gitleaks passed.

## Proposed Skill Work

- Missed parallelization opportunity: review whether repeated long
  sequential phases should use the workspace parallel-agent rules or a
  dedicated orchestration skill.
- Potential new skill candidate: the same request shape appeared across
  14 sessions; review whether it should become a dedicated skill or an
  AGENTS.md rule.
- Runtime monitor found repeated production errors: review manually
  before changing skill behavior.

## Evidence Handling

Evidence snippets are retained only in the local report. This committed
summary stores counts and categories, not raw thread text.

## Guardrails Repo

Status: committed_and_pushed
Reconciled generated changes: yes

## Local Reports

Markdown: `~/.codex/automation-reports/codex-learning-loop/2026-06-10/report.md`
JSON: `~/.codex/automation-reports/codex-learning-loop/2026-06-10/report.json`
```

## The anatomy, section by section

### The header counts

```
Sessions processed: 31
Artifacts processed: 2
Encrypted reasoning records ignored: 81427
Compacted session markers observed: 1042
```

Four numbers that tell you whether to trust the rest of the file.

- **Sessions processed** is the denominator for everything below. A pattern in 14 of 31 sessions is systemic; the same count out of 300 would be noise.
- **Artifacts processed** counts other sanitized automation outputs the loop also mines (e.g. a runtime error monitor's reports) — the loop learns from more than chat sessions.
- **Encrypted reasoning records ignored** is a privacy assertion wearing a metric's clothes: the harness's encrypted reasoning blobs are *counted and skipped*, never parsed. If this number is large and the run still completed, the sanitization boundary held.
- **Compacted session markers** flags sessions that were summarized mid-flight. High compaction means long sessions — and pattern counts inside compacted stretches are undercounted, which matters when you compare days.

### The pattern table

```
| Frontend visual verification gaps | 1418 | 16 | eligible for safe update |
```

Each row is a *predefined* failure-pattern detector — reviewable rules in tested code, not an LLM's nightly opinion. Three things to read:

- **Occurrences vs. Sessions is depth vs. breadth.** 1,418 occurrences across 16 sessions is a habit; 96 occurrences across 14 sessions is a broad itch. Breadth is usually the stronger signal that a *skill* is missing — habits inside one session often mean one hard task.
- **The Action column is a permission level, not a verdict.** `eligible for safe update` means the pattern maps to an existing skill and crossed its threshold, so the loop may auto-apply a bounded edit. `proposal only` means human review is required regardless of volume. `watch` means counted, no action — including low-volume *high-severity* items (a wrong-scope secret scan appeared twice; you want eyes on that, not an automated edit).
- **Rows earn their existence.** Every detector exists because the failure happened enough to be worth catching. The table is your engineering pain, ranked.

### Auto-applied skill updates

```
- `test-readiness-preflight`: added one checklist line to
  `references/coverage-failure-response.md` ... Validation: skill
  validator passed, repo-scoped gitleaks passed.
```

The most dangerous section, which is why it is usually short or `None`. The boundaries that keep it safe: only *existing* skills, only additive checklist/reference edits, only patterns marked eligible, and the edit lands **only after** the skill validator and a repo-scoped secret scan pass. The summary names the exact file touched, so the next `git log` reads as a change history of your agent's brain.

If this section is regularly long, your thresholds are too loose — the loop should converge as skills absorb the lessons, not churn nightly.

### Proposed skill work

Everything the loop is *not allowed* to do by itself: new skills, structural changes, judgment calls. Each proposal carries its rationale (counts, not excerpts) and acceptance criteria, and goes to a dated `skill-proposals/` file for a human. Accepted proposals become skill edits; rejected ones quietly raise the bar for that pattern.

### Evidence handling

```
Evidence snippets are retained only in the local report. This committed
summary stores counts and categories, not raw thread text.
```

The contract line, restated in every summary on purpose. Raw evidence — even sanitized — stays in local-only reports. What gets committed (to a *private* repo) is statistics. If you ever see thread text in a committed summary, the run is a bug and the fix is upstream in the sanitizer, not in the file.

### Guardrails repo status

```
Status: committed_and_pushed
Reconciled generated changes: yes
```

Fail-closed bookkeeping. The status vocabulary is closed (`committed_and_pushed`, `pending_validation_at_commit`, `validation_failed_nothing_pushed`, …) so a half-finished run can't read as success. *Reconciled generated changes* says whether auto-applied edits made it into the same day's sync — `no` means yesterday's edits are still local, which is your cue to look before tonight's run stacks on top.

### Local reports

Paths to the full Markdown/JSON reports on the machine that ran the loop — where the evidence detail lives if a count looks wrong. They are pointers off-repo by design: the committed summary is the shareable tier; the local report is the forensic tier.

## The JSON sidecar

Every summary has a machine-readable twin with the same facts:

```json
{
  "ok": true,
  "status": "completed",
  "runId": "2026-06-10T22-30-08-114Z",
  "date": "2026-06-10",
  "sessionsProcessed": 31,
  "artifactsProcessed": 2,
  "encryptedReasoningIgnored": 81427,
  "compactedCount": 1042,
  "patterns": [
    {
      "id": "frontend_visual_verification",
      "title": "Frontend visual verification gaps",
      "category": "frontend",
      "targetSkill": "frontend-design-quality",
      "occurrences": 1418,
      "sessionCount": 16,
      "meetsThreshold": true,
      "proposalOnly": false,
      "evidenceCount": 5
    }
  ],
  "proposals": [
    {
      "id": "proposal-parallelization_gap",
      "title": "Missed parallelization opportunity",
      "rationale": "Pattern appeared 388 time(s) across 11 session(s).",
      "recommendation": "Review whether the work should use the workspace parallel-agent rules or a dedicated orchestration skill.",
      "acceptanceCriteria": [
        "Rationale is backed by sanitized daily summaries.",
        "New or changed skill has clear trigger wording.",
        "Skill validates and passes a repo-scoped secret scan before push."
      ]
    }
  ]
}
```

The sidecar is what makes the loop *measurable over time*: diff `occurrences` for a pattern across thirty days of sidecars and you can see whether a skill change actually reduced the failure it targeted. `targetSkill` is the join key between pain and fix.

## Reading your own

Healthy looks like: pattern counts trending down after related skill updates, auto-apply sections short, `status: committed_and_pushed`, encrypted/compacted counts stable.

Worth investigating: one pattern dominating for weeks (the skill edit isn't landing or isn't loading), a growing auto-apply section (thresholds too loose), `watch` items with security flavor appearing at all, any status other than completed, or session counts dropping to near zero (the loop is reading the wrong directory — it will happily report a quiet, wrong world).
