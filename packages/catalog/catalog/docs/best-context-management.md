---
id: best-context-management
title: Context Management for AI Coding
description: '### Progressive Loading Don''t read entire files upfront. Build context
  incrementally: 1. Start with project structure (glob, ls) 2. Read specific functions
  (grep for signatures, then read targeted lines) 3. Load full files only when editing
  them'
tags:
- best-practice
- ai-dev-toolkit
- security
- token-optimization
- workflow
source:
  path: ai-dev-toolkit/packages/core/best-practices/context-management.md
  upstream: https://github.com/LucasSantana-Dev/forgekit/blob/main/packages/core/best-practices/context-management.md
  license: MIT
translations:
  pt-BR:
    title: Gerenciamento de Contexto para Codificação com IA
    description: Carregamento progressivo. Não leia arquivos inteiros antecipadamente.
      Construa contexto incrementalmente — menos ruído, melhores decisões, menor custo.
---
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
- Run `/compact` at **60-70%** context usage — waiting until 90% risks hitting session limits
- Break long sessions into focused segments — a 500-message session is slower than 5 fresh ones

### MEMORY.md Discipline
The `MEMORY.md` index is loaded into context on **every message**. Bloat here is a fixed cost — it never goes away during the session.

- Hard limit: **200 lines** (entries after line 200 are silently truncated)
- Keep each entry to one line under ~150 characters
- Move details into topic files (architecture.md, gotchas.md, workflows.md)
- Only put information in MEMORY.md that you need to find *other* files
- Audit and trim periodically — the index is a pointer, not storage

### MCP Server Strategy
- Keep < 10 servers active globally
- Prefer remote/lazy servers over local ones — remote tools register on-demand (cheaper on context)
- Enable specialized servers per-project, not globally
- Heavy servers (Playwright, Stitch, HuggingFace) should be disabled by default
- **Plugin dual-registration**: Claude Code plugins can register the same MCP server a second time under a `mcp__plugin_*` namespace. If a server is in `.mcp.json` AND enabled as a plugin, every tool appears twice. Audit with `claude plugin list` and disable the plugin version for servers you manage directly.
- **`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`**: Triples all MCP tool entries by adding a third `mcp__agents__*` namespace. Remove from `env` in `settings.json` if you're not using agent teams.

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

See [Multi-Model Routing](../packages/core/patterns/multi-model-routing.md) for detailed heuristics.

## Session Workflow

```
Start:  Load context → check git state → pick next task
During: @file refs → sub-agents for parallel work → compact at 70%
End:    Commit → update CHANGELOG → sync memories → clean temp files
```

## Tool-Specific Tips

### Claude Code
- Use `/compact` to summarize and free context — trigger at **60-70%**, not 90%
- Hooks can auto-format on save, reducing back-and-forth
- Skills bundle multi-step workflows into single commands
- Memory files in `~/.claude/projects/<path>/memory/` persist across sessions
- **MEMORY.md**: Index is always loaded — keep under 200 lines. Move gotchas, architecture, and workflow details to topic files. MEMORY.md entries should be one-line pointers, not content.
- **RTK hook**: Install `rtk` and run `rtk init -g` to add a `PreToolUse` hook that
  compresses Bash outputs before they reach the context window — 60-90% token
  reduction on `git`, `npm`, `ls`, and other dev commands with no change to your
  workflow. Run `rtk gain` to track cumulative savings.
- **Plugin audit**: Run `claude plugin list` and disable plugins for MCP servers you
  already have in `.mcp.json` — duplicate registrations double your tool count silently.

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
