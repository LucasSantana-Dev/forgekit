# Context Management for AI Coding

## Token Optimization

### DCP (Dynamic Context Pruning)
Install the `@tarquinen/opencode-dcp` plugin. Configure aggressive pruning at 65% threshold — this alone cuts token usage by 40-80% on long sessions.

### MCP Server Strategy
- Keep < 10 servers active globally
- Use `type: "remote"` over `type: "local"` when available — remote tools register lazily (cheaper on context)
- Enable specialized servers per-project, not globally

### Context Hygiene
- Use `/clean` or `/compact` between unrelated tasks
- Reference files by path (`@filename`) instead of pasting contents
- Save context state at ~70% usage before compression hits
- Progressive loading: don't read entire files, use targeted grep/glob

## Multi-Model Routing

Match model capability to task complexity:

| Task | Model Tier | Why |
|------|-----------|-----|
| Simple edits, formatting | Haiku/fast | Cheap, fast, sufficient |
| Implementation, debugging | Sonnet/primary | Good balance of speed and capability |
| Architecture, cross-repo | Opus/architect | Needs deep reasoning |

Rule: Default to the cheapest model that can do the job. Escalate only when needed.

## Plugin Recommendations

| Plugin | Purpose | Install |
|--------|---------|---------|
| `@tarquinen/opencode-dcp@latest` | Token pruning | Essential |
| `opencode-devcontainers` | Isolated workspaces | Recommended |
| `opencode-worktree` | Git worktree management | Recommended |
| `opencode-mem` | Local vector memory | Nice to have |
| `oh-my-opencode-slim` | LSP/AST + parallel agents | Nice to have |

**Avoid**: Plugins not on npm (crash the app). Always verify with `npm view <name>` before adding.

## Session Workflow

```
Start:  /resume → load context, check git state, pick next task
During: @file refs → sub-agents for parallel work → /context at 70%
End:    /commit → update CHANGELOG → sync memories → clean temp files
```
