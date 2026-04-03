import { describe, test, expect } from '@jest/globals'
import { validateCompany, validateAll, validateKit } from '../scripts/validate-schemas.js'
import { runParityAudit } from '../scripts/parity-audit.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const companiesDir = path.join(__dirname, '../companies')

describe('validateCompany', () => {
  test('fullstack-forge passes all validations', () => {
    const errors = validateCompany(path.join(companiesDir, 'fullstack-forge'))
    expect(errors).toEqual([])
  })

  test('returns error when agents/ directory missing', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-company-'))
    fs.mkdirSync(path.join(tmpDir, 'skills'))
    const errors = validateCompany(tmpDir)
    expect(errors.some(e => e.includes('Missing agents/'))).toBe(true)
    fs.rmSync(tmpDir, { recursive: true })
  })

  test('returns error when skills/ directory missing', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-company-'))
    fs.mkdirSync(path.join(tmpDir, 'agents'))
    const errors = validateCompany(tmpDir)
    expect(errors.some(e => e.includes('Missing skills/'))).toBe(true)
    fs.rmSync(tmpDir, { recursive: true })
  })

  test('returns error for agent missing required fields', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-company-'))
    const agentDir = path.join(tmpDir, 'agents', 'test-agent')
    const skillDir = path.join(tmpDir, 'skills', 'test-skill')
    fs.mkdirSync(agentDir, { recursive: true })
    fs.mkdirSync(skillDir, { recursive: true })
    fs.writeFileSync(path.join(agentDir, 'AGENTS.md'), '---\nname: Test\n---\n## What triggers you\n## What you do\n## What you produce\n## Who you hand off to')
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: Test Skill\n---\n')
    const errors = validateCompany(tmpDir)
    expect(errors.some(e => e.includes('missing field: title'))).toBe(true)
    fs.rmSync(tmpDir, { recursive: true })
  })

  test('returns error for agent referencing non-existent skill', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-company-'))
    const agentDir = path.join(tmpDir, 'agents', 'eng')
    const skillDir = path.join(tmpDir, 'skills', 'real-skill')
    fs.mkdirSync(agentDir, { recursive: true })
    fs.mkdirSync(skillDir, { recursive: true })
    fs.writeFileSync(path.join(agentDir, 'AGENTS.md'), '---\nname: Eng\ntitle: Engineer\nskills:\n  - missing-skill\n---\n## What triggers you\n## What you do\n## What you produce\n## Who you hand off to')
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: Real Skill\n---\n')
    const errors = validateCompany(tmpDir)
    expect(errors.some(e => e.includes('unknown skill: missing-skill'))).toBe(true)
    fs.rmSync(tmpDir, { recursive: true })
  })
})

describe('validateAll', () => {
  test('companies/ directory passes full validation', () => {
    expect(() => validateAll(companiesDir)).not.toThrow()
  })
})

const rootDir = path.join(__dirname, '..')

describe('validateKit', () => {
  test('kit/core configs and skills pass all validations', () => {
    const errors = validateKit(rootDir)
    expect(errors).toEqual([])
  })

  test('all core JSON configs parse successfully', () => {
    const configs = [
      'kit/core/agents.json',
      'kit/core/routing.json',
      'kit/core/providers.json',
      'kit/core/autopilot.json',
      'kit/core/token-optimization.json',
      'kit/core/loop.json',
      'kit/core/hooks.json',
      'kit/core/mcp.json',
    ]
    for (const cfg of configs) {
      const full = path.join(rootDir, cfg)
      expect(() => JSON.parse(fs.readFileSync(full, 'utf8'))).not.toThrow()
    }
  })

  test('every agent references a valid tier', () => {
    const agents = JSON.parse(fs.readFileSync(path.join(rootDir, 'kit/core/agents.json'), 'utf8'))
    for (const [, agent] of Object.entries(agents.agents)) {
      expect(['haiku', 'sonnet', 'opus']).toContain(agent.tier)
    }
  })

  test('every agent has a tools access list', () => {
    const agents = JSON.parse(fs.readFileSync(path.join(rootDir, 'kit/core/agents.json'), 'utf8'))
    for (const [, agent] of Object.entries(agents.agents)) {
      expect(agent.tools).toBeDefined()
      expect(Array.isArray(agent.tools)).toBe(true)
      expect(agent.tools.length).toBeGreaterThan(0)
    }
  })

  test('hooks.json has rules and tool mapping', () => {
    const hooks = JSON.parse(fs.readFileSync(path.join(rootDir, 'kit/core/hooks.json'), 'utf8'))
    expect(hooks.hooks).toBeDefined()
    expect(Object.keys(hooks.hooks).length).toBeGreaterThanOrEqual(4)
    expect(hooks.toolMapping).toBeDefined()
    for (const [, hook] of Object.entries(hooks.hooks)) {
      expect(hook.description).toBeDefined()
      expect(hook.rules.length).toBeGreaterThan(0)
    }
  })

  test('token-optimization has cost tracking config', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(rootDir, 'kit/core/token-optimization.json'), 'utf8'))
    expect(cfg.cost).toBeDefined()
    expect(cfg.cost.tracking).toBeDefined()
    expect(cfg.cost.budgets).toBeDefined()
  })

  test('parity audit runs and reports all adapters', () => {
    const audit = runParityAudit()
    expect(audit.results.length).toBe(6)
    expect(audit.skills.length).toBeGreaterThanOrEqual(16)
    expect(audit.configs.length).toBeGreaterThanOrEqual(7)
    for (const r of audit.results) {
      expect(r.features.rules).toBe(true)
      expect(r.features.skills).toBe(true)
    }
  })

  test('every skill has name, description, and triggers', () => {
    const skillsDir = path.join(rootDir, 'kit/core/skills')
    const skills = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'))
    expect(skills.length).toBeGreaterThanOrEqual(16)
    for (const skill of skills) {
      const content = fs.readFileSync(path.join(skillsDir, skill), 'utf8')
      expect(content).toMatch(/^---\n/)
      expect(content).toMatch(/name:/)
      expect(content).toMatch(/description:/)
      expect(content).toMatch(/triggers:/)
    }
  })

  test('loop.json has governance section', () => {
    const loop = JSON.parse(fs.readFileSync(path.join(rootDir, 'kit/core/loop.json'), 'utf8'))
    expect(loop.loop.governance).toBeDefined()
    expect(loop.loop.governance.requiredBeforeCommit).toBeDefined()
    expect(loop.loop.governance.blockOn).toBeDefined()
  })
})
