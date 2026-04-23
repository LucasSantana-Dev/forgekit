# ai-dev-toolkit vs ai-dev-toolkit-setup: Responsibility Split

## Executive Summary

**ai-dev-toolkit** = Canonical source of truth for all AI-assisted development content: patterns, rules, skills, agents, MCP configs, and implementations (provider-agnostic).
**ai-dev-toolkit-setup** = Optional bootstrap/distribution layer: machine-level setup scripts, shell helpers, and environment preparation that **consumes** from ai-dev-toolkit at a pinned version.

> **Migration status**: This repo is transitioning to consume content from
> ai-dev-toolkit instead of shipping its own copies. See `OWNERSHIP.md` for the
> current ownership map, `TOOLKIT_VERSION` for the pinned release, and the
> toolkit-side canonical declaration in
> [ai-dev-toolkit/OWNERSHIP.md](https://github.com/LucasSantana-Dev/ai-dev-toolkit/blob/main/OWNERSHIP.md).

---

## Core Toolkit Responsibilities (ai-dev-toolkit)

The **ai-dev-toolkit** repository provides **portable, reusable patterns** that apply across projects and machines:

### 1. **Shared Guidance & Conventions**
- **File**: `AGENTS.md` (copied to `~/.config/opencode/AGENTS.md`)
- **Content**: Identity, workflow principles, verification standards, project discovery patterns
- **Scope**: How to approach code, when to read local docs, preference for portable automation
- **Provider-agnostic**: Yes — applies to any AI-assisted workflow

### 2. **Skill Templates & Implementations**
- **Location**: `config/opencode/skills/agents/` and `config/opencode/skills/codex/`
- **Examples**:
  - `ai-toolkit-repo-intake` — Fast onboarding into unfamiliar repos
  - `ai-toolkit-plan-change` — Plan code changes before editing
  - `ai-toolkit-root-cause-debug` — Systematic debugging workflow
  - `ai-toolkit-ship-check` — Pre-merge validation
  - `ai-toolkit-release` — Release planning and execution
- **Scope**: Reusable skill definitions that can be installed into `~/.opencode/skills/`
- **Provider-agnostic**: Yes — skills work with any OpenCode-compatible agent

### 3. **OpenCode Configuration Templates**
- **Files**: `opencode.template.jsonc`, `dcp.template.jsonc`
- **Content**: Agent definitions, MCP baseline, command templates, context compression defaults
- **Scope**: Portable config structure that can be extended per-machine
- **Provider-agnostic**: Yes — defines agent roles and MCP structure, not provider credentials

### 4. **Project-Level Patterns**
- **Scope**: Rules, conventions, and implementations meant to be applied **inside** individual projects
- **Examples**: `.cursor/rules/`, `AGENTS.md` per-project, skill overlays
- **Provider-agnostic**: Yes — patterns work across OpenCode, Cursor, Claude Code, etc.

---

## Setup Repo Responsibilities (ai-dev-toolkit-setup)

The **ai-dev-toolkit-setup** repository provides **machine-level bootstrap and optional accelerators**:

### 1. **System Package Installation**
- **Files**: `scripts/install-macos.sh`, `scripts/install-ubuntu.sh`, `scripts/install-windows.ps1`
- **What**: Git, GitHub CLI, Node.js, Python 3, jq, ripgrep, fd, fzf, tmux, OpenCode CLI
- **macOS extras**: zoxide, atuin, eza, bat, starship, direnv
- **Scope**: One-time machine setup
- **Provider-agnostic**: Yes — installs tools, not credentials

### 2. **Shell Configuration & Helpers**
- **File**: `config/shell/shell.sh` → `~/.config/ai-dev-toolkit/shell.sh`
- **Helpers provided**:
  - **Git aliases**: `gs`, `ga`, `gc`, `gp`
  - **Tmux aliases**: `ta`, `tn`, `tls`, `tk`, `ts`, `tns`, `tboot`, `tonboard`
  - **Tmux templates**: `ttemplate-suggest`, `ttemplate-preview`, `ttemplate-apply`
  - **MCP helpers**: `mcp-status`, `mcp-enable`, `mcp-disable`, `mcp-health`
  - **Release helpers**: `release-plan`, `release-patch`, `release-minor`, `release-major`, `release-tag` (with `--github-release` variants)
  - **Repo onboarding**: `repo-terminal-ready`, `repo-terminal-ready-yes`
  - **Workspace**: `work`, `work-here`
- **Scope**: Portable shell functions sourced from `~/.bashrc` or `~/.zshrc`
- **Provider-agnostic**: Yes — helpers are tool-agnostic

### 3. **Tmux Workflow**
- **Files**: `config/tmux/` (sessionizer, smart-new, bootstrap, onboard, template generation, repo preferences)
- **Scope**: Per-project tmux session templates, auto-detection, onboarding
- **Provider-agnostic**: Yes — tmux is independent of AI providers

### 4. **OpenCode Bootstrap**
- **Files**: `scripts/setup-ai-tools.sh`, `config/opencode/`
- **What it does**:
  - Creates `~/.config/opencode/` directory structure
  - Copies `AGENTS.md` (shared guidance)
  - Renders `opencode.jsonc` from template
  - Copies `dcp.jsonc` (context compression defaults)
  - Installs starter-pack skills into `~/.opencode/skills/agents/` and `~/.opencode/skills/codex/`
  - Creates `~/.config/ai-dev-toolkit/local.env` template
- **Scope**: Machine-level OpenCode environment
- **Provider-agnostic**: Yes — config structure, not credentials

### 5. **Guided Authentication Scripts**
- **Files**: `scripts/auth-ai-tools.sh`, `scripts/auth-mcp-tools.sh`
- **What**: Interactive prompts for `gh auth login`, `opencode auth login`, Claude Code login
- **Scope**: Guidance only — does not store credentials
- **Provider-agnostic**: Yes — guides the user through provider-specific auth, but doesn't automate it

### 6. **MCP Health & Status Helpers**
- **Canonical source**: `ai-dev-toolkit/tools/mcp-health.py`, `ai-dev-toolkit/tools/toggle-mcp.py`
- **Setup repo role**: install/bootstrap wiring and optional fallback delivery
- **What**: Check MCP server status, enable/disable MCPs, validate connections
- **Scope**: Runtime MCP management
- **Provider-agnostic**: Yes — works with any MCP configuration

### 7. **Release Automation**
- **Canonical source**: `ai-dev-toolkit/tools/release.py`
- **Setup repo role**: install/bootstrap wiring and optional fallback delivery
- **What**: Bump versions, promote CHANGELOG, tag, push, create GitHub releases
- **Scope**: Portable release workflow for any repo
- **Provider-agnostic**: Yes — uses GitHub CLI, not provider-specific APIs

---

## What Remains Provider-Specific or Manual

### 1. **AI Provider Authentication**
- **Setup repo provides**: Template file (`templates/local.env.example`) with placeholders
- **User must provide**: 
  - `OPENAI_API_KEY` (if using OpenAI)
  - `ANTHROPIC_API_KEY` (if using Anthropic)
  - `OPENROUTER_API_KEY` (if using OpenRouter)
  - Other provider keys as needed
- **File**: `~/.config/ai-dev-toolkit/local.env` (sourced by shell.sh)
- **Why manual**: Credentials are sensitive and provider-specific

### 2. **MCP Provider Configuration**
- **Setup repo provides**: Base MCP structure in `opencode.jsonc` (filesystem, memory, sequential-thinking, context7)
- **User must add**: OAuth/auth for provider-specific MCPs (Linear, Sentry, Vercel, etc.)
- **How**: `mcp-enable <provider>` then `bash ./scripts/auth-mcp-tools.sh <provider>`
- **Why manual**: Each provider has different auth flows

### 3. **Project-Specific Skills**
- **Setup repo provides**: Starter pack (6 agent skills, 3 codex skills)
- **User must install**: Additional skills from `ai-dev-toolkit` or third-party sources
- **How**: Copy skills into `~/.opencode/skills/agents/` or `~/.opencode/skills/codex/`
- **Why manual**: Skills are project/workflow-specific

### 4. **Local Secrets & Tokens**
- **Setup repo provides**: Structure (`~/.config/ai-dev-toolkit/local.env`)
- **User must provide**: GitHub token, API keys, private MCP credentials
- **Why manual**: Secrets should never be in repos

### 5. **Project-Level Customization**
- **Setup repo provides**: Nothing — this is toolkit territory
- **User must create**: Per-project `AGENTS.md`, `.cursor/rules/`, skill overlays
- **Why manual**: Each project has different conventions and needs

---

## File Reference Map

### ai-dev-toolkit-setup Files

| File | Purpose | Scope |
|------|---------|-------|
| `bootstrap.sh` | Main entry point for macOS/Linux | Machine setup |
| `bootstrap.ps1` | Main entry point for Windows | Machine setup |
| `scripts/install-macos.sh` | Homebrew package installation | System packages |
| `scripts/install-ubuntu.sh` | apt package installation | System packages |
| `scripts/install-windows.ps1` | Chocolatey/winget installation | System packages |
| `scripts/install-ai-clis.sh` | OpenCode, Claude Code CLI | AI tools |
| `scripts/setup-shell.sh` | Shell helper installation | Shell config |
| `scripts/setup-tmux.sh` | Tmux workflow installation | Tmux config |
| `scripts/setup-ai-tools.sh` | Toolkit-driven AI tools bootstrap | AI tools setup |
| `scripts/setup-local-env.sh` | Local env file creation | Secrets template |
| `scripts/auth-ai-tools.sh` | Interactive auth guidance | Auth scaffolding |
| `scripts/auth-mcp-tools.sh` | MCP-specific auth guidance | MCP auth |
| `scripts/doctor.sh` | Environment validation | Verification |
| `scripts/ci-check.sh` | CI checks (lint, test, etc.) | Quality gates |
| `config/shell/shell.sh` | Shell functions & aliases | Shell helpers |
| `config/ai-tools/AGENTS.md` | Offline fallback guidance | Conventions |
| `config/ai-tools/opencode.template.jsonc` | Offline OpenCode config fallback | Agent/MCP config |
| `config/ai-tools/dcp.template.jsonc` | Offline context compression fallback | Token optimization |
| `config/tmux/*` | Tmux session templates | Tmux workflow |
| `templates/local.env.example` | Secrets template | Secrets scaffolding |
| `Brewfile` | Homebrew dependencies | macOS packages |

### ai-dev-toolkit Files (Referenced, Not Cloned)

| File | Purpose | Scope |
|------|---------|-------|
| `kit/install.sh` + `kit/adapters/opencode.sh` | Canonical AI tool installer flow | Distribution logic |
| `kit/core/skills/*` | Reusable agent and codex skill library | Skill library |
| `implementations/opencode/*.jsonc` | Canonical OpenCode config templates | Agent/MCP config |
| `tools/mcp-health.py` | MCP status checker | MCP management |
| `tools/toggle-mcp.py` | MCP enable/disable | MCP management |
| `tools/release.py` | Release automation | Release workflow |
| Project-level patterns | Rules, implementations, examples | Per-project guidance |

---

## Workflow: Using Both Repos

### Step 1: Bootstrap Machine (ai-dev-toolkit-setup)
```bash
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
source ~/.bashrc  # or ~/.zshrc
```

**Result**: 
- System packages installed
- Shell helpers available
- Toolkit-managed AI tool environment created from the pinned release
- Starter skills installed from toolkit-owned assets
- Local env template created

### Step 2: Authenticate (Manual + Setup Guidance)
```bash
gh auth login
bash ./scripts/auth-ai-tools.sh
bash ./scripts/auth-mcp-tools.sh
# Fill in ~/.config/ai-dev-toolkit/local.env with API keys
```

**Result**: 
- GitHub authenticated
- OpenCode authenticated
- AI provider keys configured
- MCP providers enabled (optional)

### Version pin note

This repo currently consumes `ai-dev-toolkit` via `TOOLKIT_VERSION=0.17.0`. Features merged upstream become available after a new toolkit tag is published and this pin is bumped.

### Step 3: Enter a Project (ai-dev-toolkit)
```bash
cd /path/to/project
repo-terminal-ready
```

**Result**: 
- Tmux session created with project-specific template
- Project's `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/` loaded
- Ready for AI-assisted development

### Step 4: Extend Skills (ai-dev-toolkit)
Copy additional skills from `ai-dev-toolkit` into `~/.opencode/skills/agents/` or `~/.opencode/skills/codex/`.

**Result**: 
- Custom workflows available across all projects

---

## Summary Table

| Aspect | ai-dev-toolkit | ai-dev-toolkit-setup |
|--------|---|---|
| **Purpose** | Reusable patterns & implementations | Machine bootstrap & helpers |
| **Scope** | Provider-agnostic workflows | Provider-agnostic setup + optional auth scaffolding |
| **Installation** | Per-project or global skills | One-time machine setup |
| **Customization** | Per-project rules, skills, patterns | Per-machine env, MCP config, shell helpers |
| **Secrets** | None (project-level) | Template only; user fills in credentials |
| **Maintenance** | Update skills as needed | Update bootstrap scripts as needed |
| **Dependency** | Requires ai-dev-toolkit-setup first | Standalone, but references ai-dev-toolkit |
| **Key Files** | AGENTS.md, skills/, patterns | bootstrap.sh, config/, scripts/ |

---

## What a User Needs from Toolkit Alone (Provider-Agnostic)

1. **Shared guidance** (`AGENTS.md`) — how to approach AI-assisted development
2. **Skill templates** — reusable workflows (repo intake, planning, debugging, shipping)
3. **Config structure** — how to organize agents, MCPs, and skills
4. **Project patterns** — rules, conventions, implementations to apply in projects
5. **No credentials required** — all patterns work without provider auth

## What Setup Adds (Bootstrap + Helpers)

1. **One-time machine setup** — packages, shell, tmux, OpenCode environment
2. **Shell helpers** — aliases and functions for common tasks
3. **Release automation** — version bumping, changelog, tagging
4. **MCP management** — enable/disable, health checks
5. **Auth scaffolding** — guided prompts for provider authentication
6. **Starter skills** — 9 pre-installed skills to get started immediately

## What Remains Manual (Provider-Specific)

1. **AI provider credentials** — OpenAI, Anthropic, OpenRouter, etc.
2. **MCP provider auth** — Linear, Sentry, Vercel, etc.
3. **Project customization** — per-project AGENTS.md, rules, skills
4. **Local secrets** — GitHub token, private API keys
