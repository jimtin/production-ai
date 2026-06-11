# The workspace constitution

[`templates/AGENTS-workspace-template.md`](../templates/AGENTS-workspace-template.md) is a complete, battle-tested `AGENTS.md` that governs every repo under a development workspace. Drop it at your workspace root (e.g. `~/workspace/AGENTS.md`); agent harnesses read it for every repo underneath, and repo-local files can only make it stricter.

It is ~390 lines of policy. This doc is the guided tour — what each section enforces and why it earned its place.

## The core quality bar

Fifteen numbered rules that define "complete" for any code change. The load-bearing ones:

- **≥90% unit coverage** (statements, branches, functions, lines), **critical paths under integration tests**, **every user action under browser/E2E tests**. Three layers, none optional.
- **Secret scan + threat-model review before any push.** Not "when security seems relevant" — the agent does not get to decide relevance unilaterally.
- **Container-only validation.** Host-run lint/test/build is never canonical proof. The host orchestrates Docker; containers produce evidence. This kills "works on my machine" *and* "works in the agent's environment."
- **Hooks enforce the same gates.** Pre-commit runs a fast containerized lane, pre-push runs the full one. Rules without hooks are requests, not gates.

## Ledgers: the anti-drift mechanism

For any task with more than one requirement, the constitution requires an **acceptance ledger** (each requirement → intended change → proving evidence → status: `pending / implemented / verified / blocked`) and a **test ledger** (each changed file → the focused test that covers it).

This is the single most effective rule in the file. Long agent sessions drift; requirements raised in the middle of a conversation evaporate by the end. A ledger the agent must keep current converts "I think we got everything" into a table with no empty cells.

## Local-first verification

Remote CI is treated as scarce and slow: "Do not push speculative commits just to discover failures in GitHub Actions." The full local container gate is the proof; remote systems only validate what genuinely cannot be proven locally (e.g. provider-managed encrypted secrets — which get an explicit "remote-only validation gap" note instead of a workaround).

The section also bans the classic agent failure mode of looping on inaccessible secrets: don't retry pulls, don't mutate env loading, don't weaken validation — document the boundary and move on.

## Database changes are release-sequencing work

Schema rules assume the deployment train, not just the test suite: **expand → deploy → contract**. Backward-compatible migration first, compatible code second, destructive cleanup in a later release once compatibility is proven. Code that reads a column which doesn't exist in production yet is incomplete work even if every local test passes.

## Coverage failure is work, not a stopping point

A dedicated section classifies coverage failures (changed-code gap / inherited debt / mis-scoped denominator / command misuse / host-container variance) and prescribes the response to each. The agent is forbidden from the two easy outs: lowering the threshold, and stopping with "coverage is blocking" as a final answer.

## Parallel agent rules

Multi-agent work requires a written **Parallel Work decision** in every substantial plan: either the worker lanes with disjoint file ownership and expected evidence, or an explicit reason parallelism doesn't apply. Workers are told they are not alone in the codebase; the main agent owns integration, final validation, and the completion report.

## Version currency, push discipline, deployment policy

- Touched dependencies get checked against latest stable — no cargo-culting old pins, no drive-by upgrade sprees either.
- Production deploys come from the git integration (`main`), never from a laptop CLI deploy, except break-glass with explicit approval.
- Preview deployments are not a substitute for local gates.

## Completion reports

Every substantial task ends with a report: what changed, what was verified with which commands, what was skipped and why, what remains. The report format makes "quietly didn't do it" structurally awkward — which, for agents, is most of the battle.

## How to adopt it

1. Copy the template to your workspace root as `AGENTS.md` (Claude Code: merge into `CLAUDE.md`).
2. **Delete every rule you will not enforce.** An aspirational constitution trains the agent that rules are decorative. It is better to enforce 90% coverage on two repos than to claim it on ten.
3. Stand up the enforcement the rules assume, repo by repo: a containerized verify command, pre-commit/pre-push hooks, a secret-scan wrapper. The [test-readiness-preflight](../skills/test-readiness-preflight/) skill includes a repo adoption template for exactly this.
4. Keep skills and constitution in sync: the constitution names the skills (`$clarify-before-build`, `$test-readiness-preflight`, …) at the moments they become mandatory. If you rename or remove a skill, update the constitution in the same change.
