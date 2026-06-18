import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const DEFAULT_CONFIG = fileURLToPath(new URL('./config.json', import.meta.url));
const DISCORD_API_BASE = 'https://discord.com/api/v10';

export async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}

export async function ensureDirs(config) {
  await fs.mkdir(config.reportsDir, { recursive: true });
  await fs.mkdir(config.stateDir, { recursive: true });
  await fs.mkdir(config.logDir, { recursive: true });
}

export function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve) => {
    execFile(command, args, {
      cwd: options.cwd,
      env: options.env || process.env,
      timeout: options.timeoutMs ?? 120000,
      maxBuffer: options.maxBuffer ?? 30 * 1024 * 1024
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        code: error?.code ?? 0,
        signal: error?.signal ?? null,
        command,
        args,
        cwd: options.cwd || process.cwd(),
        stdout: String(stdout || ''),
        stderr: String(stderr || ''),
        error: error?.message || null
      });
    });
  });
}

export function quoteShell(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

export async function commandExists(command, runner = runCommand) {
  const result = await runner('/bin/zsh', ['-lc', `command -v ${quoteShell(command)}`], { timeoutMs: 10000 });
  return result.ok && result.stdout.trim().length > 0;
}

export function sanitizeText(input, token = '') {
  let out = String(input || '');
  if (token) out = out.split(token).join('[REDACTED_DISCORD_BOT_TOKEN]');
  const home = process.env.HOME || '';
  if (home) out = out.split(home).join('~');
  out = out.replace(/\/Users\/[^/\s`'")]+/g, '~');
  out = out.replace(/\/home\/[^/\s`'")]+/g, '~');
  out = out.replace(/@everyone/g, '@\u200beveryone').replace(/@here/g, '@\u200bhere');
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
  out = out.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]');
  out = out.replace(/\b(?:gho|ghp|github_pat|glpat)_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GIT_TOKEN]');
  out = out.replace(/[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/g, '[REDACTED_DISCORD_TOKEN]');
  out = out.replace(/\b(?:org|prj)_[A-Za-z0-9]{8,}\b/g, '[REDACTED_PROVIDER_ID]');
  out = out.replace(/((?:api[_-]?key|token|secret|password|client_secret|database_url|postgres_url|mysql_url|redis_url)\s*[:=]\s*)[^\s`'"]+/gi, '$1[REDACTED]');
  out = out.replace(/([?&](?:token|key|secret|password|signature|sig)=)[^&\s]+/gi, '$1[REDACTED]');
  return out;
}

export function truncate(value, max = 4000, token = '') {
  const clean = sanitizeText(value, token);
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

function parseJson(stdout, fallback = null) {
  const text = String(stdout || '').trim();
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function parseBrewOutdated(stdout) {
  const parsed = parseJson(stdout, { formulae: [], casks: [] });
  return {
    formulae: Array.isArray(parsed?.formulae) ? parsed.formulae : [],
    casks: Array.isArray(parsed?.casks) ? parsed.casks : []
  };
}

export function parseBrewInfo(stdout) {
  const parsed = parseJson(stdout, { formulae: [], casks: [] });
  const formulae = Array.isArray(parsed?.formulae) ? parsed.formulae : [];
  return new Map(formulae.map((item) => [item.name, {
    name: item.name,
    installed: Array.isArray(item.installed) ? item.installed.map((entry) => entry.version) : [],
    stable: item.versions?.stable || null,
    pinned: Boolean(item.pinned)
  }]));
}

export function parsePinnedList(stdout) {
  return new Set(String(stdout || '').split('\n').map((item) => item.trim()).filter(Boolean));
}

export function versionParts(version) {
  const match = String(version || '').match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return [Number(match[1] || 0), Number(match[2] || 0), Number(match[3] || 0)];
}

export function classifyVersionGap(current, latest) {
  const currentParts = versionParts(current);
  const latestParts = versionParts(latest);
  if (!currentParts || !latestParts) return 'unknown';
  if (currentParts[0] !== latestParts[0]) return 'major';
  if (currentParts[1] !== latestParts[1]) return 'minor';
  if (currentParts[2] !== latestParts[2]) return 'patch';
  return 'current';
}

export function classifyBrewFormula(formula, pinnedNames = new Set(), info = null, options = {}) {
  const name = formula.name;
  const installed = formula.installed_versions || info?.installed || [];
  const current = installed[installed.length - 1] || null;
  const latest = formula.current_version || info?.stable || null;
  const pinned = Boolean(formula.pinned || info?.pinned || pinnedNames.has(name));
  const highImpactNames = options.highImpactNames || new Set();
  return {
    name,
    installed,
    current,
    latest,
    pinned,
    highImpact: highImpactNames.has(name),
    gap: classifyVersionGap(current, latest),
    action: pinned ? 'skip_pinned' : 'auto_upgrade_formula'
  };
}

export async function brewSnapshot(config, runner = runCommand) {
  if (!config.homebrew?.enabled) return { available: false, reason: 'disabled' };
  if (!await commandExists('brew', runner)) return { available: false, reason: 'brew command not found' };

  const outdatedResult = await runner('brew', ['outdated', '--json=v2'], { timeoutMs: 180000, maxBuffer: 30 * 1024 * 1024 });
  const pinnedResult = await runner('brew', ['list', '--pinned'], { timeoutMs: 30000 });
  const leavesResult = await runner('brew', ['leaves'], { timeoutMs: 60000 });
  const cleanupResult = await runner('brew', ['cleanup', '-n'], { timeoutMs: 180000, maxBuffer: 30 * 1024 * 1024 });
  const outdated = parseBrewOutdated(outdatedResult.stdout);
  const pinnedNames = parsePinnedList(pinnedResult.stdout);
  const highImpactNames = new Set(config.homebrew?.highImpactFormulae || []);
  let infoByName = new Map();
  let infoCommand = null;

  if (outdated.formulae.length) {
    const names = outdated.formulae.map((item) => item.name).filter(Boolean);
    const infoResult = await runner('brew', ['info', '--json=v2', '--formula', ...names], { timeoutMs: 180000, maxBuffer: 30 * 1024 * 1024 });
    infoCommand = commandSummary(infoResult);
    infoByName = parseBrewInfo(infoResult.stdout);
  }
  const commands = {
    outdated: commandSummary(outdatedResult),
    pinned: commandSummary(pinnedResult),
    leaves: commandSummary(leavesResult),
    cleanupDryRun: commandSummary(cleanupResult)
  };
  if (infoCommand) commands.info = infoCommand;

  return {
    available: true,
    ok: Object.values(commands).every((command) => command.ok),
    commands,
    formulae: outdated.formulae.map((formula) => classifyBrewFormula(
      formula,
      pinnedNames,
      infoByName.get(formula.name),
      { highImpactNames }
    )),
    casks: outdated.casks.map((cask) => ({
      name: cask.name,
      installed: cask.installed_versions || [],
      latest: cask.current_version || null,
      action: 'report_only_cask'
    })),
    pinned: [...pinnedNames].sort(),
    leaves: leavesResult.ok ? leavesResult.stdout.trim().split('\n').filter(Boolean).sort() : [],
    cleanupDryRun: truncate(cleanupResult.stdout || cleanupResult.stderr, 12000)
  };
}

export function commandSummary(result, token = '') {
  return {
    ok: Boolean(result.ok),
    code: result.code ?? 0,
    command: result.command,
    args: result.args || [],
    stdout: truncate(result.stdout, 6000, token),
    stderr: truncate(result.stderr, 6000, token),
    error: result.error ? truncate(result.error, 1000, token) : null
  };
}

export async function collectCliVersions(config, runner = runCommand) {
  const versions = [];
  for (const item of config.cliVersionCommands || []) {
    if (!await commandExists(item.command, runner)) {
      versions.push({ name: item.name, command: item.command, available: false, reason: 'command_not_found' });
      continue;
    }
    const result = await runner(item.command, item.args || [], { timeoutMs: 30000, maxBuffer: 1024 * 1024 });
    versions.push({
      name: item.name,
      command: item.command,
      args: item.args || [],
      available: true,
      ok: result.ok,
      version: truncate((result.stdout || result.stderr).trim(), 500),
      error: result.ok ? null : result.stderr || result.error
    });
  }
  return versions;
}

export function parseNpmOutdated(stdout) {
  const parsed = parseJson(stdout, {});
  return Object.entries(parsed || {}).map(([name, value]) => ({
    name,
    current: value.current || null,
    wanted: value.wanted || null,
    latest: value.latest || null,
    type: value.type || null,
    gap: classifyVersionGap(value.current || value.wanted, value.latest)
  }));
}

export function parseYarnOutdated(stdout) {
  const entries = [];
  for (const line of String(stdout || '').split('\n').map((item) => item.trim()).filter(Boolean)) {
    const parsed = parseJson(line, null);
    if (parsed?.type !== 'table') continue;
    for (const row of parsed.data?.body || []) {
      entries.push({
        name: row[0],
        current: row[1] || null,
        wanted: row[2] || null,
        latest: row[3] || null,
        type: row[5] || null,
        gap: classifyVersionGap(row[1], row[3])
      });
    }
  }
  return entries;
}

export function parsePnpmOutdated(stdout) {
  const parsed = parseJson(stdout, {});
  if (Array.isArray(parsed)) {
    return parsed.map((item) => ({
      name: item.packageName || item.name,
      current: item.current || null,
      wanted: item.wanted || null,
      latest: item.latest || null,
      type: item.dependencyType || null,
      gap: classifyVersionGap(item.current, item.latest)
    }));
  }
  return Object.entries(parsed || {}).map(([name, value]) => ({
    name,
    current: value.current || null,
    wanted: value.wanted || null,
    latest: value.latest || null,
    type: value.type || null,
    gap: classifyVersionGap(value.current, value.latest)
  }));
}

export function summarizeOutdated(entries, maxPackages = 20) {
  const counts = { total: entries.length, major: 0, minor: 0, patch: 0, unknown: 0 };
  for (const item of entries) {
    if (item.gap === 'major') counts.major += 1;
    else if (item.gap === 'minor') counts.minor += 1;
    else if (item.gap === 'patch') counts.patch += 1;
    else counts.unknown += 1;
  }
  return {
    counts,
    packages: entries.slice(0, maxPackages)
  };
}

export function parseNpmAudit(stdout) {
  const parsed = parseJson(stdout, null);
  const vulnerabilities = parsed?.metadata?.vulnerabilities;
  if (!vulnerabilities) return { available: Boolean(parsed), counts: null };
  return { available: true, counts: vulnerabilities };
}

export async function globalNpmSnapshot(config, runner = runCommand) {
  if (!config.globalNpm?.enabled) return { available: false, reason: 'disabled' };
  if (!await commandExists('npm', runner)) return { available: false, reason: 'npm command not found' };
  const result = await runner('npm', ['outdated', '-g', '--json', '--depth=0'], { timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
  const entries = parseNpmOutdated(result.stdout);
  return {
    available: true,
    reportOnly: true,
    command: commandSummary(result),
    outdated: summarizeOutdated(entries, config.repoDependencies?.maxPackagesPerRepo ?? 20)
  };
}

export async function discoverPackageRepos(workspace, options = {}) {
  const maxDepth = options.maxDepth ?? 4;
  const maxRepos = options.maxRepos ?? 50;
  const repos = [];
  async function walk(current, depth) {
    if (repos.length >= maxRepos || depth > maxDepth) return;
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((entry) => entry.isFile() && entry.name === 'package.json')) {
      repos.push(current);
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.turbo'].includes(entry.name)) continue;
      await walk(path.join(current, entry.name), depth + 1);
    }
  }
  await walk(workspace, 0);
  return repos.sort();
}

export async function gitStatus(repoPath, runner = runCommand) {
  const result = await runner('git', ['-C', repoPath, 'status', '--porcelain', '--untracked-files=normal'], { timeoutMs: 30000 });
  return {
    ok: result.ok,
    dirty: result.ok ? result.stdout.trim().length > 0 : true,
    details: result.stdout.trim().split('\n').filter(Boolean).slice(0, 20),
    error: result.ok ? null : result.stderr || result.error
  };
}

export function processIndicatesActiveRepo(processLine, repoPath) {
  if (!processLine.includes(repoPath)) return false;
  return /\bcodex\b|npm\s+run\s+dev|pnpm\s+dev|yarn\s+dev|next\s+dev|vite\b|turbo\s+dev|tsx\s+watch|nodemon\b/i.test(processLine);
}

export async function activeRepoEvidence(repoPath, runner = runCommand) {
  const result = await runner('ps', ['-eo', 'pid=,command='], { timeoutMs: 15000, maxBuffer: 5 * 1024 * 1024 });
  if (!result.ok) return [];
  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => processIndicatesActiveRepo(line, repoPath))
    .slice(0, 10)
    .map((line) => ({ source: 'process', line: line.slice(0, 260) }));
}

export async function detectPackageManager(repoPath) {
  if (fsSync.existsSync(path.join(repoPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fsSync.existsSync(path.join(repoPath, 'yarn.lock'))) return 'yarn';
  if (fsSync.existsSync(path.join(repoPath, 'package-lock.json'))) return 'npm';
  const pkg = parseJson(await fs.readFile(path.join(repoPath, 'package.json'), 'utf8'), {});
  if (typeof pkg.packageManager === 'string') {
    if (pkg.packageManager.startsWith('pnpm')) return 'pnpm';
    if (pkg.packageManager.startsWith('yarn')) return 'yarn';
    if (pkg.packageManager.startsWith('npm')) return 'npm';
  }
  return 'npm';
}

export async function repoOutdated(repoPath, manager, runner = runCommand) {
  if (!await commandExists(manager, runner)) return { available: false, reason: `${manager} command not found`, entries: [] };
  if (manager === 'npm') {
    const result = await runner('npm', ['outdated', '--json'], { cwd: repoPath, timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
    return { available: true, command: commandSummary(result), entries: parseNpmOutdated(result.stdout) };
  }
  if (manager === 'yarn') {
    const result = await runner('yarn', ['outdated', '--json'], { cwd: repoPath, timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
    return { available: true, command: commandSummary(result), entries: parseYarnOutdated(result.stdout) };
  }
  const result = await runner('pnpm', ['outdated', '--json'], { cwd: repoPath, timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
  return { available: true, command: commandSummary(result), entries: parsePnpmOutdated(result.stdout) };
}

export async function repoAudit(repoPath, manager, runner = runCommand) {
  if (!await commandExists(manager, runner)) return { available: false, reason: `${manager} command not found` };
  if (manager === 'npm') {
    const result = await runner('npm', ['audit', '--json'], { cwd: repoPath, timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
    return { available: true, command: commandSummary(result), summary: parseNpmAudit(result.stdout) };
  }
  if (manager === 'pnpm') {
    const result = await runner('pnpm', ['audit', '--json'], { cwd: repoPath, timeoutMs: 180000, maxBuffer: 20 * 1024 * 1024 });
    return { available: true, command: commandSummary(result), summary: parseNpmAudit(result.stdout) };
  }
  return { available: false, reason: 'yarn audit is report-only unsupported in v1 for mixed Yarn versions' };
}

export async function repoDependencySnapshot(config, runner = runCommand) {
  if (!config.repoDependencies?.enabled) return { enabled: false, repos: [] };
  const repos = await discoverPackageRepos(config.workspace, {
    maxRepos: config.repoDependencies.maxRepos ?? 50
  });
  const results = [];
  for (const repoPath of repos) {
    const manager = await detectPackageManager(repoPath);
    const status = await gitStatus(repoPath, runner);
    const active = await activeRepoEvidence(repoPath, runner);
    const outdated = await repoOutdated(repoPath, manager, runner);
    const audit = config.repoDependencies.audit ? await repoAudit(repoPath, manager, runner) : { available: false, reason: 'disabled' };
    results.push({
      path: repoPath,
      name: path.basename(repoPath),
      manager,
      dirty: status.dirty,
      active: active.length > 0,
      activeEvidence: active,
      statusError: status.error,
      outdated: outdated.available
        ? summarizeOutdated(outdated.entries, config.repoDependencies.maxPackagesPerRepo ?? 20)
        : { available: false, reason: outdated.reason },
      audit,
      recommendation: 'report_only_start_repo_upgrade_task'
    });
  }
  return { enabled: true, repos: results };
}

export async function runBrewUpgrade(config, dryRun, runner = runCommand) {
  const commands = [];
  if (!await commandExists('brew', runner)) {
    return { ok: false, failedClosed: true, commands, error: 'brew command not found', upgradedFormulae: [] };
  }

  if (dryRun) {
    const snapshot = await brewSnapshot(config, runner);
    if (snapshot.available && snapshot.ok === false) {
      return { ok: false, failedClosed: true, dryRun: true, commands: [], error: 'brew audit failed before dry-run upgrade', upgradedFormulae: [] };
    }
    const formulae = (snapshot.formulae || []).filter((item) => item.action === 'auto_upgrade_formula').map((item) => item.name);
    const upgradeArgs = formulae.length ? ['upgrade', '--dry-run', '--formula', ...formulae] : ['upgrade', '--dry-run', '--formula'];
    const upgradePlan = await runner('brew', upgradeArgs, { timeoutMs: 180000, maxBuffer: 30 * 1024 * 1024 });
    const cleanupPlan = await runner('brew', ['cleanup', '-n'], { timeoutMs: 180000, maxBuffer: 30 * 1024 * 1024 });
    commands.push(commandSummary(upgradePlan), commandSummary(cleanupPlan));
    return { ok: upgradePlan.ok && cleanupPlan.ok, dryRun: true, commands, upgradedFormulae: formulae, plannedOnly: true };
  }

  const update = await runner('brew', ['update'], { timeoutMs: 10 * 60 * 1000, maxBuffer: 40 * 1024 * 1024 });
  commands.push(commandSummary(update));
  if (!update.ok) return { ok: false, failedClosed: true, commands, error: 'brew update failed', upgradedFormulae: [] };

  const snapshot = await brewSnapshot(config, runner);
  if (snapshot.available && snapshot.ok === false) {
    return { ok: false, failedClosed: true, commands, error: 'brew audit failed before upgrade', upgradedFormulae: [] };
  }
  const formulae = (snapshot.formulae || []).filter((item) => item.action === 'auto_upgrade_formula').map((item) => item.name);
  if (!formulae.length) {
    if (config.homebrew?.cleanupAfterUpgrade) {
      const cleanup = await runner('brew', ['cleanup'], { timeoutMs: 10 * 60 * 1000, maxBuffer: 40 * 1024 * 1024 });
      commands.push(commandSummary(cleanup));
      return { ok: cleanup.ok, commands, upgradedFormulae: [], skippedReason: cleanup.ok ? 'no_outdated_formulae' : 'cleanup_failed' };
    }
    return { ok: true, commands, upgradedFormulae: [], skippedReason: 'no_outdated_formulae' };
  }

  const upgrade = await runner('brew', ['upgrade', '--formula', ...formulae], { timeoutMs: 30 * 60 * 1000, maxBuffer: 60 * 1024 * 1024 });
  commands.push(commandSummary(upgrade));
  if (!upgrade.ok) return { ok: false, failedClosed: true, commands, error: 'brew upgrade failed', upgradedFormulae: formulae };

  if (config.homebrew?.cleanupAfterUpgrade) {
    const cleanup = await runner('brew', ['cleanup'], { timeoutMs: 10 * 60 * 1000, maxBuffer: 40 * 1024 * 1024 });
    commands.push(commandSummary(cleanup));
    if (!cleanup.ok) return { ok: false, failedClosed: false, commands, error: 'brew cleanup failed after successful upgrade', upgradedFormulae: formulae };
  }

  return { ok: true, commands, upgradedFormulae: formulae };
}

export function reportMarkdown(report) {
  const lines = [
    '# Laptop Currency Maintenance Report',
    '',
    `Run: ${report.createdAt}`,
    `Mode: ${report.mode}${report.dryRun ? ' (dry-run)' : ''}`,
    `Status: ${report.ok ? 'ok' : 'failed'}`,
    '',
    '## Homebrew',
    ...homebrewLines(report),
    '',
    '## CLI Versions',
    ...versionLines(report.before?.cliVersions, report.after?.cliVersions),
    '',
    '## Global npm',
    ...globalNpmLines(report.globalNpm),
    '',
    '## Repo Dependency Audit',
    ...repoLines(report.repoDependencies),
    '',
    '## Warnings',
    ...warningLines(report.warnings),
    '',
    '## Commands',
    ...commandLines(report.commands),
    '',
    '## Safety Notes',
    '- Auto-updated scope is Homebrew formulae only.',
    '- Homebrew casks, macOS updates, App Store apps, Docker Desktop, global npm packages, repo manifests, and lockfiles are report-only in v1.',
    '- Repo dependency upgrades require separate repo-specific work and local/container validation.',
    '',
    '## Evidence',
    `JSON report: ${report.jsonPath}`,
    `Markdown report: ${report.markdownPath}`
  ];
  return `${sanitizeText(lines.join('\n'))}\n`;
}

function homebrewLines(report) {
  const before = report.before?.homebrew;
  const after = report.after?.homebrew;
  if (!before?.available) return [`- Homebrew unavailable: ${before?.reason || 'unknown'}`];
  const auto = before.formulae?.filter((item) => item.action === 'auto_upgrade_formula') || [];
  const pinned = before.formulae?.filter((item) => item.action === 'skip_pinned') || [];
  const casks = before.casks || [];
  const upgraded = report.homebrewUpdate?.upgradedFormulae || [];
  const highImpact = before.formulae?.filter((item) => item.highImpact) || [];
  const lines = [
    `- Outdated formulae before: ${before.formulae?.length || 0}`,
    `- Auto-upgrade candidates: ${auto.length}`,
    `- High-impact formulae outdated: ${highImpact.length ? highImpact.map((item) => item.name).join(', ') : 'none'}`,
    `- Pinned skipped: ${pinned.length}`,
    `- Casks report-only: ${casks.length}`,
    `- Formulae upgraded/planned: ${upgraded.length ? upgraded.join(', ') : 'none'}`
  ];
  if (after?.available) lines.push(`- Outdated formulae after: ${after.formulae?.length || 0}`);
  if (before.formulae?.length) {
    lines.push('', '| Formula | Current | Latest | High impact | Action |', '| --- | --- | --- | --- | --- |');
    for (const item of before.formulae.slice(0, 30)) {
      lines.push(`| ${item.name} | ${item.current || 'unknown'} | ${item.latest || 'unknown'} | ${item.highImpact ? 'yes' : 'no'} | ${item.action} |`);
    }
  }
  return lines;
}

function versionLines(before = [], after = []) {
  if (!before.length && !after.length) return ['- No CLI versions recorded.'];
  const afterByName = new Map(after.map((item) => [item.name, item]));
  const lines = ['| CLI | Before | After |', '| --- | --- | --- |'];
  for (const item of before) {
    const afterItem = afterByName.get(item.name);
    lines.push(`| ${item.name} | ${item.version || item.reason || 'unavailable'} | ${afterItem?.version || afterItem?.reason || 'not checked'} |`);
  }
  return lines;
}

function globalNpmLines(globalNpm) {
  if (!globalNpm?.available) return [`- Global npm unavailable or skipped: ${globalNpm?.reason || 'unknown'}`];
  const counts = globalNpm.outdated?.counts || {};
  return [
    `- Report-only global npm outdated packages: ${counts.total || 0}`,
    `- Major/minor/patch/unknown: ${counts.major || 0}/${counts.minor || 0}/${counts.patch || 0}/${counts.unknown || 0}`
  ];
}

function repoLines(repoDependencies) {
  if (!repoDependencies?.enabled) return ['- Repo dependency audit disabled.'];
  if (!repoDependencies.repos?.length) return ['- No package repos found.'];
  const lines = ['| Repo | Manager | Dirty | Active | Outdated | Major | Minor | Patch | Audit |', '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |'];
  for (const repo of repoDependencies.repos) {
    const counts = repo.outdated?.counts || {};
    const audit = repo.audit?.summary?.counts
      ? `vuln ${repo.audit.summary.counts.total || 0}`
      : repo.audit?.reason || (repo.audit?.available ? 'ok' : 'n/a');
    lines.push(`| ${repo.name} | ${repo.manager} | ${repo.dirty ? 'yes' : 'no'} | ${repo.active ? 'yes' : 'no'} | ${counts.total || 0} | ${counts.major || 0} | ${counts.minor || 0} | ${counts.patch || 0} | ${audit} |`);
  }
  return lines;
}

function warningLines(warnings = []) {
  if (!warnings.length) return ['- None.'];
  return warnings.map((warning) => `- ${warning.scope}: ${warning.message}`);
}

function commandLines(commands = []) {
  if (!commands.length) return ['- No update commands recorded.'];
  return commands.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'}: \`${[item.command, ...(item.args || [])].join(' ')}\``);
}

export function discordSummary(report, token = '') {
  const before = report.before?.homebrew;
  const after = report.after?.homebrew;
  const upgraded = report.homebrewUpdate?.upgradedFormulae || [];
  const highImpact = before?.formulae?.filter((item) => item.highImpact).map((item) => item.name) || [];
  const repoCount = report.repoDependencies?.repos?.length || 0;
  const repoOutdated = (report.repoDependencies?.repos || []).reduce((sum, repo) => sum + (repo.outdated?.counts?.total || 0), 0);
  const failures = (report.commands || []).filter((item) => !item.ok);
  const lines = [
    '**Laptop Currency Maintenance report**',
    '',
    `Mode: \`${report.mode}${report.dryRun ? ' --dry-run' : ''}\``,
    `Status: \`${report.ok ? 'ok' : 'failed'}\``,
    `Run status: \`${report.status}\``,
    `Homebrew formulae before/after: \`${before?.formulae?.length ?? 'n/a'}\` -> \`${after?.formulae?.length ?? 'n/a'}\``,
    `Formulae upgraded/planned: \`${upgraded.length ? upgraded.join(', ') : 'none'}\``,
    `High-impact formulae outdated: \`${highImpact.length ? highImpact.join(', ') : 'none'}\``,
    `Warnings: \`${report.warnings?.length || 0}\``,
    `Repo dependency audit: \`${repoCount} repos, ${repoOutdated} outdated packages (report-only)\``,
    `Report: \`${report.markdownPath}\``,
    '',
    failures.length ? '**Failures**' : '**Commands**',
    ...(failures.length ? failures : report.commands || []).slice(0, 10).map((item) => `- ${item.ok ? 'PASS' : 'FAIL'}: \`${[item.command, ...(item.args || [])].join(' ')}\``)
  ];
  return sanitizeText(lines.join('\n'), token);
}

async function discordRequest(token, endpoint, body) {
  const res = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'CodexLaptopCurrencyMaintenance/0.1'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  if (!res.ok) throw new Error(`Discord API ${endpoint} failed with ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function discordUploadFile(token, channelId, content, filePath, fileBuffer) {
  const form = new FormData();
  form.append('payload_json', JSON.stringify({
    content,
    allowed_mentions: { parse: [] },
    attachments: [{ id: '0', filename: path.basename(filePath), description: 'Laptop Currency Maintenance Markdown report' }]
  }));
  const blob = new Blob([fileBuffer], { type: 'text/markdown; charset=utf-8' });
  form.append('files[0]', blob, path.basename(filePath));
  const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'User-Agent': 'CodexLaptopCurrencyMaintenance/0.1'
    },
    body: form
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  if (!res.ok) throw new Error(`Discord file upload failed with ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function postDiscordReport(config, report, options = {}) {
  if (options.noDiscord || !config.discord?.enabled) return { posted: false, skipped: true, reason: 'disabled' };
  const channelId = config.discord.channelId;
  const tokenPath = config.discord.botTokenPath;
  if (!channelId) return { posted: false, skipped: true, reason: 'channel_missing' };
  if (!tokenPath) return { posted: false, skipped: true, reason: 'token_path_missing' };
  let token = '';
  try {
    token = (await fs.readFile(tokenPath, 'utf8')).trim();
  } catch {
    return { posted: false, skipped: true, reason: 'token_missing' };
  }
  const summary = discordSummary(report, token);
  if (options.dryRun) return { posted: false, dryRun: true, content: summary };
  const message = await discordRequest(token, `/channels/${channelId}/messages`, {
    content: summary,
    allowed_mentions: { parse: [] }
  });
  const buffer = await fs.readFile(report.markdownPath);
  const attachment = await discordUploadFile(token, channelId, 'Attached full Laptop Currency Maintenance Markdown report.', report.markdownPath, buffer);
  return { posted: true, channelId, messageId: message.id || null, attachmentMessageId: attachment.id || null };
}

function commandFailureWarnings(scope, commands = {}) {
  return Object.entries(commands)
    .filter(([, command]) => command && command.ok === false)
    .map(([name, command]) => ({
      scope,
      message: `${name} command failed: ${[command.command, ...(command.args || [])].join(' ')}`
    }));
}

export function collectReportWarnings(report) {
  const warnings = [];
  for (const [label, snapshot] of [
    ['homebrew before audit', report.before?.homebrew],
    ['homebrew after audit', report.after?.homebrew]
  ]) {
    if (!snapshot) continue;
    if (!snapshot.available) {
      if (snapshot.reason !== 'disabled') warnings.push({ scope: label, message: snapshot.reason || 'unavailable' });
      continue;
    }
    if (snapshot.ok === false) warnings.push(...commandFailureWarnings(label, snapshot.commands));
  }

  for (const version of [...(report.before?.cliVersions || []), ...(report.after?.cliVersions || [])]) {
    if (!version.available) {
      warnings.push({ scope: 'cli version', message: `${version.name || version.command} unavailable: ${version.reason || 'unknown'}` });
    } else if (version.ok === false) {
      warnings.push({ scope: 'cli version', message: `${version.name || version.command} version check failed` });
    }
  }

  if (report.globalNpm && !report.globalNpm.available && report.globalNpm.reason !== 'disabled') {
    warnings.push({ scope: 'global npm', message: report.globalNpm.reason || 'unavailable' });
  } else if (report.globalNpm?.available && report.globalNpm.command?.ok === false && !report.globalNpm.outdated?.counts?.total) {
    warnings.push({ scope: 'global npm', message: 'global npm outdated check failed without parseable outdated data' });
  }

  for (const repo of report.repoDependencies?.repos || []) {
    if (repo.statusError) warnings.push({ scope: `repo ${repo.name}`, message: `git status failed: ${repo.statusError}` });
    if (repo.outdated?.available === false) warnings.push({ scope: `repo ${repo.name}`, message: `outdated check unavailable: ${repo.outdated.reason || 'unknown'}` });
    if (repo.audit?.available === false && !['disabled', 'yarn audit is report-only unsupported in v1 for mixed Yarn versions'].includes(repo.audit.reason)) {
      warnings.push({ scope: `repo ${repo.name}`, message: `audit unavailable: ${repo.audit.reason || 'unknown'}` });
    }
  }

  return warnings;
}

export async function buildReport(config, mode, dryRun = false, options = {}) {
  if (!['audit', 'update'].includes(mode)) throw new Error(`Unsupported mode: ${mode}`);
  await ensureDirs(config);
  const runner = options.runner || runCommand;
  const createdAt = new Date().toISOString();
  const reportBase = `${timestampForFile(new Date())}-${mode}${dryRun ? '-dry-run' : ''}`;
  const jsonPath = path.join(config.reportsDir, `${reportBase}.json`);
  const markdownPath = path.join(config.reportsDir, `${reportBase}.md`);

  const before = {
    homebrew: await brewSnapshot(config, runner),
    cliVersions: await collectCliVersions(config, runner)
  };
  const globalNpm = await globalNpmSnapshot(config, runner);
  const repoDependencies = await repoDependencySnapshot(config, runner);
  let homebrewUpdate = { ok: true, commands: [], upgradedFormulae: [] };
  let after = { homebrew: null, cliVersions: [] };

  if (mode === 'update') {
    homebrewUpdate = await runBrewUpgrade(config, dryRun, runner);
    if (!homebrewUpdate.failedClosed) {
      after = {
        homebrew: await brewSnapshot(config, runner),
        cliVersions: await collectCliVersions(config, runner)
      };
    } else {
      after = { homebrew: before.homebrew, cliVersions: before.cliVersions };
    }
  } else {
    after = { homebrew: before.homebrew, cliVersions: before.cliVersions };
  }

  const report = {
    ok: Boolean(homebrewUpdate.ok),
    status: homebrewUpdate.ok ? 'completed' : 'failed',
    createdAt,
    mode,
    dryRun,
    jsonPath,
    markdownPath,
    before,
    after,
    globalNpm,
    repoDependencies,
    homebrewUpdate,
    warnings: [],
    commands: homebrewUpdate.commands || []
  };
  report.warnings = collectReportWarnings(report);
  report.status = report.ok
    ? (report.warnings.length ? 'completed_with_warnings' : 'completed')
    : 'failed';

  await writeJson(jsonPath, report);
  await fs.writeFile(markdownPath, reportMarkdown(report), { mode: 0o600 });
  await writeJson(path.join(config.stateDir, 'state.json'), {
    lastRunAt: createdAt,
    lastStatus: report.status,
    lastMode: mode,
    lastDryRun: dryRun,
    lastJsonPath: jsonPath,
    lastMarkdownPath: markdownPath
  });
  return report;
}
