# Claude Code Implementation

Comprehensive reference implementation of AI Dev Toolkit patterns for [Claude Code](https://claude.com/claude-code).

## Overview

Claude Code is Anthropic's official CLI and VSCode extension for Claude. It excels at:
- Deep codebase exploration with built-in search tools
- Persistent memory across sessions
- Extensibility via MCP servers, skills, and hooks
- Multi-model routing (Sonnet, Opus, Haiku)
- Tool-calling workflow with confirmation gates

This implementation shows how to apply the toolkit patterns to Claude Code's architecture.

## Quick Start

```bash
# Install (macOS/Linux)
curl -fsSL https://claude.com/install.sh | sh

# Initialize project
cd your-project
cp implementations/claude-code/example-claude-md.md CLAUDE.md

# Setup memory structure
mkdir -p ~/.claude/projects/$(pwd | sed 's/\//- /g')/memory
echo "# Memory Index" > ~/.claude/projects/$(pwd | sed 's/\//- /g')/memory/MEMORY.md

# Add hooks (optional)
mkdir -p ~/.claude/hooks
cp implementations/claude-code/hooks/*.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh

# Add skills (optional)
mkdir -p ~/.claude/skills
cp implementations/claude-code/skills/*.md ~/.claude/skills/

# Start session
claude
```

## Context Building

### CLAUDE.md Layering

Claude Code loads `CLAUDE.md` files with directory hierarchy precedence:

```
your-project/
  CLAUDE.md                    # Project-wide rules (always loaded)
  apps/
    web/
      CLAUDE.md                # Web-specific rules (loaded when in apps/web)
  packages/
    ui/
      CLAUDE.md                # UI library rules (loaded when in packages/ui)
```

**Best practices:**
- Root CLAUDE.md: architecture, tech stack, workflow, gotchas
- Subdirectory CLAUDE.md: module-specific conventions, APIs, testing patterns
- Keep under 500 lines per file (Claude Code loads entire file into context)
- Use `@filename` references instead of describing file locations

**Structure template:**

```markdown
# Project Name

## Quick Reference
- Stack: TypeScript, React, Supabase
- Build: `npm run build`
- Test: `npm test`
- Deploy: `npm run deploy`

## Architecture
[2-3 paragraph overview]

## Code Standards
- Functions: <50 lines, cyclomatic complexity <10
- No comments unless required for complex logic
- Prefer composition over inheritance

## Workflow
- Branch: feature/* or fix/*
- Commit: Conventional Commits format
- Test before PR, lint on pre-commit

## Testing Strategy
- Unit: business logic, edge cases
- Integration: API routes, database interactions
- E2E: critical user paths

## Gotchas
- [Specific issues that waste time]

## Security
- Never commit .env files
- Use secret scanning in CI
```

See [example-claude-md.md](./example-claude-md.md) for full reference.

### Memory System

Claude Code maintains persistent memory at `~/.claude/projects/<path>/memory/`.

**Structure:**

```
~/.claude/projects/-home-user-myproject/
  memory/
    MEMORY.md              # Index file (200 line limit, always loaded)
    architecture.md        # Detailed architectural decisions
    gotchas.md            # Known issues and workarounds
    dependencies.md       # Package-specific notes
    workflows.md          # Common task sequences
```

**MEMORY.md template:**

```markdown
# Memory Index

## Quick Facts
- Last deployed: 2026-03-10
- Current version: v1.2.3
- Active branch: feature/new-auth

## Key Decisions
- [2026-03-10] Switched to Supabase Auth (see architecture.md)
- [2026-03-05] Adopted Conventional Commits (see workflows.md)

## Active Tasks
- [ ] Implement OAuth flow (PR #42)
- [ ] Fix mobile responsiveness (issue #38)

## Gotchas Index
- See gotchas.md for full list
- Husky pre-commit fails on WSL → use HUSKY=0
- Docker build requires 16GB RAM minimum

## Learning
- [Key insights from recent work]

File paths: [link to topic files]
```

**Memory management workflow:**

1. **Session start**: Claude auto-loads MEMORY.md
2. **During work**: Update relevant topic files when you discover new patterns
3. **Session end**: Run `/sync-memories` skill (or manually update MEMORY.md index)
4. **Cleanup**: Keep MEMORY.md under 200 lines, move details to topic files

**Mapping to toolkit patterns:**
- MEMORY.md = [Memory Systems: Session Memory](../../patterns/memory-systems.md#session-memory)
- Topic files = [Memory Systems: Knowledge Base](../../patterns/memory-systems.md#knowledge-base)
- Update workflow = [Memory Systems: Update Protocol](../../patterns/memory-systems.md#update-protocol)

## Hooks

Claude Code supports two hook types:

### PreToolUse Hook

Runs **before** Claude executes a tool. Use for:
- Blocking dangerous commands
- Adding confirmation gates
- Rewriting commands before execution (e.g. RTK token compression)
- Injecting environment setup

**Location:** `~/.claude/hooks/PreToolUse.sh` or `.claude/hooks/PreToolUse.sh` (project-local)

**Example:** See [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh)

**Common patterns:**
```bash
# Block dangerous operations
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$COMMAND" =~ "rm -rf /" ]]; then
  echo "BLOCKED: Dangerous rm command"
  exit 1
fi

# Warn on destructive git operations
if [[ "$COMMAND" =~ "git push.*--force.*main" ]]; then
  echo "WARNING: Force-pushing to main"
  read -p "Continue? (y/N): " confirm
  [[ "$confirm" != "y" ]] && exit 1
fi

# Inject setup
if [[ "$TOOL_NAME" == "Bash" ]] && [[ ! -f .env ]]; then
  cp .env.example .env
fi
```

#### RTK: Token-Compressing Hook

[RTK (Rust Token Killer)](https://github.com/rtk-ai/rtk) is a PreToolUse hook that
transparently rewrites Bash commands to pipe output through a Rust binary before it
lands in the context window. 60-90% savings on `git`, `npm`, `ls`, and other
high-volume dev commands.

**Install and wire (macOS):**
```bash
brew install rtk
rtk init -g   # installs hook + patches settings.json
```

**Install and wire (Linux):**
```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
rtk init -g
```

**Verify:**
```bash
rtk --version   # rtk 0.x.x
rtk gain        # shows cumulative token savings
```

The hook uses an exit-code protocol: exit 0 = rewrite+allow, exit 1 = pass through
unchanged, exit 2 = deny (let Claude Code handle), exit 3 = rewrite+prompt user.
Commands RTK doesn't know how to compress pass through at exit 1 with zero overhead.

### PostToolUse Hook

Runs **after** tool execution. Use for:
- Auto-formatting modified files
- Running linters
- Validating outputs
- Logging/metrics

**Location:** `~/.claude/hooks/PostToolUse.sh` or `.claude/hooks/PostToolUse.sh`

**Example:** See [hooks/post-tool-use.sh](./hooks/post-tool-use.sh)

**Important gotchas:**
- PostToolUse hooks that modify files can create edit loops (Edit tool → hook modifies → Edit again)
- Use conditional logic to skip formatting if file already formatted
- For multi-file bulk edits, disable hooks temporarily or use Bash with inline python scripts

**Mapping to toolkit patterns:**
- PreToolUse = [Agent Gotchas](../../patterns/agent-gotchas.md)
- PostToolUse = [Workflow Best Practices](../../best-practices/workflow.md)

## Skills

Skills are reusable AI workflows defined in markdown files.

**Structure:**

```markdown
---
name: skill-name
description: What this skill does
triggers:
  - keyword or phrase that suggests this skill
  - another trigger phrase
---

# Skill Instructions

[Detailed instructions for Claude to execute]

## Steps
1. First do X
2. Then do Y
3. Finally Z

## Important Notes
- [Constraints or gotchas]
```

**Location:** `~/.claude/skills/` (global) or `.claude/skills/` (project-local)

**Examples:**
- [skills/verify.md](./skills/verify.md) - Quality gate (lint, type-check, test, build)
- [skills/ship.md](./skills/ship.md) - Git commit + push + PR creation

**Best practices:**
- Keep skills focused (one workflow per skill)
- Include error handling instructions
- Specify success criteria
- Document prerequisite tools/setup

**Creating custom skills:**

```markdown
---
name: deploy-staging
description: Deploy current branch to staging environment
triggers:
  - deploy to staging
  - staging deployment
---

# Deploy to Staging

## Prerequisites
Check that:
1. All tests pass (`npm test`)
2. No uncommitted changes (`git status`)
3. Current branch is pushed to remote

## Steps

1. **Build production bundle**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel staging**
   ```bash
   vercel deploy --prebuilt
   ```

3. **Verify deployment**
   - Check deployment URL works
   - Run smoke tests if available
   - Update MEMORY.md with deployment URL and timestamp

## Success Criteria
- Deployment URL returned
- No build errors
- Staging environment accessible

## Rollback
If deployment fails:
```bash
vercel rollback
```
```

**Mapping to toolkit patterns:**
- Skills = [Task Orchestration: Reusable Workflows](../../patterns/task-orchestration.md#reusable-workflows)
- Skill triggers = [Task Orchestration: Trigger Patterns](../../patterns/task-orchestration.md)

## MCP Server Strategy

Claude Code supports Model Context Protocol servers for extending capabilities.

**Global vs Per-Project:**

```json
// ~/.claude/config.json (global servers)
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}

// your-project/.claude/config.json (project-specific)
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    }
  }
}
```

**Recommended global servers:**
- `@modelcontextprotocol/server-filesystem` - File operations
- `@modelcontextprotocol/server-github` - GitHub API access
- `@modelcontextprotocol/server-postgres` - Database queries (if you use Postgres everywhere)

**Recommended per-project:**
- Cloud provider SDKs (AWS, GCP, Supabase, Vercel)
- Custom business logic servers
- Domain-specific tools

**Performance tips:**
- Keep total servers under 10 (context overhead)
- Keep total tools under 80 (tool selection accuracy)
- Disable unused servers with `"enabled": false`
- Use project-local configs for environment-specific tools

**Mapping to toolkit patterns:**
- MCP servers = [Context Building](../../patterns/context-building.md)
- Server configuration = [Context Building](../../patterns/context-building.md)

## Multi-Model Routing

Claude Code supports three model tiers:

| Model | Alias | Use For | Cost | Context |
|-------|-------|---------|------|---------|
| Sonnet 4.5 | `/fast` toggle off | Default work, most tasks | $3/$15 | 200K |
| Opus 4.6 | Default | Complex architecture, deep analysis | $15/$75 | 1M |
| Haiku 3.5 | Manual via API | Quick checks, formatting | $1/$5 | 200K |

**Routing strategy:**

```markdown
## Multi-Model Routing (in CLAUDE.md)

- **Default: Sonnet** - Most development work
- **Use Opus for:**
  - Architectural decisions affecting >3 files
  - Complex debugging requiring deep trace analysis
  - Refactoring with cross-cutting concerns
  - Security-critical code review
- **Use Haiku for:**
  - Formatting/linting fixes
  - Simple test generation
  - Documentation updates
```

**Model selection workflow:**

1. Start with Sonnet for general work
2. Switch to Opus if Claude struggles after 2-3 turns
3. Use Haiku for batch operations (via programmatic API, not CLI)

**Mapping to toolkit patterns:**
- Model routing = [Multi-Model Routing](../../patterns/multi-model-routing.md)
- Cost optimization = [Context Management](../../best-practices/context-management.md)

## Session Workflow

Recommended workflow for effective sessions:

### Session Start

```bash
# 1. Navigate to project
cd ~/projects/myproject

# 2. Start Claude Code
claude

# Claude auto-loads:
# - CLAUDE.md (project root + subdirectory)
# - MEMORY.md (session memory)
# - MCP servers (global + project)

# 3. (Optional) Load specific context
# @path/to/file.ts - File reference
# @**/*.test.ts - Glob pattern
```

**Automatic checks** (via skill or manual):
- Check git status, current branch
- Review open issues/PRs
- Check active tasks from MEMORY.md

### During Work

**Context management:**
- Use `@filename` references instead of describing locations
- Run `/compact` when context grows large (~70% of 200K tokens)
- Use `/clear` between unrelated tasks

**Quality gates:**
- Run `/verify` skill after significant changes
- Commit frequently with meaningful messages
- Update MEMORY.md when discovering new patterns

**Gotcha prevention:**
- Read existing files before editing (Edit tool requires prior Read)
- Check test output for false positives
- Validate CI passes before requesting PR creation

### Session End

```markdown
## End-of-Session Checklist (via skill or manual)

1. **Commit work**
   - [ ] All changes staged
   - [ ] Conventional commit message
   - [ ] Pushed to remote

2. **Update documentation**
   - [ ] CHANGELOG.md updated (if applicable)
   - [ ] README.md updated (if API changed)
   - [ ] MEMORY.md updated with new insights

3. **Sync memories**
   - [ ] Run `/sync-memories` skill
   - [ ] Move MEMORY.md details to topic files if over 200 lines

4. **Cleanup**
   - [ ] Delete temporary scripts
   - [ ] Remove debug code
   - [ ] Close unused branches
```

**Mapping to toolkit patterns:**
- Session workflow = [Session Management](../../patterns/session-management.md)
- Commit workflow = [Workflow Best Practices](../../best-practices/workflow.md)
- Memory sync = [Memory Systems: Update Protocol](../../patterns/memory-systems.md#update-protocol)

## Task Orchestration

For multi-step workflows, use skills with explicit state management:

```markdown
---
name: feature-flow
description: Complete feature development workflow
---

# Feature Development Flow

## Input Required
- Feature name
- Target branch (default: main)

## Steps

1. **Create feature branch**
   ```bash
   git checkout -b feature/[feature-name]
   ```

2. **Implement feature**
   - Write code
   - Add tests
   - Update CHANGELOG.md

3. **Quality gates**
   - Run `/verify` skill
   - Fix any issues
   - Commit: `feat: [description]`

4. **Create PR**
   - Push branch
   - Run `/ship` skill
   - Link related issues

5. **Update memory**
   - Add to MEMORY.md active tasks
   - Document any gotchas discovered
```

**Progress tracking:**

Use MEMORY.md for lightweight tracking:

```markdown
## Active Tasks

### Feature: OAuth Integration (PR #42)
- [x] Setup Supabase auth config
- [x] Implement login flow
- [ ] Add logout handler
- [ ] Write E2E tests
- [ ] Update docs

Next: Write logout handler, then E2E tests
```

For complex projects, use external tools (Linear, GitHub Projects) and sync via MCP.

**Mapping to toolkit patterns:**
- Multi-step workflows = [Task Orchestration](../../patterns/task-orchestration.md)
- Progress tracking = [Task Orchestration: State Management](../../patterns/task-orchestration.md#state-management)

## Security & Safety

### Secret Management

**Prevention (PreToolUse hook):**

```bash
# Block commits containing secrets
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$COMMAND" =~ "git commit" ]]; then
  if git diff --cached | grep -qE 'sk_live_|AKIA|-----BEGIN PRIVATE KEY-----'; then
    echo "BLOCKED: Potential secret detected"
    exit 1
  fi
fi
```

**Detection (PostToolUse hook):**

```bash
# Scan written files for secrets
if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  if command -v gitleaks &> /dev/null; then
    gitleaks detect --no-git --source="$FILE_PATH"
  fi
fi
```

**Best practices:**
- Use environment variables for all secrets
- Add `.env` to `.gitignore`
- Use secret scanning in CI (GitGuardian, Gitleaks, Trivy)
- Never put secrets in CLAUDE.md or memory files

### Tool Safeguards

See [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh) for comprehensive examples:

- Block `rm -rf /`, `dd`, `mkfs` (destructive file operations)
- Warn on `git push --force` to protected branches
- Confirm `git branch -D` (permanent deletion)
- Validate database migrations before applying

**Mapping to toolkit patterns:**
- Secret scanning = [Security Best Practices](../../best-practices/security.md)
- Safeguards = [Agent Gotchas](../../patterns/agent-gotchas.md)

## Performance Optimization

### Token Budget Management

Claude Code has a 200K token context window (Sonnet) or 1M (Opus).

**Monitoring:**
- Check token usage in bottom status bar
- Run `/compact` at ~70% (140K tokens for Sonnet)
- Use `/clear` between unrelated tasks

**Reduction strategies:**

1. **RTK hook (highest impact, zero workflow change)**
   Install RTK to compress Bash outputs before they reach the model. A single
   `git log` can produce 10K tokens of raw output; RTK filters it to under 1K.
   ```bash
   brew install rtk && rtk init -g   # macOS
   # or: curl installer + rtk init -g  (Linux)
   ```
   See [RTK hook setup](#rtk-token-compressing-hook) for full instructions.

2. **Targeted file reading**
   ```
   Instead of: "Read all files in src/"
   Do: "@src/components/Button.tsx @src/hooks/useAuth.ts"
   ```

3. **Glob patterns for specific files**
   ```
   Instead of: "@**/*"
   Do: "@**/*.test.ts" or "@src/lib/**/*.ts"
   ```

4. **Summarize before loading**
   ```
   "List files in src/components/, then I'll tell you which to read"
   ```

5. **Use memory files**
   - Store architectural decisions in memory/architecture.md
   - Reference: "Check architecture.md for DB schema"
   - Avoids re-reading large files

### Caching

Claude Code caches tool definitions and file contents between turns.

**Optimization:**
- Re-use `@filename` references (cached after first read)
- Keep CLAUDE.md stable (re-parsed on change)
- Minimize MCP server restarts (tools re-indexed on restart)

**Mapping to toolkit patterns:**
- Token management = [Context Management](../../best-practices/context-management.md)
- Caching = [Context Management](../../best-practices/context-management.md)

## Testing Strategy

### Test Generation

Use skills for consistent test generation:

```markdown
---
name: generate-tests
description: Generate comprehensive tests for a module
---

# Generate Tests

## Inputs
- Target file path
- Test type (unit, integration, e2e)

## Steps

1. **Analyze target file**
   - Read target file
   - Identify exported functions/classes
   - Note edge cases, error conditions

2. **Create test file**
   - Follow project naming convention (*.test.ts or *.spec.ts)
   - Import testing framework (Jest, Vitest, Playwright)
   - Setup mocks if needed

3. **Write test cases**
   - Happy path (primary use case)
   - Edge cases (empty inputs, boundary values)
   - Error conditions (invalid inputs, failures)
   - Integration points (if applicable)

4. **Verify**
   - Run tests: `npm test path/to/test.ts`
   - Check coverage meets threshold (>80%)
   - Verify no false positives
```

### Quality Gates

Integrate with existing CI:

```yaml
# .github/workflows/quality.yml
name: Quality Gates

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build
```

**Local verification** (via `/verify` skill):

```bash
npm run lint && \
npm run type-check && \
npm test && \
npm run build
```

**Mapping to toolkit patterns:**
- Test generation = [Testing](../../patterns/testing.md)
- Quality gates = [Workflow Best Practices](../../best-practices/workflow.md)

## Troubleshooting

### Common Issues

**1. Edit tool fails with "file not read"**
```
Solution: Read file first with @filename or Read tool
Always: Read → Edit workflow
```

**2. Hooks create infinite loops**
```
Problem: PostToolUse hook modifies file → triggers another Edit
Solution: Add conditional check in hook to skip if already formatted
```

**3. MCP server timeout**
```
Problem: Server takes >30s to respond
Solution: Reduce tool count, optimize server startup, check network
```

**4. Memory file not loading**
```
Problem: MEMORY.md over 200 lines
Solution: Move details to topic files, keep index under limit
```

**5. Git hooks conflict with Claude Code hooks**
```
Problem: Pre-commit hook fails but Claude Code proceeds
Solution: PreToolUse hook should exit 1 on failure to block
```

**6. RTK not rewriting commands**
```
Problem: rtk binary not in PATH when hook runs
Solution: Use full path in hook or ensure PATH includes ~/.local/bin
         Run: rtk --version to confirm binary is reachable
```

### Debug Mode

Enable verbose logging:

```bash
# Set environment variable
export CLAUDE_DEBUG=1

# Or run with flag
claude --debug
```

**Log locations:**
- `~/.claude/logs/` - Session logs
- `~/.claude/mcp-logs/` - MCP server logs

## Advanced Patterns

### Parallel Sub-Agents

For independent tasks, invoke multiple Claude instances:

```bash
# Terminal 1: Frontend work
cd apps/web && claude --prompt "Implement login form"

# Terminal 2: Backend work
cd apps/api && claude --prompt "Add authentication endpoint"

# Terminal 3: Testing
cd apps/web && claude --prompt "Write E2E tests for login"
```

**When to use:**
- 3+ independent tasks
- No shared state/files
- Clear file boundaries
- Parallel CI jobs

**Coordination:**
- Use git branches (merge after completion)
- Update shared MEMORY.md last (to avoid conflicts)
- Communication via GitHub issues/PRs

### Sequential Dependencies

For tasks where B depends on A output:

```markdown
## Workflow: API + Client Generation

### Step 1: Update API schema
1. Modify `schema.prisma`
2. Run `prisma generate`
3. Commit schema changes

### Step 2: Generate client types
1. Wait for Step 1 completion
2. Run `npm run codegen` (generates types from schema)
3. Verify types in `src/generated/`

### Step 3: Update frontend
1. Wait for Step 2 completion
2. Update React components with new types
3. Run type-check to verify
```

Use skills to encode these dependencies:

```markdown
---
name: schema-update-flow
description: Complete flow for schema changes (API → types → frontend)
---

# Schema Update Flow

## Step 1: Update Schema
[Instructions...]

## Step 2: Generate Types (requires Step 1)
Check that Step 1 completed:
- [ ] schema.prisma modified
- [ ] prisma generate ran successfully
- [ ] Changes committed

Then run: `npm run codegen`

## Step 3: Update Frontend (requires Step 2)
Check that Step 2 completed:
- [ ] Types generated in src/generated/
- [ ] No type errors in codegen output

Then update components...
```

**Mapping to toolkit patterns:**
- Parallel work = [Task Orchestration: Parallel Execution](../../patterns/task-orchestration.md#parallel-execution)
- Sequential deps = [Task Orchestration: Dependency Management](../../patterns/task-orchestration.md#dependency-management)

## Examples

See the following files for complete examples:

- [example-claude-md.md](./example-claude-md.md) - Full CLAUDE.md for TypeScript + React + Supabase project
- [hooks/pre-tool-use.sh](./hooks/pre-tool-use.sh) - PreToolUse hook with safeguards
- [hooks/post-tool-use.sh](./hooks/post-tool-use.sh) - PostToolUse hook with formatting
- [skills/verify.md](./skills/verify.md) - Quality gate skill
- [skills/ship.md](./skills/ship.md) - Git workflow skill

## Contributing

Improvements welcome! If you discover better patterns or encounter issues:

1. Open an issue describing the pattern/problem
2. Submit a PR with example code
3. Update this README with lessons learned

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [AI Dev Toolkit Patterns](../../patterns/)

## License

MIT
