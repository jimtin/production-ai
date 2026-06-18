#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_STATUS = "DRAFT - not confirmed";

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function escapeTable(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRedactors(redactions = []) {
  const builtIn = [
    {
      pattern: String.raw`-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----`,
      flags: "g",
      replacement: "[REDACTED PRIVATE KEY]",
    },
    {
      pattern: String.raw`\b(?:ghp|gho|github_pat|glpat|xoxb|xoxp)_[A-Za-z0-9_:-]{20,}\b`,
      flags: "g",
      replacement: "[REDACTED TOKEN]",
    },
    {
      pattern: String.raw`\bsk-[A-Za-z0-9_-]{20,}\b`,
      flags: "g",
      replacement: "[REDACTED TOKEN]",
    },
    {
      pattern: String.raw`/Users/[^/\s]+`,
      flags: "g",
      replacement: "/Users/<local-user>",
    },
    {
      pattern: String.raw`/home/[^/\s]+`,
      flags: "g",
      replacement: "/home/runner",
    },
    {
      pattern: String.raw`\b(?:10|127)\.(?:\d{1,3}\.){2}\d{1,3}\b|\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b|\b192\.168\.\d{1,3}\.\d{1,3}\b`,
      flags: "g",
      replacement: "192.0.2.10",
    },
  ];

  return [...builtIn, ...asArray(redactions)].map((entry) => {
    if (typeof entry === "string") {
      return {
        regex: new RegExp(escapeRegExp(entry), "g"),
        replacement: "[redacted]",
      };
    }
    if (!entry || !entry.pattern) {
      throw new Error("Each redaction must be a string or an object with pattern and replacement.");
    }
    return {
      regex: new RegExp(entry.pattern, entry.flags || "g"),
      replacement: entry.replacement ?? "[redacted]",
    };
  });
}

function sanitizeString(value, redactors) {
  return redactors.reduce((text, redactor) => text.replace(redactor.regex, redactor.replacement), value);
}

function sanitizeValue(value, redactors) {
  if (typeof value === "string") return sanitizeString(value, redactors);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, redactors));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, sanitizeValue(nested, redactors)]),
    );
  }
  return value;
}

function linesList(items) {
  const values = asArray(items);
  if (!values.length) return ["- None recorded."];
  return values.map((item) => `- ${item}`);
}

function profileRows(profile = {}) {
  const labels = [
    ["Runner", profile.runner],
    ["Repository", profile.repo],
    ["Gate", profile.gate],
    ["Platform", profile.platform],
    ["Access", profile.access],
    ["Scheduler", profile.scheduler],
    ["Skill source", profile.skillSource],
    ["Deployment model", profile.deploymentModel],
  ];
  return labels.filter(([, value]) => value !== undefined && value !== null && value !== "");
}

function renderKeyValueTable(rows) {
  if (!rows.length) return "None recorded.";
  return [
    "| Field | Value |",
    "|---|---|",
    ...rows.map(([field, value]) => `| ${escapeTable(field)} | ${escapeTable(value)} |`),
  ].join("\n");
}

function renderEvidenceTable(items) {
  const rows = asArray(items);
  if (!rows.length) return "None recorded.";
  return [
    "| Area | Status | Evidence |",
    "|---|---|---|",
    ...rows.map((row) => `| ${escapeTable(row.area)} | ${escapeTable(row.status)} | ${escapeTable(row.evidence)} |`),
  ].join("\n");
}

function renderAcceptanceTable(items) {
  const rows = asArray(items);
  if (!rows.length) return "None recorded.";
  return [
    "| Requirement | Intended change | Evidence | Status |",
    "|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${escapeTable(row.requirement)} | ${escapeTable(row.change)} | ${escapeTable(row.evidence)} | ${escapeTable(row.status)} |`,
    ),
  ].join("\n");
}

function renderFixPlanTable(items) {
  const rows = asArray(items);
  if (!rows.length) return "None recorded.";
  return [
    "| Priority | Issue | Proposed fix | Proof | Status |",
    "|---|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${escapeTable(row.priority)} | ${escapeTable(row.issue)} | ${escapeTable(row.fix || row.action)} | ${escapeTable(row.proof)} | ${escapeTable(row.status)} |`,
    ),
  ].join("\n");
}

export function renderSetupReport(input = {}) {
  const redactors = buildRedactors(input.redactions);
  const data = sanitizeValue(input, redactors);
  const title = data.title || "PR Gate Runner Setup Report";
  const status = data.status || DEFAULT_STATUS;
  const updated = data.updated || new Date().toISOString().slice(0, 10);
  const visibility = data.visibility || "private";

  return [
    `# ${title}`,
    "",
    `**Status:** ${status}`,
    `**Updated:** ${updated}`,
    `**Visibility:** ${visibility}`,
    "",
    "## Environment Profile",
    "",
    renderKeyValueTable(profileRows(data.profile || data.scope)),
    "",
    "## Executive Summary",
    "",
    ...linesList(data.summary),
    "",
    "## Public Skill Bootstrap",
    "",
    ...linesList(data.bootstrap),
    "",
    "## Progressive Discovery",
    "",
    renderEvidenceTable(data.discovery),
    "",
    "## Acceptance Ledger",
    "",
    renderAcceptanceTable(data.acceptance),
    "",
    "## Proposed Fix Plan",
    "",
    renderFixPlanTable(data.fixPlan || data.proposedFixes),
    "",
    "## Install Plan",
    "",
    ...linesList(data.installPlan || data.sequence),
    "",
    "## Docker Cleanup Plan",
    "",
    ...linesList(data.dockerCleanup),
    "",
    "## Scheduler Plan",
    "",
    ...linesList(data.scheduler),
    "",
    "## Verification Plan",
    "",
    ...linesList(data.verification),
    "",
    "## Recovery Plan",
    "",
    ...linesList(data.recovery || data.rollback),
    "",
    "## Open Questions",
    "",
    ...linesList(data.openQuestions),
    "",
  ].join("\n");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function main(argv) {
  const [, , inputPath] = argv;
  if (!inputPath || inputPath === "--help" || inputPath === "-h") {
    const script = path.basename(fileURLToPath(import.meta.url));
    console.error(`Usage: node ${script} setup-input.json > setup-report.md`);
    return inputPath ? 0 : 2;
  }
  const input = readJson(inputPath);
  process.stdout.write(renderSetupReport(input));
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv);
}
