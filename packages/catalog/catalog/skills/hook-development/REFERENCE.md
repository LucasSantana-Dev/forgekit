# Hook Development Reference

Complete event catalog, patterns, and advanced techniques.

## Hook Events — Full Catalog

### PreToolUse

Execute before any tool runs. Can approve, deny, or modify tool calls.

**Input fields:**
- `tool_name` - Name of tool being called
- `tool_input` - Input parameters to the tool
- `permission_mode` - Current permission context (ask/allow/deny)

**Output:**
```json
{
  "decision": "approve|deny|ask",
  "updatedInput": {"field": "modified_value"},
  "systemMessage": "Explanation for Claude"
}
```

**Example (prompt-based):**
```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "prompt",
      "prompt": "Validate file write safety: check for system paths, credentials, path traversal, sensitive content. Return 'approve' or 'deny'."
    }]
  }]
}
```

### PostToolUse

Execute after tool completes. React to results, log, provide feedback.

**Input fields:**
- `tool_name` - Tool that ran
- `tool_input` - Original input
- `tool_result` - Result returned by tool

**Example:**
```json
{
  "PostToolUse": [{
    "matcher": "Edit",
    "hooks": [{
      "type": "prompt",
      "prompt": "Analyze the edit result for syntax errors, security issues, or breaking changes. Provide feedback."
    }]
  }]
}
```

### UserPromptSubmit

Execute when user submits a prompt. Add context, validate, enforce guidelines.

**Input fields:**
- `user_prompt` - Raw prompt text from user
- `session_id` - Session identifier

**Example:**
```json
{
  "UserPromptSubmit": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Does this prompt discuss auth, security, or API access? If yes, include relevant security warnings. Return warnings or 'OK'."
    }]
  }]
}
```

**Use cases:**
- Add security context before dangerous operations
- Inject project guidelines
- Validate prompt structure
- Add instrumentation

### Stop

Execute when main agent considers stopping. Verify task completion.

**Input fields:**
- `reason` - Why agent is stopping

**Output:**
```json
{
  "decision": "approve|block",
  "reason": "Why stopping/continuing",
  "systemMessage": "Additional context"
}
```

**Example:**
```json
{
  "Stop": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Verify task completion: tests run, build succeeded, all requirements met. Return 'approve' to stop or 'block' with reason to continue."
    }]
  }]
}
```

### SubagentStop

Execute when subagent considers stopping. Ensure subagent completed its assigned task.

Similar structure to Stop hook. Use for subagent task validation.

### SessionStart

Execute when session begins. Load context, set environment variables, initialize state.

**Input fields:**
- `cwd` - Current working directory
- `session_id` - Session identifier

**Special capability:** Persist environment variables using `$CLAUDE_ENV_FILE`:
```bash
echo "export PROJECT_TYPE=nodejs" >> "$CLAUDE_ENV_FILE"
echo "export STRICT_MODE=true" >> "$CLAUDE_ENV_FILE"
```

**Example:**
```json
{
  "SessionStart": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/load-context.sh",
      "timeout": 10
    }]
  }]
}
```

### SessionEnd

Execute when session ends. Cleanup, logging, state persistence.

**Example:**
```bash
#!/bin/bash
# Log session results
echo "Session completed" >> ~/.claude/session-log.txt
# Clean up temporary files
rm -f /tmp/claude-session-*
```

### PreCompact

Execute before context compaction. Add critical information to preserve.

**Example:**
```json
{
  "PreCompact": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "What critical information should be preserved in context before compaction? Focus on: active task, blockers, file paths, configuration."
    }]
  }]
}
```

### Notification

Execute when Claude sends notifications. React to user notifications.

**Input fields:**
- `notification_text` - Text of notification
- `notification_type` - Type/severity

## Matcher Patterns

### Exact Tool Match

```json
"matcher": "Write"
```

Matches only the Write tool.

### Multiple Tools

```json
"matcher": "Read|Write|Edit"
```

Matches any of the tools. Pipe-separated.

### Wildcard

```json
"matcher": "*"
```

Matches all tools and events.

### Regex Patterns

```json
"matcher": "mcp__.*__delete.*"
```

Regex match on tool names. Case-sensitive.

**Common patterns:**
```json
"matcher": "mcp__.*"
"matcher": "mcp__plugin_asana_.*"
"matcher": "Read|Write|Edit"
"matcher": "Bash"
```

## Complex Hook Examples

### Multi-Step Validation Hook

```bash
#!/bin/bash
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
tool_name=$(echo "$input" | jq -r '.tool_name')

# Validate tool
if [[ ! "$tool_name" =~ ^[a-zA-Z0-9_]+$ ]]; then
  echo '{"decision": "deny", "reason": "Invalid tool name"}' >&2
  exit 2
fi

# Validate path
if [[ -z "$file_path" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# Check for path traversal
if [[ "$file_path" == *".."* ]]; then
  echo '{"decision": "deny", "reason": "Path traversal detected"}' >&2
  exit 2
fi

# Check for sensitive files
for pattern in ".env" ".aws" ".ssh" "credentials" "secret"; do
  if [[ "$file_path" == *"$pattern"* ]]; then
    echo '{"decision": "deny", "reason": "Sensitive file"}' >&2
    exit 2
  fi
done

# Check project boundary
if ! [[ "$file_path" == /* ]] && [[ "$file_path" == ../../* ]]; then
  echo '{"decision": "deny", "reason": "File outside project"}' >&2
  exit 2
fi

echo '{"decision": "approve"}'
exit 0
```

### Bash Validation Hook

```bash
#!/bin/bash
set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Whitelist safe commands
safe_commands=("git" "npm" "yarn" "ls" "cat" "grep" "find")
cmd_base=$(echo "$command" | awk '{print $1}')

for safe in "${safe_commands[@]}"; do
  if [[ "$cmd_base" == "$safe" ]] || [[ "$cmd_base" == *"/$safe" ]]; then
    echo '{"decision": "approve"}'
    exit 0
  fi
done

# Deny dangerous commands
dangerous=("rm -rf" "dd " "mkfs")
for danger in "${dangerous[@]}"; do
  if [[ "$command" =~ $danger ]]; then
    echo '{"decision": "deny", "reason": "Dangerous command blocked"}' >&2
    exit 2
  fi
done

echo '{"decision": "approve"}'
exit 0
```

### SessionStart Context Loader

```bash
#!/bin/bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Load project metadata
if [ -f "$PROJECT_DIR/.claude/project.json" ]; then
  project_type=$(jq -r '.type' "$PROJECT_DIR/.claude/project.json")
  export PROJECT_TYPE="$project_type"
  echo "export PROJECT_TYPE='$project_type'" >> "$CLAUDE_ENV_FILE"
fi

# Load Node.js version if .nvmrc exists
if [ -f "$PROJECT_DIR/.nvmrc" ]; then
  node_version=$(cat "$PROJECT_DIR/.nvmrc")
  echo "export NODE_VERSION='$node_version'" >> "$CLAUDE_ENV_FILE"
fi

# Set up test environment
echo "export TEST_ENV=true" >> "$CLAUDE_ENV_FILE"
echo "export CI=true" >> "$CLAUDE_ENV_FILE"

echo '{"continue": true, "systemMessage": "Project context loaded"}'
exit 0
```

## Environment Variables Available

Available in all command hooks:

- `$CLAUDE_PROJECT_DIR` - Project root directory
- `$CLAUDE_PLUGIN_ROOT` - Plugin directory (for portable paths)
- `$CLAUDE_ENV_FILE` - SessionStart only: file to persist env vars
- `$CLAUDE_CODE_REMOTE` - Set if running in remote context

**Always use ${CLAUDE_PLUGIN_ROOT} for portability:**
```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh
cat ${CLAUDE_PLUGIN_ROOT}/config/rules.json
```

## Hook Configuration Format Differences

### Plugin hooks.json (with wrapper)

```json
{
  "description": "Optional description",
  "hooks": {
    "PreToolUse": [...],
    "Stop": [...]
  }
}
```

**Required:** `hooks` key wraps all events.
**Optional:** `description` field.

### User .claude/settings.json (direct)

```json
{
  "PreToolUse": [...],
  "Stop": [...]
}
```

**No wrapper:** Events at top level.
**No description:** Not used here.

## Testing Hooks

### Test Command Hook Directly

```bash
# Create test input
cat > test-input.json << 'TESTEOF'
{
  "tool_name": "Write",
  "tool_input": {"file_path": "/tmp/test.txt"},
  "session_id": "test-123"
}
TESTEOF

# Run hook
cat test-input.json | bash ${CLAUDE_PLUGIN_ROOT}/hooks/validate.sh

# Check output
echo "Exit code: $?"
```

### Validate Hook JSON Output

```bash
# Run hook and pipe to jq for validation
cat test-input.json | bash hook.sh | jq .

# Check for required fields
output=$(cat test-input.json | bash hook.sh)
echo "$output" | jq -e '.decision' > /dev/null && echo "Valid" || echo "Invalid"
```

### Debug Mode

Run Claude Code in debug mode to see hook execution:

```bash
claude --debug
```

Look for hook registration, input/output JSON, timing, and exit codes.

## Security Best Practices

### Input Validation in Command Hooks

Always validate before trusting input:

```bash
input=$(cat)

# Validate JSON structure
if ! echo "$input" | jq empty 2>/dev/null; then
  echo '{"error": "Invalid JSON input"}' >&2
  exit 2
fi

# Validate required fields
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
if [ -z "$tool_name" ]; then
  echo '{"error": "Missing tool_name"}' >&2
  exit 2
fi
```

### Path Safety

Check for traversal and sensitive files:

```bash
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

# Deny path traversal
if [[ "$file_path" == *".."* ]] || [[ "$file_path" == /* ]]; then
  exit 2
fi

# Deny sensitive patterns
if [[ "$file_path" =~ (\.env|\.aws|\.ssh|credentials|secret|password) ]]; then
  exit 2
fi
```

### Always Quote Variables

```bash
# GOOD
cd "$CLAUDE_PROJECT_DIR"
echo "$file_path"
bash "${script_path}"

# BAD - injection risk
cd $CLAUDE_PROJECT_DIR
echo $file_path
bash $script_path
```

### Set Reasonable Timeouts

```json
{
  "type": "command",
  "command": "bash script.sh",
  "timeout": 10
}
```

**Defaults:** Command (60s), Prompt (30s). Set lower for interactive scripts.

## Hook Lifecycle

### Loading

Hooks load when Claude Code session starts. Configuration is read from:
1. User hooks in `.claude/settings.json`
2. Plugin hooks in `hooks/hooks.json`

Hooks run in parallel (no order guaranteed).

### Hot-Swap Limitations

**Changes require session restart:**
- Editing `hooks/hooks.json` won't affect current session
- Adding new hook scripts won't be recognized
- Changing hook commands/prompts won't update
- Changing environment variables won't apply

**To test changes:**
1. Edit hook configuration or scripts
2. Exit Claude Code session
3. Restart Claude Code
4. New hook configuration loads
5. Test with `claude --debug`

## Common Patterns

### Flag-File Activation

Create temporary hooks that activate only when a flag exists:

```bash
#!/bin/bash
FLAG_FILE="${CLAUDE_PROJECT_DIR}/.enable-strict-validation"

if [ ! -f "$FLAG_FILE" ]; then
  exit 0
fi

# Flag present, run validation
input=$(cat)
# ... validation logic ...
```

**Usage:**
```bash
touch .claude/.enable-strict-validation
rm .claude/.enable-strict-validation
```

### Configuration-Based Activation

Hooks that check configuration for on/off:

```bash
#!/bin/bash
CONFIG="${CLAUDE_PROJECT_DIR}/.claude/hook-config.json"

if [ -f "$CONFIG" ]; then
  enabled=$(jq -r '.validate_writes // false' "$CONFIG")
  [ "$enabled" != "true" ] && exit 0
fi

input=$(cat)
# ... hook logic ...
```

## Integration with Commands and Skills

Hooks can coordinate with commands and skills:

**Pre-hook setup (in SessionStart):**
```bash
# Create state that commands will use
mkdir -p "$CLAUDE_PROJECT_DIR/.claude/.hook-state"
echo "ready" > "$CLAUDE_PROJECT_DIR/.claude/.hook-state/initialized"
```

**Command reads hook state:**
```markdown
---
allowed-tools: Read
---

Check initialization at: .claude/.hook-state/initialized
Proceed based on state.
```

**Hook reacts to command output:**
```json
{
  "PostToolUse": [{
    "matcher": "Write",
    "hooks": [{
      "type": "command",
      "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/post-write.sh"
    }]
  }]
}
```

Post-write hook can read what was written and log/validate.
