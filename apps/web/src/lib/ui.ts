import { marked } from "marked";

export type Kind = "skill" | "server" | "agent" | "collection" | "doc" | "hook" | "command" | "tool" | "tutorial";

const KIND_GLYPHS: Record<Kind, string> = {
  skill: "SK",
  server: "MCP",
  agent: "AG",
  collection: "COL",
  doc: "DOC",
  hook: "HK",
  command: "CMD",
  tool: "TL",
  tutorial: "TUT",
};

const KIND_ICONS: Record<Kind, string> = {
  skill: "✦",
  server: "⌬",
  agent: "◌",
  collection: "▣",
  doc: "▤",
  hook: "↯",
  command: "⌘",
  tool: "⚙",
  tutorial: "▷",
};

const ACRONYM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/^adt\s+/i, ""],
  [/\bai\b/gi, "AI"],
  [/\bapi\b/gi, "API"],
  [/\bci cd\b/gi, "CI/CD"],
  [/\bmcp\b/gi, "MCP"],
  [/\brag\b/gi, "RAG"],
  [/\brtk\b/gi, "RTK"],
];

export function displayEntryName(name: string): string {
  return ACRONYM_REPLACEMENTS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, replacement);
  }, name);
}

export function kindGlyph(kind: Kind): string {
  return KIND_GLYPHS[kind];
}

export function kindIcon(kind: Kind): string {
  return KIND_ICONS[kind];
}

export function kindLabel(kind: Kind): string {
  switch (kind) {
    case "skill":
      return "Skill";
    case "server":
      return "MCP server";
    case "agent":
      return "Agent";
    case "collection":
      return "Collection";
    case "doc":
      return "Doc";
    case "hook":
      return "Hook";
    case "command":
      return "Command";
    case "tool":
      return "Tool";
    case "tutorial":
      return "Tutorial";
  }
}

export function installCommand(kind: Kind, id: string): string | null {
  if (kind === "skill" || kind === "agent" || kind === "hook" || kind === "command" || kind === "tool") {
    return `npx forge-kit install ${id}`;
  }
  if (kind === "server") return `npx forge-kit add-server ${id}`;
  return null;
}

export function renderMarkdown(body: string): string {
  const html = marked.parse(body, { async: false, gfm: true, breaks: false }) as string;
  return labelTaskListCheckboxes(demoteHeadings(rewriteCatalogLinks(html)));
}

export interface TabSection {
  label: string;
  id: string;
  content: string;
}

export interface TabsResult {
  preamble: string;
  tabs: TabSection[];
}

const TAB_HEADINGS: ReadonlyArray<{ label: string; id: string }> = [
  { label: "IDE", id: "ide" },
  { label: "CLI", id: "cli" },
];

/**
 * Splits rendered HTML into tab sections if `<h2>IDE</h2>` or `<h2>CLI</h2>`
 * headings are present (after `demoteHeadings()` has run). Returns null when
 * no tab headings are found so the caller can render a plain article instead.
 */
export function splitIntoTabs(html: string): TabsResult | null {
  const headingPattern = TAB_HEADINGS.map((t) => t.label).join("|");
  const regex = new RegExp(`<h2>(${headingPattern})</h2>`, "gi");
  const matches: Array<{ label: string; index: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    matches.push({ label: m[1]!, index: m.index, end: m.index + m[0]!.length });
  }
  if (matches.length === 0) return null;
  const preamble = html.slice(0, matches[0]!.index);
  const rawTabs: TabSection[] = matches.map((match, i) => {
    const contentStart = match.end;
    const contentEnd = i + 1 < matches.length ? matches[i + 1]!.index : html.length;
    const tabEntry = TAB_HEADINGS.find((t) => t.label.toLowerCase() === match.label.toLowerCase());
    return {
      label: match.label,
      id: tabEntry?.id ?? match.label.toLowerCase(),
      content: html.slice(contentStart, contentEnd),
    };
  });

  // Deduplicate by merging content of tabs with the same id
  const tabs: TabSection[] = [];
  for (const rawTab of rawTabs) {
    const existing = tabs.find((t) => t.id === rawTab.id);
    if (existing) {
      existing.content += rawTab.content;
    } else {
      tabs.push(rawTab);
    }
  }

  return { preamble, tabs };
}

/**
 * Catalog markdown bodies frequently link to sibling files via relative
 * `./foo.md` or `../packages/core/patterns/foo.md` references. Once rendered
 * onto the website those become 404s — they resolve to nonexistent `.md`
 * URLs under the current page directory, and many of the targets aren't
 * even published as doc pages (they live in `packages/core/`).
 *
 * Rather than guess which references happen to map to a published `/docs/`
 * route, strip the `<a>` wrapper from any link whose href ends in `.md` (or
 * `.md#anchor`). The visible link text is preserved as inline `<code>`,
 * keeping the citation but removing the broken navigation. Authors who
 * want a real cross-link can write an absolute `/docs/<slug>/` path.
 */
function rewriteCatalogLinks(html: string): string {
  return html.replace(
    /<a\s+[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
    (match, href, inner) => {
      if (/^(https?:|mailto:|#)/.test(href)) return match;
      const path = href.split(/[?#]/, 1)[0];
      if (!/\.md$/i.test(path)) return match;
      // Strip any leading <code> the author already added so we don't double-wrap.
      const text = inner.replace(/^<code>([\s\S]*)<\/code>$/, "$1");
      return `<code>${text}</code>`;
    },
  );
}

/**
 * Detail pages already render a page-level `<h1>` via `EntryHeader.astro`,
 * so any `<h1>` inside the markdown body becomes a duplicate that axe and
 * squirrelscan flag as an SEO error. Demote `<h1>` to `<h2>` (and skip a
 * level cascade — body authors who wrote `# Title` then `## Section` should
 * still see them as `<h2>` and `<h2>` respectively, since the leading
 * "title" h1 only existed because they thought of the body as a doc).
 */
function demoteHeadings(html: string): string {
  return html.replace(/<(\/?)h1(\s|>)/g, "<$1h2$2");
}

/**
 * GFM task-list items render as bare `<input type="checkbox">` without a label,
 * which axe-core flags as a critical `label` violation. Wrap each task-list `<li>`
 * in a `<label>` so the checkbox's accessible name is the surrounding text.
 *
 * The `<li>` must contain a leading `<input type="checkbox">` (marked's emit shape).
 * We also tag the `<li>` with `task-list-item` and the `<label>` with
 * `task-list-label` so detail-page CSS can flatten the layout if needed.
 */
function labelTaskListCheckboxes(html: string): string {
  return html.replace(
    /<li>(\s*)(<input(?=[^>]*\btype="checkbox")[^>]*>)([\s\S]*?)<\/li>/g,
    (_match, ws, input, rest) =>
      `<li class="task-list-item">${ws}<label class="task-list-label">${input}${rest}</label></li>`,
  );
}

// ---------- Category derivation ----------

/**
 * Tag-based category mapping. The first matching rule wins so put more specific
 * rules first. Use this to group skills/agents/docs/collections into broader,
 * human-readable buckets instead of grouping by their (often generic) first tag.
 */
const CATEGORY_RULES: ReadonlyArray<{ name: string; tags: readonly string[] }> = [
  { name: "Setup & Install", tags: ["setup", "install", "onboarding"] },
  { name: "Documentation", tags: ["docs", "reference", "library", "documents", "document", "research"] },
  { name: "Version Control", tags: ["vcs", "github", "git", "version-control", "pr"] },
  { name: "Project Management", tags: ["project-mgmt", "linear", "jira", "tickets"] },
  { name: "Infrastructure", tags: ["infra", "containers", "homelab", "kubernetes", "docker", "ops"] },
  { name: "Browser & Automation", tags: ["browser", "automation", "scraping", "playwright"] },
  { name: "Memory & Storage", tags: ["memory", "knowledge-graph", "persistence", "database", "cache", "queue"] },
  { name: "Code & IDE", tags: ["code-nav", "lsp", "ide", "refactor"] },
  { name: "Observability", tags: ["observability", "monitoring", "telemetry", "errors", "triage"] },
  { name: "MCP Operations", tags: ["mcp-ops", "mcp-gateway", "mcp"] },
  { name: "Diagnostics", tags: ["diagnostics", "health", "validate"] },
  { name: "Release", tags: ["release", "publish"] },
  { name: "Training", tags: ["training", "evaluation", "fine-tuning"] },
  { name: "Testing", tags: ["testing", "test", "qa"] },
  { name: "Security", tags: ["security", "secrets"] },
  { name: "Deploy & CI", tags: ["deploy", "ci-cd", "ci"] },
  { name: "Planning & Specs", tags: ["planning", "specs", "spec-driven"] },
  { name: "Design & UX", tags: ["design", "ux", "ui"] },
  { name: "Communications", tags: ["comms", "writing", "docs-writing"] },
  { name: "Agents & Orchestration", tags: ["agents", "orchestration", "multi-agent"] },
  { name: "RAG & Retrieval", tags: ["rag", "retrieval", "vector-search"] },
  { name: "Prompting & Models", tags: ["prompting", "model-routing", "llm"] },
  { name: "Debugging", tags: ["debugging", "debug", "tracing"] },
  { name: "Tokens & Performance", tags: ["token-optimization", "optimization", "tokens", "performance"] },
  { name: "Maintenance", tags: ["maintenance", "cleanup"] },
  { name: "API & Backend", tags: ["api", "sql", "backend"] },
  { name: "Engineering", tags: ["engineering"] },
];

const GENERIC_TAGS: ReadonlySet<string> = new Set([
  "skill-md",
  "ai-dev-toolkit",
  "core",
  "community",
  "anthropic-official",
  "superpowers",
  "claude",
]);

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1)))
    .join(" ");
}

// ---------- Provider derivation ----------

export type Provider = "claude" | "codex" | "gemini" | "local" | "cursor" | "any";

interface ProviderInfo {
  id: Provider;
  label: string;
  /** Tag fragments that signal the entry targets this provider. Lower-cased substring match. */
  tagSignals: readonly string[];
}

const PROVIDERS: ReadonlyArray<ProviderInfo> = [
  {
    id: "claude",
    label: "Claude",
    tagSignals: ["claude", "anthropic", "claude-code", "claude-api", "anthropic-official"],
  },
  { id: "codex", label: "Codex", tagSignals: ["codex", "openai", "gpt"] },
  { id: "gemini", label: "Gemini", tagSignals: ["gemini", "google-ai"] },
  { id: "cursor", label: "Cursor", tagSignals: ["cursor"] },
  { id: "local", label: "Local", tagSignals: ["local-llm", "ollama", "vllm", "lm-studio"] },
];

export const PROVIDER_ORDER: ReadonlyArray<Provider> = ["claude", "codex", "gemini", "cursor", "local", "any"];

export function providerLabel(p: Provider): string {
  if (p === "any") return "Any provider";
  return PROVIDERS.find((info) => info.id === p)?.label ?? p;
}

/**
 * Derive the primary provider for an entry from its tags. Defaults to "claude"
 * because the installer lands files in `~/.claude/` and that's the supported runtime.
 * Returns "any" only when an entry explicitly avoids any provider hint AND lives in
 * a provider-agnostic catalog kind (e.g. generic docs).
 */
export function deriveProvider(tags: readonly string[] | undefined): Provider {
  const lowered = (tags ?? []).map((t) => t.toLowerCase());
  for (const info of PROVIDERS) {
    if (info.tagSignals.some((sig) => lowered.includes(sig))) return info.id;
  }
  return "claude";
}

const PROVIDER_BLURBS: Record<Provider, string> = {
  claude:
    "Anything that lands in ~/.claude/ — the catalog default. Skills, agents, hooks, and commands compose into a single Claude Code session. Ship-ready: every entry is install-tested via npx forge-kit install.",
  codex:
    "Entries wired for OpenAI Codex agents. Skills map to AGENTS.md conventions, model-routing helpers cover GPT-4o through o3, and security patterns guard tool-call surfaces against prompt injection.",
  gemini:
    "Skills and guides for the Gemini CLI and Vertex AI. Covers long-context caching to cut token costs, Google Search grounding for live data, and end-to-end deployment on GCP.",
  cursor:
    "Cursor-specific integration: port forgekit skills to .mdc glob-scoped rules, wire MCP servers via ~/.cursor/mcp.json, and learn when to use Tab completions versus the Composer agent.",
  local:
    "Run Llama, Qwen, Mistral, or other open-weight models on your own hardware. Runtimes covered: Ollama, vLLM, and LM Studio. Includes a compatibility matrix so you know which skills work at smaller context windows.",
  any: "Provider-agnostic entries that work across Claude Code, Codex, Gemini, Cursor, and local runtimes. Good starting points regardless of which AI tool you are running.",
};

export function getProviderBlurb(p: Provider): string {
  return PROVIDER_BLURBS[p];
}

/**
 * Derive a broad, human-readable category for an entry from its tag list.
 * Falls back to the first non-generic tag, then to a caller-provided default.
 */
export function deriveCategory(tags: readonly string[] | undefined, fallback: string = "Other"): string {
  const tagSet = new Set((tags ?? []).map((t) => t.toLowerCase()));
  for (const rule of CATEGORY_RULES) {
    if (rule.tags.some((t) => tagSet.has(t))) return rule.name;
  }
  for (const tag of tags ?? []) {
    if (!GENERIC_TAGS.has(tag.toLowerCase())) return titleCase(tag);
  }
  return fallback;
}
