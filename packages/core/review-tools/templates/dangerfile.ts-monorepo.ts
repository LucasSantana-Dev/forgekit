// Danger rules — TypeScript monorepo variant.
// Reference: LucasSantana-Dev/Lucky/dangerfile.ts
//
// Customize this file freely after install — per the ADR, dangerfile
// rules are repo-specific by design. The forge-kit installer only
// scaffolds the starting point.

import { danger, fail, message, warn } from 'danger'

const pr = danger.github.pr
const modified = danger.git.modified_files
const created = danger.git.created_files
const all = [...modified, ...created]

// --- 1. PR size warning -----------------------------------------------------
const bigPrLines = pr.additions + pr.deletions
if (bigPrLines > 800) {
    warn(
        `Big PR — **${bigPrLines}** lines changed across **${all.length}** files. ` +
            `Consider splitting into smaller, reviewable chunks.`,
    )
}

// --- 2. Source change without test change -----------------------------------
const sourceLikelyNeedingTest = (path: string): boolean =>
    /^packages\/[^/]+\/src\//.test(path) &&
    !path.endsWith('.d.ts') &&
    !/\.(spec|test)\.(ts|tsx|js)$/.test(path) &&
    !path.endsWith('index.ts')

const sourceChanges = all.filter(sourceLikelyNeedingTest)
const testChanges = all.filter((p) => /\.(spec|test)\.(ts|tsx)$/.test(p))

async function countSourceAdditions(): Promise<number> {
    if (sourceChanges.length === 0) return 0
    const diffs = await Promise.all(
        sourceChanges.map((f) => danger.git.diffForFile(f)),
    )
    return diffs.reduce((sum, d) => {
        if (!d?.added) return sum
        return sum + d.added.split('\n').filter((l) => l.startsWith('+')).length
    }, 0)
}

// --- 3. CHANGELOG reminder for user-facing changes --------------------------
const changelogTouched = all.includes('CHANGELOG.md')
const userFacingPatterns = [/^packages\/[^/]+\/src\//]
const userFacingChange = all.some((p) =>
    userFacingPatterns.some((rx) => rx.test(p)),
)
const TITLE_PREFIX_SKIP =
    /^(chore|test|docs|refactor|ci|build|style|perf)(\([^)]*\))?:\s/
if (userFacingChange && !changelogTouched && !TITLE_PREFIX_SKIP.test(pr.title)) {
    message(
        `User-facing change without a CHANGELOG.md update. ` +
            `Add a line under \`## [Unreleased]\` if this should appear in release notes.`,
    )
}

// --- 4. Lockfile guard ------------------------------------------------------
const packageJsonChanged = modified.some((p) => /(^|\/)package\.json$/.test(p))
const lockChanged = modified.some((p) => p === 'package-lock.json')
if (packageJsonChanged && !lockChanged) {
    fail(
        `**\`package.json\` changed but \`package-lock.json\` did not.** ` +
            `Run \`npm install\` and commit the lockfile.`,
    )
}

// --- 5. .env protection -----------------------------------------------------
const envFiles = all.filter((p) => /(^|\/)\.env(\.|$)/.test(p))
if (envFiles.length > 0) {
    fail(
        `**.env* files in PR:** ${envFiles.join(', ')}. ` +
            `These should never be committed without explicit confirmation.`,
    )
}

// --- 6. Console.log left behind in source ----------------------------------
async function checkConsoleLogs(): Promise<void> {
    const sourceTouched = all.filter(
        (p) => /^packages\/.+\/src\//.test(p) && /\.(ts|tsx|js)$/.test(p),
    )
    for (const file of sourceTouched) {
        const diff = await danger.git.diffForFile(file)
        if (!diff) continue
        const addedLines = diff.added
            .split('\n')
            .filter((l) => l.startsWith('+'))
            .filter((l) => /\bconsole\.(log|debug)\b/.test(l))
        if (addedLines.length > 0) {
            warn(
                `Possible debug residue in \`${file}\`: ${addedLines.length} \`console.log/debug\` ` +
                    `line(s) added. Prefer structured logging.`,
            )
        }
    }
}

// --- 7. Branch-prefix discipline -------------------------------------------
const headRef = danger.github.pr.head.ref
const validPrefixes =
    /^(feature|feat|fix|refactor|chore|docs|ci|test|release|hotfix|dependabot|perf|style)\//
if (!validPrefixes.test(headRef) && !headRef.startsWith('worktree-')) {
    warn(
        `Branch \`${headRef}\` doesn't follow the standard prefix convention ` +
            `(\`feature/\`, \`fix/\`, \`refactor/\`, \`chore/\`, \`docs/\`, \`ci/\`, \`test/\`, \`release/\`).`,
    )
}

// --- 8. Big-file warning ----------------------------------------------------
async function checkLargeFiles(): Promise<void> {
    for (const file of created) {
        const structured = await danger.git.structuredDiffForFile(file)
        const lineCount = structured?.chunks
            ?.flatMap((c) => c.changes)
            ?.filter((c) => c.type === 'add').length
        if (lineCount && lineCount > 500) {
            warn(
                `New file \`${file}\` is **${lineCount} lines** — consider splitting.`,
            )
        }
    }
}

// --- Async runner -----------------------------------------------------------
async function runAsyncChecks(): Promise<void> {
    const sourceAdditions = await countSourceAdditions()
    if (
        sourceChanges.length > 0 &&
        testChanges.length === 0 &&
        sourceAdditions > 50
    ) {
        warn(
            `**No test changes** despite ${sourceChanges.length} source files modified ` +
                `(${sourceAdditions} source lines added). ` +
                `If this is intentional, reply explaining why.`,
        )
    }

    await Promise.all([checkConsoleLogs(), checkLargeFiles()])
}

await runAsyncChecks()
