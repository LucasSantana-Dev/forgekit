---
id: benchmark-reality-gap
title: Benchmark Reality Gap
description: 'SWE-bench and similar curated benchmarks overestimate agent capability
  by 50%+ in real-world deployment. The gap emerges from benchmark framing: clean
  task descriptions with sufficient context don''t resemble actual user queries, which
  are ambiguous, under-specified, and embedded in noisy ticket systems. Closing the
  gap requires domain-specific evaluation sets grounded in real user behavior.'
tags:
- skill-md
- prompting
- testing
- security
- git
- agents
source:
  path: ai-dev-toolkit/patterns/benchmark-reality-gap.md
  license: MIT
translations:
  pt-BR:
    title: Benchmark vs. Realidade
    description: SWE-bench e benchmarks similares superestimam capacidade de agentes
      em 50%+ em cenários reais. Este doc detalha o gap e como calibrar expectativas.
---
SWE-bench and similar curated benchmarks overestimate agent capability by 50%+ in real-world deployment. The gap emerges from benchmark framing: clean task descriptions with sufficient context don't resemble actual user queries, which are ambiguous, under-specified, and embedded in noisy ticket systems. Closing the gap requires domain-specific evaluation sets grounded in real user behavior.

> _Research informed by CAIN 2026 studies on SWE-bench vs. production agents; IDE telemetry analysis of query distribution from 200+ orgs; mutation techniques applied to convert synthetic benchmarks into realistic eval sets._

## The gap: why benchmarks lie

Curated benchmarks like SWE-bench are high-signal but low-fidelity:

- **Benchmark framing**: "Add a function to `module.py` that computes the factorial of an integer." Sufficient context, known-good acceptance criteria.
- **Real-world query**: "Factorial is broken" (from a 3-line Slack message in a 5-year-old codebase). Context is scattered across docs, issues, tests, and team history.

The 50%+ overestimate occurs because:

1. **Context abundance** — benchmark tasks come with `README.md`, working test suites, and clear accept/reject signals. Real tasks bury context in sprawling repos, outdated docs, and implicit domain knowledge.
2. **Single-threaded reasoning** — benchmarks ask "do X"; real queries require the agent to infer intent from partial signals ("we should use a cache here" → debug, understand why caching was discussed, then implement).
3. **Known search space** — benchmark tasks include the right files and functions. Real tasks hide the target in 10,000+ lines across 40+ files.
4. **Acceptance ambiguity** — benchmarks have crisp pass/fail. User tasks often have vague success criteria: "improve performance", "refactor this mess", "make it faster".
5. **Noise injection** — real repos have false-positive tests, dead code, deprecated patterns, conflicting documentation. Benchmarks sanitize these.

## Mutation techniques to bridge the gap

Convert benchmark datasets into realistic evals by applying these transformations:

### 1. Task Paraphrasing

Take a benchmark task and rewrite it as a user would say it:

**Original**: "Implement a BFS algorithm that returns the shortest path in an unweighted graph."

**Mutated variants**:
- "We need better graph traversal perf"
- "BFS is slow"
- "shortest path" (single keyword)
- "look at graph.py—it's broken in the integration tests" (no algorithm name)
- "Can we use BFS here?" (interrogative, no explicit target)

Run the agent on each variant. Measure success rate across variants, not just the original. A 90% pass rate on the original but 30% on variants signals benchmark overfitting.

### 2. Context Perturbation

Real codebases have noise: dead code, outdated comments, competing implementations. Inject it:

- **Red herrings**: Add unused functions with similar names (`factorial_slow`, `factorial_old`) to the same file.
- **Conflicting docs**: Add a `README` section that contradicts the correct implementation, or points to a deprecated API.
- **Scattered context**: Split the original task context across three different files (one in comments, one in tests, one in a related function).
- **Temporal inconsistency**: Add git history showing a previous "correct" implementation that the task now contradicts.

Re-run the benchmark against the noisy variant. If success rate drops >20%, context robustness is a blocker for real deployment.

### 3. Incomplete Input

Benchmarks provide complete method signatures, imports, and class definitions. Real queries don't:

**Original task**:
```python
def merge_sorted_arrays(arr1: List[int], arr2: List[int]) -> List[int]:
    """Merge two sorted arrays and return the result."""
    pass
```

**Mutated**:
```python
# In a sprawling file with no imports visible
def merge(a, b):
    pass

# Somewhere else in the file
merged_result = merge(arr1, arr2)  # Expected to return a list
```

Provide only the incomplete stub and ask the agent to implement it without the docstring or type hints. This forces the agent to infer intent from usage.

### 4. Integration Depth

Benchmarks often isolate the task (e.g., "implement quicksort"). Real tasks embed in larger workflows:

**Isolated**: "Implement a JSON parser."

**Integrated**: "User reports parsing timesout on large files. Our JSON module (currently using json.loads) calls this parser. You'll need to optimize it, ensure backward compatibility with existing callers, add telemetry, and update docs."

Increase the integration complexity: require the agent to touch 3+ modules, update tests, refactor callers, and ensure no regressions.

## Building domain-specific eval sets

Don't try to salvage curated benchmarks. Instead, build eval sets from real data:

### Step 1: Harvest Real User Queries

Collect 100–500 real task descriptions from:

- **GitHub Issues** in your org (title + body, not synthesized)
- **Tickets** from Jira, Linear, or your issue tracker
- **Slack/Discord** discussion snippets where work was assigned
- **PR descriptions** that mention the original problem
- **Support tickets** or bug reports

Use 3–6 months of recent data. Anonymize sensitive details, but preserve ambiguity.

### Step 2: Extract Minimal Queries

For each task:
- Extract the user's first statement (often 1–3 sentences)
- Remove context the user provided verbally but not in writing
- Keep references to artifacts ("the deploy script", "ProductService") but strip internal details

Example harvest:
```
Raw: "Hey, ProductService.getPrice() returns wrong values when called from
the checkout flow, but only on Tuesday and Thursday nights. We saw this in
logs yesterday. Can you trace it and fix?"

Minimal query: "ProductService.getPrice() returns wrong values during checkout.
Trace and fix."
```

### Step 3: Select a Small Gold-Standard Subset

Have 2–3 engineers manually solve 20–30 of the harvested queries. Document:
- Time to understand the problem
- Files that needed changes
- The exact changes made
- Whether the solution required domain knowledge (e.g., "only affects Tue/Thu" → caching issue)

This subset becomes your ground truth.

### Step 4: Evaluate Against the Gold Standard

Run your agent on the harvested queries. For each:

- **Success**: Agent's output matches or exceeds the manual solution.
- **Partial**: Agent found the right module but incomplete fix.
- **Failure**: Agent took the wrong approach or didn't solve it.
- **Hallucination**: Agent claimed a fix when it made things worse.

Track metrics:
- Pass rate (success / total)
- Failure categories (wrong module, incomplete, hallucination, timeout)
- Time-to-first-working-solution

### Step 5: Build Regression Tests

Convert successful evals into regression tests:

```python
def test_agent_query_productservice_pricing():
    """Real query from 2026-Q1: ProductService.getPrice() wrong during checkout."""
    query = "ProductService.getPrice() returns wrong values during checkout. Trace and fix."
    result = agent.run(query, repo=test_repo)
    
    # Manual gold standard: commit SHA abc123def456
    expected_files = {"src/ProductService.ts", "tests/ProductService.test.ts"}
    assert result.modified_files == expected_files
    assert test_repo.run_suite() == "all pass"
```

Run these regressions before deploying agent updates. A 10–15% pass-rate drop between versions signals a regression.

## Interpreting the gap

If your agent scores 80% on SWE-bench but 40% on domain-specific evals:

1. **Expectation mismatch** — you're using a benchmark tuned for synthetic tasks. This is normal and expected.
2. **Opportunity** — the 40% is the real upper bound in your domain. Invest in:
   - Better retrieval (context building) — agent spends too long searching files
   - Prompt iteration — domain-specific preambles and guardrails
   - Tool extensions — add domain-specific code search or graph queries
3. **Decision gate** — 40% might be sufficient if the agent handles high-value low-frequency work (e.g., cross-repo refactors). It's not sufficient for autonomy-heavy workflows (e.g., incident response).

## Continuous evaluation

Don't build eval sets once and forget them:

- **Monthly refresh**: Every month, harvest 50 new queries from your user base. Add top 10 to your eval set.
- **Post-incident review**: When the agent makes a real mistake in production, add that query + fix to evals.
- **Skill updates**: When you add a new skill or tool to the agent, re-run evals to catch regressions.
- **Model upgrades**: When your LLM provider releases a new model, benchmark against the old eval set first.

See [`patterns/agent-evals-ci.md`](./agent-evals-ci.md) for integrating these evals into your CI pipeline and automating regression detection.

## What not to do

- **Claim your benchmark score equals production capability** — it doesn't. Quote SWE-bench as one data point; lead with domain-specific pass rates.
- **Use only open-source benchmarks** — they optimize for leaderboard metrics, not your workflow. Use them for initial signal, not final judgment.
- **Treat benchmark evaluation as a one-time gate** — capability drifts with model updates, domain changes, and tool additions. Re-evaluate quarterly.
- **Build eval sets from synthetic data** — you'll recreate the original problem. Harvest from actual user queries.
- **Ignore failure categories** — all failures are not equal. Timeouts are worse than wrong answers (wrong answers can be caught; timeouts block the user). Hallucinations are worse than "I don't know".

## Related

- [`patterns/agent-evals-ci.md`](./agent-evals-ci.md) — integrating these evals into CI; regression detection; per-skill scoring
- [`patterns/agent-observability.md`](./agent-observability.md) — instrumenting the agent to understand where queries fail
- [`patterns/prompting-discipline.md`](./prompting-discipline.md) — prompt patterns that improve real-world task success
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md) — human-in-the-loop frameworks that complement agent autonomy
