#!/usr/bin/env node
import kleur from "kleur";

const VERSION = "0.1.0";

const USAGE = `${kleur.bold("adtl")} — ai-dev-toolkit-library CLI  v${VERSION}

Commands:
  ${kleur.cyan("list")} [--kind skill|server|agent|collection|doc] [--tag <t>] [<query>]
                          Browse the catalog (falls back to cache if offline).

  ${kleur.cyan("search")} <query>           Shorthand for list <query>.

  ${kleur.cyan("install")} <skill-or-agent-id> [--force]
                          Copy a skill to ~/.claude/skills/<id>/, or an
                          agent to ~/.claude/agents/<id>.md.

  ${kleur.cyan("add-server")} <server-id>   Register a catalog MCP server with your local gateway.

  ${kleur.cyan("setup-claude")}             Wire Claude Code to the local gateway (writes ~/.claude/settings.json).

  ${kleur.cyan("doctor")}                   Verify catalog, gateway, and Claude home are healthy.

  ${kleur.cyan("--version")} / ${kleur.cyan("--help")}

Docs: https://library.lucassantana.tech
Repo: https://github.com/LucasSantana-Dev/ai-dev-toolkit-library
`;

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
    case "list": {
      const { runList } = await import("./commands/list.js");
      return runList(rest);
    }
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
    case "setup-claude": {
      const { runSetupClaude } = await import("./commands/setup-claude.js");
      return runSetupClaude(rest);
    }
    case "doctor": {
      const { runDoctor } = await import("./commands/doctor.js");
      return runDoctor();
    }
    default:
      console.error(kleur.red(`unknown command: ${cmd}`));
      console.error(USAGE);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(kleur.red(`error: ${(err as Error).message}`));
  process.exit(1);
});
