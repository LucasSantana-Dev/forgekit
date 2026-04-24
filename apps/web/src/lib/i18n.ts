export type Locale = "en" | "pt-br";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "pt-br"] as const;

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(pathname: string): Locale {
  const segments = pathname.replace(/^\/+/, "").split("/");
  if (segments[0] === "pt-br") return "pt-br";
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

export function localizeEntry<T extends EntryLike>(
  entry: T,
  locale: Locale,
): T {
  if (locale === "pt-br" && entry.translations?.["pt-BR"]) {
    const pt = entry.translations["pt-BR"];
    return {
      ...entry,
      ...(entry.name !== undefined && pt.name ? { name: pt.name } : {}),
      ...(entry.title !== undefined && pt.title ? { title: pt.title } : {}),
      ...(pt.description ? { description: pt.description } : {}),
    };
  }
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
    "nav.servers": "Servers",
    "nav.tools": "Tools",
    "nav.hooks": "Hooks",
    "nav.commands": "Commands",
    "nav.docs": "Docs",
    "nav.github": "GitHub",
    "nav.brand": "Forge Kit",

    "a11y.skipToContent": "Skip to main content",
    "a11y.primaryNav": "Primary",

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
    "list.skills.description": "{count} skills for AI-assisted dev.",
    "list.servers.title": "MCP Servers",
    "list.servers.description": "{count} MCP servers ready to wire up.",
    "list.agents.title": "Sub-agents",
    "list.agents.description": "{count} Claude Code sub-agents.",
    "list.tools.title": "Tools",
    "list.tools.description": "{count} developer tools.",
    "list.hooks.title": "Hooks",
    "list.hooks.description": "{count} hooks for Claude Code.",
    "list.commands.title": "Commands",
    "list.commands.description": "{count} slash commands.",
    "list.docs.title": "Docs",
    "list.docs.description": "{count} documents.",
    "list.collections.title": "Collections",
    "list.collections.description": "{count} opinionated bundles.",
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
  "pt-br": {
    "nav.skills": "Skills",
    "nav.collections": "Coleções",
    "nav.agents": "Agentes",
    "nav.servers": "Servidores",
    "nav.tools": "Ferramentas",
    "nav.hooks": "Hooks",
    "nav.commands": "Comandos",
    "nav.docs": "Documentação",
    "nav.github": "GitHub",
    "nav.brand": "Forge Kit",

    "a11y.skipToContent": "Pular para o conteúdo principal",
    "a11y.primaryNav": "Navegação principal",

    "footer.source": "Código-fonte",
    "footer.license": "MIT",
    "footer.builtWith": "Feito com",
    "footer.runsOn": "rodando em",

    "language.label": "Idioma",
    "language.en": "English",
    "language.pt-br": "Português (Brasil)",

    "home.title": "Catálogo",
    "home.headline": "O catálogo do Forge Kit",
    "home.lede":
      "Skills, sub-agentes, servidores MCP, hooks, comandos e ferramentas curados para desenvolvimento assistido por IA. Grátis, auto-hospedável, inspirado em skills.sh e mcpmarket.com.",
    "home.eyebrow": "Catálogo editorial premium",
    "home.commandTitle": "Instale um item por vez",
    "home.commandNote": "Cada item instala com seu próprio comando. Sem mega-script — leia o guia de instalação para entender o que cada comando faz.",
    "home.commandExample": "Troque <slug> por qualquer id do catálogo.",
    "home.commandGuideCta": "Leia o guia de instalação",
    "home.metric.collections": "Coleções",
    "home.metric.depth": "Categorias ativas",
    "home.metric.install": "Caminho de instalação",
    "home.metric.flow": "Itens curados",
    "home.ctaBrowse": "Ver {count} itens",
    "home.ctaQuickstart": "Guia de instalação",
    "home.stat.skills": "Skills",
    "home.stat.agents": "Agentes",
    "home.stat.servers": "Servidores",
    "home.stat.tools": "Ferramentas",
    "home.stat.hooks": "Hooks",
    "home.stat.commands": "Comandos",
    "home.stat.docs": "Docs",
    "home.section.collections": "Coleções em destaque",
    "home.section.collectionsLede":
      "Bundles prontos — pontos de partida com um clique.",
    "home.collections.title": "Pontos de partida curados",
    "home.collections.lede":
      "As coleções agrupam o catálogo em caminhos guiados, em vez de uma lista crua de categorias.",
    "home.section.skills": "Skills populares",
    "home.section.agents": "Sub-agentes",
    "home.section.servers": "Servidores MCP",
    "home.section.tools": "Ferramentas",
    "home.section.toolsLede":
      "Otimização de tokens, RAG, compressão, operações MCP, diagnóstico.",
    "home.section.hooks": "Hooks",
    "home.section.workflow": "Essenciais do fluxo",
    "home.section.workflowLede":
      "Os itens que entram primeiro na prática: contexto compacto, recuperação e hooks para economizar tokens.",
    "home.section.tags": "Navegar por tag",
    "home.allOf": "Todos os {count} {kind} →",

    "home.workflow.exploreAll": "Abrir busca do fluxo",
    "home.workflow.browse": "Ver categoria",
    "home.workflow.fallback": "Ver esta área",
    "home.workflow.compact.title": "Contexto compacto",
    "home.workflow.compact.lede":
      "Mantenha as sessões leves, preserve o estado ativo e compacte antes de estourar o contexto.",
    "home.workflow.rag.title": "RAG",
    "home.workflow.rag.lede":
      "Monte bundles de contexto por tarefa em vez de ler arquivos às cegas.",
    "home.workflow.rtk.title": "RTK",
    "home.workflow.rtk.lede":
      "Deixe hooks de economia de tokens reescreverem comandos barulhentos automaticamente.",

    "installCopy.label": "Copiar comando",
    "installCopy.copied": "✓ copiado",

    "list.skills.title": "Skills",
    "list.skills.description": "{count} skills para dev com IA.",
    "list.servers.title": "Servidores MCP",
    "list.servers.description": "{count} servidores MCP prontos para conectar.",
    "list.agents.title": "Sub-agentes",
    "list.agents.description": "{count} sub-agentes do Claude Code.",
    "list.tools.title": "Ferramentas",
    "list.tools.description": "{count} ferramentas para desenvolvedores.",
    "list.hooks.title": "Hooks",
    "list.hooks.description": "{count} hooks para o Claude Code.",
    "list.commands.title": "Comandos",
    "list.commands.description": "{count} comandos de barra.",
    "list.docs.title": "Documentação",
    "list.docs.description": "{count} documentos.",
    "list.collections.title": "Coleções",
    "list.collections.description": "{count} bundles curados.",
    "list.collections.intro": "Comece por aqui",
    "list.collections.introLede": "Bundles curados que funcionam bem como ponto de partida.",

    "search.placeholder": "Buscar…",
    "search.filterByTag": "Filtrar por tag",
    "search.allTags": "Todas as tags",
    "search.noResults": "Sem resultados.",

    "entry.tags": "Tags",
    "entry.homepage": "Site",
    "entry.license": "Licença",
    "entry.version": "Versão",
    "entry.author": "Autor",
    "entry.source": "Código-fonte",
    "entry.install": "Instalar",
    "entry.editors": "Editores",
    "entry.model": "Modelo",
    "entry.transport": "Transporte",
    "entry.event": "Evento",
    "entry.category": "Categoria",
    "entry.runtime": "Runtime",
    "entry.notFound": "Não encontrado.",

    "search.title": "Buscar",
    "search.heading": "Buscar na biblioteca",
    "search.count": "{count} resultados",
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

export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `${locale}/`;
}

export function pluralizeItems(count: number, locale: Locale): string {
  if (locale === "pt-br") return count === 1 ? `${count} item` : `${count} itens`;
  return count === 1 ? `${count} item` : `${count} items`;
}

export function switchLocalePath(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/pt-br(\/|$)/, "/");
  if (target === "en") return stripped;
  const trimmed = stripped.startsWith("/") ? stripped.slice(1) : stripped;
  return `/pt-br/${trimmed}`;
}

export function localizedUrl(
  base: string,
  path: string,
  locale: Locale,
): string {
  const clean = path.replace(/^\//, "");
  if (locale === "en") return `${base}${clean}`;
  return `${base}pt-br/${clean}`;
}
