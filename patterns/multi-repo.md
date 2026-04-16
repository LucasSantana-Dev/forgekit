# Multi-Repository AI Workflows

> Library changes before consumer changes. Release before import. Test cross-repo impact.

## The Problem

Modern development spans multiple repositories: shared libraries, microservices, frontend/backend splits. AI agents work well within a single repo but struggle with multi-repo coordination. They update a library but forget to update consumers. They release in the wrong order, breaking dependency chains. They miss cross-repo breaking changes.

The result: broken builds, version mismatches, deployment failures, and hours debugging why "it worked in isolation."

The insight: Multi-repo work requires explicit coordination, dependency ordering, and cross-repo context. AI agents can help, but you must orchestrate.

## The Pattern

### Dependency Ordering: Bottom-Up Releases

Changes flow from foundation to consumers, never the reverse.

**Dependency chain:**
```
forge-patterns (core library)
    ↓
generator (code generator, uses forge-patterns)
    ↓
app (web app, uses generator)
```

**Release order (bottom-up):**
```
1. forge-patterns: v1.5.0 (new feature)
2. generator: v0.8.0 (uses forge-patterns@^1.5.0)
3. app: v0.30.0 (uses generator@^0.8.0)
```

**Wrong order (breaks everything):**
```
1. app: import { newFeature } from 'generator'
   ERROR: newFeature doesn't exist in generator@0.7.0

2. generator: import { helper } from 'forge-patterns'
   ERROR: helper doesn't exist in forge-patterns@1.4.0

3. forge-patterns: export const helper = ...
   (Too late, consumers already broke)
```

**Automated dependency check:**
```bash
#!/bin/bash
# check-release-order.sh

# Get repos in dependency order (bottom to top)
repos=("forge-patterns" "generator" "app")

for repo in "${repos[@]}"; do
  cd ~/"$repo" || exit

  # Check for unreleased changes
  if ! git diff --quiet HEAD origin/main; then
    echo "ERROR: $repo has unreleased changes. Release before proceeding."
    exit 1
  fi

  # Check dependencies are released
  if [ -f package.json ]; then
    npm outdated --depth=0 | grep -q '@forgespace'
    if [ $? -eq 0 ]; then
      echo "WARNING: $repo uses outdated @forgespace dependencies"
      npm outdated --depth=0 | grep '@forgespace'
    fi
  fi
done

echo "✓ All repos in correct release state"
```

### Cross-Repo Context Pattern

Give AI agents context about related repositories.

**Without context:**
```
You: "Update app to use new assembleContext API from generator"
Agent: *adds import, crashes because API signature changed*
```

**With context:**
```
You: "Update app to use new assembleContext API from generator.

New API (from generator@0.8.0):
```typescript
// Old
assembleContext(brand: Brand): string

// New
assembleContext(brand: Brand, options?: {
  sections?: Section[];
  includeMetadata?: boolean;
}): { context: string; metadata: ContextMetadata }
```

Update all callers in app to:
1. Use new signature
2. Destructure { context, metadata }
3. Handle optional metadata field
```

Agent has full context, makes correct changes.
```

**Context template for cross-repo changes:**
```markdown
## Cross-Repo Change: [Feature Name]

### Library Change (repo-name v1.x.x)
**File:** path/to/file.ts
**Change:** [description]
**API before:**
```typescript
[old API]
```

**API after:**
```typescript
[new API]
```

**Breaking:** Yes/No
**Migration:** [migration steps]

### Consumer Update (consumer-repo)
**Files to update:** [list]
**Changes needed:** [list]
**Testing:** [how to verify]

### Release Order
1. repo-name v1.x.x (library)
2. consumer-repo v2.x.x (consumer)
```

### Coordinated PRs Pattern

Use GitHub PR references to link related changes.

**Step 1: Create library PR**
```bash
cd ~/forge-patterns
git checkout -b feature/new-api
# Make changes
git commit -m "feat: add new API"
git push origin feature/new-api
gh pr create --title "feat: add new API" --body "New API for consumers. See generator#123 for usage."
```

**Step 2: Create consumer PR (references library PR)**
```bash
cd ~/generator
git checkout -b feature/use-new-api
# Make changes to use new API (from unreleased forge-patterns)
git commit -m "feat: use new API from forge-patterns"
git push origin feature/use-new-api
gh pr create --title "feat: use new API" --body "Uses new API from Forge-Space/forge-patterns#456. **Merge forge-patterns#456 first.**"
```

**Step 3: Link PRs**
```
In forge-patterns#456 description:
"Related: generator#123 (consumer)"

In generator#123 description:
"Depends on: forge-patterns#456
⚠️ Merge forge-patterns#456 and release v1.5.0 before merging this."
```

**Step 4: Merge in order**
```bash
# 1. Merge library PR
gh pr merge 456 --squash

# 2. Release library
cd ~/forge-patterns
npm version minor  # v1.5.0
git push origin main --tags
npm publish

# 3. Update consumer dependency
cd ~/generator
npm install @forgespace/patterns@^1.5.0
git add package.json package-lock.json
git commit -m "chore: bump forge-patterns to 1.5.0"
git push origin feature/use-new-api

# 4. Merge consumer PR
gh pr merge 123 --squash
```

### Shared Configurations Pattern

DRY principle across repos: shared ESLint, TypeScript, Prettier configs.

**Create shared config package:**
```bash
# repo: shared-configs
npm init @org/configs

# packages/eslint/index.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // Org-wide rules
  }
};

# packages/tsconfig/base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    // Org-wide TS config
  }
}

# packages/prettier/index.js
module.exports = {
  semi: true,
  singleQuote: true,
  // Org-wide formatting
};

# Publish
npm publish
```

**Use in all repos:**
```json
// package.json in each repo
{
  "devDependencies": {
    "@org/configs": "^1.0.0"
  }
}

// .eslintrc.js
module.exports = {
  extends: ['@org/configs/eslint']
};

// tsconfig.json
{
  "extends": "@org/configs/tsconfig/base.json"
}

// .prettierrc.js
module.exports = require('@org/configs/prettier');
```

**Benefits:**
- One place to update rules (shared-configs)
- All repos get updates via `npm update @org/configs`
- Consistency across entire org
- Easier onboarding (same rules everywhere)

**Gotcha:** Version pinning
```json
// DON'T: floating version
"@org/configs": "^1.0.0"  // Gets breaking changes unexpectedly

// DO: pinned major version
"@org/configs": "~1.2.0"  // Only patch updates

// Update explicitly when ready
npm install @org/configs@1.3.0
```

### Release Chains Pattern

Automate sequential releases across repos.

**Manual release chain (slow, error-prone):**
```bash
cd ~/forge-patterns
npm version minor
npm publish
cd ~/generator
npm install @forgespace/patterns@latest
npm version minor
npm publish
cd ~/app
npm install @forgespace/generator@latest
npm version minor
npm publish
# 15 minutes, easy to make mistakes
```

**Automated release chain:**
```bash
#!/bin/bash
# release-chain.sh

set -e  # Exit on error

repos=(
  "forge-patterns:@forgespace/patterns"
  "generator:@forgespace/generator"
  "app:@forgespace/app"
)

for repo_spec in "${repos[@]}"; do
  repo="${repo_spec%%:*}"
  package="${repo_spec##*:}"

  echo "📦 Releasing $repo..."
  cd ~/"$repo" || exit

  # Update dependencies from previous repos in chain
  if [ -f package.json ] && [ "$repo" != "forge-patterns" ]; then
    echo "⬆️  Updating dependencies..."
    npm update --save @forgespace/*
    git add package.json package-lock.json
    git diff --staged --quiet || git commit -m "chore: update @forgespace dependencies"
  fi

  # Version bump (prompt for type)
  echo "Version bump type for $repo? (patch/minor/major)"
  read -r bump_type
  npm version "$bump_type"

  # Push and publish
  git push origin main --tags
  npm publish

  echo "✅ Released $repo"
done

echo "🎉 Release chain complete!"
```

**Usage:**
```bash
./release-chain.sh
# Prompts for version bump type at each step
# Automatically updates dependencies
# Publishes in correct order
```

### Cross-Repo Testing Pattern

Test library changes against consumer repos before releasing.

**Step 1: Link library locally**
```bash
cd ~/forge-patterns
npm link

cd ~/generator
npm link @forgespace/patterns
```

**Step 2: Run consumer tests**
```bash
cd ~/generator
npm test

# If tests pass, library change is compatible
# If tests fail, library change breaks consumers
```

**Step 3: Test all consumers**
```bash
#!/bin/bash
# test-cross-repo.sh

library="forge-patterns"
consumers=("generator" "app")

cd ~/"$library" || exit
npm link

for consumer in "${consumers[@]}"; do
  echo "Testing $consumer against local $library..."
  cd ~/"$consumer" || exit
  npm link "@forgespace/${library}"
  npm test

  if [ $? -ne 0 ]; then
    echo "❌ $consumer tests failed with new $library changes"
    exit 1
  fi
done

echo "✅ All consumers pass with new changes"
```

**Automated in CI:**
```yaml
# .github/workflows/cross-repo-test.yml
name: Cross-Repo Test

on:
  pull_request:
    branches: [main]

jobs:
  test-consumers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build library
        run: npm ci && npm run build

      - name: Test against generator
        run: |
          git clone https://github.com/org/generator ../generator
          cd ../generator
          npm ci
          npm link ../forge-patterns
          npm test

      - name: Test against app
        run: |
          git clone https://github.com/org/app ../app
          cd ../app
          npm ci
          npm link ../forge-patterns
          npm test
```

### Monorepo vs Multi-Repo Decision

**Use monorepo when:**
- Tightly coupled codebases (change together frequently)
- Same release cadence
- Shared dependencies
- Small team (<20 developers)

**Use multi-repo when:**
- Independently versioned libraries
- Different release schedules
- Different teams own different repos
- Public npm packages

**Hybrid approach:**
```
Monorepo (internal)
├── web-app/
├── api/
└── shared/

Multi-repo (public libraries)
├── forge-patterns (npm package)
├── generator (npm package)
└── ui-mcp-lib (npm package)
```

## Anti-Patterns

### 1. Updating Consumer Before Library is Released

**Bad:**
```bash
# forge-patterns: add new API, commit, DON'T release

# generator: use new API
import { newAPI } from '@forgespace/patterns';
# Works locally (linked), breaks in CI (npm install gets old version)

# CI fails:
# ERROR: Module '@forgespace/patterns' has no exported member 'newAPI'
```

**Why bad:**
- CI installs published version (doesn't have new API)
- Other devs pull code, npm install, code breaks
- Deployment fails

**Fix:**
```bash
# 1. Release library FIRST
cd ~/forge-patterns
git commit -m "feat: add new API"
npm version minor  # v1.5.0
npm publish

# 2. Update consumer dependency
cd ~/generator
npm install @forgespace/patterns@^1.5.0
import { newAPI } from '@forgespace/patterns';
git commit -m "feat: use new API"
npm version minor
npm publish

# Now CI and other devs get correct versions
```

### 2. No Cross-Repo Testing

**Bad:**
```
Library developer: "I changed the API, looks good, shipping it"
[publishes breaking change]
Consumer developers: "Everything broke!"
```

**Why bad:**
- Breaking changes discovered after release
- Consumers scramble to fix
- No warning or migration path

**Fix:**
```bash
# Before releasing library change
cd ~/forge-patterns
npm link

# Test against all consumers
cd ~/generator
npm link @forgespace/patterns
npm test  # Verify tests still pass

cd ~/app
npm link @forgespace/patterns
npm test  # Verify tests still pass

# If all pass: safe to release
# If any fail: breaking change, coordinate migration
```

### 3. Circular Dependencies

**Bad:**
```
forge-patterns depends on generator
generator depends on forge-patterns

npm install
ERROR: Circular dependency detected
```

**Why bad:**
- Can't install either package
- Unclear which is the foundation
- Impossible to version correctly

**Fix:**
```
Reorganize:
- forge-patterns: core utilities (no dependencies)
- generator: uses forge-patterns (depends on patterns)
- app: uses both (depends on patterns + generator)

Dependencies flow one direction: app → generator → forge-patterns
```

### 4. Inconsistent Versioning

**Bad:**
```
forge-patterns: v2.3.1
generator: v0.8.0 (uses patterns@^1.0.0)
# Uses old version! Breaking changes in v2 not available
```

**Why bad:**
- Consumer doesn't benefit from library updates
- Bugs fixed in library still exist in consumer
- Confusing which version consumer actually uses

**Fix:**
```bash
# Regular dependency updates
cd ~/generator
npm outdated
# @forgespace/patterns: 1.9.0 → 2.3.1

npm update @forgespace/patterns
npm test  # Verify update doesn't break
git commit -m "chore: update forge-patterns to 2.3.1"

# Or use Dependabot/Renovate for automation
```

### 5. No Changelog Coordination

**Bad:**
```
forge-patterns CHANGELOG:
v1.5.0: Added new API

generator CHANGELOG:
v0.8.0: Improvements and bug fixes
# No mention of new API from patterns
```

**Why bad:**
- Consumers don't know what changed
- Hard to debug issues after upgrade
- No migration guide

**Fix:**
```
generator CHANGELOG:
v0.8.0:
- feat: Use new assembleContext API from @forgespace/patterns@1.5.0
  - Enables metadata extraction
  - See forge-patterns CHANGELOG for API details
  - Migration: update all assembleContext calls to destructure {context, metadata}
- chore: Update @forgespace/patterns 1.4.0 → 1.5.0
```

### 6. Breaking Changes Without Coordination

**Bad:**
```
Library: "Renamed export from getUser to fetchUser"
[publishes as patch v1.4.1]
Consumer: npm update
[build breaks, all getUser calls fail]
```

**Why bad:**
- Breaking change in patch version (violates semver)
- No warning to consumers
- No migration guide

**Fix:**
```
Step 1 (library): Deprecate old API, add new one
```typescript
// v1.5.0
export const fetchUser = (...) => { ... };
/** @deprecated Use fetchUser instead. Will be removed in v2.0.0 */
export const getUser = fetchUser;  // Alias for backwards compat
```

Step 2 (consumers): Update to new API
```typescript
// Update consumers over time
- import { getUser } from 'library';
+ import { fetchUser } from 'library';
```

Step 3 (library): Remove old API in major version
```typescript
// v2.0.0
export const fetchUser = (...) => { ... };
// getUser removed
```

Consumers have time to migrate, no surprise breakage.
```

### 7. No Release Notes Cross-References

**Bad:**
```
forge-patterns v1.5.0 release notes:
"Added new context assembler API"

generator v0.8.0 release notes:
"Updated to use new API"
# No link to forge-patterns release
```

**Why bad:**
- Consumers don't know where to read about library changes
- Hard to understand full impact of update

**Fix:**
```
generator v0.8.0 release notes:
"Updated to use new context assembler API from @forgespace/patterns@1.5.0

See forge-patterns v1.5.0 release notes for API details:
https://github.com/your-org/shared-lib/releases/tag/v1.5.0

Migration guide:
- Before: const ctx = assembleContext(brand);
- After: const { context, metadata } = assembleContext(brand, { includeMetadata: true });
"
```

## Practical Workflow

### Multi-Repo Feature Development

**Scenario: Add new feature spanning 3 repos**

**Day 1: Plan dependencies**
```markdown
Feature: Component metadata extraction

Repos affected:
1. forge-patterns: Add metadata types
2. generator: Use metadata in assembler
3. app: Display metadata in UI

Dependency order:
1. forge-patterns v1.5.0 (types)
2. generator v0.8.0 (uses patterns@1.5.0)
3. app v0.30.0 (uses generator@0.8.0)
```

**Day 2: Implement in library**
```bash
cd ~/forge-patterns
git checkout -b feature/component-metadata

# Implement types
git commit -m "feat: add component metadata types"
git push origin feature/component-metadata
gh pr create --title "feat: component metadata types"

# Link to PRs from consumers (created next)
```

**Day 3: Implement in generator**
```bash
cd ~/generator
git checkout -b feature/use-metadata

# Link local forge-patterns for development
cd ~/forge-patterns && npm link
cd ~/generator && npm link @forgespace/patterns

# Implement using new types
git commit -m "feat: extract component metadata"
git push origin feature/use-metadata
gh pr create --title "feat: component metadata" --body "Depends on: Forge-Space/forge-patterns#123"
```

**Day 4: Implement in web app**
```bash
cd ~/app
git checkout -b feature/display-metadata

# Link local generator and forge-patterns
cd ~/forge-patterns && npm link
cd ~/generator && npm link
cd ~/app && npm link @forgespace/patterns && npm link @forgespace/generator

# Implement UI
git commit -m "feat: display component metadata"
git push origin feature/display-metadata
gh pr create --title "feat: display metadata" --body "Depends on: Forge-Space/generator#456"
```

**Day 5: Test cross-repo**
```bash
# Run tests in all repos with linked dependencies
cd ~/forge-patterns && npm test  # ✓
cd ~/generator && npm test        # ✓
cd ~/app && npm test            # ✓

# E2E test
cd ~/app && npm run dev
# Verify feature works end-to-end
```

**Day 6: Sequential merge and release**
```bash
# 1. Merge and release forge-patterns
gh pr merge 123 --squash
cd ~/forge-patterns
npm version minor  # v1.5.0
git push origin main --tags
npm publish

# 2. Update generator dependency, merge, release
cd ~/generator
npm unlink @forgespace/patterns
npm install @forgespace/patterns@^1.5.0
git add package.json package-lock.json
git commit -m "chore: bump forge-patterns to 1.5.0"
git push origin feature/use-metadata
gh pr merge 456 --squash
npm version minor  # v0.8.0
git push origin main --tags
npm publish

# 3. Update app dependencies, merge, release
cd ~/app
npm unlink @forgespace/patterns @forgespace/generator
npm install @forgespace/patterns@^1.5.0 @forgespace/generator@^0.8.0
git add package.json package-lock.json
git commit -m "chore: bump dependencies"
git push origin feature/display-metadata
gh pr merge 789 --squash
npm version minor  # v0.30.0
git push origin main --tags
npm publish
```

### Multi-Repo Hotfix Workflow

**Scenario: Critical bug in library affecting all consumers**

**Step 1: Identify scope**
```bash
# Bug in forge-patterns affects generator and app
# Need coordinated hotfix across 3 repos
```

**Step 2: Fix library FIRST**
```bash
cd ~/forge-patterns
git checkout -b hotfix/critical-bug
# Fix bug
git commit -m "fix: critical bug in assembler"
gh pr create --title "fix: critical bug" --label "priority:critical"
gh pr merge --admin --squash

npm version patch  # v1.5.1
git push origin main --tags
npm publish
```

**Step 3: Update consumers immediately**
```bash
# generator
cd ~/generator
npm install @forgespace/patterns@^1.5.1
npm test  # Verify fix works
git commit -m "fix: update patterns to 1.5.1 (critical bug fix)"
git push origin main
npm version patch  # v0.8.1
npm publish

# app
cd ~/app
npm install @forgespace/patterns@^1.5.1 @forgespace/generator@^0.8.1
npm test
git commit -m "fix: update dependencies (critical bug fixes)"
git push origin main
npm version patch  # v0.30.1
npm publish
```

**Step 4: Notify stakeholders**
```
Post in #engineering Slack:
"Critical bug fixed in forge-patterns v1.5.1. All apps updated:
- forge-patterns: v1.5.0 → v1.5.1
- generator: v0.8.0 → v0.8.1
- app: v0.30.0 → v0.30.1

Deploy app v0.30.1 immediately."
```

Multi-repo work is about coordination, not just code. Plan dependencies, link during development, test cross-repo, release bottom-up, and always verify before publishing.
