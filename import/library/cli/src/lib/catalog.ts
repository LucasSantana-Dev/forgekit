import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export interface IndexEntry {
  kind: "skill" | "server" | "collection" | "doc";
  id: string;
  name: string;
  description: string;
  tags: string[];
  version?: string;
  deprecated?: boolean;
}

export interface CatalogIndex {
  version: number;
  generatedAt: string;
  entries: IndexEntry[];
}

const CATALOG_URL =
  "https://raw.githubusercontent.com/LucasSantana-Dev/ai-dev-toolkit-library/main/catalog/index.json";

const CACHE_PATH = path.join(os.homedir(), ".cache", "adtl", "catalog-index.json");

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
  // If `adtl` is run from inside the repo itself, prefer local over remote.
  const candidate = path.resolve(process.cwd(), "catalog", "index.json");
  if (!existsSync(candidate)) return null;
  try {
    return JSON.parse(await readFile(candidate, "utf8"));
  } catch {
    return null;
  }
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
      `Try running from inside the ai-dev-toolkit-library repo, or retry with network.`,
  );
}

export async function fetchRawFile(repoRelativePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/LucasSantana-Dev/ai-dev-toolkit-library/main/${repoRelativePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return await res.text();
}
