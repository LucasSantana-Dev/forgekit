> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Contribute to [ai-dev-toolkit-pt-br](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br/issues).

# MCP Stale-Tool-Name Gotcha

MCP servers that maintain a config-driven allowlist of "optional tools" silently break when the upstream package renames or removes a tool. The user's config still lists `think_about_task_adherence`; the new release of the server doesn't expose it; the server crashes at startup with `ValueError: Invalid tool name`. The MCP client (Claude Code, Codex, etc.) reports "Failed to connect" with no further hint.

> _Pattern documented after a Serena 1.1.x upgrade silently disabled the entire MCP server in our environment. The fix took ~5 minutes once the root cause was visible; finding the root cause without the right diagnostic command would have been hours._

## Symptoms

- `claude mcp list` shows the server as `✗ Failed to connect`.
- The MCP client doesn't surface the underlying error.
- Manually launching the server stdio command shows a Python/Node traceback ending in something like `Invalid tool name: <name> (in included optional tools)` or `KeyError: '<name>'`.

## Root cause

Most MCP servers (Serena, several @modelcontextprotocol servers, vendor-specific ones) load a user config that can opt-in to "optional" or "experimental" tools. When the server upgrades and renames/removes a tool, the user config is now referencing a ghost. Different servers handle this differently — some warn and continue, others (Serena ≥ 1.1) hard-fail at startup.

## Diagnosis

1. **Reproduce manually** — run the MCP launch command from the client config, with stdin closed:
   ```bash
   <command-from-mcp-config> </dev/null 2>&1 | tail -40
   ```
   The traceback names the bad tool.

2. **List the canonical tool names** for the installed version:
   ```bash
   <server-binary> tools list   # for Serena
   # or read the server's package release notes for the tool catalog
   ```

3. **Diff the user config against the canonical list** — anything in `included_optional_tools` (or equivalent) that's not in the canonical list must go.

## Fix

Edit the MCP server's user config (e.g., `~/.serena/serena_config.yml`), prune the dead entries, optionally reset the list to `[]` (the defaults are usually fine):

```yaml
included_optional_tools: []  # was: think_about_task_adherence, summarize_changes, ...
```

Then in the MCP client, run `/mcp` (Claude Code) or restart the session (Codex). No daemon restart needed — `uvx` / `npx` re-resolves the env on each launch.

## Prevention

- **Pin vs. float**: pinning the server version (`uvx --from <pkg>==1.0.5`) avoids surprise breaks but loses bug fixes. Recommend floating + an opt-in tool list of `[]` so you're never depending on tool-name stability.
- **Health check on session start**: a `claude mcp list | grep -c "Failed to connect"` smoke test in your shell prompt catches drift within minutes instead of next time you reach for the tool.
- **Document the recovery recipe** as a memory entry — the same problem will recur on the next major upgrade.

## References

- Serena CLI: `serena tools list`, `serena --help`
- Claude Code MCP refresh: `/mcp` slash command
- Companion patterns: `mcp-tool-lazy-loading.md`, `agent-gotchas.md`
