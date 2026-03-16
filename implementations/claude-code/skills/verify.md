---
name: verify
description: Run full quality gate suite (lint, type-check, test, build) to verify code before commit or PR
triggers:
  - verify code quality
  - run quality gates
  - check before commit
  - validate changes
  - pre-commit checks
---

# Verify Code Quality

Runs comprehensive quality checks to ensure code meets project standards before committing or creating a PR.

## Prerequisites

Check that the following tools are available:
- Linter (ESLint, Ruff, golangci-lint, etc.)
- Type checker (TypeScript, mypy, etc.)
- Test runner (Jest, Vitest, pytest, etc.)
- Build tool (tsc, webpack, vite, cargo, go build, etc.)

## Steps

### 1. Check Git Status

First, verify current state:

```bash
git status
```

**Verify:**
- On correct branch
- No unexpected changes
- No merge conflicts

If there are uncommitted changes, that's fine - we're testing them.

### 2. Install Dependencies

Ensure all dependencies are up to date:

```bash
# For Node.js projects
if [ -f package-lock.json ]; then
  npm ci
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
fi

# For Python projects
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
elif [ -f pyproject.toml ]; then
  pip install -e .
fi

# For Go projects
if [ -f go.mod ]; then
  go mod download
fi

# For Rust projects
if [ -f Cargo.toml ]; then
  cargo fetch
fi
```

### 3. Run Linter

Check code style and catch common errors:

```bash
# Node.js / TypeScript
npm run lint

# Python (Ruff)
ruff check .

# Python (Flake8)
flake8 .

# Go
golangci-lint run

# Rust
cargo clippy -- -D warnings
```

**Success criteria:**
- Zero linting errors
- Zero warnings (or only acceptable warnings documented in CLAUDE.md)

**If errors found:**
1. Review output
2. Fix issues manually or run auto-fix:
   - `npm run lint -- --fix`
   - `ruff check --fix .`
   - `eslint --fix .`
3. Re-run linter to verify
4. Commit fixes separately if major changes

### 4. Run Type Checker

Verify type safety (for statically-typed languages):

```bash
# TypeScript
npm run type-check
# or
tsc --noEmit

# Python (mypy)
mypy .

# Go (built into compiler)
go build ./...

# Rust (built into compiler)
cargo check
```

**Success criteria:**
- Zero type errors

**If errors found:**
1. Review type errors
2. Fix type issues
3. Re-run type checker
4. Consider if changes require updating type definitions

### 5. Run Tests

Execute test suite with coverage:

```bash
# Node.js (Jest)
npm test -- --coverage

# Node.js (Vitest)
npm run test:coverage

# Python (pytest)
pytest --cov

# Go
go test ./... -cover

# Rust
cargo test
```

**Success criteria:**
- All tests pass
- Coverage meets threshold (typically >80%, check CLAUDE.md)
- No flaky tests (run twice if suspicious)

**If tests fail:**
1. Review failures - are they legitimate bugs or bad tests?
2. If legitimate bugs:
   - Fix the code
   - Re-run tests
3. If bad tests:
   - Fix test logic
   - Ensure tests reflect actual requirements
4. If flaky tests:
   - Document in MEMORY.md
   - Fix race conditions or timing issues
   - Consider marking as skip with ticket

### 6. Run Build

Verify the project builds successfully:

```bash
# Node.js (TypeScript)
npm run build

# Python (build package)
python -m build

# Go
go build ./...

# Rust
cargo build --release
```

**Success criteria:**
- Build completes without errors
- No warnings about missing files or broken imports
- Output artifacts are generated in expected locations

**If build fails:**
1. Review build output for specific errors
2. Common issues:
   - Missing type definitions
   - Broken imports
   - Invalid tsconfig/cargo/go.mod configuration
3. Fix and re-run build

### 7. Security Scan (Optional but Recommended)

Run security checks if available:

```bash
# Node.js (npm audit)
npm audit --audit-level=high

# Python (pip-audit)
pip-audit

# Go (gosec)
gosec ./...

# Rust (cargo-audit)
cargo audit

# General (Trivy)
trivy fs .
```

**Success criteria:**
- No high or critical vulnerabilities
- Known low/medium vulnerabilities documented in MEMORY.md

**If vulnerabilities found:**
1. Review severity
2. For high/critical: must fix before PR
3. For medium/low: document and plan fix
4. Update dependencies if patches available

### 8. Summary Report

After all checks complete, provide a summary:

```
✅ Quality Gate Results
━━━━━━━━━━━━━━━━━━━━━━━

✓ Linting       - Passed
✓ Type Check    - Passed
✓ Tests         - Passed (428/428, 87% coverage)
✓ Build         - Passed
✓ Security      - Passed (0 high/critical)

All checks passed! Safe to commit/PR.
```

If any check failed:

```
❌ Quality Gate Results
━━━━━━━━━━━━━━━━━━━━━━━

✓ Linting       - Passed
✗ Type Check    - Failed (3 errors)
✓ Tests         - Passed (428/428, 87% coverage)
✗ Build         - Failed
- Security      - Skipped (build failed)

Fix errors above before committing.
```

## Next Steps

### If all checks passed:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: your conventional commit message"
   ```

2. **Push to remote:**
   ```bash
   git push origin <branch-name>
   ```

3. **Create PR** (if ready):
   - Use `/ship` skill, or
   - `gh pr create --title "..." --body "..."`

### If checks failed:

1. Fix issues one at a time
2. Re-run `/verify` after fixes
3. Do NOT commit until all checks pass

## Configuration

### Project-Specific Gates

Projects may have additional quality gates. Check `CLAUDE.md` for:
- Custom test commands
- Specific coverage thresholds
- Additional validation scripts
- Framework-specific checks (e.g., Lighthouse for web, load tests)

### Skip Options (Use Sparingly)

For emergency fixes or documented exceptions:

```bash
# Skip specific checks (not recommended)
SKIP_LINT=1 npm run verify
SKIP_TESTS=1 npm run verify

# Skip all checks (use only for docs/config changes)
git commit --no-verify
```

**WARNING:** Only skip checks when:
- Changes are documentation-only
- Changes are non-code config files
- You have explicit approval from team lead
- Document reason in commit message

## Troubleshooting

### "Command not found" errors

Install missing tools:

```bash
# ESLint
npm install --save-dev eslint

# TypeScript
npm install --save-dev typescript

# Jest
npm install --save-dev jest

# Ruff
pip install ruff

# Pytest
pip install pytest pytest-cov
```

### Tests pass locally but fail in CI

Common causes:
1. **Environment differences:**
   - Check Node.js/Python version matches CI
   - Check environment variables in CI
   - Check file paths (absolute vs relative)

2. **Timing issues:**
   - Increase timeouts in flaky tests
   - Use proper async/await patterns
   - Mock time-dependent functions

3. **Missing dependencies:**
   - Ensure package-lock.json is committed
   - Check CI installs all dev dependencies

### Build succeeds but runtime errors

Run additional checks:
```bash
# For web apps, run dev server and test manually
npm run dev

# For CLIs, test actual execution
./dist/cli.js --help

# For libraries, test in a consumer project
npm link && cd ../test-project && npm link your-lib
```

## Success Criteria

**This skill succeeds when:**
- All quality gates pass
- No errors or critical warnings
- Coverage meets threshold
- Build artifacts are valid
- Summary report shows all green checks

**This skill fails when:**
- Any quality gate fails
- Critical vulnerabilities found
- Coverage below threshold
- Build produces invalid artifacts

Report both the final status and specific failing checks for easy remediation.
