#!/usr/bin/env sh
# forge-kit adapter: Windsurf editor
# Writes .windsurfrules to the current working directory (project-local)

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
  project_dir="${CWD:-$(pwd)}"
  rules_dst="$project_dir/.windsurfrules"

  # 1. FORGE_RULES=true: write .windsurfrules from core/rules.md
  if [ "${FORGE_RULES:-false}" = "true" ]; then
    log_step "Installing rules to $rules_dst"

    new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

    if [ -f "$rules_dst" ]; then
      old_sha="$(file_sha256 "$rules_dst")"
      new_sha="$(printf '%s' "$new_content" | sha256sum | cut -d' ' -f1)"
      if [ "$old_sha" = "$new_sha" ]; then
        log_dim "  (no changes)"
      else
        if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
          log_info "  [DRY RUN] Would overwrite $rules_dst"
        else
          printf '%s' "$new_content" > "$rules_dst"
          log_success ".windsurfrules written"
        fi
      fi
    else
      if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
        log_info "  [DRY RUN] Would create $rules_dst"
      else
        printf '%s' "$new_content" > "$rules_dst"
        log_success ".windsurfrules created"
      fi
    fi
  fi

  # 2. FORGE_MCP=true: merge MCP into .windsurf/mcp.json
  if [ "${FORGE_MCP:-false}" = "true" ]; then
    windsurf_dir="$project_dir/.windsurf"
    ensure_dir "$windsurf_dir"
    mcp_dst="$windsurf_dir/mcp.json"
    mcp_src="$FORGE_KIT_DIR/core/mcp.json"

    log_step "Merging MCP servers to $mcp_dst"

    if [ -f "$mcp_src" ]; then
      if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
        log_info "  [DRY RUN] Would merge MCP servers"
      else
        python3 - "$mcp_src" "$mcp_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
mcp_servers_dst = dst_data.get("mcpServers", {})

for key, val in mcp_servers_src.items():
    if key not in mcp_servers_dst:
        mcp_servers_dst[key] = val

dst_data["mcpServers"] = mcp_servers_dst
dst_path.write_text(json.dumps(dst_data, indent=2) + "\n")
PYEOF
        log_success "MCP servers merged"
      fi
    fi
  fi
}

adapter_verify() {
  command -v windsurf >/dev/null 2>&1 || \
  [ -d "/Applications/Windsurf.app" ] || \
  [ -d "$HOME/Applications/Windsurf.app" ]
}

adapter_status() {
  project_dir="${CWD:-$(pwd)}"
  rules_file="$project_dir/.windsurfrules"
  status=""
  [ -f "$rules_file" ] && status=".windsurfrules ✓" || status=".windsurfrules ✗"
  printf 'windsurf | %s | project → %s/\n' "$status" "$project_dir"
}

adapter_uninstall() {
  project_dir="${CWD:-$(pwd)}"
  rules_file="$project_dir/.windsurfrules"

  if [ -f "$rules_file" ]; then
    if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
      log_info "[DRY RUN] Would remove $rules_file"
    else
      rm "$rules_file"
      log_success "Removed .windsurfrules"
    fi
  fi
}
