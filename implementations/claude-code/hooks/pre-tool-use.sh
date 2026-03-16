#!/bin/bash
#
# PreToolUse Hook for Claude Code
#
# Runs BEFORE Claude executes any tool.
# Use for: blocking dangerous operations, confirmation gates, environment setup
#
# Environment variables available:
#   TOOL_NAME - Name of tool being invoked (Bash, Edit, Write, Read, etc.)
#   COMMAND - For Bash tool, the command being executed
#   FILE_PATH - For file tools (Edit, Write, Read), the target file path
#   OLD_STRING - For Edit tool, the string being replaced
#   NEW_STRING - For Edit tool, the replacement string
#
# Exit codes:
#   0 - Allow tool execution
#   1 - Block tool execution
#

set -euo pipefail

# Enable case-insensitive pattern matching for SQL detection
shopt -s nocasematch

# ============================================================================
# DANGEROUS COMMAND BLOCKING
# ============================================================================

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Block destructive file operations
  if [[ "$COMMAND" =~ (rm[[:space:]]+-rf[[:space:]]+/|rm[[:space:]]+-fr[[:space:]]+/) ]]; then
    echo "❌ BLOCKED: Dangerous rm -rf / command detected"
    exit 1
  fi

  # Block disk destruction
  if [[ "$COMMAND" =~ (dd[[:space:]]+if=|mkfs\.) ]]; then
    echo "❌ BLOCKED: Disk write/format command detected"
    exit 1
  fi

  # Block unintentional recursive deletion of important directories
  if [[ "$COMMAND" =~ rm[[:space:]]+-r.*(/etc|/usr|/var|/boot|/sys|/proc|~/.ssh|~/.aws|~/.config) ]]; then
    echo "❌ BLOCKED: Attempting to delete system/config directory"
    exit 1
  fi
fi

# ============================================================================
# GIT SAFEGUARDS
# ============================================================================

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Warn on force push to main/master
  if [[ "$COMMAND" =~ git[[:space:]]+push[[:space:]]+.*(--force|-f).*(main|master) ]]; then
    echo "⚠️  WARNING: Force-pushing to main/master branch"
    echo ""
    echo "This can overwrite team members' work and break CI/CD pipelines."
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Are you SURE you want to continue? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi

  # Confirm branch deletion (permanent operation)
  if [[ "$COMMAND" =~ git[[:space:]]+branch[[:space:]]+-D ]]; then
    echo "⚠️  WARNING: Deleting branch permanently (git branch -D)"
    echo ""
    echo "Command: $COMMAND"
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi

  # Block direct push to main without PR
  if [[ "$COMMAND" =~ git[[:space:]]+push[[:space:]]+origin[[:space:]]+main ]] || \
     [[ "$COMMAND" =~ git[[:space:]]+push[[:space:]]+origin[[:space:]]+master ]]; then
    # Allow if pushing tags only
    if [[ ! "$COMMAND" =~ --tags ]]; then
      echo "❌ BLOCKED: Direct push to main/master not allowed"
      echo ""
      echo "Use pull request workflow:"
      echo "  1. git checkout -b feature/my-feature"
      echo "  2. git push origin feature/my-feature"
      echo "  3. Create PR via GitHub"
      echo ""
      echo "Exception: Use 'git push origin main --tags' for releases"
      exit 1
    fi
  fi

  # Warn on git reset --hard (data loss risk)
  if [[ "$COMMAND" =~ git[[:space:]]+reset[[:space:]]+--hard ]]; then
    echo "⚠️  WARNING: git reset --hard will discard uncommitted changes"
    echo ""
    echo "Command: $COMMAND"
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi
fi

# ============================================================================
# DATABASE SAFEGUARDS
# ============================================================================

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Block production database operations without confirmation
  if [[ "$COMMAND" =~ (DROP[[:space:]]+DATABASE|DROP[[:space:]]+TABLE|TRUNCATE) ]] && \
     [[ "$COMMAND" =~ (production|prod|prd) ]]; then
    echo "❌ BLOCKED: Destructive operation on production database"
    echo ""
    echo "Command: $COMMAND"
    echo ""
    echo "If you REALLY need to do this:"
    echo "  1. Verify you have a backup"
    echo "  2. Run the command manually outside Claude Code"
    echo "  3. Document the action in MEMORY.md"
    exit 1
  fi

  # Warn on migration rollback
  if [[ "$COMMAND" =~ (prisma[[:space:]]+migrate[[:space:]]+reset|flyway[[:space:]]+clean|knex[[:space:]]+migrate:rollback[[:space:]]+--all) ]]; then
    echo "⚠️  WARNING: Database migration reset/rollback detected"
    echo ""
    echo "This will delete all data and re-run migrations."
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi
fi

# ============================================================================
# DOCKER SAFEGUARDS
# ============================================================================

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Warn on docker system prune -a (removes all unused images)
  if [[ "$COMMAND" =~ docker[[:space:]]+system[[:space:]]+prune[[:space:]]+-a ]]; then
    echo "⚠️  WARNING: docker system prune -a will remove ALL unused images"
    echo ""
    echo "This may require re-downloading gigabytes of images."
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi
fi

# ============================================================================
# FILE WRITE SAFEGUARDS
# ============================================================================

if [[ "$TOOL_NAME" == "Write" ]] || [[ "$TOOL_NAME" == "Edit" ]]; then
  # Block writing to critical config files
  if [[ "$FILE_PATH" =~ (/.ssh/|/.aws/|/.config/fish/config.fish|/.bashrc|/.zshrc) ]]; then
    echo "❌ BLOCKED: Attempting to modify critical config file"
    echo ""
    echo "File: $FILE_PATH"
    echo ""
    echo "Modify these files manually to avoid accidental misconfiguration."
    exit 1
  fi

  # Warn when writing .env files
  if [[ "$FILE_PATH" == *".env"* ]] && [[ "$FILE_PATH" != *".env.example"* ]]; then
    echo "⚠️  WARNING: Writing .env file (may contain secrets)"
    echo ""
    echo "File: $FILE_PATH"
    echo ""
    echo "Ensure:"
    echo "  1. No actual secrets are hardcoded"
    echo "  2. File is in .gitignore"
    echo "  3. Use .env.example for templates"
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi
fi

# ============================================================================
# PACKAGE MANAGEMENT SAFEGUARDS
# ============================================================================

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Warn on global npm install
  if [[ "$COMMAND" =~ npm[[:space:]]+install[[:space:]]+-g ]] || \
     [[ "$COMMAND" =~ npm[[:space:]]+i[[:space:]]+-g ]]; then
    echo "⚠️  WARNING: Global npm install detected"
    echo ""
    echo "Command: $COMMAND"
    echo ""
    echo "Consider:"
    echo "  - Using npx for one-time commands"
    echo "  - Installing locally in project"
    echo "  - Using package.json scripts"
    echo ""
    if [[ ! -t 0 ]]; then
      echo "RESULT: block"
      exit 0
    fi
    read -p "Continue with global install? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
      echo "❌ Aborted by user"
      exit 1
    fi
  fi

  # Check for package-lock.json before npm install
  if [[ "$COMMAND" =~ ^npm[[:space:]]+install$ ]] && [[ -f "package-lock.json" ]]; then
    echo "ℹ️  NOTE: package-lock.json exists, using 'npm ci' is faster and more reliable"
    echo ""
    echo "Continuing with 'npm install' anyway..."
    # Don't block, just inform
  fi
fi

# ============================================================================
# ENVIRONMENT SETUP (Automatic)
# ============================================================================

# Auto-copy .env.example if .env missing
if [[ "$TOOL_NAME" == "Bash" ]] && [[ ! -f ".env" ]] && [[ -f ".env.example" ]]; then
  echo "ℹ️  Auto-creating .env from .env.example"
  cp .env.example .env
  echo "✅ Created .env (remember to fill in actual values)"
fi

# ============================================================================
# ALLOW EXECUTION
# ============================================================================

exit 0
