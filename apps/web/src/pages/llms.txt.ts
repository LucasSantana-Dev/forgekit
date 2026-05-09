// llms.txt — short discovery file for agentic search and AI crawlers.
// Spec: https://llmstxt.org/  (concise navigation, point at canonical sections).
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

  const body = `# Forge Kit

> Curated catalog of skills, sub-agents, MCP servers, hooks, commands, and tools for Claude Code, Codex, Gemini, Cursor, and local LLMs. Install with \`npx forge-kit install <id>\`.

## Catalog

- [Skills](${base}/skills/): ${skills.length} installable skills (planning, RAG, testing, security, observability, …)
- [Sub-agents](${base}/agents/): ${agents.length} Claude Code sub-agents
- [MCP servers](${base}/servers/): ${servers.length} servers ready to register with mcp-context-forge
- [Hooks](${base}/hooks/): ${hooks.length} Claude Code hooks (pre/post-tool, security, validation)
- [Commands](${base}/commands/): ${commands.length} slash commands
- [Tools](${base}/tools/): ${tools.length} standalone CLIs and scripts
- [Collections](${base}/collections/): ${collections.length} curated bundles
- [Providers](${base}/providers/): entries grouped by AI provider (Claude, Codex, Gemini, Cursor, Local)

## Reference

- [Docs](${base}/docs/): ${docs.length} reference documents
- [Tutorials](${base}/tutorials/): ${tutorials.length} step-by-step guides
- [Search](${base}/search/): full-text search across the catalog
- [Sitemap](${base}/sitemap-index.xml): all indexable URLs

## Install

\`\`\`
npx forge-kit install <id>
\`\`\`

Skills, agents, hooks, commands, and tools land in \`~/.claude/<kind>/<id>\`. MCP servers register with the local \`mcp-context-forge\` gateway via \`npx forge-kit add-server <id>\`.

## Source

- GitHub: https://github.com/LucasSantana-Dev/forgekit
- License: MIT
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
