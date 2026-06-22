#!/usr/bin/env node
/**
 * skill-leak-check — fail CI if an authored skill body leaks maintainer-environment
 * specifics into the public, distributable catalog.
 *
 * Decision: docs/decisions/2026-06-22-skill-leak-lint.md
 *
 * Denylist is intentionally a list of LITERAL maintainer tokens, NOT generic
 * pattern-classes. Generic patterns (e.g. /Users/<name>, /Volumes/) would
 * false-positive on the catalog's own placeholder examples (/Users/jdoe,
 * /Users/yourname, /Users/user, /Users/dev). `~/.claude/` and `$HOME` are the
 * standard, portable config locations and are NOT leaks.
 *
 * MAINTENANCE: when you set up a new dev machine, add its username / external-disk
 * name / hostname to DENYLIST below. The lint is the forcing function — if it ever
 * goes red on a real maintainer token, scrub the skill, don't relax the lint.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Literal maintainer tokens. Case-insensitive substring match.
const DENYLIST = [
  '/Users/lucassantana',  // maintainer home-dir path leak
  '-Users-lucassantana',  // ...and its claude-project-slug form (-Users-lucassantana-...)
  '/Volumes/External HD', // maintainer's external disk (worktree-root + RAG cache live here)
  'oac-workstation',      // maintainer homelab hostname
  // NOTE 1: the bare token 'lucassantana' is intentionally NOT listed — it would
  //         false-positive on the project's PUBLIC GitHub org `github.com/LucasSantana-Dev/...`,
  //         which is a legitimate reference. Only FILESYSTEM-path forms are leaks.
  // NOTE 2: 'Lucky' (maintainer prod project) is intentionally NOT listed — too generic
  //         a word to denylist without false positives. Scrub Lucky references by review.
];

const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['packages', 'locales']; // authored skill homes

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
      walk(full, out);
    } else if (e.name === 'SKILL.md') {
      out.push(full);
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const findings = [];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const token of DENYLIST) {
      if (line.toLowerCase().includes(token.toLowerCase())) {
        findings.push({ file: path.relative(ROOT, file), line: i + 1, token, text: line.trim().slice(0, 120) });
      }
    }
  });
}

if (findings.length === 0) {
  console.log(`skill-leak-check: OK — ${files.length} skill files clean (no maintainer-env leaks).`);
  process.exit(0);
}

console.error(`skill-leak-check: FAIL — ${findings.length} maintainer-env leak(s) in ${new Set(findings.map((f) => f.file)).size} file(s):\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [${f.token}]  ${f.text}`);
}
console.error(`\nGenericize these (use ~, $HOME, <project>, <worktree-root>) or add a justified allow-comment. See docs/decisions/2026-06-22-skill-leak-lint.md`);
process.exit(1);
