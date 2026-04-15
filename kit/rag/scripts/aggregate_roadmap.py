#!/usr/bin/env python3
"""Aggregate every curated repo's docs/specs/* into one per-user roadmap view.

Reads each repo's spec frontmatters (proposed / active / shipped) and writes
to OUTPUT_PATH or ~/.claude/projects/<first-project>/memory/roadmap-all.md.
Idempotent.
"""
from __future__ import annotations

import datetime
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from build import CURATED_REPOS  # reuse the whitelist

FRONT_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def output_path() -> Path:
    if os.environ.get("OUTPUT_PATH"):
        return Path(os.environ["OUTPUT_PATH"]).expanduser()
    projects = Path.home() / ".claude" / "projects"
    memory_dirs = sorted(projects.glob("*/memory"))
    base = memory_dirs[0] if memory_dirs else projects / "default" / "memory"
    return base / "roadmap-all.md"


def read_frontmatter(path: Path) -> dict:
    try:
        text = path.read_text()
    except (OSError, UnicodeDecodeError):
        return {}
    m = FRONT_RE.match(text)
    if not m:
        return {}
    fm: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        fm[k.strip()] = v.strip()
    return fm


def collect(repo: Path) -> dict:
    specs_dir = repo / "docs" / "specs"
    buckets: dict[str, list[tuple[str, dict]]] = {
        "active": [],
        "proposed": [],
        "shipped": [],
    }
    if not specs_dir.is_dir():
        return buckets
    for sd in sorted(specs_dir.glob("*/")):
        if sd.name == "archived":
            continue
        fm = read_frontmatter(sd / "spec.md")
        status = fm.get("status", "proposed")
        buckets.setdefault(status, []).append((sd.name, fm))
    archived = specs_dir / "archived"
    if archived.is_dir():
        for sd in sorted(archived.glob("*/"), reverse=True)[:5]:
            fm = read_frontmatter(sd / "spec.md")
            buckets["shipped"].append((sd.name, fm))
    return buckets


def render(all_buckets: list[tuple[str, dict]]) -> str:
    today = datetime.date.today().isoformat()
    lines = [
        "---",
        "name: roadmap-all",
        "description: Cross-repo aggregate of every curated repo's docs/specs status. Auto-generated; do not hand-edit.",
        "type: project",
        f"updated: {today}",
        "---",
        "",
        f"# Cross-repo roadmap — {today}",
        "",
        "Per-repo view of what's Active, Proposed, and Recently shipped. Run `~/.claude/rag-index/aggregate_roadmap.py` to regenerate.",
        "",
    ]
    any_content = False
    for repo_name, buckets in all_buckets:
        if not any(buckets.values()):
            continue
        any_content = True
        lines.append(f"## {repo_name}")
        for title, status in [
            ("Active", "active"),
            ("Proposed", "proposed"),
            ("Recently shipped", "shipped"),
        ]:
            items = buckets.get(status) or []
            if not items:
                continue
            lines.append(f"### {title}")
            for name, fm in items:
                pr = f"  —  {fm['pr']}" if fm.get("pr") else ""
                tags = f"  `{fm['tags']}`" if fm.get("tags") else ""
                lines.append(f"- **{name}**{tags}{pr}")
            lines.append("")
    if not any_content:
        lines.append("_No specs committed in any curated repo yet._")
    return "\n".join(lines) + "\n"


def main() -> int:
    all_buckets: list[tuple[str, dict]] = []
    for repo in CURATED_REPOS:
        if not repo.is_dir():
            continue
        all_buckets.append((repo.name, collect(repo)))
    out = output_path()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(all_buckets))
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
