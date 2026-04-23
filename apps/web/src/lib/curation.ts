import type { Agent, Hook, Server, Skill, Tool } from "./catalog.ts";
import { localizedUrl, type Locale } from "./i18n.ts";
import type { Kind } from "./ui.ts";

export interface HomepageItem {
  kind: Extract<Kind, "skill" | "server" | "agent" | "hook" | "tool">;
  id: string;
  name: string;
  description: string;
  tags: string[];
  href: string;
  extraTag?: string;
}

export interface WorkflowTheme {
  key: "compact" | "rag" | "rtk";
  primary: HomepageItem | null;
  related: HomepageItem[];
  browseHref: string;
}

export interface HomepageCuration {
  featuredSkills: HomepageItem[];
  featuredAgents: HomepageItem[];
  featuredServers: HomepageItem[];
  featuredTools: HomepageItem[];
  featuredHooks: HomepageItem[];
  workflowEssentials: WorkflowTheme[];
}

function formatFacetLabel(value: string): string {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const FEATURED_IDS = {
  skills: ["prompting-discipline", "verification-before-completion", "using-git-worktrees"],
  agents: ["planner", "code-reviewer", "debugger"],
  servers: ["memory", "context7", "github"],
  tools: ["setup-claude-code", "mcp-health", "release"],
  hooks: ["rtk-rewrite", "workflow-validator", "pre-commit-validation"],
} as const;

const WORKFLOW_THEMES = [
  {
    key: "compact" as const,
    primaryIds: ["context-building", "adt-context"],
    relatedIds: ["adt-context-hygiene", "pre-compact", "post-compact", "context-backup"],
    browseHref: "skills/",
  },
  {
    key: "rag" as const,
    primaryIds: ["adt-rag-context-pack", "adt-rag"],
    relatedIds: ["adt-rag-recall", "auto-context-pack", "mcp-health"],
    browseHref: "skills/",
  },
  {
    key: "rtk" as const,
    primaryIds: ["rtk-rewrite"],
    relatedIds: ["setup-claude-code", "install-macos", "install-ubuntu"],
    browseHref: "hooks/",
  },
] as const;

function skillEntry(entry: Skill, base: string, locale: Locale): HomepageItem {
  return {
    kind: "skill",
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags ?? [],
    href: localizedUrl(base, `skills/${entry.id}/`, locale),
    extraTag: entry.version,
  };
}

function agentEntry(entry: Agent, base: string, locale: Locale): HomepageItem {
  return {
    kind: "agent",
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags ?? [],
    href: localizedUrl(base, `agents/${entry.id}/`, locale),
    extraTag: entry.model,
  };
}

function serverEntry(entry: Server, base: string, locale: Locale): HomepageItem {
  return {
    kind: "server",
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags ?? [],
    href: localizedUrl(base, `servers/${entry.id}/`, locale),
    extraTag: entry.transport,
  };
}

function toolEntry(entry: Tool, base: string, locale: Locale): HomepageItem {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const tag of [formatFacetLabel(entry.runtime), ...entry.tags]) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push(tag);
    if (tags.length >= 4) break;
  }
  return {
    kind: "tool",
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags,
    href: localizedUrl(base, `tools/${entry.id}/`, locale),
    extraTag: formatFacetLabel(entry.category),
  };
}

function hookEntry(entry: Hook, base: string, locale: Locale): HomepageItem {
  return {
    kind: "hook",
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags ?? [],
    href: localizedUrl(base, `hooks/${entry.id}/`, locale),
    extraTag: entry.event,
  };
}

function pickCurated(items: HomepageItem[], ids: readonly string[]): HomepageItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const picked: HomepageItem[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    const item = byId.get(id);
    if (!item || seen.has(id)) continue;
    picked.push(item);
    seen.add(id);
  }

  for (const item of items) {
    if (picked.length >= 3) break;
    if (seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
  }

  return picked.slice(0, 3);
}

function indexKey(kind: HomepageItem["kind"], id: string): string {
  return `${kind}:${id}`;
}

function buildIndex(items: HomepageItem[]): Map<string, HomepageItem> {
  return new Map(items.map((item) => [indexKey(item.kind, item.id), item]));
}

function resolveTheme(
  index: Map<string, HomepageItem>,
  base: string,
  locale: Locale,
  theme: (typeof WORKFLOW_THEMES)[number],
): WorkflowTheme {
  const lookup = (id: string) =>
    ["skill", "server", "agent", "hook", "tool"]
      .map((kind) => index.get(indexKey(kind as HomepageItem["kind"], id)))
      .find((item): item is HomepageItem => Boolean(item));

  const primary =
    theme.primaryIds
      .map(lookup)
      .find((item): item is HomepageItem => Boolean(item))
    ?? theme.relatedIds
      .map(lookup)
      .find((item): item is HomepageItem => Boolean(item))
    ?? null;

  const related = theme.relatedIds
    .map(lookup)
    .filter((item): item is HomepageItem => Boolean(item) && item.id !== primary?.id);

  return {
    key: theme.key,
    primary,
    related,
    browseHref: localizedUrl(base, theme.browseHref, locale),
  };
}

export function buildHomepageCuration(
  entries: {
    skills: Skill[];
    agents: Agent[];
    servers: Server[];
    tools: Tool[];
    hooks: Hook[];
  },
  base: string,
  locale: Locale,
): HomepageCuration {
  const skills = entries.skills.map((entry) => skillEntry(entry, base, locale));
  const agents = entries.agents.map((entry) => agentEntry(entry, base, locale));
  const servers = entries.servers.map((entry) => serverEntry(entry, base, locale));
  const tools = entries.tools.map((entry) => toolEntry(entry, base, locale));
  const hooks = entries.hooks.map((entry) => hookEntry(entry, base, locale));

  const index = buildIndex([...skills, ...agents, ...servers, ...tools, ...hooks]);

  return {
    featuredSkills: pickCurated(skills, FEATURED_IDS.skills),
    featuredAgents: pickCurated(agents, FEATURED_IDS.agents),
    featuredServers: pickCurated(servers, FEATURED_IDS.servers),
    featuredTools: pickCurated(tools, FEATURED_IDS.tools),
    featuredHooks: pickCurated(hooks, FEATURED_IDS.hooks),
    workflowEssentials: WORKFLOW_THEMES.map((theme) => resolveTheme(index, base, locale, theme)),
  };
}
