import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CATALOG_ROOT,
  loadSkills,
  loadServers,
  loadCollections,
  loadDocs,
  loadAgents,
  loadHooks,
  loadCommands,
  loadTools,
} from "./lib/catalog.ts";

interface IndexEntry {
  kind: "skill" | "server" | "collection" | "doc" | "agent" | "hook" | "command" | "tool";
  id: string;
  name: string;
  description: string;
  tags: string[];
  collectionMembership: string[];
  version?: string;
  deprecated?: boolean;
}

function toIndex(
  kind: IndexEntry["kind"],
  data: Record<string, unknown>,
  membership: string[],
): IndexEntry {
  return {
    kind,
    id: data.id as string,
    name: (data.name as string) ?? (data.title as string) ?? (data.id as string),
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    collectionMembership: membership,
    version: data.version as string | undefined,
    deprecated: (data.deprecated as boolean) ?? false,
  };
}

interface CollectionItem {
  kind: string;
  id: string;
}

function buildMembershipMap(collections: Awaited<ReturnType<typeof loadCollections>>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const col of collections) {
    const items = (col.data.items as CollectionItem[] | undefined) ?? [];
    for (const item of items) {
      const key = `${item.kind}:${item.id}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(col.id);
      } else {
        map.set(key, [col.id]);
      }
    }
  }
  return map;
}

async function main() {
  const [skills, servers, collections, docs, agents, hooks, commands, tools] = await Promise.all([
    loadSkills(),
    loadServers(),
    loadCollections(),
    loadDocs(),
    loadAgents(),
    loadHooks(),
    loadCommands(),
    loadTools(),
  ]);

  const membershipMap = buildMembershipMap(collections);
  const membership = (kind: string, id: string) => membershipMap.get(`${kind}:${id}`) ?? [];

  const index: IndexEntry[] = [
    ...skills.map((e) => toIndex("skill", e.data, membership("skill", e.id))),
    ...servers.map((e) => toIndex("server", e.data, membership("server", e.id))),
    ...collections.map((e) => toIndex("collection", e.data, [])),
    ...docs.map((e) => toIndex("doc", e.data, membership("doc", e.id))),
    ...agents.map((e) => toIndex("agent", e.data, membership("agent", e.id))),
    ...hooks.map((e) => toIndex("hook", e.data, membership("hook", e.id))),
    ...commands.map((e) => toIndex("command", e.data, membership("command", e.id))),
    ...tools.map((e) => toIndex("tool", e.data, membership("tool", e.id))),
  ].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));

  const outPath = path.join(CATALOG_ROOT, "index.json");
  // Deterministic output — no timestamps — so CI can detect real drift.
  await writeFile(outPath, JSON.stringify({ version: 1, entries: index }, null, 2) + "\n");
  console.log(`✅ wrote ${outPath} (${index.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
