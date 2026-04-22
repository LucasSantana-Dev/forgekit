import { marked } from "marked";

export type Kind = "skill" | "server" | "agent" | "collection" | "doc";

export function kindIcon(kind: Kind): string {
  switch (kind) {
    case "skill":
      return "🎯";
    case "server":
      return "🔌";
    case "agent":
      return "🤖";
    case "collection":
      return "📦";
    case "doc":
      return "📖";
  }
}

export function installCommand(kind: Kind, id: string): string | null {
  if (kind === "skill" || kind === "agent") return `npx @lucassantana/adtl install ${id}`;
  if (kind === "server") return `npx @lucassantana/adtl add-server ${id}`;
  return null;
}

export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false, gfm: true, breaks: false }) as string;
}
