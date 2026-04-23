---
id: best-workflow
title: AI-Assisted Development Workflow
description: '`` feature/my-feature → PR to main → automated deploy ``'
tags:
- best-practice
- ai-dev-toolkit
- security
- workflow
source:
  path: ai-dev-toolkit/packages/core/best-practices/workflow.md
  upstream: https://github.com/LucasSantana-Dev/ai-dev-toolkit/blob/main/packages/core/best-practices/workflow.md
  license: MIT
translations:
  pt-BR:
    title: Fluxo de Desenvolvimento Assistido por IA
    description: feature/my-feature → PR para main → deploy automatizado. Fluxo operacional
      para times que enviam mudanças com ajuda de IA.
---
# AI-Assisted Development Workflow

## Trunk-Based Development

```
feature/my-feature  →  PR to main  →  automated deploy
```

- Short-lived branches (hours, not weeks)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Squash coherent changes
- Run lint + build + test before PR

## Commit Constantly

After each functional step, commit and push. This gives you:
1. Granular rollback points
2. AI agent can see what was already done
3. CI catches issues early
4. Progress is visible to collaborators

## Quality Gates

Before every PR:
```bash
npm run lint        # or ruff check
npm run type-check  # or mypy
npm run test        # unit + integration
npm audit           # security scan
```

## Branch Naming

```
feature/add-auth-middleware
fix/null-pointer-data-processor
chore/update-dependencies
refactor/extract-validation-logic
ci/add-security-scanning
docs/api-usage-guide
release/v1.2.0
```

Never use tool-specific prefixes (`codex/`, `claude/`, `cursor/`).

## Multi-Repo Coordination

When a change spans multiple repos:
1. Start from the dependency (library → consumer)
2. Release the library first
3. Update consumers with the new version
4. Coordinate PRs with cross-references

## Homelab/Multi-Machine Sync

For syncing dev configs across machines:
- **chezmoi** for dotfiles (supports templates for Mac vs Linux)
- **age** for secret encryption
- **launchd/systemd** WatchPaths for instant file sync
- **atuin** for shell history sync
