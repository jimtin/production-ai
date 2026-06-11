#!/usr/bin/env bash
# Fail-closed privacy scan for this repo.
#
# Two layers:
#   1. Denylist sweep: every text file is checked against
#      scripts/privacy-denylist.txt — terms that must never appear in public
#      content (private hostnames, workspace identifiers, chat-platform
#      snowflake IDs, user paths). Patterns are case-insensitive unless
#      prefixed with (?-i).
#   2. Secret scan: gitleaks over history + working tree (binary or Docker).
#
# Exit non-zero on any hit. Set REQUIRE_GITLEAKS=1 (CI does) to fail when no
# gitleaks runtime is available instead of warning.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
status=0

echo "==> Denylist sweep"
if ! python3 - "$repo_root" <<'PY'
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
denylist_path = root / "scripts" / "privacy-denylist.txt"
skip_dirs = {".git", "node_modules", "__pycache__", ".venv"}

patterns = []
for raw in denylist_path.read_text().splitlines():
    line = raw.strip()
    if not line or line.startswith("#"):
        continue
    if line.startswith("(?-i)"):
        patterns.append(re.compile(line[len("(?-i)"):]))
    else:
        patterns.append(re.compile(line, re.IGNORECASE))

violations = 0
for path in sorted(root.rglob("*")):
    if not path.is_file() or path == denylist_path:
        continue
    if any(part in skip_dirs for part in path.relative_to(root).parts):
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        continue  # binary or unreadable: nothing greppable
    for lineno, line in enumerate(text.splitlines(), 1):
        for pattern in patterns:
            if pattern.search(line):
                print(f"{path.relative_to(root)}:{lineno}: matches denylisted pattern '{pattern.pattern}'")
                violations += 1

if violations:
    print(f"{violations} denylist violation(s).")
    sys.exit(1)
print("OK: no denylisted terms.")
PY
then
  echo "ERROR: denylisted terms found (see matches above)." >&2
  status=1
fi

echo "==> Secret scan (gitleaks)"
gitleaks_args=(detect --redact --no-banner)
if ! git -C "$repo_root" rev-parse HEAD >/dev/null 2>&1; then
  gitleaks_args+=(--no-git)
fi

if command -v gitleaks >/dev/null 2>&1; then
  if ! gitleaks "${gitleaks_args[@]}" --source "$repo_root"; then
    echo "ERROR: gitleaks reported findings." >&2
    status=1
  fi
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if ! docker run --rm -v "$repo_root:/repo:ro" zricethezav/gitleaks:latest \
      "${gitleaks_args[@]}" --source /repo; then
    echo "ERROR: gitleaks (docker) reported findings." >&2
    status=1
  fi
else
  echo "WARN: gitleaks not available (no binary, no docker)."
  if [ "${REQUIRE_GITLEAKS:-0}" = "1" ]; then
    echo "ERROR: REQUIRE_GITLEAKS=1 and gitleaks could not run. Failing closed." >&2
    status=3
  fi
fi

if [ "$status" -eq 0 ]; then
  echo "Privacy scan passed."
fi
exit "$status"
