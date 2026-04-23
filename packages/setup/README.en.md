# ai-dev-toolkit-setup

**Language:** English | [Português](README.md)

> **Repository role:** `ai-dev-toolkit-setup` is the optional bootstrap, installer, and distribution layer. The canonical source of truth for reusable patterns, skills, agents, and helper logic lives in `ai-dev-toolkit`.

Portable setup for `ai-dev-toolkit` on new machines, without depending on personal dotfiles.

Looking for the shareable guide with patterns, rule templates, and tool-specific implementations? See the companion repository [ai-dev-toolkit](https://github.com/LucasSantana-Dev/ai-dev-toolkit).

## Which repository should I use?

- Use **ai-dev-toolkit-setup** when you want to prepare a new machine with shell, tmux, OpenCode, MCP/release helpers, and a baseline agent-ready environment.
- Use **ai-dev-toolkit** when you want reusable patterns, rule templates, and reference implementations to apply inside your own repositories.

The ownership map for this migration phase lives in [OWNERSHIP.md](OWNERSHIP.md).

When online, this repo consumes the pinned `ai-dev-toolkit` release and installs the canonical `mcp-health.py`, `toggle-mcp.py`, and `release.py` helpers into `~/.config/opencode/scripts/`.

## Table of Contents

- [Which repository should I use?](#which-repository-should-i-use)
- [What this repo does](#what-this-repo-does)
- [Quick start](#quick-start)
- [CI / local verification](#ci--local-verification)
- [What gets installed](#what-gets-installed)
- [Guided authentication](#guided-authentication)
- [What is configured for AI tools](#what-is-configured-for-ai-tools)
- [Daily flow](#daily-flow)
- [Per-project tmux templates](#per-project-tmux-templates)
- [Supported shells](#supported-shells)
- [Local secrets](#local-secrets)
- [Important note about AI agents, MCP, and skills](#important-note-about-ai-agents-mcp-and-skills)

## What this repo does

- installs base dependencies on macOS, Ubuntu, and Windows
- configures portable shell helpers for bash/zsh
- installs the shared tmux workflow
- prepares per-repo onboarding with `.tmux-session.json`
- offers optional iTerm2 support on macOS
- prepares a base OpenCode / AI-tools environment with rules, config, and skills directories

## Quick start

### macOS / Ubuntu

```bash
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
```

Then validate the environment automatically:

```bash
./scripts/doctor.sh
```

With iTerm2 on macOS:

```bash
./bootstrap.sh --with-iterm2
```

### Windows

Open PowerShell as Administrator:

```powershell
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.ps1
```

> For the full tmux/bash workflow on Windows, the recommended path is **WSL2 + Ubuntu**.

## CI / local verification

The repository ships shared checks for:

- shell scripts
- shell linting
- Python validation
- functionality smoke tests
- tool/version checks

Run locally with:

```bash
bash ./scripts/ci-check.sh
```

## What gets installed

- Git
- GitHub CLI (`gh`)
- Node.js
- Python 3
- jq
- ripgrep
- fd
- fzf
- tmux
- OpenCode CLI
- Claude Code CLI / app bridge (when supported by the platform)

On macOS, the bootstrap also installs useful Homebrew extras:
- zoxide
- atuin
- eza
- bat
- starship
- direnv

## Guided authentication

After bootstrap, you can run:

```bash
bash ./scripts/auth-ai-tools.sh
```

This helps with:

- `gh auth login`
- guidance for `opencode auth login`
- guidance for Claude Code login

For MCP OAuth / provider authentication, use:

```bash
bash ./scripts/auth-mcp-tools.sh
```

Before authenticating, you can also enable/disable optional MCPs without editing JSON manually:

```bash
mcp-status
mcp-enable linear
mcp-disable linear
```

Or authenticate a specific provider directly:

```bash
bash ./scripts/auth-mcp-tools.sh linear
```

Then validate live MCP status with:

```bash
mcp-health
mcp-health linear
```

To plan or execute releases in repositories prepared by this toolkit:

```bash
release-plan --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-plan-github --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-patch --repo /path/to/repo
release-patch-github --repo /path/to/repo
release-tag --repo /path/to/repo --tag v1.2.3
release-tag-github --repo /path/to/repo --tag v1.2.3
```

When using `--changelog`, the target repository must already have a `CHANGELOG.md` file with a `## [Unreleased]` section.

Note: this repo is pinned to `TOOLKIT_VERSION=0.17.0`. Newly merged canonical helper capabilities become available after an `ai-dev-toolkit` release tag and an explicit pin bump in this repo.

You can check local pin drift with `bash ./scripts/doctor.sh`. If it reports `toolkit pin drift`, run `bash scripts/setup-ai-tools.sh .` to re-sync your environment with this repo's `TOOLKIT_VERSION`.

To check whether a newer toolkit release already exists before bumping the pin:

```bash
toolkit-version-check
toolkit-version-prepare
toolkit-version-pr --pr-body-file TOOLKIT_BUMP_PR.md
toolkit-version-sync
```

Use `toolkit-version-prepare` to generate a ready PR summary without changing `TOOLKIT_VERSION`. Only use `toolkit-version-sync` when you want to apply the bump to the local file.

If you want to save the PR body as reusable Markdown for GitHub, use `toolkit-version-pr --pr-body-file TOOLKIT_BUMP_PR.md`.

## What is configured for AI tools

Bootstrap prepares:

- `~/.config/opencode/opencode.jsonc`
- `~/.config/opencode/AGENTS.md`
- `~/.config/opencode/dcp.jsonc`
- `~/.opencode/skills/agents`
- `~/.opencode/skills/codex`
- `~/.config/ai-dev-toolkit/local.env`

It also installs a shared starter pack of skills, including:

- `ai-toolkit-repo-intake`
- `ai-toolkit-ship-check`
- `ai-toolkit-release`
- `ai-toolkit-mcp-health`
- `ai-toolkit-worktree-flow`
- `ai-toolkit-mcp-readiness`

And a starter pack of Codex skills, including:

- `ai-toolkit-plan-change`
- `ai-toolkit-root-cause-debug`
- `ai-toolkit-context-hygiene`

This covers the base for:

- OpenCode rules and guidance
- initial portable MCP configuration
- local skills structure
- agent-ready environment bootstrapping
- context compression and token optimization via DCP
- base plugins for worktrees and local memory
- shared commands for context, verification, and worktrees
- optional hosted MCP entries for common providers

Still manual:

- AI provider authentication
- installation of third-party skills
- local secrets and tokens

The bootstrap already creates the base local environment file for you to fill in:

```bash
~/.config/ai-dev-toolkit/local.env
```

## Daily flow

After bootstrap:

```bash
source ~/.bashrc   # or source ~/.zshrc
gh auth login
```

Inside a repository:

```bash
repo-terminal-ready
```

Or, if you want detected onboarding auto-applied:

```bash
repo-terminal-ready-yes
```

## Per-project tmux templates

Automatic suggestion:

```bash
ttemplate-suggest
ttemplate-preview
ttemplate-apply
```

## Supported shells

- bash
- zsh

PowerShell can bootstrap on Windows, but the advanced toolkit workflow currently targets bash/zsh first.

## Local secrets

Use a local file outside the repo, for example:

```bash
~/.config/ai-dev-toolkit/local.env
```

See `templates/local.env.example`.

Bootstrap copies that template automatically if the file does not exist yet.

## Important note about AI agents, MCP, and skills

This setup prepares the shared, portable foundation.

It **does not depend on personal dotfiles**, but it also **does not automatically install private secrets, tokens, or proprietary skills**.

So it:

- **configures the structure**
- **generates the base files**
- **leaves the environment ready**

But some providers and tools still require manual authentication and secrets before full use.

## Optional: RAG engine

After cloning `ai-dev-toolkit` alongside this repo, install the local RAG engine:

```bash
bash scripts/install-rag.sh
```

Sets up a Python venv with `sentence-transformers` + `rank-bm25`, copies scripts to `~/.claude/rag-index/`, skills to `~/.claude/skills/`, and runs the first full index build. Idempotent; rerun with `--force` to refresh.

### Work-mode install

```bash
export RAG_WORK_MODE=1 RAG_REPOS="$HOME/work/repo-a:$HOME/work/repo-b"
bash scripts/install-rag.sh
```

Skips personal memory/plans/handoffs entirely; indexes only the listed repos. See `kit/rag/.env.example` in the companion `ai-dev-toolkit` repo for the full list of overrides.
