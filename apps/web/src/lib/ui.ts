import { marked } from "marked";

export type Kind = "skill" | "server" | "agent" | "collection" | "doc" | "hook" | "command" | "tool";

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
    case "hook":
      return "🪝";
    case "command":
      return "⚡";
    case "tool":
      return "🛠";
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
