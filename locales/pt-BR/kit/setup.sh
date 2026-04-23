#!/usr/bin/env sh
# forge-kit interactive setup wizard
# Guides users through provider selection, workflow preferences, and profile generation
# Usage: sh kit/setup.sh

set -e

FORGE_KIT_DIR="${FORGE_KIT_DIR:-$(cd "$(dirname "$0")" && pwd)}"

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/detect.sh"

prompt_choice() {
	label="$1"
	default="$2"
	shift 2
	options="$*"

	printf '\n%s%s%s\n' "$FORGE_BOLD" "$label" "$FORGE_RESET"
	i=1
	for opt in $options; do
		if [ "$opt" = "$default" ]; then
			printf '  %s[%d] %s%s (default)\n' "$FORGE_CYAN" "$i" "$FORGE_RESET" "$opt"
		else
			printf '  %s[%d] %s%s\n' "$FORGE_CYAN" "$i" "$FORGE_RESET" "$opt"
		fi
		i=$((i + 1))
	done
	printf '  Default: %s\n' "$default"
	printf '  > '
	read -r choice
	if [ -z "$choice" ]; then
		printf '%s' "$default"
		return
	fi
	j=1
	for opt in $options; do
		if [ "$j" = "$choice" ]; then
			printf '%s' "$opt"
			return
		fi
		j=$((j + 1))
	done
	printf '%s' "$default"
}

prompt_yn() {
	label="$1"
	default="$2"
	printf '\n%s%s%s [%s] > ' "$FORGE_BOLD" "$label" "$FORGE_RESET" "$default"
	read -r answer
	if [ -z "$answer" ]; then
		answer="$default"
	fi
	case "$answer" in
	[Yy]*) return 0 ;;
	*) return 1 ;;
	esac
}

log_header "forge-kit setup wizard"

detected="$(detect_tools)"
if [ -n "$detected" ]; then
	log_info "Detected tools: $detected"
else
	log_warn "No AI tools detected. Install will target tools you select."
fi

SETUP_PROVIDER=$(prompt_choice "Primary AI provider" "anthropic" "anthropic" "openai" "google" "openrouter" "ollama")
log_info "Primary provider: $SETUP_PROVIDER"

SETUP_FALLBACK="none"
if prompt_yn "Add a fallback provider?" "y"; then
	SETUP_FALLBACK=$(prompt_choice "Fallback provider" "openai" "anthropic" "openai" "google" "openrouter" "ollama")
fi
log_info "Fallback provider: $SETUP_FALLBACK"

SETUP_LOCAL="false"
if prompt_yn "Use local models alongside cloud?" "n"; then
	SETUP_LOCAL="true"
fi
log_info "Local models: $SETUP_LOCAL"

SETUP_TOKEN_STRATEGY=$(prompt_choice "Token optimization strategy" "standard" "standard" "aggressive" "minimal")
log_info "Token strategy: $SETUP_TOKEN_STRATEGY"

SETUP_PROFILE=$(prompt_choice "Install profile" "standard" "standard" "minimal" "research" "durable")
log_info "Profile: $SETUP_PROFILE"

SETUP_OHMY="false"
if prompt_yn "Enable oh-my compatibility mode?" "n"; then
	SETUP_OHMY="true"
fi

SETUP_ORCHESTRATION="false"
if prompt_yn "Enable multi-agent orchestration workflow?" "n"; then
	SETUP_ORCHESTRATION="true"
fi

SETUP_WORKTREES="false"
if prompt_yn "Enable git worktree workflow for parallel tasks?" "n"; then
	SETUP_WORKTREES="true"
fi

SETUP_BACKLOG="false"
if prompt_yn "Create a task backlog file?" "n"; then
	SETUP_BACKLOG="true"
fi

printf '\n'
log_header "Setup Summary"
log_table_row "Provider" "$SETUP_PROVIDER" ""
log_table_row "Fallback" "$SETUP_FALLBACK" ""
log_table_row "Local models" "$SETUP_LOCAL" ""
log_table_row "Token strategy" "$SETUP_TOKEN_STRATEGY" ""
log_table_row "Profile" "$SETUP_PROFILE" ""
log_table_row "oh-my compat" "$SETUP_OHMY" ""
log_table_row "Orchestration" "$SETUP_ORCHESTRATION" ""
log_table_row "Worktrees" "$SETUP_WORKTREES" ""
log_table_row "Backlog" "$SETUP_BACKLOG" ""

printf '\n'
if ! prompt_yn "Proceed with installation?" "y"; then
	log_info "Aborted."
	exit 0
fi

TOOLS_ARG="auto"
if [ -n "$detected" ]; then
	TOOLS_ARG="$detected"
fi

OHMY_FLAG=""
if [ "$SETUP_OHMY" = "true" ]; then
	OHMY_FLAG="--oh-my-compat"
fi

export FORGE_KIT_DIR
# shellcheck disable=SC2086
sh "$FORGE_KIT_DIR/install.sh" --tools "$(printf '%s' "$TOOLS_ARG" | tr ' ' ',')" --profile "$SETUP_PROFILE" $OHMY_FLAG

config_out="$FORGE_KIT_DIR/../.forge-setup.json"
log_step "Generating configuration from core configs..."

python3 - "$config_out" "$SETUP_PROVIDER" "$SETUP_FALLBACK" "$SETUP_LOCAL" "$SETUP_TOKEN_STRATEGY" "$SETUP_PROFILE" "$SETUP_OHMY" "$SETUP_ORCHESTRATION" "$SETUP_WORKTREES" "$SETUP_BACKLOG" "$FORGE_KIT_DIR" <<'PYEOF'
import json, sys
from pathlib import Path

kit_dir = Path(sys.argv[11])
provider = sys.argv[2]
fallback = sys.argv[3]
local_models = sys.argv[4] == "true"
token_strategy = sys.argv[5]
profile = sys.argv[6]
ohmy = sys.argv[7] == "true"
orchestration = sys.argv[8] == "true"
worktrees = sys.argv[9] == "true"
backlog = sys.argv[10] == "true"

routing = json.loads((kit_dir / "core" / "routing.json").read_text())
agents = json.loads((kit_dir / "core" / "agents.json").read_text())
providers = json.loads((kit_dir / "core" / "providers.json").read_text())
token_cfg = json.loads((kit_dir / "core" / "token-optimization.json").read_text())
autopilot_cfg = json.loads((kit_dir / "core" / "autopilot.json").read_text())

provider_models = routing["providers"].get(provider, routing["providers"]["anthropic"])
fallback_models = routing["providers"].get(fallback, {}) if fallback != "none" else {}
local_provider = routing["providers"].get("ollama", {})

def build_model_map(primary, fb, local, use_local):
    result = {}
    for tier in ["haiku", "sonnet", "opus"]:
        chain = [primary.get(tier)]
        if fb:
            chain.append(fb.get(tier))
        if use_local:
            chain.append(local.get(tier))
        result[tier] = {"model": chain[0], "fallbacks": chain[1:]}
    return result

model_map = build_model_map(provider_models, fallback_models, local_provider, local_models)

token_preset = token_cfg["presets"].get(token_strategy, token_cfg["presets"]["standard"])

autonomy = "assisted"
if profile == "durable":
    autonomy = "autonomous"
elif profile == "minimal":
    autonomy = "supervised"
autopilot = autopilot_cfg["levels"].get(autonomy, autopilot_cfg["levels"]["assisted"])

output = {
    "setup": {
        "provider": provider,
        "fallback": fallback,
        "localModels": local_models,
        "tokenStrategy": token_strategy,
        "profile": profile,
        "ohmyCompat": ohmy,
        "orchestration": orchestration,
        "worktrees": worktrees,
        "backlog": backlog
    },
    "models": model_map,
    "routing": {
        "classifier": routing["classifier"],
        "heuristics": routing["heuristics"],
        "categories": {k: v["tier"] if isinstance(v, dict) and "tier" in v else v for k, v in routing["categories"].items()}
    },
    "agents": {k: {"tier": v["tier"], "model": model_map[v["tier"]]["model"], "skills": v.get("skills", [])} for k, v in agents["agents"].items()},
    "orchestration": agents.get("orchestration", {}) if orchestration else {"enabled": False},
    "tokenOptimization": token_preset,
    "autopilot": autopilot,
    "guardrails": autopilot_cfg["guardrails"],
    "durableExecution": autopilot_cfg["durableExecution"]
}

out_path = Path(sys.argv[1])
out_path.write_text(json.dumps(output, indent=2) + "\n")
PYEOF

log_success "Configuration saved to $config_out"

if [ "$SETUP_BACKLOG" = "true" ]; then
	backlog_src="$FORGE_KIT_DIR/../examples/backlog.json"
	if [ ! -f ".forge-backlog.json" ] && [ -f "$backlog_src" ]; then
		cp "$backlog_src" ".forge-backlog.json"
		log_success "Backlog created: .forge-backlog.json"
	fi
fi

printf '\n'
log_success "Setup complete"
log_info "Generated: .forge-setup.json (models, routing, orchestration, autopilot, token optimization)"
log_info "Run 'sh kit/install.sh --status' to verify installed artifacts."
