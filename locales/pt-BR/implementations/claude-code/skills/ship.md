---
name: ship
description: Complete git workflow - commit changes with conventional commit message, push to remote, and create pull request
triggers:
  - create a PR
  - ship this code
  - commit and push
  - ready to merge
  - submit for review
---

# Ship Code

Complete workflow for committing changes, pushing to remote, and creating a pull request.

## Prerequisites

Verify the following before shipping:
- [ ] All changes are intentional
- [ ] Quality gates pass (run `/verify` skill)
- [ ] No secrets in code
- [ ] Branch is up to date with base branch

## Inputs Required

Before starting, gather:
1. **Commit type** (feat, fix, refactor, chore, docs, style, ci, test)
2. **Short description** (what changed, <72 chars)
3. **PR title** (can be same as commit or more descriptive)
4. **PR body** (summary of changes, test plan, breaking changes)

## Steps

### 1. Verify Clean State

Check current git status:

```bash
git status
```

**Verify:**
- No merge conflicts
- On correct feature branch (not main/master)
- All intended files are modified

If on main/master:
```bash
# Create feature branch first
git checkout -b feature/your-feature-name
```

### 2. Review Changes

Show all changes about to be committed:

```bash
# See diff of all changes
git diff

# See staged changes (if any)
git diff --cached

# See file status
git status --short
```

**Check for:**
- Unintended changes (debug logs, commented code)
- Secrets or API keys
- Large binary files
- Files that should be in .gitignore

### 3. Run Quality Gates

Before committing, ensure code quality:

```bash
# Run full verification (or use /verify skill)
npm run lint && npm run type-check && npm test && npm run build
```

**If any checks fail:**
- Stop and fix issues first
- Re-run quality gates
- Only proceed when all pass

### 4. Stage Files

Add files to staging area:

```bash
# Stage specific files (preferred - explicit)
git add src/components/Button.tsx
git add src/hooks/useAuth.ts
git add src/lib/api.ts

# Or stage all changes (use cautiously)
git add .
```

**Best practice:** Stage files individually to avoid accidentally committing:
- `.env` files
- `node_modules/` or other build artifacts
- IDE config files
- Debug/temporary files

### 5. Create Conventional Commit

Format: `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Changes to build process, dependencies, tooling
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `ci`: Changes to CI configuration files and scripts
- `test`: Adding or updating tests
- `perf`: Performance improvements
- `revert`: Reverts a previous commit

**Scope (optional):** Component/module affected (e.g., `auth`, `ui`, `api`)

**Examples:**
```
feat(auth): add OAuth2 login flow
fix(ui): correct button alignment on mobile
refactor(api): simplify error handling logic
chore(deps): update dependencies to latest versions
docs(readme): add setup instructions for Windows
```

**Commit command:**

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<optional body with more details>

<optional footer with breaking changes, ticket refs>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Important:**
- Use HEREDOC format for multi-line messages
- Add `Co-Authored-By` line (unless user explicitly requests not to)
- Keep first line under 72 characters
- Add blank line between subject and body
- Wrap body at 72 characters

**Breaking changes format:**
```
feat(api): change authentication endpoint

BREAKING CHANGE: /auth/login now requires email instead of username.
Update all API clients to send email field.
```

### 6. Push to Remote

Push feature branch to remote:

```bash
# First time pushing this branch
git push -u origin <branch-name>

# Subsequent pushes
git push
```

**If push is rejected:**
```bash
# Remote has changes you don't have locally
git pull --rebase origin <branch-name>

# Resolve any conflicts if they occur
# Then push again
git push
```

### 7. Create Pull Request

Use GitHub CLI for consistent PR creation:

```bash
gh pr create \
  --title "feat(auth): add OAuth2 login flow" \
  --body "$(cat <<'EOF'
## Summary
- Implemented OAuth2 authentication flow
- Added login/logout handlers
- Integrated with Supabase Auth

## Changes
- Added `OAuthButton` component
- Created `useOAuth` hook
- Updated auth API routes

## Test Plan
- [ ] Manual testing with Google OAuth
- [ ] Unit tests for auth handlers (87% coverage)
- [ ] E2E test for login flow

## Breaking Changes
None

## Related Issues
Closes #42
Relates to #38

🤖 Generated with Claude Code
EOF
)"
```

**PR Title Guidelines:**
- Same as commit message (or more descriptive)
- Use conventional commit format
- Keep under 72 characters
- Describe what changed, not how

**PR Body Sections:**
- **Summary:** 2-3 bullet points of what changed
- **Changes:** Technical details of modifications
- **Test Plan:** How changes were verified
- **Breaking Changes:** Any incompatible API changes
- **Related Issues:** Link relevant issues

### 8. Verify PR Created

Check that PR was created successfully:

```bash
# View PR in browser
gh pr view --web

# Or get PR details in terminal
gh pr view
```

**Verify:**
- PR title/body are correct
- CI checks are running
- No merge conflicts
- Linked to correct issues
- Assigned correct reviewers (if applicable)

### 9. Monitor CI

Watch for CI pipeline results:

```bash
# Check CI status
gh pr checks

# Watch CI in real-time (optional)
gh run watch
```

**If CI fails:**
1. Check which job failed
2. Review error logs
3. Fix locally
4. Commit fix and push (updates PR automatically)
5. Re-run failed jobs if needed: `gh run rerun <run-id>`

### 10. Update Memory

Document this work in MEMORY.md:

```markdown
## Recent Work

### OAuth Integration (PR #42) - 2026-03-15
- Implemented OAuth2 flow with Supabase
- Created OAuthButton and useOAuth hook
- 87% test coverage on auth module
- Next: Wait for review, then implement logout handler

### Gotchas Discovered
- Supabase redirects require exact URL match (http vs https matters)
- OAuth tokens refresh automatically, no manual handling needed
```

## Success Criteria

**This skill succeeds when:**
- Commit created with conventional format
- Branch pushed to remote successfully
- PR created and visible on GitHub
- CI checks started running
- MEMORY.md updated with context

**This skill fails when:**
- Quality gates didn't pass (should run `/verify` first)
- Push rejected due to conflicts
- PR creation failed
- Secrets detected in commit

## Advanced Options

### Amend Last Commit

If you need to fix the most recent commit (before pushing):

```bash
# Make changes
git add <files>

# Amend commit (keeps same message)
git commit --amend --no-edit

# Or update message too
git commit --amend

# Force push (only if you already pushed)
git push --force-with-lease
```

**WARNING:** Only amend commits that haven't been pushed, or use with extreme caution.

### Squash Multiple Commits

If you have multiple messy commits to clean up:

```bash
# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# In editor, mark commits to squash
# pick abc123 feat: first commit
# squash def456 wip: more changes
# squash ghi789 fix: typo

# Save and edit combined commit message
```

### Draft PR

For work-in-progress PRs:

```bash
gh pr create --draft --title "WIP: OAuth integration" --body "Early draft for feedback"
```

Convert to ready when done:
```bash
gh pr ready
```

### Auto-Merge (if enabled)

Enable auto-merge after approvals:

```bash
gh pr merge --auto --squash
```

## Troubleshooting

### "Nothing to commit" error

No changes staged:
```bash
# Check what changed
git status

# Stage changes
git add <files>

# Try commit again
git commit -m "..."
```

### Push rejected (non-fast-forward)

Remote has changes you don't have:
```bash
# Fetch latest
git fetch origin

# Rebase your changes on top
git rebase origin/main

# Resolve conflicts if any
# Then push
git push
```

### Pre-commit hook failures

Fix the issues raised by hooks:
```bash
# Common: linting errors
npm run lint -- --fix

# Common: formatting
npm run format

# Try commit again
git commit -m "..."
```

### PR already exists

Branch already has a PR:
```bash
# View existing PR
gh pr view

# Or create new commit and push (updates existing PR)
git commit -m "..."
git push
```

## Rollback

If you need to undo:

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Close PR
gh pr close <pr-number>

# Delete remote branch
git push origin --delete <branch-name>
```

## Next Steps

After PR is created:

1. **Request review** (if not auto-assigned):
   ```bash
   gh pr edit --add-reviewer username
   ```

2. **Monitor for feedback:**
   - Check PR comments regularly
   - Address review feedback promptly
   - Re-request review after changes

3. **Merge when approved:**
   - Wait for required approvals
   - Ensure CI passes
   - Squash merge (preferred) or merge commit
   - Delete branch after merge

4. **Post-merge:**
   - Pull latest main: `git checkout main && git pull`
   - Delete local branch: `git branch -d <branch-name>`
   - Update MEMORY.md with completion status
   - Move to next task

## Configuration

### Repository Settings

Ensure repo has:
- Branch protection rules on main/master
- Required status checks (CI)
- Required reviews (1-2 approvers)
- Auto-merge enabled (optional)
- Delete branch on merge (recommended)

### User Settings

Configure git identity:
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

Setup GitHub CLI:
```bash
gh auth login
```

## Summary

This skill automates the complete ship workflow:
1. Verify code quality
2. Stage and commit with conventional format
3. Push to remote
4. Create well-formatted PR
5. Monitor CI
6. Update project memory

Use this for every feature branch to maintain consistent, high-quality PRs.
