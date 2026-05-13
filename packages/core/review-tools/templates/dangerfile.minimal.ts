// Danger rules — minimal variant.
// Use as a starting point for repos that don't match the other variants.
// Only enforces the universals: .env protection, big-PR warning, branch prefix.

import { danger, fail, warn } from 'danger'

const pr = danger.github.pr
const all = [...danger.git.modified_files, ...danger.git.created_files]

if (pr.additions + pr.deletions > 800) {
    warn(`Big PR — ${pr.additions + pr.deletions} lines across ${all.length} files. Consider splitting.`)
}

const envFiles = all.filter((p) => /(^|\/)\.env(\.|$)/.test(p))
if (envFiles.length > 0) {
    fail(`.env* files in PR: ${envFiles.join(', ')}. Never commit without explicit confirmation.`)
}

const headRef = danger.github.pr.head.ref
const validPrefixes = /^(feature|feat|fix|refactor|chore|docs|ci|test|release|hotfix|dependabot|perf|style)\//
if (!validPrefixes.test(headRef)) {
    warn(`Branch \`${headRef}\` doesn't follow the standard prefix convention.`)
}
