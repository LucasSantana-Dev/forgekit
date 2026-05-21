---
id: env-kiro
name: AWS Kiro environment
description: Configuration guide for AWS Kiro IDE — steering files, spec-driven development, Agent Skills, and AWS-native integrations
version: 0.1.0
tags:
- agent
- platform-env
- kiro
- aws
- amazon
provider: claude
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting an AWS Kiro workspace and need to wire steering files, specs, Agent Skills, or Kiro hooks correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - AWS Kiro IDE installed (download from kiro.dev)
    - AWS account (optional for local tasks; required for AWS service integrations)
  resources:
    ram: negligible
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - spec-driven development workflows
    - AWS service integration tasks
    - teams requiring structured requirements before code
    - Agent Skills for reusable procedures
translations:
  pt-BR:
    name: Ambiente AWS Kiro
    description: Guia de configuração para AWS Kiro IDE — arquivos de steering, desenvolvimento orientado a spec, Agent Skills e integrações nativas com AWS
---
# AWS Kiro Environment

## Context files (Steering)

Kiro uses a `.kiro/steering/` directory for persistent context files that the agent reads before every task:

| File | Purpose |
|------|---------|
| `.kiro/steering/product.md` | Product description, user personas, business goals |
| `.kiro/steering/structure.md` | Repository layout, package purposes, build conventions |
| `.kiro/steering/tech.md` | Technology stack, libraries, architectural decisions |

These files are automatically loaded as context on every agent invocation — equivalent to `CLAUDE.md` in Claude Code.

**Example `.kiro/steering/tech.md`:**

```markdown
# Tech Stack

## Runtime
- Node.js 22 + TypeScript strict
- pnpm workspaces (monorepo)

## Key packages
- Astro 6 — static site generator for the web UI
- js-yaml — YAML parsing for catalog entries
- gray-matter — frontmatter parsing for .md files

## Conventions
- All new catalog entries require a `translations.pt-BR` block
- Tags must be kebab-case
- Run `pnpm catalog:validate` after catalog changes
```

Add custom steering files with a descriptive name; Kiro loads all `.md` files in `.kiro/steering/`.

## Spec-driven development

Kiro's signature workflow generates a requirements spec before writing any code:

1. **Describe the feature** in natural language to Kiro
2. **Kiro writes a spec** in `.kiro/specs/<feature-name>/`:
   - `requirements.md` — user stories and acceptance criteria
   - `design.md` — component design, data models, API contracts
   - `tasks.md` — implementation task breakdown
3. **Review and approve** the spec (edit before proceeding)
4. **Kiro implements** the approved spec task by task

```
.kiro/specs/
  user-auth/
    requirements.md
    design.md
    tasks.md
```

This workflow is optimized for teams that want human sign-off before the agent touches production code.

## Agent Skills

Released February 5, 2026. Agent Skills are reusable procedures that Kiro can invoke:

```
.kiro/skills/
  deploy-check/
    SKILL.md     # procedure definition
    scripts/     # helper scripts
```

**Example `SKILL.md`:**

```markdown
# deploy-check

Runs pre-deployment validation for the web package.

## Steps
1. Run `pnpm web:build` — must succeed with 0 errors
2. Run `pnpm catalog:validate` — must pass
3. Check `CHANGELOG.md` has an unreleased section
4. Confirm no `TODO` or `FIXME` markers in changed files

## Output
Report pass/fail for each step. Block deploy if any step fails.
```

Invoke with `@skill deploy-check` in the Kiro chat.

## Hooks

Kiro hooks run on agent lifecycle events, defined in `.kiro/settings.json`:

```json
{
  "hooks": {
    "onTaskComplete": "pnpm test",
    "onFileEdit": "pnpm lint --fix"
  }
}
```

## AWS-native integrations

Kiro ships with built-in tools for AWS services (no MCP configuration needed):
- **Amazon Q Developer** — code completion and inline suggestions
- **AWS CDK** — infrastructure code generation
- **CloudWatch Logs** — read logs directly in the IDE
- **CodeWhisperer** — security scanning on save

For other MCP servers, add them in `.kiro/settings.json` under `mcpServers` (same format as Claude Code and Cursor).

## Key behaviors

- **Model**: Claude Sonnet (via AWS Bedrock) by default; configurable in IDE settings
- **Spec-first default**: Kiro prompts for spec approval before implementation
- **AWS auth**: uses the active AWS profile or SSO session; no separate API key needed for Bedrock
- **Privacy**: code stays in your AWS account's Bedrock endpoint when using Bedrock mode
