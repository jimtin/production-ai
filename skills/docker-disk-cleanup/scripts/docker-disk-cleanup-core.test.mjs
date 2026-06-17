import test from "node:test";
import assert from "node:assert/strict";
import { buildPrunePlan, detectActiveGate, parseArgs } from "./docker-disk-cleanup-core.mjs";

test("parseArgs defaults to audit and current workspace", () => {
  const options = parseArgs([]);
  assert.equal(options.command, "audit");
  assert.equal(options.dryRun, false);
  assert.ok(options.workspace);
});

test("detectActiveGate identifies running gate-like containers", () => {
  assert.equal(
    detectActiveGate([{ Names: "repo-pr-gate-review-1", State: "running", Status: "Up 2 minutes" }]),
    true
  );
  assert.equal(
    detectActiveGate([{ Names: "postgres-dev", State: "running", Status: "Up 2 hours" }]),
    false
  );
});

test("active gate mode adds age filters to image and builder prune", () => {
  const plan = buildPrunePlan({
    activeGateMode: true,
    ageFilter: "1h",
    skipVolumes: false,
    volumeAllSupported: true
  });
  const image = plan.find((step) => step.id === "image-prune");
  const builder = plan.find((step) => step.id === "builder-prune");
  assert.deepEqual(image.args, ["image", "prune", "-a", "--filter", "until=1h", "-f"]);
  assert.deepEqual(builder.args, ["builder", "prune", "-a", "--filter", "until=1h", "-f"]);
});

test("skip volumes replaces volume prune with a skip step", () => {
  const plan = buildPrunePlan({
    activeGateMode: false,
    ageFilter: "1h",
    skipVolumes: true,
    volumeAllSupported: true
  });
  assert.equal(plan.some((step) => step.id === "volume-attachment-check"), false);
  assert.equal(plan.find((step) => step.id === "volume-prune").type, "skip");
});
