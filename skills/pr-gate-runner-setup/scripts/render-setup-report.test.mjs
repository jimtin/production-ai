import assert from "node:assert/strict";
import test from "node:test";

import { renderSetupReport } from "./render-setup-report.mjs";

test("renders the main setup sections", () => {
  const report = renderSetupReport({
    title: "Example Setup",
    updated: "2026-06-18",
    visibility: "sanitized",
    profile: {
      runner: "example-runner",
      gate: "example-web-pr-gate",
      repo: "example-org/example-web-app",
      skillSource: "Public production-ai checkout",
    },
    summary: ["Public skills are planned.", "Scheduler is not installed yet."],
    bootstrap: ["Install pr-gate-runner-setup.", "Install pr-production-gate."],
    discovery: [{ area: "Docker", status: "verified", evidence: "Compose responds." }],
    acceptance: [
      {
        requirement: "Public skill baseline",
        change: "Install required public skills.",
        evidence: "Skill install readback lists expected skills.",
        status: "planned",
      },
    ],
    fixPlan: [
      {
        priority: "P1",
        issue: "Scheduler is missing.",
        fix: "Install run and healthcheck tasks from the checked-in task installer.",
        proof: "Task readback shows enabled tasks and the healthcheck exits 0.",
        status: "planned",
      },
    ],
    installPlan: ["Create base runner directories.", "Render config."],
    verification: ["First run exits with a closed status."],
  });

  assert.match(report, /^# Example Setup/m);
  assert.match(report, /## Environment Profile/);
  assert.match(report, /## Public Skill Bootstrap/);
  assert.match(report, /## Progressive Discovery/);
  assert.match(report, /Public skill baseline/);
  assert.match(report, /## Proposed Fix Plan/);
  assert.match(report, /Scheduler is missing/);
  assert.match(report, /Task readback shows enabled tasks/);
  assert.match(report, /First run exits with a closed status/);
});

test("redacts built-in sensitive values and caller-provided values", () => {
  const privatePath = "/Users/" + "alex/private-repo";
  const privateHome = "/home/" + "internaluser/pr-gate";
  const privateAddress = "192." + "168.1.44";
  const token = "ghp_" + "abcdefghijklmnopqrstuvwxyz1234567890";

  const report = renderSetupReport({
    title: "Sensitive Setup",
    summary: [`Token ${token}`, privatePath, privateHome, privateAddress, "internal-hostname"],
    redactions: [{ pattern: "internal-hostname", replacement: "example-runner" }],
  });

  assert.doesNotMatch(report, new RegExp(token));
  assert.doesNotMatch(report, /alex/);
  assert.doesNotMatch(report, /internaluser/);
  assert.doesNotMatch(report, /192\.168\.1\.44/);
  assert.match(report, /\[REDACTED TOKEN\]/);
  assert.match(report, /\/Users\/<local-user>\/private-repo/);
  assert.match(report, /\/home\/runner\/pr-gate/);
  assert.match(report, /192\.0\.2\.10/);
  assert.match(report, /example-runner/);
});

test("escapes markdown table pipes", () => {
  const report = renderSetupReport({
    discovery: [{ area: "Config", status: "blocked", evidence: "value A | value B" }],
  });

  assert.match(report, /value A \\\| value B/);
});

test("renders proposed fix action aliases", () => {
  const report = renderSetupReport({
    proposedFixes: [
      {
        priority: "P0",
        issue: "Runtime PATH is nondeterministic.",
        action: "Prepend the Linux runtime path in the scheduler wrapper.",
        proof: "Scheduler-context healthcheck resolves the intended runtime.",
        status: "implemented",
      },
    ],
  });

  assert.match(report, /Runtime PATH is nondeterministic/);
  assert.match(report, /Prepend the Linux runtime path/);
  assert.match(report, /Scheduler-context healthcheck/);
});
