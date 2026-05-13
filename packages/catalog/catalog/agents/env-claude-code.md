---
id: env-claude-code
name: Claude Code environment
description: Configuration guide for Claude Code — CLAUDE.md, sub-agents, hooks, skills, slash commands, and model wiring
version: 0.1.0
tags:
- agent
- platform-env
- claude-code
- ai-dev-toolkit
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting a Claude Code workspace and need to wire CLAUDE.md, sub-agents, hooks, skills, or slash commands correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - Claude Code CLI or desktop app installed
  resources:
    ram: negligible
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - workspace bootstrap
    - sub-agent orchestration
    - hook-driven automation
    - skill library management
translations:
  pt-BR:
    name: Ambiente Claude Code
    description: Guia de configuração para Claude Code — CLAUDE.md, sub-agentes, hooks, skills, comandos slash e configuração de modelos
---
# Claude Code Environment

## Context files

| File | Scope | Purpose |
|------|-------|---------|
| `CLAUDE.md` (project root) | Project | Instructions, commands, standards checked into the repo |
| `~/.claude/CLAUDE.md` | Global | User-level defaults, storage policy, tone |
| `.claude/agents/*.md` | Project | Sub-agent definitions loaded into the orchestrator |
| `.claude/skills/` | Project | Reusable skill modules invoked with `/skill-name` |
| `.claude/plans/` | Project | Planning docs written and consumed by Claude |
| `.claude/settings.json` | Project | Permissions, allowed/blocked tools per project |

## Agent definition fields

```yaml
---
id: my-agent
name: My Agent
description: One-line description
version: 0.1.0
model: claude-sonnet-4-6     # optional — defaults to main model
level: 2                      # optional — 1=basic, 2=advanced, 3=expert
disallowed_tools:             # optional — restrict what the sub-agent can call
  - Edit
  - Write
tags: [agent, ...]
---
# Agent body (system prompt in Markdown)
```

Current model IDs: `claude-opus-4-7`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`.

## Hooks

Hooks run shell commands on events. Defined in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash", "hooks": [{"type": "command", "command": "echo pre-bash"}] }],
    "PostToolUse": [{ "matcher": "Edit", "hooks": [{"type": "command", "command": "pnpm lint"}] }],
    "Stop": [{ "hooks": [{"type": "command", "command": "~/.claude/scripts/handoff.sh"}] }]
  }
}
```

Available events: `PreToolUse`, `PostToolUse`, `Notification`, `Stop`, `SubagentStop`.

## Skills

A skill is a Markdown file in `.claude/skills/` or `~/.agents/skills/`:

```
.claude/skills/
  my-skill/
    README.md     # loaded as the skill's instructions
    scripts/      # any helper scripts the skill calls
```

Invoke with `/my-skill [args]` in the Claude Code REPL.

## Slash commands

Custom slash commands live in `.claude/commands/`:

```
.claude/commands/
  deploy.md      # invoked as /deploy
  review.md      # invoked as /review
```

The file body is the prompt template; `$ARGUMENTS` expands to the argument string.

## MCP server wiring

Add servers to `.claude/settings.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

## Key behaviors

- **Trust model**: sub-agents inherit the parent's tool allowlist minus anything in `disallowed_tools`
- **Context window**: CLAUDE.md files and memories auto-load; skills load on invocation
- **Parallelism**: the orchestrator can spawn multiple sub-agents in a single turn via the `Agent` tool
- **Permissions**: `settings.json` `allow` / `deny` arrays control which Bash patterns run without confirmation
