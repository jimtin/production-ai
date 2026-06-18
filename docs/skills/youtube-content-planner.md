# youtube-content-planner

**The failure this prevents:** a useful skill exists, but every video about it starts from scratch. The hook changes, the structure drifts, the visual is missing, and the episode stops connecting back to the Production AI graph.

This skill creates the recurring YouTube explanation document used for Building The Age of AI skill episodes.

When the user asks for "the YouTube document," "the YouTube artifact," or a skill video breakdown, this skill writes the saved Markdown document rather than just describing what should go in it.

## Video

Companion episode not published yet. This is a content-production skill for turning repo artifacts into repeatable YouTube episode breakdowns.

## What it does

Creates reusable Markdown YouTube explanation documents under `docs/content/`:

1. Reads the source skill payload, public guide, proposal, or pattern document.
2. Extracts the core failure story and Production AI role.
3. Builds the episode structure: high-level explanation, necessity, components, component connections, related-skill consumption, suggested video structure, titles, thumbnails, demo outline, key lines, and short description.
4. Adds Mermaid visuals when a graph or flow helps, with wrapped labels so the diagram is actually usable on screen.
5. Runs public-content hygiene checks so local paths, private names, TODO markers, and secret-like strings do not leak into the artifact.

It does **not** upload, schedule, or mutate live YouTube, Notion, Drive, or channel state.

## The design choices worth stealing

- **Content is generated from repo truth.** The skill reads the installable payload and public guide before writing the episode. The artifact is not a generic commentary piece.
- **The failure leads.** Each video starts with what goes wrong when agents do not have this skill or system contract.
- **The structure is stable.** Episode drafts include the same core sections, so a series can be compared and improved over time.
- **Visuals are part of the artifact.** The skill expects component graphs, skill graph handoffs, or workflow diagrams where they clarify the story.
- **Status language is precise.** Published, scheduled, proposed, artifact-ready, content-map idea, and missing are separate states.
- **Live channel work is out of scope.** Planning artifacts are safe to create in the public repo; publishing automation needs a separate live-ops workflow.

## The artifact

Default output:

```text
docs/content/<topic>-video-breakdown.md
```

The artifact includes:

- core story
- what the skill does
- why it is necessary
- why it belongs in Production AI
- components table
- skill overview visual
- bad-vs-good example
- downstream skill consumption
- suggested video structure
- suggested titles
- thumbnail ideas
- demo outline
- key lines
- short description

## Install

```bash
scripts/install-skill.sh youtube-content-planner
```

Triggers on requests like "create the YouTube document," "generate the YouTube artifact," "build the episode breakdown," "turn this skill into a video outline," "give me title and thumbnail ideas," or "which skills have no episode planned?"

## Adapt it

- Extend `references/channel-style.md` if the channel voice changes.
- Extend `references/video-breakdown-template.md` if new recurring sections become useful.
- Keep `references/content-status-rules.md` strict so "planned" and "published" are never conflated.
