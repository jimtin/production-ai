#!/usr/bin/env bash
# Structural validation for the skill library. Checks every skills/<name>/:
#   - SKILL.md exists with YAML frontmatter (name, description)
#   - frontmatter name matches the directory name
#   - description is non-empty and within the 1024-char skill-description budget
#   - no README.md exists in the installable payload
#   - docs/skills/<name>.md exists as the human/content layer
#   - agents/openai.yaml exists with interface metadata
#   - every references/... path mentioned in SKILL.md exists on disk
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - "$repo_root" <<'PY'
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
skills_dir = root / "skills"
skill_docs_dir = root / "docs" / "skills"
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
    if (skill / "README.md").exists():
        errors.append(f"{label}: README.md belongs in docs/skills/{skill.name}.md, not the installable payload")
    if not (skill_docs_dir / f"{skill.name}.md").exists():
        errors.append(f"{label}: missing docs/skills/{skill.name}.md (human/content layer)")
    openai_yaml = skill / "agents" / "openai.yaml"
    if not openai_yaml.exists():
        errors.append(f"{label}: missing agents/openai.yaml")
    else:
        metadata = openai_yaml.read_text()
        for needle in ("interface:", "display_name:", "short_description:", "default_prompt:"):
            if needle not in metadata:
                errors.append(f"{label}: agents/openai.yaml missing '{needle}'")
    for ref in sorted(set(re.findall(r"(?:references|scripts)/[A-Za-z0-9_\-./]+\.(?:md|py|json|sh)", text))):
        if not (skill / ref).exists():
            errors.append(f"{label}: SKILL.md mentions '{ref}' but the file does not exist")

for required in ("README.md", "LICENSE", "docs/skills/README.md", "scripts/install-skill.sh", "templates/AGENTS-workspace-template.md", "templates/SKILL-template.md"):
    if not (root / required).exists():
        errors.append(f"repo: missing {required}")

for doc in sorted(skill_docs_dir.glob("*.md")):
    if doc.name == "README.md":
        continue
    if not (skills_dir / doc.stem / "SKILL.md").exists():
        errors.append(f"docs/skills/{doc.name}: no matching skills/{doc.stem}/SKILL.md")

raw_install_pattern = re.compile(r"cp\s+-R\s+(?:\S*/)?skills/[A-Za-z0-9_-]+")
for path in sorted(root.rglob("*.md")):
    if any(part in {".git", "node_modules"} for part in path.relative_to(root).parts):
        continue
    text = path.read_text()
    if raw_install_pattern.search(text):
        errors.append(f"{path.relative_to(root)}: use scripts/install-skill.sh instead of raw cp -R skills/<name>")

if errors:
    print("Validation FAILED:")
    for err in errors:
        print(f"  - {err}")
    sys.exit(1)

count = sum(1 for p in skills_dir.iterdir() if p.is_dir())
print(f"Validation passed: {count} skills, structure and references OK.")
PY
