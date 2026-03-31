# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

Most AI coding sessions fail for one reason: the agent has no project context.

`ai-dev-toolkit` gives you reusable building blocks to fix that:
- project rule templates
- context and orchestration patterns
- reference implementations
- terminal setup scripts for AI-heavy workflows

The result is predictable AI behavior, less rework, and faster delivery.

## Why This Toolkit

| Without it | With it |
|---|---|
| Generic boilerplate output | Code aligned to your conventions |
| Re-explaining project structure every session | Context files loaded on day one |
| One expensive model for every task | Right model per task complexity |
| Manual multi-session coordination | Queue and orchestration patterns |
| Repeating decisions across weeks | Memory patterns and durable context |
| Risky agent actions | Guardrails and permission boundaries |

## Table of Contents

- [Quick Start](#quick-start)
- [How to Adopt in One Week](#how-to-adopt-in-one-week)
- [Repository Map](#repository-map)
- [Philosophy](#philosophy)
- [Who This Is For](#who-this-is-for)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

### 1) Add one rule file to your project (highest impact)

```bash
# Choose one, based on your AI coding tool:
cp rules/CLAUDE.md your-project/CLAUDE.md         # Claude Code / OpenCode
cp rules/AGENTS.md your-project/AGENTS.md         # Codex CLI / OpenCode
cp rules/.cursorrules your-project/.cursorrules   # Cursor
cp rules/.windsurfrules your-project/.windsurfrules  # Windsurf
cp rules/COPILOT.md your-project/COPILOT.md       # GitHub Copilot
```

### 2) Read and apply the core pattern

Start with [Context Building](patterns/context-building.md).  
It is the foundation for all other patterns.

### 3) Optional: install productivity CLI stack

```bash
bash tools/install-macos.sh      # macOS
bash tools/install-ubuntu.sh     # Ubuntu/Linux
.\tools\install-windows.ps1      # Windows (PowerShell as Admin)
```

The Windows installer is idempotent for Scoop buckets and avoids duplicate bucket
add errors on reruns.

## How to Adopt in One Week

| Day | Focus | Output |
|---|---|---|
| 1 | Add rule file | Agent respects conventions |
| 2 | Apply Context Building | Better first-pass code |
| 3 | Add Task Orchestration | Less manual prompting |
| 4 | Add Code Review + Testing patterns | Fewer regressions |
| 5 | Add Memory Systems | Better continuity across sessions |

## Repository Map

### `patterns/`
Practical, tool-agnostic playbooks.

| Pattern | Primary use |
|---|---|
| [Context Building](patterns/context-building.md) | Make the agent understand your project |
| [Prompt Engineering](patterns/prompt-engineering.md) | Increase response precision |
| [Task Orchestration](patterns/task-orchestration.md) | Manage multi-step work with less supervision |
| [Multi-Model Routing](patterns/multi-model-routing.md) | Reduce cost and latency |
| [Session Management](patterns/session-management.md) | Keep parallel sessions clean |
| [Memory Systems](patterns/memory-systems.md) | Persist decisions and preferences |
| [Code Review](patterns/code-review.md) | Catch bugs and risky changes |
| [Testing with AI](patterns/testing.md) | Generate higher-value tests |
| [Git Worktrees](patterns/git-worktrees.md) | Isolate concurrent tasks safely |
| [Agent Gotchas](patterns/agent-gotchas.md) | Avoid common AI workflow failures |
| [Multi-Repo Workflows](patterns/multi-repo.md) | Coordinate changes across repositories |
| [Agent Observability](patterns/agent-observability.md) | Trace, evaluate, and regression-test agent behavior |

### `best-practices/`
Cross-cutting rules for quality and safety.

| Guide | Covers |
|---|---|
| [Security](best-practices/security.md) | Secrets, permissions, CI scanning |
| [Workflow](best-practices/workflow.md) | Trunk-based flow, commits, quality gates |
| [Context Optimization](best-practices/context-management.md) | Token efficiency, MCP usage, session hygiene |

### `rules/`
Drop-in templates to encode project behavior per tool.

| File | Target tool |
|---|---|
| [`CLAUDE.md`](rules/CLAUDE.md) | Claude Code, OpenCode |
| [`AGENTS.md`](rules/AGENTS.md) | Codex CLI, OpenCode |
| [`.cursorrules`](rules/.cursorrules) | Cursor |
| [`.windsurfrules`](rules/.windsurfrules) | Windsurf |
| [`COPILOT.md`](rules/COPILOT.md) | GitHub Copilot |

### `tools/`
Installer scripts and curated additions for AI productivity tools.

Core terminal stack includes:
`lazygit`, `fzf`, `bat`, `eza`, `delta`, `zoxide`, `atuin`, `btop`, `fd`,
`ripgrep`, `jq`, `yq`, `chezmoi`.

See [Curated AI Productivity Additions](tools/README.md#curated-ai-productivity-additions)
for advanced integrations including Context7, Tavily, Firecrawl, markdownify-mcp, lmnr,
TDD Guard, container-use, Superpowers skills, and the Anthropic official skills collection.

### `implementations/`
Concrete examples for specific tools.

| Tool | Includes |
|---|---|
| [Claude Code](implementations/claude-code/) | Hooks, skills, memory structure, example `CLAUDE.md` |
| [Codex CLI](implementations/codex/) | Setup guide, config.toml, approval policies, sandbox modes |
| [OpenCode](implementations/opencode/) | Task orchestrator plugin, session manager, DCP config |
| [Cursor](implementations/cursor/) | Setup guide, scoped rules, memory workarounds |

### `examples/`
Copy-ready starter assets.

- [`backlog.json`](examples/backlog.json): task queue example
- [`.claude/memory/`](examples/.claude/memory/): memory structure template

## Philosophy

1. Context quality beats model upgrades.
2. Environment design beats provider hopping.
3. Automate scheduling, not only code generation.
4. Keep decisions reusable across sessions.
5. Stay tool-agnostic to avoid lock-in.

## Who This Is For

- Developers using AI coding tools daily who want consistent output quality.
- Teams creating shared standards for AI-assisted development.
- New projects that need a strong AI-ready foundation from day one.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

High-impact contributions:
- new reference implementations
- production-tested patterns
- improvements to install scripts and safety guardrails

## License

[MIT](LICENSE)
