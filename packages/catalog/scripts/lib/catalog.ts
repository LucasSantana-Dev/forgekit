import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import matter from "gray-matter";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CATALOG_ROOT = path.join(REPO_ROOT, "catalog");
export const SCHEMAS_ROOT = path.join(REPO_ROOT, "schemas");

export type CatalogKind =
  | "skill"
  | "server"
  | "collection"
  | "doc"
  | "agent"
  | "hook"
  | "command"
  | "tool";

export interface CatalogEntry {
  kind: CatalogKind;
  id: string;
  path: string;
  data: Record<string, unknown>;
}

async function listDirs(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  const dirs: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e);
    if ((await stat(p)).isDirectory()) dirs.push(e);
  }
  return dirs.sort();
}

async function listFiles(dir: string, ext: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  return entries.filter((e) => e.endsWith(ext)).sort();
}

export async function loadSkills(): Promise<CatalogEntry[]> {
  const skillsDir = path.join(CATALOG_ROOT, "skills");
  const out: CatalogEntry[] = [];
  for (const slug of await listDirs(skillsDir)) {
    const manifestPath = path.join(skillsDir, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    out.push({ kind: "skill", id: data.id ?? slug, path: manifestPath, data });
  }
  return out;
}

export async function loadServers(): Promise<CatalogEntry[]> {
  const dir = path.join(CATALOG_ROOT, "servers");
  const out: CatalogEntry[] = [];
  for (const file of await listFiles(dir, ".yaml")) {
    const data = yaml.load(await readFile(path.join(dir, file), "utf8")) as Record<string, unknown>;
    out.push({ kind: "server", id: (data.id as string) ?? file.replace(/\.yaml$/, ""), path: path.join(dir, file), data });
  }
  return out;
}

export async function loadCollections(): Promise<CatalogEntry[]> {
  const dir = path.join(CATALOG_ROOT, "collections");
  const out: CatalogEntry[] = [];
  for (const file of await listFiles(dir, ".yaml")) {
    const data = yaml.load(await readFile(path.join(dir, file), "utf8")) as Record<string, unknown>;
    out.push({ kind: "collection", id: (data.id as string) ?? file.replace(/\.yaml$/, ""), path: path.join(dir, file), data });
  }
  return out;
}

export async function loadDocs(): Promise<CatalogEntry[]> {
  const dir = path.join(CATALOG_ROOT, "docs");
  const out: CatalogEntry[] = [];
  for (const file of await listFiles(dir, ".md")) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const id = (data.id as string) ?? file.replace(/\.md$/, "");
    out.push({ kind: "doc", id, path: path.join(dir, file), data: { ...data, id, body: content } });
  }
  return out;
}

export async function loadAgents(): Promise<CatalogEntry[]> {
  const dir = path.join(CATALOG_ROOT, "agents");
  const out: CatalogEntry[] = [];
  for (const file of await listFiles(dir, ".md")) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const id = (data.id as string) ?? file.replace(/\.md$/, "");
    out.push({ kind: "agent", id, path: path.join(dir, file), data: { ...data, id, body: content } });
  }
  return out;
}

/**
 * Hooks live as `<id>/manifest.json` + `<id>/script.sh` so the shell
 * script can be byte-preserved without being parsed as markdown.
 */
export async function loadHooks(): Promise<CatalogEntry[]> {
  const base = path.join(CATALOG_ROOT, "hooks");
  const out: CatalogEntry[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    out.push({ kind: "hook", id: data.id ?? slug, path: manifestPath, data });
  }
  return out;
}

/**
 * Commands use the same `<id>/` layout as skills: manifest.json +
 * command.md. That keeps auxiliary files (e.g. prompt examples) colocated.
 */
export async function loadCommands(): Promise<CatalogEntry[]> {
  const base = path.join(CATALOG_ROOT, "commands");
  const out: CatalogEntry[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    out.push({ kind: "command", id: data.id ?? slug, path: manifestPath, data });
  }
  return out;
}

/**
 * Tools are `<id>/` directories with manifest.json + a runnable script
 * (varies by runtime — e.g. tool.sh, tool.py). The manifest points at
 * the entry script via its `install.copy_to` or source.path hint.
 */
export async function loadTools(): Promise<CatalogEntry[]> {
  const base = path.join(CATALOG_ROOT, "tools");
  const out: CatalogEntry[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    out.push({ kind: "tool", id: data.id ?? slug, path: manifestPath, data });
  }
  return out;
}

export async function loadAll(): Promise<CatalogEntry[]> {
  const [s, sv, c, d, a, h, cm, t] = await Promise.all([
    loadSkills(),
    loadServers(),
    loadCollections(),
    loadDocs(),
    loadAgents(),
    loadHooks(),
    loadCommands(),
    loadTools(),
  ]);
  return [...s, ...sv, ...c, ...d, ...a, ...h, ...cm, ...t];
}
