/**
 * Import reference material from ai-dev-toolkit as `doc` kind entries.
 *
 * Sources:
 *   - ai-dev-toolkit/packages/core/best-practices/*.md  → tag: best-practice
 *   - ai-dev-toolkit/packages/core/companies/<slug>/README.md + COMPANY.md → tag: persona:<slug>
 *
 * Docs render on the site (`/docs/<id>/`) as reading material — no install
 * verb. Idempotent and additive.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CATALOG_ROOT } from "./lib/catalog.ts";
import { scanText, formatFindings } from "./lib/secrets.ts";

const ADT_ROOT = "/Volumes/External HD/Desenvolvimento/ai-dev-toolkit";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function titleCase(slug: string): string {
  return slug.split("-").map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");
}

function stripFrontmatter(raw: string): string {
  return matter(raw).content.trimStart();
}

function firstPara(body: string): string {
  const paragraphs = stripFrontmatter(body).replace(/^#[^\n]*\n+/, "").split(/\n\s*\n/);
  const first = paragraphs.find((p) => {
    const t = p.trim();
    if (!t) return false;
    const lines = t.split(/\n/);
    if (lines.every((l) => /^#{1,6}\s/.test(l))) return false;
    if (lines.every((l) => l.startsWith(">"))) return false;
    return true;
  }) ?? paragraphs[0] ?? "";
  return first
    .replace(/^>\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 480);
}
function firstHeading(body: string): string | null {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

async function importBestPractice(srcFile: string, destDir: string, written: string[], skipped: Array<[string, string]>) {
  const name = path.basename(srcFile, ".md");
  const id = `best-${slugify(name)}`;
  const outFile = path.join(destDir, `${id}.md`);
  if (existsSync(outFile)) return skipped.push([id, "exists"]);

  const raw = await readFile(srcFile, "utf8");
  const hits = scanText(srcFile, raw);
  if (hits.length) return skipped.push([id, `secrets scan (${hits.length})`]);

  const body = stripFrontmatter(raw);
  const title = firstHeading(body) ?? titleCase(name);
  const description = firstPara(body) || `${title} — best practice from ai-dev-toolkit.`;
  const tags = ["best-practice", "ai-dev-toolkit"];
  if (/security|audit|vuln/i.test(body)) tags.push("security");
  if (/context|token|compact/i.test(body)) tags.push("token-optimization");
  if (/workflow|process/i.test(body)) tags.push("workflow");
  if (/skill-?md|skill stewardship/i.test(body)) tags.push("skill-md");

  const rebuilt = matter.stringify(body, {
    id,
    title,
    description,
    tags: tags.slice(0, 8),
    source: {
      path: `ai-dev-toolkit/packages/core/best-practices/${name}.md`,
      upstream: `https://github.com/LucasSantana-Dev/forgekit/blob/main/packages/core/best-practices/${name}.md`,
      license: "MIT",
    },
  });
  await writeFile(outFile, rebuilt);
  written.push(id);
}

async function importCompany(companyDir: string, destDir: string, written: string[], skipped: Array<[string, string]>) {
  const companyName = path.basename(companyDir);
  const id = `persona-${slugify(companyName)}`;
  const outFile = path.join(destDir, `${id}.md`);
  if (existsSync(outFile)) return skipped.push([id, "exists"]);

  // Stitch COMPANY.md + README.md together — both are short and together
  // paint the persona.
  const parts: string[] = [];
  for (const file of ["COMPANY.md", "README.md"]) {
    const p = path.join(companyDir, file);
    if (!existsSync(p)) continue;
    parts.push(`## ${file.replace(".md", "")}\n\n${stripFrontmatter(await readFile(p, "utf8"))}`);
  }
  if (parts.length === 0) return skipped.push([id, "no COMPANY.md or README.md"]);

  const body = parts.join("\n\n");
  const hits = scanText(companyDir, body);
  if (hits.length) return skipped.push([id, `secrets scan (${hits.length})`]);

  const title = `${titleCase(companyName)} persona`;
  const description = firstPara(body) || `AI dev workflow tailored to the ${companyName.replace(/-/g, " ")} persona.`;

  const rebuilt = matter.stringify(body, {
    id,
    title,
    description,
    tags: ["persona", `persona-${slugify(companyName)}`, "ai-dev-toolkit", "workflow"],
    source: {
      path: `ai-dev-toolkit/packages/core/companies/${companyName}`,
      upstream: `https://github.com/LucasSantana-Dev/forgekit/tree/main/packages/core/companies/${companyName}`,
      license: "MIT",
    },
  });
  await writeFile(outFile, rebuilt);
  written.push(id);
}

async function main() {
  const destDir = path.join(CATALOG_ROOT, "docs");
  await mkdir(destDir, { recursive: true });

  const written: string[] = [];
  const skipped: Array<[string, string]> = [];

  // Best practices
  console.log("▸ ai-dev-toolkit/packages/core/best-practices");
  const bpDir = path.join(ADT_ROOT, "packages", "core", "best-practices");
  if (existsSync(bpDir)) {
    for (const f of (await readdir(bpDir)).filter((f) => f.endsWith(".md")).sort()) {
      await importBestPractice(path.join(bpDir, f), destDir, written, skipped);
    }
  }

  // Companies / personas
  console.log("▸ ai-dev-toolkit/packages/core/companies");
  const compDir = path.join(ADT_ROOT, "packages", "core", "companies");
  if (existsSync(compDir)) {
    for (const e of (await readdir(compDir)).sort()) {
      const full = path.join(compDir, e);
      if (!(await stat(full)).isDirectory()) continue;
      await importCompany(full, destDir, written, skipped);
    }
  }

  console.log(`\n✅ imported ${written.length} docs`);
  for (const id of written) console.log(`  doc  ${id}`);
  if (skipped.length) {
    console.log(`\nskipped: ${skipped.length}`);
    for (const [id, r] of skipped.slice(0, 10)) console.log(`  - ${id}: ${r}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
