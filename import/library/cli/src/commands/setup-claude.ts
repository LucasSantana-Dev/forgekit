import path from "node:path";
import { existsSync } from "node:fs";
import kleur from "kleur";
import { loadSettings, saveSettings, type ClaudeSettings } from "../lib/claude-config.js";
import { loadGatewayConfig, getVirtualServerByName } from "../lib/gateway.js";

const VIRTUAL_SERVER_NAME = "library";

export async function runSetupClaude(args: string[]): Promise<void> {
  const repoRoot = resolveRepoRoot();
  const cfg = await loadGatewayConfig(repoRoot ?? undefined);
  if (!cfg.adminToken) {
    console.error(kleur.red("✗ gateway admin token not found."));
    console.error(kleur.dim("  run this from inside the ai-dev-toolkit-library repo, after starting the gateway."));
    process.exit(1);
  }

  const virtual = await getVirtualServerByName(cfg, VIRTUAL_SERVER_NAME).catch(() => null);
  if (!virtual) {
    console.error(kleur.red(`✗ virtual server '${VIRTUAL_SERVER_NAME}' not found on gateway.`));
    console.error(kleur.dim("  run: python gateway/seeds/seed.py"));
    process.exit(1);
  }

  const wrapperPath = repoRoot
    ? path.join(repoRoot, "gateway", "scripts", "mcp-wrapper.sh")
    : null;
  if (!wrapperPath || !existsSync(wrapperPath)) {
    console.error(kleur.red("✗ gateway/scripts/mcp-wrapper.sh not found."));
    console.error(kleur.dim("  run this from inside a cloned ai-dev-toolkit-library repo."));
    process.exit(1);
  }

  const mcpUrl = `${cfg.baseUrl}/servers/${virtual.id}/mcp`;
  const settings = await loadSettings();
  const next: ClaudeSettings = { ...settings };
  next.mcpServers = {
    ...(settings.mcpServers ?? {}),
    library: {
      command: "bash",
      args: [wrapperPath],
      env: {
        MCP_CLIENT_SERVER_URL: mcpUrl,
        MCP_GATEWAY_TOKEN: cfg.adminToken,
      },
    },
  };
  await saveSettings(next);

  console.log(kleur.green(`✓ wrote 'library' MCP entry to ~/.claude/settings.json`));
  console.log(kleur.dim(`  gateway: ${mcpUrl}`));
  console.log(kleur.dim(`  wrapper: ${wrapperPath}`));
  console.log(kleur.dim("  Backup of previous settings: ~/.claude/settings.json.bak"));
}

function resolveRepoRoot(): string | null {
  // Walk up from cwd looking for pnpm-workspace.yaml (repo root marker).
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}
