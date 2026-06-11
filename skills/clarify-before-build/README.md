# clarify-before-build

**The failure this prevents:** you ask an agent for "a simple admin portal with proper auth," it builds *something* matching those words, and three days later you're untangling code built on guesses you never made together. Agents don't push back on vague specs — they fill the gaps with plausible defaults and momentum.

This skill makes the agent refuse to start building while the plan is still vibes.

## What it does

Turns planning requests into a question-led gate. The agent must:

1. Announce planning mode and summarize its current understanding.
2. Hunt unknowns, assumptions, contradictions, and risks — then ask focused question batches (3–7 when broad, fewer when one blocker remains).
3. Maintain a visible **planning ledger**: confirmed decisions, open questions, assumptions, out-of-scope, risks, acceptance criteria, verification requirements.
4. Produce a **Shared Understanding Contract** — including a Parallel Work decision — and get explicit confirmation before any implementation sequencing.
5. Hand off to the user-action coverage matrix as the first post-confirmation step when the plan is user-facing.

## The design choices worth stealing

- **It right-sizes itself.** Small, low-ambiguity changes get a lightweight pass — understanding summarized, assumptions stated inline, at most a couple of blocking questions — instead of the full ceremony. That protects the gate's authority for the work that needs it; planning gates die of friction, not of failure.
- **Vague-term translation.** The skill names the words that smuggle ambiguity — "simple", "robust", "secure", "production-ready", "MVP", and the AI-era set: "AI-powered", "agentic", "smart", "real-time", "scalable" — and forces each into observables: who, trigger, exact behavior, data, success state, failure state, test evidence, owner.
- **Question rounds converge.** After three rounds without convergence the agent stops interrogating and presents a decision menu — each remaining unknown with a recommended default and the risk of accepting it. Planning fatigue is a failure mode too.
- **A ledger, not a transcript — and it survives the session.** Answers update a structured ledger after every round, and long or multi-session planning writes it to a file updated in place. The file, not chat history, is the source of truth — your plans become reviewable git diffs, and context compaction can't eat a decision.
- **It can't deadlock headless.** Invoked with no user available, it refuses to fabricate answers: assumptions are marked `unvalidated`, the contract is emitted as `DRAFT - not confirmed`, and implementation is forbidden from starting on a draft.
- **Sibling gates are pulled in by condition.** Plans touching UI must absorb `$frontend-design-quality` requirements; security-sensitive plans must absorb `$security-threat-model`; nontrivial features must absorb `$feature-design-preflight`; and substantial user-facing plans must name `$user-action-coverage-review` as the first post-confirmation step. The contract can't close until their requirements appear in acceptance criteria.
- **Skipping is explicit.** The user can skip planning — but only after the agent summarizes the remaining ambiguity and gets approval to proceed with those named risks. Silent skips are banned.

## Install

```bash
cp -R skills/clarify-before-build ~/.codex/skills/
```

Triggers on plan/roadmap/design/architecture requests, or directly: *"Use `$clarify-before-build` to plan this feature."*

## Adapt it

- Tune the **Required Coverage** list (goal/non-goals → parallel-work decision) to your stack; it's the spine of the contract.
- The question bank in `references/question-bank.md` is where domain-specific judgment lives — nine categories including cost/limits — extend it with the questions your projects always need answered.
- Adjust the full-gate triggers in **Right-Sizing the Gate** to your risk reality; the boundary between "lightweight" and "full" is a policy choice.
- If your team uses a planning doc format already, make the Shared Understanding Contract emit it.
