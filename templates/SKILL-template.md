---
name: skill-name-matching-directory
description: One paragraph of trigger surface. Lead with what the skill produces, then "Use when..." followed by the concrete situations, request phrasings, and symptoms that should load this skill. Enumerate generously — the description is a router, not a summary. If this skill is easily confused with a sibling, end with what it should NOT trigger for. Max 1024 characters.
---

# Skill Name

## Purpose

One short paragraph: what this skill produces and its default outcome. State explicitly whether it mutates anything (code, config, branches) or only reports — review skills should default to report-only.

## Operating Rules

- The non-negotiables, regardless of workflow step.
- Start from repo truth: instructions, scripts, configs, tests — not assumptions or memory.
- Name the failure mode you are most afraid of and ban it here (e.g. "do not log secrets", "fail closed when proof is missing").
- Reference sibling skills with `$skill-name` and the condition that makes each apply.

## Workflow

1. **Baseline.** What to read or inventory first, and which reference file to use (`references/...`) when the situation is unfamiliar.
2. **Build the matrix/map.** Most gates need a coverage structure before conclusions — define its rows and the evidence each row requires.
3. **Do the work.** Numbered, imperative steps. Each step says what evidence it produces.
4. **Verify.** The cheapest check that proves each change, then the canonical gate.
5. **Report.** What the completion report must contain.

## Required Checks

The checklist or table that defines coverage for this skill's dimension. Use closed taxonomies for any classification (e.g. `covered / missing / stale / partial / blocked / deferred by user`) so there is no invented middle category.

## Completion Blockers

Do not report success while any of these are true:

- A required check has not run or did not pass.
- A classification row is unresolved and the user has not explicitly deferred it.
- Evidence for a material claim is missing.

(This section does the most work in the whole skill. Make "quietly skip it" impossible.)

## Example Prompts

- "Use `$skill-name` to ..."
- At least three real phrasings that should trigger this skill.

## References

- `references/<file>.md`: one line on when to read it.

<!--
Checklist before committing a new skill (see docs/skill-anatomy.md):
- description = trigger situations, under 1024 chars
- default outcome stated (report vs mutate)
- closed taxonomies, completion blockers, example prompts present
- depth in references/, loaded on demand, every mentioned file exists
- scripts/ (if any) have tests
- ./scripts/validate.sh passes; ./scripts/privacy-scan.sh passes
-->
