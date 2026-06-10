---
id: claude-code-routines-monitor
title: Routines & Monitor — Templated Agents & Background Streaming
description: Fire templated cloud agents on a schedule, GitHub event, or API call with Routines. Stream background events into the conversation with Monitor to tail logs, watch CI, and react in real-time without polling.
tags:
- claude-code
- automation
- infrastructure
- background-jobs
- monitoring
translations:
  pt-BR:
    title: Rotinas e Monitor — Agentes Templados e Streaming em Background
    description: Dispare agentes em nuvem templados em um cronograma, evento GitHub ou chamada API com Rotinas. Transmita eventos de background para a conversa com Monitor para seguir logs, monitorar CI e reagir em tempo real sem polling.
---

# Routines & Monitor — Templated Agents & Background Streaming

Two complementary tools for automating background work:

- **Routines** (Week 16, 2026): Templated cloud agents that fire on a schedule, GitHub event, or API call.
- **Monitor** (Week 15, 2026): A built-in tool that spawns a background watcher and streams its events into the conversation.

Both save you from manually triggering work or polling in loops.

---

## Routines — Scheduled & Event-Triggered Cloud Agents

A Routine is a reusable cloud agent template. Define it once (prompt, repos it can access, connectors), then fire it on a schedule, GitHub event, or webhook.

### When to Use Routines

| Use Case | Example | Trigger |
|----------|---------|---------|
| **Daily CI check** | Review PRs and push fixes | Schedule (09:00 daily) |
| **Release automation** | Tag, build, and deploy on new release | GitHub: `release` event |
| **PR triage** | Auto-label and assign new PRs | GitHub: `pull_request` event |
| **Dependency updates** | Run tests and merge safe updates | GitHub: `push` to deps branch |
| **Nightly backup/sync** | Backup code, cache, or data | Schedule (01:00 daily) |
| **External webhook** | Trigger from CI, Slack, or custom service | HTTP POST to `/fire` endpoint |

### How to Create a Routine

**On Claude Code on the web:**

1. Go to **Routines** tab.
2. Click **New Routine**.
3. Fill in:
   - **Name**: "Daily PR Review"
   - **Prompt**: "Review open PRs, add LGTM labels to safe ones, request changes for complex ones"
   - **Repos**: Select which repos the routine can access.
   - **Trigger**: Choose Schedule / GitHub Event / API, and configure it.
4. Save and activate.

**From CLI:**

```text
claude> /schedule daily PR review at 9am
```

Claude scaffolds a routine you can refine.

### Routine Triggers

**Schedule triggers:**
```text
daily at 9am
weekdays at 6pm
every 2 hours
Sundays at midnight
```

**GitHub event triggers:**
```text
PR opened on main
Release published
Push to release/* branches
Issue labeled as bug
```

**API triggers:**

Every routine gets a tokened `/fire` endpoint:

```bash
curl -X POST https://claude.ai/routines/my-routine/fire \
  -H "Authorization: Bearer <token>" \
  -d '{"param": "value"}'
```

### Cost & Constraints

- **Per-routine token cost**: Each run consumes tokens proportional to the routine's context and complexity.
- **Quota**: Routines count against your Claude Code token limit. Monitor with `/usage`.
- **No local machine required**: Routines run on Anthropic's servers; your machine can be off.
- **Audit trail**: Every routine run is logged; check execution history in the web UI.

### Tips

1. **Start simple** — avoid large repos or complex logic in the first iteration; test with a dry-run first.
2. **Keep prompts concise** — verbose prompts cost more tokens per run.
3. **Use GitHub events sparingly** — every PR creation or push triggers the routine; filter by branch or label to avoid noise.
4. **Pair with Monitor** — a Routine can request a status update; Monitor streams the result back.

---

## Monitor — Stream Background Events

**Available since Week 15, 2026.**

Monitor spawns a background watcher and streams its events into the conversation. Each event lands as a new transcript message that Claude reacts to immediately. No polling loops, no Bash sleep holding the turn open.

### When to Use Monitor

| Task | Without Monitor | With Monitor |
|------|-----------------|--------------|
| **Tail a log file** | `tail -f server.log` blocks; you wait | Spawn Monitor; keep working; Claude alerts on patterns |
| **Watch CI** | Poll PR status in a loop every 30s | Monitor streams CI updates; Claude auto-fixes on fail |
| **Background training** | Periodically check if done | Monitor emits metrics; Claude adjusts or stops early |
| **Live debugging** | Manually check logs during run | Monitor catches crashes the moment they happen |

### How to Use Monitor

Ask Claude to watch something:

```text
claude> Tail server.log in the background and tell me the moment a 5xx error shows up
```

Claude spawns a Monitor process. Your conversation continues. The moment a 5xx appears, Monitor emits an event, Claude sees it, and notifies you.

Or use the built-in Monitor tool directly via Bash:

```bash
claude> /tools Monitor { watch: "tail -f server.log", pattern: "ERROR" }
```

### Monitor + /loop Integration

`/loop` now self-paces and can use Monitor to skip polling:

```text
claude> /loop check if tests pass
```

Claude will:
1. Check once immediately.
2. If passing, wait and re-check.
3. If waiting, it uses Monitor to watch for test completion instead of polling every 10 seconds.

Compare:

**Without Monitor (polling loop):**
```bash
while ! grep "tests passed" CI.log; do sleep 10; done  # holds a turn open
```

**With Monitor (streaming events):**
```text
Monitor watch CI.log for "tests passed"  # background; you keep working
```

### Monitor Exit Criteria

Monitor stops when:
- The watched file or command ends.
- A match pattern is found (e.g., "5xx error").
- A timeout occurs (default: 1 hour).
- You explicitly stop it.

Claude's summary shows what was observed and any actions taken.

### Cost Considerations

- **Cheaper than polling**: Monitor uses background streaming; you're not holding a conversation turn open.
- **Long-running monitors add up**: Tailing a log for 8 hours emits many events. Reasonable for key logs (CI, errors), not for every possible signal.
- **Token per event**: Each Monitor event that Claude reacts to consumes tokens (small, but non-zero).

---

## Routines + Monitor: A Practical Example

**Scenario**: You release a new version daily. You want the routine to run tests, and if a test fails, Monitor should tail the logs and report the first failure.

```text
# Define a routine:
claude> /schedule daily release & test at 6am

# Routine definition:
1. Tag the release (v0.X.Y)
2. Run tests
3. If tests fail: spawn Monitor to tail test.log and report the first failure
4. If tests pass: merge, deploy, and notify via webhook
```

When the routine runs:
- Tests execute.
- If failing, Monitor starts watching test.log.
- The moment the first failure prints, Claude reacts and can auto-fix or escalate.
- You wake up to a full report, not just "tests failed."

---

## Comparing Routines, Monitor, and /loop

| Feature | Routine | Monitor | /loop |
|---------|---------|---------|-------|
| **Scheduling** | Yes (cron-like) | No | No |
| **Trigger** | Schedule, GitHub event, API | CLI command | CLI command |
| **Runs where** | Cloud (no local machine needed) | Background (local or cloud) | Local CLI session |
| **Event streaming** | No (routine outputs once) | Yes (real-time events) | No (periodic polling) |
| **Cost per run** | Higher (full session) | Lower (background streaming) | Medium (session per loop) |
| **Best for** | Fire-and-forget automation | Long-running observation | Interactive iteration |

---

## Tips

1. **Start with Routines for predictable work** — releases, CI checks, triage.
2. **Add Monitor for live observation** — tail logs, watch CI, react to errors in real-time.
3. **Combine both** — Routines that use Monitor for smart error handling.
4. **Monitor long tasks, not all tasks** — don't Monitor everything; reserve it for critical signals.
5. **Set Monitor patterns carefully** — "tell me when anything happens" wastes tokens; "tell me when ERROR or TIMEOUT appears" is precise.
6. **Check `/usage`** — Monitor and Routines add up across runs; track their cost.
