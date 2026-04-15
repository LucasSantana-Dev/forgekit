# LLM Evaluation Patterns

Measure before you ship. Intuition about model quality is unreliable — score it systematically. This guide covers evaluation frameworks, golden datasets, regression testing, and production monitoring for LLM-powered features.

---

## Why Eval Matters

LLMs are non-deterministic. A prompt change that feels like an improvement can:

- Fix one case and regress five others
- Improve average score while degrading the worst-case
- Pass a vibe check but fail real user queries

Evaluation makes quality changes verifiable and reversible.

---

## Evaluation Stack

```
Layer 1: Automated metrics     — instant, cheap, run on every PR
Layer 2: LLM-as-judge          — nuanced, scalable, no human annotation
Layer 3: Human preference      — ground truth for alignment decisions
Layer 4: Production monitoring — real distribution, real failures
```

Don't skip layers — use all four, at appropriate frequency.

---

## Layer 1: Automated Metrics

### Text Generation

| Metric      | Formula                     | Best for                      |
| ----------- | --------------------------- | ----------------------------- |
| ROUGE-L     | LCS overlap with reference  | Summarization, extraction     |
| BLEU        | n-gram precision            | Translation, templated output |
| BERTScore   | Embedding cosine similarity | Semantic equivalence          |
| Exact Match | char-exact equality         | Structured output, QA         |

**Thresholds for production:** ROUGE-L > 0.4, BERTScore F1 > 0.85

### Code Generation

- **Pass@K**: does any of K samples pass the test suite?
- **Execution Accuracy**: does the output run without errors?
- **BLEU-code**: syntactic similarity to reference solution

### Structured Output

- **Schema Validity**: does the output conform to the expected schema?
- **Field Accuracy**: are individual fields correct? (per-field F1)

---

## Layer 2: LLM-as-Judge

Use a capable model (e.g., Claude Opus, GPT-4o) to score outputs on defined rubrics.

### Judge Prompt Template

```text
You are an expert evaluator. Score the following response on a 1–5 scale for each dimension.

Dimensions:
- correctness: Is the answer factually accurate?
- completeness: Does it address all parts of the question?
- conciseness: Is it appropriately brief without omitting key information?
- groundedness: Is every claim supported by the provided context (if any)?

Question: {query}
Reference answer: {reference}
Model response: {response}

Return only valid JSON: {"correctness": N, "completeness": N, "conciseness": N, "groundedness": N, "reasoning": "..."}
```

### Judge Reliability Rules

- Use a **different model** as judge than the one being evaluated — self-judging is biased
- Run each judgment **3×** and average — judges are noisy (σ ≈ 0.3 on 1–5 scale)
- Include a **reference answer** when available — improves inter-rater agreement
- Calibrate with 10–20 human-labeled examples before deploying automated judgment

---

## Layer 3: Human Preference

### A/B Preference Protocol

Present two responses (A=baseline, B=new) without revealing which is which:

```
Question: <query>

Response A: <output from model A>
Response B: <output from model B>

Which response is better overall? A / B / Tie
Which is more accurate? A / B / Tie
Which would you use in production? A / B / Tie
```

**Sample size:** minimum 50 pairs per dimension for statistical significance (p < 0.05)

### Preference Data Storage

```jsonl
{
  "query": "...",
  "baseline": "...",
  "candidate": "...",
  "winner": "B",
  "dimension": "accuracy",
  "annotator": "user-123",
  "timestamp": "2026-04-10T12:00:00Z"
}
```

---

## Layer 4: Production Monitoring

### What to Log

Every LLM call should emit:

```json
{
  "request_id": "uuid",
  "timestamp": "ISO-8601",
  "model": "claude-sonnet-4-6",
  "prompt_tokens": 1200,
  "completion_tokens": 350,
  "latency_ms": 1840,
  "input": "<hashed or sampled>",
  "output": "<hashed or sampled>",
  "user_feedback": null
}
```

### Alerting Thresholds

| Signal           | Threshold     | Action                                 |
| ---------------- | ------------- | -------------------------------------- |
| Refusal rate     | > 5%          | Check prompt for policy violations     |
| Error rate       | > 1%          | Check API health, prompt formatting    |
| Latency P95      | > 5s          | Check token budget, model availability |
| User thumbs-down | > 15%         | Trigger eval campaign                  |
| Cost per request | > 2× baseline | Check for prompt injection or loop     |

---

## Golden Dataset

The most valuable eval asset you can build.

### Building the Dataset

1. **Seed**: manually curate 50 representative inputs covering happy path, edge cases, adversarial
2. **Tag**: each case with `domain`, `difficulty` (easy/medium/hard), `type` (factual/reasoning/creative)
3. **Reference**: add expected output or evaluation criteria per case
4. **Grow**: add a new case for every bug fixed and every user-reported failure

```jsonl
{
  "id": "auth-001",
  "domain": "auth",
  "difficulty": "medium",
  "query": "...",
  "reference": "...",
  "tags": [
    "edge-case",
    "multipart"
  ]
}
```

### Running Evaluations

```bash
# Compare baseline vs candidate on golden dataset
eval run --dataset evals/golden.jsonl --model baseline --output evals/results/baseline.json
eval run --dataset evals/golden.jsonl --model candidate --output evals/results/candidate.json
eval compare evals/results/baseline.json evals/results/candidate.json
```

### Regression Gate (CI)

Add to pre-PR checks:

- Run golden dataset against candidate model/prompt
- Fail if any dimension regresses > 5% vs. last release baseline
- Report per-tag breakdown (catch regressions in specific domains)

---

## Eval-Driven Development

Apply TDD principles to LLM features:

1. **Write the eval first**: define what "correct" means before writing the prompt
2. **Run baseline**: measure current performance (or 0 if new feature)
3. **Iterate on the prompt/model/RAG**: make changes, re-run, check delta
4. **Ship when**: eval passes gate AND no regressions vs. baseline
5. **Monitor in prod**: watch real distribution for distribution shift

---

## Common Pitfalls

| Pitfall                            | Consequence                             | Fix                                           |
| ---------------------------------- | --------------------------------------- | --------------------------------------------- |
| Eval on training distribution only | Inflated scores, prod failure           | Include adversarial and edge cases            |
| Single metric                      | Misses quality dimensions               | Evaluate 3+ dimensions                        |
| Same model as judge                | Self-serving bias                       | Use a different model as judge                |
| No regression gate                 | Prompt changes break old cases silently | Golden dataset + CI gate                      |
| Manual eval only                   | Too slow for iteration                  | Automate layer 1–2, reserve human for layer 3 |
| Eval after shipping                | You never know you regressed            | Eval is part of the PR checklist              |

---

## Tools

| Tool                      | Use                                                       |
| ------------------------- | --------------------------------------------------------- |
| **RAGAS**                 | RAG pipeline evaluation (faithfulness, relevance, recall) |
| **LangSmith**             | Tracing, evaluation datasets, A/B testing                 |
| **TruLens**               | LLM pipeline tracing and eval                             |
| **lm-evaluation-harness** | Standard benchmarks (MMLU, GSM8K, HumanEval)              |
| **Braintrust**            | Eval datasets, human annotation, automated scoring        |

---

## Eval Report Template

```markdown
## Eval Report — <feature/model/prompt name>

**Date:** 2026-04-10  
**Model:** claude-sonnet-4-6  
**Dataset:** evals/golden.jsonl (N=120)

### Scores

| Dimension    | Baseline | Candidate | Delta                 |
| ------------ | -------- | --------- | --------------------- |
| Correctness  | 3.8      | 4.1       | +0.3 ✅               |
| Completeness | 3.5      | 3.4       | -0.1 ✅ (within gate) |
| Conciseness  | 4.0      | 4.2       | +0.2 ✅               |

### Regressions

None. All dimensions within 5% gate.

### Decision

**SHIP** — candidate outperforms baseline across all primary dimensions.
```
