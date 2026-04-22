> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Contribute to [ai-dev-toolkit-pt-br](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br/issues).

---
name: mcp-doctor
description: Diagnose and repair failing MCP servers. Captures real launch tracebacks, identifies stale tool/config references, prunes the bad entries, and reconnects. Use when `claude mcp list` shows `Failed to connect`, after upgrading an MCP server (Serena, @modelcontextprotocol/server-*, or vendor MCPs), or when an MCP that worked yesterday silently stopped responding.
triggers:
  - "MCP failing"
  - "MCP failed to connect"
  - "Serena failing"
  - "fix MCP"
  - "diagnose MCP"
  - "MCP not connecting"
  - "Invalid tool name"
---

# MCP Doctor

Most MCP failures fall into a small set of recoverable patterns. This skill runs the right diagnostic commands in the right order and proposes (or applies) the canonical fix.

## When to invoke

- `claude mcp list` shows `✗ Failed to connect` for one or more servers
- After upgrading any MCP server (`uvx --upgrade`, `npm i -g`, plugin update)
- An MCP started erroring with `Invalid tool name`, `Unknown mode`, `Unknown context`, `KeyError`, or similar config-mismatch errors
- A vendor MCP behaves as if its tool catalog shrank (model can't find tools that used to exist)

## Diagnostic protocol

1. **List MCP health**
   ```bash
   claude mcp list 2>&1 | grep -E "(Failed|✗|error)"
   ```

2. **Identify the launch command** for each failing server. Sources, in order:
   - `~/.claude/.mcp.json`
   - `~/.claude/settings.json` → `mcpServers`
   - For plugin-installed MCPs: `~/.claude/plugins/marketplaces/*/marketplace.json`

3. **Reproduce the failure manually** — run the launch command with stdin closed:
   ```bash
   <launch-cmd> </dev/null 2>&1 | tail -40
   ```
   The traceback names the bad tool / mode / context.

4. **List the canonical names** for the installed version. Per-server commands:
   - **Serena:** `uvx --from git+https://github.com/oraios/serena serena tools list`
   - **@modelcontextprotocol/server-***: check the package's `README.md` or `tools` export
   - **Generic:** read the server's release notes for the version you're on

5. **Diff user config against canonical**: anything in the user config's `included_optional_tools`, `enabled_tools`, `excluded_modes`, etc. that's not in the canonical list must go.

6. **Apply the fix.** Most common: empty the `included_optional_tools` list (server defaults are usually fine):
   ```yaml
   included_optional_tools: []
   ```

7. **Reconnect** — `/mcp` in Claude Code, or restart Codex. No daemon restart; `uvx`/`npx` re-resolves on each launch.

8. **Verify** — `claude mcp list` should show the previously-failing servers as `✓ Connected`.

## Known gotchas

| Symptom | Server | Fix |
|---|---|---|
| `Invalid tool name: think_about_*` | Serena ≥ 1.1 | Prune `~/.serena/serena_config.yml` `included_optional_tools` |
| `Unknown context: codex` | Serena | Use `--context desktop-app` or update Serena |
| `Failed to load language server` | Serena | `~/.serena/language_servers/` corrupted — `rm -rf` and re-launch |
| `EACCES` on `npx -y <pkg>` | npm-published MCPs | Clear `~/.npm/_cacache/`, retry |
| HTTP 401 on cloud MCP | Linear, Sentry, Google* | Re-auth via claude.ai web UI |
| Tool count dropped after upgrade | Any | Server renamed tools — update any project-specific code that called them by name |

## Prevention

- Keep `included_optional_tools: []` so you're never depending on tool-name stability.
- Add a session-start health check: `claude mcp list | grep -c Failed` — if non-zero, surface to user.
- Save the recipe as a memory: a stale-tool failure on one MCP is a strong predictor of the same failure on others (everyone follows the same upgrade pattern).

## References

- Pattern: `patterns/mcp-stale-tool-gotcha.md` (ai-dev-toolkit)
- Memory template: `feedback_<server>_stale_tools.md` under `~/.claude/projects/<slug>/memory/`
