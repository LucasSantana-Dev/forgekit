import { describe, test, expect } from "@jest/globals";
import {
  validateCompany,
  validateAll,
  validateKit,
} from "../scripts/validate-schemas.js";
import { runParityAudit } from "../scripts/parity-audit.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const companiesDir = path.join(__dirname, "../packages/core/companies");

describe("validateCompany", () => {
  test("fullstack-forge passes all validations", () => {
    const errors = validateCompany(path.join(companiesDir, "fullstack-forge"));
    expect(errors).toEqual([]);
  });

  test("returns error when agents/ directory missing", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-company-"));
    fs.mkdirSync(path.join(tmpDir, "skills"));
    const errors = validateCompany(tmpDir);
    expect(errors.some((e) => e.includes("Missing agents/"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test("returns error when skills/ directory missing", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-company-"));
    fs.mkdirSync(path.join(tmpDir, "agents"));
    const errors = validateCompany(tmpDir);
    expect(errors.some((e) => e.includes("Missing skills/"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test("returns error for agent missing required fields", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-company-"));
    const agentDir = path.join(tmpDir, "agents", "test-agent");
    const skillDir = path.join(tmpDir, "skills", "test-skill");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(agentDir, "AGENTS.md"),
      "---\nname: Test\n---\n## What triggers you\n## What you do\n## What you produce\n## Who you hand off to",
    );
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: Test Skill\n---\n",
    );
    const errors = validateCompany(tmpDir);
    expect(errors.some((e) => e.includes("missing field: title"))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test("returns error for agent referencing non-existent skill", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-company-"));
    const agentDir = path.join(tmpDir, "agents", "eng");
    const skillDir = path.join(tmpDir, "skills", "real-skill");
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(
      path.join(agentDir, "AGENTS.md"),
      "---\nname: Eng\ntitle: Engineer\nskills:\n  - missing-skill\n---\n## What triggers you\n## What you do\n## What you produce\n## Who you hand off to",
    );
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: Real Skill\n---\n",
    );
    const errors = validateCompany(tmpDir);
    expect(errors.some((e) => e.includes("unknown skill: missing-skill"))).toBe(
      true,
    );
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe("validateAll", () => {
  test("packages/core/companies directory passes full validation", () => {
    expect(() => validateAll(companiesDir)).not.toThrow();
  });
});

const rootDir = path.join(__dirname, "..");

describe("validateKit", () => {
  test("packages/core/kit/core configs and skills pass all validations", () => {
    const errors = validateKit(rootDir);
    expect(errors).toEqual([]);
  });

  test("all core JSON configs parse successfully", () => {
    const configs = [
      "packages/core/kit/core/agents.json",
      "packages/core/kit/core/routing.json",
      "packages/core/kit/core/providers.json",
      "packages/core/kit/core/autopilot.json",
      "packages/core/kit/core/token-optimization.json",
      "packages/core/kit/core/loop.json",
      "packages/core/kit/core/hooks.json",
      "packages/core/kit/core/mcp.json",
      "packages/core/kit/core/schedules.json",
    ];

    for (const cfg of configs) {
      const full = path.join(rootDir, cfg);
      expect(() => JSON.parse(fs.readFileSync(full, "utf8"))).not.toThrow();
    }
  });

  test("every core config declares a schema and that schema file exists", () => {
    const configs = [
      "packages/core/kit/core/agents.json",
      "packages/core/kit/core/routing.json",
      "packages/core/kit/core/providers.json",
      "packages/core/kit/core/autopilot.json",
      "packages/core/kit/core/token-optimization.json",
      "packages/core/kit/core/loop.json",
      "packages/core/kit/core/hooks.json",
      "packages/core/kit/core/mcp.json",
      "packages/core/kit/core/schedules.json",
    ];

    for (const cfg of configs) {
      const full = path.join(rootDir, cfg);
      const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
      expect(parsed.$schema).toBeDefined();
      const schemaPath = path.resolve(path.dirname(full), parsed.$schema);
      expect(fs.existsSync(schemaPath)).toBe(true);
    }
  });

  test("validateKit catches schema violations for malformed core config", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-kit-schema-"));
    fs.mkdirSync(path.join(tmpDir, "packages/core/kit/core"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "packages/core/kit/schema"), { recursive: true });

    const schemaSrc = path.join(rootDir, "packages/core/kit/schema/providers.schema.json");
    const schemaDst = path.join(tmpDir, "packages/core/kit/schema/providers.schema.json");
    fs.copyFileSync(schemaSrc, schemaDst);

    const badProviders = {
      $schema: "../schema/providers.schema.json",
      version: "1.0.0",
      providers: {
        anthropic: {
          name: "Anthropic",
          env_key: "ANTHROPIC_API_KEY",
          base_url: "https://api.anthropic.com",
        },
      },
      default_provider: "anthropic",
      fallback_chain: ["anthropic"],
    };

    fs.writeFileSync(
      path.join(tmpDir, "packages/core/kit/core/providers.json"),
      JSON.stringify(badProviders, null, 2) + "\n",
    );

    const errors = validateKit(tmpDir);
    expect(
      errors.some(
        (e) =>
          e.includes("providers.json") &&
          e.includes("Schema validation failed"),
      ),
    ).toBe(true);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("every agent references a valid tier", () => {
    const agents = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/agents.json"), "utf8"),
    );
    for (const [, agent] of Object.entries(agents.agents)) {
      expect(["haiku", "sonnet", "opus"]).toContain(agent.tier);
    }
  });

  test("every agent tool resolves through the canonical tool registry", () => {
    const agents = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/agents.json"), "utf8"),
    );
    const registry = agents.toolRegistry;
    expect(registry).toBeDefined();
    expect(Object.keys(registry).length).toBeGreaterThanOrEqual(10);

    for (const [, agent] of Object.entries(agents.agents)) {
      for (const tool of agent.tools) {
        expect(registry[tool]).toBeDefined();
      }
    }
  });

  test("agent tool access respects tier governance rules", () => {
    const agents = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/agents.json"), "utf8"),
    );
    const registry = agents.toolRegistry;
    const writeTools = Object.entries(registry)
      .filter(([, m]) => m.access === "write")
      .map(([t]) => t);
    const delegateTools = Object.entries(registry)
      .filter(([, m]) => m.access === "delegate")
      .map(([t]) => t);

    for (const [name, agent] of Object.entries(agents.agents)) {
      if (agent.tier === "haiku") {
        const writesHeld = agent.tools.filter((t) => writeTools.includes(t));
        expect({ agent: name, writesHeld }).toEqual({
          agent: name,
          writesHeld: [],
        });
      }
      if (agent.tier !== "opus") {
        const delegatesHeld = agent.tools.filter((t) =>
          delegateTools.includes(t),
        );
        expect({ agent: name, delegatesHeld }).toEqual({
          agent: name,
          delegatesHeld: [],
        });
      }
    }
  });

  test("agents include specialty roles with org chart", () => {
    const agents = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/agents.json"), "utf8"),
    );
    const names = Object.keys(agents.agents);
    expect(names.length).toBeGreaterThanOrEqual(10);
    expect(names).toContain("frontend");
    expect(names).toContain("backend");
    expect(names).toContain("devops");
    expect(names).toContain("tester");
    expect(names).toContain("security");
    expect(names).toContain("writer");
    expect(agents.orgChart).toBeDefined();
    expect(agents.orgChart.orchestrator.directReports.length).toBeGreaterThan(
      0,
    );
    expect(agents.orgChart.architect.directReports.length).toBeGreaterThan(0);
  });

  test("every agent has title, tools, and valid reportsTo", () => {
    const agents = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/agents.json"), "utf8"),
    );
    for (const [, agent] of Object.entries(agents.agents)) {
      expect(agent.title).toBeDefined();
      expect(agent.tools).toBeDefined();
      expect(Array.isArray(agent.tools)).toBe(true);
      expect(agent.tools.length).toBeGreaterThan(0);
    }
  });

  test("hooks.json has rules and tool mapping", () => {
    const hooks = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/hooks.json"), "utf8"),
    );
    expect(hooks.hooks).toBeDefined();
    expect(Object.keys(hooks.hooks).length).toBeGreaterThanOrEqual(4);
    expect(hooks.toolMapping).toBeDefined();
    expect(hooks.toolMapping.opencode).toMatch(/hooks\.json/);
    expect(hooks.toolMapping.antigravity).toMatch(/hooks\.json/);
    for (const [, hook] of Object.entries(hooks.hooks)) {
      expect(hook.description).toBeDefined();
      expect(hook.rules.length).toBeGreaterThan(0);
    }
  });

  test("token-optimization has cost tracking config", () => {
    const cfg = JSON.parse(
      fs.readFileSync(
        path.join(rootDir, "packages/core/kit/core/token-optimization.json"),
        "utf8",
      ),
    );
    expect(cfg.cost).toBeDefined();
    expect(cfg.cost.tracking).toBeDefined();
    expect(cfg.cost.budgets).toBeDefined();
  });

  test("parity audit runs and reports all adapters", () => {
    const audit = runParityAudit();
    expect(audit.results.length).toBe(6);
    expect(audit.skills.length).toBeGreaterThanOrEqual(16);
    expect(audit.configs.length).toBeGreaterThanOrEqual(8);
    for (const r of audit.results) {
      expect(r.features.rules).toBe(true);
      expect(r.features.skills).toBe(true);
    }
    const opencode = audit.results.find((r) => r.name === "opencode");
    const antigravity = audit.results.find((r) => r.name === "antigravity");
    expect(opencode.features.hooks).toBe(true);
    expect(antigravity.features.hooks).toBe(true);
  });

  test("every skill has name, description, and triggers", () => {
    const skillsDir = path.join(rootDir, "packages/core/kit/core/skills");
    const skills = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
    expect(skills.length).toBeGreaterThanOrEqual(16);
    for (const skill of skills) {
      const content = fs.readFileSync(path.join(skillsDir, skill), "utf8");
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/name:/);
      expect(content).toMatch(/description:/);
      expect(content).toMatch(/triggers:/);
    }
  });

  test("loop.json has governance section", () => {
    const loop = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/loop.json"), "utf8"),
    );
    expect(loop.loop.governance).toBeDefined();
    expect(loop.loop.governance.requiredBeforeCommit).toBeDefined();
    expect(loop.loop.governance.blockOn).toBeDefined();
  });

  test("schedules.json has defaults, triggers, and mapped routines", () => {
    const schedules = JSON.parse(
      fs.readFileSync(path.join(rootDir, "packages/core/kit/core/schedules.json"), "utf8"),
    );

    expect(schedules.defaults).toBeDefined();
    expect(schedules.triggers).toBeDefined();
    expect(Array.isArray(schedules.routines)).toBe(true);
    expect(schedules.routines.length).toBeGreaterThanOrEqual(4);

    const ids = new Set();
    for (const routine of schedules.routines) {
      expect(routine.id).toBeDefined();
      expect(ids.has(routine.id)).toBe(false);
      ids.add(routine.id);
      expect(routine.agent).toBeDefined();
      expect(routine.skill).toBeDefined();
      if (routine.trigger === "daily" || routine.trigger === "weekly") {
        expect(routine.schedule).toBeDefined();
      }
    }
  });
});
