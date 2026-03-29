# CLI Tools

## The Stack

| Tool | What | Why |
|------|------|-----|
| [lazygit](https://github.com/jesseduffield/lazygit) | TUI git client | Interactive staging, rebase, stash — faster than CLI |
| [fzf](https://github.com/junegunn/fzf) | Fuzzy finder | Ctrl+R history, Ctrl+T file picker, Alt+C directory jump |
| [bat](https://github.com/sharkdp/bat) | Better `cat` | Syntax highlighting, line numbers, git integration |
| [eza](https://github.com/eza-community/eza) | Better `ls` | Git status column, tree view, icons |
| [delta](https://github.com/dandavison/delta) | Better `git diff` | Syntax highlighting, side-by-side, line numbers |
| [zoxide](https://github.com/ajeetdsouza/zoxide) | Smart `cd` | Learns your directories, `z project` jumps there |
| [atuin](https://github.com/atuinsh/atuin) | Shell history | Synced across machines, searchable, timestamped |
| [btop](https://github.com/aristocratos/btop) | System monitor | CPU, memory, disk, network — catch runaway processes |
| [jq](https://github.com/jqlang/jq) | JSON processor | Parse API responses, transform data |
| [yq](https://github.com/mikefarah/yq) | YAML processor | Edit CI configs, k8s manifests |
| [fd](https://github.com/sharkdp/fd) | Better `find` | Fast, respects .gitignore |
| [ripgrep](https://github.com/BurntSushi/ripgrep) | Better `grep` | Fast, respects .gitignore |

## Curated AI Productivity Additions

These are high-signal tools from the shared X thread that fit this toolkit's workflows.

| Tool | Category | Why it improves productivity |
|------|----------|------------------------------|
| [Context7](https://context7.com/) | Docs retrieval | Reduces hallucinations by grounding code generation in current docs |
| [Tavily](https://tavily.com/) | Web research | Fast, agent-friendly search for implementation questions and comparisons |
| [Firecrawl](https://github.com/mendableai/firecrawl) | Web ingestion | Converts docs/sites into clean markdown for RAG and internal knowledge |
| [promptfoo](https://github.com/promptfoo/promptfoo) | Prompt eval | Regression-tests prompts and model configs before shipping |
| [Portkey AI Gateway](https://github.com/Portkey-AI/gateway) | LLM gateway | Centralizes routing, logging, caching, and guardrails across providers |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Agent workflows | Reliable stateful agent flows for longer multi-step tasks |
| [n8n](https://github.com/n8n-io/n8n) | Automation | Turns repetitive dev/review/release tasks into reusable automations |
| [Dify](https://github.com/langgenius/dify) | App orchestration | Speeds up shipping internal AI tools and chat workflows |
| [Ollama](https://github.com/ollama/ollama) | Remote/homelab inference | GPU-accelerated models on homelab (oac-workstation, RX 9070 XT) — accessed via Tailscale `OLLAMA_HOST` |
| [openrtk](https://github.com/martinstannard/openrtk) | OpenCode plugin | Routes OpenCode commands through RTK proxy for 60-90% token savings |
| [Open WebUI](https://github.com/open-webui/open-webui) | Team UX | Shared interface for local/self-hosted models and prompt workflows |
| [fastmcp](https://github.com/jlowin/fastmcp) | MCP development | Faster path to build internal MCP servers with less boilerplate |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | UI automation | Stable browser actions and reproducible end-to-end validation loops |
| [browser-use](https://github.com/browser-use/browser-use) | Browser agent | Persistent local/browser-cloud automation with CLI and Python APIs |
| [Letta](https://github.com/letta-ai/letta) | Stateful agents | Durable memory-first agent runtime with CLI support |
| [Mem0](https://github.com/mem0ai/mem0) | Memory layer | Production memory extraction/retrieval for agent workflows |
| [Graphiti](https://github.com/getzep/graphiti) | Graph memory | Temporal and relationship-aware memory graph for long-running agents |
| [planning-with-files](https://github.com/OthmanAdi/planning-with-files) | Planning workflow | Persistent 3-file planning pattern with session recovery and hook support |
| [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | Skills catalog | Large cross-agent skill bundle installer with curated starter packs |
| [OpenViking](https://github.com/volcengine/OpenViking) | Context DB | Filesystem-style long-term context store designed for agent workflows |

### Manual/Optional Picks From Community Repos

These are high-value, but not auto-installed because they are IDE-first, docs-first, or heavyweight stacks.

| Tool | Source | Why manual |
|------|--------|------------|
| [Cline](https://github.com/cline/cline) | `cline/cline` | VS Code extension workflow, managed via editor marketplace |
| [OpenHands](https://github.com/OpenHands/OpenHands) | `OpenHands/OpenHands` | Better adopted as containerized/SDK deployment rather than pipx bootstrap |
| [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | `dair-ai/Prompt-Engineering-Guide` | Reference knowledge base, not a runtime tool |
| [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps) | `Shubhamsaboo/awesome-llm-apps` | Pattern/examples catalog for solution templates |
| [System Prompts & Models](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | `x1xhlol/system-prompts-and-models-of-ai-tools` | Research/reference corpus, not an install target |

### Recommended Adoption Order

1. Start with `Context7`, `promptfoo`, and `Playwright MCP` for immediate quality gains.
2. Add `Portkey AI Gateway` when you need multi-provider governance and observability.
3. Add `LangGraph` or `Dify` when simple chat flows become multi-step workflows.
4. Add `n8n` for repeatable cross-tool automation and handoff reduction.
5. Add `Ollama` + `Open WebUI` for private/homelab GPU inference and cost control.
6. Add `openrtk` to OpenCode for token savings on every agent session.

## Install

```bash
# macOS
bash tools/install-macos.sh
bash tools/setup-ai-workflow-macos.sh

# Ubuntu/Linux
bash tools/install-ubuntu.sh

# Windows (PowerShell as Admin)
.\tools\install-windows.ps1
```

## Local AI Workflow Commands

After running `bash tools/setup-ai-workflow-macos.sh` and `source ~/.zshrc`:

| Command | Purpose |
|---------|---------|
| `ai-eval` | Prompt evaluation with `promptfoo` |
| `ai-flow` | Local automation server via `n8n` |
| `ai-ollama` | Remote Ollama via `ollama` (routes to oac-workstation via `OLLAMA_HOST`) |
| `ai-ollama-ps` | Show running models and VRAM usage on oac-workstation |
| `ai-ollama-gpu` | List downloaded models (JSON) from remote Ollama API |
| `ai-webui` | Run Open WebUI in Docker connected to oac-workstation (`localhost:3000`) |
| `ai-portkey` | Run Portkey gateway locally in Docker (`localhost:8787`) |
| `ai-browser-mcp` | Launch Playwright MCP server for browser automation |
| `ai-skills-find` | Discover community skills via the Skills CLI |
| `ai-skills-add` | Install a skill package with the Skills CLI |
| `ai-plan-files` | Install `planning-with-files` skill globally |
| `ai-skill-pack` | Install Antigravity skill bundle for Claude-compatible paths |
| `ai-openviking` | Start OpenViking server (if installed) |
| `ai-browser-use` | Launch Browser Use CLI |
| `ai-letta` | Launch Letta CLI |
| `ai-memory-check` | Validate memory stack imports (`mem0`, `graphiti_core`) |
| `ai-memory-python` | Open the dedicated memory-stack Python runtime |
| `ai-docs` | Reminder to use Context7 MCP for docs-grounded coding |
| `ai-search` | Reminder to use Tavily MCP for web research in agents |
| `ai-crawl` | Reminder to use Firecrawl API/MCP for ingestion pipelines |

## Recommended Aliases

### Bash/Zsh/Fish
```bash
alias lg='lazygit'
alias ll='eza -la --git'
alias lt='eza -la --tree --level=2 --git'
alias cat='bat'
```

### PowerShell
```powershell
Set-Alias -Name lg -Value lazygit
function ll { eza -la --git @args }
function lt { eza -la --tree --level=2 --git @args }
Set-Alias -Name cat -Value bat -Option AllScope
```

## Platform Notes

| Tool | macOS | Ubuntu | Windows |
|------|-------|--------|---------|
| lazygit | brew | GitHub release | winget |
| fzf | brew | apt | winget |
| bat | brew | apt (`batcat`) | winget |
| eza | brew | gierens apt repo | scoop |
| delta | brew | GitHub .deb | winget |
| zoxide | brew | curl installer | winget |
| atuin | brew | curl installer | scoop |
| btop | brew | apt | winget |
| jq | brew | apt | winget |
| yq | brew | GitHub release | scoop |
