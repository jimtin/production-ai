---
name: youtube-content-planner
description: Create the recurring YouTube explanation document for Production AI skills, guides, proposals, or repo patterns. Use when the user asks for the YouTube document, YouTube explanation, Building The Age of AI video breakdown, skill overview visual, episode outline, title and thumbnail ideas, demo outline, short description, or a content-status table for published, scheduled, proposed, or missing skill episodes. Produces saved Markdown documents under docs/content and does not upload, schedule, or mutate live YouTube, Notion, Drive, or channel state.
---

# YouTube Content Planner

## Purpose

Turn a Production AI skill, guide, proposal, or repo pattern into the saved YouTube explanation document used for Building The Age of AI episodes.

The primary output is the document the user repeatedly asks for after a skill is created or updated: a written explanation that can become the video plan, talking points, visuals, demo outline, title ideas, thumbnail ideas, and description.

This skill is for content planning and documentation only. It must not upload videos, edit live channel metadata, mutate Notion rows, schedule videos, or create duplicate upload state. Live publishing belongs to a separate channel-operations workflow.

## Core Rules

- Treat "the YouTube document", "the YouTube explanation", "the video breakdown", "generate the YouTube artifact", and similar requests as instructions to create or update a saved Markdown explanation document.
- Save artifacts as Markdown under `docs/content/` unless the user gives another path.
- Use kebab-case filenames such as `security-threat-model-video-breakdown.md`.
- Write the document itself. Do not merely describe the template or say where the template lives.
- Ground every episode in the source artifact: skill payload, public guide, proposal, pattern doc, content map, or README.
- Lead with the failure the skill prevents, not the feature list.
- Explain why the skill belongs in Production AI.
- Include component and flow visuals when the topic benefits from them.
- Keep public artifacts sanitized: no private paths, client names, channel IDs, Notion IDs, tokens, unpublished operational state, or private repo names.
- Do not claim an episode is published or scheduled unless verified from current repo/channel data supplied or explicitly requested and checked.
- If asked for live YouTube/Notion state, stop and use the appropriate live operations tooling instead of inferring from saved docs.

## Required References

Read these before writing or updating a content artifact:

- `references/video-breakdown-template.md` for the required episode artifact structure.
- `references/channel-style.md` for the channel angle, voice, and visual rules.
- `references/content-status-rules.md` when producing published/scheduled/proposed/missing tables.

## Workflow

### 1. Identify The Source

Resolve the target source artifact:

- skill payload: `skills/<skill-name>/SKILL.md`
- public guide: `docs/skills/<skill-name>.md`
- proposal or plan: `docs/plans/<topic>.md`
- pattern doc: `docs/patterns/<topic>.md`
- content map: `docs/content/content-map.md`
- README or skill graph when the video is ecosystem-level

Read the relevant source before writing. For skill videos, read both the public guide and installable `SKILL.md`; read bundled references or scripts only when they affect the episode story.

### 2. Extract The Episode Thesis

Find:

- the failure mode
- the high-level job of the skill
- why the skill is necessary
- why it belongs in Production AI
- the components it provides
- how components connect
- how other skills consume it
- the best demo shape

Prefer concrete failure stories over generic "this skill helps with X" phrasing.

### 3. Write The YouTube Explanation Document

Use `references/video-breakdown-template.md`. Include:

- core story
- high-level explanation
- necessity
- Production AI role
- components table
- visual overview or flow diagram
- bad-vs-good example
- downstream/related skill consumption
- suggested video structure
- suggested titles
- thumbnail ideas
- demo outline
- key lines
- short description

Use Mermaid diagrams when a graph or flow improves the episode, but wrap long labels with `<br/>` so text fits visually.

### 4. Save And Verify

Save the file, then run focused hygiene checks:

```bash
LC_ALL=C grep -n '[^ -~[:space:]]' <artifact> || true
rg -n 'TODO|\[TODO\]|token|secret|private path|client name' <artifact> || true
```

When working in the public repo, run the repo privacy scan before reporting the artifact as public-ready.

If the repo has structural validation and the skill index changed, also run the repo validation wrapper from the repository root.

### 5. Report Outcome

Final response should include:

- YouTube explanation document path
- source files reviewed
- whether privacy/validation checks passed
- any missing live state that was not verified

## Content Status Tables

When asked which episodes exist, are scheduled, proposed, or missing, do not collapse different signals:

- Published: verified public video or explicitly recorded published row.
- Scheduled: verified scheduled/private video with publish date, or explicitly supplied schedule.
- Proposed next: user-stated upcoming order.
- Artifact ready: saved `docs/content/*-video-breakdown.md`.
- Content-map idea: row exists in `docs/content/content-map.md`.
- Missing: no dedicated artifact and no proposed/scheduled/published signal under the requested definition.

State the definition used before listing missing items.

## Completion Blockers

Do not call the work done if:

- the artifact was not saved,
- the response only describes the document/template instead of creating or updating the document,
- source files were not read,
- private terms or local paths remain in public content,
- long Mermaid labels visibly overflow when they could be wrapped,
- live publishing state is inferred without verification,
- the output omits why the topic belongs in Production AI,
- the output lacks a useful demo or visual angle.
