/**
 * Generalized skill importer: pulls SKILL.md entries from curated upstream
 * repos that follow the `<base-path>/<slug>/SKILL.md` layout (the convention
 * used by anthropics/skills and most community skill collections).
 *
 * Sources are declared below. Each yields one catalog entry per subdirectory
 * that contains a valid SKILL.md with frontmatter.description. Idempotent:
 * refuses to overwrite existing catalog/skills/<id>/.
 *
 * Add a new source = append a UpstreamSource to SOURCES and re-run. The
 * secrets scan still runs on every imported file and is blocking.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";
import { listDirs, rawText } from "./lib/gh.ts";

interface UpstreamSource {
  /** Stable label used in logs and defaults for tags/author. */
  label: string;
  owner: string;
  repo: string;
  /** Git ref to pull from (branch or tag). */
  ref: string;
  /** Repo-relative path to the dir that contains `<slug>/SKILL.md` children. */
  basePath: string;
  /** SPDX identifier of the upstream license. */
  license: string;
  /** Human author/owner label baked into manifest.json. */
  author: string;
  /** Extra tags to prepend on every imported skill. */
  extraTags?: string[];
  /** Optional allowlist of slugs to import; empty/undefined → import all. */
  include?: string[];
  /** Optional denylist of slugs to skip. */
  exclude?: string[];
  /** Prefix added to the library's id when a collision would otherwise occur. */
  slugPrefix?: string;
}

const SOURCES: UpstreamSource[] = [
  {
    label: "anthropics/skills",
    owner: "anthropics",
    repo: "skills",
    ref: "main",
    basePath: "skills",
    license: "MIT",
    author: "Anthropic",
    extraTags: ["skill-md", "anthropic-official"],
  },
  {
    label: "obra/superpowers",
    owner: "obra",
    repo: "superpowers",
    ref: "main",
    basePath: "skills",
    license: "MIT",
    author: "obra",
    extraTags: ["skill-md", "community", "superpowers"],
  },
  {
    label: "alirezarezvani/claude-skills/engineering",
    owner: "alirezarezvani",
    repo: "claude-skills",
    ref: "main",
    basePath: "engineering",
    license: "MIT",
    author: "alirezarezvani",
    extraTags: ["skill-md", "community", "engineering"],
    slugPrefix: "eng-",
    // Engineering dir has 30+ entries — cap at an opinionated starter set
    // so initial import stays reviewable. Expand by clearing `include`.
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
    [/mcp|server|builder/, "mcp"],
    [/web ?app|frontend|react|vue/, "webapp"],
    [/test(ing)?|qa|coverage/, "testing"],
    [/art|design|canvas|image|gif|theme|brand/, "design"],
    [/slack|internal|comm/, "comms"],
    [/api|rest|graphql/, "api"],
    [/debug|error|trace|stack/, "debugging"],
    [/git|branch|worktree|pr/, "git"],
    [/plan|architect|strategy/, "planning"],
    [/security|audit|secret/, "security"],
    [/db|database|postgres|mongo|schema/, "database"],
    [/docker|container|k8s|kubernetes/, "infra"],
    [/deploy|release|ship|ci|cd/, "deploy"],
  ];
  for (const [re, t] of rules) if (re.test(text)) tags.add(t);
  return Array.from(tags).slice(0, 8);
}

async function importOne(src: UpstreamSource, slug: string, destRoot: string): Promise<{ imported: boolean; reason?: string }> {
  const id = src.slugPrefix ? `${src.slugPrefix}${slugify(slug)}` : slugify(slug);
  const destDir = path.join(destRoot, id);
  if (existsSync(destDir)) return { imported: false, reason: `catalog/skills/${id}/ exists` };

  const skillMdPath = `${src.basePath}/${slug}/SKILL.md`;
  const raw = await rawText(src.owner, src.repo, skillMdPath, src.ref);
  if (!raw) return { imported: false, reason: `no SKILL.md at ${skillMdPath}` };

  const hits = scanText(`${src.owner}/${src.repo}:${skillMdPath}`, raw);
  if (hits.length) {
    console.error(formatFindings(hits));
    return { imported: false, reason: `secrets scan hit (${hits.length} findings)` };
  }

  const { data: fm } = matter(raw);
  const description = typeof fm.description === "string" ? fm.description : "";
  if (!description) return { imported: false, reason: "SKILL.md missing frontmatter.description" };
  const nameField = typeof fm.name === "string" && fm.name !== slug ? fm.name : "";
  const name = nameField || titleCase(id);
  const tags = inferTags(id, description, src.extraTags);

  await mkdir(destDir, { recursive: true });
  // Preserve upstream SKILL.md byte-for-byte so the author's content is untouched.
  await writeFile(path.join(destDir, "SKILL.md"), raw);
  const manifest = {
    id,
    name,
    description: description.slice(0, 500),
    version: "0.1.0",
    tags,
    editors: ["claude-code"],
    source: {
      type: "git" as const,
      repo: `https://github.com/${src.owner}/${src.repo}`,
      ref: src.ref,
      path: skillMdPath,
    },
    homepage: `https://github.com/${src.owner}/${src.repo}/tree/${src.ref}/${src.basePath}/${slug}`,
    license: src.license,
    author: src.author,
  };
  await writeFile(path.join(destDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return { imported: true };
}

async function main() {
  const destRoot = path.join(CATALOG_ROOT, "skills");
  await mkdir(destRoot, { recursive: true });

  const all: Record<string, { imported: string[]; skipped: Array<[string, string]> }> = {};

  for (const src of SOURCES) {
    console.log(`\n▸ ${src.label}`);
    all[src.label] = { imported: [], skipped: [] };
    let slugs: string[];
    try {
      slugs = await listDirs(src.owner, src.repo, src.basePath, src.ref);
    } catch (err) {
      console.error(`  ✗ could not list: ${(err as Error).message}`);
      all[src.label].skipped.push([src.basePath, (err as Error).message]);
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

    for (const slug of slugs) {
      const result = await importOne(src, slug, destRoot);
      if (result.imported) all[src.label].imported.push(slug);
      else all[src.label].skipped.push([slug, result.reason ?? "unknown"]);
    }

    console.log(`  ✓ ${all[src.label].imported.length} imported, ${all[src.label].skipped.length} skipped`);
    for (const id of all[src.label].imported) console.log(`    skill  ${id}`);
    if (all[src.label].skipped.length) {
      for (const [id, reason] of all[src.label].skipped.slice(0, 20)) {
        console.log(`    - ${id}: ${reason}`);
      }
      if (all[src.label].skipped.length > 20) {
        console.log(`    … ${all[src.label].skipped.length - 20} more`);
      }
    }
  }

  const total = Object.values(all).reduce((n, s) => n + s.imported.length, 0);
  console.log(`\n✅ total imported: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
