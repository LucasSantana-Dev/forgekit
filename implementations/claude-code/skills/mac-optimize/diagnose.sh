#!/usr/bin/env bash
# mac-optimize diagnose — one-shot resource triage
set -u

RED=$'\033[31m'; YEL=$'\033[33m'; GRN=$'\033[32m'; BLD=$'\033[1m'; RST=$'\033[0m'

warn=0
info() { printf "%s\n" "$1"; }
alert() { printf "%s⚠ %s%s\n" "$YEL" "$1" "$RST"; warn=$((warn+1)); }
crit()  { printf "%s✖ %s%s\n" "$RED" "$1" "$RST"; warn=$((warn+2)); }
ok()    { printf "%s✓ %s%s\n" "$GRN" "$1" "$RST"; }

printf "%s=== mac-optimize diagnose ===%s\n" "$BLD" "$RST"

# Load avg
la=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}')
la_int=${la%.*}
if (( la_int >= 6 )); then crit "Load avg ${la} (>=6: heavily loaded)"
elif (( la_int >= 4 )); then alert "Load avg ${la} (>=4: busy)"
else ok "Load avg ${la}"
fi

# Swap
swap=$(sysctl -n vm.swapusage)
used_mb=$(echo "$swap" | awk -F'used = ' '{print $2}' | awk '{print $1}' | tr -d 'M')
total_mb=$(echo "$swap" | awk -F'total = ' '{print $2}' | awk '{print $1}' | tr -d 'M')
if [[ -n "$total_mb" && "$total_mb" != "0.00" ]]; then
  pct=$(awk -v u="$used_mb" -v t="$total_mb" 'BEGIN{printf "%.0f", (u/t)*100}')
  if (( pct >= 85 )); then crit "Swap ${pct}% (${used_mb}M / ${total_mb}M) — run: sudo purge"
  elif (( pct >= 70 )); then alert "Swap ${pct}% (${used_mb}M / ${total_mb}M)"
  else ok "Swap ${pct}% (${used_mb}M / ${total_mb}M)"
  fi
fi

# Free mem
free_pages=$(vm_stat | awk '/Pages free/ {gsub(/\./,""); print $3}')
free_mb=$(( free_pages * 16 / 1024 ))
if (( free_mb < 500 )); then crit "Free mem ${free_mb}MB (<500)"
elif (( free_mb < 1500 )); then alert "Free mem ${free_mb}MB"
else ok "Free mem ${free_mb}MB"
fi

# Zombie claude
zombies=$(ps -axo pid,etime,rss,comm | awk '$4=="claude" && $2 ~ /-/ {print $1" "$2" "$3"KB"}')
if [[ -n "$zombies" ]]; then
  alert "Claude processes >24h old:"
  echo "$zombies" | sed 's/^/    /'
  echo "    kill with: kill <PID>  (not -9)"
else
  ok "No zombie claude sessions"
fi

# Top CPU
printf "\n%sTop 5 CPU:%s\n" "$BLD" "$RST"
ps aux | sort -k3 -rn | awk 'NR<=5 {printf "  %-5s %-6s %s\n", $3"%", $2, $11}' | head -5

# Top RSS
printf "\n%sTop 5 memory:%s\n" "$BLD" "$RST"
ps -axo pid,rss,comm | sort -k2 -rn | awk 'NR<=5 {printf "  %-8.1fMB %-6s %s\n", $2/1024, $1, $3}' | head -5

# NODE_OPTIONS
printf "\n%sNode:%s %s  NODE_OPTIONS=%s\n" "$BLD" "$RST" "$(node -v 2>/dev/null || echo none)" "${NODE_OPTIONS:-<unset>}"
if [[ -z "${NODE_OPTIONS:-}" ]]; then
  alert "NODE_OPTIONS unset — consider --max-old-space-size=6144"
fi

# Spotlight workers
mdw=$(ps aux | grep -cE 'mdworker|mds_stores' | head -1)
if (( mdw > 6 )); then alert "$mdw mdworker/mds processes (heavy indexing)"; fi

# Disk pressure on boot volume
disk_avail=$(df -g / 2>/dev/null | awk 'NR==2 {print $4}')
if [[ -n "$disk_avail" ]]; then
  if (( disk_avail < 5 )); then crit "Boot disk ${disk_avail}GB free (<5GB) — see SKILL.md Disk-pressure"
  elif (( disk_avail < 20 )); then alert "Boot disk ${disk_avail}GB free (<20GB)"
  else ok "Boot disk ${disk_avail}GB free"
  fi
fi

printf "\n"
if (( warn == 0 )); then
  printf "%s%sAll clear — safe for parallel agents / worktrees%s\n" "$GRN" "$BLD" "$RST"
  exit 0
elif (( warn <= 2 )); then
  printf "%s%sMinor pressure — consider fixes; OK for single-track work%s\n" "$YEL" "$BLD" "$RST"
  exit 0
else
  printf "%s%sHeavy pressure — run fixes before heavy CC work%s\n" "$RED" "$BLD" "$RST"
  printf "See: ~/.claude/skills/mac-optimize/SKILL.md\n"
  exit 1
fi
