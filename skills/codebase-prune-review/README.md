# codebase-prune-review

**The failure this prevents:** "clean up the old upload code" and the agent enthusiastically deletes everything matching `upload` — including the compatibility route your mobile app's previous version still calls, and the webhook handler that only *looked* dead because its caller lives in another repo. Deletion is the one operation where agent confidence is most dangerous.

This skill makes removal a proof exercise: map live behavior first, classify every candidate with evidence, remove in tested layers.

## What it does

1. **Baseline the repo** from current truth — runtime config, package scripts, deployment config, tests — not historical docs.
2. **Map live behavior**: what must keep working, which entrypoints serve it, which tests prove it.
3. **Classify every candidate** into a closed taxonomy: `active / compatibility / superseded / dead / unknown` — each with recorded evidence.
4. **Build the proof plan first**: add missing tests for behavior that must survive *before* deleting anything near it.
5. **Remove one coherent layer at a time**, running targeted tests after each layer; update docs, env examples, fixtures, and manifests as paths disappear.
6. **Validate and report** with the final gate, dependency audit, and secret scan.

## The design choices worth stealing

- **`unknown` is a protected class.** Usage that can't be proven or disproven stays in place until references, runtime config, logs, or the user disprove it. The agent must exhaust repo evidence before even asking — and asking, not deleting, is the fallback.
- **`compatibility` is not `dead`.** Migration shims, old-client routes, redirects, and rollback paths are preserved intentionally and need a retirement plan, not a delete.
- **Layers keep rollback simple.** One coherent removal per commit, no mixed-in refactors or formatting churn — so any layer can be reverted alone.
- **Pruning is a security activity.** The skill frames removal as attack-surface reduction and pulls in the threat-model gate when removals touch auth, uploads, parsers, webhooks, or providers.
- **Behavior map before delete list.** The deliverable order is the insight: what must keep working is documented before anything is proposed for removal.

## Install

```bash
cp -R skills/codebase-prune-review ~/.codex/skills/
```

Triggers on removing old providers/integrations, legacy cleanup, dead-code review, post-migration cleanup, attack-surface reduction.

## Adapt it

- The discovery checklist (`references/discovery-checklist.md`) is stack-shaped — extend it for your frameworks' "hidden caller" patterns (cron definitions, queue consumers, infra-as-code references).
- If you operate multiple deployables from one repo, add cross-service reference checks to the `dead` evidence bar.
- Tie the completion report into your changelog: a prune well-documented is a future archaeology session avoided.
