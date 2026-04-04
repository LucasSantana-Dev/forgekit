#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass
class VersionSurface:
    kind: str
    path: Path
    version: str


SEMVER_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")


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


def create_release_commit_and_tag(
    repo: Path, tag: str, changed_paths: list[Path]
) -> None:
    rel_paths = [str(path.relative_to(repo)) for path in changed_paths]
    run(["git", "add", *rel_paths], cwd=repo)
    run(["git", "commit", "-m", f"chore: release {tag}"], cwd=repo)
    run(["git", "tag", "-a", tag, "-m", f"Release {tag}"], cwd=repo)


def maybe_create_github_release(repo: Path, tag: str) -> None:
    if not shutil_which("gh"):
        raise SystemExit("gh CLI not found for --github-release")
    run(["gh", "release", "create", tag, "--generate-notes", "--title", tag], cwd=repo)


def shutil_which(cmd: str) -> str | None:
    from shutil import which

    return which(cmd)


def print_plan(
    repo: Path,
    level: str,
    surface: VersionSurface | None,
    next_version: str | None,
    tag: str,
    dry_run: bool,
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


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).resolve()
    if not repo.exists():
        raise SystemExit(f"Missing repo: {repo}")

    surface = detect_version_surface(repo)
    next_version: str | None = None

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

    print_plan(repo, args.level, surface, next_version, tag, args.dry_run)
    if args.dry_run:
        return 0

    ensure_git_clean(repo)
    ensure_git_identity(repo)

    changed_paths: list[Path] = []
    if next_version is not None and surface is not None:
        update_version_surface(surface, next_version)
        changed_paths.append(surface.path)

    if changed_paths:
        create_release_commit_and_tag(repo, tag, changed_paths)
    else:
        run(["git", "tag", "-a", tag, "-m", f"Release {tag}"], cwd=repo)

    if args.github_release:
        maybe_create_github_release(repo, tag)

    print(f"released from HEAD {current_head(repo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
