#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path


@dataclass
class VersionSurface:
    kind: str
    path: Path
    version: str


SEMVER_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")
CONVENTIONAL_RE = re.compile(
    r"^(feat|fix|docs|refactor|test|ci|build|perf|chore)(\([^)]+\))?!?:\s*(.+)$"
)
SECTION_TITLES = {
    "feat": "Features",
    "fix": "Fixes",
    "docs": "Documentation",
    "refactor": "Refactors",
    "test": "Tests",
    "ci": "CI",
    "build": "Build",
    "perf": "Performance",
    "chore": "Chores",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Plan or execute a small git release workflow"
    )
    parser.add_argument("--repo", default=".", help="Repository root to inspect")
    parser.add_argument(
        "--level",
        choices=["patch", "minor", "major", "tag-only"],
        default="patch",
        help="Release scope to plan or execute",
    )
    parser.add_argument("--tag", help="Explicit tag to use for tag-only releases")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the release plan without changing files",
    )
    parser.add_argument(
        "--github-release",
        action="store_true",
        help="Create a GitHub release after tagging when gh is available",
    )
    parser.add_argument(
        "--notes-file",
        help="Write generated release notes to this path (repo-relative paths are supported)",
    )
    parser.add_argument(
        "--changelog",
        action="store_true",
        help="Update an existing CHANGELOG.md with the generated release notes",
    )
    return parser.parse_args()


def run(
    cmd: list[str], cwd: Path, check: bool = True
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, check=check)


def detect_version_surface(repo: Path) -> VersionSurface | None:
    version_file = repo / "VERSION"
    if version_file.exists():
        return VersionSurface("VERSION", version_file, version_file.read_text().strip())

    package_json = repo / "package.json"
    if package_json.exists():
        data = json.loads(package_json.read_text())
        version = data.get("version")
        if isinstance(version, str):
            return VersionSurface("package.json", package_json, version)

    pyproject = repo / "pyproject.toml"
    if pyproject.exists():
        match = re.search(r'^version\s*=\s*"([^"]+)"', pyproject.read_text(), re.M)
        if match:
            return VersionSurface("pyproject.toml", pyproject, match.group(1))

    return None


def bump(version: str, level: str) -> str:
    match = SEMVER_RE.match(version)
    if not match:
        raise SystemExit(f"Unsupported version format: {version}")

    major, minor, patch = (int(group) for group in match.groups())
    if level == "patch":
        patch += 1
    elif level == "minor":
        minor += 1
        patch = 0
    elif level == "major":
        major += 1
        minor = 0
        patch = 0
    return f"{major}.{minor}.{patch}"


def update_version_surface(surface: VersionSurface, next_version: str) -> None:
    if surface.kind == "VERSION":
        surface.path.write_text(next_version + "\n")
        return

    if surface.kind == "package.json":
        data = json.loads(surface.path.read_text())
        data["version"] = next_version
        surface.path.write_text(json.dumps(data, indent=2) + "\n")
        return

    if surface.kind == "pyproject.toml":
        text = surface.path.read_text()
        updated = re.sub(
            r'(^version\s*=\s*")([^"]+)(")',
            rf"\g<1>{next_version}\g<3>",
            text,
            count=1,
            flags=re.M,
        )
        surface.path.write_text(updated)
        return

    raise SystemExit(f"Unsupported version surface: {surface.kind}")


def ensure_git_clean(repo: Path) -> None:
    status = run(["git", "status", "--porcelain"], cwd=repo)
    if status.stdout.strip():
        raise SystemExit("Working tree must be clean before running release helper")


def ensure_git_identity(repo: Path) -> None:
    for key in ("user.name", "user.email"):
        result = run(["git", "config", key], cwd=repo, check=False)
        if result.returncode != 0 or not result.stdout.strip():
            raise SystemExit(f"Missing git config {key} in {repo}")


def current_head(repo: Path) -> str:
    return run(["git", "rev-parse", "--short", "HEAD"], cwd=repo).stdout.strip()


def latest_tag(repo: Path) -> str | None:
    result = run(["git", "describe", "--tags", "--abbrev=0"], cwd=repo, check=False)
    if result.returncode != 0:
        return None
    return result.stdout.strip() or None


def commit_subjects(repo: Path, since_tag: str | None) -> list[str]:
    revision_range = f"{since_tag}..HEAD" if since_tag else "HEAD"
    result = run(["git", "log", revision_range, "--pretty=format:%s"], cwd=repo)
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def render_release_notes(subjects: list[str], since_tag: str | None) -> str:
    sections: dict[str, list[str]] = {title: [] for title in SECTION_TITLES.values()}
    other_changes: list[str] = []

    for subject in subjects:
        match = CONVENTIONAL_RE.match(subject)
        if not match:
            other_changes.append(subject)
            continue

        kind = match.group(1)
        message = match.group(3)
        sections[SECTION_TITLES[kind]].append(message)

    lines = ["# Release Notes", ""]
    if since_tag:
        lines.append(f"Changes since `{since_tag}`")
    else:
        lines.append("Changes since repository start")
    lines.append("")

    for title, entries in sections.items():
        if not entries:
            continue
        lines.append(f"## {title}")
        for entry in entries:
            lines.append(f"- {entry}")
        lines.append("")

    if other_changes:
        lines.append("## Other Changes")
        for entry in other_changes:
            lines.append(f"- {entry}")
        lines.append("")

    if lines[-1] != "":
        lines.append("")
    return "\n".join(lines)


def resolve_notes_path(repo: Path, raw_path: str | None) -> Path | None:
    if raw_path is None:
        return None
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = repo / candidate
    return candidate.resolve()


def is_repo_relative(repo: Path, path: Path) -> bool:
    try:
        path.relative_to(repo)
        return True
    except ValueError:
        return False


def write_notes(notes_path: Path | None, notes: str) -> None:
    if notes_path is None:
        return
    notes_path.parent.mkdir(parents=True, exist_ok=True)
    notes_path.write_text(notes)


def detect_changelog(repo: Path) -> Path | None:
    changelog_path = repo / "CHANGELOG.md"
    if changelog_path.exists():
        return changelog_path
    return None


def validate_changelog_structure(changelog_path: Path) -> None:
    text = changelog_path.read_text()
    if not re.search(r"^##\s+\[?Unreleased\]?\s*$", text, re.M):
        raise SystemExit(
            "Unsupported CHANGELOG.md format: expected a '## [Unreleased]' section"
        )


def version_label(next_version: str | None, tag: str) -> str:
    if next_version is not None:
        return next_version
    return tag[1:] if tag.startswith("v") else tag


def render_changelog_section(version: str, notes: str) -> str:
    lines = [f"## [{version}] - {date.today().isoformat()}", ""]

    for line in notes.splitlines():
        if not line or line == "# Release Notes" or line.startswith("Changes since "):
            continue
        if line.startswith("## "):
            lines.append(f"### {line[3:]}")
            continue
        lines.append(line)

    lines.append("")
    return "\n".join(lines)


def update_changelog(changelog_path: Path, version: str, notes: str) -> None:
    text = changelog_path.read_text()
    entry = render_changelog_section(version, notes)
    lines = text.splitlines()

    unreleased_index = next(
        (
            index
            for index, line in enumerate(lines)
            if re.match(r"^##\s+\[?Unreleased\]?\s*$", line)
        ),
        None,
    )

    if unreleased_index is not None:
        insert_at = next(
            (
                index
                for index in range(unreleased_index + 1, len(lines))
                if lines[index].startswith("## ")
            ),
            len(lines),
        )
    else:
        insert_at = next(
            (index for index, line in enumerate(lines) if line.startswith("## ")),
            len(lines),
        )

    entry_lines = entry.rstrip().splitlines()
    new_lines = lines[:insert_at]
    if new_lines and new_lines[-1] != "":
        new_lines.append("")
    new_lines.extend(entry_lines)
    if insert_at < len(lines) and lines[insert_at] != "":
        new_lines.append("")
    new_lines.extend(lines[insert_at:])

    changelog_path.write_text("\n".join(new_lines).rstrip() + "\n")


def create_release_commit_and_tag(
    repo: Path, tag: str, changed_paths: list[Path]
) -> None:
    rel_paths = [str(path.relative_to(repo)) for path in changed_paths]
    run(["git", "add", *rel_paths], cwd=repo)
    run(["git", "commit", "-m", f"chore: release {tag}"], cwd=repo)
    run(["git", "tag", "-a", tag, "-m", f"Release {tag}"], cwd=repo)


def maybe_create_github_release(repo: Path, tag: str, notes_path: Path) -> None:
    ensure_gh_cli_available()
    ensure_gh_authenticated(repo)
    result = run(
        [
            "gh",
            "release",
            "create",
            tag,
            "--title",
            tag,
            "--notes-file",
            str(notes_path),
        ],
        cwd=repo,
        check=False,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip() or "unknown gh release error"
        raise SystemExit(f"gh release create failed: {detail}")


def shutil_which(cmd: str) -> str | None:
    from shutil import which

    return which(cmd)


def ensure_gh_cli_available() -> None:
    if not shutil_which("gh"):
        raise SystemExit("gh CLI not found for --github-release")


def ensure_gh_authenticated(repo: Path) -> None:
    status = run(["gh", "auth", "status"], cwd=repo, check=False)
    if status.returncode != 0:
        raise SystemExit("gh CLI is not authenticated for --github-release")


def print_plan(
    repo: Path,
    level: str,
    surface: VersionSurface | None,
    next_version: str | None,
    tag: str,
    dry_run: bool,
    github_release: bool,
    notes_path: Path | None,
    changelog_path: Path | None,
    notes_count: int,
    since_tag: str | None,
) -> None:
    print("Release helper")
    print(f"repo: {repo}")
    print(f"level: {level}")
    print(f"mode: {'dry-run' if dry_run else 'apply'}")
    if surface is None:
        print("version source: none")
    else:
        print(f"version source: {surface.kind} ({surface.path.name})")
        print(f"current version: {surface.version}")
    if next_version is not None:
        print(f"next version: {next_version}")
    print(f"tag: {tag}")
    print(f"notes commits: {notes_count}")
    if since_tag:
        print(f"notes base tag: {since_tag}")
    if notes_path is not None:
        print(f"notes file: {notes_path}")
    if changelog_path is not None:
        print(f"changelog: {changelog_path}")
    if github_release:
        availability = "gh cli available" if shutil_which("gh") else "gh cli missing"
        print(f"github release: requested ({availability})")


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).resolve()
    if not repo.exists():
        raise SystemExit(f"Missing repo: {repo}")

    surface = detect_version_surface(repo)
    next_version: str | None = None
    since_tag = latest_tag(repo)

    if args.level == "tag-only":
        if not args.tag:
            raise SystemExit("--tag is required when --level tag-only")
        tag = args.tag
    else:
        if surface is None:
            raise SystemExit(
                "No VERSION, package.json, or pyproject.toml found for versioned release"
            )
        next_version = bump(surface.version, args.level)
        tag = args.tag or f"v{next_version}"

    if args.github_release:
        ensure_gh_cli_available()

    notes_path = resolve_notes_path(repo, args.notes_file)
    changelog_path = detect_changelog(repo) if args.changelog else None
    if args.changelog and changelog_path is None:
        raise SystemExit("CHANGELOG.md not found for --changelog")
    if changelog_path is not None:
        validate_changelog_structure(changelog_path)
    subjects = commit_subjects(repo, since_tag)
    notes = render_release_notes(subjects, since_tag)
    if args.dry_run:
        write_notes(notes_path, notes)

    print_plan(
        repo,
        args.level,
        surface,
        next_version,
        tag,
        args.dry_run,
        args.github_release,
        notes_path,
        changelog_path,
        len(subjects),
        since_tag,
    )
    if args.dry_run:
        return 0

    ensure_git_clean(repo)
    ensure_git_identity(repo)

    changed_paths: list[Path] = []
    if next_version is not None and surface is not None:
        update_version_surface(surface, next_version)
        changed_paths.append(surface.path)

    if changelog_path is not None:
        update_changelog(changelog_path, version_label(next_version, tag), notes)
        changed_paths.append(changelog_path)

    temp_notes_file: Path | None = None
    if notes_path is not None:
        write_notes(notes_path, notes)
        if is_repo_relative(repo, notes_path):
            changed_paths.append(notes_path)
    elif args.github_release:
        temp_handle = tempfile.NamedTemporaryFile("w", delete=False, suffix=".md")
        temp_handle.write(notes)
        temp_handle.close()
        temp_notes_file = Path(temp_handle.name)

    if changed_paths:
        create_release_commit_and_tag(repo, tag, changed_paths)
    else:
        run(["git", "tag", "-a", tag, "-m", f"Release {tag}"], cwd=repo)

    if args.github_release:
        github_notes_path = notes_path or temp_notes_file
        if github_notes_path is None:
            raise SystemExit("Missing generated notes file for --github-release")
        maybe_create_github_release(repo, tag, github_notes_path)

    if temp_notes_file is not None and temp_notes_file.exists():
        temp_notes_file.unlink()

    print(f"released from HEAD {current_head(repo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
