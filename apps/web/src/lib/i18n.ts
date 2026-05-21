export type Locale = "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en"] as const;

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(_pathname: string): Locale {
  return "en";
}

interface EntryLike {
  name?: string;
  title?: string;
  description: string;
  translations?: {
    "pt-BR"?: { name?: string; title?: string; description?: string };
  };
}

export function localizeEntry<T extends EntryLike>(entry: T, _locale: Locale): T {
  return entry;
}

export function localizeEntries<T extends EntryLike>(
  entries: T[],
  locale: Locale,
): T[] {
  return entries.map((e) => localizeEntry(e, locale));
}

export const SHELL: Record<Locale, Record<string, string>> = {
  en: {
    "nav.skills": "Skills",
    "nav.collections": "Collections",
    "nav.agents": "Agents",
    "nav.servers": "MCP",
    "nav.tools": "Tools",
    "nav.hooks": "Hooks",
    "nav.commands": "Commands",
    "nav.providers": "Providers",
    "nav.docs": "Docs",
    "nav.tutorials": "Tutorials",
    "nav.github": "GitHub",
    "nav.brand": "Forge Kit",

    "a11y.skipToContent": "Skip to main content",
    "a11y.primaryNav": "Primary",

    "usage.title": "Usage",
    "usage.useWhen": "Use when",
    "usage.skipWhen": "Skip when",
    "usage.prereqs": "Prerequisites",
    "usage.resources": "Resources",
    "usage.meta.difficulty": "Install",
    "usage.meta.setup": "Setup",
    "usage.difficulty.easy": "Easy",
    "usage.difficulty.medium": "Medium",
    "usage.difficulty.hard": "Hard",
    "usage.setup.seconds": "Seconds",
    "usage.setup.minutes": "Minutes",
    "usage.setup.hours": "Hours",
    "usage.res.ram": "RAM",
    "usage.res.storage": "Storage",
    "usage.res.compute": "Compute",
    "usage.res.network": "Network",
    "usage.res.cost": "Cost",
    "usage.compute.cpu-light": "CPU · light",
    "usage.compute.cpu-moderate": "CPU · moderate",
    "usage.compute.cpu-heavy": "CPU · heavy",
    "usage.compute.gpu-optional": "GPU · optional",
    "usage.compute.gpu-required": "GPU · required",
    "usage.network.offline": "Offline",
    "usage.network.online": "Online",
    "usage.network.online-optional": "Online · optional",
    "usage.cost.free": "Free",
    "usage.cost.paid-optional": "Paid tier optional",
    "usage.cost.paid-required": "Paid",
    "usage.cost.metered-api": "Metered API",

    "footer.source": "Source",
    "footer.license": "MIT",
    "footer.builtWith": "Built with",
    "footer.runsOn": "runs on",

    "language.label": "Language",
    "language.en": "English",
    "language.pt-br": "Português (Brasil)",

    "home.title": "Catalog",
    "home.headline": "The Forge Kit catalog",
    "home.lede":
      "Curated skills, sub-agents, MCP servers, hooks, commands, and tools for AI-assisted dev. Free, self-hosted, inspired by skills.sh and mcpmarket.com.",
    "home.eyebrow": "Premium editorial catalog",
    "home.commandTitle": "Install one at a time",
    "home.commandNote": "Each entry installs with its own command. No mega-script — read the install guide to see what every command does.",
    "home.commandExample": "Replace <slug> with any id from the catalog.",
    "home.commandGuideCta": "Read the install guide",
    "home.metric.collections": "Collections",
    "home.metric.depth": "Live categories",
    "home.metric.install": "Install path",
    "home.metric.flow": "Curated entries",
    "home.ctaBrowse": "Browse {count} entries",
    "home.ctaQuickstart": "Installation guide",
    "home.stat.skills": "Skills",
    "home.stat.agents": "Agents",
    "home.stat.servers": "Servers",
    "home.stat.tools": "Tools",
    "home.stat.hooks": "Hooks",
    "home.stat.commands": "Commands",
    "home.stat.docs": "Docs",
    "home.section.collections": "Featured collections",
    "home.section.collectionsLede":
      "Opinionated bundles — one-click starting points.",
    "home.collections.title": "Curated starting points",
    "home.collections.lede":
      "Collections bundle the catalog into guided entry paths instead of raw category lists.",
    "home.section.skills": "Popular skills",
    "home.section.agents": "Sub-agents",
    "home.section.servers": "MCP servers",
    "home.section.tools": "Tools",
    "home.section.toolsLede":
      "Token optimization, RAG, compression, MCP ops, diagnostics.",
    "home.section.hooks": "Hooks",
    "home.section.workflow": "Workflow essentials",
    "home.section.workflowLede":
      "The pieces people reach for first: compact context, retrieval, and token-saving hooks.",
    "home.section.tags": "Browse by tag",
    "home.allOf": "All {count} {kind} →",

    "home.workflow.exploreAll": "Open workflow search",
    "home.workflow.browse": "Browse category",
    "home.workflow.fallback": "Browse this area",
    "home.workflow.compact.title": "Compact context",
    "home.workflow.compact.lede":
      "Keep sessions lean, preserve active state, and compact before the session runs hot.",
    "home.workflow.rag.title": "RAG",
    "home.workflow.rag.lede":
      "Build task-aware context bundles instead of reading files blindly.",
    "home.workflow.rtk.title": "RTK",
    "home.workflow.rtk.lede":
      "Let token-savings hooks rewrite noisy commands automatically.",

    "installCopy.label": "Copy command",
    "installCopy.copied": "✓ copied",

    "list.skills.title": "Skills",
    "list.skills.description": "Browse {count} installable Claude Code skills — context, RAG, planning, testing, security, and more, grouped by category.",
    "list.servers.title": "MCP Servers",
    "list.servers.description": "Curated MCP servers ({count}) ready to register with your local mcp-context-forge gateway. Docker, Kubernetes, GitHub, Linear, and more.",
    "list.agents.title": "Sub-agents",
    "list.agents.description": "{count} Claude Code sub-agents — code reviewers, debuggers, planners, and architects you can install with one command.",
    "list.tools.title": "Tools",
    "list.tools.description": "{count} standalone developer CLIs — token optimization, RAG ops, MCP diagnostics, install scripts. Land in ~/.local/bin.",
    "list.hooks.title": "Hooks",
    "list.hooks.description": "{count} Claude Code hooks — shell scripts that fire on tool events for security, validation, context injection, and automation.",
    "list.commands.title": "Commands",
    "list.commands.description": "Catalog of {count} Claude Code slash commands — install with npx forge-kit install, lands in ~/.claude/commands/.",
    "list.docs.title": "Docs",
    "list.docs.description": "Reference documents on AI-assisted development — observability, RAG architecture, model routing, persona-driven workflows, and more.",
    "list.collections.title": "Collections",
    "list.collections.description": "{count} curated forgekit bundles — opinionated entry points combining skills, agents, hooks, and MCP servers for common workflows.",
    "list.collections.intro": "Start here",
    "list.collections.introLede": "Curated bundles that work well as entry points.",

    "search.placeholder": "Search…",
    "search.filterByTag": "Filter by tag",
    "search.allTags": "All tags",
    "search.noResults": "No results.",

    "entry.tags": "Tags",
    "entry.homepage": "Homepage",
    "entry.license": "License",
    "entry.version": "Version",
    "entry.author": "Author",
    "entry.source": "Source",
    "entry.install": "Install",
    "entry.editors": "Editors",
    "entry.model": "Model",
    "entry.transport": "Transport",
    "entry.event": "Event",
    "entry.category": "Category",
    "entry.runtime": "Runtime",
    "entry.notFound": "Not found.",

    "search.title": "Search",
    "search.heading": "Search the library",
    "search.count": "{count} results",
  },
};

export function t(
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const raw = SHELL[locale][key] ?? SHELL.en[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    raw,
  );
}

export function localePrefix(_locale: Locale): string {
  return "";
}

export function pluralizeItems(count: number, _locale: Locale): string {
  return count === 1 ? `${count} item` : `${count} items`;
}

export function switchLocalePath(pathname: string, _target: Locale): string {
  return pathname.replace(/^\/pt-br(\/|$)/, "/");
}

export function localizedUrl(
  base: string,
  path: string,
  _locale: Locale,
): string {
  const clean = path.replace(/^\//, "");
  return `${base}${clean}`;
}
