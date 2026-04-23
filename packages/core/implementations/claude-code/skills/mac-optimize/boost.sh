#!/usr/bin/env bash
# mac-optimize boost — reversible actions to give Claude Code more CPU/RAM.
# Run: ~/.claude/skills/mac-optimize/boost.sh [--purge]
# --purge: also run `sudo purge` (will prompt for password)
set -u

BLD=$'\033[1m'; GRN=$'\033[32m'; YEL=$'\033[33m'; RST=$'\033[0m'
printf "%s=== CC boost ===%s\n" "$BLD" "$RST"

# 1. Kill zombie claude sessions (>24h old)
printf "\n%s1. Zombie claude processes%s\n" "$BLD" "$RST"
zombies=$(ps -axo pid,etime,comm | awk '$3=="claude" && $2 ~ /-/ {print $1}')
if [[ -n "$zombies" ]]; then
  for pid in $zombies; do
    rss_kb=$(ps -p "$pid" -o rss= 2>/dev/null | tr -d ' ')
    kill "$pid" 2>/dev/null && printf "   %skilled%s PID %s (%sMB)\n" "$GRN" "$RST" "$pid" "$((rss_kb/1024))"
  done
else
  printf "   none\n"
fi

# 2. Deprioritize known CPU-hungry apps
printf "\n%s2. Deprioritize competitors (renice +15)%s\n" "$BLD" "$RST"
for name in Bitwarden Spotify Discord WhatsApp "Spotify Helper" "Electron Framework"; do
  pids=$(pgrep -i "$name" 2>/dev/null)
  for pid in $pids; do
    renice +15 "$pid" >/dev/null 2>&1 && printf "   renice+15 %-20s PID %s\n" "$name" "$pid"
  done
done

# 2b. Kill orphaned MCP servers (parent-less, > 6h old)
printf "\n%s2b. Orphaned MCP servers (>6h)%s\n" "$BLD" "$RST"
orphan_count=0
while IFS= read -r pid; do
  [[ -z "$pid" ]] && continue
  cmd=$(ps -p "$pid" -o command= 2>/dev/null | grep -oE 'mcp-server-[a-z-]+|chrome-devtools-mcp|firecrawl-mcp' | head -1)
  kill "$pid" 2>/dev/null && printf "   killed %-6s %s\n" "$pid" "${cmd:-mcp}" && orphan_count=$((orphan_count+1))
done < <(ps -axo pid=,etime=,command= | awk '/mcp-server-|chrome-devtools-mcp|firecrawl-mcp/ && $2 ~ /-/ {print $1}')
(( orphan_count == 0 )) && printf "   none\n"

# 2c. Detect broken launchd agents (exit 127 = command not found)
broken=$(launchctl list 2>/dev/null | awk '$2 == "127" {print $3}')
if [[ -n "$broken" ]]; then
  printf "\n%s2c. Broken launchd agents (manual action)%s\n" "$YEL" "$RST"
  echo "$broken" | while read label; do
    printf "   launchctl unload -w ~/Library/LaunchAgents/%s.plist\n" "$label"
  done
fi

# 2d. Kill orphaned VM XPC services (UTM closed but VM didn't release)
vm_orphans=$(ps -axo pid,ppid,command | awk '/Virtualization.VirtualMachine.xpc/ && $2==1 {print $1}')
if [[ -n "$vm_orphans" ]]; then
  printf "\n%s2d. Orphaned VM processes (parent=launchd, host app gone)%s\n" "$BLD" "$RST"
  for pid in $vm_orphans; do
    kill "$pid" 2>/dev/null && printf "   killed VM PID %s\n" "$pid"
  done
fi

# 3. Ensure NODE_OPTIONS is set in shell
printf "\n%s3. Node heap (NODE_OPTIONS)%s\n" "$BLD" "$RST"
if ! grep -q "NODE_OPTIONS.*max-old-space-size" ~/.zshrc 2>/dev/null; then
  {
    echo ''
    echo '# Claude Code / Node.js heap boost'
    echo 'export NODE_OPTIONS="--max-old-space-size=8192"'
  } >> ~/.zshrc
  printf "   added --max-old-space-size=8192 to ~/.zshrc (new shells only)\n"
else
  printf "   already set in ~/.zshrc\n"
fi
printf "   current session NODE_OPTIONS: %s\n" "${NODE_OPTIONS:-<unset>}"

# 4. Optional: sudo purge
if [[ "${1:-}" == "--purge" ]]; then
  printf "\n%s4. sudo purge (may prompt for password)%s\n" "$BLD" "$RST"
  sudo purge && printf "   %sdone%s\n" "$GRN" "$RST"
fi

# 5. Final snapshot
printf "\n%s=== post-boost snapshot ===%s\n" "$BLD" "$RST"
"$(dirname "$0")/diagnose.sh" 2>&1 | head -5

printf "\n%sManual actions still recommended:%s\n" "$YEL" "$RST"
printf "  • Quit Bitwarden if not actively unlocking\n"
printf "  • Suspend VirtualMachine (UTM/Parallels) if idle — frees ~3GB RAM\n"
printf "  • Quit Discord/Spotify/WhatsApp during heavy CC work\n"
printf "  • Close unused Brave tabs (each ≈250MB)\n"
printf "  • Restart shell to pick up NODE_OPTIONS: exec zsh\n"
