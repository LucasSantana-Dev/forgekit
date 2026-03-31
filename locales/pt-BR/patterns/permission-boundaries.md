# Permission Boundaries

> Define what the agent can touch before it starts. Don't react to damage after the fact.

## The Problem

An agent with full access will eventually do something irreversible: delete a branch, push to main, drop a table, or send a message to a customer. These mistakes don't come from bad prompts — they come from the agent having more access than the task requires.

## The Pattern

Encode permissions as a constraint set that is evaluated **before** a tool is called, not after. Apply the minimum set of tools required for the task. Trust-gate broader access behind confirmation.

### Three Layers

```
Layer 1: Tool filtering (what tools the model can see)
Layer 2: Runtime blocking (what calls are intercepted)
Layer 3: Confirmation gates (what requires explicit approval)
```

Each layer is independent. Use all three in production workflows.

---

### Layer 1: Tool Filtering

Pass only the tools relevant to the task in the system prompt or tool list. Tools the model doesn't know about cannot be called.

```
Task: "Review this PR for security issues"
Tools: read_file, search_code, add_pr_comment
Excluded: merge_pr, push_files, delete_branch, run_bash
```

For Claude Code, use MCP server activation to control tool visibility. Servers not listed in `.mcp.json` provide no tools.

### Layer 2: Runtime Blocking

Even with a filtered list, intercept tool calls before execution. Block by name or prefix.

```python
# Block all destructive filesystem operations
SAFE_MODE = PermissionContext(
    deny_names={"delete_file", "write_file"},
    deny_prefixes={"execute_", "run_", "create_"}
)

def before_tool_call(tool_name: str, args: dict) -> bool:
    if SAFE_MODE.blocks(tool_name):
        log_denial(tool_name, args)
        return False  # blocked
    return True  # allowed
```

Log every denial. Patterns in denial logs reveal when a task needs broader permissions or when a prompt is misdirected.

### Layer 3: Confirmation Gates

Some tools are allowed but require explicit human confirmation before execution.

```python
REQUIRE_CONFIRMATION = {
    "merge_pr",
    "push_files",
    "run_bash",
    "delete_file",
    "execute_sql",
}

def should_confirm(tool_name: str) -> bool:
    return tool_name in REQUIRE_CONFIRMATION
```

Surface the tool name, arguments, and reason to the user. Require an affirmative response. Do not proceed on timeout.

---

### Permission Profiles

Define named profiles for common contexts. Reuse them across agents and tasks.

```yaml
profiles:
  read_only:
    description: Read files and code, no writes or execution
    deny_prefixes: [write_, create_, delete_, execute_, run_]

  code_review:
    description: Read code, leave comments, no merges
    deny_names: [merge_pr, push_files, delete_branch]
    deny_prefixes: [execute_, run_]

  safe_deploy:
    description: Deploy only — no code changes, no database ops
    deny_prefixes: [write_, delete_, execute_sql]
    require_confirmation: [deploy_service, restart_service]

  full_access:
    description: No restrictions — for trusted local sessions only
    deny_names: []
    deny_prefixes: []
    require_confirmation: [delete_branch, drop_table, push_to_main]
```

Reference profiles in task definitions so the permission set is visible alongside the work.

### Trust-Gated Initialization

Defer loading of high-privilege tools until trust is established.

```
Startup phase 1 (always):
  → Read-only tools (filesystem reads, search, inspect)
  → No write, execute, or external API tools

Startup phase 2 (after user confirmation or trusted env check):
  → Write tools (create, update, delete)
  → Execution tools (bash, deploy, publish)
  → External service tools (GitHub, Supabase, Slack)
```

Check trust at session start. Don't load phase 2 tools unless the environment is trusted (e.g., local dev with explicit flag, CI with verified OIDC token).

---

### Claude Code: CLAUDE.md Permissions Section

Encode permissions directly in `CLAUDE.md` so they apply to every session in the project.

```markdown
## Permissions

Auto-approve (no confirmation needed):
- git status, git diff, git log
- npm test, npm run lint, npm run build
- Read any file in the repo

Require confirmation:
- git push (to any branch)
- gh pr create, gh pr merge
- Any npm publish or deploy command
- Any file deletion

Never auto-approve:
- git push --force
- Direct database writes (production)
- Credential or secret file access
- Any operation outside this repo
```

### Claude Code: Hooks for Runtime Blocking

Use `PreToolUse` hooks to intercept tool calls before execution. Return a non-zero exit code to block.

```bash
# .claude/hooks/pre-tool-use.sh
TOOL="$CLAUDE_TOOL_NAME"

# Block pushes to main in any session
if [[ "$TOOL" == "Bash" ]]; then
  CMD=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.command // ""')
  if echo "$CMD" | grep -q "git push.*main\|git push.*--force"; then
    echo "Blocked: direct push to main is not allowed" >&2
    exit 1
  fi
fi
```

Hook patterns already in use in `implementations/claude-code/` show how to chain multiple guards.

---

### Minimal Permission Principle Checklist

Before starting any agent task:

- [ ] What is the *minimum* set of tools this task needs?
- [ ] Are any write or destructive tools in that set? If so, why?
- [ ] What is the blast radius if the agent misinterprets the task?
- [ ] Is there a read-only equivalent that accomplishes 80% of the task safely?
- [ ] Are confirmation gates in place for irreversible actions?

## Related Patterns

- [Tool Registry Patterns](tool-registry-patterns.md) — filtering tool lists by trust level
- [Streaming Orchestration](streaming-orchestration.md) — `permission_denial` events in turn loops
- [Agent Gotchas](agent-gotchas.md) — common permission-related failures
