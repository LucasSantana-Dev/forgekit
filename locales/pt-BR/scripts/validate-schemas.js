import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";
import Ajv from "ajv";

const REQUIRED_AGENT_FIELDS = ["name", "title", "skills"];
const REQUIRED_AGENT_SECTIONS = [
  "## What triggers you",
  "## What you do",
  "## What you produce",
  "## Who you hand off to",
];

const __filename = fileURLToPath(import.meta.url);

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return parseYaml(match[1]);
}

export function validateCompany(companyDir) {
  const errors = [];

  const agentsDir = path.join(companyDir, "agents");
  const skillsDir = path.join(companyDir, "skills");

  if (!fs.existsSync(agentsDir)) {
    errors.push(`Missing agents/ directory in ${companyDir}`);
    return errors;
  }
  if (!fs.existsSync(skillsDir)) {
    errors.push(`Missing skills/ directory in ${companyDir}`);
    return errors;
  }

  const agentNames = fs.readdirSync(agentsDir);
  const skillNames = fs.readdirSync(skillsDir);

  if (agentNames.length === 0) errors.push("Company has no agents");
  if (skillNames.length === 0) errors.push("Company has no skills");

  for (const agent of agentNames) {
    const agentFile = path.join(agentsDir, agent, "AGENTS.md");
    if (!fs.existsSync(agentFile)) {
      errors.push(`Missing AGENTS.md for agent: ${agent}`);
      continue;
    }

    const content = fs.readFileSync(agentFile, "utf8");
    const fm = extractFrontmatter(content);

    if (!fm) {
      errors.push(`No frontmatter in ${agent}/AGENTS.md`);
      continue;
    }

    for (const field of REQUIRED_AGENT_FIELDS) {
      if (!fm[field]) errors.push(`Agent ${agent} missing field: ${field}`);
    }

    for (const section of REQUIRED_AGENT_SECTIONS) {
      if (!content.includes(section)) {
        errors.push(`Agent ${agent} missing section: ${section}`);
      }
    }

    if (
      fm.reportsTo &&
      fm.reportsTo !== null &&
      !agentNames.includes(fm.reportsTo)
    ) {
      errors.push(`Agent ${agent} reportsTo unknown agent: ${fm.reportsTo}`);
    }

    if (Array.isArray(fm.skills)) {
      for (const skill of fm.skills) {
        if (!skillNames.includes(skill)) {
          errors.push(`Agent ${agent} references unknown skill: ${skill}`);
        }
      }
    }
  }

  for (const skill of skillNames) {
    const skillFile = path.join(skillsDir, skill, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      errors.push(`Missing SKILL.md for skill: ${skill}`);
      continue;
    }
    const content = fs.readFileSync(skillFile, "utf8");
    const fm = extractFrontmatter(content);
    if (!fm || !fm.name) {
      errors.push(`Skill ${skill} missing name in frontmatter`);
    }
  }

  return errors;
}

export function validateAll(companiesDir = "./companies") {
  const companies = fs
    .readdirSync(companiesDir)
    .filter((d) => fs.statSync(path.join(companiesDir, d)).isDirectory());

  let total = 0;
  for (const company of companies) {
    const errors = validateCompany(path.join(companiesDir, company));
    for (const e of errors) {
      console.error(`ERROR [${company}]: ${e}`);
      total++;
    }
    if (errors.length === 0) {
      const agentsCount = fs.readdirSync(
        path.join(companiesDir, company, "agents"),
      ).length;
      const skillsCount = fs.readdirSync(
        path.join(companiesDir, company, "skills"),
      ).length;
      console.log(
        `✓ ${company} — agents: ${agentsCount}, skills: ${skillsCount}`,
      );
    }
  }

  if (total > 0) {
    console.error(`\n${total} validation error(s) found.`);
    process.exit(1);
  }
  console.log("\nAll validations passed.");
}

const REQUIRED_SKILL_FIELDS = ["name", "description", "triggers"];

const REQUIRED_KIT_CONFIGS = [
  "kit/core/agents.json",
  "kit/core/routing.json",
  "kit/core/providers.json",
  "kit/core/autopilot.json",
  "kit/core/token-optimization.json",
  "kit/core/loop.json",
  "kit/core/hooks.json",
  "kit/core/mcp.json",
];

const VALID_TIERS = ["haiku", "sonnet", "opus"];

function validateJsonSchema(rootDir, configPath) {
  const full = path.join(rootDir, configPath);
  const parsed = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!parsed.$schema) {
    return [`Missing $schema in ${configPath}`];
  }

  const schemaPath = path.resolve(path.dirname(full), parsed.$schema);
  if (!fs.existsSync(schemaPath)) {
    return [`Missing schema file for ${configPath}: ${parsed.$schema}`];
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(parsed);
  if (valid) return [];

  return (validate.errors || []).map((error) => {
    const location = error.instancePath || "/";
    return `Schema validation failed for ${configPath} at ${location}: ${error.message}`;
  });
}

export function validateKit(rootDir = ".") {
  const errors = [];

  for (const configPath of REQUIRED_KIT_CONFIGS) {
    const full = path.join(rootDir, configPath);
    if (!fs.existsSync(full)) {
      errors.push(`Missing config: ${configPath}`);
      continue;
    }
    try {
      JSON.parse(fs.readFileSync(full, "utf8"));
    } catch {
      errors.push(`Invalid JSON: ${configPath}`);
      continue;
    }
    errors.push(...validateJsonSchema(rootDir, configPath));
  }

  const agentsPath = path.join(rootDir, "kit/core/agents.json");
  if (fs.existsSync(agentsPath)) {
    const agents = JSON.parse(fs.readFileSync(agentsPath, "utf8"));
    const toolRegistry = agents.toolRegistry || {};
    const toolNames = new Set(Object.keys(toolRegistry));

    if (toolNames.size === 0) {
      errors.push("Agents config missing toolRegistry entries");
    }

    for (const [name, agent] of Object.entries(agents.agents || {})) {
      if (!VALID_TIERS.includes(agent.tier)) {
        errors.push(`Agent ${name} has invalid tier: ${agent.tier}`);
      }
      if (!agent.role) errors.push(`Agent ${name} missing role`);
      if (agent.fallback && !agent.fallback.chain) {
        errors.push(`Agent ${name} has fallback without chain`);
      }
      if (
        !agent.tools ||
        !Array.isArray(agent.tools) ||
        agent.tools.length === 0
      ) {
        errors.push(`Agent ${name} missing tools access list`);
      }
      for (const tool of agent.tools || []) {
        if (!toolNames.has(tool)) {
          errors.push(`Agent ${name} references unknown tool: ${tool}`);
        }
      }
      if (!agent.title) errors.push(`Agent ${name} missing title`);
      if (agent.reportsTo && !agents.agents[agent.reportsTo]) {
        errors.push(
          `Agent ${name} reportsTo unknown agent: ${agent.reportsTo}`,
        );
      }
    }

    if (agents.orgChart) {
      for (const [mgr, org] of Object.entries(agents.orgChart)) {
        if (!agents.agents[mgr]) {
          errors.push(`Org chart references unknown manager: ${mgr}`);
        }
        for (const report of org.directReports || []) {
          if (!agents.agents[report]) {
            errors.push(`Org chart: ${mgr} has unknown report: ${report}`);
          }
        }
      }
    }
  }

  const hooksPath = path.join(rootDir, "kit/core/hooks.json");
  if (fs.existsSync(hooksPath)) {
    const hooks = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
    const hookTypes = Object.keys(hooks.hooks || {});
    if (hookTypes.length === 0) errors.push("Hooks has no hook types defined");
    for (const hookType of hookTypes) {
      const hook = hooks.hooks[hookType];
      if (!hook.description) {
        errors.push(`Hook ${hookType} missing description`);
      }
      if (!hook.rules || hook.rules.length === 0) {
        errors.push(`Hook ${hookType} has no rules`);
      }
    }
    if (!hooks.toolMapping) errors.push("Hooks missing toolMapping section");
  }

  const routingPath = path.join(rootDir, "kit/core/routing.json");
  if (fs.existsSync(routingPath)) {
    const routing = JSON.parse(fs.readFileSync(routingPath, "utf8"));
    for (const [cat, def] of Object.entries(routing.categories || {})) {
      if (!VALID_TIERS.includes(def.tier)) {
        errors.push(`Routing category ${cat} has invalid tier: ${def.tier}`);
      }
    }
  }

  const skillsDir = path.join(rootDir, "kit/core/skills");
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));
    if (skills.length === 0) errors.push("No core skills found");
    for (const skill of skills) {
      const content = fs.readFileSync(path.join(skillsDir, skill), "utf8");
      const fm = extractFrontmatter(content);
      if (!fm) {
        errors.push(`No frontmatter in skill: ${skill}`);
        continue;
      }
      for (const field of REQUIRED_SKILL_FIELDS) {
        if (!fm[field]) errors.push(`Skill ${skill} missing field: ${field}`);
      }
    }
  }

  return errors;
}

if (process.argv[1] === __filename) {
  validateAll(path.join(path.dirname(__filename), "..", "companies"));

  const kitErrors = validateKit(path.join(path.dirname(__filename), ".."));
  for (const e of kitErrors) {
    console.error(`ERROR [kit]: ${e}`);
  }
  if (kitErrors.length > 0) {
    console.error(`\n${kitErrors.length} kit validation error(s) found.`);
    process.exit(1);
  }
}
