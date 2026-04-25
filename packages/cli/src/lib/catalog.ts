import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export interface IndexEntry {
  kind: "skill" | "server" | "collection" | "doc" | "agent" | "hook" | "command" | "tool";
  id: string;
  name: string;
  description: string;
  tags: string[];
  version?: string;
  deprecated?: boolean;
}

export interface CatalogIndex {
  version: number;
  entries: IndexEntry[];
}

const REPO_RAW_BASE = "https://raw.githubusercontent.com/LucasSantana-Dev/forgekit/main";
const CATALOG_REPO_PATH = "packages/catalog/catalog";
const CATALOG_URL = `${REPO_RAW_BASE}/${CATALOG_REPO_PATH}/index.json`;

const CACHE_PATH = path.join(os.homedir(), ".cache", "forge-kit", "catalog-index.json");

async function fetchRemoteIndex(): Promise<CatalogIndex | null> {
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) return null;
    return (await res.json()) as CatalogIndex;
  } catch {
    return null;
  }
}

async function readCachedIndex(): Promise<CatalogIndex | null> {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function writeCache(index: CatalogIndex): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(index, null, 2));
}

async function readLocalIndex(): Promise<CatalogIndex | null> {
  // If `forge-kit` is run from inside a checkout, prefer local over remote.
  const candidates = [
    path.resolve(process.cwd(), "packages/catalog/catalog/index.json"),
    path.resolve(process.cwd(), "catalog/index.json"),
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      return JSON.parse(await readFile(candidate, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

export async function loadIndex(opts: { offline?: boolean } = {}): Promise<CatalogIndex> {
  const local = await readLocalIndex();
  if (local) return local;

  if (!opts.offline) {
    const remote = await fetchRemoteIndex();
    if (remote) {
      await writeCache(remote).catch(() => {});
      return remote;
    }
  }

  const cached = await readCachedIndex();
  if (cached) return cached;

  throw new Error(
    `Could not load catalog index. Network unavailable and no cache at ${CACHE_PATH}.\n` +
      `Try running from inside the Forge Kit repo, or retry with network.`,
  );
}

export async function fetchRawFile(repoRelativePath: string): Promise<string> {
  const catalogRelativePath = repoRelativePath.startsWith("catalog/")
    ? repoRelativePath.slice("catalog/".length)
    : repoRelativePath;
  const url = `${REPO_RAW_BASE}/${CATALOG_REPO_PATH}/${catalogRelativePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return await res.text();
}
