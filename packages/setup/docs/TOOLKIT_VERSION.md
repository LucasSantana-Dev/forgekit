# Toolkit Version Management

## Overview

The `ai-dev-toolkit-setup` repository bootstraps machines with system packages, shell helpers, and tmux workflows. It consumes canonical content from the companion `ai-dev-toolkit` repository at a pinned semantic version tag.

- **Pinned via**: `TOOLKIT_VERSION` file (currently: v0.17.0)
- **Canonical source**: [LucasSantana-Dev/ai-dev-toolkit](https://github.com/LucasSantana-Dev/ai-dev-toolkit)
- **Why a pin?**: Ensures reproducible, versioned bootstraps. New toolkit features only become available here after a release and pin bump.

## What Gets Pinned

When `ai-dev-toolkit` publishes a release (e.g., v0.12.1), this pin controls:

1. Which **AI tool helper scripts** are installed to `~/.config/ai-dev-toolkit/tools/`
2. Which **shell functions** become available (mcp-health, release automation, etc.)
3. Which **starter skills** are copied to `~/.opencode/skills/`
4. Which **fallback config templates** are available offline

## Helper Commands

Three shell commands manage the toolkit version:

### `toolkit-version-check`

Check for newer stable releases of ai-dev-toolkit.

```bash
toolkit-version-check
```

**Output**:
- Current pinned version
- Latest stable release available
- Action message ("update available", "already current", etc.)

**Use case**: Quick check before deciding to bump.

### `toolkit-version-prepare`

Print a ready-to-use PR summary for a toolkit version bump **without modifying files**.

```bash
toolkit-version-prepare
toolkit-version-prepare --pr-body-file TOOLKIT_BUMP_PR.md
```

**Output**:
- Action message: "prepare toolkit bump"
- Suggested commit message: `chore: bump toolkit version to vX.Y.Z`
- Suggested PR title: `chore: bump toolkit version to vX.Y.Z`
- Full PR body with summary (grouped under ## Summary)
- If `--pr-body-file` is provided, writes the PR body to that file

**Use case**: Craft the PR description offline, review it, then apply the bump.

### `toolkit-version-sync`

Apply the toolkit version bump to the local `TOOLKIT_VERSION` file.

```bash
toolkit-version-sync
```

**Requires**: Network access (queries GitHub API via `gh`)

**Output**:
- Current and latest versions
- "updated to vX.Y.Z" or "already current"
- Modifies `TOOLKIT_VERSION` file if an update is available

**Use case**: Automated bumps in CI, or manual sync when ready.

### `toolkit-version-pr`

Alias for `toolkit-version-prepare` (both support `--pr-body-file`).

## Release-Chain Workflow

This is the typical flow when `ai-dev-toolkit` releases a new version:

1. **Upstream releases** a new tag (e.g., v0.12.1) on [LucasSantana-Dev/ai-dev-toolkit](https://github.com/LucasSantana-Dev/ai-dev-toolkit)

2. **Check for updates**:
   ```bash
   toolkit-version-check
   # Output: latest: v0.12.1, action: update available
   ```

3. **Prepare PR without modifying files**:
   ```bash
   toolkit-version-prepare --pr-body-file TOOLKIT_BUMP_PR.md
   # Writes suggested PR body to TOOLKIT_BUMP_PR.md
   # Prints: commit-message: chore: bump toolkit version to v0.12.1
   ```

4. **Review the generated PR body**:
   ```bash
   cat TOOLKIT_BUMP_PR.md
   ```

5. **Apply the bump** (when ready):
   ```bash
   toolkit-version-sync
   # Output: action: updated to v0.12.1
   ```

6. **Verify the setup still works**:
   ```bash
   bash ./scripts/ci-check.sh
   ```

7. **Commit and push**:
   ```bash
   git add TOOLKIT_VERSION CHANGELOG.md
   git commit -m "chore: bump toolkit version to v0.12.1

   - Pull the latest tagged ai-dev-toolkit release v0.12.1 into setup bootstrap flows.
   - Re-run bash ./scripts/ci-check.sh after updating the pin."
   git push -u origin feature/bump-toolkit-v0.12.1
   ```

8. **Open a PR** referencing the generated PR body

9. **After merge**, the next machine bootstrap will use v0.12.1

## Under the Hood

The helper commands are thin wrappers around `scripts/sync-toolkit-version.py`, which:

- Queries the GitHub API for releases of `LucasSantana-Dev/ai-dev-toolkit`
- Filters for stable releases (ignores drafts and prereleases)
- Compares versions using semantic versioning
- Optionally writes the `TOOLKIT_VERSION` file
- Generates PR bodies with consistent formatting

See `scripts/sync-toolkit-version.py` for implementation details.

## When to Update TOOLKIT_VERSION

- **Always update** when you want to adopt new features from upstream
- **Never update** in the middle of an unrelated feature branch
- **Bundle updates** with an updated `CHANGELOG.md` entry
- **Verify with `ci-check.sh`** before committing

## See Also

- `TOOLKIT_VERSION` — the pinned version (typically in the repo root)
- `CHANGELOG.md` — release notes for this repo
- `OWNERSHIP.md` — which files are setup-owned vs toolkit-sourced
- `TOOLKIT_COMPARISON.md` — detailed responsibility split between the two repos
