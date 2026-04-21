import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import kleur from "kleur";
import { loadIndex, fetchRawFile } from "../lib/catalog.js";
import { ensureSkillsDir, skillInstallPath } from "../lib/claude-config.js";

export async function runInstall(args: string[]): Promise<void> {
  const id = args[0];
  if (!id) {
    console.error("Usage: adtl install <skill-id>");
    process.exit(2);
  }
  const index = await loadIndex();
  const entry = index.entries.find((e) => e.kind === "skill" && e.id === id);
  if (!entry) {
    console.error(kleur.red(`✗ no skill with id '${id}'`));
    console.error(kleur.dim("  run `adtl list --kind skill` to see available skills"));
    process.exit(1);
  }

  await ensureSkillsDir();
  const target = skillInstallPath(id);

  if (existsSync(target)) {
    const force = args.includes("--force") || args.includes("-f");
    if (!force) {
      console.error(kleur.yellow(`✗ ${target} already exists. Pass --force to overwrite.`));
      process.exit(1);
    }
  }

  await mkdir(target, { recursive: true });

  // Fetch manifest.json + SKILL.md from remote (or local, if running inside repo).
  const files = ["manifest.json", "SKILL.md"];
  for (const name of files) {
    const content = await loadFile(`catalog/skills/${id}/${name}`);
    await writeFile(path.join(target, name), content);
  }

  console.log(kleur.green(`✓ installed skill '${id}'`));
  console.log(kleur.dim(`  → ${target}`));
  console.log(kleur.dim("  Claude Code picks this up on next session start."));
}

async function loadFile(repoRelPath: string): Promise<string> {
  const localCandidate = path.resolve(process.cwd(), repoRelPath);
  if (existsSync(localCandidate)) return readFile(localCandidate, "utf8");
  return fetchRawFile(repoRelPath);
}
