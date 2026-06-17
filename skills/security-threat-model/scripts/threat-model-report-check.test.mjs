import test from "node:test";
import assert from "node:assert/strict";
import { checkThreatModelReport } from "./threat-model-report-check.mjs";

const goodReport = `# Example

## 1. Summary
- One issue.

## 2. Scope and Method
Confidence tags: confirmed, inferred, unknown.

## 3. System Model
| Component | Role | Entrypoints | Evidence | Confidence |
|---|---|---|---|---|
| Route | Handles webhooks | POST /webhook | src/route.ts:1 | confirmed |

## 4. Trust Boundaries
| Boundary | From -> To | Protections observed | Gaps | Evidence |
|---|---|---|---|---|
| Internet -> route | Public caller -> app | Signature check | No replay check | src/route.ts:1 |

## 5. Assets
| Asset | Where it lives | Why it drives risk |
|---|---|---|
| Events | Database | Integrity matters |

## 6. Attacker Profile
Capabilities: can send requests.
Non-capabilities: cannot read secrets.

## 7. Abuse Paths
| ID | Attacker goal | Path (entrypoint -> boundary -> asset) | Class | Likelihood | Impact | Priority | Existing controls | Evidence |
|---|---|---|---|---|---|---|---|---|
| AP-1 | Replay event | POST /webhook -> Internet -> route -> Events | integrity | medium | high | high | Signature check | src/route.ts:1 |

## 8. Recommended Mitigations
| Abuse path ID | Mitigation | Location | Control type |
|---|---|---|---|
| AP-1 | Store event IDs | src/route.ts | idempotency |

## 9. Assumptions and Open Questions
- unvalidated: replay is possible.
`;

test("accepts a traced report with required sections", () => {
  assert.deepEqual(checkThreatModelReport(goodReport), []);
});

test("rejects reports without abuse-path rows", () => {
  const failures = checkThreatModelReport(goodReport.replace("| AP-1 | Replay event |", "| Finding | Replay event |"));
  assert.ok(failures.some((failure) => failure.includes("No AP-* abuse path rows")));
});

test("rejects reports without assumption tags", () => {
  const failures = checkThreatModelReport(goodReport.replace("unvalidated", "assumed"));
  assert.ok(failures.some((failure) => failure.includes("No assumption tags")));
});
