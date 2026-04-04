# AI Tools — Fallback Configuration

Minimal fallback files used when the toolkit tarball is unreachable.

When the network is available, `setup-ai-tools.sh` fetches the pinned
toolkit release and delegates to `kit/install.sh`, which auto-detects
installed tools (Claude Code, Codex, OpenCode, Cursor, Windsurf) and
configures each one.

These local files are only used as an offline degraded-mode fallback.
