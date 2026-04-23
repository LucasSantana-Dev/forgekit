import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  SCHEMAS_ROOT,
  loadSkills,
  loadServers,
  loadCollections,
  loadDocs,
  loadAgents,
  loadHooks,
  loadCommands,
  loadTools,
  type CatalogEntry,
  type CatalogKind,
} from "./lib/catalog.ts";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

async function loadSchema(name: string) {
  return JSON.parse(await readFile(path.join(SCHEMAS_ROOT, name), "utf8"));
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return "";
  return errors.map((e) => `  - ${e.instancePath || "/"} ${e.message ?? ""}`).join("\n");
}

async function main() {
  const schemas: Record<CatalogKind, object> = {
    skill: await loadSchema("skill.schema.json"),
    server: await loadSchema("server.schema.json"),
    collection: await loadSchema("collection.schema.json"),
    doc: await loadSchema("doc.schema.json"),
    agent: await loadSchema("agent.schema.json"),
    hook: await loadSchema("hook.schema.json"),
    command: await loadSchema("command.schema.json"),
    tool: await loadSchema("tool.schema.json"),
  };

  const validators = {
    skill: ajv.compile(schemas.skill),
    server: ajv.compile(schemas.server),
    collection: ajv.compile(schemas.collection),
    doc: ajv.compile(schemas.doc),
    agent: ajv.compile(schemas.agent),
    hook: ajv.compile(schemas.hook),
    command: ajv.compile(schemas.command),
    tool: ajv.compile(schemas.tool),
  };

  const allEntries: CatalogEntry[] = [
    ...(await loadSkills()),
    ...(await loadServers()),
    ...(await loadCollections()),
    ...(await loadDocs()),
    ...(await loadAgents()),
    ...(await loadHooks()),
    ...(await loadCommands()),
    ...(await loadTools()),
  ];

  let failures = 0;
  const idSeen = new Map<string, string>();

  for (const entry of allEntries) {
    const validate = validators[entry.kind];
    // Docs carry a `body` field at load time — strip before validation.
    const { body: _body, ...dataForValidation } = entry.data as Record<string, unknown>;
    const ok = validate(dataForValidation);
    const key = `${entry.kind}:${entry.id}`;
    if (idSeen.has(key)) {
      console.error(`❌ duplicate ${key} (first at ${idSeen.get(key)}, again at ${entry.path})`);
      failures++;
    } else {
      idSeen.set(key, entry.path);
    }
    if (!ok) {
      console.error(`❌ ${entry.kind} ${entry.id} (${entry.path})\n${formatErrors(validate.errors)}`);
      failures++;
    }
  }

  const counts = {
    skills: allEntries.filter((e) => e.kind === "skill").length,
    servers: allEntries.filter((e) => e.kind === "server").length,
    collections: allEntries.filter((e) => e.kind === "collection").length,
    docs: allEntries.filter((e) => e.kind === "doc").length,
    agents: allEntries.filter((e) => e.kind === "agent").length,
    hooks: allEntries.filter((e) => e.kind === "hook").length,
    commands: allEntries.filter((e) => e.kind === "command").length,
    tools: allEntries.filter((e) => e.kind === "tool").length,
  };

  // Collection items must reference existing catalog entries.
  const existingIds = new Set(allEntries.map((e) => `${e.kind}:${e.id}`));
  for (const c of allEntries.filter((e) => e.kind === "collection")) {
    const items = (c.data.items as Array<{ kind: string; id: string }> | undefined) ?? [];
    for (const item of items) {
      const ref = `${item.kind}:${item.id}`;
      if (!existingIds.has(ref)) {
        console.error(`❌ collection ${c.id} references missing ${ref}`);
        failures++;
      }
    }
  }

  if (failures) {
    console.error(`\n❌ ${failures} validation error${failures === 1 ? "" : "s"}`);
    console.error(JSON.stringify(counts));
    process.exit(1);
  }

  console.log(`✅ catalog valid: ${JSON.stringify(counts)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
