#!/usr/bin/env node
import { parseArgs, runCleanup } from "./docker-disk-cleanup-core.mjs";

try {
  const options = parseArgs(process.argv.slice(2));
  const report = await runCleanup(options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Docker disk cleanup status: ${report.status}`);
    console.log(`Active gate mode: ${report.activeGateMode ? "yes" : "no"}`);
    console.log(`Dry run: ${report.dryRun ? "yes" : "no"}`);
    console.log(`Report: ${report.reportPath}`);
    if (report.blockers.length) {
      console.log("Blockers:");
      for (const blocker of report.blockers) {
        console.log(`- ${blocker}`);
      }
    }
  }
  process.exitCode = report.status === "blocked" ? 2 : 0;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
