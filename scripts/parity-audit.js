import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.join(path.dirname(__filename), "..");

const FEATURES = [
  { id: "rules", label: "Rules file", check: "FORGE_RULES" },
  { id: "skills", label: "Skills install", check: "install_skills" },
  { id: "hooks", label: "Hooks manifest", check: "FORGE_HOOKS" },
  { id: "mcp", label: "MCP merge", check: "FORGE_MCP" },
  { id: "providers", label: "Providers config", check: "FORGE_PROVIDERS" },
  { id: "durable", label: "Durable execution", check: "FORGE_DURABLE" },
  { id: "ohmy", label: "Oh-my compat", check: "FORGE_OHMY_COMPAT" },
];

const ADAPTERS = [
  "claude-code",
  "codex",
  "opencode",
  "cursor",
  "windsurf",
  "antigravity",
];

function auditAdapter(name) {
  const adapterPath = path.join(rootDir, "kit", "adapters", `${name}.sh`);
  if (!fs.existsSync(adapterPath)) return null;

  const content = fs.readFileSync(adapterPath, "utf8");
  const result = { name, features: {} };

  for (const feature of FEATURES) {
    result.features[feature.id] = content.includes(feature.check);
  }

  return result;
}

function auditSkills() {
  const skillsDir = path.join(rootDir, "kit", "core", "skills");
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

function auditConfigs() {
  const coreDir = path.join(rootDir, "kit", "core");
  if (!fs.existsSync(coreDir)) return [];
  return fs.readdirSync(coreDir).filter((f) => f.endsWith(".json"));
}

export function runParityAudit() {
  const results = ADAPTERS.map(auditAdapter).filter(Boolean);
  const skills = auditSkills();
  const configs = auditConfigs();

  const header = ["Feature", ...results.map((r) => r.name)];
  const rows = FEATURES.map((f) => [
    f.label,
    ...results.map((r) => (r.features[f.id] ? "✓" : "✗")),
  ]);

  const colWidths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length)),
  );
  const pad = (s, w) => s + " ".repeat(w - s.length);
  const line = colWidths.map((w) => "─".repeat(w)).join("─┼─");

  console.log("\nParity Audit: adapter feature support");
  console.log("═".repeat(line.length + 4));
  console.log(header.map((h, i) => pad(h, colWidths[i])).join(" │ "));
  console.log(line);
  for (const row of rows) {
    console.log(row.map((c, i) => pad(c, colWidths[i])).join(" │ "));
  }

  const total = results.map((r) => {
    const supported = Object.values(r.features).filter(Boolean).length;
    return `${r.name}: ${supported}/${FEATURES.length}`;
  });
  console.log("\nCoverage: " + total.join(", "));

  console.log(`\nSkills: ${skills.length} (${skills.join(", ")})`);
  console.log(`Configs: ${configs.length} (${configs.join(", ")})`);

  const gaps = [];
  for (const r of results) {
    for (const f of FEATURES) {
      if (!r.features[f.id]) {
        gaps.push(`${r.name} missing: ${f.label}`);
      }
    }
  }

  if (gaps.length > 0) {
    console.log(`\nGaps (${gaps.length}):`);
    for (const gap of gaps) {
      console.log(`  ✗ ${gap}`);
    }
  } else {
    console.log("\n✓ Full parity across all adapters");
  }

  return { results, skills, configs, gaps };
}

const QUALITY_CHECKS = [
  {
    id: "agents-have-fallback",
    label: "All agents have fallback chains",
    check: (root) => {
      const p = path.join(root, "kit/core/agents.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return Object.values(d.agents).every(
        (a) => a.fallback?.chain?.length > 0,
      );
    },
  },
  {
    id: "agents-have-tools",
    label: "All agents have tool access lists",
    check: (root) => {
      const p = path.join(root, "kit/core/agents.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return Object.values(d.agents).every((a) => a.tools?.length > 0);
    },
  },
  {
    id: "routing-has-classifier",
    label: "Routing has complexity classifier",
    check: (root) => {
      const p = path.join(root, "kit/core/routing.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.classifier;
    },
  },
  {
    id: "loop-has-governance",
    label: "Loop has governance gates",
    check: (root) => {
      const p = path.join(root, "kit/core/loop.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.loop?.governance;
    },
  },
  {
    id: "hooks-have-profiles",
    label: "Hooks have runtime profiles",
    check: (root) => {
      const p = path.join(root, "kit/core/hooks.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.runtimeControls?.profiles;
    },
  },
  {
    id: "autopilot-default-autonomous",
    label: "Autopilot defaults to autonomous",
    check: (root) => {
      const p = path.join(root, "kit/core/autopilot.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return d.defaultLevel === "autonomous";
    },
  },
  {
    id: "cost-tracking-enabled",
    label: "Cost tracking configured",
    check: (root) => {
      const p = path.join(root, "kit/core/token-optimization.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.cost?.tracking;
    },
  },
  {
    id: "skills-count-gte-15",
    label: "15+ portable skills",
    check: (root) => {
      const d = path.join(root, "kit/core/skills");
      if (!fs.existsSync(d)) return false;
      return fs.readdirSync(d).filter((f) => f.endsWith(".md")).length >= 15;
    },
  },
  {
    id: "mcp-profiles-defined",
    label: "MCP server profiles defined",
    check: (root) => {
      const p = path.join(root, "kit/core/mcp.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.profiles && Object.keys(d.profiles).length >= 2;
    },
  },
  {
    id: "org-chart-defined",
    label: "Agent org chart defined",
    check: (root) => {
      const p = path.join(root, "kit/core/agents.json");
      if (!fs.existsSync(p)) return false;
      const d = JSON.parse(fs.readFileSync(p, "utf8"));
      return !!d.orgChart && Object.keys(d.orgChart).length > 0;
    },
  },
];

export function runHarnessAudit(rootDir = ".") {
  console.log("\nHarness Quality Audit");
  console.log("═".repeat(50));

  let passed = 0;
  const total = QUALITY_CHECKS.length;

  for (const check of QUALITY_CHECKS) {
    const ok = check.check(rootDir);
    console.log(`  ${ok ? "✓" : "✗"} ${check.label}`);
    if (ok) passed++;
  }

  const score = Math.round((passed / total) * 100);
  const grade =
    score >= 90
      ? "A"
      : score >= 75
        ? "B"
        : score >= 60
          ? "C"
          : score >= 40
            ? "D"
            : "F";

  console.log(`\nScore: ${passed}/${total} (${score}%) — Grade: ${grade}`);
  return { passed, total, score, grade };
}

if (process.argv[1] === __filename) {
  runParityAudit();
  runHarnessAudit();
}
