[English](README.md) | [Português](README.pt-BR.md)

# ai-dev-toolkit-setup

Portable machine setup for the AI Dev Toolkit stack: bootstrap a new macOS, Ubuntu, or Windows workstation without depending on personal dotfiles.

## Which repository should I use?

- **Use this repository (`ai-dev-toolkit-setup`)** when you want to install the shared environment on a machine.
- **Use [`ai-dev-toolkit`](https://github.com/Forge-Space/ai-dev-toolkit)** when you want reusable rules, patterns, skills, and reference implementations inside your projects.

This repo is the machine bootstrap layer. The companion repo is the reusable toolkit content.

## Who this is for

This setup is for developers and small teams who want a repeatable AI-assisted development environment with the same shell helpers, tmux workflow, OpenCode baseline, and optional MCP/auth helpers on every machine.

Use it when you want to:

- set up a new machine quickly
- avoid coupling the environment to private dotfiles
- keep team onboarding reproducible
- start from a known-good OpenCode / AI tooling baseline

## What this repository does

The bootstrap flow can:

- install base dependencies on macOS, Ubuntu, and Windows
- configure portable bash/zsh shell helpers
- install the shared tmux workflow and project onboarding helpers
- prepare optional iTerm2 setup on macOS
- generate a portable OpenCode configuration baseline
- create local environment files for secrets and provider-specific auth

## Supported platforms

| Platform | Bootstrap entrypoint | Notes                                                                      |
| -------- | -------------------- | -------------------------------------------------------------------------- |
| macOS    | `./bootstrap.sh`     | Optional iTerm2 support via `--with-iterm2`                                |
| Ubuntu   | `./bootstrap.sh`     | Recommended Linux path                                                     |
| Windows  | `./bootstrap.ps1`    | Best experience is still **WSL2 + Ubuntu** for the full bash/tmux workflow |

## Prerequisites

Before running the bootstrap:

- install **Git**
- have access to the target GitHub repositories you want to work with
- be ready to authenticate providers after setup (`gh`, OpenCode, Claude Code, MCP providers)
- on Windows, prefer **PowerShell as Administrator** for the bootstrap step

## Quick start

### macOS / Ubuntu

```bash
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
```

Validate the environment right after bootstrap:

```bash
./scripts/doctor.sh
```

macOS with iTerm2 extras:

```bash
./bootstrap.sh --with-iterm2
```

For work Macs (corporate proxy, no sudo):

```bash
./bootstrap.sh --work-mac
```

See [docs/work-mac-setup.md](docs/work-mac-setup.md) for details.

### Windows

Open PowerShell as Administrator:

```powershell
git clone git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.ps1
```

For the full toolkit workflow, the recommended Windows path is:

1. run the Windows bootstrap
2. install or enable **WSL2 + Ubuntu**
3. use the Linux shell workflow inside WSL for tmux/bash-first commands

## What gets installed

Base tools installed across platforms include:

- Git
- GitHub CLI (`gh`)
- Node.js
- Python 3
- `jq`
- `ripgrep`
- `fd`
- `fzf`
- `tmux`
- OpenCode CLI
- Claude Code CLI / bridge when the platform supports it
- Gemini CLI

macOS also installs useful Homebrew extras such as:

- `zoxide`
- `atuin`
- `eza`
- `bat`
- `starship`
- `direnv`

## What gets configured

The bootstrap prepares a portable baseline for AI tooling, including:

- `~/.config/opencode/opencode.jsonc`
- `~/.config/opencode/AGENTS.md`
- `~/.config/opencode/dcp.jsonc`
- `~/.opencode/skills/agents`
- `~/.opencode/skills/codex`
- `~/.config/ai-dev-toolkit/local.env`

It also installs a starter pack of shared skills and leaves your local secrets/auth outside the repository.

### Important boundary

This repository prepares the **structure** and **baseline config**.

It does **not** automatically install:

- private tokens or secrets
- proprietary third-party skills
- provider authentication for every service

Those stay manual on purpose.

## First commands after installation

Reload your shell and authenticate the essentials:

```bash
source ~/.bashrc   # or source ~/.zshrc
gh auth login
```

When entering a repository, run:

```bash
repo-terminal-ready
```

If you want auto-apply onboarding when detected:

```bash
repo-terminal-ready-yes
```

## Guided authentication and MCP helpers

Authenticate common AI tools:

```bash
bash ./scripts/auth-ai-tools.sh
```

Authenticate MCP providers with OAuth or guided setup:

```bash
bash ./scripts/auth-mcp-tools.sh
bash ./scripts/auth-mcp-tools.sh linear
```

Manage optional MCP entries without hand-editing JSON:

```bash
mcp-status
mcp-enable linear
mcp-disable linear
```

Validate live MCP health:

```bash
mcp-health
mcp-health linear
```

## Release helpers included in the setup

If the target repository is prepared for it, the environment also exposes release helpers:

```bash
release-plan --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-plan-github --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
release-patch --repo /path/to/repo
release-patch-github --repo /path/to/repo
release-tag --repo /path/to/repo --tag v1.2.3
release-tag-github --repo /path/to/repo --tag v1.2.3
```

When using `--changelog`, the target repository must already have a `CHANGELOG.md` with an `## [Unreleased]` section.

## Repository structure

```text
bootstrap.sh / bootstrap.ps1   Platform bootstrap entrypoints
scripts/                       Install, validation, auth, and setup helpers
config/                        Portable shell, tmux, OpenCode, and iTerm2 config
templates/                     Local environment file templates
.github/                       CI automation and shared checks
```

Notable helpers:

- `scripts/doctor.sh` — post-bootstrap validation
- `scripts/ci-check.sh` — local verification aligned with CI
- `scripts/auth-ai-tools.sh` — guided AI provider/tool auth
- `scripts/auth-mcp-tools.sh` — MCP auth and health workflow

## Validation and local CI

Run the shared verification pipeline locally:

```bash
bash ./scripts/ci-check.sh
```

The checks cover:

- shell script validation
- shell linting
- Python validation
- smoke tests
- version and tool checks

## Troubleshooting

### Bootstrap completed but some tools are missing

Run:

```bash
./scripts/doctor.sh
```

Use the output to identify what failed before re-running the bootstrap.

### Windows workflow feels incomplete

That is expected if you stay in native PowerShell only. The advanced daily workflow is optimized for **bash/zsh**, so prefer **WSL2 + Ubuntu** after the initial Windows bootstrap.

### MCP auth looks fine but commands still fail

Re-run the provider-specific auth helper and then confirm live status:

```bash
bash ./scripts/auth-mcp-tools.sh <provider>
mcp-health <provider>
```

### Unsure where to store secrets

Use the local file outside the repo:

```bash
~/.config/ai-dev-toolkit/local.env
```

The bootstrap copies `templates/local.env.example` automatically if the file does not exist yet.

## Contributing and support

- Open an issue if a platform-specific bootstrap step fails or docs are inaccurate.
- Open a PR for fixes to scripts, templates, or setup docs.
- When reporting a problem, include the output from `./scripts/doctor.sh` when possible.

## Related repository

- [`Forge-Space/ai-dev-toolkit`](https://github.com/Forge-Space/ai-dev-toolkit) — reusable rules, patterns, skills, companies, and reference setups

## Optional: RAG engine

After cloning `ai-dev-toolkit` alongside this repo, install the local RAG engine:

```bash
bash scripts/install-rag.sh
```

Sets up a Python venv with `sentence-transformers` + `rank-bm25`, copies scripts to `~/.claude/rag-index/`, skills to `~/.claude/skills/`, and runs the first full index build. Idempotent; rerun with `--force` to refresh.
