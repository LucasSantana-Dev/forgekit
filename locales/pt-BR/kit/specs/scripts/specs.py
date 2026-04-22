#!/usr/bin/env python3
"""Spec + roadmap management inspired by Agent-OS, adapted to our workflow.

Commands:
  new <slug> [--repo .] [--from-plan PATH]     create docs/specs/YYYY-MM-DD-<slug>/{spec,tasks}.md
  list [--repo .] [--status ...]               list specs with status
  ship <spec-dir> [--pr <url>]                 mark shipped; move to docs/specs/archived/
  roadmap [--repo .] [--format md]             regenerate docs/roadmap.md

Each spec.md carries YAML-ish frontmatter:
  ---
  status: proposed|active|shipped
  created: YYYY-MM-DD
  owner: <user>
  pr:
  tags:
  ---

tasks.md is a plain checkbox list; all-checked + status=shipped → archived.
"""
from __future__ import annotations

import argparse
import datetime
import os
import re
import shutil
import sys
from pathlib import Path

FRONT_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def read_frontmatter(path: Path) -> dict:
    if not path.exists():
        return {}
    text = path.read_text()
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


def write_frontmatter(path: Path, fm: dict, body: str) -> None:
    lines = ["---"]
    for k, v in fm.items():
        lines.append(f"{k}: {v}")
    lines.append("---\n")
    path.write_text("\n".join(lines) + body)


def slug_from(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:50]


def today() -> str:
    return datetime.date.today().isoformat()


def cmd_new(args) -> int:
    repo = Path(args.repo).expanduser().resolve()
    if not repo.is_dir():
        print(f"repo not found: {repo}", file=sys.stderr)
        return 2
    specs = repo / "docs" / "specs"
    specs.mkdir(parents=True, exist_ok=True)
    slug = slug_from(args.slug)
    folder = specs / f"{today()}-{slug}"
    folder.mkdir(exist_ok=False)

    spec_body = ""
    tasks_body = ""
    if args.from_plan:
        plan = Path(args.from_plan).expanduser()
        if plan.is_file():
            text = plan.read_text()
            spec_body = f"\n## Imported from plan\n\n{text}\n"
            tasks_body = _extract_tasks_from_plan(text)

    fm = {
        "status": "proposed",
        "created": today(),
        "owner": os.environ.get("USER", ""),
        "pr": "",
        "tags": args.tags or "",
    }
    default_body = spec_body or f"""
# {args.slug}

## Goal
One sentence describing what this spec delivers.

## Context
Why we're doing this now. Related prior decisions — cite via `recall` or `rag_query`.

## Approach
Step-by-step design. Tradeoffs made. What's explicitly out of scope.

## Verification
How we'll know it's done and working.
"""
    write_frontmatter(folder / "spec.md", fm, default_body)
    (folder / "tasks.md").write_text(
        tasks_body
        or f"""# Tasks — {args.slug}

- [ ] Draft spec.md
- [ ] Break work into 1-2 hour chunks
- [ ] Land implementation
- [ ] Tests pass in CI
- [ ] PR merged
"""
    )
    print(folder)
    return 0


def _extract_tasks_from_plan(plan_text: str) -> str:
    """Heuristic: find '### Phase N' or '## Phase N' headers → convert to tasks."""
    tasks: list[str] = []
    for line in plan_text.splitlines():
        m = re.match(r"^#{2,3}\s+Phase\s+(\d+|[A-Z])\s*[—:-]?\s*(.+)$", line)
        if m:
            tasks.append(f"- [ ] Phase {m.group(1)}: {m.group(2).strip()}")
    if not tasks:
        return ""
    return "# Tasks\n\n" + "\n".join(tasks) + "\n"


def cmd_list(args) -> int:
    repo = Path(args.repo).expanduser().resolve()
    specs = repo / "docs" / "specs"
    if not specs.is_dir():
        print("(no specs dir)")
        return 0
    rows = []
    for sd in sorted(specs.glob("*/"), reverse=True):
        if sd.name == "archived":
            continue
        fm = read_frontmatter(sd / "spec.md")
        status = fm.get("status", "?")
        if args.status and status != args.status:
            continue
        tasks_file = sd / "tasks.md"
        checked = done = 0
        if tasks_file.exists():
            for line in tasks_file.read_text().splitlines():
                if re.match(r"^\s*-\s+\[[ xX]\]", line):
                    checked += 1
                    if re.match(r"^\s*-\s+\[[xX]\]", line):
                        done += 1
        rows.append((sd.name, status, fm.get("pr", ""), f"{done}/{checked}"))
    if not rows:
        print("(no specs)")
        return 0
    w = max(len(r[0]) for r in rows)
    for name, status, pr, progress in rows:
        print(f"  {name:<{w}}  [{status:<8}]  {progress:<6}  {pr}")
    return 0


def cmd_ship(args) -> int:
    folder = Path(args.spec_dir).expanduser().resolve()
    if not folder.is_dir() or not (folder / "spec.md").exists():
        print(f"not a spec dir: {folder}", file=sys.stderr)
        return 2
    fm = read_frontmatter(folder / "spec.md")
    fm["status"] = "shipped"
    fm["shipped"] = today()
    if args.pr:
        fm["pr"] = args.pr
    body = FRONT_RE.sub("", (folder / "spec.md").read_text(), count=1)
    write_frontmatter(folder / "spec.md", fm, body)

    archived_root = folder.parent / "archived"
    archived_root.mkdir(parents=True, exist_ok=True)
    dest = archived_root / folder.name
    if dest.exists():
        stamp = datetime.datetime.now().strftime("%H%M%S")
        dest = archived_root / f"{folder.name}-{stamp}"
    shutil.move(str(folder), str(dest))
    print(dest)
    return 0


def _repo_display_name(repo: Path) -> str:
    """Prefer git remote basename, fall back to repo dir name."""
    import subprocess

    try:
        proc = subprocess.run(
            ["git", "-C", str(repo), "config", "--get", "remote.origin.url"],
            capture_output=True,
            text=True,
            check=True,
            timeout=5,
        )
        url = proc.stdout.strip()
        if url:
            name = url.rstrip("/").rsplit("/", 1)[-1]
            if name.endswith(".git"):
                name = name[:-4]
            return name
    except Exception:
        pass
    # Walk up if invoked from a worktree (.wt-*)
    cur = repo
    while cur.parent != cur and cur.name.startswith(".wt"):
        cur = cur.parent
    return cur.name


def cmd_roadmap(args) -> int:
    repo = Path(args.repo).expanduser().resolve()
    specs = repo / "docs" / "specs"
    out_path = repo / "docs" / "roadmap.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    display_name = _repo_display_name(repo)

    buckets: dict[str, list] = {"active": [], "proposed": [], "shipped": []}
    for sd in sorted(specs.glob("*/"), reverse=True) if specs.is_dir() else []:
        if sd.name == "archived":
            continue
        fm = read_frontmatter(sd / "spec.md")
        status = fm.get("status", "proposed")
        if status not in buckets:
            buckets[status] = []
        buckets[status].append((sd.name, fm))

    recent_archived: list[tuple[str, dict]] = []
    archived = specs / "archived"
    if archived.is_dir():
        for sd in sorted(archived.glob("*/"), reverse=True)[:10]:
            fm = read_frontmatter(sd / "spec.md")
            recent_archived.append((sd.name, fm))

    parts = [
        f"# Roadmap — {display_name}\n",
        f"_Auto-regenerated {today()} from `docs/specs/`._\n",
    ]

    def section(title: str, items: list[tuple[str, dict]]) -> str:
        if not items:
            return f"## {title}\n\n_(none)_\n"
        lines = [f"## {title}\n"]
        for name, fm in items:
            pr = f"  →  PR: {fm['pr']}" if fm.get("pr") else ""
            tags = f"  `{fm['tags']}`" if fm.get("tags") else ""
            lines.append(f"- **{name}**  _({fm.get('status','?')})_{tags}{pr}")
        return "\n".join(lines) + "\n"

    parts.append(section("Now (active)", buckets["active"]))
    parts.append(section("Next (proposed)", buckets["proposed"]))
    parts.append(section("Recently shipped", recent_archived))
    out_path.write_text("\n".join(parts))
    print(out_path)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("new", help="create a new spec")
    p.add_argument("slug")
    p.add_argument("--repo", default=".")
    p.add_argument("--from-plan", help="seed tasks.md from a plan file")
    p.add_argument("--tags", default="")
    p.set_defaults(func=cmd_new)

    p = sub.add_parser("list", help="list specs")
    p.add_argument("--repo", default=".")
    p.add_argument("--status", default=None)
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("ship", help="mark a spec shipped + archive it")
    p.add_argument("spec_dir")
    p.add_argument("--pr", default="")
    p.set_defaults(func=cmd_ship)

    p = sub.add_parser("roadmap", help="regenerate docs/roadmap.md")
    p.add_argument("--repo", default=".")
    p.set_defaults(func=cmd_roadmap)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
