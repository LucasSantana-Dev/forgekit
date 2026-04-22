/**
 * Tiny GitHub fetch helpers for importers.
 *
 * - Uses raw.githubusercontent.com for file content (CDN, no rate limit hassle).
 * - Uses api.github.com only for directory listings, with optional token from
 *   GITHUB_TOKEN / GH_TOKEN to lift the 60 req/hr unauthenticated ceiling.
 */

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const h: Record<string, string> = { "User-Agent": "adtl-importer" };
  if (token) h.Authorization = `Bearer ${token}`;
  h.Accept = "application/vnd.github+json";
  h["X-GitHub-Api-Version"] = "2022-11-28";
  return h;
}

export async function listDirs(owner: string, repo: string, pathInRepo: string, ref = "main"): Promise<string[]> {
  const url = `${API}/repos/${owner}/${repo}/contents/${pathInRepo}?ref=${ref}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const entries = (await res.json()) as Array<{ name: string; type: string }>;
  return entries.filter((e) => e.type === "dir").map((e) => e.name).sort();
}

export async function rawText(owner: string, repo: string, pathInRepo: string, ref = "main"): Promise<string | null> {
  const url = `${RAW}/${owner}/${repo}/${ref}/${pathInRepo}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return await res.text();
}

export async function exists(owner: string, repo: string, pathInRepo: string, ref = "main"): Promise<boolean> {
  const url = `${RAW}/${owner}/${repo}/${ref}/${pathInRepo}`;
  const res = await fetch(url, { method: "HEAD" });
  return res.ok;
}

export function repoHomepage(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}
