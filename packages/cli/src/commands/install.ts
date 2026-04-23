import { writeFile, mkdir, readFile, chmod } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import kleur from "kleur";
import { loadIndex, fetchRawFile } from "../lib/catalog.js";
import {
  ensureSkillsDir,
  ensureAgentsDir,
  ensureHooksDir,
  ensureCommandsDir,
  ensureBinDir,
  skillInstallPath,
  agentInstallPath,
  hookInstallPath,
  commandInstallPath,
  toolInstallPath,
} from "../lib/claude-config.js";

const INSTALLABLE_KINDS = ["skill", "agent", "hook", "command", "tool"] as const;

export async function runInstall(args: string[]): Promise<void> {
  const id = args[0];
  if (!id) {
    console.error("Usage: forge-kit install <id>   (skill | agent | hook | command | tool)");
    process.exit(2);
  }
  const force = args.includes("--force") || args.includes("-f");

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
      return installSkill(id, force);
    case "agent":
      return installAgent(id, force);
    case "hook":
      return installHook(id, force);
    case "command":
      return installCommand(id, force);
    case "tool":
      return installTool(id, force);
    default:
      console.error(kleur.red(`✗ cannot install kind '${entry.kind}'`));
      process.exit(1);
  }
}

async function installSkill(id: string, force: boolean) {
  await ensureSkillsDir();
  const target = skillInstallPath(id);
  if (existsSync(target) && !force) return abortExists(target);
  await mkdir(target, { recursive: true });
  for (const name of ["manifest.json", "SKILL.md"]) {
    const content = await loadFile(`catalog/skills/${id}/${name}`);
    await writeFile(path.join(target, name), content);
  }
  success("skill", id, target, "Claude Code picks this up on next session start.");
}

async function installAgent(id: string, force: boolean) {
  await ensureAgentsDir();
  const target = agentInstallPath(id);
  if (existsSync(target) && !force) return abortExists(target);
  await writeFile(target, await loadFile(`catalog/agents/${id}.md`));
  success("agent", id, target, "Claude Code picks this up on next session start.");
}

async function installHook(id: string, force: boolean) {
  await ensureHooksDir();
  const target = hookInstallPath(id);
  if (existsSync(target) && !force) return abortExists(target);

  // Find the hook's source script. We probe `script.sh` then `script.py`.
  let scriptBody: string | null = null;
  for (const name of ["script.sh", "script.py"]) {
    scriptBody = await tryLoadFile(`catalog/hooks/${id}/${name}`);
    if (scriptBody) break;
  }
  if (!scriptBody) {
    console.error(kleur.red(`✗ hook '${id}' has no script.sh or script.py in catalog`));
    process.exit(1);
  }
  await writeFile(target, scriptBody);
  await chmod(target, 0o755);
  success(
    "hook",
    id,
    target,
    "Add a matching entry under `hooks` in ~/.claude/settings.json for it to fire.",
  );
}

async function installCommand(id: string, force: boolean) {
  await ensureCommandsDir();
  const target = commandInstallPath(id);
  if (existsSync(target) && !force) return abortExists(target);
  await writeFile(target, await loadFile(`catalog/commands/${id}/command.md`));
  success("command", id, target, "Restart Claude Code; the slash command will be available.");
}

async function installTool(id: string, force: boolean) {
  await ensureBinDir();
  const target = toolInstallPath(id);
  if (existsSync(target) && !force) return abortExists(target);

  // Read the manifest to find the exact script filename in the tool dir.
  const manifestText = await loadFile(`catalog/tools/${id}/manifest.json`);
  const manifest = JSON.parse(manifestText) as { runtime?: string };
  // Default entry-file convention matches the importer: original filename.
  // We probe common extensions for the chosen runtime.
  const candidates =
    manifest.runtime === "python"
      ? [`${id}.py`]
      : manifest.runtime === "node"
      ? [`${id}.mjs`, `${id}.js`, `${id}.ts`]
      : [`${id}.sh`, `${id}.bash`];
  let body: string | null = null;
  for (const name of candidates) {
    body = await tryLoadFile(`catalog/tools/${id}/${name}`);
    if (body) break;
  }
  if (!body) {
    console.error(kleur.red(`✗ tool '${id}' source script not found (tried ${candidates.join(", ")})`));
    process.exit(1);
  }
  await writeFile(target, body);
  await chmod(target, 0o755);
  success("tool", id, target, "Ensure ~/.local/bin is on your $PATH.");
}

function success(kind: string, id: string, target: string, hint: string) {
  console.log(kleur.green(`✓ installed ${kind} '${id}'`));
  console.log(kleur.dim(`  → ${target}`));
  console.log(kleur.dim(`  ${hint}`));
}

function abortExists(target: string) {
  console.error(kleur.yellow(`✗ ${target} already exists. Pass --force to overwrite.`));
  process.exit(1);
}

async function loadFile(repoRelPath: string): Promise<string> {
  const localCandidate = resolveLocalCatalogFile(repoRelPath);
  if (localCandidate) return readFile(localCandidate, "utf8");
  return fetchRawFile(repoRelPath);
}

async function tryLoadFile(repoRelPath: string): Promise<string | null> {
  const localCandidate = resolveLocalCatalogFile(repoRelPath);
  if (localCandidate) return readFile(localCandidate, "utf8");
  try {
    return await fetchRawFile(repoRelPath);
  } catch {
    return null;
  }
}

function resolveLocalCatalogFile(repoRelPath: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), repoRelPath),
    path.resolve(process.cwd(), "packages/catalog", repoRelPath),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}
