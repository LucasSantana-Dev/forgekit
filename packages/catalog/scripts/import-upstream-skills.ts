/**
 * Generalized skill importer.
 *
 * Handles four axes of variation:
 *   1. Location — remote (owner/repo/ref + GitHub raw) OR local (absolute path).
 *   2. Layout — "dir" (`<base>/<slug>/SKILL.md`) OR "flat" (`<base>/<slug>.md`).
 *   3. Selection — optional include/exclude slug lists.
 *   4. Naming — optional slugPrefix to avoid collisions across sources.
 *
 * Idempotent + additive: refuses to overwrite an existing
 * catalog/skills/<id>/. Secrets scan is blocking.
 */
import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";
import { listDirs as ghListDirs, rawText as ghRawText } from "./lib/gh.ts";

type Layout = "dir" | "flat";

interface RemoteSource {
  label: string;
  location: "remote";
  owner: string;
  repo: string;
  ref: string;
  basePath: string;
  layout: Layout;
  license: string;
  author: string;
  extraTags?: string[];
  include?: string[];
  exclude?: string[];
  slugPrefix?: string;
}

interface LocalSource {
  label: string;
  location: "local";
  /** Absolute filesystem path to the base dir holding children. */
  baseDir: string;
  layout: Layout;
  license: string;
  author: string;
  /** Public homepage to link from the manifest. */
  homepageBase?: string;
  /** Recorded in manifest.source when set. */
  repo?: string;
  ref?: string;
  extraTags?: string[];
  include?: string[];
  exclude?: string[];
  slugPrefix?: string;
}

type Source = RemoteSource | LocalSource;

const ADT_ROOT = "/Volumes/External HD/Desenvolvimento/ai-dev-toolkit";

const SOURCES: Source[] = [
  {
    label: "anthropics/skills",
    location: "remote",
    owner: "anthropics",
    repo: "skills",
    ref: "main",
    basePath: "skills",
    layout: "dir",
    license: "MIT",
    author: "Anthropic",
    extraTags: ["skill-md", "anthropic-official"],
  },
  {
    label: "obra/superpowers",
    location: "remote",
    owner: "obra",
    repo: "superpowers",
    ref: "main",
    basePath: "skills",
    layout: "dir",
    license: "MIT",
    author: "obra",
    extraTags: ["skill-md", "community", "superpowers"],
  },
  {
    label: "alirezarezvani/claude-skills/engineering",
    location: "remote",
    owner: "alirezarezvani",
    repo: "claude-skills",
    ref: "main",
    basePath: "engineering",
    layout: "dir",
    license: "MIT",
    author: "alirezarezvani",
    extraTags: ["skill-md", "community", "engineering"],
    slugPrefix: "eng-",
    include: [
      "api-design-reviewer",
      "api-test-suite-builder",
      "ci-cd-pipeline-builder",
      "code-tour",
      "codebase-onboarding",
      "database-designer",
      "dependency-auditor",
      "docker-development",
      "env-secrets-manager",
      "focused-fix",
      "git-worktree-manager",
      "mcp-server-builder",
    ],
  },
  // ---------- ai-dev-toolkit (local) ----------
  {
    label: "ai-dev-toolkit/packages/core/kit/core/skills",
    location: "local",
    baseDir: path.join(ADT_ROOT, "packages", "core", "kit", "core", "skills"),
    layout: "flat",
    license: "MIT",
    author: "Lucas Santana",
    homepageBase: "https://github.com/LucasSantana-Dev/ai-dev-toolkit/tree/main/packages/core/kit/core/skills",
    repo: "https://github.com/LucasSantana-Dev/ai-dev-toolkit",
    ref: "main",
    extraTags: ["skill-md", "ai-dev-toolkit", "core"],
    slugPrefix: "adt-",
  },
  {
    label: "ai-dev-toolkit/packages/core/kit/specs/skills",
    location: "local",
    baseDir: path.join(ADT_ROOT, "packages", "core", "kit", "specs", "skills"),
    layout: "dir",
    license: "MIT",
    author: "Lucas Santana",
    homepageBase: "https://github.com/LucasSantana-Dev/ai-dev-toolkit/tree/main/packages/core/kit/specs/skills",
    repo: "https://github.com/LucasSantana-Dev/ai-dev-toolkit",
    ref: "main",
    extraTags: ["skill-md", "ai-dev-toolkit", "specs", "spec-driven"],
    slugPrefix: "adt-specs-",
  },
  {
    label: "ai-dev-toolkit/packages/core/kit/rag/skills",
    location: "local",
    baseDir: path.join(ADT_ROOT, "packages", "core", "kit", "rag", "skills"),
    layout: "dir",
    license: "MIT",
    author: "Lucas Santana",
    homepageBase: "https://github.com/LucasSantana-Dev/ai-dev-toolkit/tree/main/packages/core/kit/rag/skills",
    repo: "https://github.com/LucasSantana-Dev/ai-dev-toolkit",
    ref: "main",
    extraTags: ["skill-md", "ai-dev-toolkit", "rag"],
    slugPrefix: "adt-rag-",
  },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function inferTags(slug: string, description: string, extra: string[] = []): string[] {
  const tags = new Set<string>(extra);
  const text = `${slug} ${description}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/pdf|docx|xlsx|pptx|document/, "documents"],
    [/mcp|builder/, "mcp"],
    [/web ?app|frontend|react|vue/, "webapp"],
    [/test(ing)?|qa|coverage/, "testing"],
    [/art|design|canvas|image|gif|theme|brand/, "design"],
    [/slack|internal|comm/, "comms"],
    [/api|rest|graphql/, "api"],
    [/debug|error|trace|stack/, "debugging"],
    [/git|branch|worktree|pr/, "git"],
    [/plan|architect|strategy/, "planning"],
    [/security|audit|secret|injection/, "security"],
    [/db|database|postgres|mongo|schema/, "database"],
    [/docker|container|k8s|kubernetes/, "infra"],
    [/deploy|release|ship|ci|cd/, "deploy"],
    [/rag|retriev|embed/, "rag"],
    [/token|cost|context|compact|compress/, "token-optimization"],
    [/observab|trace|otel|metric/, "observability"],
    [/eval|bench|regression/, "evaluation"],
    [/memory|recall|knowledge/, "memory"],
    [/loop|orchestrat|dispatch|fan.?out/, "orchestration"],
  ];
  for (const [re, t] of rules) if (re.test(text)) tags.add(t);
  return Array.from(tags).slice(0, 8);
}

/** Enumerate slugs in a source (either dir entries or md files). */
async function listSlugs(src: Source): Promise<string[]> {
  if (src.location === "remote") {
    // Remote: only 'dir' layout is supported for listing (GitHub raw doesn't
    // expose dir contents without hitting the API per-path). Flat-remote
    // would need an explicit include list.
    if (src.layout === "flat") {
      if (!src.include) throw new Error("flat remote sources require an include list");
      return src.include;
    }
    return ghListDirs(src.owner, src.repo, src.basePath, src.ref);
  }
  if (!existsSync(src.baseDir)) return [];
  const entries = await readdir(src.baseDir);
  if (src.layout === "dir") {
    const out: string[] = [];
    for (const e of entries) {
      const full = path.join(src.baseDir, e);
      if ((await stat(full)).isDirectory()) out.push(e);
    }
    return out.sort();
  }
  // flat layout — each <slug>.md is one skill
  return entries.filter((f) => f.endsWith(".md") && f !== "README.md").map((f) => f.replace(/\.md$/, "")).sort();
}

/** Fetch the raw SKILL.md text for a given (source, slug). */
async function readSkillMd(src: Source, slug: string): Promise<{ raw: string; pathHint: string } | null> {
  if (src.location === "remote") {
    const pathHint = src.layout === "dir" ? `${src.basePath}/${slug}/SKILL.md` : `${src.basePath}/${slug}.md`;
    const raw = await ghRawText(src.owner, src.repo, pathHint, src.ref);
    return raw ? { raw, pathHint } : null;
  }
  const localPath =
    src.layout === "dir" ? path.join(src.baseDir, slug, "SKILL.md") : path.join(src.baseDir, `${slug}.md`);
  if (!existsSync(localPath)) return null;
  const relHint = path.relative(path.dirname(src.baseDir.split("/").slice(0, -2).join("/")), localPath);
  return { raw: await readFile(localPath, "utf8"), pathHint: relHint };
}

async function importOne(src: Source, slug: string, destRoot: string): Promise<{ imported: boolean; reason?: string }> {
  const id = src.slugPrefix ? `${src.slugPrefix}${slugify(slug)}` : slugify(slug);
  const destDir = path.join(destRoot, id);
  if (existsSync(destDir)) return { imported: false, reason: `catalog/skills/${id}/ exists` };

  const fetched = await readSkillMd(src, slug);
  if (!fetched) return { imported: false, reason: `no SKILL.md for ${slug}` };

  const scanLabel = src.location === "remote" ? `${src.owner}/${src.repo}:${fetched.pathHint}` : fetched.pathHint;
  const hits = scanText(scanLabel, fetched.raw);
  if (hits.length) {
    console.error(formatFindings(hits));
    return { imported: false, reason: `secrets scan hit (${hits.length} findings)` };
  }

  let fm: Record<string, unknown> = {};
  try {
    const parsed = matter(fetched.raw);
    fm = parsed.data as Record<string, unknown>;
  } catch (err) {
    return { imported: false, reason: `unparseable frontmatter: ${(err as Error).message.slice(0, 120)}` };
  }
  const description = typeof fm.description === "string" ? fm.description : "";
  if (!description) return { imported: false, reason: "SKILL.md missing frontmatter.description" };
  const nameField = typeof fm.name === "string" && fm.name !== slug ? fm.name : "";
  const name = nameField || titleCase(id);
  const tags = inferTags(id, description, src.extraTags);

  await mkdir(destDir, { recursive: true });
  await writeFile(path.join(destDir, "SKILL.md"), fetched.raw);

  const manifest: Record<string, unknown> = {
    id,
    name,
    description: description.slice(0, 500),
    version: "0.1.0",
    tags,
    editors: ["claude-code"],
    source: buildSource(src, slug, fetched.pathHint),
    license: src.license,
    author: src.author,
  };
  const homepage =
    src.location === "remote"
      ? `https://github.com/${src.owner}/${src.repo}/tree/${src.ref}/${src.basePath}/${slug}${src.layout === "flat" ? ".md" : ""}`
      : src.homepageBase
      ? `${src.homepageBase}/${slug}${src.layout === "flat" ? ".md" : ""}`
      : undefined;
  if (homepage) manifest.homepage = homepage;
  await writeFile(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return { imported: true };
}

function buildSource(src: Source, slug: string, pathHint: string): Record<string, unknown> {
  if (src.location === "remote") {
    return {
      type: "git",
      repo: `https://github.com/${src.owner}/${src.repo}`,
      ref: src.ref,
      path: pathHint,
    };
  }
  return {
    type: src.repo ? ("git" as const) : ("local" as const),
    ...(src.repo ? { repo: src.repo } : {}),
    ...(src.ref ? { ref: src.ref } : {}),
    path: pathHint,
  };
}

async function main() {
  const destRoot = path.join(CATALOG_ROOT, "skills");
  await mkdir(destRoot, { recursive: true });

  let totalImported = 0;
  for (const src of SOURCES) {
    console.log(`\n▸ ${src.label}`);
    let slugs: string[];
    try {
      slugs = await listSlugs(src);
    } catch (err) {
      console.error(`  ✗ could not list: ${(err as Error).message}`);
      continue;
    }
    if (src.include) {
      const wanted = new Set(src.include);
      slugs = slugs.filter((s) => wanted.has(s));
    }
    if (src.exclude) {
      const unwanted = new Set(src.exclude);
      slugs = slugs.filter((s) => !unwanted.has(s));
    }

    const imported: string[] = [];
    const skipped: Array<[string, string]> = [];
    for (const slug of slugs) {
      const result = await importOne(src, slug, destRoot);
      if (result.imported) imported.push(slug);
      else skipped.push([slug, result.reason ?? "unknown"]);
    }
    totalImported += imported.length;

    console.log(`  ✓ ${imported.length} imported, ${skipped.length} skipped`);
    for (const id of imported) console.log(`    skill  ${id}`);
    for (const [id, reason] of skipped.slice(0, 8)) console.log(`    - ${id}: ${reason}`);
    if (skipped.length > 8) console.log(`    … ${skipped.length - 8} more skipped`);
  }

  console.log(`\n✅ total imported: ${totalImported}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
