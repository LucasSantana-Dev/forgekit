import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export interface GatewayConfig {
  baseUrl: string;
  adminUser: string;
  adminToken: string;
  port: number;
}

export async function loadGatewayConfig(repoRoot?: string): Promise<GatewayConfig> {
  // Priority:
  //   1. process.env (ADTL_GATEWAY_URL / ADTL_GATEWAY_TOKEN / ADTL_GATEWAY_USER)
  //   2. gateway/.env in the provided repoRoot
  //   3. Defaults (localhost:4444, admin, unset token — will fail at request time)
  const port = Number(process.env.GATEWAY_PORT ?? 4444);
  const baseUrl = process.env.ADTL_GATEWAY_URL ?? `http://127.0.0.1:${port}`;
  const adminUser = process.env.ADTL_GATEWAY_USER ?? process.env.ADMIN_USER ?? "admin";
  let adminToken = process.env.ADTL_GATEWAY_TOKEN ?? process.env.GATEWAY_ADMIN_TOKEN ?? "";

  if (!adminToken && repoRoot) {
    const envFile = path.join(repoRoot, "gateway", ".env");
    if (existsSync(envFile)) {
      const raw = await readFile(envFile, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^\s*GATEWAY_ADMIN_TOKEN\s*=\s*(.+?)\s*$/);
        if (m) adminToken = m[1];
      }
    }
  }

  return { baseUrl, adminUser, adminToken, port };
}

function authHeader(cfg: GatewayConfig): string {
  const creds = Buffer.from(`${cfg.adminUser}:${cfg.adminToken}`).toString("base64");
  return `Basic ${creds}`;
}

export async function pingGateway(cfg: GatewayConfig): Promise<boolean> {
  try {
    const res = await fetch(`${cfg.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listUpstreams(cfg: GatewayConfig): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${cfg.baseUrl}/gateways`, {
    headers: { Authorization: authHeader(cfg) },
  });
  if (!res.ok) throw new Error(`GET /gateways → ${res.status}`);
  return (await res.json()) as Array<{ id: string; name: string }>;
}

export async function registerUpstream(
  cfg: GatewayConfig,
  spec: Record<string, unknown>,
): Promise<{ id: string; name: string }> {
  const existing = await listUpstreams(cfg).catch(() => []);
  const name = spec.name ?? spec.id;
  const match = existing.find((g) => g.name === name);
  const method = match ? "PUT" : "POST";
  const urlPath = match ? `/gateways/${match.id}` : "/gateways";
  const res = await fetch(`${cfg.baseUrl}${urlPath}`, {
    method,
    headers: {
      Authorization: authHeader(cfg),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(spec),
  });
  if (!res.ok) throw new Error(`${method} ${urlPath} → ${res.status} ${await res.text().catch(() => "")}`);
  return (await res.json()) as { id: string; name: string };
}

export async function getVirtualServerByName(
  cfg: GatewayConfig,
  name: string,
): Promise<{ id: string; name: string } | null> {
  const res = await fetch(`${cfg.baseUrl}/servers`, {
    headers: { Authorization: authHeader(cfg) },
  });
  if (!res.ok) throw new Error(`GET /servers → ${res.status}`);
  const arr = (await res.json()) as Array<{ id: string; name: string }>;
  return arr.find((s) => s.name === name) ?? null;
}
