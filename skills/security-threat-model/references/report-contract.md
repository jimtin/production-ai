# Threat Model Report Contract

The report is `<target-name>-threat-model.md`, written at the target root. Keep it concise enough to review in one sitting — the value is in traceability, not volume. Every section below is required; write "none identified" with a reason rather than omitting a section.

## 1. Summary

3–6 bullets: the riskiest abuse paths, the overall posture, and the single most valuable mitigation. Written last, placed first.

## 2. Scope and Method

- In-scope paths and out-of-scope items, stated explicitly.
- How the system runs and where it is exposed.
- Confidence-tag legend: `confirmed` = file evidence cited, `inferred` = reasonable reading of evidence, `unknown` = could not be determined.

## 3. System Model

| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|

Separate tables (or clearly marked rows) for runtime vs. CI/build vs. dev/test surfaces.

## 4. Trust Boundaries

| Boundary | From → To | Protections observed (auth, validation, rate limits) | Gaps | Evidence |
|---|---|---|---|---|

Every discovered boundary must be either represented in section 7 or explicitly dismissed here with
an evidence-backed low-relevance reason. Do not invent abuse paths just to satisfy coverage.

## 5. Assets

| Asset | Where it lives | Why it drives risk |
|---|---|---|

## 6. Attacker Profile

Two explicit lists: **capabilities** (what a realistic attacker in this deployment can do) and **non-capabilities** (what they cannot — the severity-inflation guard).

## 7. Abuse Paths

| ID | Attacker goal | Path (entrypoint → boundary → asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|

- `Class` uses the skill's closed taxonomy (`access / exfiltration / integrity / execution / availability / detection-evasion`).
- `Likelihood` and `Impact` are `low / medium / high`, each justified in one line below the table or in the row.
- `Priority` is `critical / high / medium / low`, adjusted for evidenced controls.
- If no plausible abuse path exists for a boundary, record the dismissal in section 4 instead of
  adding a forced low-quality finding.

## 8. Recommended Mitigations

| Abuse path ID | Mitigation | Location (file/component/boundary) | Control type |
|---|---|---|---|

Never merge this with existing controls — section 7 carries what exists; this section carries what should change.

## 9. Assumptions and Open Questions

- Assumptions that materially affect ranking, each tagged `user-confirmed`, `user-corrected`, or `unvalidated`.
- Questions asked, answers received, and which priorities are conditional on unanswered ones.
