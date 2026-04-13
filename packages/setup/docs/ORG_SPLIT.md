# Organization Split: Why Two Repos?

## Executive Summary

- **ai-dev-toolkit** (`Forge-Space` org) = Org-level, reusable patterns and implementations
- **ai-dev-toolkit-setup** (`LucasSantana-Dev` org) = Personal-scope machine bootstrap
- **Rule**: Org-level content lives in `Forge-Space`. Personal machine setup lives in `LucasSantana-Dev`.

---

## The Split

### ai-dev-toolkit (Forge-Space)

**Repository**: [Forge-Space/ai-dev-toolkit](https://github.com/Forge-Space/ai-dev-toolkit)

**Scope**: **Org-level, reusable content** that applies across projects and teams.

**Owned here**:
- AGENTS.md — shared development principles and workflow
- Skill definitions — reusable agent and codex skills for common tasks (repo intake, planning, debugging, shipping)
- Config templates — portable OpenCode and DCP configuration structures
- Tool implementations — release automation, MCP health checks, version management
- Project patterns — conventions, rules, and implementations for use inside projects

**Why org-level?**
- These patterns and skills are independent of any single machine's configuration
- They should be usable by multiple developers in the organization
- Updates benefit all users when they adopt a new toolkit release
- No machine-specific paths or local secrets needed

---

### ai-dev-toolkit-setup (LucasSantana-Dev)

**Repository**: [LucasSantana-Dev/ai-dev-toolkit-setup](https://github.com/LucasSantana-Dev/ai-dev-toolkit-setup)

**Scope**: **Personal-scope, machine-specific bootstrap** for a developer's machine.

**Owned here**:
- Bootstrap scripts — entry points for macOS, Linux, Windows
- System installers — Homebrew, apt, Chocolatey/winget package installation
- Shell helpers — git aliases, tmux shortcuts, MCP utilities, release helpers
- Tmux workflow — session templates, onboarding, environment setup
- Local configuration — OpenCode environment, local.env template, iTerm2 setup
- CI/verification — doctor checks, ci-check tests

**Why personal-scope?**
- These are machine-level setup tasks specific to a developer's workflow
- Not all org members need the same shell aliases or tmux templates
- Bootstrap scripts make opinionated choices about which packages to install
- The repo is a "snapshot" of how one developer's machine should be set up

---

## The Consumption Model

```
LucasSantana-Dev/ai-dev-toolkit-setup (this repo)
└── Consumes at TOOLKIT_VERSION=v0.12.0 ──────┐
                                               │
                                        Forge-Space/ai-dev-toolkit
                                        ├── kit/install.sh
                                        ├── tools/release.py
                                        ├── tools/mcp-health.py
                                        ├── config/opencode/skills/
                                        └── implementations/opencode/
```

**How it works**:
1. User clones `ai-dev-toolkit-setup` and runs `bootstrap.sh`
2. Bootstrap determines the `TOOLKIT_VERSION` and fetches from `Forge-Space/ai-dev-toolkit`
3. AI tool helpers, starter skills, and config templates are installed from the toolkit release
4. Shell helpers in `ai-dev-toolkit-setup` wrap or delegate to toolkit-provided tools

**Result**: Single source of truth for reusable content (upstream), but bootstraps happen on the personal machine with personal setup choices.

---

## Why Not Merge Into One Repo?

### Issues with merging:

1. **Mixing scopes** — Org-level patterns shouldn't live with personal machine setup
2. **Permission model** — `ai-dev-toolkit` can be read by multiple developers; `ai-dev-toolkit-setup` is personal
3. **Release cadence** — Toolkit updates are independent of bootstrap scripts
4. **Discoverability** — Developers looking for reusable skills find the toolkit; they don't need the personal bootstrap
5. **Onboarding cost** — New org members don't need personal machine setup; they need patterns and skills

### Why the current split works:

- **Clear ownership**: See `OWNERSHIP.md` for the definitive file-by-file map
- **One-way flow**: Bootstrap consumes from toolkit (never the reverse)
- **Version control**: Pin a specific toolkit release; bump only when features are needed
- **Independent evolution**: Toolkit and setup can release on different schedules

---

## When to Add Content Here

### Add to `ai-dev-toolkit-setup` if:
- It's machine-specific (OS installers, shell aliases, tmux templates)
- It's part of the personal bootstrap flow
- It's not reusable across multiple machines or developers
- It requires local paths (e.g., `~/.config/opencode/`)

### Add to `ai-dev-toolkit` instead if:
- It's a reusable pattern (skill definition, project template, workflow)
- It applies across projects
- It could benefit other developers
- It's not tied to a specific machine's configuration

---

## Cross-Repo Collaboration

### Updating toolkit content:

1. **Clone** [Forge-Space/ai-dev-toolkit](https://github.com/Forge-Space/ai-dev-toolkit)
2. **Make changes** (skills, patterns, tools, templates)
3. **PR and merge** to `Forge-Space/ai-dev-toolkit`
4. **Release** a new version tag (v0.12.1)
5. **Bump `TOOLKIT_VERSION`** in `ai-dev-toolkit-setup`
6. **Test with `ci-check.sh`**
7. **PR and merge** to `ai-dev-toolkit-setup`

### Updating bootstrap:

1. **Clone** this repo
2. **Make changes** (shell helpers, install scripts, tmux workflows)
3. **Test locally** (`bootstrap.sh`, `doctor.sh`, `ci-check.sh`)
4. **PR and merge** to `ai-dev-toolkit-setup`

---

## See Also

- `OWNERSHIP.md` — Definitive file ownership map for this repo
- `TOOLKIT_COMPARISON.md` — Detailed responsibility split (what each repo provides)
- `TOOLKIT_VERSION.md` — How to manage the toolkit version pin
- `CHANGELOG.md` — Release notes for this repo
