// Danger rules — single-package Node/TS variant.
// Drops the packages/* glob assumption from the ts-monorepo template.

import { danger, fail, message, schedule, warn } from 'danger'

const pr = danger.github.pr
const modified = danger.git.modified_files
const created = danger.git.created_files
const all = [...modified, ...created]

if (pr.additions + pr.deletions > 800) {
    warn(`Big PR — ${pr.additions + pr.deletions} lines across ${all.length} files. Consider splitting.`)
}

const sourceLikelyNeedingTest = (p: string): boolean =>
    /^src\//.test(p) &&
    !p.endsWith('.d.ts') &&
    !/\.(spec|test)\.(ts|tsx|js)$/.test(p) &&
    !p.endsWith('index.ts')

const sourceChanges = all.filter(sourceLikelyNeedingTest)
const testChanges = all.filter((p) => /\.(spec|test)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p))

async function countSourceAdditions(): Promise<number> {
    if (sourceChanges.length === 0) return 0
    const diffs = await Promise.all(sourceChanges.map((f) => danger.git.diffForFile(f)))
    return diffs.reduce((sum, d) => sum + (d?.added.split('\n').filter((l) => l.startsWith('+')).length ?? 0), 0)
}

const TITLE_PREFIX_SKIP = /^(chore|test|docs|refactor|ci|build|style|perf)(\([^)]*\))?:\s/
const userFacingChange = all.some((p) => /^src\//.test(p))
const changelogTouched = all.includes('CHANGELOG.md')
if (userFacingChange && !changelogTouched && !TITLE_PREFIX_SKIP.test(pr.title)) {
    message(`User-facing change without a CHANGELOG.md update. Add a line under \`## [Unreleased]\` if release-worthy.`)
}

const packageJsonChanged = modified.some((p) => /(^|\/)package\.json$/.test(p))
const lockChanged = modified.some((p) => /(^|\/)package-lock\.json$/.test(p))
if (packageJsonChanged && !lockChanged) {
    fail(`\`package.json\` changed but \`package-lock.json\` did not. Run \`npm install\` and commit the lockfile.`)
}

const envFiles = all.filter((p) => /(^|\/)\.env(\.|$)/.test(p))
if (envFiles.length > 0) {
    fail(`.env* files in PR: ${envFiles.join(', ')}. Never commit without explicit confirmation.`)
}

async function checkConsoleLogs(): Promise<void> {
    const touched = all.filter((p) => /^src\//.test(p) && /\.(ts|tsx|js)$/.test(p))
    for (const file of touched) {
        const diff = await danger.git.diffForFile(file)
        if (!diff) continue
        const lines = diff.added.split('\n').filter((l) => l.startsWith('+') && /\bconsole\.(log|debug)\b/.test(l))
        if (lines.length > 0) {
            warn(`Possible debug residue in \`${file}\`: ${lines.length} \`console.log/debug\` line(s) added.`)
        }
    }
}

const headRef = danger.github.pr.head.ref
const validPrefixes = /^(feature|feat|fix|refactor|chore|docs|ci|test|release|hotfix|dependabot|perf|style)\//
if (!validPrefixes.test(headRef)) {
    warn(`Branch \`${headRef}\` doesn't follow the standard prefix convention.`)
}

async function runAsyncChecks(): Promise<void> {
    const sourceAdditions = await countSourceAdditions()
    if (sourceChanges.length > 0 && testChanges.length === 0 && sourceAdditions > 50) {
        warn(`No test changes despite ${sourceChanges.length} source files modified (${sourceAdditions} lines).`)
    }
    await checkConsoleLogs()
}

// schedule() registers the async work with Danger's runner — required
// because Danger v12 loads dangerfile.ts via require(), which rejects
// top-level await (ERR_REQUIRE_ASYNC_MODULE).
schedule(runAsyncChecks())
