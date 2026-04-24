import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import matter from "gray-matter";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../../..");
const CATALOG = path.join(REPO_ROOT, "packages/catalog/catalog");

export type Kind = "skill" | "server" | "collection" | "doc" | "agent" | "hook" | "command" | "tool";
export type CollectionItemKind = Exclude<Kind, "collection">;

export interface CollectionItem {
  kind: CollectionItemKind;
  id: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version?: string;
  tags: string[];
  editors?: string[];
  source?: { path?: string; repo?: string };
  homepage?: string;
  license?: string;
  body: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export interface Server {
  id: string;
  name: string;
  description: string;
  transport: string;
  command?: string;
  args?: string[];
  url?: string;
  env?: Array<{ name: string; description?: string; required?: boolean; default?: string }>;
  tags: string[];
  homepage?: string;
  license?: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
  tags?: string[];
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export const COLLECTION_ITEM_ROUTES: Record<CollectionItemKind, string> = {
  skill: "skills",
  server: "servers",
  doc: "docs",
  agent: "agents",
  hook: "hooks",
  command: "commands",
  tool: "tools",
};

export function collectionItemPath(item: CollectionItem): string {
  return `${COLLECTION_ITEM_ROUTES[item.kind]}/${encodeURIComponent(item.id)}/`;
}

export interface CatalogData {
  skills: Skill[];
  servers: Server[];
  docs: Doc[];
  agents: Agent[];
  hooks: Hook[];
  commands: Command[];
  tools: Tool[];
}

export interface Doc {
  id: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  source?: { path?: string; upstream?: string; license?: string };
  translations?: { "pt-BR"?: { title?: string; description?: string } };
}

async function listFiles(dir: string, ext: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const { readdir } = await import("node:fs/promises");
  return (await readdir(dir)).filter((f) => f.endsWith(ext)).sort();
}

async function listDirs(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const { readdir, stat } = await import("node:fs/promises");
  const entries = await readdir(dir);
  const out: string[] = [];
  for (const e of entries) {
    if ((await stat(path.join(dir, e))).isDirectory()) out.push(e);
  }
  return out.sort();
}

export async function getSkills(): Promise<Skill[]> {
  const dir = path.join(CATALOG, "skills");
  const out: Skill[] = [];
  for (const slug of await listDirs(dir)) {
    const mPath = path.join(dir, slug, "manifest.json");
    const sPath = path.join(dir, slug, "SKILL.md");
    if (!existsSync(mPath)) continue;
    const manifest = JSON.parse(await readFile(mPath, "utf8")) as Omit<Skill, "body">;
    const body = existsSync(sPath) ? matter(await readFile(sPath, "utf8")).content : "";
    out.push({ ...manifest, body });
  }
  return out;
}

export async function getServers(): Promise<Server[]> {
  const dir = path.join(CATALOG, "servers");
  const out: Server[] = [];
  for (const file of await listFiles(dir, ".yaml")) {
    const data = yaml.load(await readFile(path.join(dir, file), "utf8")) as Server;
    out.push(data);
  }
  return out;
}

export async function getCollections(): Promise<Collection[]> {
  const dir = path.join(CATALOG, "collections");
  const out: Collection[] = [];
  for (const file of await listFiles(dir, ".yaml")) {
    out.push(yaml.load(await readFile(path.join(dir, file), "utf8")) as Collection);
  }
  return out;
}

export async function getDocs(): Promise<Doc[]> {
  const dir = path.join(CATALOG, "docs");
  const out: Doc[] = [];
  for (const file of await listFiles(dir, ".md")) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    out.push({ ...(data as Omit<Doc, "body">), body: content });
  }
  return out;
}

let catalogDataPromise: Promise<CatalogData> | null = null;

export async function getCatalogData(): Promise<CatalogData> {
  catalogDataPromise ??= (async () => {
    const [skills, servers, docs, agents, hooks, commands, tools] = await Promise.all([
      getSkills(),
      getServers(),
      getDocs(),
      getAgents(),
      getHooks(),
      getCommands(),
      getTools(),
    ]);
    return { skills, servers, docs, agents, hooks, commands, tools };
  })();
  return catalogDataPromise;
}

export interface ResolvedCollectionItem {
  kind: CollectionItemKind;
  id: string;
  name: string;
  description: string;
  href: string;
}

type NamedEntry = { id: string; name?: string; title?: string; description: string };

interface CatalogLike {
  skills: NamedEntry[];
  servers: NamedEntry[];
  docs: NamedEntry[];
  agents: NamedEntry[];
  hooks: NamedEntry[];
  commands: NamedEntry[];
  tools: NamedEntry[];
}

export function buildCollectionItemResolver(
  catalog: CatalogLike,
  hrefFor: (item: CollectionItem) => string,
): (item: CollectionItem) => ResolvedCollectionItem {
  const maps: Record<CollectionItemKind, Map<string, NamedEntry>> = {
    skill: new Map(catalog.skills.map((e) => [e.id, e])),
    server: new Map(catalog.servers.map((e) => [e.id, e])),
    doc: new Map(catalog.docs.map((e) => [e.id, e])),
    agent: new Map(catalog.agents.map((e) => [e.id, e])),
    hook: new Map(catalog.hooks.map((e) => [e.id, e])),
    command: new Map(catalog.commands.map((e) => [e.id, e])),
    tool: new Map(catalog.tools.map((e) => [e.id, e])),
  };
  return (item) => {
    const entry = maps[item.kind].get(item.id);
    return {
      kind: item.kind,
      id: item.id,
      name: entry?.name ?? entry?.title ?? item.id,
      description: entry?.description ?? "",
      href: hrefFor(item),
    };
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  model?: string;
  level?: number;
  disallowed_tools?: string[];
  source?: { path?: string; repo?: string };
  homepage?: string;
  license?: string;
  body: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export async function getAgents(): Promise<Agent[]> {
  const dir = path.join(CATALOG, "agents");
  const out: Agent[] = [];
  for (const file of await listFiles(dir, ".md")) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    out.push({ ...(data as Omit<Agent, "body">), body: content });
  }
  return out;
}

export interface Hook {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  event: string;
  matcher?: string;
  runtime: string;
  install?: { copy_to?: string; chmod_exec?: boolean };
  source?: { type?: string; path?: string; repo?: string };
  license?: string;
  author?: string;
  script: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export async function getHooks(): Promise<Hook[]> {
  const base = path.join(CATALOG, "hooks");
  const out: Hook[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    // Find the script next to manifest.json.
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(path.join(base, slug));
    const scriptFile = files.find((f) => /^script\./.test(f)) ?? files.find((f) => /\.(sh|py|bash|zsh)$/.test(f));
    const script = scriptFile ? await readFile(path.join(base, slug, scriptFile), "utf8") : "";
    out.push({ ...(data as Omit<Hook, "script">), script });
  }
  return out;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  category?: string;
  argument_hint?: string;
  source?: { type?: string; path?: string; repo?: string };
  license?: string;
  author?: string;
  body: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export async function getCommands(): Promise<Command[]> {
  const base = path.join(CATALOG, "commands");
  const out: Command[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    const cmdPath = path.join(base, slug, "command.md");
    const body = existsSync(cmdPath) ? await readFile(cmdPath, "utf8") : "";
    out.push({ ...(data as Omit<Command, "body">), body });
  }
  return out;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  runtime: string;
  category: string;
  install?: { copy_to?: string; chmod_exec?: boolean; dependencies?: string[] };
  usage?: string;
  source?: { type?: string; path?: string; repo?: string };
  license?: string;
  author?: string;
  script: string;
  translations?: { "pt-BR"?: { name?: string; description?: string } };
}

export async function getTools(): Promise<Tool[]> {
  const base = path.join(CATALOG, "tools");
  const out: Tool[] = [];
  for (const slug of await listDirs(base)) {
    const manifestPath = path.join(base, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const data = JSON.parse(await readFile(manifestPath, "utf8"));
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(path.join(base, slug));
    const scriptFile = files.find((f) => f !== "manifest.json");
    const script = scriptFile ? await readFile(path.join(base, slug, scriptFile), "utf8") : "";
    out.push({ ...(data as Omit<Tool, "script">), script });
  }
  return out;
}
