---
id: env-gemini-cli
name: Gemini CLI environment
description: Configuration guide for Gemini CLI — GEMINI.md / AGENT.md context files, sub-agents, Agent Skills, and MCP integration
version: 0.1.0
tags:
- agent
- platform-env
- gemini
- google
provider: gemini
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting a Gemini CLI workspace and need to wire GEMINI.md, sub-agents, Agent Skills, or MCP tools correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - Gemini CLI installed (npm install -g @google/gemini-cli)
    - Google account with Gemini API access
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
    - Agent Skills for reusable procedures
    - MCP tool integration
translations:
  pt-BR:
    name: Ambiente Gemini CLI
    description: Guia de configuração para Gemini CLI — GEMINI.md / AGENT.md, sub-agentes, Agent Skills e integração MCP
---
# Gemini CLI Environment

## Context files

| File | Scope | Purpose |
|------|-------|---------|
| `GEMINI.md` (project root) | Project | Primary context file — instructions, structure, conventions |
| `AGENT.md` (project root) | Project | Alternative name; `GEMINI.md` takes precedence if both exist |
| `.gemini/GEMINI.md` | Project | Extended config in `.gemini/` directory |
| `~/.gemini/GEMINI.md` | Global | User-level defaults |

Gemini CLI auto-loads `GEMINI.md` from the working directory and walks up to the git root. Include a `# Context` section summarizing repo purpose, and a `# Instructions` section for task guidance.

## Sub-agents

Sub-agents are defined as YAML or Markdown files in `.gemini/agents/`:

```yaml
# .gemini/agents/reviewer.yaml
name: reviewer
description: Reviews changed files for correctness and style
instructions: |
  You are a code reviewer. Examine each file diff and report findings with severity.
model: gemini-2.5-pro
tools:
  - read_file
  - search_files
```

Sub-agents can be invoked explicitly or spawned in parallel by the orchestrator:

```
@reviewer review the latest diff
```

Parallel sub-agents run concurrently and the orchestrator merges their outputs.

## Agent Skills (SKILL.md)

Agent Skills package reusable procedures into a file the agent can load:

```
.gemini/skills/
  deploy-check/
    SKILL.md    # skill instructions and steps
```

Reference a skill in `GEMINI.md`:

```markdown
## Available Skills
- `deploy-check` — runs pre-deployment validation checklist
```

The CLI loads `SKILL.md` when the skill name appears in the conversation context.

## MCP integration

Configure MCP servers in `.gemini/settings.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "$GITHUB_TOKEN" }
    }
  }
}
```

## Key behaviors

- **Model**: defaults to `gemini-2.5-pro`; override per-agent or with `--model` flag
- **Context window**: 1M token context window; handles large repos in a single prompt
- **Parallel agents**: the orchestrator spawns multiple sub-agents in parallel natively
- **Tool access**: built-in tools (read_file, search_files, run_command, web_search); extend via MCP
- **Memory**: no persistent memory by default; use `GEMINI.md` for durable context
- **Auth**: runs via `gcloud auth login` or `GEMINI_API_KEY` env var
