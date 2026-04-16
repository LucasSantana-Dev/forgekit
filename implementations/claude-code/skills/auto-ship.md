---
name: auto-ship
description: Hand a ready PR off to GitHub auto-merge + background watcher, so the session doesn't block on CI. Use when a PR has CI green pending OR is one rebase away from green. Replaces the "schedule wakeup every 5min to recheck CI" anti-pattern.
triggers:
  - ship PR
  - auto merge
  - hand off to CI
---

# auto-ship

GitHub has native auto-merge. Use it. Stop scheduling wakeups to poll.

## The anti-pattern

```
1. Push PR
2. ScheduleWakeup(480)   ← 8min later
3. On wakeup: check CI → still pending → ScheduleWakeup(300)
4. On wakeup: still pending → ScheduleWakeup(180)
5. ...6 wakeups later, finally merge
```

Every wakeup burns a turn + a compaction cycle. Over 6 wakeups that's half your runway wasted on polling.

## The pattern — `gh pr merge --auto`

```bash
gh pr merge <N> --repo <owner/repo> --squash --delete-branch --auto
```

GitHub will merge the PR **automatically** the moment all required checks pass and the branch is up to date. No wakeup needed.

If you need to do work after merge (version bump, tag, redeploy), launch it as a background task that polls the PR `state`:

```bash
# Fire-and-forget: polls until merged (or 30min timeout), then runs next step
nohup bash -c '
  while [ $(GH_PAGER=cat gh pr view <N> --repo <R> --json state --jq .state) != "MERGED" ]; do
    sleep 30
    [ $SECONDS -gt 1800 ] && exit 1
  done
  # downstream work — tag, deploy, etc.
  cd /path && git tag vX.Y.Z && git push origin vX.Y.Z
  ssh server "cd /srv && git pull && docker compose up -d --build"
' > /tmp/auto-ship-<N>.log 2>&1 &
```

## Gotchas

- `--auto` requires the repo to have auto-merge enabled in settings. Enable via `gh api -X PATCH /repos/<o>/<r> -f allow_auto_merge=true`.
- If CI goes red after `--auto` is set, auto-merge **cancels**. You must re-queue after the fix pushes.
- Rebasing a branch with `gh pr update-branch` preserves the auto-merge queue — no need to re-enable.
- Branch protection `strict: true` means a new merge to base cancels the queued auto-merge on every open PR. Re-queue with `--auto`.

## When to `--auto` vs wait manually

**Use `--auto`**: PR is CI-green-pending and you have other work to do.

**Wait manually**: PR has failing checks and you need to fix them yourself (don't queue a broken PR).

## Chaining merges

For a stack of dependent PRs, enable `--auto` on **all of them**. GitHub serializes the merges correctly — as each merges, the next one's base updates and it re-evaluates.

```bash
for PR in 649 650 651; do
  gh pr merge $PR --repo $R --squash --delete-branch --auto
done
```

## Verifying the queue

```bash
gh pr view <N> --repo <R> --json autoMergeRequest --jq .autoMergeRequest
```

If `null`, auto-merge wasn't set. If `{...}`, it's queued.

## Integration with ci-watch

`ci-watch` is for *blocking* wait (when you need to act on the failure yourself). `auto-ship` is for *hands-off* wait. Don't combine them — pick one per PR.

- **ci-watch** when: fix is not yet in, need to know the failure to iterate.
- **auto-ship** when: fix is in, just waiting for CI + merge. Walk away.
