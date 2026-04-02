# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/Forge-Space/ai-dev-toolkit)](https://github.com/Forge-Space/ai-dev-toolkit/releases)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

Most AI coding sessions fail for one reason: the agent has no project context.

`ai-dev-toolkit` gives you reusable building blocks to fix that — rule templates, context
and orchestration patterns, reference implementations, and terminal setup scripts for
AI-heavy workflows. The result is predictable output, less rework, and faster delivery.

## Why This Toolkit

| Without it | With it |
|---|---|
| Generic boilerplate output | Code aligned to your conventions |
| Re-explaining project structure every session | Context files loaded on day one |
| One expensive model for every task | Right model per task complexity |
| Manual multi-session coordination | Queue and orchestration patterns |
| Repeating decisions across weeks | Memory patterns and durable context |
| Risky agent actions | Guardrails and permission boundaries |
| Agent output you can't audit | Traces, regression tests, security scans |

## Table of Contents

- [Quick Start](#quick-start)
- [How to Adopt in One Week](#how-to-adopt-in-one-week)
- [Repository Map](#repository-map)
- [Philosophy](#philosophy)
- [Who This Is For](#who-this-is-for)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

### 1) Add one rule file to your project

```bash
# Choose one, based on your AI coding tool:
cp rules/CLAUDE.md your-project/CLAUDE.md             # Claude Code / OpenCode
cp rules/AGENTS.md your-project/AGENTS.md             # Codex CLI / OpenCode
cp rules/.cursorrules your-project/.cursorrules       # Cursor
cp rules/.windsurfrules your-project/.windsurfrules   # Windsurf
cp rules/COPILOT.md your-project/COPILOT.md           # GitHub Copilot
```

This is the single highest-impact change you can make. The agent gets your conventions
before the first prompt.

### 2) Read the core pattern

Start with [Context Building](patterns/context-building.md) — the foundation for all
other patterns.

### 3) (Optional) Set up Claude Code from scratch

```bash
bash tools/setup-claude-code.sh
```

Configures `~/.claude/.mcp.json` with recommended MCP servers (Tavily, Context7,
Playwright, markdownify-mcp), sets default and subagent model, creates a memory
directory, and runs a plugin audit.

### 4) (Optional) Install the productivity CLI stack

```bash
bash tools/install-macos.sh              # macOS — core terminal tools
bash tools/install-ubuntu.sh            # Ubuntu/Linux
.\tools\install-windows.ps1            # Windows (PowerShell as Admin)
bash tools/setup-ai-workflow-macos.sh  # macOS — AI workflow tools (promptfoo, n8n, lmnr, browser-use…)
```

## How to Adopt in One Week

| Day | Action | Resource |
|---|---|---|
| 1 | Add a rule file | `rules/CLAUDE.md` or equivalent |
| 2 | Apply Context Building | [`patterns/context-building.md`](patterns/context-building.md) |
| 3 | Add Task Orchestration | [`patterns/task-orchestration.md`](patterns/task-orchestration.md) |
| 4 | Add Code Review + Testing patterns | [`patterns/code-review.md`](patterns/code-review.md), [`patterns/testing.md`](patterns/testing.md) |
| 5 | Add Memory Systems + Observability | [`patterns/memory-systems.md`](patterns/memory-systems.md), [`patterns/agent-observability.md`](patterns/agent-observability.md) |
| 6 | Apply Spec Driven Development | [`patterns/spec-driven-development.md`](patterns/spec-driven-development.md) |

## Repository Map

### `patterns/`

Tool-agnostic playbooks for recurring AI workflow problems.

| Pattern | Use when |
|---|---|
| [Context Building](patterns/context-building.md) | Agent lacks project knowledge |
| [Prompt Engineering](patterns/prompt-engineering.md) | Responses are imprecise or inconsistent |
| [Task Orchestration](patterns/task-orchestration.md) | Multi-step work needs less supervision |
| [Multi-Model Routing](patterns/multi-model-routing.md) | Cost or latency needs reducing |
| [Session Management](patterns/session-management.md) | Parallel sessions conflict or diverge |
| [Memory Systems](patterns/memory-systems.md) | Decisions need to persist across sessions |
| [Code Review](patterns/code-review.md) | Catching bugs and risky changes |
| [Testing with AI](patterns/testing.md) | Generating higher-value tests |
| [Git Worktrees](patterns/git-worktrees.md) | Isolating concurrent tasks safely |
| [Agent Gotchas](patterns/agent-gotchas.md) | Avoiding common AI workflow failures |
| [Multi-Repo Workflows](patterns/multi-repo.md) | Coordinating changes across repositories |
| [Agent Observability](patterns/agent-observability.md) | Tracing, evaluating, and regression-testing agent behavior |
| [Streaming Orchestration](patterns/streaming-orchestration.md) | Event-driven turn loops, budgeting, and transcript compaction |
| [Tool Registry Patterns](patterns/tool-registry-patterns.md) | Decoupling tool metadata from implementation; runtime filtering |
| [Permission Boundaries](patterns/permission-boundaries.md) | Minimum-privilege tool access, confirmation gates, trust profiles |
| [Spec Driven Development](patterns/spec-driven-development.md) | Agents need a stable contract to implement against |

### `companies/`
Pre-built agent organizations with specialized roles, skills, and routing protocols.

| Company | Description |
|---------|-------------|
| [fullstack-forge](companies/fullstack-forge/) | 49 agents, 66 skills, 10 teams across 11 departments |

### `best-practices/`

Cross-cutting rules for quality and safety.

| Guide | Covers |
|---|---|
| [Security](best-practices/security.md) | Secrets, permissions, CI scanning |
| [Workflow](best-practices/workflow.md) | Trunk-based flow, commits, quality gates |
| [Context Optimization](best-practices/context-management.md) | Token efficiency, MCP usage, session hygiene |

### `rules/`

Drop-in templates. Copy one to your project and edit the sections marked for your stack.

| File | Target tool |
|---|---|
| [`CLAUDE.md`](rules/CLAUDE.md) | Claude Code, OpenCode |
| [`AGENTS.md`](rules/AGENTS.md) | Codex CLI, OpenCode |
| [`.cursorrules`](rules/.cursorrules) | Cursor |
| [`.windsurfrules`](rules/.windsurfrules) | Windsurf |
| [`COPILOT.md`](rules/COPILOT.md) | GitHub Copilot |

### `tools/`

Scripts and curated additions for AI productivity workflows.

**Install scripts**

| Script | What it does |
|---|---|
| `install-macos.sh` | Core terminal stack: `lazygit`, `fzf`, `bat`, `eza`, `delta`, `zoxide`, `atuin`, `btop`, `fd`, `ripgrep`, `jq`, `yq`, `chezmoi` |
| `install-ubuntu.sh` | Same stack for Ubuntu/Debian, including `lmnr` and user-local `promptfoo` |
| `install-windows.ps1` | Scoop-based equivalent for Windows |
| `setup-claude-code.sh` | Full Claude Code setup: MCP servers, model config, memory directory, plugin audit |
| `setup-ai-workflow-macos.sh` | AI workflow tools: `promptfoo`, `n8n`, `lmnr`, `browser-use`, `letta`, memory stack |
| `capture-training.py` | Extract Claude Code sessions as Alpaca-format instruction pairs for fine-tuning |

See [tools/README.md](tools/README.md) for the full list of curated AI productivity
additions (Context7, Tavily, Firecrawl, markdownify-mcp, lmnr, TDD Guard, container-use,
Superpowers skills, and the Anthropic official skills collection) and the recommended
adoption order.

### `kit/`

forge-kit: one-command installer that syncs rules, skills, and MCP config across all supported AI tools.

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --profile standard
```

| Component | Description |
|---|---|
| `kit/install.sh` | Entry point — `--tools`, `--profile`, `--dry-run`, `--status`, `--uninstall` |
| `kit/core/rules.md` | Single source of truth for agent behavior rules |
| `kit/core/providers.json` | Unified provider + model registry |
| `kit/core/mcp.json` | Curated MCP server definitions |
| `kit/core/skills/` | 6 portable skills: `plan`, `verify`, `ship`, `review`, `debug`, `research` |
| `kit/adapters/` | Per-tool adapters: `claude-code`, `codex`, `opencode`, `cursor`, `windsurf`, `antigravity` |
| `kit/profiles/` | Install profiles: `standard`, `minimal`, `research`, `durable` |

### `implementations/`

Concrete reference setups for specific tools.

| Tool | What's included |
|---|---|
| [Claude Code](implementations/claude-code/) | Hooks, skills, memory structure, example `CLAUDE.md` |
| [Codex CLI](implementations/codex/) | Setup guide, `config.toml`, approval policies, sandbox modes |
| [OpenCode](implementations/opencode/) | Task orchestrator plugin, session manager, DCP config |
| [Cursor](implementations/cursor/) | Setup guide, scoped rules, memory workarounds |

### `examples/`

Copy-ready starter assets.

- [`backlog.json`](examples/backlog.json) — task queue structure for AI orchestration
- [`.claude/memory/`](examples/.claude/memory/) — memory directory template for Claude Code

## Philosophy

1. Context quality beats model upgrades.
2. Environment design beats provider hopping.
3. Automate scheduling, not only code generation.
4. Keep decisions reusable across sessions.
5. Stay tool-agnostic to avoid lock-in.

## Who This Is For

- Developers using AI coding tools daily who want consistent output quality.
- Teams building shared standards for AI-assisted development.
- New projects that need a strong AI-ready foundation from day one.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

High-impact contributions:
- new reference implementations for tools not yet covered
- production-tested patterns with real failure examples
- improvements to install scripts and safety guardrails

## License

[MIT](LICENSE)
