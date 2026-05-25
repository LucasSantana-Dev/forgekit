# Command Development Reference

Complete field catalog, dynamic features, and patterns for slash commands.

## Frontmatter Fields Reference

### description

Brief description shown in `/help` and command discovery.

```yaml
---
description: Review pull request for code quality issues
---
```

**Best practice:** Actionable, under 60 characters.

### allowed-tools

Restrict which tools the command can use.

**Patterns:**
```yaml
# Specific tools
allowed-tools: Read, Write, Edit

# Bash with restricted commands
allowed-tools: Bash(git:*)

# Multiple tools with restrictions
allowed-tools: [Bash(git:*), Read, Write]

# All tools (rarely needed)
allowed-tools: "*"
```

**Use when:** Command requires specific tool sandboxing.

### model

Override model for this command: sonnet, opus, haiku.

```yaml
model: haiku  # Fast, simple tasks
model: opus   # Complex multi-step analysis
```

### argument-hint

Document expected arguments for autocomplete and discovery.

```yaml
---
argument-hint: "[pr-number] [priority] [assignee]"
---

Review PR #$1 with priority $2, assign to $3.
```

### disable-model-invocation

Prevent SlashCommand tool from programmatic invocation.

```yaml
disable-model-invocation: true
```

**Use when:** Command should only be manually invoked.

### version (optional metadata)

Document command version (no special behavior).

```yaml
version: 2.1.0
```

## Dynamic Features

### Positional Arguments: $1, $2, $3, ...

```markdown
---
argument-hint: "[repo] [branch]"
---

Deploy repo $1 from branch $2 to production.
```

Usage: `/deploy myapp main`

### All Arguments: $ARGUMENTS

```markdown
---
argument-hint: "[options...]"
---

Run tests with options: npm test $ARGUMENTS
```

Usage: `/run-tests --watch --coverage`

### Bash Execution: !`command`

Execute bash during command invocation. Backticks are required.

```markdown
Recent commits: !`git log --oneline -5`

Verify branch: !`git rev-parse --abbrev-ref HEAD`

Check files: !`git diff HEAD~1 --name-only`
```

**Caution:** Long-running commands slow invocation. Use quick checks.

### Conditional Logic: $IF()

```markdown
$IF($1,
  Review PR #$1,
  Error: Please provide PR number. Usage: /review-pr [number]
)
```

### User Questions: AskUserQuestion

```markdown
Review type:
!`AskUserQuestion "Choose review depth" "quick|thorough"`

Based on selection: $?
- if quick: summary only
- if thorough: detailed analysis
```

**Note:** Full AskUserQuestion syntax varies per harness version. Test in your environment.

### File Reference with @ Syntax

Include file contents before command execution.

```markdown
---
argument-hint: "[file-path]"
---

Review @$1 for:
- Code quality
- Security issues
- Performance
```

**Static refs:**
```markdown
Compare @src/old.js with @src/new.js

Check alignment: @package.json and @tsconfig.json
```

### Plugin File Reference: ${CLAUDE_PLUGIN_ROOT}

Reference plugin resources portably.

```markdown
---
allowed-tools: Bash(node:*)
---

Analyze: !`node ${CLAUDE_PLUGIN_ROOT}/scripts/lint.js $1`

Config: @${CLAUDE_PLUGIN_ROOT}/config/rules.json
```

**Why:** Portable across installations and team members.

## Organization Patterns

### Flat Structure (5–15 commands)

```
.claude/commands/
├── review.md
├── test.md
├── deploy.md
├── fix-bug.md
└── release.md
```

### Namespace Structure (15+ commands)

Subdirectories become namespace prefixes:

```
.claude/commands/
├── ci/
│   ├── build.md      → /build (project:ci)
│   ├── test.md       → /test (project:ci)
│   └── deploy.md     → /deploy (project:ci)
├── git/
│   ├── commit.md     → /commit (project:git)
│   ├── rebase.md     → /rebase (project:git)
│   └── push.md       → /push (project:git)
└── docs/
    ├── generate.md   → /generate (project:docs)
    └── publish.md    → /publish (project:docs)
```

**Namespace benefits:**
- Logical grouping
- Shown in `/help` output
- Avoid name conflicts
- Easier to find related commands

### Naming Conventions

- Use verb-noun pattern: `review-pr`, `fix-issue`, `deploy-app`
- Avoid generic names: don't name everything `run` or `test`
- Use hyphens for multi-word names
- Consider plugin-specific prefixes for plugin commands

## Pattern Examples

### Review Pattern

```markdown
---
description: Review code changes in current branch
allowed-tools: Read, Bash(git:*)
---

Files changed: !`git diff HEAD~1 --name-only`

Review each file above for:
1. Code quality and consistency
2. Potential bugs or security issues
3. Test coverage
4. Documentation needs

Provide specific feedback for each file.
```

### Testing Pattern

```markdown
---
description: Run tests for a specific file
argument-hint: "[test-file]"
allowed-tools: Bash(npm:*)
---

Run tests: !`npm test $1`

Analyze test results:
- Show all failures
- Explain cause of each failure
- Suggest fixes
```

### Documentation Pattern

```markdown
---
description: Generate docs for component
argument-hint: "[component-path]"
---

Document @$1:
- Component description
- Props/parameters with types
- Return values
- Usage examples
- Edge cases and errors
```

### Workflow Pattern

```markdown
---
description: Complete PR review workflow
argument-hint: "[pr-number]"
allowed-tools: Bash(gh:*), Read
---

PR #$1 Workflow:

1. Fetch details: !`gh pr view $1`
2. Review code changes
3. Check CI status
4. Approve or request changes

Document any blockers.
```

### Validation Pattern

```markdown
---
description: Deploy with validation
argument-hint: "[environment]"
---

Validate environment: !`echo "$1" | grep -E "^(dev|staging|prod)$"`

If $1 matches dev, staging, or prod:
- Proceed with deployment to $1
Otherwise:
- Show error: Invalid environment
- List valid options: dev, staging, prod
```

## Legacy vs. Skill Format Comparison

**Legacy format** (`.claude/commands/`):
```
.claude/commands/
├── review.md
└── deploy.md
```

**Skill format** (recommended):
```
.claude/skills/
└── review/
    ├── SKILL.md
    ├── REFERENCE.md
    └── examples/
```

**Key differences:**
- Skill format: `.claude/skills/<name>/SKILL.md`
- Commands format: `.claude/commands/name.md`
- Both are loaded identically (only layout differs)
- Skills support REFERENCE.md, examples/, and more structure
- For new development, prefer skill format

## Environment Variables Available

In bash execution within commands:

- `$CLAUDE_PROJECT_DIR` - Project root
- `$CLAUDE_PLUGIN_ROOT` - Plugin directory (for plugin commands)
- `$1, $2, $3, ...` - Positional arguments
- `$ARGUMENTS` - All arguments as single string

## Testing Commands

Test command execution locally:

```bash
# Test argument expansion
echo "Your args: \$1=$1 \$2=$2" | bash -

# Test file references (read @path manually)
cat package.json

# Test bash execution inline
git diff HEAD~1 --name-only
```

## AskUserQuestion Pattern

When supported (harness version dependent):

```markdown
What should we review?
!`AskUserQuestion "Review depth" "quick|thorough|comprehensive"`

Based on your choice:
- quick: summary and major issues
- thorough: detailed line-by-line review
- comprehensive: full analysis with refactor suggestions
```

**Note:** Syntax and availability vary. Check harness documentation.

## Common Mistakes

**❌ Message to user:**
```markdown
---
description: This will help you fix bugs
---

This command helps find bugs. You'll get a detailed report.
```

**✅ Instruction for Claude:**
```markdown
---
description: Find and explain bugs in the code
---

Analyze this code for bugs. For each bug found:
- Show the line number
- Explain the issue
- Suggest a fix
```

**❌ Hardcoded paths (breaks portability):**
```markdown
Load config: @/home/user/myproject/config.json
Run script: !`bash /opt/plugin/scripts/lint.sh`
```

**✅ Portable paths (works everywhere):**
```markdown
Load config: @${CLAUDE_PLUGIN_ROOT}/config.json
Run script: !`bash ${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh`
```

**❌ Slow bash in command:**
```markdown
Download data: !`curl https://example.com/large-file.json | jq .`
```

**✅ Keep bash quick:**
```markdown
Show recent files: !`git diff HEAD~1 --name-only`
```

## Plugin Command Integration

Plugin commands can coordinate with agents, skills, and hooks.

**Agent integration:**
```markdown
---
description: Deep code review
argument-hint: "[file-path]"
---

Analyze @$1 using the code-reviewer agent.

The agent will examine:
- Structure and patterns
- Security vulnerabilities
- Performance issues
```

**Skill integration:**
```markdown
---
description: Document with standards
argument-hint: "[api-file]"
---

Document @$1 following plugin standards.

Use the api-docs-standards skill to ensure:
- Complete endpoint documentation
- Consistent formatting
- Example quality
```

## Quick Reference

| Feature | Example | Use |
|---------|---------|-----|
| Position args | `$1, $2, $3` | Specific arguments |
| All args | `$ARGUMENTS` | Pass-through options |
| Bash execution | `` !`git status` `` | Dynamic context |
| File include | `@src/app.js` | Read file before command |
| Plugin path | `${CLAUDE_PLUGIN_ROOT}` | Portable plugin refs |
| Conditional | `$IF($1, ...)` | Branching logic |
| Model override | `model: haiku` | Speed/quality tradeoff |
| Tool limits | `allowed-tools: Read` | Sandboxing |

