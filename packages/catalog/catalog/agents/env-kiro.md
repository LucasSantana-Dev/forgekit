---
id: env-kiro
name: AWS Kiro environment
description: Configuration guide for AWS Kiro IDE and CLI — steering files, spec-driven development, Agent Skills, hooks, and MCP integrations
version: 0.2.0
tags:
- agent
- platform-env
- kiro
- aws
provider: claude
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or working inside an AWS Kiro workspace and need to wire steering files, specs, Agent Skills, or hooks correctly.
  skip_when: You are working in a different AI IDE (use the matching env-* agent instead).
  prerequisites:
    - Kiro IDE installed from kiro.dev, or Kiro CLI installed
    - AWS Builder ID (free, no AWS account required) or IAM Identity Center / GitHub / Google auth
  resources:
    ram: negligible
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - spec-driven development workflows (requirements → design → tasks)
    - teams requiring structured requirements and human sign-off before code
    - Agent Skills for reusable procedures across projects
    - AWS service integration tasks
translations:
  pt-BR:
    name: Ambiente AWS Kiro
    description: Guia de configuração para AWS Kiro IDE e CLI — arquivos de steering, desenvolvimento orientado a spec, Agent Skills, hooks e integrações MCP
---
# AWS Kiro Environment

Kiro is a standalone VS Code-based IDE and CLI (GA since November 17, 2025). It is not an IDE plugin — it ships as its own application. The defining feature is **spec-driven development**: Kiro generates a structured spec for review and approval before writing any implementation code.

## Installation and auth

**IDE:** Download from [kiro.dev](https://kiro.dev)

**CLI:**
```bash
curl -fsSL https://cli.kiro.dev/install | bash
# or
brew install kiro
```

**CLI commands:** `kiro chat`, `kiro agent`, `kiro integrations`, `kiro translate`

**Auth options:** AWS Builder ID (no AWS account required), IAM Identity Center, GitHub, Google

**Pricing:** Free tier — 50 credits/month. Pro — $20/month with the Auto model selector (picks the best model per task).

**Model:** Free tier uses Claude Sonnet 4.5. Pro tier uses an Auto selector that chooses the optimal model per task.

## Steering files

Kiro uses a `.kiro/steering/` directory (workspace) or `~/.kiro/steering/` (global) for persistent context. Three files auto-load by default:

| File | Purpose |
|------|---------|
| `.kiro/steering/product.md` | Product description, user personas, business goals |
| `.kiro/steering/structure.md` | Repository layout, package purposes, build conventions |
| `.kiro/steering/tech.md` | Technology stack, libraries, architectural decisions |

These behave like `CLAUDE.md` in Claude Code — always-on context for the agent.

### Inclusion modes

Control when a steering file is loaded by adding YAML frontmatter:

```markdown
---
inclusion: always
---
# Tech Stack
...
```

| Mode | Behavior |
|------|---------|
| `always` | Auto-loaded into every interaction (default for the three standard files) |
| `fileMatch` | Auto-loaded when the file being edited matches a glob pattern |
| `manual` | Referenced on-demand via `#steering-file-name` in the chat |

**File-match example:**

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.tf"
---
# Terraform Conventions
Use `terraform fmt` before committing. Remote state is in S3.
```

Add custom steering files with any descriptive name — Kiro loads all `.md` files in `.kiro/steering/` that match their inclusion rule.

## Spec-driven development

Kiro's signature workflow gates implementation behind a structured spec:

1. **Describe the feature** in natural language
2. **Kiro generates a spec** in `.kiro/specs/<feature-name>/`:
   - `requirements.md` — user stories with MUST/SHOULD/SHOULD NOT acceptance criteria
   - `design.md` — component design, data models, API contracts
   - `tasks.md` — ordered implementation tasks, each tied to a requirement
3. **Review and approve** the spec — edit before proceeding; Kiro waits for explicit approval
4. **Kiro implements** task by task, in dependency order (parallel where the graph allows)

```
.kiro/specs/
  user-auth/
    requirements.md
    design.md
    tasks.md
```

**Bugfix specs:** For bugs, Kiro generates a lightweight spec with root cause analysis and a test plan before patching — same approval gate, smaller artifact.

**Parallel execution:** Tasks without dependencies in `tasks.md` can run in parallel; Kiro respects the dependency graph automatically.

## Agent Skills

Released February 5, 2026. Reusable procedures stored in `.kiro/skills/` that Kiro invokes on demand. Uses the [Anthropic Agent Skills open standard](https://www.anthropic.com/news/agent-skills) (Dec 18, 2025), now supported by 32+ tools.

```
.kiro/skills/
  deploy-check/
    SKILL.md
    scripts/
```

**Example `SKILL.md`:**

```markdown
# deploy-check

Runs pre-deployment validation for the web package.

## Steps
1. Run `pnpm web:build` — must succeed with 0 errors
2. Run `pnpm catalog:validate` — must pass
3. Confirm `CHANGELOG.md` has an unreleased section
4. Confirm no `TODO` or `FIXME` markers in changed files

## Output
Report pass/fail for each step. Block deploy if any step fails.
```

Invoke with `@skill deploy-check` in Kiro chat.

## Hooks

Hooks run on agent lifecycle events. Define them in an **agent JSON config file** (e.g. `.kiro/agents/my-agent.json`), not in `.kiro/settings.json`:

```json
{
  "hooks": {
    "agentSpawn": [
      { "command": "git status" }
    ],
    "userPromptSubmit": [
      { "command": "echo 'Prompt received'" }
    ],
    "preToolUse": [
      { "matcher": "execute_bash", "command": "echo 'About to run bash:'; cat" }
    ],
    "postToolUse": [
      { "matcher": "fs_write", "command": "pnpm lint --fix" }
    ]
  }
}
```

| Event | Fires when |
|-------|-----------|
| `agentSpawn` | Agent session starts |
| `userPromptSubmit` | User submits a message |
| `preToolUse` | Before a tool call (use `matcher` to filter by tool name) |
| `postToolUse` | After a tool call (use `matcher` to filter by tool name) |

The `matcher` field is a tool-name filter (e.g. `"execute_bash"`, `"fs_write"`).

## Built-in tools and MCP

Kiro ships four built-in tools: `read`, `write`, `shell` (aliased `execute_bash`), and `use_aws` (native AWS SDK access without MCP).

For additional MCP servers, add them in `.kiro/settings.json` under `mcpServers` — same format as Claude Code and Cursor:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
    }
  }
}
```

**Kiro Powers** are Kiro-curated MCP bundles (e.g. GitHub, Jira, Confluence) that install with a single click from the IDE.

## Key behaviors

- **Spec-first default:** Kiro prompts for spec approval before touching implementation code. Cannot be skipped — that's by design.
- **Privacy:** When using AWS Bedrock auth (IAM Identity Center), code stays in your AWS account's Bedrock endpoint; it does not leave your region.
- **Global steering:** Files in `~/.kiro/steering/` apply across all workspaces. Good for personal conventions.
- **No CodeWhisperer / Q Developer:** CodeWhisperer has been deprecated (merged into Amazon Q Developer, which itself has a new-signup freeze as of May 15, 2026 and end-of-support April 30, 2027). Kiro is the current AWS AI coding product.
