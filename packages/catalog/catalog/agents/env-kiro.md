---
id: env-kiro
name: AWS Kiro environment
description: Configuration guide for AWS Kiro IDE and CLI — steering files, spec-driven development (feature/bugfix/design-first), Agent Skills, hooks, MCP, and AWS integrations
version: 0.3.0
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
    - "Auth: AWS Builder ID (free, no AWS account required), IAM Identity Center, external IdP, GitHub, or Google"
  resources:
    ram: negligible
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - spec-driven development (requirements → design → tasks, with approval gates)
    - teams requiring structured specs and human sign-off before implementation
    - Agent Skills for reusable procedures across projects
    - AWS service integration tasks via native use_aws tool
translations:
  pt-BR:
    name: Ambiente AWS Kiro
    description: Guia de configuração para AWS Kiro IDE e CLI — steering files, desenvolvimento orientado a spec (feature/bugfix/design-first), Agent Skills, hooks, MCP e integrações AWS
---
# AWS Kiro Environment

Kiro is a standalone VS Code-based IDE (Code OSS fork) and CLI. GA since November 17, 2025. **Not a VS Code plugin** — it installs as its own application with its own Open VSX marketplace. It is AWS's official replacement for Amazon Q Developer (EOL April 30, 2027; new signups blocked May 15, 2026).

## Installation and auth

**IDE:** Download from [kiro.dev](https://kiro.dev) (macOS, Windows, Linux)

**CLI:**
```bash
curl -fsSL https://cli.kiro.dev/install | bash
# or
brew install kiro
```

**Auth options:**
| Method | Who | Notes |
|--------|-----|-------|
| AWS Builder ID | Individual (free) | No AWS account required; supports GitHub + Amazon social logins (Mar 2026) |
| GitHub / Google | Individual | OAuth, redirects to browser |
| IAM Identity Center | Enterprise | SSO via organization IdP |
| External IdP (Okta, Entra ID) | Enterprise | As of Feb 12, 2026 |
| API key | CI/CD | Pro/Pro+/Power subscription required |

**Privacy:** Free/Builder ID users — content may be used for service improvement. Pro tiers with IDC or external IdP — content is **not** used for service improvement.

**Pricing:**
| Tier | Cost | Credits |
|------|------|---------|
| Free | $0 | 50/month |
| Pro | $20/mo | 1,000/month |
| Pro+ | $40/mo | 2,000/month |
| Power | $200/mo | 10,000/month |

Overage: $0.04/credit.

## Models

All inference runs through **Amazon Bedrock** (not direct Anthropic API):

| Model | Credits/task | Notes |
|-------|-------------|-------|
| Auto (smart router) | 10 | Recommended; picks optimal model per task |
| Claude Opus 4.7 | 22 | Exclusive to Kiro as of May 29, 2026 |
| Claude Sonnet 4.5 | 10–15 | All tiers |
| Claude Haiku 4.5 | 4 | Extended thinking; 2× speed vs Sonnet |
| DeepSeek / Qwen3 | 0.5 | Open-weight alternatives |

Auto is recommended as the starting point. Switch to Opus 4.7 for complex problems only.

## Steering files

`.kiro/steering/` (workspace) or `~/.kiro/steering/` (global, applies to all workspaces). Three foundation files are auto-included by default:

| File | Purpose |
|------|---------|
| `product.md` | Product description, user personas, business goals |
| `structure.md` | Repository layout, package purposes, build conventions |
| `tech.md` | Technology stack, libraries, architectural decisions |

Custom steering files use YAML frontmatter to control activation:

```markdown
---
inclusion: always
name: API conventions
description: REST design standards for this project
---
# API Conventions
All endpoints return `{ data, error }`. Use camelCase field names.
```

**Inclusion modes:**

| Mode | Behavior |
|------|---------|
| `always` | Loaded on every request (default for the three foundation files) |
| `manual` | Excluded by default; user toggles on when needed |
| `fileMatch` | Auto-loaded when files matching `fileMatchPattern` are in scope |
| `auto` | Agent sees summary only; loads full content on demand |

**File-match example:**
```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.tf"
name: Terraform conventions
description: IaC standards and provider patterns
---
# Terraform Conventions
Use `terraform fmt` before committing. Remote state in S3.
```

**Workspace vs global:** Workspace steering takes precedence over global on conflict. Push global files via MDM or distribute via repo download to `~/.kiro/steering/`.

## Spec-driven development

Specs live in `.kiro/specs/<feature-name>/` — three files, committed to version control:

```
.kiro/specs/
  user-auth/
    requirements.md   # EARS-format user stories + acceptance criteria
    design.md         # architecture, data models, API contracts
    tasks.md          # ordered checklist, dependency graph
```

**Four workflow variants:**

| Variant | Start from | Use when |
|---------|-----------|---------|
| **Requirements-First** | User behavior → design → tasks | Default; feature you're designing top-down |
| **Design-First** | Architecture → requirements → tasks | You have a technical solution, need to document rationale |
| **Quick Plan** | Skip approval gates | Well-understood features where you trust Kiro to plan |
| **Bugfix** | Current / expected / constraints | Structured debugging with regression prevention |

**EARS notation** (requirements.md format):
```
WHEN the user submits invalid credentials THE SYSTEM SHALL display an error message within 2 seconds.
WHEN login succeeds THE SYSTEM SHALL redirect to the dashboard.
```

**Approval gates:** Between each phase (requirements → design, design → tasks) Kiro waits for explicit approval. You edit before proceeding.

**Parallel execution:** Kiro builds a dependency graph from `tasks.md`. Independent tasks run in parallel as waves. Wave N starts only when wave N-1 completes.

**Property-based testing:** Kiro auto-generates PBT tests from EARS requirements to validate spec compliance.

### Bugfix spec

Bugfix requirements phase has three sections:
- **Current behavior** — what the bug does
- **Expected behavior** — what it should do instead
- **Constraints** — code/behavior that must NOT change (regression prevention)

PBT is auto-generated for all three categories. Available since IDE v0.10 (Feb 18, 2026).

## Agent Skills

Skills are reusable procedure packages stored in `.kiro/skills/` (workspace) or `~/.kiro/skills/` (global). They follow the open [Agent Skills standard](https://www.anthropic.com/news/agent-skills) and work across Kiro, Claude Code, Cursor, Cline, and other compatible tools.

```
.kiro/skills/
  deploy-check/
    SKILL.md           # required: metadata + instructions
    references/        # optional: detailed docs
    scripts/           # optional: executable code
    assets/            # optional: templates
```

**SKILL.md format:**
```markdown
---
name: deploy-check
description: Runs pre-deployment validation. Use before any deploy.
---
# deploy-check

## Steps
1. Run `pnpm web:build` — must succeed with 0 errors
2. Run `pnpm catalog:validate` — must pass
3. Confirm `CHANGELOG.md` has an unreleased section

## Output
Report pass/fail per step. Block deploy if any step fails.
```

**Activation:**
- **Automatic:** Agent matches `description` against request context; loads skill on demand
- **Manual:** Type `/deploy-check` as a slash command

**Progressive loading:** Only `name` + `description` load at startup. Full SKILL.md loads on demand — write precise descriptions for accurate auto-matching.

**CLI reference via URI:**
```json
{
  "resources": [
    "skill://.kiro/skills/*/SKILL.md",
    "skill://~/.kiro/skills/*/SKILL.md"
  ]
}
```

## Hooks

Hooks run on agent lifecycle events. Define in **agent JSON config files** (e.g. `.kiro/agents/my-agent.json`) — **not** in settings.json:

```json
{
  "hooks": {
    "agentSpawn": [{ "command": "git status" }],
    "userPromptSubmit": [{ "command": "echo 'prompt received'" }],
    "preToolUse": [
      { "matcher": "execute_bash", "command": "date >> /tmp/audit.log" }
    ],
    "postToolUse": [
      { "matcher": "fs_write", "command": "pnpm lint --fix" }
    ],
    "fileSave": [
      { "matcher": "**/*.ts", "command": "pnpm typecheck" }
    ],
    "specTaskEnd": [{ "command": "pnpm test" }]
  }
}
```

**All nine hook events:**

| Event | Fires when | Supports matcher |
|-------|-----------|-----------------|
| `agentSpawn` | Agent session starts | No |
| `userPromptSubmit` | User submits a message | No |
| `preToolUse` | Before tool call | Yes (tool name) |
| `postToolUse` | After tool call | Yes (tool name) |
| `fileCreate` | File created | Yes (glob pattern) |
| `fileSave` | File saved | Yes (glob pattern) |
| `fileDelete` | File deleted | Yes (glob pattern) |
| `specTaskStart` | Spec task begins | No |
| `specTaskEnd` | Spec task completes | No |

**Matcher field syntax:**
- Canonical tool name: `"execute_bash"`, `"fs_write"`, `"fs_read"`, `"use_aws"`
- Alias: `"shell"`, `"write"`, `"read"`, `"aws"`
- Regex (prefix `@`): `"@mcp.*sql.*"` — matches MCP tools by name
- MCP format: `"@postgres/query"`
- File glob (for file events): `"**/*.ts"`, `"src/api/*.ts"`

**Hook actions:** Can be shell commands (free) or agent prompts (consume credits).

**Exit code behavior:**
- `0`: Success; stdout added to agent context
- `2` on `preToolUse`: **Blocks the tool call**; stderr returned to LLM
- Other: Hook failed; stderr shown as warning

**Timeouts:** 30s (CLI), 60s (IDE). Configure via `timeout_ms`.

**STDIN/STDOUT:** Hooks receive a JSON event via STDIN (includes `session_id`, `tool_name`, `tool_input`, `tool_response` for postToolUse). Route shell output:
- `$AGENT_CONTEXT_OUT` → adds to agent context
- `$AGENT_DISPLAY_OUT` → shows in TUI only

## Built-in tools

Four tools with canonical names and aliases:

| Canonical | Alias | What it does |
|-----------|-------|-------------|
| `fs_read` | `read` | Read files (supports line-based mode) |
| `fs_write` | `write` | Create/modify files |
| `execute_bash` | `shell` | Run shell commands |
| `use_aws` | `aws` | Execute AWS API calls via SigV4 (15,000+ APIs) |

**Permission defaults:** `fs_read` trusted by default for CWD. `fs_write`, `execute_bash`, `use_aws` prompt for permission.

**Permission config example:**
```json
{
  "allowedTools": ["fs_read", "fs_write"],
  "tools": {
    "write": { "allowedPaths": ["~/projects/**"] },
    "shell": {
      "allowedCommands": ["pnpm.*", "git.*"],
      "deniedCommands": ["rm -rf.*"],
      "autoAllowReadonly": true
    }
  }
}
```

Hook matchers use **canonical names** (`fs_write`, not `write`).

## MCP integration

MCP servers configured in **`mcp.json`** at workspace (`.kiro/settings/mcp.json`) or global (`~/.kiro/settings/mcp.json`) scope. Note: **not** `.kiro/settings.json`.

**Local server:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
      "env": { "TOKEN": "${MY_TOKEN}" },
      "autoApprove": ["read_file"],
      "disabledTools": ["delete_file"],
      "disabled": false
    }
  }
}
```

**Remote server (with OAuth):**
```json
{
  "mcpServers": {
    "remote-api": {
      "url": "https://api.example.com/mcp",
      "headers": { "X-API-Key": "${API_KEY}" },
      "oauth": { "redirectUri": "127.0.0.1:8080" }
    }
  }
}
```

**Critical:** Kiro CLI does **not** inherit your shell's `PATH`. Use absolute paths from `which node`, `which npx`, etc.

**Config priority (CLI):** Agent config `mcpServers` > workspace mcp.json > global mcp.json. Set `includeMcpJson: true` in agent config to merge instead of override.

## Kiro Powers

Powers are curated MCP bundles — MCP servers + steering files + hooks — pre-packaged for specific domains. They solve context overload by loading tool metadata only, activating full tools on demand.

**Structure:**
```
.kiro/powers/power-name/
  POWER.md      # onboarding guide for agent
  mcp.json      # MCP server configuration
  steering/     # workflow-specific guidance
```

**Official Powers:** Terraform, AWS Observability (CloudWatch + CloudTrail + Application Signals), Aurora PostgreSQL, Datadog, Figma, Stripe, Supabase, Netlify, Postman.

Install via IDE UI or kiro.dev. No additional cost. Commit `.kiro/powers/` to repo for team-wide distribution.

## CLI reference

```bash
# Interactive chat
kiro chat

# One-shot non-interactive (CI/CD)
kiro chat --no-interactive --trust-all-tools --agent my-agent "run tests"

# Resume previous session
kiro chat --resume
kiro chat --resume-picker      # select from list
kiro chat --list-sessions

# Convert English to shell command
kiro translate "find all TypeScript files modified in the last 7 days"
kiro translate -n 3 "compress logs folder"  # show top 3 options

# List available models
kiro chat --list-models

# Show version and changelog
kiro version --changelog
```

**Agent management slash commands (inside chat):**
```
/agent create -D "Runs pnpm workspace checks" -m filesystem
/agent edit my-agent
/agent set-default my-agent
/agent swap            # switch agents at runtime
```

**Autocomplete:** `kiro integrations install autocomplete`

## Key behaviors and gotchas

- **Spec-first is mandatory:** Kiro prompts for spec approval before touching implementation. By design — cannot be skipped.
- **Open VSX, not VS Code Marketplace:** Kiro uses the Open VSX extension registry. Not all VS Code extensions are available.
- **ACP support (CLI v1.25.0):** Agent Client Protocol lets JetBrains, Zed, and ACP-compatible editors use Kiro as the agent backend.
- **Privacy gate on auth:** If your work is sensitive, use IDC or external IdP (not Builder ID/GitHub/Google) to ensure content is not used for service improvement.
- **GovCloud restrictions:** AWS GovCloud (US) supports Kiro IDE/CLI via IDC and external IdPs only — GitHub/Google/Builder ID auth unavailable.
- **Opus 4.7 exclusive:** As of May 29, 2026, Claude Opus 4.7 is only available on Kiro (removed from Amazon Q Developer, which is being sunset).
- **Q Developer EOL:** New Q Developer signups blocked May 15, 2026. Full end-of-support April 30, 2027.
