[English](README.md) | [Português](README.pt-BR.md)

# Forge Kit

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/LucasSantana-Dev/forgekit)](https://github.com/LucasSantana-Dev/forgekit/releases)

Forge Kit is the unified home for the former `ai-dev-toolkit`, `ai-dev-toolkit-setup`,
`ai-dev-toolkit-pt-br`, and `ai-dev-toolkit-library` projects.

It combines reusable agent rules, portable skills, setup automation, a catalog,
a CLI, and a bilingual web app so AI coding agents start with project conventions,
workflow guardrails, and installable tooling from the first session.

## Monorepo layout

```text
.
├── apps/web              # Astro catalog web app
├── infra/gateway         # Local MCP gateway stack
├── locales/pt-BR         # Portuguese toolkit content
├── packages/catalog      # Catalog data, schemas, importers, validation
├── packages/cli          # forge-kit CLI, with legacy adtl alias
└── packages/setup        # Machine bootstrap layer
```

## First-time install?

Most users should start with [`packages/setup`](packages/setup/README.md) — the
machine bootstrap layer that consumes this toolkit at a pinned version. It
detects your installed tools, applies pre-built configurations, and installs the
entire skill and rule set in one command.

## How do I start using this?

Copy one rule file into your project. That single file gives your AI agent your conventions, workflow, and guardrails before the first prompt.

```bash
# Clone the toolkit
git clone https://github.com/LucasSantana-Dev/forgekit.git
cd forgekit

# Copy the rule file that matches your tool
cp packages/core/rules/CLAUDE.md    ~/my-project/CLAUDE.md       # Claude Code / OpenCode
cp packages/core/rules/AGENTS.md    ~/my-project/AGENTS.md       # Codex CLI
cp packages/core/rules/.cursorrules ~/my-project/.cursorrules     # Cursor
cp packages/core/rules/.windsurfrules ~/my-project/.windsurfrules # Windsurf
cp packages/core/rules/COPILOT.md   ~/my-project/COPILOT.md      # GitHub Copilot
```

Open your AI tool in `~/my-project/`. The agent now follows your rules automatically.

## How do I install everything at once with forge-kit?

`forge-kit` detects your tools, syncs rules, installs 29 portable skills, merges MCP servers, and configures provider registries — all in one command.

```bash
# Auto-detect installed tools and apply standard profile
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --profile standard

# Target specific tools with a specific profile
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh \
  --tools claude-code,codex,opencode \
  --profile standard
```

Preview what will change before committing:

```bash
# Dry run — shows exactly what would be created, updated, or skipped
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --tools all --profile standard --dry-run

# Show what forge-kit has installed
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --status

# Remove all forge-kit managed files
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --uninstall
```

### How do I use the interactive setup wizard?

The wizard walks you through provider selection, fallback chains, token optimization, and autonomy preferences — then generates a `.forge-setup.json` config with resolved model maps.

```bash
# Run the interactive setup wizard
sh packages/core/kit/setup.sh
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

21 tool-agnostic playbooks covering the full AI-assisted development lifecycle:

| Pattern                                                        | When you need it                                     |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| [Context Building](packages/core/patterns/context-building.md)               | Agents guess instead of finding project knowledge    |
| [Task Orchestration](packages/core/patterns/task-orchestration.md)           | Multi-step work needs less supervision               |
| [Code Review](packages/core/patterns/code-review.md)                         | Catching bugs, logic defects, and security issues    |
| [Testing with AI](packages/core/patterns/testing.md)                         | Higher-value test generation and TDD workflows       |
| [Multi-Model Routing](packages/core/patterns/multi-model-routing.md)         | Reducing cost by routing cheap tasks to cheap models |
| [Memory Systems](packages/core/patterns/memory-systems.md)                   | Decisions persisting across sessions                 |
| [Session Management](packages/core/patterns/session-management.md)           | Parallel sessions conflicting or losing context      |
| [Prompt Engineering](packages/core/patterns/prompt-engineering.md)           | Inconsistent or imprecise agent responses            |
| [Git Worktrees](packages/core/patterns/git-worktrees.md)                     | Isolating concurrent tasks on separate branches      |
| [Agent Observability](packages/core/patterns/agent-observability.md)         | Tracing and regression-testing agent behavior        |
| [OpenTelemetry GenAI](packages/core/patterns/opentelemetry-genai.md)         | Vendor-neutral LLM instrumentation and telemetry     |
| [Multi-Repo Workflows](packages/core/patterns/multi-repo.md)                 | Cross-repository coordination                        |
| [Permission Boundaries](packages/core/patterns/permission-boundaries.md)     | Minimum-privilege tool access                        |
| [Prompt Injection Defense](packages/core/patterns/prompt-injection-defense.md) | Layered defenses against direct and indirect attacks |
| [Streaming Orchestration](packages/core/patterns/streaming-orchestration.md) | Event-driven turn loops and token budgeting          |
| [Tool Registry Patterns](packages/core/patterns/tool-registry-patterns.md)   | Decoupling tool metadata from implementation         |
| [Spec Driven Development](packages/core/patterns/spec-driven-development.md) | Agents need a stable contract before building        |
| [MCP Tool Lazy-Loading](packages/core/patterns/mcp-tool-lazy-loading.md)     | Reducing context bloat from 50+ tool schemas         |
| [Agent Evals as CI](packages/core/patterns/agent-evals-ci.md)               | Threshold-based PR gates for agent reliability       |
| [Benchmark Reality Gap](packages/core/patterns/benchmark-reality-gap.md)     | Agent eval accuracy when curated benchmarks overestimate |
| [SKILL.md Adoption](packages/core/patterns/skill-md-adoption.md)            | Vendor-neutral skill discovery and cross-tool auto-invocation |

## What skills are included?

29 portable skills installed to every tool via `forge-kit`:

```bash
# Skills live in packages/core/kit/core/skills/ and get copied to each tool's skill directory
ls packages/core/kit/core/skills/

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

Configuration in `packages/core/kit/core/autopilot.json`:

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
npm run validate         # Company schema + packages/core/kit/core config validation
npm run validate:schema  # Schema validation only

# Run the parity audit — shows cross-tool feature gaps
node scripts/parity-audit.js
```

## How do I preflight a release before mutating a repo?

```bash
python3 packages/core/tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog
python3 packages/core/tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog --github-release
```

The preflight checks git cleanliness, git identity, target tag availability, version source detection, notes-file destination, changelog readiness, and optional `gh` readiness before any release mutation.

Example parity audit output:

```text
Coverage: claude-code 6/6, codex 6/6, opencode 6/6, cursor 6/6, windsurf 6/6, antigravity 6/6
Skills: 19 | Configs: 8 | Gaps: 0
```

## What does the repository contain?

```text
packages/core/patterns/            15 tool-agnostic workflow playbooks
packages/core/rules/               Drop-in rule templates (Claude, Codex, Cursor, Windsurf, Copilot)
packages/core/kit/
  packages/core/kit/install.sh     Entry point for forge-kit
  packages/core/kit/setup.sh       Interactive setup wizard
  packages/core/kit/core/          8 engine configs + 29 portable skills
  packages/core/kit/adapters/      Per-tool adapters (6 tools)
  packages/core/kit/profiles/      Install profiles (standard, minimal, research, durable)
packages/core/implementations/     Reference setups for Claude Code, Codex, OpenCode, Cursor, Windsurf, Antigravity
packages/core/companies/           Pre-built multi-agent organizations
packages/core/tools/               Setup scripts + curated productivity stack
packages/core/best-practices/      Security, workflow, context management standards
packages/core/examples/            Starter assets (backlog, memory structure)
```

## How do I adopt this incrementally?

| Day | Focus                            | Resource                                                                                                                         |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Drop in a rule file              | [`packages/core/rules/`](packages/core/rules/)                                                                                                               |
| 2   | Ground agents in project context | [`packages/core/patterns/context-building.md`](packages/core/patterns/context-building.md)                                                                   |
| 3   | Improve execution reliability    | [`packages/core/patterns/task-orchestration.md`](packages/core/patterns/task-orchestration.md)                                                               |
| 4   | Review and test quality          | [`packages/core/patterns/code-review.md`](packages/core/patterns/code-review.md), [`packages/core/patterns/testing.md`](packages/core/patterns/testing.md)                               |
| 5   | Add memory and observability     | [`packages/core/patterns/memory-systems.md`](packages/core/patterns/memory-systems.md), [`packages/core/patterns/agent-observability.md`](packages/core/patterns/agent-observability.md) |
| 6   | Spec-driven contracts            | [`packages/core/patterns/spec-driven-development.md`](packages/core/patterns/spec-driven-development.md)                                                     |
| 7   | Full team setup with forge-kit   | [`packages/core/kit/`](packages/core/kit/) + [`packages/core/implementations/`](packages/core/implementations/)                                                                          |

Need the current prioritized repository work instead of the general adoption guide? See [`BACKLOG.md`](BACKLOG.md).

## Troubleshooting

### Missing Node ≥22

The toolkit requires Node 22 or later. Check your version:

```bash
node --version
```

If you see `v20.*` or earlier, update Node via your package manager or [nodejs.org](https://nodejs.org).

### Wrong shell

Some tools only work in bash or zsh. Check:

```bash
echo $SHELL
```

If it shows a different shell, switch: `exec bash` or `exec zsh`.

### ~/.claude directory permissions

If `forge-kit` reports permission errors installing to `~/.claude`, fix ownership:

```bash
chmod -R u+rwx ~/.claude
```

### Unsupported provider combinations

Not all provider fallback chains are supported. Example: Anthropic + Ollama fallback is not a valid pairing. The setup wizard will guide you to valid combinations. If you configured manually, verify your `~/.forge-setup.json` provider chain against the docs.

## How do I contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md).

High-impact areas: new reference implementations, production-tested pattern updates, adapter improvements, and documentation accuracy fixes.

## License

[MIT](LICENSE)
