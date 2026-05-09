// llms-full.txt — exhaustive list of every catalog entry with one-line summaries.
// Targets agentic search (Anthropic, OpenAI, Cursor) that prefers a single
// digestible text bundle over crawling N detail pages.
import type { APIRoute } from "astro";
import {
  getSkills,
  getServers,
  getAgents,
  getHooks,
  getCommands,
  getTools,
  getCollections,
  getDocs,
  getTutorials,
} from "../lib/catalog.ts";

export const prerender = true;

interface NamedEntry {
  id: string;
  name?: string;
  title?: string;
  description: string;
}

function section(label: string, kind: string, base: string, entries: NamedEntry[]): string {
  if (entries.length === 0) return "";
  const items = entries
    .map((e) => `- [${e.name ?? e.title ?? e.id}](${base}/${kind}/${e.id}/) — ${e.description}`)
    .join("\n");
  return `## ${label} (${entries.length})\n\n${items}\n`;
}

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "https://forgekit.lucassantana.tech";
  const [skills, servers, agents, hooks, commands, tools, collections, docs, tutorials] = await Promise.all([
    getSkills(),
    getServers(),
    getAgents(),
    getHooks(),
    getCommands(),
    getTools(),
    getCollections(),
    getDocs(),
    getTutorials(),
  ]);

  const body = [
    "# Forge Kit — full catalog",
    "",
    "> One-line summary of every entry in the forgekit catalog. Install with `npx forge-kit install <id>` for skills/agents/hooks/commands/tools, `npx forge-kit add-server <id>` for MCP servers.",
    "",
    section("Skills", "skills", base, skills),
    section("Sub-agents", "agents", base, agents),
    section("MCP Servers", "servers", base, servers),
    section("Hooks", "hooks", base, hooks),
    section("Commands", "commands", base, commands),
    section("Tools", "tools", base, tools),
    section("Collections", "collections", base, collections),
    section("Docs", "docs", base, docs),
    section("Tutorials", "tutorials", base, tutorials),
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
