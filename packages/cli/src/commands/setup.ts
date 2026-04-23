import kleur from "kleur";
import { ADAPTERS, getAdapter, mcpRemoteEntry } from "../lib/editors.js";
import { loadGatewayConfig, getVirtualServerByName, pingGateway } from "../lib/gateway.js";

const VIRTUAL_SERVER_NAME = "library";

/**
 * `forge-kit setup <editor>` or `forge-kit setup-<editor>` — wires one editor's MCP
 * config to the local gateway. Can target many editors; see ADAPTERS.
 *
 * Flags:
 *   --all           set up every detected editor (skips adapters whose
 *                   parent dir doesn't exist)
 *   --list          list supported editor ids
 *   --gateway-url   override gateway URL (default: http://127.0.0.1:4444)
 *   --server-uuid   skip the gateway lookup and hard-code the virtual
 *                   server UUID (advanced; useful for pinned setups)
 */
export async function runSetup(args: string[]): Promise<void> {
  if (args.includes("--list") || args[0] === "list") {
    console.log("Supported editors:");
    for (const a of ADAPTERS) console.log(`  ${kleur.cyan(a.id.padEnd(16))} ${kleur.dim(a.displayName)}`);
    return;
  }

  const flags = parseFlags(args);
  const editorIds = resolveTargets(flags);
  if (editorIds.length === 0) {
    console.error(kleur.red("✗ no editor specified and no detected editors found."));
    console.error(kleur.dim("  try: forge-kit setup <editor> | forge-kit setup --all | forge-kit setup --list"));
    process.exit(2);
  }

  const { url, token } = await resolveGateway(flags);
  const entry = mcpRemoteEntry(url, token);

  let ok = 0;
  let failed = 0;
  for (const id of editorIds) {
    const adapter = getAdapter(id);
    if (!adapter) {
      console.error(kleur.red(`✗ unknown editor: ${id}`));
      console.error(kleur.dim(`  known: ${ADAPTERS.map((a) => a.id).join(", ")}`));
      failed++;
      continue;
    }
    try {
      await adapter.install(entry, VIRTUAL_SERVER_NAME);
      console.log(kleur.green(`✓ ${adapter.displayName.padEnd(16)} ${kleur.dim(adapter.configPath())}`));
      ok++;
    } catch (err) {
      console.error(kleur.red(`✗ ${adapter.displayName}: ${(err as Error).message}`));
      failed++;
    }
  }
  console.log("");
  console.log(kleur.dim(`  gateway: ${url}`));
  console.log(kleur.dim(`  installed: ${ok}, failed: ${failed}`));
  console.log(kleur.dim("  Restart the editor to pick up the new MCP server."));
  if (failed > 0) process.exit(1);
}

function parseFlags(argv: string[]): {
  all: boolean;
  gatewayUrl?: string;
  serverUuid?: string;
  editors: string[];
} {
  const out: { all: boolean; gatewayUrl?: string; serverUuid?: string; editors: string[] } = {
    all: false,
    editors: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") out.all = true;
    else if (a === "--gateway-url") out.gatewayUrl = argv[++i];
    else if (a === "--server-uuid") out.serverUuid = argv[++i];
    else if (a === "--list") {/* handled above */}
    else if (!a.startsWith("-")) out.editors.push(a);
  }
  return out;
}

function resolveTargets(flags: ReturnType<typeof parseFlags>): string[] {
  if (flags.editors.length > 0) return flags.editors;
  if (flags.all) {
    const detected = ADAPTERS.filter((a) => a.detect()).map((a) => a.id);
    if (detected.length > 0) return detected;
  }
  return [];
}

async function resolveGateway(flags: ReturnType<typeof parseFlags>): Promise<{ url: string; token: string | null }> {
  const cfg = await loadGatewayConfig(process.cwd());
  const base = flags.gatewayUrl ?? cfg.baseUrl;

  if (flags.serverUuid) {
    return { url: `${base}/servers/${flags.serverUuid}/mcp`, token: cfg.adminToken || null };
  }

  if (!(await pingGateway({ ...cfg, baseUrl: base }))) {
    console.error(kleur.red(`✗ gateway not reachable at ${base}`));
    console.error(kleur.dim("  start it: cd gateway && docker compose up -d"));
    console.error(kleur.dim("  or pass --gateway-url <url> --server-uuid <uuid> to skip the probe"));
    process.exit(1);
  }

  if (!cfg.adminToken) {
    console.error(kleur.yellow("! gateway admin token not found in env or gateway/.env."));
    console.error(kleur.dim("  writing config without Authorization header — gateway must allow anonymous access."));
  }

  const virtual = await getVirtualServerByName({ ...cfg, baseUrl: base }, VIRTUAL_SERVER_NAME).catch(() => null);
  if (!virtual) {
    console.error(kleur.red(`✗ virtual server '${VIRTUAL_SERVER_NAME}' not found on gateway.`));
    console.error(kleur.dim("  run: python gateway/seeds/seed.py"));
    process.exit(1);
  }
  return {
    url: `${base}/servers/${virtual.id}/mcp`,
    token: cfg.adminToken || null,
  };
}

/** Alias for `forge-kit setup claude-code`. */
export async function runSetupClaude(args: string[]): Promise<void> {
  return runSetup(["claude-code", ...args]);
}
