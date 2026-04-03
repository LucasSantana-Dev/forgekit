# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/Forge-Space/ai-dev-toolkit)](https://github.com/Forge-Space/ai-dev-toolkit/releases)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Most AI coding failures are context failures, not model failures.**

One rule file. Five minutes. Your agent starts writing code that matches your project.

```bash
cp rules/CLAUDE.md your-project/CLAUDE.md
```

That single file gives Claude Code your conventions, workflow, and guardrails before the first prompt. Equivalent templates exist for [Codex](rules/AGENTS.md), [Cursor](rules/.cursorrules), [Windsurf](rules/.windsurfrules), and [Copilot](rules/COPILOT.md).

## What changes

| Without toolkit                   | With toolkit                             |
| --------------------------------- | ---------------------------------------- |
| Generic boilerplate every session | Code aligned to your conventions         |
| Re-explaining project structure   | Context loaded automatically             |
| One expensive model for all tasks | Right model per task complexity          |
| No audit trail                    | Traces, regression tests, security scans |
| Repeated decisions across weeks   | Persistent memory and durable context    |

## Start here

### Step 1 — Drop in a rule file (30 seconds)

```bash
cp rules/CLAUDE.md your-project/CLAUDE.md       # Claude Code / OpenCode
cp rules/AGENTS.md your-project/AGENTS.md       # Codex CLI / OpenCode
cp rules/.cursorrules your-project/.cursorrules  # Cursor
cp rules/.windsurfrules your-project/.windsurfrules  # Windsurf
cp rules/COPILOT.md your-project/COPILOT.md     # GitHub Copilot
```

### Step 2 — Read one pattern (10 minutes)

[**Context Building**](patterns/context-building.md) is the foundation. It teaches you how to structure project knowledge so agents find it instead of guessing.

### Step 3 — Keep going

| Pattern                                                        | When you need it                              |
| -------------------------------------------------------------- | --------------------------------------------- |
| [Task Orchestration](patterns/task-orchestration.md)           | Multi-step work needs less supervision        |
| [Code Review](patterns/code-review.md)                         | Catching bugs and risky changes               |
| [Testing with AI](patterns/testing.md)                         | Higher-value test generation                  |
| [Multi-Model Routing](patterns/multi-model-routing.md)         | Cost or latency reduction                     |
| [Memory Systems](patterns/memory-systems.md)                   | Decisions persisting across sessions          |
| [Session Management](patterns/session-management.md)           | Parallel sessions conflicting                 |
| [Prompt Engineering](patterns/prompt-engineering.md)           | Inconsistent or imprecise responses           |
| [Git Worktrees](patterns/git-worktrees.md)                     | Isolating concurrent tasks                    |
| [Agent Observability](patterns/agent-observability.md)         | Tracing and regression-testing agent behavior |
| [Multi-Repo Workflows](patterns/multi-repo.md)                 | Cross-repository coordination                 |
| [Permission Boundaries](patterns/permission-boundaries.md)     | Minimum-privilege tool access                 |
| [Streaming Orchestration](patterns/streaming-orchestration.md) | Event-driven turn loops and budgeting         |
| [Tool Registry Patterns](patterns/tool-registry-patterns.md)   | Decoupling tool metadata from implementation  |
| [Spec Driven Development](patterns/spec-driven-development.md) | Agents need a stable contract                 |
| [Agent Gotchas](patterns/agent-gotchas.md)                     | Avoiding common AI workflow failures          |

## forge-kit — one-command setup

Sync rules, skills, MCP config, and provider registries across all your AI tools with a single command.

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --profile standard
```

| Flag               | What it does                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `--tools <list>`   | Target specific tools: `claude-code`, `codex`, `opencode`, `cursor`, `windsurf`, `antigravity`, `all`, or `auto` |
| `--profile <name>` | `standard` (default), `minimal`, `research`, `durable`                                                           |
| `--oh-my-compat`   | Opt-in bridge for oh-my orchestration layers                                                                     |
| `--dry-run`        | Preview changes without writing                                                                                  |
| `--status`         | Show current installation state                                                                                  |
| `--uninstall`      | Remove forge-kit managed files                                                                                   |

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --tools claude-code,codex --profile standard --dry-run
FORGE_KIT_DIR=./kit sh kit/install.sh --tools all --oh-my-compat
FORGE_KIT_DIR=./kit sh kit/install.sh --uninstall
```

`--oh-my-compat` installs optional compatibility references for mixed setups with [oh-my-openagent](implementations/opencode/oh-my-openagent.jsonc), [oh-my-claudecode](implementations/claude-code/oh-my-claudecode.md), and [oh-my-codex](implementations/codex/oh-my-codex.md). Default installs remain fully tool-agnostic.

## Adopt in one week

| Day | Focus                            | Resource                                                                                                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rule file + baseline conventions | [`rules/`](rules/)                                                                                                               |
| 2   | Ground agents in project context | [`patterns/context-building.md`](patterns/context-building.md)                                                                   |
| 3   | Improve execution reliability    | [`patterns/task-orchestration.md`](patterns/task-orchestration.md)                                                               |
| 4   | Review and test quality          | [`patterns/code-review.md`](patterns/code-review.md), [`patterns/testing.md`](patterns/testing.md)                               |
| 5   | Memory and observability         | [`patterns/memory-systems.md`](patterns/memory-systems.md), [`patterns/agent-observability.md`](patterns/agent-observability.md) |
| 6   | Spec-driven contracts            | [`patterns/spec-driven-development.md`](patterns/spec-driven-development.md)                                                     |
| 7   | Standardize team setup           | [`kit/`](kit/) + [`implementations/`](implementations/)                                                                          |

## Repository map

```
patterns/            Tool-agnostic workflow playbooks (15 patterns)
rules/               Drop-in rule templates (Claude, Codex, Cursor, Windsurf, Copilot)
kit/                 forge-kit installer, adapters, profiles, core config
  kit/install.sh     Entry point
  kit/core/          Shared rules, providers, MCP, skills (6 portable skills)
  kit/adapters/      Per-tool adapters (6 tools)
  kit/profiles/      Install profiles (4 profiles)
implementations/     Reference setups for Claude Code, Codex, OpenCode, Cursor
companies/           Pre-built multi-agent organizations (fullstack-forge: 49 agents, 66 skills)
tools/               Setup scripts + curated productivity stack
best-practices/      Security, workflow, context management standards
examples/            Starter assets (backlog, memory structure)
```

See [tools/README.md](tools/README.md) for the full curated stack, OpenCode plugins, Claude Code skills, and recommended adoption order.

## Philosophy

1. Context quality beats model upgrades
2. Environment design beats provider hopping
3. Automate scheduling, not only generation
4. Make decisions reusable across sessions
5. Stay tool-agnostic to avoid lock-in

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

High-impact contributions: new reference implementations, production-tested patterns, install script improvements, and documentation fixes.

## License

[MIT](LICENSE)
