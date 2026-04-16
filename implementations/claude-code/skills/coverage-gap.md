---
name: coverage-gap
description: SonarCloud coverage-fail repair via focused subagent. Takes PR#, fetches coverage gap, dispatches test-writing subagent, handles force-with-lease push and re-scan polling. Codifies the "add tests only, no source changes" pattern.
type: skill
triggers:
  - coverage gap
  - fix coverage
  - sonar coverage
  - add tests
---

# coverage-gap

SonarCloud blocks merges when coverage drops. Instead of manually investigating + writing tests, dispatch a focused subagent. Skill handles PR diff extraction, instructs "tests only", manages push, and verifies re-scan.

## When to use

- PR has SonarCloud failing gate (coverage below threshold)
- New code is untested or lightly tested
- No architectural changes needed (tests only)
- 3–5 source files touched in the PR

## When NOT to use

- Coverage fail is from deleted code (manual refactor check first)
- Source changes needed to be testable (use code-review skill instead)
- PR already has unmerged local changes (commit + push first)
- Coverage threshold is impossible (edit SonarCloud rules first)

## Usage

```bash
coverage-gap 645 --repo LucasSantana-Dev/Lucky
coverage-gap 123  # infers repo from git origin
```

## Script behavior

1. Validates PR exists and SonarCloud check is failing (not passing)
2. Fetches PR diff via `gh pr diff <N>` to identify changed files
3. Calls SonarCloud API to extract:
   - Required coverage threshold (e.g. 80%)
   - Current coverage on changed files (e.g. 62%)
   - Files with missing line coverage
4. Dispatches a subagent with:
   - `{ prNumber, repo, changedFiles, coverageGap, requiredThreshold }`
   - Instruction: "Write tests to cover uncovered lines. NO source edits. Push force-with-lease to the PR branch."
5. Polls PR status every 15s until subagent completes (max 5 min timeout)
6. Verifies SonarCloud re-scan and reports final coverage
7. If coverage still fails, subagent escalates to you

## Rules

- **Tests only**: Script refuses to run if source changes are in the PR's local unpushed commits (safelist check)
- **Subagent scoped**: Subagent has write access to PR branch only, not main
- **Force-with-lease**: Subagent uses `git push --force-with-lease` to prevent accidental overwrites
- **Non-blocking**: If subagent timeout hits, skill reports "subagent ran overtime, check PR manually"

## Related skills

- `pr-snapshot` — identify which PRs have SonarCloud fails (column: FAILING)
- `sentry` — debug runtime errors that tests might catch
