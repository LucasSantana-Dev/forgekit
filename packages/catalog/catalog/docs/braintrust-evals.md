---
id: braintrust-evals
title: Braintrust — LLM Evaluation Platform
description: "Open-source eval framework (AutoEvals) + managed platform for scoring LLM + agent outputs. LLM-as-judge, multi-step agent evals, tool-use scoring, human annotation. Positioned as eval-first (not observability). Note: OpenAI Evals platform sunsetting Oct 31 2026."
tags:
  - testing
  - evaluation
  - observability
  - agents
  - llm
translations:
  pt-BR:
    title: Braintrust — Plataforma de Avaliação LLM
    description: "Framework eval open-source (AutoEvals) + plataforma gerenciada para pontuar saídas LLM + agentes. LLM-as-judge, evals multi-passo de agentes, scoring de tool-use, anotação humana. Posicionada como eval-first (não observabilidade). Nota: plataforma OpenAI Evals sunsetting 31 de outubro de 2026."
---

Braintrust is an **evaluation-first platform** for measuring and improving LLM application quality. Unlike observability tools (Langfuse, LangSmith), Braintrust focuses on building datasets, scoring outputs, and running automated evals at development time.

---

## Core Components

### 1. AutoEvals Library (Open Source)

```python
from braintrust import Eval, eval_classifier

# Use built-in scorers (LLM-as-judge, numeric, regex, exact match)
Eval(
    name="my_eval",
    data=[
        {"input": "What is 2+2?", "expected": "4"},
        {"input": "Translate 'hello' to French", "expected": "bonjour"},
    ],
    task=lambda x: my_llm_call(x["input"]),
    scores=[
        eval_classifier(
            name="correctness",
            score_range=(0, 1),
            rubric="Is the output correct?"
        )
    ]
).run()
```

**Built-in scorers:**
- `LLMClassifier` — multi-dimension LLM-as-judge
- `ExactMatch` — string equality
- `Numeric` — compare floats (for scores, BLEU, ROUGE)
- `JSONSchema` — validate structured output
- `Regex` — pattern matching

### 2. Agent Eval Patterns

Braintrust supports multi-step agent evals:

```python
# Eval agents on tool-use accuracy, reasoning, and convergence
Eval(
    name="agent_quality",
    data=[
        {
            "request": "Find the weather in SF",
            "tools_available": ["web_search", "api_lookup"],
            "expected_steps": 2,  # should call tools exactly twice
            "expected_tool_sequence": ["api_lookup", None],  # or web_search
        }
    ],
    task=lambda x: run_agent(x),
    scores=[
        eval_tool_sequence(expected=x["expected_tool_sequence"]),
        eval_step_count(expected=x["expected_steps"]),
        eval_LLM_judge(rubric="Did the agent successfully answer?")
    ]
).run()
```

---

## Managed Platform (Braintrust Cloud)

**Web console** for:
- Dataset management (CRUD, versioning, sampling strategies)
- Human annotation workflows (task assignment, inter-annotator agreement)
- Automated experiment runs (compare two models/prompts on a dataset)
- Real-time results dashboard (pass/fail rates, dimensions breakdown)

**Pricing**: free tier (limited eval runs); paid tiers for teams.

---

## Positioning vs. Langfuse

| Dimension | Braintrust | Langfuse |
|-----------|-----------|----------|
| **Focus** | Evaluation (pre-deploy) | Observability (post-deploy) |
| **Primary use** | Golden datasets, regression testing | Production tracing, cost monitoring |
| **Evals** | First-class, deep | Secondary feature |
| **Agent support** | Tool-use, step-count, convergence | Tracing only |
| **Human annotation** | Built-in | External (Keen, Scale AI) |
| **Notebook integration** | Jupyter, web console | Langfuse dashboard |

**Pick Braintrust** if you need structured eval datasets and multi-step agent scoring.
**Pick Langfuse** if you need production observability + cost tracking.

---

## OpenAI Evals Sunset (Oct 31 2026)

OpenAI's reference eval platform is in read-only mode and will shut down **October 31, 2026**. Braintrust, Langfuse Evals, and Humanloop are the primary alternatives for eval infrastructure.

This doesn't affect OpenAI API model quality; it's only the platform for building and running eval experiments.

---

## Getting Started

1. **Install**: `pip install braintrust`
2. **Create a dataset** in the web console or via Python
3. **Write a scorer** (LLM-as-judge or custom)
4. **Run an eval** on your agent/prompt
5. **Compare experiments** (baseline vs. candidate) — Braintrust shows you which cases regressed

See [docs.braintrust.dev/evaluate](https://docs.braintrust.dev/evaluate) for examples.

---

## Best For

- Teams shipping LLM features and needing regression gates before deploy
- Multi-turn agent evals (verifying tool use, step sequences, convergence)
- Building golden datasets for production quality monitoring
- Groups iterating rapidly on prompts (fast eval feedback loop)

---

## When to Combine with Other Tools

- **Braintrust (evals) + Langfuse (observability)** — eval before deploy, trace after. Common stack.
- **Braintrust + LangSmith** — similar, with LangSmith's tracing + evaluations
- **Local evals (LLM-as-judge in your own code) + Braintrust (managed platform)** — AutoEvals is open source; use it locally for fast iteration, push results to Braintrust for team review
