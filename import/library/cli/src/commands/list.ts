import kleur from "kleur";
import { loadIndex, type IndexEntry } from "../lib/catalog.js";

export async function runList(args: string[]): Promise<void> {
  const parsed = parseFlags(args);
  const index = await loadIndex();
  let entries = index.entries;
  if (parsed.kind) entries = entries.filter((e) => e.kind === parsed.kind);
  if (parsed.tag) entries = entries.filter((e) => e.tags.includes(parsed.tag!));
  if (parsed.query) {
    const q = parsed.query.toLowerCase();
    entries = entries.filter(
      (e) => e.id.includes(q) || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
    );
  }
  entries.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));

  const counts = countByKind(entries);
  console.log(
    kleur.bold(`${entries.length} entries`) +
      kleur.dim(
        ` — skills: ${counts.skill}, servers: ${counts.server}, collections: ${counts.collection}, docs: ${counts.doc}`,
      ),
  );
  console.log("");
  for (const e of entries) {
    const kindTag = kindBadge(e.kind);
    console.log(`${kindTag} ${kleur.bold(e.id)} ${kleur.dim(`v${e.version ?? "—"}`)}`);
    console.log(`  ${e.description.slice(0, 180)}`);
    if (e.tags.length) console.log(kleur.dim(`  tags: ${e.tags.join(", ")}`));
    console.log("");
  }
}

function kindBadge(kind: IndexEntry["kind"]): string {
  switch (kind) {
    case "skill":
      return kleur.cyan("  skill   ");
    case "server":
      return kleur.magenta("  server  ");
    case "collection":
      return kleur.yellow("  coll    ");
    case "doc":
      return kleur.blue("  doc     ");
  }
}

function countByKind(entries: IndexEntry[]) {
  const out = { skill: 0, server: 0, collection: 0, doc: 0 };
  for (const e of entries) out[e.kind]++;
  return out;
}

function parseFlags(argv: string[]) {
  const out: { kind?: IndexEntry["kind"]; tag?: string; query?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--kind" || a === "-k") out.kind = argv[++i] as IndexEntry["kind"];
    else if (a === "--tag" || a === "-t") out.tag = argv[++i];
    else if (!a.startsWith("-")) out.query = out.query ? `${out.query} ${a}` : a;
  }
  return out;
}
