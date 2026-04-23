#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

PREFS_PATH = Path.home() / ".config/tmux/repo-preferences.json"
VALID_TEMPLATES = {"node", "python", "docker", "monorepo"}


def load_prefs() -> dict:
    if not PREFS_PATH.exists():
        return {"repos": {}}
    return json.loads(PREFS_PATH.read_text())


def save_prefs(data: dict) -> None:
    PREFS_PATH.parent.mkdir(parents=True, exist_ok=True)
    PREFS_PATH.write_text(json.dumps(data, indent=2) + "\n")


def repo_key(repo: str) -> str:
    return str(Path(repo).expanduser().resolve())


def cmd_get(repo: str) -> int:
    data = load_prefs()
    key = repo_key(repo)
    print(json.dumps(data.get("repos", {}).get(key, {}), indent=2))
    return 0


def cmd_set(repo: str, template: str, auto_apply: str) -> int:
    if template not in VALID_TEMPLATES:
        print(f"Invalid template: {template}", file=sys.stderr)
        return 1
    auto_apply_bool = auto_apply.lower() in {"1", "true", "yes", "on"}
    data = load_prefs()
    data.setdefault("repos", {})[repo_key(repo)] = {
        "template": template,
        "auto_apply": auto_apply_bool,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    save_prefs(data)
    return 0


def cmd_record(repo: str, template: str, action: str) -> int:
    data = load_prefs()
    key = repo_key(repo)
    entry = data.setdefault("repos", {}).setdefault(key, {})
    if template:
        if template not in VALID_TEMPLATES:
            print(f"Invalid template: {template}", file=sys.stderr)
            return 1
        entry["template"] = template
    entry["last_action"] = action
    entry["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_prefs(data)
    return 0


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("Usage: repo-preferences.py [get|set|record] ...", file=sys.stderr)
        return 1

    command = args[0]
    if command == "get" and len(args) >= 2:
        return cmd_get(args[1])
    if command == "set" and len(args) >= 4:
        return cmd_set(args[1], args[2], args[3])
    if command == "record" and len(args) >= 4:
        return cmd_record(args[1], args[2], args[3])

    print("Usage: repo-preferences.py [get|set|record] ...", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
