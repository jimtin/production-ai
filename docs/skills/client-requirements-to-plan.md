# client-requirements-to-plan

**The failure this prevents:** a client says "we need to automate this process," the agent turns that into either a fluffy requirements document nobody can build from, or a full platform plan that is far bigger than the proof the client actually needs. Vague client input gets converted into momentum instead of shared understanding.

This skill turns early client notes into a saved, client-facing plan: numbered requirements, phased proof, open questions, technical validation work, assumptions, risks, and a handoff into the rest of the Production AI pipeline.

## Video

Companion episode not published yet. This is the proposed next intake/planning skill for turning discovery conversations into a reusable build reference.

## What it does

Builds the first durable artifact in a client engagement. The agent must:

1. Ingest source material: pasted notes, transcripts, screenshots, files, spreadsheets, API docs, prior threads, and user clarifications.
2. Convert vague terms into observable behavior: actor, trigger, input, required behavior, output, success state, failure state, owner, and proof.
3. Create a stable numbered requirements ledger with source evidence, phase, acceptance criteria, proof, and status.
4. Model source of truth explicitly: expected state, actual state, user-entered state, derived state, audit evidence, and output/report.
5. Split questions into technical validation owned by us, Phase 1 client questions, later-phase questions, and deferred decisions.
6. Phase the work around risk reduction, with Phase 1 as the smallest useful proof rather than a full platform.
7. Save a Markdown client plan and end with a Production AI handoff into `$clarify-before-build`, `$feature-design-preflight`, `$repo-testing-setup`, `$user-action-coverage-review`, `$security-threat-model`, and `$test-readiness-preflight`.

## The design choices worth stealing

- **Source evidence is required.** Every major requirement records where it came from: client notes, a file, a transcript, an API document, a screenshot, a user answer, or an assumption. Unsupported requirements cannot quietly become "confirmed."
- **Client questions and technical validation are separate.** The client should not be asked to answer API feasibility, parser behavior, or provider limitations that the delivery team can prove. The question register keeps those lanes apart.
- **The source-of-truth model is explicit.** The plan says which input represents expected state, which system represents actual state, and what happens when they disagree.
- **Phase 1 is deliberately small.** The first phase proves value with the fewest moving parts. Dashboards, long-term storage, notifications, scheduled automation, writeback, and production operations move later unless they are essential to the proof.
- **Sensitive source text is handled as hostile.** Discovery material often contains passwords, API keys, private URLs, personal data, or copied operational notes. The skill bans echoing credential-like material and requires security/privacy notes in the saved plan.
- **Readiness uses a closed vocabulary.** The plan is `READY`, `CONDITIONAL`, or `BLOCKED`. Early client plans should usually stay `DRAFT - not confirmed` until the client accepts them.
- **It does not replace the build gates.** This skill produces the client artifact. `$clarify-before-build` confirms the implementation contract after acceptance; `$feature-design-preflight` checks the feature design against real constraints; the testing, coverage, security, and validation gates take over from there.

## The saved plan

The output is a Markdown document that can live in a client/project folder:

```text
clients/<client-slug>/<project-slug>/plans/YYYY-MM-DD-client-plan.md
```

The template includes:

- executive summary
- source materials reviewed
- goal and non-goals
- current state and proposed end state
- users and actors
- source-of-truth model
- numbered requirements
- phase plan
- implementation plan
- open questions
- assumptions
- risks and mitigations
- testing and proof plan
- security and privacy notes
- Production AI handoff
- decision log
- definition of done

## Install

```bash
scripts/install-skill.sh client-requirements-to-plan
```

Triggers on requests like "turn these client notes into a plan," "formalize this client brief," "make the requirements numbered and testable," or "prepare this discovery call for the design/build pipeline."

## Adapt it

- Tune the plan template to your client-folder convention, but keep stable requirement IDs, source evidence, question registers, and the Production AI handoff.
- Add domain-specific question examples to `references/question-register.md` as repeated client patterns emerge.
- If plans start drifting, add a validator script that checks required sections, duplicate requirement IDs, and missing readiness status.
