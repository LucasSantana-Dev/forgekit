---
name: command-development
description: Use when creating, writing, or organizing slash commands. Covers frontmatter, dynamic arguments, file references, and bash execution. Commands are instructions FOR Claude, not messages TO the user.
---

# Command Development for Claude Code

**Critical: Commands are directives TO Claude, not messages TO the user.**

```markdown
# CORRECT — instruction for Claude
Review this code for SQL injection and XSS.
Provide line numbers and severity.

# INCORRECT — message to user
This command reviews your code for security.
You'll get a detailed report.
```

## Locations

- `.claude/commands/` — project-specific (team-shared)
- `~/.claude/commands/` — personal (all projects)
- `plugin-name/commands/` — plugin-bundled

Subdirectories create namespaces: `ci/build.md` → `/build (project:ci)`

## Frontmatter

| Field | Purpose | Example |
|-------|---------|---------|
| `description` | Shown in `/help` | `Review PR for security` |
| `allowed-tools` | Restrict tool access | `Read, Write, Bash(git:*)` |
| `model` | sonnet/opus/haiku | `haiku` |
| `argument-hint` | Document expected args | `[pr-number] [priority]` |

## Dynamic Arguments

Use `$1`, `$2`, `$3` or `$ARGUMENTS`:

```markdown
---
argument-hint: [pr-number] [priority]
---

Review PR #$1 with priority $2.
```

Bash execution inline with backticks:
```markdown
Files: !`git diff --name-only`
```

## File References

`@path` includes file content; `${CLAUDE_PLUGIN_ROOT}` for plugin portability:

```markdown
---
argument-hint: [file]
---

Review @$1 for bugs and quality.

Config: @${CLAUDE_PLUGIN_ROOT}/config.json
```

## Example

```markdown
---
description: Deploy service to environment
allowed-tools: Bash(git:*), Read
argument-hint: [service] [environment]
---

Deploy $1 to $2.

Validate environment is staging or production.

Changed files: !`git diff HEAD~1 --name-only -- packages/$1`

Review changes above, then proceed with deployment.
```

---

**See REFERENCE.md for:** full frontmatter catalog, conditional logic, AskUserQuestion patterns, complex examples.
