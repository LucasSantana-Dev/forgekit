# AI Dev Toolkit

Tools, rules, and best practices for productive AI-assisted development.

This is the toolkit I use daily across 11+ repositories with Claude Code, OpenCode, and other AI coding tools.

## What's Inside

### CLI Tools (`tools/`)
Production-tested CLI tools that boost AI-assisted development:
- **Terminal** — lazygit, fzf, bat, eza, delta, zoxide, atuin, btop
- **Setup scripts** — one-command install for macOS and Ubuntu

### AI Coding Rules (`rules/`)
Rules and conventions for AI agents (CLAUDE.md, AGENTS.md patterns):
- Code standards, commit conventions, PR workflow
- Agent routing strategies (when to use which model)
- MCP server management best practices

### OpenCode Config (`opencode/`)
Battle-tested OpenCode configuration:
- Agent definitions (primary, architect, fast)
- 13 custom commands for common workflows
- DCP (Dynamic Context Pruning) settings
- Plugin recommendations
- Per-project MCP server enablement patterns

### Skills (`skills/`)
Reusable skill definitions for AI agents:
- Resume, verify, ship, commit workflows
- Ecosystem health checks
- Cross-repo coordination patterns

### Best Practices (`best-practices/`)
Lessons learned from real-world AI-assisted development:
- Context management strategies
- Token optimization techniques
- Multi-model routing decisions
- Security practices for AI tools
- Homelab/multi-machine sync patterns

## Quick Start

### macOS
```bash
# Install CLI tools
bash tools/install-macos.sh

# Copy AI rules to your project
cp rules/CLAUDE.md your-project/CLAUDE.md
cp rules/AGENTS.md your-project/AGENTS.md
```

### Ubuntu/Linux
```bash
bash tools/install-ubuntu.sh
```

## Stack

This toolkit is optimized for:
- **Languages**: TypeScript, Python, React, Node.js
- **AI Tools**: Claude Code, OpenCode, Cursor
- **Infra**: Vercel, Supabase, Cloudflare, Docker
- **Workflow**: Trunk-based development, conventional commits

## Contributing

This is a personal toolkit shared with friends. Feel free to fork and adapt.

## License

MIT
