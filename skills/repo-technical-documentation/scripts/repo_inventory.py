#!/usr/bin/env python3
"""Deterministic tracked-file fact inventory for repo documentation."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover
    tomllib = None


TEXT_SUFFIXES = {
    ".c",
    ".css",
    ".go",
    ".h",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".mjs",
    ".md",
    ".mdx",
    ".php",
    ".py",
    ".rb",
    ".rs",
    ".scss",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}

GENERATED_PARTS = {
    ".cache",
    ".next",
    ".nuxt",
    ".parcel-cache",
    ".ruff_cache",
    ".swc",
    ".turbo",
    ".venv",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "playwright-report",
    "target",
    "test-results",
    "vendor",
}

SENSITIVE_NAMES = {
    ".env",
    ".npmrc",
    ".pypirc",
    ".vercel",
    ".clerk",
    ".netlify",
    "id_rsa",
    "id_ed25519",
}

SENSITIVE_TERMS = (
    "credential",
    "credentials",
    "firebase-adminsdk",
    "private-key",
    "secret",
    "secrets",
    "service-account",
    "token",
)

SOURCE_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go", ".rs", ".rb", ".php", ".java", ".kt", ".swift"}
DOC_SUFFIXES = {".md", ".mdx", ".rst", ".txt"}


def run_git_ls_files(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=root,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise SystemExit(f"git ls-files failed for {root}: {message}")
    return sorted(item for item in result.stdout.decode("utf-8", errors="replace").split("\0") if item)


def path_parts(path: str) -> list[str]:
    return [part for part in path.split("/") if part]


def is_generated_path(path: str) -> bool:
    return any(part in GENERATED_PARTS for part in path_parts(path))


def is_sensitive_path(path: str) -> bool:
    parts = path_parts(path)
    lowered = [part.lower() for part in parts]
    if any(part in SENSITIVE_NAMES for part in lowered):
        return True
    basename = lowered[-1] if lowered else ""
    if basename.startswith(".env"):
        return True
    if basename.endswith((".pem", ".p12", ".pfx", ".key")):
        return True
    return any(term in basename for term in SENSITIVE_TERMS)


def classify_path(path: str) -> str:
    suffix = Path(path).suffix.lower()
    parts = path_parts(path)
    name = Path(path).name
    if is_generated_path(path):
        return "generated"
    if is_sensitive_path(path):
        return "sensitive"
    if any(part in {"test", "tests", "__tests__", "e2e", "spec"} for part in parts) or re.search(r"(\.|-)(test|spec)\.", path):
        return "test"
    if suffix in DOC_SUFFIXES or parts[:1] == ["docs"]:
        return "docs"
    if suffix in SOURCE_SUFFIXES or any(part in {"src", "app", "pages", "server", "client"} for part in parts):
        return "source"
    if name in {"package.json", "pyproject.toml", "go.mod", "Cargo.toml", "requirements.txt"}:
        return "manifest"
    if ".github/workflows/" in path or name.startswith("Dockerfile") or name in {"docker-compose.yml", "compose.yml", "vercel.json"}:
        return "infra"
    if suffix in {".json", ".yaml", ".yml", ".toml", ".ini", ".cfg"}:
        return "config"
    return "other"


def read_text_file(root: Path, path: str, max_bytes: int) -> tuple[str | None, str | None]:
    if is_sensitive_path(path):
        return None, "sensitive-path"
    if is_generated_path(path):
        return None, "generated-path"
    absolute = root / path
    try:
        size = absolute.stat().st_size
    except OSError:
        return None, "unreadable"
    if size > max_bytes:
        return None, "oversized"
    suffix = absolute.suffix.lower()
    try:
        data = absolute.read_bytes()
    except OSError:
        return None, "unreadable"
    if suffix not in TEXT_SUFFIXES and b"\0" in data:
        return None, "binary"
    try:
        return data.decode("utf-8"), None
    except UnicodeDecodeError:
        return None, "binary"


def load_json(text: str) -> dict[str, Any] | None:
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def malformed_toml_headers(text: str) -> bool:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("[") and not re.match(r"^\[[^\]]+\]$", stripped):
            return True
    return False


def quoted_array_values(text: str, key: str) -> list[str]:
    match = re.search(rf"^\s*{re.escape(key)}\s*=\s*\[(.*?)\]", text, re.MULTILINE | re.DOTALL)
    if not match:
        return []
    return re.findall(r"['\"]([^'\"]+)['\"]", match.group(1))


def simple_toml_dependencies(text: str) -> dict[str, str]:
    dependencies: dict[str, str] = {}
    in_dependencies = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            in_dependencies = stripped in {"[dependencies]", "[dev-dependencies]", "[build-dependencies]"}
            continue
        if in_dependencies and "=" in stripped:
            name, value = stripped.split("=", 1)
            dependencies[name.strip()] = value.strip()
    return dependencies


def simple_toml_table(text: str, table: str) -> dict[str, str]:
    values: dict[str, str] = {}
    in_table = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            in_table = stripped == f"[{table}]"
            continue
        if in_table and "=" in stripped:
            name, value = stripped.split("=", 1)
            values[name.strip()] = value.strip()
    return values


def simple_toml_array_tables(text: str, table: str) -> dict[str, list[str]]:
    values: dict[str, list[str]] = {}
    in_table = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            in_table = stripped == f"[{table}]"
            continue
        if in_table and "=" in stripped:
            name, raw_value = stripped.split("=", 1)
            values[name.strip()] = re.findall(r"['\"]([^'\"]+)['\"]", raw_value)
    return values


def package_layer(name: str) -> str:
    lowered = name.lower()
    if lowered in {"next", "react", "vue", "svelte", "astro", "vite", "@vitejs/plugin-react"}:
        return "frontend-framework"
    if lowered in {"express", "fastify", "koa", "@nestjs/core", "hono"}:
        return "api-framework"
    if lowered in {"playwright", "@playwright/test", "jest", "vitest", "pytest"}:
        return "test"
    if lowered in {"prisma", "drizzle-orm", "mongoose", "sequelize", "knex", "sqlalchemy"}:
        return "data"
    if lowered in {"tailwindcss", "lucide-react", "@radix-ui/react-slot", "shadcn-ui"}:
        return "ui"
    if "sentry" in lowered or "otel" in lowered or "pino" in lowered or "winston" in lowered:
        return "observability"
    return "library"


def parse_package_json(path: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    manifest = load_json(text)
    if manifest is None:
        return ([{"path": path, "type": "package.json", "parse_status": "invalid-json"}], [], [], [])
    manifests = [{"path": path, "type": "package.json", "parse_status": "ok"}]
    dependencies: list[dict[str, Any]] = []
    frameworks: list[dict[str, Any]] = []
    package_scripts: list[dict[str, Any]] = []
    for section in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        values = manifest.get(section)
        if not isinstance(values, dict):
            continue
        for name, version in sorted(values.items()):
            layer = package_layer(name)
            dependencies.append(
                {
                    "package": name,
                    "version": str(version),
                    "source": path,
                    "section": section,
                    "layer": layer,
                }
            )
            if layer.endswith("framework") or name in {"next", "react", "vue", "svelte", "astro", "vite"}:
                frameworks.append({"name": name, "source": path, "evidence": "package.json"})
    scripts = manifest.get("scripts")
    if isinstance(scripts, dict):
        for name, command in sorted(scripts.items()):
            package_scripts.append({"name": str(name), "command": str(command), "source": path, "kind": "package.json"})
    return manifests, dependencies, frameworks, package_scripts


def parse_pyproject(path: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    manifests = [{"path": path, "type": "pyproject.toml", "parse_status": "ok"}]
    scripts: list[dict[str, Any]] = []
    if tomllib is None:
        if malformed_toml_headers(text):
            manifests[0]["parse_status"] = "invalid-toml"
            return manifests, [], [], []
        raw_deps = quoted_array_values(text, "dependencies")
        for name, command in simple_toml_table(text, "project.scripts").items():
            scripts.append({"name": name, "command": command.strip("'\""), "source": path, "kind": "pyproject.toml"})
        for section, values in simple_toml_array_tables(text, "project.optional-dependencies").items():
            raw_deps.extend(values)
    else:
        try:
            parsed = tomllib.loads(text)
        except Exception:
            manifests[0]["parse_status"] = "invalid-toml"
            return manifests, [], [], []
        raw_deps = parsed.get("project", {}).get("dependencies", [])
        optional = parsed.get("project", {}).get("optional-dependencies", {})
        if isinstance(optional, dict):
            for values in optional.values():
                if isinstance(values, list):
                    raw_deps.extend(values)
        py_scripts = parsed.get("project", {}).get("scripts", {})
        if isinstance(py_scripts, dict):
            for name, command in sorted(py_scripts.items()):
                scripts.append({"name": str(name), "command": str(command), "source": path, "kind": "pyproject.toml"})
    dependencies: list[dict[str, Any]] = []
    frameworks: list[dict[str, Any]] = []
    for value in raw_deps if isinstance(raw_deps, list) else []:
        name = re.split(r"[<>=~!;\[]", str(value), maxsplit=1)[0].strip()
        if not name:
            continue
        dependencies.append({"package": name, "version": str(value), "source": path, "section": "project.dependencies", "layer": package_layer(name)})
        if name.lower() in {"fastapi", "django", "flask"}:
            frameworks.append({"name": name, "source": path, "evidence": "pyproject.toml"})
    return manifests, dependencies, frameworks, scripts


def parse_requirements(path: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    dependencies: list[dict[str, Any]] = []
    frameworks: list[dict[str, Any]] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("-"):
            continue
        name = re.split(r"[<>=~!;\[]", stripped, maxsplit=1)[0].strip()
        dependencies.append({"package": name, "version": stripped, "source": path, "section": "requirements", "layer": package_layer(name)})
        if name.lower() in {"fastapi", "django", "flask"}:
            frameworks.append({"name": name, "source": path, "evidence": "requirements"})
    return dependencies, frameworks


def parse_go_mod(path: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    manifests = [{"path": path, "type": "go.mod", "parse_status": "ok"}]
    dependencies = [{"package": match.group(1), "version": match.group(2), "source": path, "section": "require", "layer": "go-module"} for match in re.finditer(r"^\s*require\s+([^\s]+)\s+([^\s]+)", text, re.MULTILINE)]
    return manifests, dependencies


def parse_cargo(path: str, text: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    manifests = [{"path": path, "type": "Cargo.toml", "parse_status": "ok"}]
    if tomllib is None:
        if malformed_toml_headers(text):
            manifests[0]["parse_status"] = "invalid-toml"
            return manifests, []
        return manifests, [
            {"package": name, "version": value, "source": path, "section": "dependencies", "layer": "rust-crate"}
            for name, value in sorted(simple_toml_dependencies(text).items())
        ]
    try:
        parsed = tomllib.loads(text)
    except Exception:
        manifests[0]["parse_status"] = "invalid-toml"
        return manifests, []
    dependencies: list[dict[str, Any]] = []
    for section in ("dependencies", "dev-dependencies", "build-dependencies"):
        values = parsed.get(section, {})
        if isinstance(values, dict):
            for name, version in sorted(values.items()):
                dependencies.append({"package": name, "version": json.dumps(version, sort_keys=True), "source": path, "section": section, "layer": "rust-crate"})
    return manifests, dependencies


def route_segment(segment: str) -> str | None:
    if segment.startswith("(") and segment.endswith(")"):
        return None
    if segment.startswith("@"):
        return None
    if segment.startswith("[[...") and segment.endswith("]]"):
        return f"*{segment[5:-2]}"
    if segment.startswith("[...") and segment.endswith("]"):
        return f"*{segment[4:-1]}"
    if segment.startswith("[") and segment.endswith("]"):
        return f":{segment[1:-1]}"
    return segment


def recognized_app_root(parts: list[str], app_index: int) -> bool:
    prefix = parts[:app_index]
    if prefix in ([], ["src"]):
        return True
    if len(prefix) >= 2 and prefix[0] in {"apps", "packages"} and prefix[-1] in {"src", prefix[1]}:
        return True
    return False


def recognized_pages_root(parts: list[str], pages_index: int) -> bool:
    prefix = parts[:pages_index]
    if prefix in ([], ["src"]):
        return True
    if len(prefix) >= 2 and prefix[0] in {"apps", "packages"} and prefix[-1] in {"src", prefix[1]}:
        return True
    return False


def join_route(segments: list[str]) -> str:
    clean = [route_segment(segment) for segment in segments]
    clean = [segment for segment in clean if segment]
    return "/" + "/".join(clean) if clean else "/"


def next_app_route(path: str, leaf: str) -> str | None:
    parts = path_parts(path)
    if leaf not in parts:
        return None
    try:
        app_index = parts.index("app")
    except ValueError:
        return None
    if not recognized_app_root(parts, app_index):
        return None
    leaf_index = parts.index(leaf)
    return join_route(parts[app_index + 1 : leaf_index])


def next_pages_route(path: str) -> str | None:
    parts = path_parts(path)
    try:
        pages_index = parts.index("pages")
    except ValueError:
        return None
    if not recognized_pages_root(parts, pages_index):
        return None
    tail = parts[pages_index + 1 :]
    if not tail:
        return None
    tail[-1] = Path(tail[-1]).stem
    if tail[-1] == "index":
        tail = tail[:-1]
    return join_route(tail)


def detect_next_methods(text: str) -> list[str]:
    methods = sorted(set(re.findall(r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b", text)))
    return methods or ["UNKNOWN"]


def find_api_endpoints(path: str, text: str) -> list[dict[str, Any]]:
    endpoints: list[dict[str, Any]] = []
    basename = Path(path).name
    if basename.startswith("route.") and "/app/api/" in f"/{path}":
        route = next_app_route(path, basename)
        if route:
            endpoints.append({"path": path, "route": route, "methods": detect_next_methods(text), "source": "next-app-router"})
    if "/pages/api/" in f"/{path}":
        route = next_pages_route(path)
        if route:
            endpoints.append({"path": path, "route": route, "methods": ["UNKNOWN"], "source": "next-pages-api"})
    for match in re.finditer(r"\b(?:app|router|server)\.(get|post|put|patch|delete|options|head)\(\s*['\"]([^'\"]+)", text):
        endpoints.append({"path": path, "route": match.group(2), "methods": [match.group(1).upper()], "source": "js-route-call"})
    for match in re.finditer(r"@(?:\w+\.)?(get|post|put|patch|delete|options|head)\(\s*['\"]([^'\"]+)", text):
        endpoints.append({"path": path, "route": match.group(2), "methods": [match.group(1).upper()], "source": "python-route-decorator"})
    for match in re.finditer(r"HandleFunc\(\s*\"([^\"]+)\"", text):
        endpoints.append({"path": path, "route": match.group(1), "methods": ["UNKNOWN"], "source": "go-handlefunc"})
    return endpoints


def find_ui_routes(path: str, text: str) -> list[dict[str, Any]]:
    routes: list[dict[str, Any]] = []
    basename = Path(path).name
    if basename.startswith("page."):
        route = next_app_route(path, basename)
        if route is not None:
            routes.append({"path": path, "route": route, "source": "next-app-page"})
    if "/pages/" in f"/{path}" and "/pages/api/" not in f"/{path}":
        route = next_pages_route(path)
        if route and not route.startswith("/_"):
            routes.append({"path": path, "route": route, "source": "next-pages-route"})
    for match in re.finditer(r"<Route[^>]+path\s*=\s*['\"]([^'\"]+)", text):
        routes.append({"path": path, "route": match.group(1), "source": "react-router"})
    return routes


def markdown_links(root: Path, path: str, text: str, tracked: set[str]) -> list[dict[str, Any]]:
    refs: list[dict[str, Any]] = []
    for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
        target = match.group(1).split("#", 1)[0].strip()
        if not target or re.match(r"^[a-z]+:", target) or target.startswith("#"):
            continue
        target_path = Path(target)
        if target_path.is_absolute():
            try:
                normalized = target_path.resolve().relative_to(root).as_posix()
            except ValueError:
                normalized = target_path.as_posix()
        else:
            normalized = (Path(path).parent / target).as_posix()
            normalized = os.path.normpath(normalized).replace("\\", "/")
        refs.append({"doc": path, "target": target, "normalized_target": normalized, "exists": normalized in tracked})
    return refs


def unique_records(records: list[dict[str, Any]], keys: tuple[str, ...]) -> list[dict[str, Any]]:
    seen: set[tuple[Any, ...]] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        marker = tuple(record.get(key) for key in keys)
        if marker in seen:
            continue
        seen.add(marker)
        unique.append(record)
    return sorted(unique, key=lambda item: json.dumps(item, sort_keys=True))


def dependency_usage(dependencies: list[dict[str, Any]], texts: dict[str, str]) -> list[dict[str, Any]]:
    source_texts = {path: text for path, text in texts.items() if classify_path(path) in {"source", "test", "config", "infra"}}
    usage: list[dict[str, Any]] = []
    for dep in dependencies:
        package = dep["package"]
        matches: list[str] = []
        for path, text in source_texts.items():
            if package in text:
                matches.append(path)
            if len(matches) >= 8:
                break
        usage.append({"package": package, "source": dep["source"], "usage_paths": sorted(matches), "usage_count": len(matches)})
    return unique_records(usage, ("package", "source"))


def build_inventory(root: Path, max_bytes: int) -> dict[str, Any]:
    root = root.resolve()
    tracked_files = run_git_ls_files(root)
    tracked = set(tracked_files)
    files: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    texts: dict[str, str] = {}
    manifests: list[dict[str, Any]] = []
    dependencies: list[dict[str, Any]] = []
    frameworks: list[dict[str, Any]] = []
    package_scripts: list[dict[str, Any]] = []
    endpoints: list[dict[str, Any]] = []
    ui_routes: list[dict[str, Any]] = []
    tests: list[dict[str, Any]] = []
    infra: list[dict[str, Any]] = []
    docs: list[dict[str, Any]] = []
    doc_refs: list[dict[str, Any]] = []

    for file_path in tracked_files:
        category = classify_path(file_path)
        text, skip_reason = read_text_file(root, file_path, max_bytes)
        files.append({"path": file_path, "category": category, "readable": skip_reason is None, "skip_reason": skip_reason})
        if skip_reason:
            skipped.append({"path": file_path, "reason": skip_reason, "category": category})
            continue
        assert text is not None
        texts[file_path] = text
        name = Path(file_path).name
        if name == "package.json":
            parsed_manifests, parsed_dependencies, parsed_frameworks, parsed_scripts = parse_package_json(file_path, text)
            manifests.extend(parsed_manifests)
            dependencies.extend(parsed_dependencies)
            frameworks.extend(parsed_frameworks)
            package_scripts.extend(parsed_scripts)
        elif name == "pyproject.toml":
            parsed_manifests, parsed_dependencies, parsed_frameworks, parsed_scripts = parse_pyproject(file_path, text)
            manifests.extend(parsed_manifests)
            dependencies.extend(parsed_dependencies)
            frameworks.extend(parsed_frameworks)
            package_scripts.extend(parsed_scripts)
        elif name.startswith("requirements") and name.endswith(".txt"):
            manifests.append({"path": file_path, "type": "requirements.txt", "parse_status": "ok"})
            parsed_dependencies, parsed_frameworks = parse_requirements(file_path, text)
            dependencies.extend(parsed_dependencies)
            frameworks.extend(parsed_frameworks)
        elif name == "go.mod":
            parsed_manifests, parsed_dependencies = parse_go_mod(file_path, text)
            manifests.extend(parsed_manifests)
            dependencies.extend(parsed_dependencies)
            frameworks.append({"name": "go", "source": file_path, "evidence": "go.mod"})
        elif name == "Cargo.toml":
            parsed_manifests, parsed_dependencies = parse_cargo(file_path, text)
            manifests.extend(parsed_manifests)
            dependencies.extend(parsed_dependencies)
            frameworks.append({"name": "rust", "source": file_path, "evidence": "Cargo.toml"})
        if category == "source":
            endpoints.extend(find_api_endpoints(file_path, text))
            ui_routes.extend(find_ui_routes(file_path, text))
        if category == "test":
            tests.append({"path": file_path, "kind": "test-file"})
        if category == "infra":
            infra.append({"path": file_path, "kind": name})
        if category == "docs":
            docs.append({"path": file_path})
            doc_refs.extend(markdown_links(root, file_path, text, tracked))

    return {
        "schema_version": 1,
        "inventory_command": "skills/repo-technical-documentation/scripts/repo_inventory.py <repo> --format json",
        "repo_root": str(root),
        "tracked_file_count": len(tracked_files),
        "files": files,
        "skipped_files": skipped,
        "manifests": unique_records(manifests, ("path", "type")),
        "dependencies": unique_records(dependencies, ("package", "source", "section")),
        "dependency_usage": dependency_usage(dependencies, texts),
        "frameworks": unique_records(frameworks, ("name", "source")),
        "package_scripts": unique_records(package_scripts, ("name", "source", "kind")),
        "api_endpoints": unique_records(endpoints, ("path", "route", "source")),
        "ui_routes": unique_records(ui_routes, ("path", "route", "source")),
        "tests": unique_records(tests, ("path", "kind")),
        "infra": unique_records(infra, ("path", "kind")),
        "docs": unique_records(docs, ("path",)),
        "doc_references": unique_records(doc_refs, ("doc", "target", "normalized_target")),
    }


def markdown_table(headers: list[str], rows: list[list[Any]]) -> list[str]:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(value).replace("|", "\\|") for value in row) + " |")
    return lines


def to_markdown(inventory: dict[str, Any]) -> str:
    lines = [
        "# Repo Inventory Evidence",
        "",
        f"- Schema version: {inventory['schema_version']}",
        f"- Repo root: `{inventory['repo_root']}`",
        f"- Tracked files: {inventory['tracked_file_count']}",
        f"- Skipped/path-inventoried files: {len(inventory['skipped_files'])}",
        "",
        "## Frameworks",
        "",
    ]
    framework_rows = [[item["name"], item["source"], item["evidence"]] for item in inventory["frameworks"]]
    lines.extend(markdown_table(["Name", "Source", "Evidence"], framework_rows or [["None found.", "", ""]]))
    lines.extend(["", "## API Endpoints", ""])
    endpoint_rows = [[",".join(item["methods"]), item["route"], item["path"], item["source"]] for item in inventory["api_endpoints"]]
    lines.extend(markdown_table(["Methods", "Route", "Path", "Source"], endpoint_rows or [["None found.", "", "", ""]]))
    lines.extend(["", "## UI Routes", ""])
    ui_rows = [[item["route"], item["path"], item["source"]] for item in inventory["ui_routes"]]
    lines.extend(markdown_table(["Route", "Path", "Source"], ui_rows or [["None found.", "", ""]]))
    lines.extend(["", "## Dependencies", ""])
    dep_rows = [[item["package"], item["section"], item["source"], item["layer"]] for item in inventory["dependencies"]]
    lines.extend(markdown_table(["Package", "Section", "Source", "Layer"], dep_rows[:80] or [["None found.", "", "", ""]]))
    lines.extend(["", "## Package Scripts", ""])
    script_rows = [[item["name"], item["source"], item["kind"], item["command"]] for item in inventory["package_scripts"]]
    lines.extend(markdown_table(["Name", "Source", "Kind", "Command"], script_rows or [["None found.", "", "", ""]]))
    lines.extend(["", "## Documentation References", ""])
    ref_rows = [[item["doc"], item["target"], item["normalized_target"], item["exists"]] for item in inventory["doc_references"]]
    lines.extend(markdown_table(["Doc", "Target", "Normalized target", "Exists"], ref_rows or [["None found.", "", "", ""]]))
    lines.extend(["", "## Skipped Files", ""])
    skipped_rows = [[item["path"], item["reason"], item["category"]] for item in inventory["skipped_files"]]
    lines.extend(markdown_table(["Path", "Reason", "Category"], skipped_rows or [["None found.", "", ""]]))
    return "\n".join(lines) + "\n"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Inventory tracked repo facts for technical documentation.")
    parser.add_argument("repo", nargs="?", default=".", help="Repository root. Defaults to current directory.")
    parser.add_argument("--format", choices=("json", "markdown"), default="json", help="Output format.")
    parser.add_argument("--output", help="Optional output file path.")
    parser.add_argument("--max-bytes", type=int, default=512_000, help="Maximum bytes to read from any tracked file.")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    inventory = build_inventory(Path(args.repo), args.max_bytes)
    output = json.dumps(inventory, indent=2, sort_keys=True) + "\n" if args.format == "json" else to_markdown(inventory)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        sys.stdout.write(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
