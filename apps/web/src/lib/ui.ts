import { marked } from "marked";

export type Kind = "skill" | "server" | "agent" | "collection" | "doc" | "hook" | "command" | "tool";

const KIND_GLYPHS: Record<Kind, string> = {
  skill: "SK",
  server: "MCP",
  agent: "AG",
  collection: "COL",
  doc: "DOC",
  hook: "HK",
  command: "CMD",
  tool: "TL",
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
  return marked.parse(body, { async: false, gfm: true, breaks: false }) as string;
}
