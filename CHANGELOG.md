# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-03-30

### Added
- `tools/capture-training.py` — extract Claude Code sessions as alpaca-format instruction pairs
  for fine-tuning. Parses `~/.claude/projects/**/*.jsonl`, deduplicates by session hash, supports
  `--export`, `--min-turns`, `--dry-run`, and `--output` flags.
- `training/README.md` rewritten — leads with generic session capture pattern, LoRA fine-tuning
  moved to optional section. Removed forge-specific deployment commands.
- Claude Code sub-agent model routing — `setup-ai-workflow-macos.sh` now sets
  `CLAUDE_CODE_SUBAGENT_MODEL=claude-haiku-4-5-20251001` in `~/.claude/settings.json`.
  Background compaction and sub-agents run on Haiku; 60-80% cost reduction with no quality impact.
- Global MCP server config — `setup-ai-workflow-macos.sh` now creates `~/.claude/.mcp.json` with
  Tavily (web search) and Context7 (live docs). `TAVILY_API_KEY` is read from env if set.
- Claude Code Router (CCR) pattern documented in `patterns/multi-model-routing.md` — slot-based
  routing (default/background/think/longContext) with example preset.
- Sub-agent routing section added to `patterns/multi-model-routing.md`.
- `tools/README.md` now documents the Claude Code setup step (sub-agent routing + MCP config).
- `rtk` (Rust Token Killer) added to macOS and Ubuntu install scripts — 60-90%
  token reduction on Bash outputs via a transparent Claude Code `PreToolUse` hook.
  macOS: installed via `brew install rtk` + `rtk init -g`. Linux: installed via
  official install.sh. Run `rtk gain` after a few sessions to track savings.
- `TurboQuant` added to Curated AI Productivity Additions — Google's near-optimal
  KV cache quantization algorithm (6x memory reduction, 8x inference speed).
  Works with vLLM today via `0xSero/turboquant`; llama.cpp/Ollama integration
  expected Q3 2026. Paired with Ollama in Recommended Adoption Order.
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

### Fixed
- `implementations/claude-code/README.md`: MCP config path corrected from `~/.claude/config.json`
  to `~/.claude/.mcp.json` — `mcpServers` is not a valid field in `settings.json`.

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
- `tools/README.md`: added `rtk` to core stack table and platform notes
- `tools/README.md`: added `TurboQuant` to curated additions; updated Recommended
  Adoption Order to pair Ollama + TurboQuant
- `best-practices/context-management.md`: added RTK under Claude Code tips
- `implementations/claude-code/README.md`: added RTK hook setup section and
  listed RTK as the highest-impact token reduction strategy

## [0.1.0] - 2026-03-15

### Added
- Initial release
- 5 tool-agnostic patterns: Context Building, Task Orchestration, Multi-Model Routing, Session Management, Memory Systems
- 3 best practices guides: Context Management, Workflow, Security
- Rule templates: `CLAUDE.md`, `AGENTS.md`
- CLI tool install scripts for macOS, Ubuntu, Windows
- OpenCode reference implementation with orchestrator, session manager, and metrics plugins
