/**
 * Blocking secrets scanner for catalog imports.
 *
 * Returns a non-empty array of findings = caller MUST abort. Each finding
 * carries the file, 1-based line number, and a short preview so humans can fix.
 */

export interface SecretFinding {
  file: string;
  line: number;
  pattern: string;
  preview: string;
}

interface Rule {
  name: string;
  re: RegExp;
}

// High-signal patterns. Keep tight to minimize false positives — every hit
// aborts the import.
const RULES: Rule[] = [
  { name: "personal-email", re: /lucas\.diassantana@[a-z0-9.-]+/gi },
  { name: "github-classic-pat", re: /\bghp_[A-Za-z0-9]{36}\b/g },
  { name: "github-oauth", re: /\bgho_[A-Za-z0-9]{36}\b/g },
  { name: "github-fine-grained", re: /\bgithub_pat_[A-Za-z0-9_]{82}\b/g },
  { name: "openai-key", re: /\bsk-[A-Za-z0-9]{32,}\b/g },
  { name: "anthropic-key", re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "slack-bot-token", re: /\bxoxb-[0-9A-Za-z-]+\b/g },
  { name: "slack-user-token", re: /\bxoxp-[0-9A-Za-z-]+\b/g },
  { name: "private-key-header", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/g },
];

export function scanText(file: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      if (rule.re.test(lines[i])) {
        findings.push({
          file,
          line: i + 1,
          pattern: rule.name,
          preview: lines[i].slice(0, 160),
        });
      }
    }
  }
  return findings;
}

export function formatFindings(findings: SecretFinding[]): string {
  return findings
    .map((f) => `  ${f.file}:${f.line} [${f.pattern}] ${f.preview.trim()}`)
    .join("\n");
}
