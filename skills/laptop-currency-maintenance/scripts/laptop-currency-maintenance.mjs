#!/usr/bin/env node
import {
  DEFAULT_CONFIG,
  buildReport,
  postDiscordReport,
  readJson
} from './laptop-currency-maintenance-core.mjs';

function parseArgs(argv) {
  const args = {
    mode: null,
    dryRun: false,
    noDiscord: false,
    discordDryRun: false,
    config: DEFAULT_CONFIG
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === 'audit' || arg === 'update') args.mode = arg;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--no-discord') args.noDiscord = true;
    else if (arg === '--discord-dry-run') args.discordDryRun = true;
    else if (arg === '--config') args.config = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.help || !args.mode) {
    throw new Error('Usage: laptop-currency-maintenance.mjs audit|update [--dry-run] [--no-discord] [--discord-dry-run] [--config <path>]');
  }
  if (args.mode === 'audit' && args.dryRun) {
    throw new Error('audit is already non-mutating; use update --dry-run for an update preview');
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await readJson(args.config);
  const report = await buildReport(config, args.mode, args.dryRun);
  const discord = args.noDiscord
    ? { posted: false, skipped: true, reason: 'disabled_by_flag' }
    : await postDiscordReport(config, report, { dryRun: args.discordDryRun });

  console.log(JSON.stringify({
    ok: report.ok,
    status: report.status,
    mode: report.mode,
    dryRun: report.dryRun,
    markdownPath: report.markdownPath,
    jsonPath: report.jsonPath,
    homebrewBefore: report.before?.homebrew?.formulae?.length ?? null,
    homebrewAfter: report.after?.homebrew?.formulae?.length ?? null,
    upgradedFormulae: report.homebrewUpdate?.upgradedFormulae || [],
    repoDependencyRepos: report.repoDependencies?.repos?.length || 0,
    repoDependencyOutdated: (report.repoDependencies?.repos || []).reduce((sum, repo) => sum + (repo.outdated?.counts?.total || 0), 0),
    commandFailures: (report.commands || []).filter((item) => !item.ok).length,
    discord
  }, null, 2));

  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
