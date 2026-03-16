#!/bin/bash
#
# PostToolUse Hook for Claude Code
#
# Runs AFTER Claude executes a tool successfully.
# Use for: auto-formatting, linting, validation, logging
#
# Environment variables available:
#   TOOL_NAME - Name of tool that was invoked
#   COMMAND - For Bash tool, the command that was executed
#   FILE_PATH - For file tools, the file that was modified
#   EXIT_CODE - Exit code of the tool (0 = success)
#
# Exit codes:
#   0 - Success (always exit 0, errors are logged but don't block)
#
# IMPORTANT: Be careful with hooks that modify files
# - Can create infinite loops if Edit tool triggers another edit
# - Use conditional checks to avoid re-formatting already formatted files
#

set -euo pipefail

# ============================================================================
# AUTO-FORMATTING
# ============================================================================

format_file() {
  local file="$1"

  # Skip if file doesn't exist
  [[ ! -f "$file" ]] && return 0

  # Check if file is already formatted (to avoid loops)
  # We'll use a marker file to track recent formats
  if command -v md5sum &>/dev/null; then
    local hash=$(echo "$file" | md5sum | cut -d' ' -f1)
  else
    local hash=$(echo "$file" | md5 -q)
  fi
  local marker="/tmp/claude-code-formatted-$hash"

  # If formatted in last 5 seconds, skip
  if [[ -f "$marker" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      local marker_time=$(stat -f %m "$marker" 2>/dev/null || echo 0)
    else
      local marker_time=$(stat -c %Y "$marker" 2>/dev/null || echo 0)
    fi
    if [[ $(($(date +%s) - marker_time)) -lt 5 ]]; then
      return 0
    fi
  fi

  # Detect file type and format accordingly
  case "$file" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.scss|*.html|*.yml|*.yaml)
      if command -v prettier &> /dev/null; then
        echo "🎨 Auto-formatting: $file"
        if prettier --write "$file" 2>/dev/null; then
          touch "$marker"
          echo "✅ Formatted with Prettier"
        fi
      fi
      ;;

    *.py)
      if command -v ruff &> /dev/null; then
        echo "🎨 Auto-formatting: $file"
        if ruff format "$file" 2>/dev/null; then
          touch "$marker"
          echo "✅ Formatted with Ruff"
        fi
      elif command -v black &> /dev/null; then
        echo "🎨 Auto-formatting: $file"
        if black "$file" 2>/dev/null; then
          touch "$marker"
          echo "✅ Formatted with Black"
        fi
      fi
      ;;

    *.go)
      if command -v gofmt &> /dev/null; then
        echo "🎨 Auto-formatting: $file"
        if gofmt -w "$file" 2>/dev/null; then
          touch "$marker"
          echo "✅ Formatted with gofmt"
        fi
      fi
      ;;

    *.rs)
      if command -v rustfmt &> /dev/null; then
        echo "🎨 Auto-formatting: $file"
        if rustfmt "$file" 2>/dev/null; then
          touch "$marker"
          echo "✅ Formatted with rustfmt"
        fi
      fi
      ;;
  esac
}

# Format files after Write or Edit
if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  if [[ -n "${FILE_PATH:-}" ]]; then
    format_file "$FILE_PATH"
  fi
fi

# ============================================================================
# SECRET SCANNING
# ============================================================================

scan_for_secrets() {
  local file="$1"

  # Skip non-text files
  [[ ! -f "$file" ]] && return 0
  file "$file" | grep -q text || return 0

  # Simple regex-based secret detection
  # For production, use tools like gitleaks, truffleHog, or GitGuardian
  if grep -qE '(sk_live_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----)' "$file" 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: Potential secret detected in $file"
    echo ""
    echo "Patterns found:"
    grep -nE '(sk_live_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----)' "$file" || true
    echo ""
    echo "If this is a real secret:"
    echo "  1. Remove it from the file"
    echo "  2. Add to .env (and ensure .env is in .gitignore)"
    echo "  3. Rotate the secret if already committed"
    echo "  4. Use git filter-branch or BFG to remove from history"
    echo ""
  fi

  # Check for common .env patterns in non-.env files
  if [[ "$file" != *".env"* ]] && grep -qE '^[A-Z_]+=[^$]' "$file" 2>/dev/null; then
    echo ""
    echo "ℹ️  INFO: Found environment variable assignments in $file"
    echo ""
    echo "Consider moving to .env file if these are configuration values."
    echo ""
  fi
}

# Scan files after Write or Edit
if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  if [[ -n "${FILE_PATH:-}" ]]; then
    scan_for_secrets "$FILE_PATH"
  fi
fi

# ============================================================================
# GIT AUTO-STAGING (Optional)
# ============================================================================

# Uncomment to auto-stage formatted files
# This can be useful for "format on save" workflow
# BUT can also auto-stage files you didn't mean to commit

# auto_stage() {
#   local file="$1"
#
#   # Only auto-stage if inside a git repo
#   if git rev-parse --is-inside-work-tree &> /dev/null; then
#     # Only stage if file was modified by formatting
#     if git diff --name-only "$file" | grep -q "$file"; then
#       echo "📝 Auto-staging: $file"
#       git add "$file"
#     fi
#   fi
# }
#
# if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
#   if [[ -n "${FILE_PATH:-}" ]]; then
#     auto_stage "$FILE_PATH"
#   fi
# fi

# ============================================================================
# LINTING (Post-format validation)
# ============================================================================

lint_file() {
  local file="$1"

  [[ ! -f "$file" ]] && return 0

  case "$file" in
    *.ts|*.tsx|*.js|*.jsx)
      if command -v eslint &> /dev/null && [[ -f .eslintrc* ]] || [[ -f eslint.config.* ]]; then
        echo "🔍 Linting: $file"
        if ! eslint "$file" 2>/dev/null; then
          echo ""
          echo "⚠️  Linting errors found (not blocking)"
          echo "Run 'npm run lint -- --fix' to auto-fix"
          echo ""
        fi
      fi
      ;;

    *.py)
      if command -v ruff &> /dev/null; then
        echo "🔍 Linting: $file"
        if ! ruff check "$file" 2>/dev/null; then
          echo ""
          echo "⚠️  Linting errors found (not blocking)"
          echo "Run 'ruff check --fix $file' to auto-fix"
          echo ""
        fi
      fi
      ;;
  esac
}

# Lint after formatting
if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  if [[ -n "${FILE_PATH:-}" ]]; then
    lint_file "$FILE_PATH"
  fi
fi

# ============================================================================
# TYPE CHECKING (for TypeScript files)
# ============================================================================

type_check_file() {
  local file="$1"

  [[ ! -f "$file" ]] && return 0

  case "$file" in
    *.ts|*.tsx)
      # Only run if tsconfig.json exists
      if [[ -f tsconfig.json ]] && command -v tsc &> /dev/null; then
        echo "🔍 Type-checking: $file"
        # Use --noEmit to check types (TypeScript checks the whole project, not single files)
        if ! tsc --noEmit 2>/dev/null; then
          echo ""
          echo "⚠️  Type errors found (not blocking)"
          echo "Run 'npm run type-check' for full report"
          echo ""
        fi
      fi
      ;;
  esac
}

# Type-check after edit (optional, can be slow)
# Uncomment if you want immediate type feedback
# if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
#   if [[ -n "${FILE_PATH:-}" ]]; then
#     type_check_file "$FILE_PATH"
#   fi
# fi

# ============================================================================
# LOGGING / METRICS
# ============================================================================

log_tool_usage() {
  local log_file="$HOME/.claude/hooks/tool-usage.log"
  mkdir -p "$(dirname "$log_file")"

  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local project=$(basename "$(pwd)")

  echo "$timestamp | $project | $TOOL_NAME | ${FILE_PATH:-$COMMAND}" >> "$log_file"
}

# Log all tool usage (useful for analytics)
log_tool_usage

# ============================================================================
# PROJECT-SPECIFIC HOOKS
# ============================================================================

# Load project-local post-hook if exists
if [[ -f .claude/hooks/post-tool-use-local.sh ]]; then
  source .claude/hooks/post-tool-use-local.sh
fi

# ============================================================================
# CLEANUP
# ============================================================================

# Clean up format markers older than 1 hour
find /tmp -name "claude-code-formatted-*" -mmin +60 -delete 2>/dev/null || true

exit 0
