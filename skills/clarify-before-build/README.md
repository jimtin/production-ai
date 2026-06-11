# clarify-before-build

**The failure this prevents:** you ask an agent for "a simple admin portal with proper auth," it builds *something* matching those words, and three days later you're untangling code built on guesses you never made together. Agents don't push back on vague specs — they fill the gaps with plausible defaults and momentum.

This skill makes the agent refuse to start building while the plan is still vibes.

## What it does

Turns planning requests into a question-led gate. The agent must:

1. Announce planning mode and summarize its current understanding.
2. Hunt unknowns, assumptions, contradictions, and risks — then ask focused question batches (3–7 when broad, fewer when one blocker remains).
3. Maintain a visible **planning ledger**: confirmed decisions, open questions, assumptions, out-of-scope, risks, acceptance criteria, verification requirements.
4. Produce a **Shared Understanding Contract** and get explicit confirmation before any implementation sequencing.

## The design choices worth stealing

- **Vague-term translation.** The skill names the words that smuggle ambiguity — "simple", "robust", "secure", "production-ready", "MVP" — and forces each into observables: who, trigger, exact behavior, data, success state, failure state, test evidence, owner.
- **A ledger, not a transcript.** Answers update a structured ledger after every round, so stale assumptions can't survive silently in paragraph twelve.
- **Sibling gates are pulled in by condition.** Plans touching UI must absorb `$frontend-design-quality` requirements; security-sensitive plans must absorb `$security-threat-model`; nontrivial features must absorb `$feature-design-preflight`. The contract can't close until their requirements appear in acceptance criteria.
- **Skipping is explicit.** The user can skip planning — but only after the agent summarizes the remaining ambiguity and gets approval to proceed with those named risks. Silent skips are banned.

## Install

```bash
cp -R skills/clarify-before-build ~/.codex/skills/
```

Triggers on plan/roadmap/design/architecture requests, or directly: *"Use `$clarify-before-build` to plan this feature."*

## Adapt it

- Tune the **Required Coverage** list (goal/non-goals → definition of done) to your stack; it's the spine of the contract.
- The question bank in `references/question-bank.md` is where domain-specific judgment lives — extend it with the questions your projects always need answered.
- If your team uses a planning doc format already, make the Shared Understanding Contract emit it.
