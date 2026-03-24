# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
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
