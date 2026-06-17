import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_REPORT_DIR = join(homedir(), ".codex", "automations", "daily-docker-cleanup");
const DEFAULT_ACTIVE_AGE_FILTER = "1h";
const GATE_CONTAINER_PATTERN = /(pr[-_]?gate|gate|review|verify|critical|test)/i;

export function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift() ?? "audit";
  const options = {
    command,
    dryRun: false,
    activeGateMode: false,
    skipVolumes: false,
    workspace: process.env.DOCKER_DISK_CLEANUP_WORKSPACE || process.cwd(),
    reportDir: process.env.DOCKER_DISK_CLEANUP_REPORT_DIR || DEFAULT_REPORT_DIR,
    ageFilter: process.env.DOCKER_DISK_CLEANUP_ACTIVE_AGE_FILTER || DEFAULT_ACTIVE_AGE_FILTER,
    json: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--active-gate-mode") {
      options.activeGateMode = true;
    } else if (arg === "--skip-volumes") {
      options.skipVolumes = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--workspace") {
      options.workspace = requireValue(args, ++index, arg);
    } else if (arg === "--report-dir") {
      options.reportDir = requireValue(args, ++index, arg);
    } else if (arg === "--age-filter") {
      options.ageFilter = requireValue(args, ++index, arg);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!["audit", "cleanup"].includes(options.command)) {
    throw new Error(`Unknown command: ${options.command}`);
  }
  return options;
}

function requireValue(args, index, flag) {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function detectActiveGate(containers) {
  return containers.some((container) => {
    const state = `${container.State ?? ""} ${container.Status ?? ""}`;
    const name = `${container.Names ?? ""} ${container.Name ?? ""}`;
    return /running|created|restarting/i.test(state) && GATE_CONTAINER_PATTERN.test(name);
  });
}

export function buildPrunePlan({ activeGateMode, ageFilter, skipVolumes, volumeAllSupported }) {
  const ageArgs = activeGateMode ? ["--filter", `until=${ageFilter}`] : [];
  const volumeArgs = volumeAllSupported ? ["volume", "prune", "-a", "-f"] : ["volume", "prune", "-f"];
  const steps = [
    commandStep("container-prune", ["container", "prune", "-f"]),
    commandStep("network-prune", ["network", "prune", "-f"]),
    commandStep("image-prune", ["image", "prune", "-a", ...ageArgs, "-f"]),
    commandStep("builder-prune", ["builder", "prune", "-a", ...ageArgs, "-f"])
  ];
  if (skipVolumes) {
    steps.push({ id: "volume-prune", type: "skip", reason: "--skip-volumes set" });
  } else {
    steps.push({ id: "volume-attachment-check", type: "volume-check" });
    steps.push(commandStep("volume-prune", volumeArgs));
  }
  steps.push(commandStep("final-image-prune", ["image", "prune", "-a", ...ageArgs, "-f"]));
  return steps;
}

function commandStep(id, args) {
  return { id, type: "command", command: "docker", args };
}

export async function runCleanup(options, runner = runCommand) {
  const startedAt = new Date().toISOString();
  const reportDir = resolve(expandHome(options.reportDir));
  const workspace = resolve(expandHome(options.workspace));
  const lockDir = join(reportDir, ".docker-disk-cleanup.lock");
  await mkdir(reportDir, { recursive: true });
  await acquireLock(lockDir);

  const report = {
    status: "running",
    command: options.command,
    startedAt,
    finishedAt: "",
    workspace,
    reportDir,
    dryRun: options.dryRun,
    requestedActiveGateMode: options.activeGateMode,
    activeGateMode: false,
    ageFilter: options.ageFilter,
    skipVolumes: options.skipVolumes,
    audit: {},
    steps: [],
    blockers: []
  };

  try {
    report.audit.beforeDisk = await safeRun(runner, "df", ["-h", workspace]);
    report.audit.dockerInfo = await safeRun(runner, "docker", ["info"]);
    if (report.audit.dockerInfo.exitCode !== 0) {
      report.status = "blocked";
      report.blockers.push("Docker daemon is unavailable or docker info failed.");
      return await finishReport(report, reportDir);
    }

    report.audit.beforeDockerDf = await safeRun(runner, "docker", ["system", "df"]);
    const containersRaw = await safeRun(runner, "docker", [
      "ps",
      "-a",
      "--format",
      "{{json .}}"
    ]);
    report.audit.containers = containersRaw;
    const containers = parseJsonLines(containersRaw.stdout);
    const detectedGate = detectActiveGate(containers);
    report.activeGateMode = Boolean(options.activeGateMode || detectedGate);
    report.detectedGateContainers = containers
      .filter((container) => detectActiveGate([container]))
      .map((container) => container.Names || container.Name || "")
      .filter(Boolean);

    const volumeAllSupported = await supportsVolumeAll(runner);
    const plan = buildPrunePlan({
      activeGateMode: report.activeGateMode,
      ageFilter: options.ageFilter,
      skipVolumes: options.skipVolumes,
      volumeAllSupported
    });
    report.plan = plan;

    if (options.command === "audit" || options.dryRun) {
      report.status = options.command === "audit" ? "audited" : "dry_run";
      return await finishReport(report, reportDir);
    }

    for (const step of plan) {
      if (step.type === "skip") {
        report.steps.push({ ...step, status: "skipped" });
        continue;
      }
      if (step.type === "volume-check") {
        const volumeCheck = await checkDanglingVolumeAttachments(runner);
        report.steps.push({ ...step, status: volumeCheck.ok ? "passed" : "blocked", ...volumeCheck });
        if (!volumeCheck.ok) {
          report.blockers.push("Dangling volumes still appear attached to containers; skipped volume prune.");
          report.steps.push({
            id: "volume-prune",
            type: "skip",
            status: "skipped",
            reason: "dangling volume attachment check failed"
          });
          continue;
        }
        continue;
      }
      const result = await safeRun(runner, step.command, step.args);
      report.steps.push({ ...step, ...result });
      if (result.exitCode !== 0) {
        report.blockers.push(`${step.id} failed with exit code ${result.exitCode}`);
      }
    }

    report.audit.afterDockerDf = await safeRun(runner, "docker", ["system", "df"]);
    report.audit.afterDisk = await safeRun(runner, "df", ["-h", workspace]);
    report.status = report.blockers.length ? "completed_with_blockers" : "completed";
    return await finishReport(report, reportDir);
  } finally {
    await rm(lockDir, { recursive: true, force: true });
  }
}

async function supportsVolumeAll(runner) {
  const result = await safeRun(runner, "docker", ["volume", "prune", "--help"]);
  return result.stdout.includes("--all") || result.stdout.includes("-a, --all");
}

async function checkDanglingVolumeAttachments(runner) {
  const volumes = await safeRun(runner, "docker", ["volume", "ls", "-qf", "dangling=true"]);
  if (volumes.exitCode !== 0) {
    return { ok: false, reason: "docker volume ls failed", volumes: [] };
  }
  const names = volumes.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const attached = [];
  for (const name of names) {
    const containers = await safeRun(runner, "docker", ["ps", "-a", "--filter", `volume=${name}`, "-q"]);
    if (containers.stdout.trim()) {
      attached.push(name);
    }
  }
  return { ok: attached.length === 0, volumes: names, attachedVolumes: attached };
}

async function acquireLock(lockDir) {
  if (existsSync(lockDir)) {
    throw new Error(`Docker cleanup is already running or lock is stale: ${lockDir}`);
  }
  await mkdir(lockDir);
}

async function finishReport(report, reportDir) {
  report.finishedAt = new Date().toISOString();
  const stamp = report.finishedAt.replace(/[:.]/g, "-");
  const reportPath = join(reportDir, `docker-disk-cleanup-${stamp}.json`);
  report.reportPath = reportPath;
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  return report;
}

async function safeRun(runner, command, args) {
  try {
    return await runner(command, args);
  } catch (error) {
    return {
      command,
      args,
      exitCode: 127,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error)
    };
  }
}

export function runCommand(command, args) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolvePromise({ command, args, exitCode: 127, stdout, stderr: error.message });
    });
    child.on("close", (code) => {
      resolvePromise({ command, args, exitCode: code ?? 1, stdout, stderr });
    });
  });
}

function parseJsonLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return {};
      }
    });
}

function expandHome(path) {
  if (path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}
