#!/usr/bin/env bash
# Install the local RAG engine from ai-dev-toolkit/kit/rag.
# Idempotent: running twice is safe; a previous install won't be overwritten
# unless --force is passed.
#
# Usage:
#   bash scripts/install-rag.sh            # install + first full index
#   bash scripts/install-rag.sh --force    # overwrite scripts/skills
#   bash scripts/install-rag.sh --skip-build   # install only, no index build
set -euo pipefail

# Source optional .env to inherit RAG_* / HF_* variables consistently
RAG_ENV_FILE="${RAG_ENV_FILE:-$HOME/.claude/rag-index/.env}"
if [ -f "$RAG_ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$RAG_ENV_FILE"
  set +a
fi

# Copy .env.example from the toolkit as a starting point if user hasn't made one
if [ -f "$TOOLKIT_REF/kit/rag/.env.example" ] && [ ! -f "$RAG_ENV_FILE" ]; then
  mkdir -p "$(dirname "$RAG_ENV_FILE")"
  cp "$TOOLKIT_REF/kit/rag/.env.example" "$RAG_ENV_FILE"
  echo "seeded $RAG_ENV_FILE (edit before rerunning if you want work-mode / custom repos)"
fi

FORCE=0
SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
RAG_DIR="${RAG_DIR:-$CLAUDE_DIR/rag-index}"
SKILLS_DIR="${SKILLS_DIR:-$CLAUDE_DIR/skills}"
TOOLKIT_REF="${TOOLKIT_REF:-$HOME/Desenvolvimento/ai-dev-toolkit}"

if [ ! -d "$TOOLKIT_REF/kit/rag" ]; then
  echo "ai-dev-toolkit kit/rag not found at $TOOLKIT_REF/kit/rag"
  echo "clone https://github.com/Forge-Space/ai-dev-toolkit first, or set TOOLKIT_REF"
  exit 2
fi

echo "==> Ensuring Python venv at $RAG_DIR/venv"
mkdir -p "$RAG_DIR"
if [ ! -d "$RAG_DIR/venv" ]; then
  python3 -m venv "$RAG_DIR/venv"
fi
"$RAG_DIR/venv/bin/pip" install --quiet --upgrade pip
"$RAG_DIR/venv/bin/pip" install --quiet sentence-transformers rank-bm25

echo "==> Copying scripts"
for f in "$TOOLKIT_REF"/kit/rag/scripts/*; do
  name=$(basename "$f")
  dest="$RAG_DIR/$name"
  if [ -f "$dest" ] && [ "$FORCE" = 0 ]; then
    echo "   skip (exists): $name"
    continue
  fi
  cp "$f" "$dest"
  case "$name" in *.sh|*.py) chmod +x "$dest" ;; esac
done

echo "==> Copying skills"
mkdir -p "$SKILLS_DIR"
for skill_dir in "$TOOLKIT_REF"/kit/rag/skills/*/; do
  skill_name=$(basename "$skill_dir")
  dest="$SKILLS_DIR/$skill_name"
  if [ -d "$dest" ] && [ "$FORCE" = 0 ]; then
    echo "   skip (exists): $skill_name"
    continue
  fi
  mkdir -p "$dest"
  cp -r "$skill_dir"/* "$dest"/
done

# Also install kit/specs if present (tiny, pure stdlib)
if [ -d "$TOOLKIT_REF/kit/specs" ]; then
  echo "==> Installing kit/specs helper"
  [ -f "$TOOLKIT_REF/kit/specs/scripts/specs.py" ] && cp "$TOOLKIT_REF/kit/specs/scripts/specs.py" "$RAG_DIR/"
  for skill_dir in "$TOOLKIT_REF"/kit/specs/skills/*/; do
    skill_name=$(basename "$skill_dir")
    dest="$SKILLS_DIR/$skill_name"
    [ -d "$dest" ] && [ "$FORCE" = 0 ] && continue
    mkdir -p "$dest"
    cp -r "$skill_dir"/* "$dest"/
  done
fi

if [ "$SKIP_BUILD" = 0 ]; then
  echo "==> First index build (may take ~1 min for typical corpus)"
  "$RAG_DIR/venv/bin/python" "$RAG_DIR/build.py" 2>&1 | tail -1
fi

echo
echo "Done. Next steps:"
echo "  1. Edit $RAG_DIR/build.py → customize CURATED_REPOS + SOURCES for your machine."
echo "  2. Wire MCP server in ~/.claude/settings.json mcpServers.rag-index → command=$RAG_DIR/venv/bin/python args=[$RAG_DIR/mcp_server.py]."
echo "  3. Wire hooks in settings.json hooks.PostToolUse / .UserPromptSubmit → $RAG_DIR/{reindex-hook,autorecall-hook}.sh."
echo "  4. Try: $RAG_DIR/venv/bin/python $RAG_DIR/query.py 'your first question'"
