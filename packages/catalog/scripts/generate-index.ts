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
  version?: string;
  deprecated?: boolean;
}

function toIndex(kind: IndexEntry["kind"], data: Record<string, unknown>): IndexEntry {
  return {
    kind,
    id: data.id as string,
    name: (data.name as string) ?? (data.title as string) ?? (data.id as string),
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    version: data.version as string | undefined,
    deprecated: (data.deprecated as boolean) ?? false,
  };
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
  const index: IndexEntry[] = [
    ...skills.map((e) => toIndex("skill", e.data)),
    ...servers.map((e) => toIndex("server", e.data)),
    ...collections.map((e) => toIndex("collection", e.data)),
    ...docs.map((e) => toIndex("doc", e.data)),
    ...agents.map((e) => toIndex("agent", e.data)),
    ...hooks.map((e) => toIndex("hook", e.data)),
    ...commands.map((e) => toIndex("command", e.data)),
    ...tools.map((e) => toIndex("tool", e.data)),
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
