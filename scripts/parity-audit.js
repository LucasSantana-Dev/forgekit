import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const rootDir = path.join(path.dirname(__filename), '..')

const FEATURES = [
  { id: 'rules', label: 'Rules file', check: 'FORGE_RULES' },
  { id: 'skills', label: 'Skills install', check: 'install_skills' },
  { id: 'mcp', label: 'MCP merge', check: 'FORGE_MCP' },
  { id: 'providers', label: 'Providers config', check: 'FORGE_PROVIDERS' },
  { id: 'durable', label: 'Durable execution', check: 'FORGE_DURABLE' },
  { id: 'ohmy', label: 'Oh-my compat', check: 'FORGE_OHMY_COMPAT' },
]

const ADAPTERS = ['claude-code', 'codex', 'opencode', 'cursor', 'windsurf', 'antigravity']

function auditAdapter(name) {
  const adapterPath = path.join(rootDir, 'kit', 'adapters', `${name}.sh`)
  if (!fs.existsSync(adapterPath)) return null

  const content = fs.readFileSync(adapterPath, 'utf8')
  const result = { name, features: {} }

  for (const feature of FEATURES) {
    result.features[feature.id] = content.includes(feature.check)
  }

  return result
}

function auditSkills() {
  const skillsDir = path.join(rootDir, 'kit', 'core', 'skills')
  if (!fs.existsSync(skillsDir)) return []
  return fs.readdirSync(skillsDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
}

function auditConfigs() {
  const coreDir = path.join(rootDir, 'kit', 'core')
  if (!fs.existsSync(coreDir)) return []
  return fs.readdirSync(coreDir).filter(f => f.endsWith('.json'))
}

export function runParityAudit() {
  const results = ADAPTERS.map(auditAdapter).filter(Boolean)
  const skills = auditSkills()
  const configs = auditConfigs()

  const header = ['Feature', ...results.map(r => r.name)]
  const rows = FEATURES.map(f => [
    f.label,
    ...results.map(r => r.features[f.id] ? '✓' : '✗'),
  ])

  const colWidths = header.map((h, i) => Math.max(h.length, ...rows.map(r => r[i].length)))
  const pad = (s, w) => s + ' '.repeat(w - s.length)
  const line = colWidths.map(w => '─'.repeat(w)).join('─┼─')

  console.log('\nParity Audit: adapter feature support')
  console.log('═'.repeat(line.length + 4))
  console.log(header.map((h, i) => pad(h, colWidths[i])).join(' │ '))
  console.log(line)
  for (const row of rows) {
    console.log(row.map((c, i) => pad(c, colWidths[i])).join(' │ '))
  }

  const total = results.map(r => {
    const supported = Object.values(r.features).filter(Boolean).length
    return `${r.name}: ${supported}/${FEATURES.length}`
  })
  console.log('\nCoverage: ' + total.join(', '))

  console.log(`\nSkills: ${skills.length} (${skills.join(', ')})`)
  console.log(`Configs: ${configs.length} (${configs.join(', ')})`)

  const gaps = []
  for (const r of results) {
    for (const f of FEATURES) {
      if (!r.features[f.id]) {
        gaps.push(`${r.name} missing: ${f.label}`)
      }
    }
  }

  if (gaps.length > 0) {
    console.log(`\nGaps (${gaps.length}):`)
    for (const gap of gaps) {
      console.log(`  ✗ ${gap}`)
    }
  } else {
    console.log('\n✓ Full parity across all adapters')
  }

  return { results, skills, configs, gaps }
}

if (process.argv[1] === __filename) {
  runParityAudit()
}
