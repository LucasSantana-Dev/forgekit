# CLI Tools

## The Stack

| Tool                                                | What              | Why                                                                                                            |
| --------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| [lazygit](https://github.com/jesseduffield/lazygit) | TUI git client    | Interactive staging, rebase, stash — faster than CLI                                                           |
| [fzf](https://github.com/junegunn/fzf)              | Fuzzy finder      | Ctrl+R history, Ctrl+T file picker, Alt+C directory jump                                                       |
| [bat](https://github.com/sharkdp/bat)               | Better `cat`      | Syntax highlighting, line numbers, git integration                                                             |
| [eza](https://github.com/eza-community/eza)         | Better `ls`       | Git status column, tree view, icons                                                                            |
| [delta](https://github.com/dandavison/delta)        | Better `git diff` | Syntax highlighting, side-by-side, line numbers                                                                |
| [zoxide](https://github.com/ajeetdsouza/zoxide)     | Smart `cd`        | Learns your directories, `z project` jumps there                                                               |
| [atuin](https://github.com/atuinsh/atuin)           | Shell history     | Synced across machines, searchable, timestamped                                                                |
| [btop](https://github.com/aristocratos/btop)        | System monitor    | CPU, memory, disk, network — catch runaway processes                                                           |
| [jq](https://github.com/jqlang/jq)                  | JSON processor    | Parse API responses, transform data                                                                            |
| [yq](https://github.com/mikefarah/yq)               | YAML processor    | Edit CI configs, k8s manifests                                                                                 |
| [fd](https://github.com/sharkdp/fd)                 | Better `find`     | Fast, respects .gitignore                                                                                      |
| [ripgrep](https://github.com/BurntSushi/ripgrep)    | Better `grep`     | Fast, respects .gitignore                                                                                      |
| [rtk](https://github.com/rtk-ai/rtk)                | Token optimizer   | Compresses Bash output before it hits LLM context; 60-90% savings on `git`, `npm`, `ls` and other dev commands |

## Curated AI Productivity Additions

These are high-signal tools from the shared X thread that fit this toolkit's workflows.

| Tool                                                                                | Category                  | Why it improves productivity                                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Context7](https://context7.com/)                                                   | Docs retrieval            | Reduces hallucinations by grounding code generation in current docs                                                                                                                                 |
| [Tavily](https://tavily.com/)                                                       | Web research              | Fast, agent-friendly search for implementation questions and comparisons                                                                                                                            |
| [Firecrawl](https://github.com/mendableai/firecrawl)                                | Web ingestion             | Converts docs/sites into clean markdown for RAG and internal knowledge                                                                                                                              |
| [promptfoo](https://github.com/promptfoo/promptfoo)                                 | Prompt eval               | Regression-tests prompts and model configs before shipping                                                                                                                                          |
| [Portkey AI Gateway](https://github.com/Portkey-AI/gateway)                         | LLM gateway               | Centralizes routing, logging, caching, and guardrails across providers                                                                                                                              |
| [LangGraph](https://github.com/langchain-ai/langgraph)                              | Agent workflows           | Reliable stateful agent flows for longer multi-step tasks                                                                                                                                           |
| [n8n](https://github.com/n8n-io/n8n)                                                | Automation                | Turns repetitive dev/review/release tasks into reusable automations                                                                                                                                 |
| [Dify](https://github.com/langgenius/dify)                                          | App orchestration         | Speeds up shipping internal AI tools and chat workflows                                                                                                                                             |
| [Ollama](https://github.com/ollama/ollama)                                          | Local inference           | Fast local models for private/offline tasks and cheap iterations                                                                                                                                    |
| [TurboQuant](https://github.com/0xSero/turboquant)                                  | Local inference optimizer | Google's KV-cache quantization (demonstrated 6x memory reduction, 8x speed on H100 GPUs per March 2026 research) — vLLM integration available; llama.cpp/Ollama support under community development |
| [Open WebUI](https://github.com/open-webui/open-webui)                              | Team UX                   | Shared interface for local/self-hosted models and prompt workflows                                                                                                                                  |
| [fastmcp](https://github.com/jlowin/fastmcp)                                        | MCP development           | Faster path to build internal MCP servers with less boilerplate                                                                                                                                     |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp)                       | UI automation             | Stable browser actions and reproducible end-to-end validation loops                                                                                                                                 |
| [browser-use](https://github.com/browser-use/browser-use)                           | Browser agent             | Persistent local/browser-cloud automation with CLI and Python APIs                                                                                                                                  |
| [Letta](https://github.com/letta-ai/letta)                                          | Stateful agents           | Durable memory-first agent runtime with CLI support                                                                                                                                                 |
| [Mem0](https://github.com/mem0ai/mem0)                                              | Memory layer              | Production memory extraction/retrieval for agent workflows                                                                                                                                          |
| [Graphiti](https://github.com/getzep/graphiti)                                      | Graph memory              | Temporal and relationship-aware memory graph for long-running agents                                                                                                                                |
| [planning-with-files](https://github.com/OthmanAdi/planning-with-files)             | Planning workflow         | Persistent 3-file planning pattern with session recovery and hook support                                                                                                                           |
| [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | Skills catalog            | Large cross-agent skill bundle installer with curated starter packs                                                                                                                                 |
| [OpenViking](https://github.com/volcengine/OpenViking)                              | Context DB                | Filesystem-style long-term context store designed for agent workflows                                                                                                                               |
| [Codex CLI](https://github.com/openai/codex)                                        | AI coding agent           | Sandbox-first terminal agent (OpenAI). Defaults: `workspace-write`, network disabled, `on-request` approval                                                                                         |

| [markdownify-mcp](https://github.com/zcaceres/markdownify-mcp) | Document ingestion | Converts PDFs, images, and audio into Markdown for RAG pipelines and context injection |
| [MCPHub](https://github.com/samanhappy/mcphub) | MCP management | HTTP proxy that aggregates and routes multiple MCP servers — reduces connection overhead |
| [lmnr](https://github.com/lmnr-ai/lmnr) | Agent observability | Traces, evaluates, and monitors agent behavior in production — complements promptfoo for runtime visibility |
| [TDD Guard](https://github.com/nizos/tdd-guard) | Testing enforcement | Claude Code hook that blocks implementation before tests exist — enforces test-first at the agent level |
| [container-use](https://github.com/dagger/container-use) | Agent isolation | Dagger-based containerized environments for coding agents — prevents host contamination on risky tasks |
| [claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | Security scanning | Official Anthropic action that analyzes PRs for security issues — drop-in CI step |

### Claude Code Skills

Skills are `.md` files placed in `~/.claude/skills/` that teach Claude workflows and patterns.
High-signal picks from the community:

| Skill                                                                                           | Stars | Why it matters                                                                |
| ----------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- |
| [Superpowers](https://github.com/obra/superpowers)                                              | 96k+  | 20+ battle-tested skills: TDD pipeline, plan-to-execute, systematic debugging |
| [Context Optimization](https://github.com/muratcankoylan/agent-skills-for-context-engineering)  | 13.9k | KV-cache tricks and token reduction — directly complements RTK                |
| [claude-deep-research-skill](https://github.com/199-biotechnologies/claude-deep-research-skill) | —     | 8-phase research with auto-continuation for deep dives                        |
| [Anthropic Official Skills](https://github.com/anthropics/skills)                               | —     | PDF, DOCX, XLSX, PPTX, Canvas Design, Frontend Design, Brand Guidelines       |

**Install:**

```bash
# Global install
git clone <repo-url> && cp <repo>/skills/*.md ~/.claude/skills/

# Or via skills CLI
npx -y skills add obra/superpowers -g
npx -y skills add anthropics/skills -g
```

### OpenCode Plugins

Drop into `~/.config/opencode/opencode.jsonc` under the `"plugin"` array. Restart OpenCode after changes.

When using `forge-kit`, `--oh-my-compat` can bootstrap a reference `oh-my-opencode.jsonc` file without changing existing plugin arrays.

```jsonc
{
  "plugin": [
    "oh-my-openagent", // orchestration
    "opencode-claude-auth", // auth
    "@kompassdev/opencode", // repo navigation
    "opencode-scheduler", // scheduling
  ],
}
```

#### Auth

| Plugin                                                                                | What                                                                                         | Notes                                                                        |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`opencode-claude-auth`](https://github.com/griffinmartin/opencode-claude-auth)       | Reuses your Claude Code OAuth credentials — no separate API key or login                     | Reads macOS Keychain or `~/.claude/.credentials.json`; auto-refreshes tokens |
| [`opencode-gemini-auth`](https://github.com/jenslys/opencode-gemini-auth)             | Gemini OAuth via browser flow — no API key needed                                            | ⚠️ Google warns this is a ToS violation; use API key if account risk matters |
| [`opencode-antigravity-auth`](https://github.com/NoeFabris/opencode-antigravity-auth) | Gemini 3 Pro + Claude 4.6 via Antigravity IDE OAuth; two quota pools, multi-account rotation | ⚠️ Same ToS risk as above; free access to otherwise paid models              |

#### Orchestration & Workflow

| Plugin                                                                     | What                                                                                                               | Notes                                                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [`oh-my-openagent`](https://ohmyopenagent.com)                             | Multi-model agent harness — type `ulw` to trigger autonomous plan → research → parallel agents → self-correct loop | 40+ lifecycle hooks; `boulder.json` session resumability; routes tasks to optimal model          |
| [`@kompassdev/opencode`](https://github.com/kompassdev/kompass)            | Keeps agents grounded in real repo state via `changes_load`, `pr_load`, `ticket_load`                              | Adds `/dev`, `/ship`, `/commit`, `/todo` commands; prevents drift on long tasks                  |
| [`@plannotator/opencode`](https://github.com/backnotprop/plannotator)      | Interactive plan review with visual diff annotation before agent proceeds                                          | Approve/reject/comment on plans; AES-256-GCM encrypted sharing; `/plannotator-review` command    |
| [`opencode-scheduler`](https://github.com/different-ai/opencode-scheduler) | Schedule recurring agent tasks using native OS schedulers (launchd/systemd/Task Scheduler)                         | Cron syntax; overlap prevention; timeout enforcement; runs from project dir with full MCP config |

#### Memory

| Plugin                                                             | What                                                                         | Notes                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`opencode-graphiti`](https://github.com/vicary/opencode-graphiti) | Persistent temporal + relationship-aware memory via Graphiti knowledge graph | Best for long-running projects where decisions chain across sessions |
| [`opencode-mem`](https://github.com/tickernelz/opencode-mem)       | Local vector DB memory with semantic search                                  | Lighter than graphiti; good default starting point                   |

#### Code Quality

| Plugin                                                                                 | What                                                                                    | Notes                                                           |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`opencode-codegraph`](https://codegraph.ru/docs/en/integrations/OPENCODE_PLUGIN.html) | CPG-powered code analysis — understands call graphs, data flow, and AST structure       | Useful for large codebases where grep-based context falls short |
| [`opencode-plugin-openspec`](https://github.com/Octane0411/opencode-plugin-openspec)   | Dedicated agent for planning and specifying software architecture before implementation | Surfaces API contracts and interface decisions early            |

#### Notifications

| Plugin                                                                         | What                                                                               | Notes                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`opencode-plugin-apprise`](https://github.com/or1is1/opencode-plugin-apprise) | Sends rich notifications (macOS, Slack, email, Discord) when agent needs attention | Requires [Apprise CLI](https://github.com/caronc/apprise); configure notification targets in plugin config |

#### Recommended Adoption Order (OpenCode)

1. `opencode-claude-auth` — zero-friction auth if you already use Claude Code
2. `oh-my-openagent` — the `ulw` command alone is worth the install
3. `@kompassdev/opencode` — add when agents start drifting on multi-step tasks
4. `opencode-scheduler` — add when you have recurring agent workflows (summaries, scans, uptime checks)
5. `opencode-graphiti` — add when decision context needs to persist across weeks of sessions
6. `@plannotator/opencode` — add when team review of agent plans becomes a bottleneck
7. `opencode-codegraph` — add for large codebases where structural analysis matters

### Manual/Optional Picks From Community Repos

These are high-value, but not auto-installed because they are IDE-first, docs-first, or heavyweight stacks.

| Tool                                                                                        | Source                                          | Why manual                                                                |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| [Cline](https://github.com/cline/cline)                                                     | `cline/cline`                                   | VS Code extension workflow, managed via editor marketplace                |
| [OpenHands](https://github.com/OpenHands/OpenHands)                                         | `OpenHands/OpenHands`                           | Better adopted as containerized/SDK deployment rather than pipx bootstrap |
| [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide)             | `dair-ai/Prompt-Engineering-Guide`              | Reference knowledge base, not a runtime tool                              |
| [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps)                        | `Shubhamsaboo/awesome-llm-apps`                 | Pattern/examples catalog for solution templates                           |
| [System Prompts & Models](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | `x1xhlol/system-prompts-and-models-of-ai-tools` | Research/reference corpus, not an install target                          |

### Recommended Adoption Order

1. Start with `Context7`, `promptfoo`, and `Playwright MCP` for immediate quality gains.
2. Add `Portkey AI Gateway` when you need multi-provider governance and observability.
3. Add `Superpowers` skills and `Context Optimization` skill to enrich Claude Code's workflow library.
4. Add `markdownify-mcp` and `lmnr` when building RAG pipelines or agent workflows that need observability.
5. Add `TDD Guard` to enforce test-first behavior at the agent level.
6. Add `LangGraph` or `Dify` when simple chat flows become multi-step workflows.
7. Add `n8n` for repeatable cross-tool automation and handoff reduction.
8. Add `Ollama` + `TurboQuant` + `Open WebUI` for private/local experimentation — TurboQuant's KV-cache quantization can reduce memory usage on supported hardware (results vary by GPU architecture).
9. Add `container-use` when agent tasks carry meaningful risk of host contamination.
10. Add `Codex CLI` for a sandbox-first alternative agent on OpenAI models.

## capture-training

Extract your Claude Code sessions as instruction fine-tuning data:

```bash
python3 tools/capture-training.py --export --min-turns 3
```

Parses `~/.claude/projects/**/*.jsonl`, extracts user→assistant exchanges, deduplicates by session
hash, and appends to a `dataset.jsonl` in alpaca format. Running `setup-claude-code.sh` installs
this as `capture-training` in `~/.local/bin/`. See [training/README.md](../training/README.md).

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

## Release Helper

Use `tools/release.py` to preview or execute versioned releases.

```bash
python3 tools/release.py --repo /path/to/repo --verify --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --dry-run --level patch --notes-file RELEASE_NOTES.md --changelog
python3 tools/release.py --repo /path/to/repo --level patch --notes-file RELEASE_NOTES.md --changelog
```

When `--github-release` is added, preflight also checks `gh` availability and auth; it always checks git identity and target tag availability before any mutation.

## Local AI Workflow Commands

After running `bash tools/setup-ai-workflow-macos.sh` and `source ~/.zshrc`:

| Command            | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `ai-eval`          | Prompt evaluation with `promptfoo`                           |
| `ai-flow`          | Local automation server via `n8n`                            |
| `ai-ollama`        | Local model runtime via `ollama`                             |
| `ai-webui`         | Run Open WebUI locally in Docker (`localhost:3000`)          |
| `ai-portkey`       | Run Portkey gateway locally in Docker (`localhost:8787`)     |
| `ai-browser-mcp`   | Launch Playwright MCP server for browser automation          |
| `ai-skills-find`   | Discover community skills via the Skills CLI                 |
| `ai-skills-add`    | Install a skill package with the Skills CLI                  |
| `ai-plan-files`    | Install `planning-with-files` skill globally                 |
| `ai-skill-pack`    | Install Antigravity skill bundle for Claude-compatible paths |
| `ai-openviking`    | Start OpenViking server (if installed)                       |
| `ai-browser-use`   | Launch Browser Use CLI                                       |
| `ai-letta`         | Launch Letta CLI                                             |
| `ai-lmnr`          | Open lmnr dashboard for agent tracing and evaluation         |
| `ai-markdownify`   | Run markdownify-mcp — convert PDF/image/audio to Markdown    |
| `ai-mcphub`        | Start MCPHub proxy to manage multiple MCP servers            |
| `ai-memory-check`  | Validate memory stack imports (`mem0`, `graphiti_core`)      |
| `ai-memory-python` | Open the dedicated memory-stack Python runtime               |
| `ai-docs`          | Reminder to use Context7 MCP for docs-grounded coding        |
| `ai-search`        | Reminder to use Tavily MCP for web research in agents        |
| `ai-crawl`         | Reminder to use Firecrawl API/MCP for ingestion pipelines    |

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

| Tool    | macOS | Ubuntu           | Windows                                                |
| ------- | ----- | ---------------- | ------------------------------------------------------ |
| lazygit | brew  | GitHub release   | winget                                                 |
| fzf     | brew  | apt              | winget                                                 |
| bat     | brew  | apt (`batcat`)   | winget                                                 |
| eza     | brew  | gierens apt repo | scoop                                                  |
| delta   | brew  | GitHub .deb      | winget                                                 |
| zoxide  | brew  | curl installer   | winget                                                 |
| atuin   | brew  | curl installer   | scoop                                                  |
| btop    | brew  | apt              | winget                                                 |
| jq      | brew  | apt              | winget                                                 |
| yq      | brew  | GitHub release   | scoop                                                  |
| rtk     | brew  | install.sh       | manual (see [rtk docs](https://github.com/rtk-ai/rtk)) |
