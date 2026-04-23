#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

DEFAULT_REPO = "LucasSantana-Dev/ai-dev-toolkit"
TAG_RE = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check for newer tagged ai-dev-toolkit releases and optionally update TOOLKIT_VERSION."
    )
    parser.add_argument(
        "--repo", default=DEFAULT_REPO, help="GitHub repo slug to inspect"
    )
    parser.add_argument(
        "--version-file",
        default=str(Path(__file__).resolve().parents[1] / "TOOLKIT_VERSION"),
        help="Path to the local TOOLKIT_VERSION file",
    )
    parser.add_argument(
        "--releases-file",
        help="Use a local GitHub releases JSON payload instead of gh api (for tests)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Update TOOLKIT_VERSION when a newer stable release exists",
    )
    parser.add_argument(
        "--prepare-pr",
        action="store_true",
        help="Print a ready-to-use PR summary for a toolkit version bump without modifying files",
    )
    parser.add_argument(
        "--pr-body-file",
        help="Optional path to write the generated PR body markdown when using --prepare-pr",
    )
    return parser.parse_args()


def render_pr_prep(current: tuple[int, int, int], latest: tuple[int, int, int]) -> str:
    current_text = format_version(current)
    latest_text = format_version(latest)
    return "\n".join(
        [
            "## Summary",
            f"- Bump TOOLKIT_VERSION from {current_text} to {latest_text}.",
            f"- Pull the latest tagged ai-dev-toolkit release {latest_text} into setup bootstrap flows.",
            "- Re-run bash ./scripts/ci-check.sh after updating the pin.",
        ]
    )


def resolve_optional_path(raw_path: str | None) -> Path | None:
    if raw_path is None:
        return None
    return Path(raw_path).expanduser().resolve()


def write_optional_file(path: Path | None, content: str) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def parse_version(text: str) -> tuple[int, int, int]:
    match = TAG_RE.match(text.strip())
    if not match:
        raise SystemExit(f"Unsupported version format: {text!r}")
    return tuple(int(part) for part in match.groups())


def format_version(version: tuple[int, int, int]) -> str:
    return f"v{version[0]}.{version[1]}.{version[2]}"


def load_releases(args: argparse.Namespace) -> list[dict]:
    if args.releases_file:
        return json.loads(Path(args.releases_file).read_text())

    result = subprocess.run(
        ["gh", "api", f"repos/{args.repo}/releases?per_page=20"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip() or "unknown gh api error"
        raise SystemExit(f"Failed to query GitHub releases: {detail}")
    return json.loads(result.stdout)


def latest_stable_release(releases: list[dict]) -> tuple[int, int, int]:
    versions: list[tuple[int, int, int]] = []
    for release in releases:
        if release.get("draft") or release.get("prerelease"):
            continue
        tag_name = release.get("tag_name")
        if not isinstance(tag_name, str) or not TAG_RE.match(tag_name):
            continue
        versions.append(parse_version(tag_name))

    if not versions:
        raise SystemExit("No stable semver release tags found")
    return max(versions)


def main() -> int:
    args = parse_args()
    if args.apply and args.prepare_pr:
        raise SystemExit("Choose only one of --apply or --prepare-pr")

    pr_body_path = resolve_optional_path(args.pr_body_file)
    if pr_body_path is not None and not args.prepare_pr:
        raise SystemExit("--pr-body-file requires --prepare-pr")

    version_path = Path(args.version_file).resolve()
    current_raw = version_path.read_text().strip()
    current = parse_version(current_raw)
    latest = latest_stable_release(load_releases(args))

    print(f"repo: {args.repo}")
    print(f"current: {format_version(current)}")
    print(f"latest: {format_version(latest)}")

    if latest > current:
        if args.apply:
            version_path.write_text(format_version(latest)[1:] + "\n")
            print(f"action: updated to {format_version(latest)}")
        elif args.prepare_pr:
            pr_body = render_pr_prep(current, latest)
            write_optional_file(pr_body_path, pr_body)
            print("action: prepare toolkit bump")
            print(
                f"commit-message: chore: bump toolkit version to {format_version(latest)}"
            )
            print(f"pr-title: chore: bump toolkit version to {format_version(latest)}")
            if pr_body_path is not None:
                print(f"pr-body-file: {pr_body_path}")
            print(pr_body)
        else:
            print("action: update available")
    else:
        print("action: already current")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
