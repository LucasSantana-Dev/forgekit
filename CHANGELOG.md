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

### Improved
- README rewritten with problem-first framing and before/after examples
- Install scripts: added missing tools (fd, ripgrep, chezmoi), idempotency checks
- `rules/CLAUDE.md` now includes Quick Reference and Gotchas sections
- `best-practices/context-management.md` made tool-agnostic with separate tool-specific sections
- README now links to the curated AI productivity tools section

## [0.1.0] - 2026-03-15

### Added
- Initial release
- 5 tool-agnostic patterns: Context Building, Task Orchestration, Multi-Model Routing, Session Management, Memory Systems
- 3 best practices guides: Context Management, Workflow, Security
- Rule templates: `CLAUDE.md`, `AGENTS.md`
- CLI tool install scripts for macOS, Ubuntu, Windows
- OpenCode reference implementation with orchestrator, session manager, and metrics plugins
