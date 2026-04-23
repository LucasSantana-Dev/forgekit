import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export const CLAUDE_HOME = process.env.CLAUDE_HOME ?? path.join(os.homedir(), ".claude");
export const SKILLS_DIR = path.join(CLAUDE_HOME, "skills");
export const AGENTS_DIR = path.join(CLAUDE_HOME, "agents");
export const HOOKS_DIR = path.join(CLAUDE_HOME, "hooks");
export const COMMANDS_DIR = path.join(CLAUDE_HOME, "commands");
export const BIN_DIR = path.join(os.homedir(), ".local", "bin");
export const SETTINGS_PATH = path.join(CLAUDE_HOME, "settings.json");

export interface McpServerEntry {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  type?: string;
}

export interface ClaudeSettings {
  mcpServers?: Record<string, McpServerEntry>;
  [k: string]: unknown;
}

async function readJSON<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (err) {
    throw new Error(`Could not parse ${file}: ${(err as Error).message}`);
  }
}

export async function loadSettings(): Promise<ClaudeSettings> {
  return (await readJSON<ClaudeSettings>(SETTINGS_PATH)) ?? {};
}

export async function saveSettings(next: ClaudeSettings): Promise<void> {
  await mkdir(CLAUDE_HOME, { recursive: true });
  if (existsSync(SETTINGS_PATH)) {
    await copyFile(SETTINGS_PATH, `${SETTINGS_PATH}.bak`);
  }
  await writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2) + "\n");
}

export async function ensureSkillsDir(): Promise<void> {
  await mkdir(SKILLS_DIR, { recursive: true });
}

export async function ensureAgentsDir(): Promise<void> {
  await mkdir(AGENTS_DIR, { recursive: true });
}

export async function ensureHooksDir(): Promise<void> {
  await mkdir(HOOKS_DIR, { recursive: true });
}

export async function ensureCommandsDir(): Promise<void> {
  await mkdir(COMMANDS_DIR, { recursive: true });
}

export async function ensureBinDir(): Promise<void> {
  await mkdir(BIN_DIR, { recursive: true });
}

export function skillInstallPath(id: string): string {
  return path.join(SKILLS_DIR, id);
}

export function agentInstallPath(id: string): string {
  return path.join(AGENTS_DIR, `${id}.md`);
}

export function hookInstallPath(id: string): string {
  return path.join(HOOKS_DIR, `${id}.sh`);
}

export function commandInstallPath(id: string): string {
  return path.join(COMMANDS_DIR, `${id}.md`);
}

export function toolInstallPath(id: string): string {
  return path.join(BIN_DIR, id);
}
