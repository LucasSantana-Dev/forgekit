---
id: env-windsurf
name: Windsurf environment
description: Configuration guide for Windsurf IDE — rules hierarchy, Cascade agent, memories, and MCP integration
version: 0.1.0
tags:
- agent
- platform-env
- windsurf
- codeium
provider: claude
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting a Windsurf workspace and need to wire rules, Cascade memories, or MCP tools correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - Windsurf IDE installed (download from codeium.com/windsurf)
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
    - persistent memory across sessions
    - Cascade agentic workflows
translations:
  pt-BR:
    name: Ambiente Windsurf
    description: Guia de configuração para Windsurf IDE — hierarquia de rules, agente Cascade, memories e integração MCP
---
# Windsurf Environment

## Rules hierarchy

Windsurf applies rules in three layers, evaluated in order:

| Layer | Location | Scope | Limit |
|-------|----------|-------|-------|
| Global rules | Windsurf Settings → Rules → Global | All workspaces | 12,000 chars |
| Workspace rules | `.windsurf/rules/*.md` or `.windsurfrules` | This repo | 12,000 chars total |
| System rules | Built-in | Not editable | — |

**`.windsurfrules`** (project root) is the legacy single-file format. The new format uses `.windsurf/rules/` directory with named rule files:

```
.windsurf/
  rules/
    coding-style.md
    testing.md
    catalog-conventions.md
```

**Rule file format:**

```markdown
---
trigger: always_on          # always_on | model_decision | glob
glob: "**/*.ts"             # only when trigger=glob
---

# Coding Style

- TypeScript strict mode everywhere
- Prefer functional patterns over classes
- No `any` — use `unknown` and narrow
- Max function length: 50 lines
```

`trigger: always_on` rules are injected into every Cascade context. `trigger: model_decision` lets Cascade decide when the rule is relevant. `trigger: glob` applies only when matched files are in context.

**Total character budget**: all active rules combined must stay under 12,000 characters. Cascade truncates if over budget.

## Cascade agent

Cascade is Windsurf's native agentic mode — different from standard autocomplete or chat:

- **Multi-file edits**: Cascade plans and executes across the entire codebase
- **Terminal access**: runs shell commands with user confirmation (or auto-approve in trust mode)
- **Context awareness**: reads open files, git status, and terminal output automatically
- **Inline diff review**: each edit appears as an inline diff; accept/reject per file

Activate Cascade with `Cmd/Ctrl+L` → select **Cascade** tab.

## Memories

Cascade can create persistent memories that survive across sessions:

```
Cascade: I'll remember that this project uses pnpm workspaces and requires
`pnpm catalog:validate` after catalog changes.
```

Memories are stored locally in Windsurf's data directory and auto-injected into future Cascade sessions. To view and delete memories: Windsurf Settings → AI → Memories.

Memories and rules overlap in purpose. Use rules for team-shared standards (checked in), and memories for personal shortcuts.

## MCP integration

Configure MCP servers in Windsurf Settings → MCP Servers, or in `.windsurf/mcp.json`:

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
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

MCP tools appear in Cascade as callable tools.

## Flows (advanced)

Flows are multi-step Cascade workflows defined in `.windsurf/flows/`:

```yaml
# .windsurf/flows/release.yaml
name: release
steps:
  - prompt: "Run pnpm workspace:validate and report findings"
  - prompt: "Update CHANGELOG.md unreleased section"
  - prompt: "Bump version in package.json"
```

Trigger a flow with `/flow release` in Cascade.

## Key behaviors

- **Model**: defaults to latest Claude Sonnet; switchable to GPT-4o or Gemini in settings
- **Context**: Cascade reads all open files plus any file you `@mention`
- **Privacy**: code sent to Codeium servers by default; enterprise plans support private deployment
- **Indexing**: full-repo semantic index built locally; used for `@codebase` queries
- **Character limit**: 12,000 chars for rules is a hard limit — keep rules concise
