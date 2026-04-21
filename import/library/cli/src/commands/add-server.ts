import path from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import kleur from "kleur";
import { loadIndex, fetchRawFile } from "../lib/catalog.js";
import { loadGatewayConfig, pingGateway, registerUpstream } from "../lib/gateway.js";

// Lightweight YAML parser — we only need to decode server manifests, which
// use simple scalar/array/object shapes. Import js-yaml lazily so the CLI
// stays tiny for the common `list`/`install` paths.
async function parseYaml(text: string): Promise<Record<string, unknown>> {
  const { default: yaml } = await import("js-yaml");
  return yaml.load(text) as Record<string, unknown>;
}

export async function runAddServer(args: string[]): Promise<void> {
  const id = args[0];
  if (!id) {
    console.error("Usage: adtl add-server <server-id>");
    process.exit(2);
  }
  const index = await loadIndex();
  const entry = index.entries.find((e) => e.kind === "server" && e.id === id);
  if (!entry) {
    console.error(kleur.red(`✗ no server with id '${id}'`));
    console.error(kleur.dim("  run `adtl list --kind server` to see available servers"));
    process.exit(1);
  }

  const raw = await loadFile(`catalog/servers/${id}.yaml`);
  const spec = await parseYaml(raw);

  const cfg = await loadGatewayConfig(process.cwd());
  if (!cfg.adminToken) {
    console.error(kleur.red("✗ gateway admin token not found."));
    console.error(kleur.dim("  set GATEWAY_ADMIN_TOKEN in your shell or in gateway/.env"));
    process.exit(1);
  }

  if (!(await pingGateway(cfg))) {
    console.error(kleur.red(`✗ gateway at ${cfg.baseUrl} not reachable.`));
    console.error(kleur.dim("  start it with: cd gateway && docker compose up -d"));
    process.exit(1);
  }

  const payload: Record<string, unknown> = {
    name: spec.id,
    description: spec.description,
    transport: spec.transport,
  };
  if (spec.transport === "stdio") {
    payload.command = spec.command;
    payload.args = spec.args ?? [];
    payload.env = Object.fromEntries(
      (((spec.env as Array<{ name: string }>) ?? []).map((e) => [e.name, process.env[e.name] ?? ""])),
    );
  } else {
    payload.url = spec.url;
  }

  const result = await registerUpstream(cfg, payload);
  console.log(kleur.green(`✓ registered '${id}' with gateway (id=${result.id})`));
}

async function loadFile(repoRelPath: string): Promise<string> {
  const localCandidate = path.resolve(process.cwd(), repoRelPath);
  if (existsSync(localCandidate)) return readFile(localCandidate, "utf8");
  return fetchRawFile(repoRelPath);
}
