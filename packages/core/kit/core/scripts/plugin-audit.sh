#!/bin/bash
# plugin-audit: diff claude-plugins-official against installed; filter known unwanted.

set -euo pipefail

MARKETPLACE_DIR="${HOME}/.claude/plugins/marketplaces/claude-plugins-official"
INSTALLED_JSON="${HOME}/.claude/plugins/installed_plugins.json"

if [[ ! -d "$MARKETPLACE_DIR" ]]; then
    echo "ERROR: claude-plugins-official not found at $MARKETPLACE_DIR" >&2
    echo "Run: claude plugin marketplace add anthropics/claude-plugins-official" >&2
    exit 1
fi

if [[ ! -f "$INSTALLED_JSON" ]]; then
    echo "ERROR: $INSTALLED_JSON missing — is Claude Code set up?" >&2
    exit 1
fi

SKIP_LANG_LSPS=(clangd-lsp csharp-lsp gopls-lsp jdtls-lsp kotlin-lsp lua-lsp php-lsp ruby-lsp rust-analyzer-lsp swift-lsp typescript-lsp)
SKIP_SAAS=(asana imessage telegram greptile firebase gitlab discord laravel-boost terraform)
SKIP_SAMPLES=(example-plugin fakechat math-olympiad playground)

SKIP_LIST=("${SKIP_LANG_LSPS[@]}" "${SKIP_SAAS[@]}" "${SKIP_SAMPLES[@]}")

in_skip_list() {
    local name="$1"
    for s in "${SKIP_LIST[@]}"; do
        [[ "$name" == "$s" ]] && return 0
    done
    return 1
}

installed_names=$(python3 -c "
import json
with open('$INSTALLED_JSON') as f:
    d = json.load(f)
for key in d.get('plugins', {}):
    print(key.split('@')[0])
" | sort -u)

available_names=$( (ls "$MARKETPLACE_DIR/plugins" 2>/dev/null; ls "$MARKETPLACE_DIR/external_plugins" 2>/dev/null) | sort -u)

installed_count=$(printf '%s\n' "$installed_names" | grep -c . || echo 0)

candidates=()
filtered=()
while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if grep -qx "$name" <<<"$installed_names"; then
        continue
    fi
    if in_skip_list "$name"; then
        filtered+=("$name")
    else
        candidates+=("$name")
    fi
done <<<"$available_names"

available_count=$(printf '%s\n' "$available_names" | grep -c . || echo 0)
filter_count=${#filtered[@]}
delta=${#candidates[@]}

printf "Installed: %s  |  Available (marketplace): %s  |  Filtered-out: %s  |  Delta: %s\n\n" \
    "$installed_count" "$available_count" "$filter_count" "$delta"

if [[ $delta -eq 0 ]]; then
    echo "No candidates — inventory is in sync with marketplace (after filters)."
    exit 0
fi

echo "Candidates to install:"
for c in "${candidates[@]}"; do
    desc=""
    for root in "$MARKETPLACE_DIR/plugins" "$MARKETPLACE_DIR/external_plugins"; do
        meta="$root/$c/.claude-plugin/plugin.json"
        if [[ -f "$meta" ]]; then
            desc=$(python3 -c "import json; print(json.load(open('$meta')).get('description',''))" 2>/dev/null || echo "")
            break
        fi
    done
    printf "  - %-25s — %s\n" "$c" "${desc:-<no description>}"
done

echo
echo "Install plan:"
for c in "${candidates[@]}"; do
    echo "  claude plugin install ${c}@claude-plugins-official"
done
