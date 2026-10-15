#!/usr/bin/env python3
"""Dependency-free structural validator for project-local SKILL.md files."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1] / ".agents" / "skills"
errors = []
count = 0

if not ROOT.exists():
    print(f"ERROR: skill directory not found: {ROOT}")
    sys.exit(1)

for path in sorted(ROOT.glob("*/SKILL.md")):
    count += 1
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        errors.append(f"{path}: missing YAML frontmatter start")
        continue
    end = text.find("\n---\n", 4)
    if end < 0:
        errors.append(f"{path}: missing YAML frontmatter end")
        continue
    front = text[4:end]
    name = re.search(r"(?m)^name:\s*([a-z0-9][a-z0-9-]*)\s*$", front)
    desc = re.search(r"(?m)^description:\s*(\S.*|>[-+]?)\s*$", front)
    if not name:
        errors.append(f"{path}: missing or malformed name")
    elif name.group(1) != path.parent.name:
        errors.append(f"{path}: name '{name.group(1)}' does not match directory '{path.parent.name}'")
    if not desc:
        errors.append(f"{path}: missing description")
    if len(text.strip()) < 250:
        errors.append(f"{path}: unusually short body")

print(f"Checked {count} skill file(s).")
if errors:
    print("FAIL")
    for item in errors:
        print(f"- {item}")
    sys.exit(1)
print("PASS: frontmatter and directory-name checks.")
