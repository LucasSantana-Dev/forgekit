# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.3] - 2026-03-30

### Added
- Codex CLI reference implementation: `implementations/codex/` with setup guide, approval policy guidance,
  sandbox modes, multi-model routing table, and task orchestration patterns
- `implementations/codex/config.toml` — annotated reference config for `~/.codex/config.toml`
- `rules/AGENTS.md` now covers both Codex CLI and OpenCode; model routing table split by tool
- "How Codex Differs" section explaining sandbox-first design vs trust-first tools (Claude Code, OpenCode, Cursor)
- Approval policy autonomy dial: `untrusted → on-request → on-failure → never` with rationale for `on-request` as dev default
- Trust model mismatch gotcha in `patterns/agent-gotchas.md` — comparison table and cross-tool guidance
- `@openai/codex` install in `tools/setup-ai-workflow-macos.sh` via `install_codex()`
- `ai-codex` alias in zsh workflow block
- Codex CLI entry in `tools/README.md` curated additions and adoption order (step 7)

### Added (previous unreleased)
- Remote Ollama homelab pattern: `OLLAMA_HOST` env var routes all `ollama` CLI calls to oac-workstation
  (AMD RX 9070 XT, 15.9 GB VRAM) via Tailscale — no local GPU required
- `openrtk` OpenCode plugin for 60-90% token savings by proxying commands through RTK
- `ai-ollama-ps` alias — show running models and VRAM usage on remote Ollama
- `ai-ollama-gpu` alias — list downloaded models via remote Ollama JSON API
- Updated `ai-webui` alias to connect Open WebUI to remote Ollama via `OLLAMA_BASE_URL`
- `configure_ollama_host()` function in setup script — idempotently adds `OLLAMA_HOST` to `~/.zshrc`
- `install_openrtk()` function in setup script — installs `openrtk` npm package globally

### Improved
- `setup-ai-workflow-macos.sh`: removed local Ollama brew install (now homelab-only), added
  `configure_ollama_host` and `install_openrtk` steps
- `tools/README.md`: Ollama row updated to reflect remote/homelab GPU usage pattern
- `implementations/opencode/opencode.jsonc`: added `openrtk` to plugin list
- Adoption roadmap updated to include openrtk as step 6

- New patterns: Prompt Engineering, Code Review, Testing with AI, Git Worktrees, Agent Gotchas, Multi-Repo Workflows
- Rule templates for all major tools: `.cursorrules`, `.windsurfrules`, `COPILOT.md`
- Claude Code reference implementation with hooks, skills, and memory structure
- Example files: `backlog.json`, `.claude/memory/` structure
- CONTRIBUTING.md with contribution guidelines
- LICENSE (MIT)
- GitHub issue and PR templates
- CI workflow for markdown link validation
- CHANGELOG.md
- Curated "AI Productivity Additions" in `tools/README.md` covering Context7, Tavily,
  Firecrawl, promptfoo, Portkey AI Gateway, LangGraph, n8n, Dify, Ollama,
  Open WebUI, fastmcp, and Playwright MCP
- `tools/setup-ai-workflow-macos.sh` for local AI workflow setup (Ollama, promptfoo,
  n8n, and shell workflow aliases)
- Community workflow integrations for `planning-with-files`,
  `antigravity-awesome-skills`, and `OpenViking` in setup/docs
- Added community-picked `browser-use` and `letta` into setup/docs/aliases
- Added a dedicated memory stack (`mem0ai` + `graphiti-core`) with
  `ai-memory-check` and `ai-memory-python` helpers

### Improved
- README rewritten with problem-first framing and before/after examples
- Install scripts: added missing tools (fd, ripgrep, chezmoi), idempotency checks
- `rules/CLAUDE.md` now includes Quick Reference and Gotchas sections
- `best-practices/context-management.md` made tool-agnostic with separate tool-specific sections
- README now links to the curated AI productivity tools section
- `tools/README.md` now documents local workflow commands (`ai-eval`, `ai-flow`,
  `ai-ollama`, `ai-webui`, `ai-portkey`, `ai-browser-mcp`)
- `tools/setup-ai-workflow-macos.sh` now installs `pipx`, supports `openviking`,
  and adds aliases for skills discovery and installation workflows
- `tools/setup-ai-workflow-macos.sh` now also installs `browser-use` and
  `letta` via `pipx` with matching aliases
- `tools/setup-ai-workflow-macos.sh` now provisions a Python 3.13 memory venv
  for `mem0ai` + `graphiti-core` and exposes health-check aliases
- `tools/install-windows.ps1` now checks Scoop buckets by exact name before
  adding them, preventing duplicate-add failures on reruns
- README structure improved with clearer quick start, adoption roadmap, table of
  contents, and a more descriptive repository map

## [0.1.0] - 2026-03-15

### Added
- Initial release
- 5 tool-agnostic patterns: Context Building, Task Orchestration, Multi-Model Routing, Session Management, Memory Systems
- 3 best practices guides: Context Management, Workflow, Security
- Rule templates: `CLAUDE.md`, `AGENTS.md`
- CLI tool install scripts for macOS, Ubuntu, Windows
- OpenCode reference implementation with orchestrator, session manager, and metrics plugins
