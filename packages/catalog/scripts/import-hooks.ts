/**
 * Import shell hooks from ~/.claude/hooks as `hook` kind entries.
 *
 * Each hook lives at catalog/hooks/<id>/manifest.json + script.sh
 * (preserved byte-for-byte). Only imports hooks with a declared event
 * (inferred from filename or the script's header comments) AND that pass
 * a blocking secrets scan.
 *
 * Idempotent.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";

const HOOKS_DIR = process.env.ADT_HOOKS_DIR ?? path.join(os.homedir(), ".claude", "hooks");

// Map filename/prefix → hook event. Unmapped hooks → event: "any".
const EVENT_MAP: Array<[RegExp, string]> = [
  [/^pre-?compact/i, "PreCompact"],
  [/^post-?compact/i, "PostCompact"],
  [/session-?start/i, "SessionStart"],
  [/session-?end/i, "SessionEnd"],
  [/user-?prompt/i, "UserPromptSubmit"],
  [/pre-?tool-?use|validate-?command/i, "PreToolUse"],
  [/post-?tool-?use/i, "PostToolUse"],
  [/^stop\b/i, "Stop"],
  [/subagent/i, "SubagentStop"],
  [/notification/i, "Notification"],
  [/auto-?context-?pack/i, "UserPromptSubmit"],
];

function inferEvent(filename: string): string {
  for (const [re, ev] of EVENT_MAP) if (re.test(filename)) return ev;
  return "any";
}

function slugify(filename: string): string {
  return filename
    .replace(/\.(sh|bash|zsh|py)$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function runtimeFor(filename: string): "bash" | "zsh" | "sh" | "python" {
  if (filename.endsWith(".py")) return "python";
  if (filename.endsWith(".zsh")) return "zsh";
  if (filename.endsWith(".sh")) return "bash";
  return "sh";
}

function firstHeaderComment(script: string): string {
  const lines = script.split(/\n/);
  const comments: string[] = [];
  let started = false;
  for (const line of lines) {
    if (line.startsWith("#!")) continue;
    if (/^\s*#/.test(line)) {
      comments.push(line.replace(/^\s*#\s?/, ""));
      started = true;
      if (comments.length > 30) break;
    } else if (started) break;
  }
  return comments.join(" ").replace(/\s+/g, " ").trim();
}

async function importOne(filename: string, destRoot: string, written: string[], skipped: Array<[string, string]>) {
  // Skip logs, subdirs, non-executable content (we don't own their shape).
  if (filename.endsWith(".log")) return;
  const srcPath = path.join(HOOKS_DIR, filename);
  const s = await stat(srcPath);
  if (s.isDirectory()) {
    // Walk one level into productivity/ quality/ security/ subdirs.
    for (const sub of await readdir(srcPath)) {
      await importOne(`${filename}/${sub}`, destRoot, written, skipped);
    }
    return;
  }
  if (!/\.(sh|bash|zsh|py)$/.test(filename)) return;

  const id = slugify(filename.split("/").pop() ?? filename);
  const destDir = path.join(destRoot, id);
  if (existsSync(destDir)) return skipped.push([id, "exists"]);

  const raw = await readFile(srcPath, "utf8");
  const hits = scanText(srcPath, raw);
  if (hits.length) {
    console.error(formatFindings(hits));
    return skipped.push([id, `secrets scan (${hits.length})`]);
  }

  const description = firstHeaderComment(raw).slice(0, 480) || `Claude Code hook: ${id}`;
  const event = inferEvent(filename);
  const runtime = runtimeFor(filename);
  const name = id
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

  const tags = new Set<string>(["hook", "claude-code"]);
  if (/context|token|compact|compress/.test(id)) tags.add("token-optimization");
  if (/protect|security|secret/.test(id)) tags.add("security");
  if (/validate|check/.test(id)) tags.add("validation");
  if (/orchestr|automation/.test(id)) tags.add("orchestration");

  await mkdir(destDir, { recursive: true });
  const scriptName = `script.${runtime === "python" ? "py" : "sh"}`;
  await writeFile(path.join(destDir, scriptName), raw);
  const manifest = {
    id,
    name,
    description,
    version: "0.1.0",
    tags: Array.from(tags).slice(0, 8),
    event,
    runtime,
    install: { copy_to: `~/.claude/hooks/${id}.sh`, chmod_exec: true },
    source: { type: "local", path: `~/.claude/hooks/${filename}` },
    license: "MIT",
    author: "Lucas Santana",
  };
  await writeFile(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  written.push(id);
}

async function main() {
  const destRoot = path.join(CATALOG_ROOT, "hooks");
  await mkdir(destRoot, { recursive: true });
  if (!existsSync(HOOKS_DIR)) {
    console.error(`source not found: ${HOOKS_DIR}`);
    process.exit(1);
  }

  const files = (await readdir(HOOKS_DIR)).sort();
  const written: string[] = [];
  const skipped: Array<[string, string]> = [];
  for (const f of files) await importOne(f, destRoot, written, skipped);

  console.log(`✅ imported ${written.length} hooks`);
  for (const id of written) console.log(`  hook  ${id}`);
  if (skipped.length) {
    console.log(`skipped: ${skipped.length}`);
    for (const [id, r] of skipped.slice(0, 15)) console.log(`  - ${id}: ${r}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
