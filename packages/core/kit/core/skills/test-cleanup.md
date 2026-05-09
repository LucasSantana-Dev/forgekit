---
name: test-cleanup
description: Audit and prune a bloated test suite down to the minimum tests that hit the coverage threshold and guard real behavior. Replaces many shallow unit tests with fewer well-scoped integration tests. Use when test count is disproportionate to app size.
triggers:
  - test-cleanup
  - audit
---

# Test Cleanup

**Goal: hit the coverage threshold with the fewest, fastest tests possible.**

Not zero tests. Not maximum deletion. The minimum set of well-written tests that:
1. Reach the project's coverage target
2. Guard real behavior and regressions
3. Run fast enough that nobody skips them

A bloated suite of 1.4k shallow tests gives worse protection than 150 integration tests
that actually exercise real code paths. Many shallow tests count coverage lines the same
way one integration test does — but the integration test finds real bugs.

---

## Step 1 — Gather baseline numbers

```bash
# Coverage threshold (check jest.config / vitest.config / package.json)
grep -r "coverageThreshold\|threshold\|coverage" jest.config* vitest.config* package.json \
  | grep -v node_modules | head -10

# Run with coverage AND timing
npm test -- --coverage --verbose 2>&1 | tee /tmp/test-baseline.txt
tail -30 /tmp/test-baseline.txt

# Pull the key numbers from the run
grep -E "Tests:|Test Suites:|Time:" /tmp/test-baseline.txt
grep -E "Statements|Branches|Functions|Lines" /tmp/test-baseline.txt

# Current test count
grep -r "^\s*it\(\|^\s*test\(" --include="*.spec.*" --include="*.test.*" . \
  | grep -v node_modules | wc -l

# Source LOC (not tests)
find src -name '*.ts' -not -path '*/spec*' -not -path '*/test*' \
  | xargs wc -l 2>/dev/null | tail -1
```

Record all four baseline metrics before touching anything:
- **Test count**
- **Suite runtime** (seconds)
- **Coverage %** (lines or statements — whichever the threshold uses)
- **Source LOC**

Map source LOC to the proportionality table to set your count target:

| App type | Source LOC | Efficient test count |
|---|---|---|
| Discord bot (≤30 commands) | ~5k | 50–200 |
| Browser extension | ~3k | 40–150 |
| REST API (≤20 routes) | ~4k | 80–250 |
| CLI tool | ~2k | 30–120 |
| Full-stack app | ~15k | 200–600 |
| Polyglot bot / multi-feature app | 15k–50k | 500–1500 |

The "polyglot bot" row covers full-stack-tier bots/services that are well past the
≤30-commands bracket — Discord bots with 30+ commands across distinct subsystems
(music + scrobble + automod + giveaways + moderation + levels + …), platform plugins,
or feature-rich CLIs that ship multiple domain modules. Treat the count as a ceiling,
not a floor: aggressive deletion below 500 should only happen if the suite shrinks
organically and integration coverage stays. See
`docs/decisions/2026-05-09-bot-test-suite-cleanup-strategy.md` in the Lucky repo for
a worked example of why 50–200 was unreachable for a 39k LOC bot.

**Plan: reach the count target while maintaining coverage and cutting suite runtime.**
At 1.4k tests targeting 50–200, plan to delete ~85% of the suite. You will likely write a
small number of replacement integration tests to recover coverage lost from deleting shallow
units. Net count and runtime still drop dramatically.

---

## Step 1.5 — Reality check: is the target reachable under the current gate?

Before touching anything, verify the proportionality target is achievable given the
project's coverage threshold. This is the most common reason cleanup stalls at "still
1.4k tests after a pass".

```bash
# Count testable functions in the covered source
find src extension lib -name '*.ts' -o -name '*.js' 2>/dev/null \
  | grep -vE "spec|test|__tests__|node_modules" \
  | xargs grep -cE "^\s*(function|const \w+ = \(|export (default )?(function|const)|class \w+)" 2>/dev/null \
  | awk -F: '{s+=$2} END {print s}'
```

**Compatibility check:**

If the gate is `functions: ≥99%` and source has 1500 functions, the suite **cannot**
have fewer than ~1485 tests unless you write integration tests that each cover ~10
functions. The proportionality target of 40–150 tests is then mathematically unreachable
without one of:

- **Lowering the gate** to a number compatible with the target (e.g., functions ≥85%)
- **Excluding more files** from coverage measurement (test fixtures, generated code,
  trivial wrappers)
- **Writing integration tests aggressively** so each test covers ~10x the functions a
  unit test would (this is mandatory if neither of the above is acceptable)

**If incompatible, STOP and surface the conflict explicitly to the user before pruning:**

```
COVERAGE/TARGET CONFLICT

Project gate:        functions ≥99% over <path>
Functions in scope:  1480
Implied min tests:   ~1480 (1 per function) or ~150 with 10x integration coverage
Proportionality:     40–150 (browser extension, ~3k LOC)

The current gate makes the proportionality target unreachable through deletion alone.
Choose one before continuing:

  A) Lower the gate to <X>% (writes a recommended jest.config patch)
  B) Exclude <files> from coverage scope (writes the patch)
  C) Commit to writing integration tests during this pass (skill continues into
     the integration-test phase, not just deletion)
  D) Accept higher count; cap deletion at "obvious waste" (mocked-SUT, filler,
     skipped) and leave structural tests in place

Default if no answer: A with gate at 90% functions / 90% lines (typical for browser
extensions), and continue cleanup against the new gate.
```

Do not start deletion until this is resolved. Pruning under a structurally incompatible
gate will always stall at "still way over target" and waste the cleanup effort.

---

## Step 2 — Delete skipped and pending tests immediately

Before any analysis, sweep for dead tests. These have zero coverage contribution and zero
behavioral value. Delete without checking anything else.

```bash
# Find all skipped/pending tests
grep -rn "it\.skip\|xit\|xdescribe\|describe\.skip\|test\.skip\|it\.todo\|test\.todo" \
  --include="*.spec.*" --include="*.test.*" . | grep -v node_modules
```

Delete the entire `it.skip` / `xit` / `xdescribe` block for each hit. If an `xdescribe`
wraps the whole file, delete the file.

These are tests someone broke and never fixed, or wrote and never enabled. They're not
coming back. Delete them now, before the baseline run pollutes the count.

---

## Step 3 — Use test names as a triage signal

Bad names reliably indicate bad tests. Scan for them to decide which files to audit first.

```bash
grep -rn "should work\|test 1\|test 2\|handles the case\|it works\|works correctly\
\|does the thing\|basic test\|simple test\|dummy\|placeholder\|TODO\|FIXME" \
  --include="*.spec.*" --include="*.test.*" . | grep -v node_modules
```

Files with many hits in this list go to the top of the audit queue. A test named
"should work" almost never tests anything meaningful — it was written to close a coverage
gap, not to catch a bug. Read those tests first; they are usually the first deletions.

Do not skip files with good names — good naming doesn't guarantee good tests. But bad
naming is a reliable fast-path to the worst offenders.

---

## Step 4 — Delete whole files

Assess entire files before reading individual tests.

**Delete the whole file if:**
- The source file it tests no longer exists
- Every test mocks the module under test (nothing real is being tested)
- It only tests TypeScript types, interfaces, or enums (the compiler handles this)
- It is a structural duplicate of another spec file with >70% overlap
- All tests are `toBeDefined()`, `toBeInstanceOf()`, or similar filler

```bash
# Find orphaned spec files (source file gone)
for f in $(find . -name '*.spec.ts' | grep -v node_modules); do
  src="${f/.spec.ts/.ts}"
  src="${src/\/__tests__\//\/}"
  [ ! -f "$src" ] && echo "ORPHAN: $f"
done
```

---

## Step 5 — Delete waste patterns within remaining files

Within each file, delete `it()` blocks matching these patterns.

### Mocked-everything units (largest source of bloat)

The file under test is mocked inside its own spec — nothing real runs:
```ts
jest.mock('../myService')  // myService is what this file is supposed to test
```
Delete every test in that describe block. If the whole file is this pattern, delete the file.

Only assertion is that a mock was called with its own mock input:
```ts
expect(mockSendEmail).toHaveBeenCalledWith(mockPayload)
// where mockPayload is defined in the same test
```
This is circular. Delete.

### Filler assertions

```ts
expect(result).toBeDefined()
expect(result).not.toBeNull()
expect(true).toBe(true)
expect(service).toBeInstanceOf(MyService)
expect(typeof handler).toBe('function')
```

### Trivial structure tests

```ts
it('should be defined', () => { expect(service).toBeDefined() })
it('should create an instance', () => { expect(new MyClass()).toBeInstanceOf(MyClass) })
it('should return the id', () => { expect(obj.getId()).toBe(obj.id) })
```

### Redundant same-path tests

3+ tests exercise the identical code path with cosmetically different inputs that don't
represent meaningfully distinct edge cases. Keep 1, delete the rest:

```ts
it('formats Alice', () => expect(format('Alice')).toBe('Alice'))
it('formats Bob',   () => expect(format('Bob')).toBe('Bob'))
it('formats Carol', () => expect(format('Carol')).toBe('Carol'))
```
→ Keep 1.

### Snapshot bloat

`toMatchSnapshot()` on pure data transformations, serialized plain objects, or anything
where the snapshot is a stringified version of the input. Delete unless the rendered output
is itself the contract (CLI help text, email templates, PDF output).

### Slow test smell

```bash
# Find tests with artificial delays
grep -rn "sleep\|setTimeout\|setInterval\|waitFor.*\d{4,}" \
  --include="*.spec.*" --include="*.test.*" . | grep -v node_modules
```

Tests with multi-second waits are usually testing timing rather than behavior. If the
source code has a hardcoded delay, that's a source bug — not something to test in the
suite. Delete the timing-dependent tests; fix the source if needed.

---

## Step 6 — Check coverage after each batch of deletions

After deleting a batch (every 5–10 files):

```bash
npm test -- --coverage 2>&1 | tail -10
```

If coverage drops **below the threshold**, that batch deleted sole coverage contributors.
Two options:

**Option A — Write one replacement integration test** covering those paths as a natural
side effect of exercising a real flow. One integration test covering 80 lines is better
than 12 shallow mocks covering the same 80 lines one at a time.

**Option B — Restore the single best test from that batch** (not all of them) — the one
that covers the most uncovered lines with the least mocking.

Never restore a whole batch. Find the gap, fix it surgically.

---

## Step 7 — Write replacement integration tests (mandatory when stuck)

This step is **not optional** when the count target hasn't been reached and you're up
against the coverage gate. Bailing out with "further deletion needs replacement tests
and that's a separate scope" is the failure mode this skill exists to prevent.

When pure deletion stalls because the gate is binding:

1. **Identify the structural cluster** — group remaining tests by the source file or
   feature they cover. Look for groups of 5+ tests covering one module via different
   inputs/branches.

2. **Write the integration test that subsumes the cluster.** It should:
   - Enter through the public API of the module (exported function, command handler,
     route, message handler)
   - Drive the input that exercises every branch the cluster was covering, in one or
     a few realistic scenarios (table-driven `it.each` is fine — that's still one test)
   - Use real implementations of internal collaborators; mock only external boundaries
     (network, file system, time)
   - Assert on the observable output / side effect, not internal call sequences

3. **Delete the cluster.** All of it. Re-run coverage to confirm the gate still holds.
   If coverage drops, the integration test is missing a branch — extend it (don't
   restore the deleted unit tests).

4. **Repeat for every cluster** until either the count target is hit or every remaining
   test independently earns its keep by the keep criteria in step 3 of the skill.

**Target: each integration test covers at least 3× the lines of the tests it replaces,
at 1/5th the test count.** A 30-test cluster collapses into ~6 `it.each` rows in one
integration test, with same or better coverage.

### When to consider an `it.each` table

If the cluster is "same code path, different inputs" (e.g., 30 tests of "this concept
maps to that label"), `it.each([...]).test('%s → %s', ...)` is a single integration test
that covers all 30 cases without paying the per-test setup cost. Coverage tools count
each row as one test execution; the suite counts it as ONE test. This alone can collapse
the COMPOSED_EN/PT-style branch tests at the heart of most browser extension bloat.

```ts
const cases = [
  ['en', 'concept-a', 'Label A'],
  ['en', 'concept-b', 'Label B'],
  // ...28 more rows
] as const

it.each(cases)('renders %s/%s as "%s"', (lang, concept, expected) => {
  expect(render(lang, concept)).toBe(expected)
})
```

Replaces 30 individual `it()` blocks with 1, no coverage loss, branch coverage stays
identical.

### Failure modes when the agent stops here

If you find yourself writing "further deletion needs replacement integration tests and
that's separate scope" — that means you stopped exactly where the value was. The
replacement-test phase IS the cleanup. Going through this step is what converts
"deleted 16 tests" into "deleted 1200 tests".

---

## Step 8 — Consolidate fragmented spec files

After deletion, many files will have 2–3 surviving tests that all cover the same module.
A module with 5 spec files each containing 2 tests is harder to navigate than one spec
file with 10 tests.

```bash
# Find modules with multiple spec files
find . -name '*.spec.ts' | grep -v node_modules \
  | sed 's/\.spec\.ts//' | sed 's/\/__tests__\//\//' \
  | sort | uniq -d
```

For each module with multiple sparse spec files:
1. Merge all surviving tests into the primary spec file
2. Deduplicate `beforeEach` setup
3. Delete the now-empty secondary spec files

Do not consolidate files that are intentionally separated (e.g., unit vs. integration
spec for the same module where the separation is meaningful). Merge only when the split
is arbitrary or historical.

---

## Step 9 — Final count, timing, and coverage

```bash
npm test -- --coverage --verbose 2>&1 | tee /tmp/test-after.txt
grep -E "Tests:|Test Suites:|Time:" /tmp/test-after.txt
grep -E "Statements|Branches|Functions|Lines" /tmp/test-after.txt

grep -r "^\s*it\(\|^\s*test\(" --include="*.spec.*" --include="*.test.*" . \
  | grep -v node_modules | wc -l
```

Report:
- Test count: before → after (% reduction)
- Suite runtime: before → after (% faster)
- Coverage: before → after (must be ≥ threshold)
- Replacement integration tests written (count + what they cover)
- Files deleted entirely (count + dominant reason)
- Top 3 waste patterns by volume

**Success = count target hit AND coverage threshold maintained AND runtime reduced.**

If coverage is below threshold, write more integration tests before declaring done.
If count is above the proportionality target, continue deleting.

---

## Step 10 — Optional: mutation testing to validate the survivors

Run mutation testing against the cleaned suite to verify that the tests that survived
actually catch failures when the source is broken. This is the definitive answer to
"is what's left actually protective?"

```bash
# JavaScript/TypeScript — Stryker
npx stryker run

# Python — mutmut
mutmut run
mutmut results

# Go — go-mutesting
go-mutesting ./...
```

Stryker config if not present:

```json
{
  "mutate": ["src/**/*.ts", "!src/**/*.spec.ts"],
  "testRunner": "jest",
  "reporters": ["clear-text", "progress"],
  "coverageAnalysis": "perTest"
}
```

**Mutation score interpretation:**
- >80% — the suite is genuinely protective
- 60–80% — acceptable, some gaps remain
- <60% — significant portions of the surviving suite are not catching failures;
  consider another deletion pass to remove tests with 0 mutation kills and replace
  them with tests that actually verify outcomes

This step is optional but highly recommended after a major cleanup. It often reveals
that some "legitimate-looking" tests that survived the earlier passes are still not
catching anything meaningful.

---

## Failure / Stop Conditions

- If a deletion causes cascading failures in unrelated tests: shared state or bad
  isolation — fix the isolation, then continue deleting
- Writing integration tests is **never** out of scope for this skill. If you find
  yourself wanting to declare it so, that's the signal to do it now — see step 7. The
  only valid stop conditions related to coverage are: (a) the user explicitly accepted
  a higher count in the step-1.5 conflict resolution, (b) coverage gate has already
  been lowered to a number compatible with the proportionality target, or (c) the
  remaining tests all pass the keep criteria in step 3 individually
- If coverage tooling cannot run at all (broken config, missing dependencies): stop and
  fix the tooling first; pruning blind to coverage is too risky
- If `--dry-run`: output the full deletion list and any replacement tests needed,
  without touching files

## Memory Hooks

- Write memory with: final test count, suite runtime, coverage %, and proportionality
  target so future sessions don't re-pad the suite
