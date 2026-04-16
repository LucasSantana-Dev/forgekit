---
name: prod-rebuild
description: SSH rebuild Lucky services + detached Docker watcher. Pulls main, kicks off background build, returns immediately with ETA. No session blocking on 25min Docker rebuilds.
type: skill
triggers:
  - rebuild production
  - rebuild Lucky
  - prod rebuild
  - docker rebuild
---

# prod-rebuild

Deploy to `server-do-luk` without blocking the session. Build runs in nohup; watcher restarts containers and verifies version.

## When to use

- Deploying Lucky bot / backend / frontend to production
- Main branch has fresh commits (version bump, bug fixes, features)
- Need containers restarted but session can't wait 20–30 min for Docker builds

## When NOT to use

- Rolling back (use manual `git checkout <sha>` on server first)
- Emergency hotfix requires immediate restart (SSH directly instead)
- Server is down or unreachable (verify network first)

## Usage

```bash
prod-rebuild bot backend frontend
prod-rebuild  # defaults to bot backend frontend
prod-rebuild bot --no-cache
```

## Script behavior

1. SSH to `server-do-luk`
2. `git checkout main && git pull` (discard local changes)
3. Kicks off `nohup docker compose build --build-arg COMMIT_SHA=... $SERVICES > /tmp/lucky-build-<ts>.log 2>&1 &`
4. Returns immediately: "Rebuild queued, restart will complete in ~25min, bot version will be X.Y.Z"
5. **Detached watcher** (background bash loop):
   - Polls build process until completion
   - `docker rm -f $SERVICES && docker compose up -d $SERVICES`
   - Waits 10s for startup
   - Verifies `/app/package.json` version matches current main
   - Logs completion to same file

## Rules

- **No session wait**: Script returns in <2s; build completes in bg
- **Idempotent builds**: `docker compose build` skips layers; only rebuilds changed stages
- **Version verification**: Confirms restart succeeded by checking /app/package.json version
- **Log file**: `/tmp/lucky-build-<sha>.log` persists; SSH to server to tail if needed

## Related skills

- `version-bump` — update version before rebuilding
- `lucky-deploy` — high-level deploy orchestration (calls this internally)
