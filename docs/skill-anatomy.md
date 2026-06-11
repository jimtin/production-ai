# Skill anatomy

Every skill in this library follows the same structure. The consistency is the point: an agent (and a reader) always knows where the trigger lives, where the rules live, and where the depth is hiding.

```
skills/<skill-name>/
├── SKILL.md                  # the machine layer — what the agent loads
├── README.md                 # the human layer — why it exists, how to adapt it
├── references/               # depth, loaded on demand
│   ├── <checklist>.md
│   └── <template>.md
├── scripts/                  # deterministic helpers (optional)
│   └── <helper>.py
├── tests/                    # tests for the scripts (when scripts exist)
├── agents/
│   └── openai.yaml           # interface metadata (display name, default prompt)
└── <skill-name>-threat-model.md   # for skills that touch risky surfaces
```

## The frontmatter is a router, not a summary

```yaml
---
name: test-readiness-preflight
description: Pre-test readiness workflow that finds and fixes predictable validation
  blockers before running expensive local or container test gates. Use before full
  verification, before push readiness checks, after substantial implementation, or
  when work is likely to hit common failures such as missing coverage, unseeded
  test databases, unapplied migrations, missing fixtures, Playwright setup gaps...
---
```

The `description` is the only thing the agent sees when deciding whether to load the skill. Treat it as trigger surface:

- **Name the situations, not the abstraction.** "Use before full verification, before push readiness checks, after substantial implementation" beats "a workflow for test readiness."
- **Enumerate the symptoms.** The long tail of trigger phrases ("unseeded test databases, unapplied migrations, stale snapshots, container drift") is what catches real requests.
- **Say when *not* to trigger** if the skill is easily confused with a sibling. The threat-model skill explicitly excludes "general architecture summaries, code review, or non-security design work."

## The body is a contract

The recurring sections, in the order they usually appear:

1. **Purpose** — one paragraph: what this skill produces and the default outcome (report vs. mutation matters; review skills state "do not mutate unless asked").
2. **Operating Rules** — the non-negotiables, as bullets. "Start from repo truth." "Fail closed." "Do not log secrets." These are the lines the agent cannot cross regardless of workflow step.
3. **Workflow** — a numbered sequence. Each step says what to do, what evidence to collect, and which reference file to read *when needed*.
4. **Required checks / matrices** — the table or checklist that defines coverage. The best ones use closed taxonomies: `active / compatibility / superseded / dead / unknown`, `covered / missing / stale / partial`, `confirmed / inferred / stale-doc / unknown`. Closed vocabularies prevent the agent from inventing a soothing third option.
5. **Completion Blockers / Acceptance Bar** — the section that does the most work. An explicit list of conditions under which the agent must *not* report success. This is the antidote to "looks done."
6. **References** — an index of the `references/` files with one line each on when to read them.
7. **Example Prompts** — real phrasings that should trigger the skill. Doubles as documentation and as a trigger-tuning corpus.

## Progressive disclosure

`SKILL.md` stays small enough to load cheaply; depth lives in `references/` and is pulled in only when the workflow reaches it:

> Read `references/coverage-failure-response.md` when a focused, full, host, or container coverage command fails.

This keeps the always-loaded cost low while letting a skill carry thousands of lines of checklists, templates, and failure-pattern catalogs. A skill with everything inlined either bloats every session or gets trimmed into uselessness.

## Scripts are deterministic, and tested

When part of the job is mechanical — inventorying log statements, enumerating tracked files, rendering a report — it goes in `scripts/` as a real program, not as prose instructions for the agent to improvise. Two rules:

- Scripts are **evidence collectors, not deciders**. The logging-inventory helper "is evidence collection only, not a sufficiency decision."
- Scripts get **their own unit tests** in `tests/`. A skill that enforces 90% coverage on your code and ships untested helpers would be embarrassing.

## Threat-model the skill itself

Skills that operate on risky surfaces (deployment, log redaction, automation that pushes to git) ship a `<name>-threat-model.md` alongside the skill: trust boundaries, abuse paths, mitigations. If your agent tooling can mutate repos, post to chat platforms, or touch production, it *is* attack surface — model it like one.

## The two-audience rule

In this repo every skill carries both layers deliberately:

- `SKILL.md` is written **to the agent**: imperative, dense, no motivation, no audience-pleasing.
- `README.md` is written **to a person**: the failure story, the design choices worth stealing, what to customize.

Keeping them separate keeps both honest. Motivational prose in the machine layer wastes tokens; terse imperatives in the human layer hide the insight.

## Authoring checklist

When writing a new skill (start from [templates/SKILL-template.md](../templates/SKILL-template.md)):

- [ ] Description names concrete trigger situations and symptoms, under 1024 chars
- [ ] Default outcome stated (report vs. mutate)
- [ ] Operating rules include the failure mode you are most afraid of
- [ ] Workflow steps reference depth files instead of inlining them
- [ ] Classification vocabularies are closed lists
- [ ] Completion blockers make "quietly skip it" impossible
- [ ] Example prompts cover at least 3 phrasings
- [ ] Scripts (if any) have tests
- [ ] Cross-references to other skills use `$skill-name`
- [ ] `./scripts/validate.sh` passes
