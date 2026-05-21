---
id: env-cursor
name: Cursor environment
description: Configuration guide for Cursor IDE — Rules system, AGENTS.md, Agent mode, Background Agents, and Composer 2.0
version: 0.1.0
tags:
- agent
- platform-env
- cursor
- vscode
provider: cursor
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting a Cursor workspace and need to wire project rules, AGENTS.md, or background agents correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - Cursor IDE v0.45+ installed
  resources:
    ram: negligible
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - workspace bootstrap
    - team rule sharing
    - long-running background tasks
    - Composer agentic workflows
translations:
  pt-BR:
    name: Ambiente Cursor
    description: Guia de configuração para Cursor IDE — sistema de Rules, AGENTS.md, modo Agente, Background Agents e Composer 2.0
---
# Cursor Environment

## Rules system

Cursor uses a layered rules system replacing the legacy `.cursorrules` file:

| Layer | Location | Scope |
|-------|----------|-------|
| Project rules | `.cursor/rules/*.mdc` | Checked into repo; apply to all teammates |
| User rules | Cursor Settings → Rules | Personal defaults; not shared |
| System rules | Built-in model instructions | Not user-editable |

**Rule format** (`.cursor/rules/my-rule.mdc`):

```markdown
---
description: Describe when this rule applies
globs:
  - "**/*.ts"
  - "src/**"
alwaysApply: false   # true = injected into every context; false = applied when relevant
---

# Rule body

Write instructions here in natural language. Reference files with @file.
```

Rules with `alwaysApply: true` are always injected. Rules without `alwaysApply` are auto-attached when the matched globs are in context.

## AGENTS.md

`AGENTS.md` at the project root (or any directory) provides context for agentic tasks — similar in role to `CLAUDE.md`:

```markdown
# Project Agent Instructions

## Build commands
- `pnpm build` — full build
- `pnpm test` — run tests

## Style guide
- Use TypeScript strict mode
- Prefer functional patterns over classes

## Off-limits
- Do not modify migration files manually
```

Cursor's agent reads `AGENTS.md` from the working directory and parent directories.

## Agent mode

Agent mode (formerly Composer) gives Cursor autonomy to make multi-file edits, run terminal commands, and browse docs:

- Activate with `Cmd/Ctrl+I` → select **Agent** mode
- The agent sees all open files, the terminal, and can run shell commands
- Use `@` to attach files, docs, or web URLs as context
- Checkpoints allow undoing a sequence of agent edits

## Background Agents (v0.48+)

Background Agents run in a cloud sandbox independent of your local machine:

```
Cursor → Background Agents → New Agent
```

- Runs in a remote environment with a snapshot of your repo
- Can execute long-running tasks (tests, builds, refactors) without blocking the IDE
- Results are synced back as a diff for review
- Requires Cursor Pro or Team plan

Cloud Agents (v3.0, 2026): persistent agents that can be triggered via API, Webhooks, or the Cursor dashboard.

## Composer 2.0

Composer 2.0 (late 2025) adds:
- **Parallel edits**: multiple file edits in a single agent turn
- **Spec mode**: agent writes a spec first, then implements; review before code is written
- **Branch-per-task**: each Composer session can work on a separate git branch

## MCP tools

Add MCP servers in Cursor Settings → MCP:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

MCP tools appear as callable tools in Agent mode.

## Key behaviors

- **Model**: defaults to latest Claude or GPT-4o; configurable per-chat
- **Context**: attaches open tabs, recent files, and matched rules automatically
- **Privacy**: by default, code is sent to Cursor's servers; enable Privacy Mode to opt out
- **Indexing**: Cursor indexes the codebase locally for fast semantic search
