#!/usr/bin/env bash
# Install one clean skill payload from this repo into a Codex skills directory.
# Public guides under docs/skills are intentionally not installed.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install-skill.sh <skill-name> [destination-skills-dir]

Examples:
  scripts/install-skill.sh clarify-before-build
  scripts/install-skill.sh clarify-before-build ~/.codex/skills

Only runtime payload files are installed: SKILL.md, agents/, references/,
scripts/, assets/, and tests/.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  usage >&2
  exit 2
fi

skill_name="$1"
dest_root="${2:-${CODEX_HOME:-$HOME/.codex}/skills}"

case "$skill_name" in
  *[!a-z0-9-]* | "" )
    echo "ERROR: skill name must contain only lowercase letters, digits, and hyphens." >&2
    exit 2
    ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/skills/$skill_name"
target_dir="$dest_root/$skill_name"
staging_dir="$dest_root/.${skill_name}.install.$$"

if [ ! -f "$source_dir/SKILL.md" ]; then
  echo "ERROR: unknown skill '$skill_name'." >&2
  exit 1
fi

cleanup() {
  rm -rf "$staging_dir"
}
trap cleanup EXIT

mkdir -p "$dest_root"
rm -rf "$staging_dir"
mkdir -p "$staging_dir"

for item in SKILL.md agents references scripts assets tests; do
  if [ -e "$source_dir/$item" ]; then
    cp -R "$source_dir/$item" "$staging_dir/"
  fi
done

if [ -e "$source_dir/README.md" ]; then
  echo "ERROR: installable skill payload contains README.md: $source_dir" >&2
  exit 1
fi

rm -rf "$target_dir"
mv "$staging_dir" "$target_dir"
trap - EXIT

echo "Installed $skill_name to $target_dir"
