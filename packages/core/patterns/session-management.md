# Session Management

> A clean workspace is a fast workspace. Automate the cleanup.

## The Problem

After a week of work across 8 projects, you have 30+ sessions. Most are stale. Switching between them is slow. Finding the one with your in-progress work takes scrolling and guessing.

## The Pattern

### Session Lifecycle

```
Active  →  Idle  →  Stale  →  Archived/Deleted
  ↑          |
  └──────────┘  (resumed)
```

**Active**: Message sent in the last 30 minutes
**Idle**: No activity for 30min-2h
**Stale**: No activity for 2h+
**Archived**: Deleted (no uncommitted changes) or compacted (has changes)

### Auto-Cleanup Rules

| Condition | Action |
|-----------|--------|
| >24h old, no file changes | Delete |
| >2h idle, has file changes | Tag `[WIP]` |
| >3 sessions per project | Delete oldest empty ones |
| Session becomes active | Remove status tags |

### Status Prefixes

Tag session titles so you can scan the sidebar instantly:

| Prefix | Meaning |
|--------|---------|
| (none) | Active — currently being worked on |
| `[IDLE]` | Inactive, no uncommitted changes |
| `[WIP]` | Inactive, has uncommitted changes — don't delete |

### Performance

The biggest session performance killer is **message history size**. A session with 200+ messages renders slowly in any tool. Mitigate:

1. **Auto-compact** idle sessions (summarize message history)
2. **Limit sessions per project** (fewer to render)
3. **Start fresh** for new tasks instead of reusing bloated sessions

### Resume After Restart

When the tool restarts, sessions with pending work should auto-resume. Track:
- Pending todos at idle time → save to state file
- On restart → scan state files → re-prompt sessions with pending work

## Implementation

These patterns can be implemented as:
- **Plugins** (OpenCode, Cursor extensions)
- **Shell scripts** (cron-based cleanup via CLI)
- **Discipline** (manual cleanup habit — delete sessions when done)

### Reference Implementation

See: [`implementations/opencode/plugin/`](../implementations/opencode/plugin/)
- `session-manager.ts` — auto-cleanup and status tagging
- `session-resume.ts` — persist and restore interrupted work
- `perf-optimizer.ts` — auto-compact for faster switching
