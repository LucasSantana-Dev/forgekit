/**
 * Import standalone scripts/CLIs from ai-dev-toolkit/packages/core/tools as `tool` kind.
 *
 * Tools live as catalog/tools/<id>/manifest.json + the source script
 * (preserved byte-for-byte under the original filename). Idempotent.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";

const ADT_TOOLS = "/Volumes/External HD/Desenvolvimento/ai-dev-toolkit/packages/core/tools";

function slugify(s: string): string {
  return s.toLowerCase().replace(/\.(sh|py|ps1|mjs|js|ts)$/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function runtimeFor(filename: string): "bash" | "python" | "node" | "other" {
  if (filename.endsWith(".py")) return "python";
  if (filename.endsWith(".sh")) return "bash";
  if (filename.endsWith(".mjs") || filename.endsWith(".js") || filename.endsWith(".ts")) return "node";
  if (filename.endsWith(".ps1")) return "other";
  return "other";
}

function inferCategory(id: string, firstLines: string): string {
  const t = `${id} ${firstLines}`.toLowerCase();
  if (/install|setup/.test(t)) return "setup";
  if (/release|publish/.test(t)) return "release";
  if (/mcp.*(health|doctor)|toggle.*mcp/.test(t)) return "mcp-ops";
  if (/capture|training|record/.test(t)) return "training";
  if (/validate|lint|check/.test(t)) return "diagnostics";
  return "general";
}

function firstHeaderComment(script: string): string {
  // Read the leading comment block (first 20 non-shebang lines).
  const lines = script.split(/\n/).filter((l) => !l.startsWith("#!")).slice(0, 20);
  const comments = lines.filter((l) => /^\s*#/.test(l) || /^\s*\/\//.test(l));
  return comments
    .map((l) => l.replace(/^\s*#\s?/, "").replace(/^\s*\/\/\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function importOne(filename: string, destRoot: string, written: string[], skipped: Array<[string, string]>) {
  if (filename === "README.md") return;
  const srcPath = path.join(ADT_TOOLS, filename);
  const id = slugify(filename);
  const destDir = path.join(destRoot, id);
  if (existsSync(destDir)) return skipped.push([id, "exists"]);

  const raw = await readFile(srcPath, "utf8");
  const hits = scanText(srcPath, raw);
  if (hits.length) {
    console.error(formatFindings(hits));
    return skipped.push([id, `secrets scan (${hits.length})`]);
  }

  const runtime = runtimeFor(filename);
  const header = firstHeaderComment(raw);
  const description = header.slice(0, 480) || `Script: ${filename}`;
  const category = inferCategory(id, header);
  const name = id
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

  await mkdir(destDir, { recursive: true });
  await writeFile(path.join(destDir, filename), raw);
  const manifest = {
    id,
    name,
    description,
    version: "0.1.0",
    tags: ["tool", "ai-dev-toolkit", category].filter(Boolean).slice(0, 8),
    runtime,
    category,
    install: { copy_to: `~/.local/bin/${id}`, chmod_exec: true },
    source: {
      type: "git",
      repo: "https://github.com/LucasSantana-Dev/ai-dev-toolkit",
      ref: "main",
      path: `packages/core/tools/${filename}`,
    },
    homepage: `https://github.com/LucasSantana-Dev/ai-dev-toolkit/blob/main/packages/core/tools/${filename}`,
    license: "MIT",
    author: "Lucas Santana",
  };
  await writeFile(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  written.push(id);
}

async function main() {
  const destRoot = path.join(CATALOG_ROOT, "tools");
  await mkdir(destRoot, { recursive: true });

  if (!existsSync(ADT_TOOLS)) {
    console.error(`source not found: ${ADT_TOOLS}`);
    process.exit(1);
  }

  const files = (await readdir(ADT_TOOLS)).sort();
  const written: string[] = [];
  const skipped: Array<[string, string]> = [];
  for (const f of files) await importOne(f, destRoot, written, skipped);

  console.log(`✅ imported ${written.length} tools`);
  for (const id of written) console.log(`  tool  ${id}`);
  if (skipped.length) {
    console.log(`skipped: ${skipped.length}`);
    for (const [id, r] of skipped) console.log(`  - ${id}: ${r}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
