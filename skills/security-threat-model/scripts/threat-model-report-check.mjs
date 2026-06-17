#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const REQUIRED_HEADINGS = [
  "## 1. Summary",
  "## 2. Scope and Method",
  "## 3. System Model",
  "## 4. Trust Boundaries",
  "## 5. Assets",
  "## 6. Attacker Profile",
  "## 7. Abuse Paths",
  "## 8. Recommended Mitigations",
  "## 9. Assumptions and Open Questions"
];

const CONFIDENCE_TAGS = ["confirmed", "inferred", "unknown"];
const ASSUMPTION_TAGS = ["user-confirmed", "user-corrected", "unvalidated"];
const ABUSE_CLASSES = ["access", "exfiltration", "integrity", "execution", "availability", "detection-evasion"];

export function checkThreatModelReport(text) {
  const failures = [];
  for (const heading of REQUIRED_HEADINGS) {
    if (!text.includes(heading)) {
      failures.push(`Missing required heading: ${heading}`);
    }
  }

  if (!CONFIDENCE_TAGS.some((tag) => new RegExp(`\\b${tag}\\b`).test(text))) {
    failures.push("No confidence tags found: confirmed, inferred, or unknown.");
  }

  if (!ASSUMPTION_TAGS.some((tag) => text.includes(tag))) {
    failures.push("No assumption tags found: user-confirmed, user-corrected, or unvalidated.");
  }

  const abuseSection = section(text, "## 7. Abuse Paths", "## 8. Recommended Mitigations");
  if (!/\|\s*AP-[0-9]+/.test(abuseSection)) {
    failures.push("No AP-* abuse path rows found in section 7.");
  }
  if (!ABUSE_CLASSES.some((tag) => new RegExp(`\\b${tag}\\b`).test(abuseSection))) {
    failures.push("No abuse-path taxonomy class found in section 7.");
  }
  if (!/(->|→)/.test(abuseSection)) {
    failures.push("No traced path arrow found in section 7.");
  }

  const boundarySection = section(text, "## 4. Trust Boundaries", "## 5. Assets");
  if (!/\|.*\|.*\|/.test(boundarySection)) {
    failures.push("Trust boundaries section does not appear to contain a table.");
  }

  const mitigationSection = section(text, "## 8. Recommended Mitigations", "## 9. Assumptions and Open Questions");
  if (!/\|\s*AP-[0-9]+/.test(mitigationSection) && !/none identified/i.test(mitigationSection)) {
    failures.push("Mitigations section has neither AP-* rows nor an explicit none identified reason.");
  }

  return failures;
}

function section(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading);
  if (start === -1) return "";
  const end = text.indexOf(endHeading, start + startHeading.length);
  return text.slice(start, end === -1 ? undefined : end);
}

async function main(argv) {
  const path = argv[0];
  if (!path || path === "-h" || path === "--help") {
    console.error("Usage: threat-model-report-check.mjs <report.md>");
    return 2;
  }
  const text = await readFile(path, "utf8");
  const failures = checkThreatModelReport(text);
  if (failures.length) {
    for (const failure of failures) {
      console.error(`ERROR: ${failure}`);
    }
    return 1;
  }
  console.log("Threat model report contract check passed.");
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main(process.argv.slice(2));
}
