import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildReport,
  classifyBrewFormula,
  classifyVersionGap,
  parseBrewOutdated,
  parseNpmAudit,
  parseNpmOutdated,
  parseYarnOutdated,
  sanitizeText
} from './laptop-currency-maintenance-core.mjs';

async function tempDir(prefix = 'laptop-currency-maintenance-test-') {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

function ok(command, args, stdout = '', stderr = '') {
  return { ok: true, code: 0, command, args, stdout, stderr, error: null };
}

function fail(command, args, stdout = '', stderr = 'failed') {
  return { ok: false, code: 1, command, args, stdout, stderr, error: stderr };
}

function sampleBrewOutdated() {
  return JSON.stringify({
    formulae: [
      { name: 'node', installed_versions: ['25.8.1_1'], current_version: '25.9.0_2', pinned: false },
      { name: 'powershell', installed_versions: ['7.6.0'], current_version: '7.6.1_1', pinned: false },
      { name: 'openssl@3', installed_versions: ['3.6.1'], current_version: '3.6.2', pinned: true }
    ],
    casks: [
      { name: 'docker', installed_versions: ['4.0.0'], current_version: '4.1.0' }
    ]
  });
}

function sampleBrewInfo() {
  return JSON.stringify({
    formulae: [
      { name: 'node', installed: [{ version: '25.8.1_1' }], versions: { stable: '25.9.0' }, pinned: false },
      { name: 'powershell', installed: [{ version: '7.6.0' }], versions: { stable: '7.6.1' }, pinned: false },
      { name: 'openssl@3', installed: [{ version: '3.6.1' }], versions: { stable: '3.6.2' }, pinned: true }
    ]
  });
}

function makeRunner(root, options = {}) {
  const calls = [];
  const runner = async (command, args = [], commandOptions = {}) => {
    calls.push({ command, args, cwd: commandOptions.cwd });
    if (command === '/bin/zsh') return ok(command, args, '/usr/bin/mock\n');
    if (command === 'brew' && args[0] === 'outdated') return ok(command, args, sampleBrewOutdated());
    if (command === 'brew' && args[0] === 'list' && args[1] === '--pinned') return ok(command, args, 'openssl@3\n');
    if (command === 'brew' && args[0] === 'leaves') return ok(command, args, 'gh\npowershell\nvercel-cli\n');
    if (command === 'brew' && args[0] === 'cleanup' && args[1] === '-n') return ok(command, args, 'Would remove old node\n');
    if (command === 'brew' && args[0] === 'cleanup') return ok(command, args, 'Removed old node\n');
    if (command === 'brew' && args[0] === 'info') return ok(command, args, sampleBrewInfo());
    if (command === 'brew' && args[0] === 'upgrade' && args[1] === '--dry-run') return ok(command, args, 'Would upgrade node powershell\n');
    if (command === 'brew' && args[0] === 'update') return options.brewUpdateFails ? fail(command, args, '', 'tap failed') : ok(command, args, 'Already up-to-date.\n');
    if (command === 'brew' && args[0] === 'upgrade' && args[1] === '--formula') return ok(command, args, `Upgraded ${args.slice(2).join(' ')}\n`);
    if (command === 'git' && args.includes('status')) return options.dirtyRepo ? ok(command, args, ' M package.json\n') : ok(command, args, '');
    if (command === 'ps') return ok(command, args, options.activeProcess || '');
    if (command === 'npm' && args[0] === 'outdated' && args.includes('-g')) {
      return fail(command, args, JSON.stringify({ npm: { current: '11.0.0', wanted: '11.1.0', latest: '12.0.0' } }), '');
    }
    if (command === 'npm' && args[0] === 'outdated') {
      return fail(command, args, JSON.stringify({ '@playwright/test': { current: '1.58.2', wanted: '1.59.1', latest: '1.59.1' } }), '');
    }
    if (command === 'npm' && args[0] === 'audit') {
      return ok(command, args, JSON.stringify({ metadata: { vulnerabilities: { info: 0, low: 0, moderate: 1, high: 0, critical: 0, total: 1 } } }));
    }
    if (['node', 'npm', 'gh', 'vercel', 'pwsh', 'dotnet', 'gitleaks', 'neonctl'].includes(command)) return ok(command, args, `${command} 1.0.0\n`);
    return ok(command, args, '');
  };
  runner.calls = calls;
  return runner;
}

async function fixtureConfig(root) {
  const repo = path.join(root, 'workspace/demo-app');
  await fs.mkdir(repo, { recursive: true });
  await fs.writeFile(path.join(repo, 'package.json'), JSON.stringify({ scripts: { test: 'echo ok' } }, null, 2));
  await fs.writeFile(path.join(repo, 'package-lock.json'), '{}\n');
  return {
    workspace: path.join(root, 'workspace'),
    reportsDir: path.join(root, 'reports'),
    stateDir: path.join(root, 'state'),
    logDir: path.join(root, 'logs'),
    homebrew: { enabled: true, cleanupAfterUpgrade: true },
    repoDependencies: { enabled: true, maxRepos: 10, maxPackagesPerRepo: 10, audit: true },
    globalNpm: { enabled: true },
    cliVersionCommands: [
      { name: 'node', command: 'node', args: ['--version'] },
      { name: 'powershell', command: 'pwsh', args: ['--version'] }
    ],
    discord: { enabled: false }
  };
}

test('parses and classifies Homebrew outdated formulae and casks', () => {
  const parsed = parseBrewOutdated(sampleBrewOutdated());
  const node = classifyBrewFormula(parsed.formulae[0], new Set());
  const pinned = classifyBrewFormula(parsed.formulae[2], new Set(['openssl@3']));

  assert.equal(parsed.formulae.length, 3);
  assert.equal(parsed.casks.length, 1);
  assert.equal(node.action, 'auto_upgrade_formula');
  assert.equal(node.gap, 'minor');
  assert.equal(pinned.action, 'skip_pinned');
});

test('classifies package version gaps and parses npm/yarn outdated output', () => {
  assert.equal(classifyVersionGap('1.2.3', '2.0.0'), 'major');
  assert.equal(classifyVersionGap('1.2.3', '1.3.0'), 'minor');
  assert.equal(classifyVersionGap('1.2.3', '1.2.4'), 'patch');
  const npm = parseNpmOutdated(JSON.stringify({ vite: { current: '6.0.0', wanted: '6.1.0', latest: '7.0.0' } }));
  const yarn = parseYarnOutdated(JSON.stringify({ type: 'table', data: { body: [['react', '18.2.0', '18.3.1', '19.0.0', '', 'dependencies']] } }));
  assert.equal(npm[0].gap, 'major');
  assert.equal(yarn[0].name, 'react');
});

test('redaction removes secrets and provider IDs from reports', () => {
  const text = 'Bearer abc.def.ghi token: supersecret prj_1234567890abcdef user@example.com';
  const out = sanitizeText(text);
  assert.equal(out.includes('supersecret'), false);
  assert.equal(out.includes('prj_'), false);
  assert.equal(out.includes('user@example.com'), false);
});

test('npm audit parser extracts vulnerability counts', () => {
  const audit = parseNpmAudit(JSON.stringify({ metadata: { vulnerabilities: { low: 1, moderate: 2, high: 0, critical: 0, total: 3 } } }));
  assert.equal(audit.counts.total, 3);
  assert.equal(audit.counts.moderate, 2);
});

test('update dry-run does not run mutating Homebrew commands', async () => {
  const root = await tempDir();
  const config = await fixtureConfig(root);
  const runner = makeRunner(root);
  const report = await buildReport(config, 'update', true, { runner });
  const commands = runner.calls.map((call) => [call.command, ...call.args].join(' '));

  assert.equal(report.ok, true);
  assert.equal(report.homebrewUpdate.dryRun, true);
  assert.equal(commands.some((cmd) => cmd === 'brew update'), false);
  assert.equal(commands.some((cmd) => cmd.startsWith('brew upgrade --formula')), false);
  assert.equal(commands.some((cmd) => cmd.startsWith('brew upgrade --dry-run --formula')), true);
});

test('update auto-upgrades only unpinned Homebrew formulae and keeps repos report-only', async () => {
  const root = await tempDir();
  const config = await fixtureConfig(root);
  const runner = makeRunner(root);
  const report = await buildReport(config, 'update', false, { runner });
  const upgradeCall = runner.calls.find((call) => call.command === 'brew' && call.args[0] === 'upgrade' && call.args[1] === '--formula');

  assert.equal(report.ok, true);
  assert.deepEqual(report.homebrewUpdate.upgradedFormulae, ['node', 'powershell']);
  assert.deepEqual(upgradeCall.args, ['upgrade', '--formula', 'node', 'powershell']);
  assert.equal(runner.calls.some((call) => call.command === 'npm' && call.args[0] === 'install'), false);
  assert.equal(report.repoDependencies.repos[0].recommendation, 'report_only_start_repo_upgrade_task');
});

test('failed brew update fails closed before upgrade and cleanup', async () => {
  const root = await tempDir();
  const config = await fixtureConfig(root);
  const runner = makeRunner(root, { brewUpdateFails: true });
  const report = await buildReport(config, 'update', false, { runner });
  const commands = runner.calls.map((call) => [call.command, ...call.args].join(' '));

  assert.equal(report.ok, false);
  assert.equal(report.homebrewUpdate.failedClosed, true);
  assert.equal(commands.some((cmd) => cmd.startsWith('brew upgrade --formula')), false);
  assert.equal(commands.some((cmd) => cmd === 'brew cleanup'), false);
});

test('repo audit records dirty and active repos without mutating them', async () => {
  const root = await tempDir();
  const config = await fixtureConfig(root);
  const activeProcess = `123 node ${path.join(root, 'workspace/demo-app/node_modules/.bin/next')} dev ${path.join(root, 'workspace/demo-app')}`;
  const runner = makeRunner(root, { dirtyRepo: true, activeProcess });
  const report = await buildReport(config, 'audit', false, { runner });
  const repo = report.repoDependencies.repos[0];

  assert.equal(repo.dirty, true);
  assert.equal(repo.active, true);
  assert.equal(report.commands.length, 0);
});
