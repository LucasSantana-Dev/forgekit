import { existsSync } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CATALOG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'catalog');
const LLMS_PATH = path.join(CATALOG_ROOT, '..', '..', '..', 'llms.txt');
const MARKER_START = '<!-- llms-catalog-start -->';
const MARKER_END = '<!-- llms-catalog-end -->';

async function listDirs(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir);
  const dirs: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if ((await stat(fullPath)).isDirectory()) dirs.push(entry);
  }

  return dirs.sort();
}

async function listFiles(dir: string, ext: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((entry) => entry.endsWith(ext)).sort();
}

async function loadSkills(): Promise<string[]> {
  const skillsDir = path.join(CATALOG_ROOT, 'skills');
  const out: string[] = [];

  for (const slug of await listDirs(skillsDir)) {
    const manifestPath = path.join(skillsDir, slug, 'manifest.json');
    if (existsSync(manifestPath)) out.push(slug);
  }

  return out;
}

async function loadAgents(): Promise<string[]> {
  const dir = path.join(CATALOG_ROOT, 'agents');
  return await listFiles(dir, '.md');
}

async function loadCollections(): Promise<string[]> {
  const dir = path.join(CATALOG_ROOT, 'collections');
  const result: string[] = [];

  for (const file of await listFiles(dir, '.yaml')) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const match = raw.match(/^[ \t]*name:\s*(?:"([^"]+)"|'([^']+)'|(.+))$/m);
    const rawName = match ? match[1] ?? match[2] ?? match[3] : undefined;
    const name = rawName?.replace(/\s+#.*$/, '').trim();
    result.push(name ?? file.replace(/\.yaml$/, ''));
  }

  return result;
}

async function loadServers(): Promise<string[]> {
  const dir = path.join(CATALOG_ROOT, 'servers');
  return await listFiles(dir, '.yaml');
}

interface GeneratedSectionOptions {
  skillCount: number;
  agentCount: number;
  collectionCount: number;
  serverCount: number;
  collectionNames: string[];
}

function buildGeneratedSection({
  skillCount,
  agentCount,
  collectionCount,
  serverCount,
  collectionNames,
}: GeneratedSectionOptions): string {
  return `${MARKER_START}
Key capabilities:
- 15 tool-agnostic workflow patterns
- ${skillCount} portable skills for autonomous development
- ${agentCount} catalog agents in \`packages/catalog/catalog/agents/\`
- Cross-tool installer (forge-kit) with interactive setup wizard
- Autonomous loop engine with governance gates

## Catalog overview
- ${skillCount} portable skills in \`packages/catalog/catalog/skills/\`
- ${agentCount} catalog agents in \`packages/catalog/catalog/agents/\`
- ${collectionCount} collections organizing workflows and personas
- ${serverCount} MCP server definitions in \`packages/catalog/catalog/servers/\`
- Counts are approximate; source of truth is \`packages/catalog/catalog/\` and \`packages/catalog/catalog/index.json\`

## Collections
${collectionNames.map((name) => `- ${name}`).join('\n')}

${MARKER_END}`;
}

async function main(): Promise<void> {
  const [skills, agents, collections, servers] = await Promise.all([
    loadSkills(),
    loadAgents(),
    loadCollections(),
    loadServers(),
  ]);

  const collectionNames = collections.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const generated = buildGeneratedSection({
    skillCount: skills.length,
    agentCount: agents.length,
    collectionCount: collections.length,
    serverCount: servers.length,
    collectionNames,
  });

  const original = await readFile(LLMS_PATH, 'utf8');
  const startIndex = original.indexOf(MARKER_START);
  const endIndex = original.indexOf(MARKER_END, startIndex + MARKER_START.length);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Could not find generated markers in ${LLMS_PATH}. Add ${MARKER_START} and ${MARKER_END} around the top section.`);
  }

  const result = `${original.slice(0, startIndex)}${generated}${original.slice(endIndex + MARKER_END.length)}`;
  await writeFile(LLMS_PATH, result, 'utf8');
  console.log(`✅ Updated ${LLMS_PATH} from catalog metadata with ${skills.length} skills, ${agents.length} agents, ${collections.length} collections, ${servers.length} servers.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
