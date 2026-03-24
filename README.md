# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Your AI agent writes generic code because it has zero context about your project.**

This toolkit fixes that. It captures battle-tested, tool-agnostic patterns for AI-assisted development — the same patterns that work whether you use Claude Code, Cursor, Windsurf, Copilot, OpenCode, or something that doesn't exist yet.

## Before / After

| Without this toolkit | With this toolkit |
|---------------------|-------------------|
| Agent writes generic boilerplate | Agent follows your conventions from line 1 |
| You re-explain project structure every session | Context files give instant project understanding |
| You manually dispatch work to each session | Task orchestrator auto-dispatches from a backlog |
| Opus for everything ($$$) | Fast model for simple tasks, Opus only when needed |
| Every Monday starts from zero | Memory carries decisions, preferences, and gotchas forward |
| Agent force-pushes over your branch | Permission guards block dangerous operations |

## Quick Start

**Step 1** — Add context rules to your project (2 minutes, highest impact):

```bash
# Pick your tool:
cp rules/CLAUDE.md your-project/CLAUDE.md       # Claude Code / OpenCode
cp rules/.cursorrules your-project/.cursorrules  # Cursor
cp rules/.windsurfrules your-project/.windsurfrules  # Windsurf
cp rules/COPILOT.md your-project/COPILOT.md      # GitHub Copilot
```

**Step 2** — Read the [Context Building](patterns/context-building.md) pattern and customize the rules for your project.

**Step 3** — Set up your terminal (optional but recommended):

```bash
bash tools/install-macos.sh     # macOS
bash tools/install-ubuntu.sh    # Ubuntu/Linux
.\tools\install-windows.ps1     # Windows (PowerShell as Admin)
```

**Step 4** — Adopt incrementally. Pick one pattern, apply it for a week, then add another.

> The key is the environment setting, not the actual tool. The context building, not the provider.

## Philosophy

1. **Context is everything** — A well-structured project with clear rules beats any model upgrade
2. **Environment > Provider** — Invest in your dev environment, not in chasing the latest model
3. **Automate the scheduler, not just the code** — Let AI manage task queues, not just execute prompts
4. **Compound knowledge** — Every session should make the next one better
5. **Decoupled patterns** — Everything here works across tools. Vendor lock-in is a bug

## What's Inside

### Patterns (`patterns/`)

Tool-agnostic working patterns for AI-assisted development:

| Pattern | Problem it solves |
|---------|------------------|
| [Context Building](patterns/context-building.md) | AI doesn't understand your project |
| [Prompt Engineering](patterns/prompt-engineering.md) | Vague prompts produce vague code |
| [Task Orchestration](patterns/task-orchestration.md) | Manually re-prompting each session |
| [Multi-Model Routing](patterns/multi-model-routing.md) | Overpaying for simple tasks |
| [Session Management](patterns/session-management.md) | Cluttered workspaces, slow switching |
| [Memory Systems](patterns/memory-systems.md) | Repeating yourself across sessions |
| [Code Review](patterns/code-review.md) | Missing bugs in AI-generated code |
| [Testing with AI](patterns/testing.md) | Brittle, low-value AI-generated tests |
| [Git Worktrees](patterns/git-worktrees.md) | Multi-session branch conflicts |
| [Agent Gotchas](patterns/agent-gotchas.md) | Silent failures, hallucinations, over-engineering |
| [Multi-Repo Workflows](patterns/multi-repo.md) | Cross-repo coordination chaos |

### Best Practices (`best-practices/`)

| Guide | What it covers |
|-------|---------------|
| [Security](best-practices/security.md) | Secrets management, agent permissions, CI scanning |
| [Workflow](best-practices/workflow.md) | Trunk-based dev, conventional commits, quality gates |
| [Context Optimization](best-practices/context-management.md) | Token management, MCP strategy, session hygiene |

### Rules (`rules/`)

Drop-in project rules for every major AI coding tool:

| File | Tool |
|------|------|
| [`CLAUDE.md`](rules/CLAUDE.md) | Claude Code, OpenCode |
| [`AGENTS.md`](rules/AGENTS.md) | OpenCode |
| [`.cursorrules`](rules/.cursorrules) | Cursor |
| [`.windsurfrules`](rules/.windsurfrules) | Windsurf |
| [`COPILOT.md`](rules/COPILOT.md) | GitHub Copilot |

### Terminal Tools (`tools/`)

CLI tools that boost productivity regardless of AI tool:

lazygit, fzf, bat, eza, delta, zoxide, atuin, btop, fd, ripgrep, jq, yq, chezmoi

One-command install for [macOS](tools/install-macos.sh), [Ubuntu](tools/install-ubuntu.sh), and [Windows](tools/install-windows.ps1).
The Windows installer is idempotent for Scoop buckets and avoids duplicate bucket
add errors on reruns.

Also includes a curated list of high-impact AI productivity tools from community picks:
[Curated AI Productivity Additions](tools/README.md#curated-ai-productivity-additions).
Recent additions include community-backed integrations for
`planning-with-files`, `antigravity-awesome-skills`, `OpenViking`,
`browser-use`, `Letta`, `Mem0`, and `Graphiti`.

### Reference Implementations (`implementations/`)

Concrete implementations of the patterns above for specific tools:

| Tool | What's included |
|------|----------------|
| [Claude Code](implementations/claude-code/) | Hooks, skills, memory structure, example CLAUDE.md |
| [OpenCode](implementations/opencode/) | Task orchestrator plugin, session manager, DCP config |
| [Cursor](implementations/cursor/) | Setup guide, scoped rules, memory workarounds |

### Examples (`examples/`)

Ready-to-copy starter files:
- [`backlog.json`](examples/backlog.json) — Task orchestration backlog
- [`.claude/memory/`](examples/.claude/memory/) — Memory system structure

## Who This Is For

- **Solo developers** using AI coding tools daily who want to be 2-3x more productive
- **Teams** adopting AI-assisted development who need shared standards
- **Anyone** setting up a new dev environment optimized for AI workflows

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We're especially looking for:
- Reference implementations for Windsurf, Copilot, and other tools
- New patterns you've validated in production
- CLI tool recommendations

## License

[MIT](LICENSE)
