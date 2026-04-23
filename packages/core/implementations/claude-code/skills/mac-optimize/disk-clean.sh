#!/usr/bin/env bash
# mac-optimize disk-clean — Tier A regenerable-cache purge, safe + idempotent.
# Usage: disk-clean.sh [--full]   # --full also offers Tier B prompts
set -u

BLD=$'\033[1m'; GRN=$'\033[32m'; YEL=$'\033[33m'; RST=$'\033[0m'

full=0
[[ "${1:-}" == "--full" ]] && full=1

say()  { printf "%s==> %s%s\n" "$BLD" "$1" "$RST"; }
ok()   { printf "%s✓ %s%s\n" "$GRN" "$1" "$RST"; }
warn() { printf "%s⚠ %s%s\n" "$YEL" "$1" "$RST"; }

before=$(df -g / | awk 'NR==2 {print $4}')
say "Before: ${before}GB free on /"

# npm cache (20G wins on dev box)
if command -v npm >/dev/null 2>&1; then
  npm cache clean --force >/dev/null 2>&1 && ok "npm cache cleared"
fi

# uv cache — rm is faster than `uv cache clean`
[[ -d ~/.cache/uv ]] && rm -rf ~/.cache/uv && ok "~/.cache/uv cleared"

# Other throwaway caches
for d in ~/.cache/opencode ~/.cache/huggingface ~/.cache/pre-commit ~/.cache/chroma; do
  [[ -d "$d" ]] && rm -rf "$d" && ok "${d/#$HOME/~} cleared"
done

# bun install cache
[[ -d ~/.bun/install/cache ]] && rm -rf ~/.bun/install/cache && ok "~/.bun/install/cache cleared"

# CoreSimulator caches (keep device images)
[[ -d ~/Library/Developer/CoreSimulator/Caches ]] && \
  rm -rf ~/Library/Developer/CoreSimulator/Caches && ok "CoreSimulator/Caches cleared"

# Brave browser cache
brave_cache_root="$HOME/Library/Caches/BraveSoftware/Brave-Browser/Default"
[[ -d "$brave_cache_root/Cache" ]] && rm -rf "$brave_cache_root/Cache" "$brave_cache_root/Code Cache" 2>/dev/null && ok "Brave cache cleared"

# Electron runtime archives (downloaded on demand)
find "$HOME/Library/Caches/electron" -name 'electron-v*.zip' -delete 2>/dev/null && ok "electron-v*.zip cleared"

# CloudKit cache
[[ -d ~/Library/Caches/CloudKit ]] && rm -rf ~/Library/Caches/CloudKit && ok "CloudKit cache cleared"

after=$(df -g / | awk 'NR==2 {print $4}')
reclaimed=$(( after - before ))
printf "\n%sAfter: %dGB free (%s%+dGB%s reclaimed)%s\n" "$BLD" "$after" "$GRN" "$reclaimed" "$RST" "$RST"

if (( full )); then
  printf "\n%s-- Tier B (review before confirming) --%s\n" "$BLD" "$RST"
  [[ -d "/Volumes/External HD" ]] || { warn "External HD not mounted — skipping Tier B"; exit 0; }

  # Surface candidates; do not move automatically.
  printf "\nLarge Downloads (move candidates):\n"
  find ~/Downloads -maxdepth 1 -size +500M -exec du -sh {} \; 2>/dev/null | sort -hr | head -10

  printf "\nRun manually if appropriate:\n"
  printf "  mv ~/Downloads/{*.iso,*.mkv,Archives,Games} \"/Volumes/External HD/Downloads-archive/\"\n"
  printf "  rm -f ~/Downloads/*.dmg ~/Downloads/*.zip ~/Downloads/*.tbz2\n"
fi
