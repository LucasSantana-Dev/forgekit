[English](README.md) | [Português](README.pt-BR.md)

# Forge Kit

**Ship faster with AI — battle-tested rules, skills, and workflows for every major coding agent.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/LucasSantana-Dev/forgekit)](https://github.com/LucasSantana-Dev/forgekit/releases)
[![Shell](https://img.shields.io/badge/shell-bash%20%7C%20zsh-4EAA25?logo=gnu-bash&logoColor=white)](https://github.com/LucasSantana-Dev/forgekit)

**Works with:**
[![Claude Code](https://img.shields.io/badge/Claude%20Code-black?style=flat-square&logo=anthropic&logoColor=white)](https://claude.ai/code)
[![Cursor](https://img.shields.io/badge/Cursor-000000?style=flat-square)](https://cursor.sh)
[![Windsurf](https://img.shields.io/badge/Windsurf-0066FF?style=flat-square)](https://codeium.com/windsurf)
[![Codex](https://img.shields.io/badge/Codex-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/codex)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-000000?style=flat-square&logo=github&logoColor=white)](https://github.com/features/copilot)

---

## Why Forge Kit?

AI agents code faster when they follow your conventions. Forge Kit gives them:

- **Portable rules** — Drop a single file into any project; agents immediately follow your conventions, workflow guardrails, and decision-making patterns.
- **29 reusable skills** — From code review to orchestration to security scans; work across every tool (Claude Code, Cursor, Windsurf, etc.).
- **21 battle-tested patterns** — Full lifecycle playbooks: context building, testing, async execution, multi-model routing, memory systems, and more.
- **Plug-and-play agents** — 15 specialty agents with defined roles, capabilities, and fallback chains—organize your team's work before agents execute it.
- **Full autonomy setup** — One command to detect your tools, sync rules, install skills, and configure provider chains.

**Result:** Agents ship more, you review less, and your codebase stays consistent across sessions and teams.

---

## 30-Second Install

Copy one rule file to give your AI agent your project conventions:

```bash
# Clone or download the toolkit
git clone https://github.com/LucasSantana-Dev/forgekit.git
cd forgekit

# Pick the rule file for your tool
cp packages/core/rules/CLAUDE.md    ~/my-project/CLAUDE.md       # Claude Code / OpenCode
cp packages/core/rules/.cursorrules ~/my-project/.cursorrules     # Cursor
cp packages/core/rules/.windsurfrules ~/my-project/.windsurfrules # Windsurf
cp packages/core/rules/AGENTS.md    ~/my-project/AGENTS.md       # Codex CLI
cp packages/core/rules/COPILOT.md   ~/my-project/COPILOT.md      # GitHub Copilot
```

Open your AI tool in `~/my-project/`. The agent now follows your rules automatically.

### Full Toolkit Install (One Command)

To install all rules, skills, hooks, and MCP configurations:

```bash
# Auto-detect tools and apply standard profile
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --profile standard
```

**Options:**
```bash
# Target specific tools
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh \
  --tools claude-code,cursor,windsurf \
  --profile standard

# Dry run — preview changes
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh \
  --profile standard --dry-run

# Check installation status
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --status

# Remove all forge-kit managed files
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --uninstall
```

### Interactive Setup Wizard

Resolve provider selection, fallback chains, token optimization, and autonomy preferences:

```bash
sh packages/core/kit/setup.sh
```

Prompts for:
- Primary AI provider (Anthropic, OpenAI, Google, OpenRouter, Ollama)
- Fallback provider for resilience
- Local model usage (hybrid cloud + local)
- Token optimization preset (standard, aggressive, minimal)
- Install profile and orchestration preferences

Output: `.forge-setup.json` with resolved model maps and agent assignments.

---

## What's Included

| Component | Count | Purpose |
| --- | --- | --- |
| **Portable Rules** | 5 | Drop-in convention files for Claude Code, Cursor, Windsurf, Codex, Copilot |
| **Skills** | 29 | Reusable workflows across all tools: loop, dispatch, review, orchestrate, etc. |
| **Playbook Patterns** | 21 | Full-lifecycle guidance: context building, testing, memory, observability, security, specs |
| **Specialty Agents** | 15 | Organized team with defined roles, tiers, and capabilities |
| **MCP Integration** | 6 | Tool adapters + centralized gateway for unified model context |
| **Setup Automation** | 4 | Profiles (standard, minimal, research, durable) + detection logic |

### Key Skills at a Glance

| Skill | What it does |
| --- | --- |
| `loop` | Autonomous dev cycle — plan → implement → test → review → fix → commit → PR |
| `orchestrate` | Break complex work into phases with dependency tracking |
| `dispatch` | Spawn parallel subtasks across worker agents |
| `route` | Classify task complexity and pick the right model tier |
| `fallback` | Handle provider failures with automatic fallback chains |
| `resume` | Recover session state from git, plans, and open PRs |
| `tdd` | Red/green/refactor cycle with strict ordering |
| `secure` | 5-point security scan: secrets, deps, inputs, permissions, injection |
| `review` | Code review with style, logic defects, and SOLID checks |
| `memory` | Durable session state across multiple agent interactions |

See `packages/core/kit/core/skills/` for the full set.

### Playbook Patterns (21 Total)

Context building, task orchestration, code review, testing with AI, multi-model routing, memory systems, session management, prompt engineering, git worktrees, observability, telemetry, multi-repo workflows, permission boundaries, prompt injection defense, streaming orchestration, tool registry patterns, spec-driven development, lazy-loaded MCP tools, agent evals as CI, benchmark reality gap, and SKILL.md adoption.

Full catalog: [`packages/core/patterns/`](packages/core/patterns/)

---

## How It Works

### Architecture: Monorepo Layout

```
forgekit/
├── apps/web              # Astro catalog web app — browse patterns, agents, skills
├── infra/gateway         # Local MCP gateway stack — unified context server
├── locales/pt-BR         # Portuguese toolkit content
├── packages/
│   ├── catalog           # Catalog schemas, importers, validation
│   ├── cli               # forge-kit CLI + legacy adtl alias
│   ├── setup             # Machine bootstrap layer
│   └── core/             # Rules, skills, patterns, agents, implementations
```

### The Loop: How Agents Execute

Agents execute in phases with quality gates and safe escalation:

```
PLAN → IMPLEMENT → VERIFY → REVIEW → SECURE → COMMIT
  ↓ (repeat per phase)
QUALITY GATES → PUSH → PR
```

Each phase is gated by:
- Type checking and linting
- Test coverage verification
- Security baseline checks
- Code review gates (style, logic, SOLID)
- Safe escalation for destructive actions (deploy, force push, migrations)

**Never pauses for:** lint fixes, type fixes, test fixes, commits, pushes, or file edits.

**Always pauses for:** production deploys, database migrations, force pushes.

Configuration: `packages/core/kit/core/autopilot.json`

### Specialist Routing

15 agents organized by domain. Tasks route automatically:

```
orchestrator (Lead)
├── architect (Design)
│   ├── frontend       # React, CSS, UI, animations
│   ├── backend        # APIs, databases, auth
│   ├── worker         # Generalist execution
│   ├── devops         # CI/CD, Docker, deployment
│   ├── tester         # Tests, coverage, e2e
│   └── security       # Vulns, secrets, OWASP
├── reviewer           # Code review specialist
│   ├── ts-reviewer    # TypeScript / JavaScript
│   ├── python-reviewer
│   ├── go-reviewer
│   └── rust-reviewer
├── writer             # Docs, README, CHANGELOG
├── researcher         # Web search, investigation
└── explorer           # Fast codebase grep
```

Agents reference **tiers** (`haiku`/`sonnet`/`opus`), not specific models — swap providers without changing definitions.

---

## Get Started: Adoption Paths

### Day 1: One File
```bash
cp packages/core/rules/CLAUDE.md ~/my-project/CLAUDE.md
```
Agents now follow your conventions.

### Day 2: Context Grounding
Use pattern: [`packages/core/patterns/context-building.md`](packages/core/patterns/context-building.md)
Agents locate project knowledge automatically.

### Day 3: Execution Reliability
Use pattern: [`packages/core/patterns/task-orchestration.md`](packages/core/patterns/task-orchestration.md)
Multi-step work happens with less supervision.

### Days 4–7: Full Toolkit
Run:
```bash
FORGE_KIT_DIR=./packages/core/kit sh packages/core/kit/install.sh --profile standard
```

Install all 29 skills, 21 patterns, MCP config, and 15 specialist agents.

For prioritized work instead of general adoption, see [`BACKLOG.md`](BACKLOG.md).

---

## Quality Checks & Releases

### Validate the Toolkit

```bash
npm install
npm test                 # 16 governance tests
npm run lint             # ESLint on scripts and tests
npm run validate         # Schema + config validation
npm run validate:schema  # Schema validation only
```

### Pre-flight Release Checks

```bash
python3 packages/core/tools/release.py \
  --repo /path/to/repo \
  --verify \
  --level patch \
  --notes-file RELEASE_NOTES.md \
  --changelog
```

Checks: git cleanliness, git identity, target tag availability, version detection, notes readiness, changelog, and optional GitHub CLI readiness — *before any release mutation*.

### Parity Audit

Cross-tool feature coverage:

```bash
node scripts/parity-audit.js

# Output example:
# Coverage: claude-code 6/6, cursor 6/6, windsurf 6/6, ...
# Skills: 29 | Configs: 8 | Gaps: 0
```

---

## Troubleshooting

### Node ≥22 Required

```bash
node --version
```

If you see `v20.*` or earlier, update via your package manager or [nodejs.org](https://nodejs.org).

### Shell Compatibility

Some tools only work in bash or zsh:
```bash
echo $SHELL
```

If needed: `exec bash` or `exec zsh`

### Permission Issues

If forge-kit reports errors writing to `~/.claude`:
```bash
chmod -R u+rwx ~/.claude
```

### Invalid Provider Combinations

Not all fallback chains are valid (e.g., Anthropic + Ollama). The setup wizard guides you to supported pairings. Verify your manual `~/.forge-setup.json` against the docs.

---

## How to Contribute

Forge Kit is open to community contributions. High-impact areas:

- **Reference implementations** — Production setups for Claude Code, Codex, Cursor, Windsurf, Copilot
- **Pattern updates** — Refinements to existing playbooks, new patterns from real workflows
- **Adapter improvements** — Better tool-specific integration and configuration
- **Documentation** — Accuracy fixes, translation, adoption guides

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full contribution workflow.

---

## Repository Contents

```
packages/core/patterns/       21 tool-agnostic workflow playbooks
packages/core/rules/          Drop-in rule templates (Claude, Codex, Cursor, Windsurf, Copilot)
packages/core/kit/
  install.sh                  Entry point for forge-kit
  setup.sh                    Interactive setup wizard
  core/                       8 engine configs + 29 portable skills
  adapters/                   Per-tool adapters (6 tools)
  profiles/                   Install profiles (standard, minimal, research, durable)
packages/core/implementations Reference setups for each tool
packages/core/companies/      Pre-built multi-agent organizations
packages/core/tools/          Setup scripts + productivity stack
packages/core/best-practices/ Security, workflow, context management standards
packages/core/examples/       Starter assets (backlog, memory structure)
```

For detailed context about the project, see [`CONTEXT.md`](CONTEXT.md).

---

## License

[MIT](LICENSE)

---

## Learn More

- **[CLAUDE.md](CLAUDE.md)** — Governance and conventions for this project
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute
- **[CONTEXT.md](CONTEXT.md)** — Project architecture and goals
- **[BACKLOG.md](BACKLOG.md)** — Prioritized work ahead
- **[CHANGELOG.md](CHANGELOG.md)** — Release history
