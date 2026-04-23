/**
 * Import curated Claude sub-agents from multiple local sources.
 *
 * Agents are single files that install to ~/.claude/agents/<id>.md. Each
 * source's frontmatter is Claude's sub-agent format (name, description,
 * model, level, disallowedTools). We rewrite into catalog/agents/<id>.md
 * with library-standard frontmatter that passes agent.schema.json.
 *
 * Idempotent (refuses to overwrite existing catalog/agents/<id>.md).
 * Blocking secrets scan on every file.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";

interface AgentSource {
  label: string;
  /** Absolute dir containing agent `.md` files (flat) or `<slug>/` dirs. */
  baseDir: string;
  layout: "flat" | "dir";
  /** If set, only import these slugs. Undefined = import all. */
  include?: string[];
  /** Prefix added to library id (avoid collisions). */
  slugPrefix?: string;
  /** Source metadata for manifest.source. */
  sourcePath: string;
  repo?: string;
  extraTags?: string[];
  author: string;
  license: string;
}

const WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function resolveLocalSourceDir(relativePath: string, envVars: string[] = []): string {
  const checkedLocations: string[] = [];
  const normalizedSuffix = `${path.sep}${path.normalize(relativePath)}`;

  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (!value) continue;

    const resolved = path.resolve(value);
    const direct = path.join(resolved, relativePath);
    checkedLocations.push(`${envVar}:${direct}`);
    if (existsSync(direct)) return direct;

    checkedLocations.push(`${envVar}:${resolved}`);
    if (path.normalize(resolved).endsWith(normalizedSuffix) && existsSync(resolved)) {
      return resolved;
    }

    console.warn(
      `[import-agents] ${envVar} did not resolve ${relativePath} ` +
        `(checked ${direct} and ${resolved})`,
    );
  }

  const monorepoSibling = path.resolve(WORKSPACE_ROOT, "..", "dev-assets", relativePath);
  checkedLocations.push(`monorepoSibling:${monorepoSibling}`);
  if (!existsSync(monorepoSibling)) {
    console.warn(
      `[import-agents] Could not resolve ${relativePath}; checked ${checkedLocations.join(", ")}`,
    );
  }

  return monorepoSibling;
}

const SOURCES: AgentSource[] = [
  {
    label: "dev-assets/global/claude/agents",
    baseDir: resolveLocalSourceDir("global/claude/agents", ["FORGE_KIT_DEV_ASSETS_DIR", "DEV_ASSETS_DIR", "DEV_ASSETS_ROOT"]),
    layout: "flat",
    include: [
      "architect",
      "debugger",
      "code-reviewer",
      "test-engineer",
      "executor",
      "git-master",
      "verifier",
      "critic",
      "planner",
      "document-specialist",
    ],
    sourcePath: "dev-assets/global/claude/agents",
    author: "Lucas Santana",
    license: "MIT",
    extraTags: ["agent", "claude-code"],
  },
  {
    label: "ai-dev-toolkit/packages/core/kit/core/agents",
    baseDir: path.join(WORKSPACE_ROOT, "packages/core/kit/core/agents"),
    layout: "dir",
    sourcePath: "ai-dev-toolkit/packages/core/kit/core/agents",
    repo: "https://github.com/LucasSantana-Dev/ai-dev-toolkit",
    author: "Lucas Santana",
    license: "MIT",
    extraTags: ["agent", "claude-code", "ai-dev-toolkit"],
    slugPrefix: "adt-",
  },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function tagsFor(slug: string, description: string, extra: string[] = []): string[] {
  const base = new Set<string>(extra);
  const d = description.toLowerCase();
  if (/review|lint|quality/.test(d)) base.add("review");
  if (/test|qa/.test(d)) base.add("testing");
  if (/debug|regression|root.?cause/.test(d)) base.add("debugging");
  if (/architect|design/.test(d)) base.add("architecture");
  if (/git|branch|worktree/.test(d)) base.add("git");
  if (/plan|strategy/.test(d)) base.add("planning");
  if (/doc|writer|readme/.test(d)) base.add("docs");
  if (/verif|validation|check/.test(d)) base.add("verification");
  if (/critic|critique/.test(d)) base.add("critique");
  if (/execut/.test(d)) base.add("execution");
  if (/database|sql|migration|schema/.test(d)) base.add("database");
  if (/security|audit|vuln/.test(d)) base.add("security");
  if (/systematic|ultrathink|reason/.test(d)) base.add("reasoning");
  return Array.from(base).slice(0, 8);
}

async function listSlugs(src: AgentSource): Promise<string[]> {
  if (!existsSync(src.baseDir)) return [];
  const entries = await readdir(src.baseDir);
  if (src.layout === "flat") {
    return entries.filter((f) => f.endsWith(".md") && f !== "README.md").map((f) => f.replace(/\.md$/, "")).sort();
  }
  const dirs: string[] = [];
  for (const e of entries) {
    const full = path.join(src.baseDir, e);
    if ((await stat(full)).isDirectory()) dirs.push(e);
  }
  return dirs.sort();
}

async function readAgentMd(src: AgentSource, slug: string): Promise<string | null> {
  const p =
    src.layout === "flat"
      ? path.join(src.baseDir, `${slug}.md`)
      : path.join(src.baseDir, slug, "AGENT.md");
  if (!existsSync(p)) {
    // Fallback for dir-layout sources that don't use AGENT.md — try
    // common alternates.
    if (src.layout === "dir") {
      for (const alt of ["agent.md", "README.md", "index.md"]) {
        const p2 = path.join(src.baseDir, slug, alt);
        if (existsSync(p2)) return readFile(p2, "utf8");
      }
    }
    return null;
  }
  return readFile(p, "utf8");
}

async function importOne(src: AgentSource, slug: string, destDir: string): Promise<{ imported: boolean; reason?: string }> {
  const id = src.slugPrefix ? `${src.slugPrefix}${slugify(slug)}` : slugify(slug);
  const outPath = path.join(destDir, `${id}.md`);
  if (existsSync(outPath)) return { imported: false, reason: `catalog/agents/${id}.md exists` };

  const raw = await readAgentMd(src, slug);
  if (!raw) return { imported: false, reason: "no AGENT.md / agent.md / README.md" };

  const scanLabel = src.layout === "flat" ? path.join(src.baseDir, `${slug}.md`) : path.join(src.baseDir, slug);
  const hits = scanText(scanLabel, raw);
  if (hits.length) {
    console.error(formatFindings(hits));
    return { imported: false, reason: `secrets scan hit (${hits.length} findings)` };
  }

  let srcFront: Record<string, unknown> = {};
  let body = raw;
  try {
    const parsed = matter(raw);
    srcFront = parsed.data;
    body = parsed.content;
  } catch (err) {
    return { imported: false, reason: `unparseable frontmatter: ${(err as Error).message.slice(0, 120)}` };
  }
  // Accept description under several common field names used across
  // Claude / Codex / ai-dev-toolkit agent formats.
  const description =
    (srcFront.description as string) ||
    (srcFront.role as string) ||
    (srcFront.purpose as string) ||
    "";
  if (!description) return { imported: false, reason: "missing description/role/purpose in source frontmatter" };
  const name = (srcFront.name as string) || titleCase(id);

  const front: Record<string, unknown> = {
    id,
    name,
    description: description.slice(0, 500),
    version: "0.1.0",
    tags: tagsFor(id, description, src.extraTags),
  };
  if (srcFront.model) front.model = String(srcFront.model);
  if (srcFront.level !== undefined) front.level = Number(srcFront.level);
  if (srcFront.disallowedTools) {
    const dt = srcFront.disallowedTools;
    const arr = Array.isArray(dt)
      ? dt.map(String)
      : String(dt)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    front.disallowed_tools = arr;
  }
  const sourceMeta: Record<string, unknown> = {
    type: src.repo ? "git" : "local",
    path: `${src.sourcePath}/${slug}${src.layout === "flat" ? ".md" : ""}`,
  };
  if (src.repo) sourceMeta.repo = src.repo;
  front.source = sourceMeta;
  front.license = src.license;
  front.author = src.author;

  const rebuilt = matter.stringify(body.trimStart(), front);
  await writeFile(outPath, rebuilt);
  return { imported: true };
}

async function main() {
  const destDir = path.join(CATALOG_ROOT, "agents");
  await mkdir(destDir, { recursive: true });

  let totalImported = 0;
  for (const src of SOURCES) {
    console.log(`\n▸ ${src.label}`);
    let slugs = await listSlugs(src);
    if (src.include) {
      const wanted = new Set(src.include);
      slugs = slugs.filter((s) => wanted.has(s));
    }

    const imported: string[] = [];
    const skipped: Array<[string, string]> = [];
    for (const slug of slugs) {
      const res = await importOne(src, slug, destDir);
      if (res.imported) imported.push(slug);
      else skipped.push([slug, res.reason ?? "?"]);
    }
    totalImported += imported.length;
    console.log(`  ✓ ${imported.length} imported, ${skipped.length} skipped`);
    for (const s of imported) console.log(`    agent  ${s}`);
    for (const [s, r] of skipped.slice(0, 6)) console.log(`    - ${s}: ${r}`);
    if (skipped.length > 6) console.log(`    … ${skipped.length - 6} more`);
  }

  console.log(`\n✅ total imported: ${totalImported}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
