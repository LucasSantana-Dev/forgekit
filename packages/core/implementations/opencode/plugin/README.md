# OpenCode Plugins

## Task Orchestrator (`orchestrator.ts`)

Centralized task backlog with automatic dispatch — the brain that manages what gets worked on, when, and where.

### The Problem

Manually opening each session and pasting "continue with next priorities" is repetitive. You're acting as the scheduler when the machine should do it.

### How It Works

```
/plan  →  Analyzes repos, creates prioritized task backlog
           ↓
orchestrator  →  Every 60s, picks next "ready" task
           ↓
         Creates new session for the task's project directory
           ↓
         Sends detailed prompt with task description
           ↓
         Monitors session → marks task "done" when idle + todos complete
           ↓
         Picks up next task automatically
```

### Commands

| Command | What it does |
|---------|-------------|
| `/plan` | Analyze projects, create execution plan with prioritized tasks |
| `/backlog` | Show current task status (in_progress, ready, backlog, done) |
| `/next` | Manually trigger dispatch of next ready task |

### Task Schema

Tasks are stored in `~/.local/share/opencode/orchestrator/backlog.json`:

```json
{
  "tasks": [
    {
      "id": "task_abc123",
      "title": "Add rate limiting to API routes",
      "description": "Detailed instructions for the agent...",
      "directory": "/path/to/project",
      "priority": "high",
      "status": "ready",
      "agent": "architect",
      "tags": ["security", "api"]
    }
  ],
  "version": 1
}
```

### Task Lifecycle

```
backlog → ready → in_progress → done
                       ↓
                    blocked
```

- **backlog**: Planned but waiting for dependencies
- **ready**: Can be dispatched immediately
- **in_progress**: Assigned to a session, agent is working
- **done**: Session went idle, all todos completed
- **blocked**: Session errored or was deleted

### Configuration

```typescript
const MAX_CONCURRENT = 2        // max sessions working at once
const POLL_INTERVAL_MS = 60000  // check every 60s
```

### Plans (Sequential Tasks)

Use `/plan` and the orchestrator supports parent-child task relationships. Child tasks start as "backlog" and get promoted to "ready" as their predecessors complete.

### Install

```bash
cp opencode/plugin/orchestrator.ts ~/.config/opencode/plugin/
```

---

## Session Resume (`session-resume.ts`)

Automatically resumes interrupted sessions after OpenCode restarts.

When you restart OpenCode, sessions with pending tasks pick up where they left off — no need to manually re-prompt each one.

### How it works

1. **On idle**: Saves each session's pending todos and last prompt to `~/.local/share/opencode/session-state/`
2. **On startup** (8s delay): Scans for sessions with saved state, checks if they're idle, and sends a resume prompt with their pending task list
3. **On new message**: Tracks the last user prompt per session
4. **On session delete**: Cleans up the state file

### Behavior

- Only sessions with pending/in-progress todos are saved
- State files older than 48h are automatically discarded
- Sessions that no longer exist are cleaned up
- Resume uses `promptAsync` so multiple sessions can resume in parallel
- State files are deleted after successful resume

### Install

```bash
cp opencode/plugin/session-resume.ts ~/.config/opencode/plugin/
```

## Session Manager (`session-manager.ts`)

Auto-manages OpenCode sessions to keep the sidebar clean across multiple projects.

| Trigger | Action |
|---------|--------|
| Every 30 min + startup | Deletes sessions >24h old with no file changes |
| Every 30 min | Keeps max 3 sessions per project, deletes oldest empty ones |
| Session goes idle | Prefixes title with `[IDLE]` or `[WIP]` |
| Session becomes active | Removes status prefix |

### Install

```bash
cp opencode/plugin/session-manager.ts ~/.config/opencode/plugin/
```

### Configuration

Edit the constants at the top of `session-manager.ts`:

```typescript
const IDLE_THRESHOLD_MS = 2 * 60 * 60 * 1000     // 2h — when to mark [IDLE]
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000   // 24h — when to auto-delete
const MAX_SESSIONS_PER_PROJECT = 3                 // max sessions kept per project
const AUTO_CLEAN_INTERVAL_MS = 30 * 60 * 1000     // cleanup frequency
```

### Behavior

- Sessions with uncommitted file changes are **never auto-deleted** — only tagged `[WIP]`
- Sessions with no changes older than 24h are auto-deleted
- When you exceed 3 sessions per project, oldest empty sessions are pruned
- Status prefixes are removed automatically when you resume a session

## Performance Optimizer (`perf-optimizer.ts`)

Auto-compacts idle sessions so they load faster when you switch to them.

The main cause of slow session switching in OpenCode is rendering large message histories in the Tauri WebView. This plugin compacts sessions after 5 minutes of idle, reducing the message count and making the switch near-instant.

| Trigger | Action |
|---------|--------|
| Session idle (>20 messages) | Summarizes/compacts the session |
| Session gets new activity | Resets compaction flag |

### Install

```bash
cp opencode/plugin/perf-optimizer.ts ~/.config/opencode/plugin/
```

## Notify (`notify.ts`)

Native macOS notification plugin — no audio interruptions.

| Event | Notification | Sound |
|-------|-------------|-------|
| Session idle | "Ready for next task" | Silent |
| `git push` | "Changes pushed" | Silent |
| `gh pr create` | "PR opened" | Ding |
| Tests fail | "Check test output" | Ding |

### Install

```bash
cp opencode/plugin/notify.ts ~/.config/opencode/plugin/
```

## Install All

```bash
cp opencode/plugin/*.ts ~/.config/opencode/plugin/
```
