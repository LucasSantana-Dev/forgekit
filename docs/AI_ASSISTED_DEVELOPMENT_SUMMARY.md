# AI Dev Toolkit Summary

This repository is a toolkit for AI-assisted software development. It is not an app and it is not a framework you import into production code. Its job is to help AI coding agents work with better context, safer defaults, clearer workflows, and more repeatable results.

## The Fastest Way to Get Value

If you are new to this repository, do this first:

1. Pick the instruction surface your agent already reads.
2. Copy one baseline rules file into your project.
3. Add context, review, and testing patterns only after the rules file is working.

Then map that generic path to the tool you use:

- `rules/CLAUDE.md` for Claude Code and compatible tools
- `rules/AGENTS.md` for Codex CLI
- `rules/COPILOT.md` for GitHub Copilot
- `rules/GEMINI.md` for Gemini CLI and related Gemini surfaces
- `rules/ANTIGRAVITY.md` for Antigravity
- the tool-specific rule files for Cursor and Windsurf

Copy the matching file into your project root. That gives your agent a basic identity, coding standards, workflow rules, testing expectations, security rules, and delivery guardrails before the first prompt.

You do not need the full installer to benefit from this repository.
You also do not need to care about companies, training, plugins, or machine bootstrap on day one.

## What This Repository Contains

### 1. Rules

The `rules/` directory contains drop-in instruction files for different AI tools.

Use these when you want the agent to automatically respect:

- your coding standards
- trunk-based workflow
- testing and verification gates
- documentation rules
- security boundaries
- durable execution expectations

Think of rules as the always-loaded behavior layer.

### 2. Patterns

The `patterns/` directory contains workflow playbooks. These explain how to use AI well, not just what to tell the model.

The pattern set covers:

- context building
- task orchestration
- code review
- testing
- memory systems
- multi-model routing
- session management
- git worktrees
- permission boundaries
- observability
- spec-driven development
- multi-repo work
- streaming orchestration
- prompt engineering
- tool registry design
- common agent failure modes

Think of patterns as the conceptual handbook for AI-assisted development.

### 3. Best Practices

The `best-practices/` directory is a shorter operational layer on top of the larger patterns.

It reinforces:

- secure AI-assisted development
- context hygiene and token control
- branching, commits, and delivery flow

Think of best practices as the short checklist version of the handbook.

### 4. forge-kit

The `kit/` directory contains `forge-kit`, the toolkit's installation and configuration system.

It includes:

- `kit/install.sh` to install toolkit assets into supported AI tools
- `kit/setup.sh` for interactive setup
- `kit/adapters/` for tool-specific installation logic
- `kit/profiles/` for installation modes such as standard, minimal, research, and durable
- `kit/core/` for shared rules, config registries, and portable skills

`forge-kit` exists so the same AI-development guidance can be installed into multiple tools without rewriting everything by hand.

### 5. Portable Skills

The `kit/core/skills/` directory currently contains 29 portable skills.

They are easiest to understand in groups:

- Planning and execution: `plan`, `plan-change`, `orchestrate`, `loop`, `ship`, `verify`, `ship-check`
- Debugging and quality: `debug`, `root-cause-debug`, `review`, `secure`, `tdd`, `release-flow`
- Session and context control: `resume`, `memory`, `context`, `context-hygiene`, `worktree-flow`, `repo-intake`
- Model, fallback, and infrastructure helpers: `route`, `fallback`, `schedule`, `mcp-health`, `mcp-readiness`, `toolkit-sync`, `cost`, `learn`, `research`, `dispatch`

Think of skills as reusable micro-workflows that teach the agent how to perform recurring tasks.

### 6. Tool Implementations

The `implementations/` directory shows how the same ideas map to real tools:

- Claude Code
- Codex CLI
- OpenCode
- Cursor
- GitHub Copilot
- Windsurf
- Antigravity
- Gemini

Use these when you want tool-specific setup guidance, not when you want the core ideas. The core ideas live in the rules, patterns, and kit.

### 7. Agent Organizations

The `companies/` directory contains prebuilt specialist-agent organizations.

These are reusable team structures for AI agents, not business case studies. They define roles, routing, skills, and handoff expectations so multi-agent work is more predictable.

The repo includes smaller starter organizations plus one large example:

- `solopreneur`
- `startup-mvp`
- `agency`
- `open-source-maintainer`
- `fullstack-forge`

If you are new, treat this directory as optional and advanced.

### 8. Tools and Training

Two supporting areas are useful but optional:

- `tools/README.md` catalogs recommended CLI tools, plugins, MCP-related utilities, and shell helpers for AI-heavy development environments
- `training/README.md` covers optional conversation capture and fine-tuning workflows

Neither area is required to use the toolkit well.

### 9. Examples

The `examples/` directory is one of the easiest places to learn the repository by imitation instead of abstraction.

Use it when you want to see:

- example memory files
- example instruction surfaces
- example project context structure

If the rules and patterns feel too abstract, check `examples/` before going deeper into advanced directories.

## The Core Mental Model

This repository is easiest to use when you understand the difference between its layers:

- Rules tell the agent how to behave by default.
- Patterns explain why a workflow works and when to use it.
- Skills teach the agent repeatable task-level procedures.
- Implementations show how those ideas map to a specific AI tool.
- Agent organizations define reusable specialist teams.
- forge-kit installs and syncs the whole system.

If you keep those six layers separate in your head, the repository becomes much easier to navigate.

## One Piece of Jargon: MCP

MCP means Model Context Protocol. In practice, it is a standard way for an AI tool to connect to external tools or data sources such as GitHub, filesystems, documentation servers, browsers, memory systems, or internal APIs.

If you are a beginner, the only thing you need to remember is:

- rules shape the agent's behavior
- MCP extends what the agent can access and do

You do not need MCP on day one, but you will see it across this repository because it matters once your workflow grows beyond basic prompting.

## Tool-Specific Instruction Surfaces Worth Knowing

Different tools read different files for behavior and repository guidance:

- Claude Code: `CLAUDE.md`
- Codex CLI: `AGENTS.md`
- GitHub Copilot: `.github/copilot-instructions.md` and optional `.github/instructions/*.instructions.md`
- Gemini CLI: `GEMINI.md`
- Gemini Code Assist on GitHub: `.gemini/styleguide.md`
- Antigravity: `~/.antigravity/rules.md` as the main baseline rules surface

This repository now includes explicit rule and implementation coverage for GitHub Copilot, Antigravity, and Gemini so the same AI-assisted-development model can be reused across those tools too.

## What `ai-dev-toolkit-setup` Does

The companion repository `ai-dev-toolkit-setup` solves a different problem.

Use `ai-dev-toolkit` when you want reusable AI-development guidance inside a project.

Use `ai-dev-toolkit-setup` when you want to prepare a machine with:

- shell helpers
- tmux workflow
- OpenCode bootstrap files
- starter skills directories
- local environment scaffolding
- guided authentication helpers
- package installation for a new machine

In short:

- `ai-dev-toolkit` is the handbook and reusable toolbox
- `ai-dev-toolkit-setup` is the machine bootstrap layer

Important details:

- setup consumes a pinned toolkit release through `TOOLKIT_VERSION`
- setup installs canonical helper scripts from the toolkit when online
- setup still keeps a small offline fallback layer for degraded mode
- setup does not install secrets or complete provider authentication for you

## Recommended Beginner Path

If you want the shortest useful adoption path, follow this order:

1. Copy one rule file into your project.
2. Read `patterns/context-building.md`.
3. Read `patterns/task-orchestration.md`.
4. Add `patterns/code-review.md` and `patterns/testing.md`.
5. Add memory and session discipline with `patterns/memory-systems.md` and `best-practices/context-management.md`.
6. Install `forge-kit` only after you know which tools you actually use.
7. Explore agent organizations only when a single-agent workflow starts to break down.

Minimum viable adoption:

- copy one rules file
- read two or three patterns
- skip `forge-kit` for now
- use `implementations/` only when you need tool-specific setup details

## What Is Optional and Advanced

These areas are valuable, but beginners should not start here:

- multi-agent organizations in `companies/`
- advanced plugin ecosystems in `tools/README.md`
- training and fine-tuning workflows in `training/README.md`
- advanced OpenCode orchestration overlays
- full autonomous loop configuration before basic verification habits are stable

## What This Repository Optimizes For

The repository consistently pushes toward the same outcomes:

- better context before coding
- cheaper model usage through routing
- fewer silent failures
- safer permissions
- repeatable quality gates
- smaller, shippable units of work
- cross-session continuity
- portability across AI tools

If your AI workflow has weak context, unstable quality, unclear delivery discipline, or too much manual repetition, this repository is trying to fix those problems.
