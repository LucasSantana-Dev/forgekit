/**
 * Editor adapters for `forge-kit setup <editor>`.
 *
 * Each adapter knows:
 *   - where the editor keeps its MCP config
 *   - the config's format (JSON or TOML)
 *   - how to merge a "library" MCP-server entry without clobbering
 *     other servers the user already configured
 *
 * All adapters write an entry that uses `npx -y mcp-remote <url>` directly,
 * so `npx forge-kit setup-<editor>` works from any directory —
 * no repo clone, no wrapper script on disk.
 */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import TOML from "@iarna/toml";

export interface McpEntry {
  command: string;
  args: string[];
}

export interface EditorAdapter {
  id: string;
  displayName: string;
  /** Absolute path to the config file this adapter manages. */
  configPath: () => string;
  /** Merge the library entry into the config at configPath(). */
  install: (entry: McpEntry, name?: string) => Promise<void>;
  /** True if the config path's parent directory exists — cheap install-detection. */
  detect: () => boolean;
}

const HOME = os.homedir();

/** Build the `mcp-remote` invocation for a given gateway URL + token. */
export function mcpRemoteEntry(url: string, token: string | null): McpEntry {
  const args = ["-y", "mcp-remote", url];
  if (token) args.push("--header", `Authorization:Bearer ${token}`);
  return { command: "npx", args };
}

/* -------------------------------------------------------------------------- */
/* File helpers                                                               */
/* -------------------------------------------------------------------------- */

async function readJson<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (err) {
    throw new Error(`Could not parse ${file}: ${(err as Error).message}`);
  }
}

async function backupAndWrite(file: string, content: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  if (existsSync(file)) {
    await copyFile(file, `${file}.bak`);
  }
  await writeFile(file, content);
}

/* -------------------------------------------------------------------------- */
/* Adapters that use `{ mcpServers: { <name>: entry } }` JSON                  */
/* -------------------------------------------------------------------------- */

interface JsonMcpConfig {
  mcpServers?: Record<string, McpEntry>;
  [k: string]: unknown;
}

function jsonMcpAdapter(args: {
  id: string;
  displayName: string;
  file: string;
}): EditorAdapter {
  return {
    id: args.id,
    displayName: args.displayName,
    configPath: () => args.file,
    detect: () => existsSync(path.dirname(args.file)),
    install: async (entry, name = "library") => {
      const existing = (await readJson<JsonMcpConfig>(args.file)) ?? {};
      const next: JsonMcpConfig = {
        ...existing,
        mcpServers: { ...(existing.mcpServers ?? {}), [name]: entry },
      };
      await backupAndWrite(args.file, JSON.stringify(next, null, 2) + "\n");
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Claude Desktop — JSON, OS-specific path                                    */
/* -------------------------------------------------------------------------- */

function claudeDesktopPath(): string {
  if (process.platform === "darwin") {
    return path.join(HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  }
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(HOME, "AppData", "Roaming");
    return path.join(appData, "Claude", "claude_desktop_config.json");
  }
  return path.join(HOME, ".config", "Claude", "claude_desktop_config.json");
}

/* -------------------------------------------------------------------------- */
/* Codex — TOML config                                                        */
/* -------------------------------------------------------------------------- */

const codexAdapter: EditorAdapter = {
  id: "codex",
  displayName: "Codex CLI",
  configPath: () => path.join(HOME, ".codex", "config.toml"),
  detect: () => existsSync(path.join(HOME, ".codex")),
  install: async (entry, name = "library") => {
    const file = codexAdapter.configPath();
    let config: Record<string, unknown> = {};
    if (existsSync(file)) {
      try {
        config = TOML.parse(await readFile(file, "utf8"));
      } catch (err) {
        throw new Error(`Could not parse ${file}: ${(err as Error).message}`);
      }
    }
    const servers = (config.mcp_servers as Record<string, unknown> | undefined) ?? {};
    servers[name] = { command: entry.command, args: entry.args };
    config.mcp_servers = servers;
    await backupAndWrite(file, TOML.stringify(config as TOML.JsonMap));
  },
};

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

export const ADAPTERS: EditorAdapter[] = [
  jsonMcpAdapter({
    id: "claude-code",
    displayName: "Claude Code",
    file: path.join(HOME, ".claude", "settings.json"),
  }),
  jsonMcpAdapter({
    id: "claude-desktop",
    displayName: "Claude Desktop",
    file: claudeDesktopPath(),
  }),
  codexAdapter,
  jsonMcpAdapter({
    id: "cursor",
    displayName: "Cursor",
    file: path.join(HOME, ".cursor", "mcp.json"),
  }),
  jsonMcpAdapter({
    id: "gemini",
    displayName: "Gemini CLI",
    file: path.join(HOME, ".gemini", "settings.json"),
  }),
  jsonMcpAdapter({
    id: "windsurf",
    displayName: "Windsurf",
    file: path.join(HOME, ".codeium", "windsurf", "mcp_config.json"),
  }),
];

export function getAdapter(id: string): EditorAdapter | undefined {
  return ADAPTERS.find((a) => a.id === id);
}
