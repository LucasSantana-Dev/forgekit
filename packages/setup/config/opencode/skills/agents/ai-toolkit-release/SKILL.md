---
name: ai-toolkit-release
description: Ship validated changes with repeatable release evidence. Use when work is ready and you need to bump a version, update changelog or release notes, tag the repo, create a GitHub release, or publish artifacts without inventing the release flow.
metadata:
  owner: global-agents
  tier: contextual
  canonical_source: ~/.opencode/skills/agents/ai-toolkit-release/SKILL.md
---

## Use When

- Verification already passed and the remaining work is release preparation.
- You need a small, repeatable flow for version bump, changelog, tag, release notes, or publish.
- You want release evidence instead of manual, one-off release steps.

## Inputs / Prereqs

- Repository root.
- Installed `release.py` helper from the shared setup.
- Existing version source if present (`package.json`, `pyproject.toml`, `VERSION`, tags, or release docs).
- GitHub access for tags or releases.
- Registry auth only if the repo actually publishes artifacts.

## Workflow

1. Run `release-plan --repo /path/to/repo --level patch|minor|major --notes-file RELEASE_NOTES.md` to inspect the detected version source, next tag, and generated notes before changing anything.
2. Refuse to continue if verification has not already passed or the release target is ambiguous.
3. If a GitHub Release is required, use `release-plan-github` first so the helper validates `gh` CLI availability before any mutation.
4. Execute `release-patch`, `release-minor`, `release-major`, `release-tag --tag vX.Y.Z`, or the matching `*-github` wrapper in the target repo, and pass `--notes-file` when you want reusable markdown output.
5. Let the helper update only supported version sources (`VERSION`, `package.json`, or `pyproject.toml`), generate reusable release notes, create the annotated tag, and create the GitHub release only after `gh auth status` succeeds.
6. Report the final release state: version source, notes file, tag, and any skipped GitHub release or publish steps with reasons.

## Outputs / Evidence

- Release artifacts updated.
- Exact version and tag created.
- Commands run for changelog, tag, GitHub release, and publish.
- Explicit blocker list when auth, version source, or verification is missing.

## Failure / Stop Conditions

- Do not invent a version file, changelog process, or registry target that the repo does not use.
- Do not publish artifacts without auth or explicit release intent.
- Do not claim release completion without tag or release evidence.
