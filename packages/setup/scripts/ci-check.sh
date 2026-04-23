#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PYTHONPYCACHEPREFIX="${PYTHONPYCACHEPREFIX:-${TMPDIR:-/tmp}/forge-kit-pycache}"

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		printf 'Missing required command: %s\n' "$1" >&2
		exit 1
	fi
}

echo "== Tool versions =="
for cmd in bash python3 node npm git jq rg tmux zsh shellcheck; do
	require_cmd "$cmd"
	case "$cmd" in
	bash) bash --version | head -n 1 ;;
	python3) python3 --version ;;
	node) node --version ;;
	npm) npm --version ;;
	git) git --version ;;
	jq) jq --version ;;
	rg) rg --version | head -n 1 ;;
	tmux) tmux -V ;;
	zsh) zsh --version ;;
	shellcheck) shellcheck --version | head -n 2 ;;
	esac
done

if command -v gh >/dev/null 2>&1; then
	gh --version | head -n 1
fi

if command -v fd >/dev/null 2>&1; then
	fd --version
elif command -v fdfind >/dev/null 2>&1; then
	fdfind --version
else
	printf 'Missing required command: fd (or fdfind)\n' >&2
	exit 1
fi

echo
echo "== Shell syntax and lint =="
SHELL_FILES=(
	bootstrap.sh
	scripts/*.sh
	config/shell/shell.sh
	config/tmux/*.sh
	config/iterm2/*.sh
)

bash -n "${SHELL_FILES[@]}"
shellcheck "${SHELL_FILES[@]}"
zsh -n config/shell/shell.sh

echo
echo "== Python validation =="
python3 -m py_compile \
	scripts/*.py \
	config/tmux/*.py \
	config/iterm2/*.py

echo
echo "== Functionality smoke tests =="
tmpdir="$(mktemp -d)"
trap 'tmux kill-session -t ci_verify 2>/dev/null || true; tmux kill-session -t ci_verify_plain 2>/dev/null || true; rm -rf "$tmpdir" 2>/dev/null || true' EXIT
export HOME="$tmpdir/home"
mkdir -p "$HOME"

bash scripts/setup-tmux.sh "$ROOT"
bash scripts/setup-shell.sh "$ROOT" both
bash scripts/setup-ai-tools.sh "$ROOT"
bash scripts/setup-local-env.sh "$ROOT"

repo_toolkit_version="$(tr -d '\n' <TOOLKIT_VERSION)"
test -f "$HOME/.config/ai-dev-toolkit/shell.sh"
test -f "$HOME/.config/ai-dev-toolkit/local.env"
test -f "$HOME/.config/ai-dev-toolkit/.toolkit-version"
test -f "$HOME/.config/ai-dev-toolkit/scripts/sync-toolkit-version.py"
test -f "$ROOT/scripts/sync-toolkit-version.py"
grep -qx "$repo_toolkit_version" "$HOME/.config/ai-dev-toolkit/.toolkit-version"
bash -lc 'source "$HOME/.config/ai-dev-toolkit/shell.sh" && type toolkit-version-check >/dev/null && type toolkit-version-prepare >/dev/null && type toolkit-version-pr >/dev/null && type toolkit-version-sync >/dev/null'
bash ./scripts/doctor.sh >"$tmpdir/doctor.txt"
grep -q "toolkit pin sync: v${repo_toolkit_version}" "$tmpdir/doctor.txt"
printf '9.9.9\n' >"$HOME/.config/ai-dev-toolkit/.toolkit-version"
bash ./scripts/doctor.sh >"$tmpdir/doctor-mismatch.txt"
grep -q "toolkit pin drift" "$tmpdir/doctor-mismatch.txt"
grep -q "expected v${repo_toolkit_version}, found v9.9.9" "$tmpdir/doctor-mismatch.txt"
printf '%s\n' "$repo_toolkit_version" >"$HOME/.config/ai-dev-toolkit/.toolkit-version"

cat >"$tmpdir/toolkit-releases.json" <<'EOF'
[
  {"tag_name":"v0.14.1","draft":false,"prerelease":false},
  {"tag_name":"v0.14.0","draft":false,"prerelease":false}
]
EOF
printf '0.14.0\n' >"$tmpdir/TOOLKIT_VERSION"
python3 "$ROOT/scripts/sync-toolkit-version.py" --version-file "$tmpdir/TOOLKIT_VERSION" --releases-file "$tmpdir/toolkit-releases.json" >"$tmpdir/toolkit-version-check.txt"
grep -q '^current: v0.14.0$' "$tmpdir/toolkit-version-check.txt"
grep -q '^latest: v0.14.1$' "$tmpdir/toolkit-version-check.txt"
grep -q '^action: update available$' "$tmpdir/toolkit-version-check.txt"
python3 "$ROOT/scripts/sync-toolkit-version.py" --version-file "$tmpdir/TOOLKIT_VERSION" --releases-file "$tmpdir/toolkit-releases.json" --prepare-pr >"$tmpdir/toolkit-version-prepare.txt"
grep -q '^action: prepare toolkit bump$' "$tmpdir/toolkit-version-prepare.txt"
grep -q '^commit-message: chore: bump toolkit version to v0.14.1$' "$tmpdir/toolkit-version-prepare.txt"
grep -q '^pr-title: chore: bump toolkit version to v0.14.1$' "$tmpdir/toolkit-version-prepare.txt"
grep -q '^## Summary$' "$tmpdir/toolkit-version-prepare.txt"
grep -qx '0.14.0' "$tmpdir/TOOLKIT_VERSION"
python3 "$ROOT/scripts/sync-toolkit-version.py" --version-file "$tmpdir/TOOLKIT_VERSION" --releases-file "$tmpdir/toolkit-releases.json" --prepare-pr --pr-body-file "$tmpdir/toolkit-version-pr.md" >"$tmpdir/toolkit-version-pr.txt"
grep -q '^action: prepare toolkit bump$' "$tmpdir/toolkit-version-pr.txt"
grep -q '^commit-message: chore: bump toolkit version to v0.14.1$' "$tmpdir/toolkit-version-pr.txt"
grep -q '^pr-body-file: ' "$tmpdir/toolkit-version-pr.txt"
grep -q '^## Summary$' "$tmpdir/toolkit-version-pr.md"
grep -q 'Bump TOOLKIT_VERSION from v0.14.0 to v0.14.1.' "$tmpdir/toolkit-version-pr.md"
grep -qx '0.14.0' "$tmpdir/TOOLKIT_VERSION"
python3 "$ROOT/scripts/sync-toolkit-version.py" --version-file "$tmpdir/TOOLKIT_VERSION" --releases-file "$tmpdir/toolkit-releases.json" --apply >"$tmpdir/toolkit-version-sync.txt"
grep -q '^action: updated to v0.14.1$' "$tmpdir/toolkit-version-sync.txt"
grep -qx '0.14.1' "$tmpdir/TOOLKIT_VERSION"

override_toolkit="$tmpdir/toolkit-override"
mkdir -p "$override_toolkit/kit" "$override_toolkit/tools"
cat >"$override_toolkit/kit/install.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$HOME/.config/opencode"
printf '{"name":"override"}\n' >"$HOME/.config/opencode/opencode.jsonc"
EOF
chmod +x "$override_toolkit/kit/install.sh"
cat >"$override_toolkit/tools/mcp-health.py" <<'EOF'
#!/usr/bin/env python3
print("mcp health override")
EOF
cat >"$override_toolkit/tools/toggle-mcp.py" <<'EOF'
#!/usr/bin/env python3
print("toggle mcp override")
EOF
cat >"$override_toolkit/tools/release.py" <<'EOF'
#!/usr/bin/env python3
print("release override")
EOF
chmod +x "$override_toolkit/tools/"*.py
TOOLKIT_DIR_OVERRIDE="$override_toolkit" bash scripts/setup-ai-tools.sh "$ROOT"
test -f "$HOME/.config/opencode/scripts/mcp-health.py"
test -f "$HOME/.config/opencode/scripts/toggle-mcp.py"
test -f "$HOME/.config/opencode/scripts/release.py"
grep -qx 'override-local' "$HOME/.config/ai-dev-toolkit/.toolkit-version"
python3 "$HOME/.config/opencode/scripts/mcp-health.py" >/dev/null
python3 "$HOME/.config/opencode/scripts/toggle-mcp.py" >/dev/null
python3 "$HOME/.config/opencode/scripts/release.py" >/dev/null

node_repo="$tmpdir/node-repo"
mkdir -p "$node_repo"
git -C "$node_repo" init -q
printf '{"name":"demo","scripts":{"dev":"echo dev","test":"echo test"}}\n' >"$node_repo/package.json"
python3 "$HOME/.config/tmux/generate-session-template.py" detect "$node_repo" >/dev/null
test -f "$node_repo/.tmux-session.json"

tmux kill-session -t ci_verify 2>/dev/null || true
tmux new-session -d -s ci_verify -c "$node_repo"
"$HOME/.config/tmux/bootstrap-project-session.sh" ci_verify "$node_repo"
tmux list-windows -t ci_verify -F '#{window_name}' >"$tmpdir/windows.txt"
grep -qx 'editor' <(sed -n '1p' "$tmpdir/windows.txt")
grep -q '^dev$' "$tmpdir/windows.txt"
grep -q '^test$' "$tmpdir/windows.txt"
tmux kill-session -t ci_verify

plain_repo="$tmpdir/plain-repo"
mkdir -p "$plain_repo"
git -C "$plain_repo" init -q
git -C "$plain_repo" config user.name "CI"
git -C "$plain_repo" config user.email "ci@example.com"
printf 'demo\n' >"$plain_repo/demo.txt"
git -C "$plain_repo" add demo.txt
git -C "$plain_repo" commit -qm 'feat: add demo'
tmux kill-session -t ci_verify_plain 2>/dev/null || true
tmux new-session -d -s ci_verify_plain -c "$plain_repo"
"$HOME/.config/tmux/bootstrap-project-session.sh" ci_verify_plain "$plain_repo"
tmux list-windows -t ci_verify_plain -F '#{window_name}' >"$tmpdir/plain-windows.txt"
grep -qx 'editor' <(sed -n '1p' "$tmpdir/plain-windows.txt")
grep -q '^git$' "$tmpdir/plain-windows.txt"
grep -q '^files$' "$tmpdir/plain-windows.txt"
tmux kill-session -t ci_verify_plain

echo
echo "CI checks passed."
