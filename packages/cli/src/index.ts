#!/usr/bin/env node
import kleur from "kleur";

const VERSION = "0.3.0";

const USAGE = `${kleur.bold("forge-kit")} — Forge Kit CLI  v${VERSION}

Commands:
  ${kleur.cyan("list")} [--kind skill|server|agent|collection|doc] [--tag <t>] [<query>]
                          Browse the catalog (falls back to cache if offline).

  ${kleur.cyan("search")} <query>           Shorthand for list <query>.

  ${kleur.cyan("install")} <skill-or-agent-id> [--force]
                          Copy a skill to ~/.claude/skills/<id>/, or an
                          agent to ~/.claude/agents/<id>.md.

  ${kleur.cyan("add-server")} <server-id>   Register a catalog MCP server with your local gateway.

  ${kleur.cyan("setup")} <editor> [...]     Wire an editor's MCP config to the local gateway.
  ${kleur.cyan("setup")} --all              Wire every detected editor.
  ${kleur.cyan("setup")} --list             List supported editor ids.

  Convenience aliases (one command per editor):
    ${kleur.cyan("setup-claude")}             Claude Code     ${kleur.dim("(~/.claude/settings.json)")}
    ${kleur.cyan("setup-claude-desktop")}     Claude Desktop  ${kleur.dim("(Claude app config)")}
    ${kleur.cyan("setup-codex")}              Codex CLI       ${kleur.dim("(~/.codex/config.toml)")}
    ${kleur.cyan("setup-cursor")}             Cursor          ${kleur.dim("(~/.cursor/mcp.json)")}
    ${kleur.cyan("setup-gemini")}             Gemini CLI      ${kleur.dim("(~/.gemini/settings.json)")}
    ${kleur.cyan("setup-windsurf")}           Windsurf        ${kleur.dim("(~/.codeium/windsurf/mcp_config.json)")}

  ${kleur.cyan("doctor")}                   Verify catalog, gateway, and Claude home are healthy.

  ${kleur.cyan("--version")} / ${kleur.cyan("--help")}

Docs: https://library.lucassantana.tech
Repo: https://github.com/LucasSantana-Dev/ai-dev-toolkit
`;

const SETUP_ALIASES: Record<string, string> = {
  "setup-claude": "claude-code",
  "setup-claude-desktop": "claude-desktop",
  "setup-codex": "codex",
  "setup-cursor": "cursor",
  "setup-gemini": "gemini",
  "setup-windsurf": "windsurf",
};

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(USAGE);
    return;
  }
  if (cmd === "--version" || cmd === "-V") {
    console.log(VERSION);
    return;
  }

  switch (cmd) {
    case "list":
    case "search": {
      const { runList } = await import("./commands/list.js");
      return runList(rest);
    }
    case "install": {
      const { runInstall } = await import("./commands/install.js");
      return runInstall(rest);
    }
    case "add-server": {
      const { runAddServer } = await import("./commands/add-server.js");
      return runAddServer(rest);
    }
    case "setup": {
      const { runSetup } = await import("./commands/setup.js");
      return runSetup(rest);
    }
    case "doctor": {
      const { runDoctor } = await import("./commands/doctor.js");
      return runDoctor();
    }
    default:
      if (cmd in SETUP_ALIASES) {
        const { runSetup } = await import("./commands/setup.js");
        return runSetup([SETUP_ALIASES[cmd], ...rest]);
      }
      console.error(kleur.red(`unknown command: ${cmd}`));
      console.error(USAGE);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(kleur.red(`error: ${(err as Error).message}`));
  process.exit(1);
});
