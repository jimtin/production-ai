#!/usr/bin/env bash
# Structural validation for the skill library. Checks every skills/<name>/:
#   - SKILL.md exists with YAML frontmatter (name, description)
#   - frontmatter name matches the directory name
#   - description is non-empty and within the 1024-char skill-description budget
#   - README.md (human/content layer) exists
#   - every references/... path mentioned in SKILL.md exists on disk
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - "$repo_root" <<'PY'
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
skills_dir = root / "skills"
errors: list[str] = []


def parse_frontmatter(text: str) -> dict:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    fields = {}
    for line in text[3:end].strip().splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip().strip("\"'")
    return fields


for skill in sorted(p for p in skills_dir.iterdir() if p.is_dir()):
    label = f"skills/{skill.name}"
    skill_md = skill / "SKILL.md"
    if not skill_md.exists():
        errors.append(f"{label}: missing SKILL.md")
        continue
    text = skill_md.read_text()
    fm = parse_frontmatter(text)
    name = fm.get("name", "")
    description = fm.get("description", "")
    if not name:
        errors.append(f"{label}: frontmatter missing 'name'")
    elif name != skill.name:
        errors.append(f"{label}: frontmatter name '{name}' != directory name")
    if not description:
        errors.append(f"{label}: frontmatter missing 'description'")
    elif len(description) > 1024:
        errors.append(f"{label}: description is {len(description)} chars (max 1024)")
    if not (skill / "README.md").exists():
        errors.append(f"{label}: missing README.md (human/content layer)")
    for ref in sorted(set(re.findall(r"(?:references|scripts)/[A-Za-z0-9_\-./]+\.(?:md|py|json|sh)", text))):
        if not (skill / ref).exists():
            errors.append(f"{label}: SKILL.md mentions '{ref}' but the file does not exist")

for required in ("README.md", "LICENSE", "templates/AGENTS-workspace-template.md", "templates/SKILL-template.md"):
    if not (root / required).exists():
        errors.append(f"repo: missing {required}")

if errors:
    print("Validation FAILED:")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)

count = sum(1 for p in skills_dir.iterdir() if p.is_dir())
print(f"Validation passed: {count} skills, structure and references OK.")
PY
