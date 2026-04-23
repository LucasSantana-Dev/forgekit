# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Gemini CLI (`@google/gemini-cli`) added as a first-class AI tool: `install_gemini()` in `scripts/install-ai-clis.sh`, auth guidance in `scripts/auth-ai-tools.sh`, and `GEMINI_API_KEY` in `templates/local.env.example`
- `--work-mac` bootstrap flag: skips Homebrew-dependent installs for restricted corporate environments
- `docs/work-mac-setup.md`: step-by-step guide for proxy-aware, sudo-free setup with Gemini CLI as the primary tool
- macOS CI job (`macos-checks`) in `.github/workflows/ci.yml`

### Changed

- **`TOOLKIT_VERSION` bumped `0.14.0` → `0.17.0`** — picks up `v0.15.0` (agent sandboxing patterns, OpenTelemetry GenAI, prompt injection defense, cost-aware routing, local-first agents, reasoning-model prompting, plugin-audit + bilingual-readme-sync skills, env-var generalization, GitHub Actions marketplace pattern), `v0.16.0` (3 new patterns: MCP lazy-loading, agent-evals-ci, benchmark-reality-gap; 5 autonomous-dev skills: route, orchestrate, fallback, add, secure), and `v0.17.0` (resume skill, tier-based tool governance test, state reconciliation, SKILL.md adoption pattern, dev-assets-sync skill).

## [0.1.0] - 2026-04-03

### Added

- **Bootstrap entry points** for macOS, Linux, and Windows machines
- **System package installers** (Homebrew, apt, Chocolatey/winget)
- **Shell configuration and helpers** (aliases for git, tmux, MCP, release workflows)
- **Tmux workflow** with session templates, smart-new, bootstrapping, and onboarding
- **OpenCode bootstrap** with shared AGENTS.md, config templates, and starter skills
- **Toolkit integration** via pinned `TOOLKIT_VERSION` (0.14.0) to ai-dev-toolkit
- **Authentication guidance** scripts for AI tools and MCP providers
- **Doctor and CI check scripts** for environment validation
- **Content ownership documentation** (OWNERSHIP.md) defining setup-owned vs toolkit-sourced files
- **Responsibility split documentation** (TOOLKIT_COMPARISON.md) clarifying ai-dev-toolkit vs ai-dev-toolkit-setup roles

[Unreleased]: https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup/releases/tag/v0.1.0
