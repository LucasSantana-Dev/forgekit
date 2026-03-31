import { describe, test, expect } from '@jest/globals'
import { validateCompany, validateAll } from '../scripts/validate-schemas.js'
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
