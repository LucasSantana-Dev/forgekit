import { existsSync } from "node:fs";
import { access, constants } from "node:fs/promises";
import kleur from "kleur";
import { loadIndex } from "../lib/catalog.js";
import { loadGatewayConfig, pingGateway } from "../lib/gateway.js";
import { CLAUDE_HOME, SKILLS_DIR, AGENTS_DIR } from "../lib/claude-config.js";

type Check = { name: string; ok: boolean; detail?: string };

export async function runDoctor(): Promise<void> {
  const checks: Check[] = [];

  // 1. Claude home writable
  try {
    await access(CLAUDE_HOME, constants.W_OK);
    checks.push({ name: `~/.claude writable`, ok: true });
  } catch {
    checks.push({ name: `~/.claude writable`, ok: false, detail: `missing or not writable: ${CLAUDE_HOME}` });
  }

  // 2. Skills dir
  if (existsSync(SKILLS_DIR)) {
    checks.push({ name: `skills dir exists`, ok: true, detail: SKILLS_DIR });
  } else {
    checks.push({ name: `skills dir exists`, ok: false, detail: `will be created on first install: ${SKILLS_DIR}` });
  }

  // 2b. Agents dir
  if (existsSync(AGENTS_DIR)) {
    checks.push({ name: `agents dir exists`, ok: true, detail: AGENTS_DIR });
  } else {
    checks.push({ name: `agents dir exists`, ok: false, detail: `will be created on first install: ${AGENTS_DIR}` });
  }

  // 3. Catalog reachable
  try {
    const idx = await loadIndex();
    checks.push({ name: `catalog index loaded`, ok: true, detail: `${idx.entries.length} entries` });
  } catch (err) {
    checks.push({ name: `catalog index loaded`, ok: false, detail: (err as Error).message });
  }

  // 4. Gateway reachable
  const cfg = await loadGatewayConfig(process.cwd());
  const pong = await pingGateway(cfg);
  checks.push({
    name: `gateway reachable at ${cfg.baseUrl}`,
    ok: pong,
    detail: pong ? undefined : "start with: cd gateway && docker compose up -d",
  });

  // 5. Token present
  checks.push({
    name: `gateway admin token configured`,
    ok: Boolean(cfg.adminToken),
    detail: cfg.adminToken ? "(found)" : "set GATEWAY_ADMIN_TOKEN in env or gateway/.env",
  });

  for (const c of checks) {
    const mark = c.ok ? kleur.green("✓") : kleur.red("✗");
    console.log(`${mark} ${c.name}${c.detail ? kleur.dim(` — ${c.detail}`) : ""}`);
  }

  const allOk = checks.every((c) => c.ok);
  process.exit(allOk ? 0 : 1);
}
