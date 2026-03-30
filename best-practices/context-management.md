# Context Management for AI Coding

> Token waste is the silent tax on every AI-assisted session. Manage it actively.

## Token Optimization

### Progressive Loading
Don't read entire files upfront. Build context incrementally:
1. Start with project structure (glob, ls)
2. Read specific functions (grep for signatures, then read targeted lines)
3. Load full files only when editing them

### Context Hygiene
- Clean context between unrelated tasks (`/compact`, `/clear`, or start a new session)
- Reference files by path (`@filename`) instead of pasting contents into chat
- Save context state at ~70% usage before compression kicks in
- Break long sessions into focused segments — a 500-message session is slower than 5 fresh ones

### MCP Server Strategy
- Keep < 10 servers active globally
- Prefer remote/lazy servers over local ones — remote tools register on-demand (cheaper on context)
- Enable specialized servers per-project, not globally
- Heavy servers (Playwright, Stitch, HuggingFace) should be disabled by default

### Context Window Awareness
Most models have 128K-200K token context windows. In practice:
- ~30% goes to system prompt and tool definitions
- ~40% is available for conversation history
- ~30% is available for current task context

When you hit the ceiling, the model forgets early context silently. Watch for repeated questions about things you already discussed.

## Multi-Model Routing

Match model capability to task complexity:

| Task | Model Tier | Why |
|------|-----------|-----|
| Simple edits, formatting | Fast (Haiku, Flash, GPT-4o-mini) | Cheap, fast, sufficient |
| Implementation, debugging | Standard (Sonnet, Pro, GPT-4o) | Good balance of speed and capability |
| Architecture, cross-repo | Deep (Opus, o3, Deep Research) | Needs deep reasoning |

Rule: Default to the cheapest model that can do the job. Escalate only when needed.

See [Multi-Model Routing](../patterns/multi-model-routing.md) for detailed heuristics.

## Session Workflow

```
Start:  Load context → check git state → pick next task
During: @file refs → sub-agents for parallel work → compact at 70%
End:    Commit → update CHANGELOG → sync memories → clean temp files
```

## Tool-Specific Tips

### Claude Code
- Use `/compact` to summarize and free context
- Hooks can auto-format on save, reducing back-and-forth
- Skills bundle multi-step workflows into single commands
- Memory files in `.claude/memory/` persist across sessions
- **RTK hook**: Install `rtk` and run `rtk init -g --hook-only` to add a `PreToolUse` hook that
  compresses Bash outputs before they reach the context window — 60-90% token
  reduction on `git`, `npm`, `ls`, and other dev commands with no change to your
  workflow. Run `rtk gain` to track cumulative savings.

### OpenCode
- `@tarquinen/opencode-dcp` plugin prunes context automatically at configurable thresholds
- `opencode-worktree` plugin isolates branches per session
- DCP alone can cut token usage by 40-80% on long sessions

### Cursor
- Composer mode uses more context than inline edits — use inline for small changes
- `.cursor/rules/*.mdc` files scope context to specific directories
- Notepad feature persists notes within a session (not across sessions)

### General
- Avoid plugins not published to npm/PyPI — verify with `npm view <name>` before installing
- Monitor your token usage — most tools show this in settings or billing dashboards
- If a session feels slow or the agent is repeating itself, start fresh
