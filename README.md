# AI Dev Toolkit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/Forge-Space/ai-dev-toolkit)](https://github.com/Forge-Space/ai-dev-toolkit/releases)

Reusable patterns, drop-in rules, portable skills, and cross-tool setup automation so AI coding agents produce code aligned with your project from the first session.

## How do I start using this?

Copy one rule file into your project. That single file gives your AI agent your conventions, workflow, and guardrails before the first prompt.

```bash
# Clone the toolkit
git clone https://github.com/Forge-Space/ai-dev-toolkit.git
cd ai-dev-toolkit

# Copy the rule file that matches your tool
cp rules/CLAUDE.md    ~/my-project/CLAUDE.md       # Claude Code / OpenCode
cp rules/AGENTS.md    ~/my-project/AGENTS.md       # Codex CLI
cp rules/.cursorrules ~/my-project/.cursorrules     # Cursor
cp rules/.windsurfrules ~/my-project/.windsurfrules # Windsurf
cp rules/COPILOT.md   ~/my-project/COPILOT.md      # GitHub Copilot
```

Open your AI tool in `~/my-project/`. The agent now follows your rules automatically.

## How do I install everything at once with forge-kit?

`forge-kit` detects your tools, syncs rules, installs 18 portable skills, merges MCP servers, and configures provider registries — all in one command.

```bash
# Auto-detect installed tools and apply standard profile
FORGE_KIT_DIR=./kit sh kit/install.sh --profile standard

# Target specific tools with a specific profile
FORGE_KIT_DIR=./kit sh kit/install.sh \
  --tools claude-code,codex,opencode \
  --profile standard
```

Preview what will change before committing:

```bash
# Dry run — shows exactly what would be created, updated, or skipped
FORGE_KIT_DIR=./kit sh kit/install.sh --tools all --profile standard --dry-run

# Show what forge-kit has installed
FORGE_KIT_DIR=./kit sh kit/install.sh --status

# Remove all forge-kit managed files
FORGE_KIT_DIR=./kit sh kit/install.sh --uninstall
```

### How do I use the interactive setup wizard?

The wizard walks you through provider selection, fallback chains, token optimization, and autonomy preferences — then generates a `.forge-setup.json` config with resolved model maps.

```bash
# Run the interactive setup wizard
sh kit/setup.sh
# Follow prompts to select provider, fallback, optimization preset, and profile
# Output: .forge-setup.json with resolved model maps and agent assignments
```

It prompts for:

- Primary AI provider (Anthropic, OpenAI, Google, OpenRouter, Ollama)
- Fallback provider
- Local model usage (hybrid cloud + local)
- Token optimization preset (standard, aggressive, minimal)
- Install profile and orchestration preferences

## What patterns are included?

15 tool-agnostic playbooks covering the full AI-assisted development lifecycle:

| Pattern                                                        | When you need it                                     |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| [Context Building](patterns/context-building.md)               | Agents guess instead of finding project knowledge    |
| [Task Orchestration](patterns/task-orchestration.md)           | Multi-step work needs less supervision               |
| [Code Review](patterns/code-review.md)                         | Catching bugs, logic defects, and security issues    |
| [Testing with AI](patterns/testing.md)                         | Higher-value test generation and TDD workflows       |
| [Multi-Model Routing](patterns/multi-model-routing.md)         | Reducing cost by routing cheap tasks to cheap models |
| [Memory Systems](patterns/memory-systems.md)                   | Decisions persisting across sessions                 |
| [Session Management](patterns/session-management.md)           | Parallel sessions conflicting or losing context      |
| [Prompt Engineering](patterns/prompt-engineering.md)           | Inconsistent or imprecise agent responses            |
| [Git Worktrees](patterns/git-worktrees.md)                     | Isolating concurrent tasks on separate branches      |
| [Agent Observability](patterns/agent-observability.md)         | Tracing and regression-testing agent behavior        |
| [Multi-Repo Workflows](patterns/multi-repo.md)                 | Cross-repository coordination                        |
| [Permission Boundaries](patterns/permission-boundaries.md)     | Minimum-privilege tool access                        |
| [Streaming Orchestration](patterns/streaming-orchestration.md) | Event-driven turn loops and token budgeting          |
| [Tool Registry Patterns](patterns/tool-registry-patterns.md)   | Decoupling tool metadata from implementation         |
| [Spec Driven Development](patterns/spec-driven-development.md) | Agents need a stable contract before building        |

## What skills are included?

18 portable skills installed to every tool via `forge-kit`:

```bash
# Skills live in kit/core/skills/ and get copied to each tool's skill directory
ls kit/core/skills/

# Output:
# context.md   cost.md      debug.md     dispatch.md  fallback.md
# loop.md      memory.md    orchestrate.md  plan.md   research.md
# resume.md    review.md    route.md     schedule.md  secure.md
# ship.md      tdd.md       verify.md
```

Key skills for autonomous development:

| Skill         | What it does                                                                |
| ------------- | --------------------------------------------------------------------------- |
| `loop`        | Autonomous dev cycle — plan → implement → test → review → fix → commit → PR |
| `route`       | Classify task complexity and pick the right model tier                      |
| `orchestrate` | Break complex work into phases with dependency tracking                     |
| `dispatch`    | Spawn parallel subtasks across worker agents                                |
| `fallback`    | Handle model/provider failures with automatic fallback chains               |
| `resume`      | Recover session state from git, plans, and open PRs                         |
| `tdd`         | Red/green/refactor cycle with strict ordering                               |
| `secure`      | 5-point security scan: secrets, deps, inputs, permissions, injection        |

## How does the agent system work?

15 specialty agents organized in an org chart, each with a defined role, tier, tool access list, and fallback chain:

```text
orchestrator (Lead Orchestrator)
├── architect (Software Architect)
│   ├── frontend — React, CSS, UI, animations
│   ├── backend — APIs, databases, auth, services
│   ├── worker — Generalist implementation and execution
│   ├── devops — CI/CD, Docker, deployment, monitoring
│   ├── tester — Tests, coverage, e2e, regression
│   └── security — Vulns, secrets, OWASP, audit
├── reviewer — Code review, style, logic defects
│   ├── ts-reviewer — TypeScript and JavaScript review
│   ├── python-reviewer — Python review
│   ├── go-reviewer — Go review
│   └── rust-reviewer — Rust review
├── writer — README, docs, CHANGELOG, API docs
├── researcher — Web search, library investigation
└── explorer — Fast codebase grep (cheapest tier)
```

Tasks are routed to the right specialist automatically:

```json
{
  "specialtyRouting": {
    "ui-work": "frontend",
    "api-work": "backend",
    "ci-cd": "devops",
    "testing": "tester",
    "security-scan": "security",
      "documentation": "writer",
      "code-review": "reviewer",
      "ts-review": "ts-reviewer",
      "python-review": "python-reviewer",
      "go-review": "go-reviewer",
      "rust-review": "rust-reviewer"
  }
}
```

Agents reference tiers (`haiku`/`sonnet`/`opus`), not specific models. Swap providers without changing agent definitions.

## How does autonomous execution work?

The loop engine runs the full dev cycle without stopping:

```text
PLAN → IMPLEMENT → VERIFY → REVIEW → SECURE → COMMIT
  ↓ (repeat per phase)
QUALITY GATES → PUSH → PR
```

Configuration in `kit/core/autopilot.json`:

```json
{
  "defaultLevel": "autonomous",
  "levels": {
    "autonomous": {
      "autoCommit": true,
      "autoPush": true,
      "autoPR": true,
      "autoDispatch": true,
      "autoFix": true,
      "autoEscalate": true,
      "maxUnattendedPhases": 99,
      "pauseOn": ["deploy to production", "database migration", "force push"]
    }
  }
}
```

Agents never pause for lint fixes, type fixes, test fixes, commits, pushes, or file edits. They only stop for genuinely destructive actions.

## How do I run quality checks?

```bash
# Install dependencies
npm install

# Run the full validation suite
npm test                 # 16 governance tests
npm run lint             # ESLint on scripts and tests
npm run validate         # Company schema + kit/core config validation
npm run validate:schema  # Schema validation only

# Run the parity audit — shows cross-tool feature gaps
node scripts/parity-audit.js
```

## How do I preflight a release before mutating a repo?

```bash
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog --github-release
```

The preflight checks git cleanliness, git identity, target tag availability, version source detection, notes-file destination, changelog readiness, and optional `gh` readiness before any release mutation.

Example parity audit output:

```text
Coverage: claude-code 6/6, codex 6/6, opencode 6/6, cursor 6/6, windsurf 6/6, antigravity 6/6
Skills: 19 | Configs: 8 | Gaps: 0
```

## What does the repository contain?

```text
patterns/            15 tool-agnostic workflow playbooks
rules/               Drop-in rule templates (Claude, Codex, Cursor, Windsurf, Copilot)
kit/
  kit/install.sh     Entry point for forge-kit
  kit/setup.sh       Interactive setup wizard
  kit/core/          8 engine configs + 18 portable skills
  kit/adapters/      Per-tool adapters (6 tools)
  kit/profiles/      Install profiles (standard, minimal, research, durable)
implementations/     Reference setups for Claude Code, Codex, OpenCode, Cursor, Windsurf, Antigravity
companies/           Pre-built multi-agent organizations
tools/               Setup scripts + curated productivity stack
best-practices/      Security, workflow, context management standards
examples/            Starter assets (backlog, memory structure)
```

## How do I adopt this incrementally?

| Day | Focus                            | Resource                                                                                                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Drop in a rule file              | [`rules/`](rules/)                                                                                                               |
| 2   | Ground agents in project context | [`patterns/context-building.md`](patterns/context-building.md)                                                                   |
| 3   | Improve execution reliability    | [`patterns/task-orchestration.md`](patterns/task-orchestration.md)                                                               |
| 4   | Review and test quality          | [`patterns/code-review.md`](patterns/code-review.md), [`patterns/testing.md`](patterns/testing.md)                               |
| 5   | Add memory and observability     | [`patterns/memory-systems.md`](patterns/memory-systems.md), [`patterns/agent-observability.md`](patterns/agent-observability.md) |
| 6   | Spec-driven contracts            | [`patterns/spec-driven-development.md`](patterns/spec-driven-development.md)                                                     |
| 7   | Full team setup with forge-kit   | [`kit/`](kit/) + [`implementations/`](implementations/)                                                                          |

Need the current prioritized repository work instead of the general adoption guide? See [`BACKLOG.md`](BACKLOG.md).

## How do I contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md).

High-impact areas: new reference implementations, production-tested pattern updates, adapter improvements, and documentation accuracy fixes.

## License

[MIT](LICENSE)
