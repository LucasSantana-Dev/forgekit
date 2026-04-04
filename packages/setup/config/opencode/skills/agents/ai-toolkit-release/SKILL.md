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

1. Run `release-plan --repo /path/to/repo --level patch|minor|major` to inspect the detected version source and next tag before changing anything.
2. Refuse to continue if verification has not already passed or the release target is ambiguous.
3. Execute `release-patch`, `release-minor`, `release-major`, or `release-tag --tag vX.Y.Z` in the target repo.
4. Let the helper update only supported version sources (`VERSION`, `package.json`, or `pyproject.toml`) and create the annotated tag.
5. Report the final release state: version source, tag, and any skipped GitHub release or publish steps with reasons.

## Outputs / Evidence

- Release artifacts updated.
- Exact version and tag created.
- Commands run for changelog, tag, GitHub release, and publish.
- Explicit blocker list when auth, version source, or verification is missing.

## Failure / Stop Conditions

- Do not invent a version file, changelog process, or registry target that the repo does not use.
- Do not publish artifacts without auth or explicit release intent.
- Do not claim release completion without tag or release evidence.
