# Channel Style

Use these rules for Building The Age of AI content artifacts.

## Core Angle

The channel is about building reliable AI systems, not collecting prompts. Every episode should connect a concrete agent failure to a repeatable system, skill, gate, or workflow that prevents it.

Default story shape:

1. The agent failure.
2. Why normal prompting does not fix it.
3. The reusable skill or system contract.
4. The proof or artifact it produces.
5. How it fits the larger Production AI graph.

## Voice

- Direct, practical, and systems-oriented.
- Lead with the failure, not the feature.
- Prefer "what this prevents" over "what this does."
- Avoid generic AI hype.
- Avoid client-specific details unless the user explicitly wants a private draft.

## Visual Rules

- Use Mermaid for skill graphs, flows, and component relationships.
- Wrap long node labels with `<br/>`.
- Keep on-screen labels short.
- Prefer before/after examples:
  - vague prompt vs structured requirement,
  - bad finding vs traced abuse path,
  - broad command vs safe workflow,
  - "looks done" vs proof.
- Include thumbnail ideas that communicate the failure in 2-5 words.

## Required Episode Angles

For a skill episode, cover:

- What the skill does at a high level.
- Why it is necessary.
- Why it is part of Production AI.
- The components it provides.
- How those components connect.
- How other skills or systems consume its output.

## Public Safety

Public artifacts must not include:

- private filesystem paths,
- private channel/database IDs,
- client names,
- private repo names,
- tokens or token-like strings,
- unpublished operational state unless the user explicitly approves a private artifact.
