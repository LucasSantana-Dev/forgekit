import { unlink, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import kleur from "kleur";
import { loadIndex } from "../lib/catalog.js";
import {
  skillInstallPath,
  agentInstallPath,
  hookInstallPath,
  commandInstallPath,
  toolInstallPath,
} from "../lib/claude-config.js";

const INSTALLABLE_KINDS = ["skill", "agent", "hook", "command", "tool"] as const;

export async function runUninstall(args: string[]): Promise<void> {
  const id = args[0];
  if (!id) {
    console.error("Usage: forge-kit uninstall <id>   (skill | agent | hook | command | tool)");
    process.exit(2);
  }

  const index = await loadIndex();
  const entry = index.entries.find(
    (e) => INSTALLABLE_KINDS.includes(e.kind as (typeof INSTALLABLE_KINDS)[number]) && e.id === id,
  );
  if (!entry) {
    console.error(kleur.red(`✗ no installable entry with id '${id}'`));
    console.error(kleur.dim(`  run \`forge-kit list\` and look for: ${INSTALLABLE_KINDS.join(", ")}`));
    process.exit(1);
  }

  switch (entry.kind) {
    case "skill":
      return uninstallSkill(id);
    case "agent":
      return uninstallAgent(id);
    case "hook":
      return uninstallHook(id);
    case "command":
      return uninstallCommand(id);
    case "tool":
      return uninstallTool(id);
    default:
      console.error(kleur.red(`✗ cannot uninstall kind '${entry.kind}'`));
      process.exit(1);
  }
}

async function uninstallSkill(id: string) {
  const target = skillInstallPath(id);
  if (!existsSync(target)) {
    console.log(kleur.yellow(`✗ skill '${id}' not installed`));
    return;
  }
  await rm(target, { recursive: true, force: true });
  success("skill", id, target);
}

async function uninstallAgent(id: string) {
  const target = agentInstallPath(id);
  if (!existsSync(target)) {
    console.log(kleur.yellow(`✗ agent '${id}' not installed`));
    return;
  }
  await unlink(target);
  success("agent", id, target);
}

async function uninstallHook(id: string) {
  const target = hookInstallPath(id);
  if (!existsSync(target)) {
    console.log(kleur.yellow(`✗ hook '${id}' not installed`));
    return;
  }
  await unlink(target);
  success("hook", id, target);
}

async function uninstallCommand(id: string) {
  const target = commandInstallPath(id);
  if (!existsSync(target)) {
    console.log(kleur.yellow(`✗ command '${id}' not installed`));
    return;
  }
  await unlink(target);
  success("command", id, target);
}

async function uninstallTool(id: string) {
  const target = toolInstallPath(id);
  if (!existsSync(target)) {
    console.log(kleur.yellow(`✗ tool '${id}' not installed`));
    return;
  }
  await unlink(target);
  success("tool", id, target);
}

function success(kind: string, id: string, target: string) {
  console.log(kleur.green(`✓ uninstalled ${kind} '${id}'`));
  console.log(kleur.dim(`  ← ${target}`));
}
