# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- ESLint CI job (`.github/workflows/validate.yml`) so `.mjs` lint errors are
  caught on every PR instead of only in local runs.

### Fixed

- `scripts/reconcile-backlog-state.mjs` no longer reports 8 `no-undef` errors
  for `process` and `console` — the ESLint config now covers `.mjs` files and
  declares the node globals they need.

## [0.12.0] — 2026-04-04

### Added

- **Consolidated setup-repo content** (#37): 10 portable skills, governance
  templates, and helper scripts merged into `kit/` so a single clone is
  enough to bootstrap an AI-assisted workflow. Complements the companion
  `ai-dev-toolkit-setup` bootstrapper.
- **29 portable skills** total in `kit/core/skills/` (was 18) covering
  routing, resume, ship, sync-memories, plan, focus, optimize, and the full
  forge-kit lifecycle.
- **Formal JSON schemas for all core configs** (#29): 10 schemas under
  `kit/schema/` validate agents, dispatch, hooks, routines, rules, and
  skills at install time.
- **Canonical agent tool registry** (#39): enforces which tools each
  specialty agent may invoke, with governance tests for title validation,
  `reportsTo` reference integrity, and org-chart consistency.
- **Release helper preflight** (`tools/release.py --verify`): blocks a
  release when the git working tree is dirty, git identity is missing, the
  target tag already exists, or the changelog / release notes are malformed.
  CI smoke-tests every blocker path in `validate.yml`.
- **Portable hooks manifests** (#35) installed for every supported adapter
  (`claude-code`, `codex`, `opencode`, `windsurf`, `cursor`).
- **Company templates** (#31): solopreneur, startup MVP, agency, and
  open-source maintainer presets ready for `forge-kit` consumption.
- **Heartbeat routine system** (#30): schedule config + validation so
  recurring maintenance tasks can be declared once and executed by any
  adapter.
- **Backlog triage automation** (#33) + backlog map + README link (#32).
- **OpenCode plugin typecheck lane** (#34) in CI.
- **Adapter parity expansion** (#27): MCP coverage, c7score README,
  language reviewers, and harness audit across all adapters.
- **`oh-my` compatibility support** (#28) for the remaining adapters
  (previously only `opencode` and `claude-code`).

### Fixed

- Release preflight now catches adapter parity blockers before tagging (#41)
  so a release with missing adapter files is refused at `--verify` time
  instead of at publish time.

## [0.11.0] — 2026-04-03

### Added

- `kit/core/agents.json` v4 — Paperclip-inspired specialty agents with org chart:
  - 12 agents (was 6): orchestrator, architect, frontend, backend, devops, tester, security, reviewer, writer, researcher, explorer
  - Each agent has `title`, `role`, `skills`, `tools`, `reportsTo`, `fallback` chain
  - `orgChart` section defining hierarchy: orchestrator → architect → engineering specialists
  - `specialtyRouting` in dispatch config: UI work → frontend, API work → backend, CI/CD → devops, etc.
  - Escalation: if specialist unavailable, fall back to generic worker
  - Governance tests: agent title validation, reportsTo reference integrity, org chart consistency

- Optional `forge-kit` oh-my compatibility mode via `--oh-my-compat`:
  - `kit/install.sh` supports `--oh-my-compat` and surfaces compatibility status during installs
  - profiles now include `FORGE_OHMY_COMPAT` (default `false`) to keep default installs tool-agnostic
  - `kit/adapters/opencode.sh` can bootstrap `~/.config/opencode/oh-my-opencode.jsonc` from the toolkit reference when absent
  - `kit/adapters/claude-code.sh` can install `~/.claude/oh-my-claudecode.md` ownership guidance
  - `kit/adapters/codex.sh` can install `~/.codex/oh-my-codex.md` ownership guidance
- New compatibility references:
  - `implementations/claude-code/oh-my-claudecode.md`
  - `implementations/codex/oh-my-codex.md`
- 6 new portable skills in `kit/core/skills/`:
  - `route.md` — multi-model routing and task complexity classification
  - `resume.md` — session recovery from git state, plans, and open PRs
  - `orchestrate.md` — multi-phase task breakdown with dependency tracking and verification checkpoints
  - `tdd.md` — test-driven development red/green/refactor workflow
  - `secure.md` — security scan checklist (secrets, deps, inputs, permissions, injection)
  - `context.md` — context window optimization and session compaction
- Skill installation now works across ALL 6 tool adapters (was claude-code only):
  - codex, opencode, cursor, windsurf, antigravity adapters now install/uninstall skills
  - Shared `install_skills` and `uninstall_skills` helpers extracted to `kit/lib/merge.sh`
- `kit/setup.sh` — interactive CLI setup wizard:
  - Prompts for primary provider, fallback provider, local model usage, token optimization strategy
  - Prompts for profile, oh-my compatibility, orchestration, worktrees, and backlog preferences
  - Generates `.forge-setup.json` with resolved model maps, routing, agent assignments, token presets, and autopilot config
- 2 additional portable skills:
  - `loop.md` — autonomous dev cycle (plan → implement → test → review → fix → commit → PR) without stopping
  - `fallback.md` — provider/model fallback chain behavior with escalation rules
- `kit/core/loop.json` — autonomous loop engine definition:
  - 5 loop phases (plan, implement, review, secure, commit) + 3 post-loop steps (quality gates, push, PR)
  - Per-phase fallback (retry → switch model → switch provider → escalate tier, max 5 attempts)
  - Loop-level guardrails: max 3 consecutive phase failures → stop and save state
  - Governance gates: required checks before commit, push, PR, and merge; block/never-block rules
  - Resume from last incomplete phase with `.agents/plans/.loop-state.json`
- `kit/core/autopilot.json` v2 — autonomy levels and guardrails:
  - `supervised` / `assisted` / `autonomous` levels (default: `autonomous`)
  - `neverPauseFor` list: lint fixes, type fixes, test fixes, commits, pushes, file edits
  - `hardBlock` list: only genuinely destructive actions (rm -rf /, drop database, force push main)
  - Durable execution: continue until complete, persist on interrupt, resume from checkpoint
  - Fallback config: model/provider/tier switching with exponential backoff
- `kit/core/agents.json` v3 — agents with fallback chains and autonomy flags:
  - Every agent has a `fallback.chain` (list of tiers to try) and `fallback.onFailure` policy
  - `autonomous: true` on orchestrator and worker — they never pause for trivial confirmations
  - `async: true` on researcher and explorer — they run in background, never block the main loop
  - `readOnly: true` on architect, reviewer, researcher, explorer — they advise, never block progress
  - Orchestration dispatch: dependency-first, parallelize independent phases, `neverPauseFor` list
  - Escalation rules: worker fails 2x → consult architect, model unavailable → fallback chain
- `kit/core/routing.json` v2 — complexity classifier with signals and escalation:
  - Per-category signal lists for automatic classification
  - Per-tier token budgets and context budget levels
  - Escalation rule: 2 consecutive failures → promote to next tier
  - Target distribution: 40% haiku / 45% sonnet / 15% opus
- `kit/core/token-optimization.json` — 3 presets (standard, aggressive, minimal):
  - Compaction thresholds, tool output truncation, session message limits
  - Rules for what is always safe to remove vs always preserve
- Governance enforcement via expanded test suite:
  - `validateKit()` validates all core JSON configs, agent tiers, routing categories, skill frontmatter, and loop governance
  - 5 new tests (11 total): kit config parsing, agent tier validity, skill completeness, loop governance
- README rewritten with conversion-focused structure, scannable pattern table, and forge-kit flag reference

### Fixed

- `forge-kit` adapter hardening from PR review feedback:
  - `kit/adapters/claude-code.sh` avoids duplicate durable header append, creates `.forge-kit` marker on skills install, fixes uninstall marker detection, and normalizes skill count parsing
  - `kit/adapters/windsurf.sh` uses cross-platform hashing for content comparison and shared `json_merge` for MCP merge
  - `kit/adapters/cursor.sh` only uninstalls `forge.mdc` when file is marked as forge-managed
  - `kit/adapters/codex.sh` preserves local `providers.json` by skipping no-op copies and only updating when content changes
- `kit/install.sh` now validates `--tools` and `--profile` argument values before parsing
- `kit/lib/log.sh`, `kit/lib/merge.sh`, `kit/lib/os.sh`, and `kit/lib/detect.sh` improved portability and safer fallback behaviors
- `kit/core/rules.md` and core skill docs updated to satisfy markdown lint expectations; `tools/README.md` plugin references now include source links for `opencode-mem` and `opencode-codegraph`

## [0.10.0] - 2026-04-02

### Added

- `kit/` — forge-kit: universal AI dev toolkit installer with cross-tool adapter architecture
  - `kit/install.sh` — main entry point with `--tools`, `--profile`, `--dry-run`, `--status`, `--uninstall` flags
  - `kit/core/rules.md` — single source of truth for agent behavior rules (all adapters read from here)
  - `kit/core/providers.json` — unified provider + model registry (Anthropic, OpenAI, Google, Groq, Ollama)
  - `kit/core/mcp.json` — curated MCP server definitions with required env vars and profiles
  - `kit/core/agents.json` — multi-model agent routing config (Sisyphus/Hephaestus/Artemis/Hermes pattern)
  - `kit/core/routing.json` — task complexity classifier for automatic model selection
  - `kit/core/skills/` — 6 portable skill definitions: `plan`, `verify`, `ship`, `review`, `debug`, `research`
  - Adapters for 6 tools: `claude-code` (CLAUDE.md + skills + MCP), `codex` (AGENTS.md + providers), `opencode` (system.md + MCP), `cursor` (.cursor/rules/forge.mdc + MCP), `windsurf` (.windsurfrules + MCP), `antigravity` (rules.md + MCP)
  - 4 install profiles: `standard` (rules+skills+MCP), `minimal` (rules only), `research` (rules+MCP), `durable` (full+durable execution)
  - `kit/lib/` — shared shell libraries: `log.sh` (colored output), `os.sh` (platform helpers), `merge.sh` (JSON merge via python3), `detect.sh` (auto-detect installed tools)
- `implementations/opencode/oh-my-openagent.jsonc` — reference config for oh-my-openagent plugin
- `implementations/opencode/README.md` — updated setup instructions for oh-my-openagent workflow
- `rules/AGENTS.md` — expanded agent routing table with oh-my-openagent Sisyphus delegation model

## [0.9.0] - 2026-04-02

### Added

- `patterns/spec-driven-development.md` — spec-first workflow for AI development covering:
  - Three roles a spec plays: agent instruction, inter-agent contract, regression anchor
  - Minimal spec template with purpose, scope, inputs, outputs, behavior statements, and constraints
  - Workflow: write spec → implement → test → change control
  - Grounding agents to specs via prompt injection and directory-level `CLAUDE.md` auto-load
  - Multi-agent coordination pattern using spec as shared contract
  - Spec granularity guide (when to apply SDD vs skip it)
- README: added `Spec Driven Development` entry to Repository Map and Day 6 to the adoption week table

## [0.8.0] - 2026-04-01

### Added

- `tools/README.md` — OpenCode Plugins section with curated catalog across five categories: Auth, Orchestration & Workflow, Memory, Code Quality, Notifications
  - Auth: `opencode-claude-auth` (reuses Claude Code credentials), `opencode-gemini-auth` and `opencode-antigravity-auth` (Gemini OAuth, with ToS risk notes)
  - Orchestration: `oh-my-openagent` (multi-model harness, `ulw` command), `@kompassdev/opencode` (repo-grounded workflows), `@plannotator/opencode` (interactive plan review), `opencode-scheduler` (launchd/systemd recurring agent tasks)
  - Memory: `opencode-graphiti` (Graphiti knowledge graph), `opencode-mem` (local vector DB)
  - Code Quality: `opencode-codegraph` (CPG analysis), `opencode-plugin-openspec` (architecture spec agent)
  - Notifications: `opencode-plugin-apprise` (Apprise CLI integration)
- Recommended adoption order for OpenCode plugins (7-step progression)
- Install snippet showing `opencode.jsonc` plugin array configuration

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
