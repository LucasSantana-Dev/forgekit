#!/usr/bin/env node
/**
 * backfill-provider.mjs
 *
 * Assigns the `provider` field to every catalog entry that is missing it,
 * using tag-based promotion rules.  Supports --dry-run for a preview.
 *
 * Promotion rules (first match wins):
 *   tag codex               → codex
 *   tag gemini              → gemini
 *   tag cursor              → cursor
 *   tag ollama | vllm | lm-studio | local-llm → local
 *   all other skill/agent/hook/tool/server    → claude
 *   server (MCP — remote by nature)           → claude  (same default)
 *
 * Usage:
 *   node packages/catalog/scripts/backfill-provider.mjs [--dry-run]
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_ROOT = path.resolve(__dirname, "../catalog");

const DRY_RUN = process.argv.includes("--dry-run");

if (DRY_RUN) console.log("🔍  Dry-run mode — no files will be written.\n");

// ---------------------------------------------------------------------------
// Provider resolution
// ---------------------------------------------------------------------------

const LOCAL_TAGS = new Set(["ollama", "vllm", "lm-studio", "local-llm"]);

function resolveProvider(tags = []) {
  if (tags.includes("codex")) return "codex";
  if (tags.includes("gemini")) return "gemini";
  if (tags.includes("cursor")) return "cursor";
  if (tags.some((t) => LOCAL_TAGS.has(t))) return "local";
  return "claude";
}

// ---------------------------------------------------------------------------
// JSON manifest helpers (skills, hooks, tools)
// ---------------------------------------------------------------------------

async function processJsonManifest(filePath) {
  const raw = await readFile(filePath, "utf8");
  const data = JSON.parse(raw);

  if (data.provider) return { path: filePath, action: "skip", provider: data.provider };

  const provider = resolveProvider(data.tags ?? []);

  if (!DRY_RUN) {
    // Insert `provider` right after `tags` for consistent key ordering.
    const entries = Object.entries(data);
    const tagsIdx = entries.findIndex(([k]) => k === "tags");
    const insertAt = tagsIdx >= 0 ? tagsIdx + 1 : entries.length;
    entries.splice(insertAt, 0, ["provider", provider]);
    const updated = Object.fromEntries(entries);
    await writeFile(filePath, JSON.stringify(updated, null, 2) + "\n", "utf8");
  }

  return { path: filePath, action: "set", provider };
}

// ---------------------------------------------------------------------------
// YAML server helper  (*.yaml — simple hand-rolled insertion, no dep needed)
// ---------------------------------------------------------------------------

async function processYamlServer(filePath) {
  const raw = await readFile(filePath, "utf8");

  // Check if provider already set.
  if (/^provider:/m.test(raw)) {
    const m = raw.match(/^provider:\s*(.+)$/m);
    return { path: filePath, action: "skip", provider: m?.[1]?.trim() ?? "?" };
  }

  // Extract tags — items may be indented (e.g. "  - tag") or at column 0.
  const tagsBlockMatch = raw.match(/^tags:\n((?:[ \t]*- .+\n?)+)/m);
  const tags = tagsBlockMatch
    ? [...tagsBlockMatch[1].matchAll(/- (.+)/g)].map((m) => m[1].trim())
    : [];

  const provider = resolveProvider(tags);

  if (!DRY_RUN) {
    // Insert `provider: <value>` after the `tags:` block.
    const updated = raw.replace(
      /(^tags:\n(?:[ \t]*- .+\n?)+)/m,
      `$1provider: ${provider}\n`
    );
    await writeFile(filePath, updated, "utf8");
  }

  return { path: filePath, action: "set", provider };
}

// ---------------------------------------------------------------------------
// Markdown frontmatter helper (agents — *.md with YAML front-matter)
// ---------------------------------------------------------------------------

async function processMarkdownAgent(filePath) {
  const raw = await readFile(filePath, "utf8");

  if (!raw.startsWith("---")) {
    return { path: filePath, action: "skip", provider: null, note: "no frontmatter" };
  }

  const endIdx = raw.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { path: filePath, action: "skip", provider: null, note: "unclosed frontmatter" };
  }

  const frontmatter = raw.slice(3, endIdx);
  const rest = raw.slice(endIdx); // includes the closing ---

  // Already set?
  if (/^provider:/m.test(frontmatter)) {
    const m = frontmatter.match(/^provider:\s*(.+)$/m);
    return { path: filePath, action: "skip", provider: m?.[1]?.trim() ?? "?" };
  }

  // Extract tags.
  const tagsBlockMatch = frontmatter.match(/^tags:\n((?:[ \t]*- .+\n?)+)/m);
  const tags = tagsBlockMatch
    ? [...tagsBlockMatch[1].matchAll(/- (.+)/g)].map((m) => m[1].trim())
    : [];

  const provider = resolveProvider(tags);

  if (!DRY_RUN) {
    // Insert after the tags block (or at end of frontmatter if no tags block).
    let updatedFrontmatter;
    if (tagsBlockMatch) {
      updatedFrontmatter = frontmatter.replace(
        /(^tags:\n(?:[ \t]*- .+\n?)+)/m,
        `$1provider: ${provider}\n`
      );
    } else {
      updatedFrontmatter = frontmatter.trimEnd() + `\nprovider: ${provider}\n`;
    }
    await writeFile(filePath, `---${updatedFrontmatter}${rest}`, "utf8");
  }

  return { path: filePath, action: "set", provider };
}

// ---------------------------------------------------------------------------
// Directory scanners
// ---------------------------------------------------------------------------

async function scanSkills() {
  const dir = path.join(CATALOG_ROOT, "skills");
  const entries = await readdir(dir);
  return Promise.all(
    entries.map((id) => processJsonManifest(path.join(dir, id, "manifest.json")))
  );
}

async function scanHooks() {
  const dir = path.join(CATALOG_ROOT, "hooks");
  const entries = await readdir(dir);
  return Promise.all(
    entries.map((id) => processJsonManifest(path.join(dir, id, "manifest.json")))
  );
}

async function scanTools() {
  const dir = path.join(CATALOG_ROOT, "tools");
  const entries = await readdir(dir);
  const results = [];
  for (const id of entries) {
    const manifestPath = path.join(dir, id, "manifest.json");
    if (existsSync(manifestPath)) {
      results.push(await processJsonManifest(manifestPath));
    }
  }
  return results;
}

async function scanServers() {
  const dir = path.join(CATALOG_ROOT, "servers");
  const files = await readdir(dir);
  return Promise.all(
    files
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => processYamlServer(path.join(dir, f)))
  );
}

async function scanAgents() {
  const dir = path.join(CATALOG_ROOT, "agents");
  const files = await readdir(dir);
  return Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map((f) => processMarkdownAgent(path.join(dir, f)))
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [skills, hooks, tools, servers, agents] = await Promise.all([
    scanSkills(),
    scanHooks(),
    scanTools(),
    scanServers(),
    scanAgents(),
  ]);

  const all = [...skills, ...hooks, ...tools, ...servers, ...agents];

  const set = all.filter((r) => r.action === "set");
  const skipped = all.filter((r) => r.action === "skip");

  // Print set results grouped by provider.
  const byProvider = {};
  for (const r of set) {
    (byProvider[r.provider] ??= []).push(r.path.replace(CATALOG_ROOT + "/", ""));
  }

  for (const [provider, paths] of Object.entries(byProvider).sort()) {
    console.log(`\n${DRY_RUN ? "Would set" : "Set"} provider=${provider} (${paths.length}):`);
    for (const p of paths) console.log(`  ${p}`);
  }

  console.log(`\n✅  ${DRY_RUN ? "Would update" : "Updated"} ${set.length} entries.`);
  console.log(`⏭️   Skipped ${skipped.length} entries (already have provider).`);

  if (!DRY_RUN && set.length > 0) {
    console.log("\nRun `pnpm catalog:validate` to confirm 0 provider warnings.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
