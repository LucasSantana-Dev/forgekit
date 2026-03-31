# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.7.0] - 2026-03-31

### Added
- `patterns/streaming-orchestration.md` — event-driven turn loops, turn budgeting, transcript compaction, session persistence, stop reason handling
- `patterns/tool-registry-patterns.md` — separating tool metadata from implementation, JSON snapshots, permission contexts, trust-gated init, parity checking
- `patterns/permission-boundaries.md` — three-layer permission model (filter/block/confirm), named profiles, CLAUDE.md permission sections, PreToolUse hook patterns

## [0.6.0] - 2026-03-31

### Added
- `patterns/task-orchestration.md` — OMC-Inspired Orchestration Patterns section covering:
  - 3-layer composition (`ultrawork` → `ralph` → `autopilot`)
  - Model tier routing table (Haiku/Sonnet/Opus with routing heuristics)
  - Ralph PRD-driven persistence pattern with `prd.json` schema
  - Preemptive compaction pattern (O(1) cumulative token tracking)
  - Verify-deliverables hook checklist

## [0.5.0] - 2026-03-31

### Added
- `package.json` — npm scripts for validation, testing, and formatting
- `scripts/validate-schemas.js` — JS schema validator (enables jest coverage)
- `test/validate-schemas.test.js` — jest test suite (75% coverage target)
- `jest.config.js` — jest ESM configuration
- `SECURITY.md` — security policy and reporting guide
- `CODEOWNERS` — code ownership for forge-space integration
- `.github/workflows/secret-scan.yml` — TruffleHog secret scanning
- `.github/workflows/semgrep.yml` — SAST scanning for scripts/
- `.github/workflows/stale.yml` — stale issue/PR management
- `.github/dependabot.yml` — automated dependency updates

## [0.4.0] - 2026-03-31

### Added
- `companies/` — pre-built agent organizations with specialized roles, skills, and routing protocols
- `fullstack-forge` company (49 agents, 66 skills, 10 teams) imported from paperclipai/companies (MIT)
- `tools/validate-companies.sh` — validates agent frontmatter, required sections, reportsTo references, and skill existence
- CI validation for company schemas in `.github/workflows/validate.yml`

## [0.3.3] - 2026-03-31

### Fixed
- `tools/setup-ai-workflow-macos.sh`: `lmnr` now auto-installed via `pipx install lmnr`
  (macOS Python 3.14 uses uv and is externally managed — `pip3 install` fails with PEP 668
  error). `ai-lmnr` alias updated to point to `~/.local/bin/lmnr`.
- `tools/install-ubuntu.sh`: Added `lmnr` install section using
  `pip3 install lmnr --break-system-packages`. Added `promptfoo` user-local install via
  `npm install --prefix ~/.npm-global` — avoids `better-sqlite3` native module version
  mismatch on Ubuntu + Node 22 (NODE_MODULE_VERSION 115 vs 127).
- `patterns/agent-observability.md`: install instructions now split by platform —
  `pipx install lmnr` for macOS, `pip3 install lmnr --break-system-packages` for Linux,
  and user-local promptfoo pattern for Ubuntu + Node 22.

## [0.3.2] - 2026-03-31

### Fixed
- `.github/workflows/release.yml` — release notes now written to a temp file and passed via
  `--notes-file` to avoid backtick shell expansion corrupting markdown code spans in notes.

## [0.3.1] - 2026-03-31

### Added
- `.github/workflows/release.yml` — automatic tag and GitHub release on every push to main;
  parses version from `CHANGELOG.md`, skips if tag already exists, extracts matching section
  as release notes.

## [0.3.0] - 2026-03-31

### Added
- `patterns/agent-observability.md` — new pattern covering the three-layer observability
  stack: lmnr tracing, promptfoo regression testing, TDD Guard enforcement, and
  `claude-code-security-review` CI integration. Explains when and how to combine them.
- `tools/README.md`: six new entries in Curated AI Productivity Additions:
  `markdownify-mcp` (PDF/image/audio→Markdown), `MCPHub` (multi-server HTTP proxy),
  `lmnr` (agent tracing and eval), `TDD Guard` (test-first enforcement hook),
  `container-use` (Dagger-based agent sandboxing), and `claude-code-security-review`
  (official Anthropic PR security action).
- `tools/README.md`: new **Claude Code Skills** subsection documenting `Superpowers`,
  `Context Optimization`, `claude-deep-research-skill`, and the Anthropic official
  skills collection (PDF, DOCX, XLSX, PPTX, Canvas Design, Frontend Design).
- `setup-claude-code.sh`: `markdownify-mcp` added to the MCP server merge list —
  auto-installed alongside tavily, context7, and playwright on fresh setups.
- `setup-ai-workflow-macos.sh`: new aliases `ai-markdownify`, `ai-mcphub`, `ai-lmnr`,
  `ai-tdd-guard` added to the workflow block.
- README pattern table updated with `Agent Observability` entry.
- Recommended Adoption Order in `tools/README.md` expanded to include skills,
  markdownify-mcp, lmnr, TDD Guard, and container-use with positioning rationale.
- Dead link `skillsmp.com` removed from Claude Code Skills section.

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
- Codex CLI entry in `tools/README.md` curated additions and adoption order

## [0.2.2] - 2026-03-30

### Added
- `tools/capture-training.py` — extract Claude Code sessions as alpaca-format instruction pairs
  for fine-tuning. Parses `~/.claude/projects/**/*.jsonl`, deduplicates by session hash. Flags:
  `--export`, `--min-turns`, `--dry-run`, `--output`.
- `tools/setup-claude-code.sh` now installs `capture-training` to `~/.local/bin/` so it's
  available as a CLI command after running the setup script.
- Claude Code Router (CCR) pattern added to `patterns/multi-model-routing.md` — slot-based
  routing (default/background/think/longContext) with minimal preset example.
- Sub-agent routing section added to `patterns/multi-model-routing.md` — explains why
  `CLAUDE_CODE_SUBAGENT_MODEL` matters and expected savings.
- Sub-agent routing + CCR sections added to `implementations/claude-code/README.md`.
- `training/README.md` — session capture workflow with `capture-training.py`, optional LoRA
  fine-tuning section (axolotl + Ollama export).

## [0.2.1] - 2026-03-30

### Added
- `tools/setup-claude-code.sh`: new script that configures Claude Code from scratch —
  creates `~/.claude/.mcp.json` with recommended MCP servers (tavily, context7,
  playwright), sets default model to Sonnet 4.6 and subagent model to Haiku 4.5,
  removes `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` if present, creates memory directory
  structure with `MEMORY.md` and `gotchas.md` templates, and runs a plugin audit

### Fixed
- `tools/install-macos.sh`: corrected RTK init command (`rtk init -g`, not `--hook-only`)
- `tools/install-ubuntu.sh`: same RTK init fix
- `tools/setup-ai-workflow-macos.sh`: removed Ollama (local model — not universally
  applicable); removed `ai-ollama` alias from the zsh workflow block

## [0.2.0] - 2026-03-30

### Added
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
  Firecrawl, promptfoo, Portkey AI Gateway, LangGraph, n8n, Dify, Open WebUI,
  fastmcp, and Playwright MCP
- `tools/setup-ai-workflow-macos.sh` for local AI workflow setup (promptfoo,
  n8n, and shell workflow aliases)
- Community workflow integrations for `planning-with-files`,
  `antigravity-awesome-skills`, and `OpenViking` in setup/docs
- Added community-picked `browser-use` and `letta` into setup/docs/aliases
- Added a dedicated memory stack (`mem0ai` + `graphiti-core`) with
  `ai-memory-check` and `ai-memory-python` helpers
- Claude Code MCP plugin dual-registration documentation and audit guidance
- Claude Code `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` warning and fix
- MEMORY.md 200-line discipline section with topic-file extraction strategy

### Improved
- README rewritten with problem-first framing and before/after examples
- Install scripts: added missing tools (fd, ripgrep, chezmoi), idempotency checks
- `rules/CLAUDE.md` now includes Quick Reference and Gotchas sections
- `best-practices/context-management.md` made tool-agnostic with separate tool-specific sections
- README now links to the curated AI productivity tools section
- `tools/README.md` now documents local workflow commands (`ai-eval`, `ai-flow`,
  `ai-webui`, `ai-portkey`, `ai-browser-mcp`)
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
  Adoption Order to pair TurboQuant
- `best-practices/context-management.md`: `/compact` threshold corrected to 60-70%;
  added MEMORY.md discipline section; added plugin dual-registration and agent teams
  warnings to MCP strategy
- `implementations/claude-code/README.md`: fixed MCP config path to `~/.claude/.mcp.json`;
  added plugin management section; added agent teams env var warning; updated model
  table to Sonnet/Opus/Haiku 4.x IDs; corrected `/compact` threshold to 60-70%

## [0.1.0] - 2026-03-15

### Added
- Initial release
- 5 tool-agnostic patterns: Context Building, Task Orchestration, Multi-Model Routing, Session Management, Memory Systems
- 3 best practices guides: Context Management, Workflow, Security
- Rule templates: `CLAUDE.md`, `AGENTS.md`
- CLI tool install scripts for macOS, Ubuntu, Windows
- OpenCode reference implementation with orchestrator, session manager, and metrics plugins
