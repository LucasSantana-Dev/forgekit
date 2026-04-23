---
name: version-bump
description: Monorepo version bump + changelog promotion + PR + auto-merge. Takes NEXT_VERSION arg, bumps root + workspace package.json files, promotes [Unreleased] in CHANGELOG.md, commits, pushes, creates PR, and queues auto-merge in one go.
type: skill
triggers:
  - version bump
  - bump version
  - release version
  - next release
---

# version-bump

Replaces the 6-step manual version bump flow (sed + CHANGELOG edit + commit + push + PR + merge) with one command.

## When to use

- Releasing a new version of a monorepo (Lucky, Forge projects, etc.)
- npm workspaces structure with root package.json + packages/*/package.json
- CHANGELOG.md with [Unreleased] section to promote

## When NOT to use

- Single-file package.json (use `npm version` directly)
- Git tags already exist for the target version (use `--force` flag or manual cleanup)
- CHANGELOG.md not present or differently structured (edit by hand first)

## Usage

```bash
version-bump 2.6.131
version-bump 3.0.0 "Added: new autoplay system, Fixed: memory leaks in cache"
version-bump 1.2.0 --no-auto-merge  # creates PR but doesn't auto-merge
```

## Script behavior

1. Checks out main, pulls latest
2. Creates branch `chore/bump-$NEXT_VERSION`
3. Updates version in root + all workspace `package.json` files
4. Promotes `[Unreleased]` to `[$NEXT_VERSION] - YYYY-MM-DD` in CHANGELOG.md
5. Commits + pushes (no hooks)
6. Creates PR via `gh pr create`
7. Queues auto-merge via `gh pr merge --auto --squash --delete-branch`
8. Prints "Bumped to $NEXT_VERSION via PR #N — auto-merge queued"

## Rules

- **Safety**: Verifies no existing tag for NEXT_VERSION before proceeding
- **Offline**: Works without CI green (auto-merge will kick in when green)
- **Reversible**: PR is open for review before merge; can close if version is wrong
- **Monorepo**: Detects npm workspaces from root package.json and updates all

## Related skills

- `auto-ship` — hand off ready PRs to CI without wakeups
- `changelog-update` — edit CHANGELOG.md manually (use this if structure is custom)
