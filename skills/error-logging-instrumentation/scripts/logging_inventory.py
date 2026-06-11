#!/usr/bin/env python3
"""Static inventory helper for error logging instrumentation reviews.

This script is intentionally read-only. It detects common logging and
observability surfaces, but it does not decide whether instrumentation is
sufficient.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any


EXCLUDED_DIRS = {
    ".cache",
    ".git",
    ".next",
    ".turbo",
    ".vercel",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "tmp",
    "vendor",
}

TEXT_EXTENSIONS = {
    ".cjs",
    ".cts",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".mts",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}

PROVIDER_PACKAGES = {
    "@axiomhq/js",
    "@datadog/browser-rum",
    "@honeycombio/opentelemetry-web",
    "@logtail/node",
    "@opentelemetry/api",
    "@opentelemetry/sdk-node",
    "@sentry/nextjs",
    "@sentry/node",
    "@sentry/react",
    "@vercel/analytics",
    "@vercel/otel",
    "@vercel/speed-insights",
    "dd-trace",
    "honeycomb-beeline",
    "pino",
    "winston",
}

FRAMEWORK_MARKERS = {
    "next.config.js": "nextjs",
    "next.config.mjs": "nextjs",
    "next.config.ts": "nextjs",
    "vercel.json": "vercel",
    "sentry.client.config.ts": "sentry",
    "sentry.server.config.ts": "sentry",
    "sentry.edge.config.ts": "sentry",
}

CONSOLE_RE = re.compile(r"\bconsole\.(log|error|warn|info|debug)\s*\(")
LOG_CALL_RE = re.compile(
    r"\b(?:console|logger|log)\.(?:log|error|warn|info|debug)\s*\("
)
RISKY_TERMS = {
    "authorization": re.compile(r"\bauthorization\b", re.IGNORECASE),
    "cookie": re.compile(r"\bcookie\b", re.IGNORECASE),
    "email": re.compile(r"\bemail\b", re.IGNORECASE),
    "password": re.compile(r"\bpassword\b", re.IGNORECASE),
    "secret": re.compile(r"\bsecret\b", re.IGNORECASE),
    "session": re.compile(r"\bsession\b", re.IGNORECASE),
    "token": re.compile(r"\b(?:access|refresh|id)?token\b", re.IGNORECASE),
}
PROVIDER_USAGE_RE = re.compile(
    r"\b(Sentry|captureException|captureMessage|otel|OpenTelemetry|Datadog|"
    r"dd-trace|Axiom|Logtail|Honeycomb|pino|winston)\b"
)


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def should_read(path: Path) -> bool:
    if path.name.startswith(".env"):
        return False
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return False
    try:
        return path.stat().st_size <= 1_000_000
    except OSError:
        return False


def iter_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDED_DIRS)
        current = Path(dirpath)
        for filename in sorted(filenames):
            path = current / filename
            if path.is_symlink() or not should_read(path):
                continue
            files.append(path)
    return files


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def package_inventory(path: Path, root: Path) -> list[dict[str, str]]:
    if path.name != "package.json":
        return []
    try:
        data = json.loads(read_text(path))
    except json.JSONDecodeError:
        return []
    records: list[dict[str, str]] = []
    for section in (
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
    ):
        deps = data.get(section, {})
        if not isinstance(deps, dict):
            continue
        for package in sorted(set(deps) & PROVIDER_PACKAGES):
            records.append(
                {
                    "file": relative(path, root),
                    "package": package,
                    "section": section,
                }
            )
    return records


def classify_file(path: Path, root: Path, text: str) -> dict[str, list[dict[str, Any]]]:
    rel = relative(path, root)
    name = path.name
    lower_rel = rel.lower()
    records: dict[str, list[dict[str, Any]]] = {
        "framework_markers": [],
        "instrumentation_files": [],
        "route_handlers": [],
        "server_action_files": [],
        "error_boundaries": [],
        "raw_console_calls": [],
        "risky_log_fields": [],
        "provider_usage": [],
    }

    marker = FRAMEWORK_MARKERS.get(name)
    if marker:
        records["framework_markers"].append({"path": rel, "type": marker})

    if name in {"instrumentation.js", "instrumentation.ts"}:
        records["instrumentation_files"].append({"path": rel})

    if (
        lower_rel.startswith("pages/api/")
        or lower_rel.startswith("src/pages/api/")
        or ("/app/api/" in f"/{lower_rel}" and name.split(".")[0] == "route")
    ):
        records["route_handlers"].append({"path": rel})

    if '"use server"' in text or "'use server'" in text:
        records["server_action_files"].append({"path": rel})

    if name in {
        "error.jsx",
        "error.tsx",
        "global-error.jsx",
        "global-error.tsx",
    } or re.search(r"\b(ErrorBoundary|componentDidCatch|getDerivedStateFromError)\b", text):
        records["error_boundaries"].append({"path": rel})

    for index, line in enumerate(text.splitlines(), start=1):
        console_match = CONSOLE_RE.search(line)
        if console_match:
            records["raw_console_calls"].append(
                {"path": rel, "line": index, "kind": console_match.group(1)}
            )

        if LOG_CALL_RE.search(line):
            for term, pattern in RISKY_TERMS.items():
                if pattern.search(line):
                    records["risky_log_fields"].append(
                        {"path": rel, "line": index, "term": term}
                    )

    for match in PROVIDER_USAGE_RE.finditer(text):
        records["provider_usage"].append({"path": rel, "term": match.group(1)})

    return records


def build_inventory(root: Path) -> dict[str, Any]:
    files = iter_files(root)
    inventory: dict[str, Any] = {
        "repo": str(root),
        "provider_packages": [],
        "framework_markers": [],
        "instrumentation_files": [],
        "route_handlers": [],
        "server_action_files": [],
        "error_boundaries": [],
        "raw_console_calls": [],
        "risky_log_fields": [],
        "provider_usage": [],
    }

    for path in files:
        inventory["provider_packages"].extend(package_inventory(path, root))
        text = read_text(path)
        records = classify_file(path, root, text)
        for key, values in records.items():
            inventory[key].extend(values)

    for key, value in inventory.items():
        if isinstance(value, list):
            inventory[key] = sorted(
                value,
                key=lambda item: (
                    item.get("path", item.get("file", "")),
                    item.get("line", 0),
                    item.get("package", ""),
                    item.get("term", ""),
                ),
            )
    return inventory


def render_markdown(inventory: dict[str, Any]) -> str:
    sections = [
        ("Provider Packages", "provider_packages"),
        ("Framework Markers", "framework_markers"),
        ("Instrumentation Files", "instrumentation_files"),
        ("Route Handlers", "route_handlers"),
        ("Server Action Files", "server_action_files"),
        ("Error Boundaries", "error_boundaries"),
        ("Raw Console Calls", "raw_console_calls"),
        ("Risky Log Fields", "risky_log_fields"),
        ("Provider Usage", "provider_usage"),
    ]

    lines = [f"# Logging Inventory", "", f"Repo: `{inventory['repo']}`", ""]
    for title, key in sections:
        lines.extend([f"## {title}", ""])
        records = inventory[key]
        if not records:
            lines.extend(["None found.", ""])
            continue
        for record in records:
            details = ", ".join(f"{k}={v}" for k, v in record.items())
            lines.append(f"- {details}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", help="Repository or app directory to inspect")
    parser.add_argument(
        "--format",
        choices=("json", "markdown"),
        default="markdown",
        help="Output format",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.repo).expanduser().resolve()
    if not root.is_dir():
        print(f"Repository path is not a directory: {root}", file=sys.stderr)
        return 2

    inventory = build_inventory(root)
    if args.format == "json":
        print(json.dumps(inventory, indent=2, sort_keys=True))
    else:
        print(render_markdown(inventory), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
