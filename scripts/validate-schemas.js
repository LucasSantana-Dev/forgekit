import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse as parseYaml } from 'yaml'

const REQUIRED_AGENT_FIELDS = ['name', 'title', 'skills']
const REQUIRED_AGENT_SECTIONS = [
  '## What triggers you',
  '## What you do',
  '## What you produce',
  '## Who you hand off to',
]

const __filename = fileURLToPath(import.meta.url)

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  return parseYaml(match[1])
}

export function validateCompany(companyDir) {
  const errors = []

  const agentsDir = path.join(companyDir, 'agents')
  const skillsDir = path.join(companyDir, 'skills')

  if (!fs.existsSync(agentsDir)) {
    errors.push(`Missing agents/ directory in ${companyDir}`)
    return errors
  }
  if (!fs.existsSync(skillsDir)) {
    errors.push(`Missing skills/ directory in ${companyDir}`)
    return errors
  }

  const agentNames = fs.readdirSync(agentsDir)
  const skillNames = fs.readdirSync(skillsDir)

  if (agentNames.length === 0) errors.push('Company has no agents')
  if (skillNames.length === 0) errors.push('Company has no skills')

  for (const agent of agentNames) {
    const agentFile = path.join(agentsDir, agent, 'AGENTS.md')
    if (!fs.existsSync(agentFile)) {
      errors.push(`Missing AGENTS.md for agent: ${agent}`)
      continue
    }

    const content = fs.readFileSync(agentFile, 'utf8')
    const fm = extractFrontmatter(content)

    if (!fm) {
      errors.push(`No frontmatter in ${agent}/AGENTS.md`)
      continue
    }

    for (const field of REQUIRED_AGENT_FIELDS) {
      if (!fm[field]) errors.push(`Agent ${agent} missing field: ${field}`)
    }

    for (const section of REQUIRED_AGENT_SECTIONS) {
      if (!content.includes(section)) errors.push(`Agent ${agent} missing section: ${section}`)
    }

    if (fm.reportsTo && fm.reportsTo !== null && !agentNames.includes(fm.reportsTo)) {
      errors.push(`Agent ${agent} reportsTo unknown agent: ${fm.reportsTo}`)
    }

    if (Array.isArray(fm.skills)) {
      for (const skill of fm.skills) {
        if (!skillNames.includes(skill)) {
          errors.push(`Agent ${agent} references unknown skill: ${skill}`)
        }
      }
    }
  }

  for (const skill of skillNames) {
    const skillFile = path.join(skillsDir, skill, 'SKILL.md')
    if (!fs.existsSync(skillFile)) {
      errors.push(`Missing SKILL.md for skill: ${skill}`)
      continue
    }
    const content = fs.readFileSync(skillFile, 'utf8')
    const fm = extractFrontmatter(content)
    if (!fm || !fm.name) errors.push(`Skill ${skill} missing name in frontmatter`)
  }

  return errors
}

export function validateAll(companiesDir = './companies') {
  const companies = fs.readdirSync(companiesDir).filter(d =>
    fs.statSync(path.join(companiesDir, d)).isDirectory()
  )

  let total = 0
  for (const company of companies) {
    const errors = validateCompany(path.join(companiesDir, company))
    for (const e of errors) {
      console.error(`ERROR [${company}]: ${e}`)
      total++
    }
    if (errors.length === 0) {
      const agentsCount = fs.readdirSync(path.join(companiesDir, company, 'agents')).length
      const skillsCount = fs.readdirSync(path.join(companiesDir, company, 'skills')).length
      console.log(`✓ ${company} — agents: ${agentsCount}, skills: ${skillsCount}`)
    }
  }

  if (total > 0) {
    console.error(`\n${total} validation error(s) found.`)
    process.exit(1)
  }
  console.log('\nAll validations passed.')
}

if (process.argv[1] === __filename) {
  validateAll()
}
