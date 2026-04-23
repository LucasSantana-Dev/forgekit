---
name: toolkit-sync
description: Bump the ai-dev-toolkit version pin in a downstream consumer repo and verify the sync path
triggers:
  - bump toolkit
  - sync toolkit
  - update toolkit version
  - toolkit stale
---

# Toolkit Sync

Update the pinned ai-dev-toolkit version in a consumer repo and verify the fetch path works.

## Steps

1. **Check current pin** — read `TOOLKIT_VERSION` file
2. **Find latest release** — `gh release list -R Forge-Space/ai-dev-toolkit -L 1`
3. **Update pin** — write new version to `TOOLKIT_VERSION`
4. **Test fetch** — run the setup script that downloads the toolkit tarball
5. **Verify** — run `doctor.sh` or equivalent to confirm the new version stamp
6. **Commit** — `chore: bump toolkit to vX.Y.Z`

## Output

```text
Previous: v<old>
Updated:  v<new>
Fetch:    OK | FAIL
Doctor:   OK | FAIL
```

## Rules

- Stop if the new release tag does not exist on GitHub
- Stop if the fetch path fails after update
- Never skip the verification step
- Open a PR for the version bump, do not push directly to main
