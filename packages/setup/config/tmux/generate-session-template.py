#!/usr/bin/env python3
from __future__ import annotations

import difflib
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

TEMPLATES = {
    "node": {
        "windows": [
            {
                "name": "editor",
                "path": ".",
                "panes": [
                    {"command": "clear"},
                    {"command": "git status --short --branch || true", "split": "h"},
                ],
            },
            {"name": "dev", "path": ".", "command": "npm run dev"},
            {"name": "test", "path": ".", "command": "npm test"},
        ]
    },
    "python": {
        "windows": [
            {
                "name": "editor",
                "path": ".",
                "panes": [
                    {"command": "clear"},
                    {"command": "git status --short --branch || true", "split": "h"},
                ],
            },
            {
                "name": "venv",
                "path": ".",
                "command": "python3 -m venv .venv && source .venv/bin/activate",
            },
            {"name": "test", "path": ".", "command": "python3 -m pytest -q"},
        ]
    },
    "docker": {
        "windows": [
            {
                "name": "editor",
                "path": ".",
                "panes": [
                    {"command": "clear"},
                    {"command": "git status --short --branch || true", "split": "h"},
                ],
            },
            {
                "name": "ops",
                "path": ".",
                "command": "docker-compose ps || docker compose ps",
            },
            {
                "name": "logs",
                "path": ".",
                "command": "docker-compose logs --tail=50 -f || docker compose logs --tail=50 -f",
            },
        ]
    },
    "monorepo": {
        "windows": [
            {
                "name": "editor",
                "path": ".",
                "panes": [
                    {"command": "clear"},
                    {"command": "git status --short --branch || true", "split": "h"},
                ],
            },
            {"name": "root", "path": ".", "command": "eza -la --git || ls -la"},
            {"name": "app", "path": ".", "command": "npm run dev"},
            {"name": "test", "path": ".", "command": "npm test"},
        ]
    },
}

USAGE = "Usage: generate-session-template.py [node|python|docker|monorepo|detect|suggest|preview|preview-template|apply|update|force|apply-template] [target-dir] [--yes]"


def detect_template(target_dir: Path) -> str:
    has_package = (target_dir / "package.json").exists()
    has_pyproject = (
        (target_dir / "pyproject.toml").exists()
        or (target_dir / "requirements.txt").exists()
        or (target_dir / "setup.py").exists()
    )
    has_docker = any(
        (target_dir / name).exists()
        for name in (
            "docker-compose.yml",
            "docker-compose.yaml",
            "compose.yml",
            "compose.yaml",
        )
    )
    has_workspace = any(
        (target_dir / name).exists()
        for name in ("turbo.json", "pnpm-workspace.yaml", "nx.json", "lerna.json")
    )
    apps_dir = (target_dir / "apps").is_dir()
    packages_dir = (target_dir / "packages").is_dir()

    if has_workspace or ((apps_dir or packages_dir) and has_package):
        return "monorepo"
    if has_package:
        return "node"
    if has_pyproject:
        return "python"
    if has_docker:
        return "docker"
    return "node"


def render_template(template_name: str) -> str:
    return json.dumps(TEMPLATES[template_name], indent=2) + "\n"


def backup_file(target_file: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = target_file.with_name(f"{target_file.name}.bak.{timestamp}")
    shutil.copy2(target_file, backup)
    return backup


def build_diff(
    template_name: str, target_dir: Path
) -> tuple[Path, str, str, list[str]]:
    target_file = target_dir / ".tmux-session.json"
    new_content = render_template(template_name)
    old_content = target_file.read_text() if target_file.exists() else ""
    diff = list(
        difflib.unified_diff(
            old_content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=str(target_file),
            tofile=f"{target_file} ({template_name})",
        )
    )
    return target_file, old_content, new_content, diff


def preview_template(template_name: str, target_dir: Path) -> int:
    _, _, _, diff = build_diff(template_name, target_dir)
    if diff:
        sys.stdout.writelines(diff)
    else:
        print("No changes.")
    return 0


def write_rendered(
    template_name: str, target_file: Path, content: str, overwrite: bool
) -> int:
    if target_file.exists() and not overwrite:
        print(f"Refusing to overwrite existing file: {target_file}", file=sys.stderr)
        return 2

    backup = None
    if target_file.exists() and overwrite:
        backup = backup_file(target_file)

    target_file.write_text(content)
    if backup:
        print(f"Backed up existing config to {backup}")
    print(f"Wrote {template_name} template to {target_file}")
    return 0


def write_template(template_name: str, target_dir: Path, overwrite: bool) -> int:
    target_file, _, new_content, _ = build_diff(template_name, target_dir)
    return write_rendered(template_name, target_file, new_content, overwrite)


def apply_template(template_name: str, target_dir: Path, assume_yes: bool) -> int:
    target_file, _, new_content, diff = build_diff(template_name, target_dir)
    if diff:
        sys.stdout.writelines(diff)
    else:
        print("No changes.")
        return 0

    if not assume_yes:
        if not sys.stdin.isatty():
            print(
                "Refusing interactive apply without a TTY. Re-run with --yes.",
                file=sys.stderr,
            )
            return 3
        answer = input("\nApply these changes? [y/N] ").strip().lower()
        if answer not in {"y", "yes"}:
            print("Aborted.")
            return 4

    return write_rendered(template_name, target_file, new_content, overwrite=True)


def main() -> int:
    raw_args = sys.argv[1:]
    assume_yes = False
    if "--yes" in raw_args:
        raw_args = [arg for arg in raw_args if arg != "--yes"]
        assume_yes = True

    if not raw_args:
        print(USAGE, file=sys.stderr)
        return 1

    command = raw_args[0]
    target_dir = (
        Path(raw_args[1]).expanduser().resolve() if len(raw_args) > 1 else Path.cwd()
    )
    target_dir.mkdir(parents=True, exist_ok=True)

    if command == "suggest":
        print(detect_template(target_dir))
        return 0

    if command == "detect":
        return write_template(detect_template(target_dir), target_dir, overwrite=False)

    if command == "preview":
        return preview_template(detect_template(target_dir), target_dir)

    if command == "preview-template":
        if len(raw_args) < 3 or raw_args[1] not in TEMPLATES:
            print(
                "Usage: generate-session-template.py preview-template [node|python|docker|monorepo] [target-dir]",
                file=sys.stderr,
            )
            return 1
        template_name = raw_args[1]
        target_dir = (
            Path(raw_args[2]).expanduser().resolve()
            if len(raw_args) > 2
            else Path.cwd()
        )
        target_dir.mkdir(parents=True, exist_ok=True)
        return preview_template(template_name, target_dir)

    if command == "apply":
        return apply_template(detect_template(target_dir), target_dir, assume_yes)

    if command == "apply-template":
        if len(raw_args) < 3 or raw_args[1] not in TEMPLATES:
            print(
                "Usage: generate-session-template.py apply-template [node|python|docker|monorepo] [target-dir] [--yes]",
                file=sys.stderr,
            )
            return 1
        template_name = raw_args[1]
        target_dir = (
            Path(raw_args[2]).expanduser().resolve()
            if len(raw_args) > 2
            else Path.cwd()
        )
        target_dir.mkdir(parents=True, exist_ok=True)
        return apply_template(template_name, target_dir, assume_yes)

    if command == "update":
        return write_template(detect_template(target_dir), target_dir, overwrite=True)

    if command == "force":
        if len(raw_args) < 3 or raw_args[1] not in TEMPLATES:
            print(
                "Usage: generate-session-template.py force [node|python|docker|monorepo] [target-dir] [--yes]",
                file=sys.stderr,
            )
            return 1
        template_name = raw_args[1]
        target_dir = (
            Path(raw_args[2]).expanduser().resolve()
            if len(raw_args) > 2
            else Path.cwd()
        )
        target_dir.mkdir(parents=True, exist_ok=True)
        return write_template(template_name, target_dir, overwrite=True)

    if command not in TEMPLATES:
        print(USAGE, file=sys.stderr)
        return 1

    return write_template(command, target_dir, overwrite=False)


if __name__ == "__main__":
    raise SystemExit(main())
