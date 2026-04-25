# Content Ownership Map

This document defines the canonical owner for every file and directory in this
repository. It enforces the one-way flow: **ai-dev-toolkit publishes,
ai-dev-toolkit-setup consumes**.

## Ownership Rules

1. **setup-owned** — authored and maintained here. Never duplicated in toolkit.
2. **toolkit-sourced** — canonical copy lives in
   [ai-dev-toolkit](https://github.com/LucasSantana-Dev/forgekit). This repo
   fetches it at bootstrap time from the pinned `TOOLKIT_VERSION`. Do **not**
   edit these files locally — submit changes to the toolkit repo instead.
3. **generated** — produced by a script at bootstrap time. Not committed.

## File Map

### Root

| Path | Owner | Notes |
|------|-------|-------|
| `bootstrap.sh` | setup-owned | macOS / Linux entry point |
| `bootstrap.ps1` | setup-owned | Windows entry point |
| `Brewfile` | setup-owned | macOS Homebrew dependencies |
| `TOOLKIT_VERSION` | setup-owned | Pinned toolkit release tag |
| `OWNERSHIP.md` | setup-owned | This file |
| `TOOLKIT_COMPARISON.md` | setup-owned | Boundary documentation |
| `README.md` | setup-owned | |
| `README.en.md` | setup-owned | |

### scripts/

| Path | Owner | Notes |
|------|-------|-------|
| `scripts/install-macos.sh` | setup-owned | OS-level package install |
| `scripts/install-ubuntu.sh` | setup-owned | OS-level package install |
| `scripts/install-windows.ps1` | setup-owned | OS-level package install |
| `scripts/install-ai-clis.sh` | setup-owned | AI CLI install (opencode, claude) |
| `scripts/setup-shell.sh` | setup-owned | Shell helper installation |
| `scripts/setup-tmux.sh` | setup-owned | Tmux workflow installation |
| `scripts/setup-ai-tools.sh` | setup-owned | Toolkit bootstrap plus helper-script installation into runtime paths |
| `scripts/setup-local-env.sh` | setup-owned | Local env file creation |
| `scripts/setup-iterm2.sh` | setup-owned | iTerm2 macOS setup |
| `scripts/auth-ai-tools.sh` | setup-owned | Interactive auth guidance |
| `scripts/auth-mcp-tools.sh` | setup-owned | MCP auth guidance |
| `scripts/doctor.sh` | setup-owned | Environment validation |
| `scripts/ci-check.sh` | setup-owned | CI quality gates |
| `scripts/render-opencode-config.py` | setup-owned | Machine-specific config renderer |

### config/shell/

| Path | Owner | Notes |
|------|-------|-------|
| `config/shell/shell.sh` | setup-owned | Shell aliases and functions |

### config/tmux/

| Path | Owner | Notes |
|------|-------|-------|
| `config/tmux/*` | setup-owned | Tmux session templates and workflow |

### config/iterm2/

| Path | Owner | Notes |
|------|-------|-------|
| `config/iterm2/*` | setup-owned | iTerm2 profiles |

### config/ai-tools/ — Offline Fallback Files

| Path | Owner | Notes |
|------|-------|-------|
| `config/ai-tools/README.md` | setup-owned | Documents fallback role |
| `config/ai-tools/AGENTS.md` | setup-owned | Minimal fallback guidance (offline only) |
| `config/ai-tools/opencode.template.jsonc` | setup-owned | OpenCode fallback template (offline only) |
| `config/ai-tools/dcp.template.jsonc` | setup-owned | DCP fallback template (offline only) |

When online, `setup-ai-tools.sh` delegates to toolkit `kit/install.sh`
which auto-detects installed tools and configures each one, then copies
canonical toolkit helpers from `tools/*.py` into `~/.config/opencode/scripts/`.
These local files are only used when the toolkit tarball is unreachable.

### templates/

| Path | Owner | Notes |
|------|-------|-------|
| `templates/local.env.example` | setup-owned | Secrets template |

### .github/

| Path | Owner | Notes |
|------|-------|-------|
| `.github/workflows/*` | setup-owned | CI for this repo |

## Migration Phases

- **Phase 0** (current): Document boundaries ← you are here
- **Phase 1**: Add setup-only content to toolkit (additive, no removals)
- **Phase 2**: Wire `setup-ai-tools.sh` to fetch from toolkit tarball
- **Phase 3**: Remove toolkit-sourced duplicates from this repo
- **Phase 4**: Ongoing version pin bumps

## How to Update Toolkit Content

1. Submit a PR to [LucasSantana-Dev/forgekit](https://github.com/LucasSantana-Dev/forgekit)
2. After toolkit releases, bump `TOOLKIT_VERSION` in this repo so newly tagged helper capabilities become available here
3. Run `./scripts/doctor.sh` to verify the pin is valid
