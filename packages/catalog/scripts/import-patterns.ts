/**
 * Import curated patterns from ai-dev-toolkit/packages/core/patterns/*.md.
 *
 * Allowlist drives classification:
 *   - SKILLS = actionable procedures, installed into ~/.claude/skills/<id>/
 *   - DOCS   = reference material, rendered on the site, no install verb
 *   - anything else is SKIPPED (import on demand later)
 *
 * Idempotent: overwrites on re-run. Safe to re-run after allowlist edits.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";

const SOURCE = process.env.ADT_PATTERNS_DIR
  ?? "/Volumes/External HD/Desenvolvimento/ai-dev-toolkit/packages/core/patterns";

const SKILLS = new Set([
  "prompting-discipline",
  "code-review",
  "testing",
  "agent-gotchas",
  "spec-driven-development",
  "context-building",
  "git-worktrees",
  "task-orchestration",
  "prompt-injection-defense",
  "skill-md-adoption",
]);

const DOCS = new Set([
  "rag-architecture",
  "opentelemetry-genai",
  "cost-aware-routing",
  "llm-evaluation",
  "reasoning-model-prompting",
  "agent-observability",
  "ai-observability",
  "multi-model-routing",
  "benchmark-reality-gap",
  "streaming-orchestration",
]);

function slugOf(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function firstHeading(body: string): string | null {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function firstParagraph(body: string): string {
  // Skip heading and any immediately-following blockquote paragraph(s).
  const withoutHeading = body.replace(/^#[^\n]*\n+/, "");
  const paragraphs = withoutHeading.split(/\n\s*\n/);
  // Find first paragraph that isn't purely a blockquote — blockquotes are
  // usually epigraph-style in these docs and make poor description text.
  const first = paragraphs.find((p) => {
    const trimmed = p.trim();
    if (!trimmed) return false;
    const lines = trimmed.split(/\n/);
    // Skip paragraphs that are pure blockquotes or pure headings.
    if (lines.every((line) => line.startsWith(">"))) return false;
    if (lines.every((line) => /^#{1,6}\s/.test(line))) return false;
    return true;
  }) ?? paragraphs[0] ?? "";
  return first
    .replace(/^>\s*/gm, "") // strip any leading `> ` on remaining lines
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 480);
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function tagsFromContent(slug: string, body: string): string[] {
  const base = new Set<string>(["skill-md"]);
  const lower = body.toLowerCase();
  if (lower.includes("claude")) base.add("claude");
  if (lower.includes("mcp")) base.add("mcp");
  if (/\bprompt/i.test(lower)) base.add("prompting");
  if (/\btest(ing)?\b/.test(lower)) base.add("testing");
  if (/\bsecurity|injection|prompt injection/.test(lower)) base.add("security");
  if (/\bgit\b|worktree/.test(lower)) base.add("git");
  if (/\bagent/i.test(lower)) base.add("agents");
  if (slug.startsWith("agent-")) base.add("agents");
  if (slug.includes("rag")) base.add("rag");
  return Array.from(base).slice(0, 8);
}

async function writeSkill(slug: string, body: string, sourceRel: string) {
  const name = firstHeading(body) ?? titleCase(slug);
  const description = firstParagraph(body) || `${name} — imported from ai-dev-toolkit/packages/core/patterns.`;
  const dir = path.join(CATALOG_ROOT, "skills", slug);
  await mkdir(dir, { recursive: true });

  const skillFrontmatter = matter.stringify(body, {
    name: slug,
    description,
  });
  await writeFile(path.join(dir, "SKILL.md"), skillFrontmatter);

  const manifest = {
    id: slug,
    name,
    description,
    version: "0.1.0",
    tags: tagsFromContent(slug, body),
    editors: ["claude-code", "codex"],
    source: { type: "local", path: sourceRel },
    license: "MIT",
    author: "Lucas Santana",
  };
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

async function writeDoc(slug: string, body: string, sourceRel: string) {
  const title = firstHeading(body) ?? titleCase(slug);
  const description = firstParagraph(body) || `${title} — imported from ai-dev-toolkit/packages/core/patterns.`;
  const dir = path.join(CATALOG_ROOT, "docs");
  await mkdir(dir, { recursive: true });

  const strippedBody = body.replace(/^#[^\n]*\n+/, "").trimStart();
  const doc = matter.stringify(strippedBody, {
    id: slug,
    title,
    description,
    tags: tagsFromContent(slug, body),
    source: { path: sourceRel, license: "MIT" },
  });
  await writeFile(path.join(dir, `${slug}.md`), doc);
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`❌ source not found: ${SOURCE}`);
    process.exit(1);
  }

  const fs = await import("node:fs/promises");
  const files = (await fs.readdir(SOURCE)).filter((f) => f.endsWith(".md")).sort();

  const classified = { skill: [] as string[], doc: [] as string[], skip: [] as string[] };
  const findings: Awaited<ReturnType<typeof scanText>> = [];
  const written: { slug: string; kind: "skill" | "doc" }[] = [];

  for (const file of files) {
    const slug = slugOf(file);
    const kind = SKILLS.has(slug) ? "skill" : DOCS.has(slug) ? "doc" : null;
    if (!kind) {
      classified.skip.push(slug);
      continue;
    }
    classified[kind].push(slug);

    const src = path.join(SOURCE, file);
    const raw = await readFile(src, "utf8");
    // If the source file itself carries frontmatter, strip it for analysis
    // (we generate our own frontmatter on write).
    const { content: body } = matter(raw);
    const hits = scanText(src, body);
    if (hits.length) {
      findings.push(...hits);
      continue;
    }

    const relForManifest = `ai-dev-toolkit/packages/core/patterns/${file}`;
    if (kind === "skill") await writeSkill(slug, body, relForManifest);
    else await writeDoc(slug, body, relForManifest);
    written.push({ slug, kind });
  }

  if (findings.length) {
    console.error("❌ secrets scan BLOCKED import. Fix these before re-running:\n");
    console.error(formatFindings(findings));
    console.error(`\nTotal findings: ${findings.length}`);
    process.exit(1);
  }

  console.log(`✅ imported ${written.length} entries`);
  for (const w of written) console.log(`  ${w.kind.padEnd(6)} ${w.slug}`);
  if (classified.skip.length) {
    console.log(`\nskipped (not in allowlist): ${classified.skip.length}`);
    for (const s of classified.skip) console.log(`  - ${s}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
