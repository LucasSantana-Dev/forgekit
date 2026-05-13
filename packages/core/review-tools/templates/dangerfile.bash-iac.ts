// Danger rules — Bash + IaC variant (homelab, infra repos).
// No TS-test enforcement. Focuses on: .env protection, big PR warning,
// branch prefix, terraform plan-output discipline.

import { danger, fail, message, warn } from 'danger'

const pr = danger.github.pr
const modified = danger.git.modified_files
const created = danger.git.created_files
const all = [...modified, ...created]

// --- 1. PR size --------------------------------------------------------------
if (pr.additions + pr.deletions > 600) {
    warn(`Big infra PR — ${pr.additions + pr.deletions} lines across ${all.length} files. IaC reviews benefit from smaller chunks.`)
}

// --- 2. .env protection ------------------------------------------------------
const envFiles = all.filter((p) => /(^|\/)\.env(\.|$)/.test(p) || /\.secrets?$/i.test(p))
if (envFiles.length > 0) {
    fail(`Secret-bearing files in PR: ${envFiles.join(', ')}. Never commit without explicit confirmation.`)
}

// --- 3. Terraform: plan output must not be committed ------------------------
const tfPlanArtifacts = all.filter((p) => /\.tfplan$|terraform\.tfstate(\.backup)?$/.test(p))
if (tfPlanArtifacts.length > 0) {
    fail(`Terraform state/plan artifacts in PR: ${tfPlanArtifacts.join(', ')}. These belong in remote state, not git.`)
}

// --- 4. Terraform changes without provider lockfile ------------------------
const tfChanged = all.some((p) => /\.tf$/.test(p))
const lockChanged = modified.some((p) => /\.terraform\.lock\.hcl$/.test(p))
if (tfChanged && !lockChanged) {
    message(`Terraform files changed but \`.terraform.lock.hcl\` did not. Run \`terraform init\` and commit if providers changed.`)
}

// --- 5. Docker compose / Kubernetes manifest changes mention CHANGELOG ------
const TITLE_PREFIX_SKIP = /^(chore|docs|refactor|ci)(\([^)]*\))?:\s/
const infraChange = all.some((p) =>
    /(docker-compose.*\.ya?ml|Dockerfile|\.tf$|\.tfvars$|k8s\/.+\.ya?ml)/.test(p),
)
if (infraChange && !modified.includes('CHANGELOG.md') && !TITLE_PREFIX_SKIP.test(pr.title)) {
    message(`Infra change without CHANGELOG.md update. If this affects deployed services, document it.`)
}

// --- 6. Shell-script linting hint -------------------------------------------
const newShellScripts = created.filter((p) => /\.(sh|bash|zsh)$/.test(p))
if (newShellScripts.length > 0) {
    message(`New shell script(s): ${newShellScripts.join(', ')}. Run shellcheck before merging.`)
}

// --- 7. Branch-prefix discipline --------------------------------------------
const headRef = danger.github.pr.head.ref
const validPrefixes = /^(feature|feat|fix|refactor|chore|docs|ci|infra|hotfix|dependabot)\//
if (!validPrefixes.test(headRef)) {
    warn(`Branch \`${headRef}\` doesn't follow the standard prefix convention.`)
}
