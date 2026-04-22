---
id: agent-observability
title: Agent Observability
description: 'AI coding agents produce outputs that look correct but fail in subtle
  ways: - Hallucinated function names that pass review but fail at runtime - Tool
  call sequences that work once but regress under different inputs - Prompt changes
  that improve one case but silently degrade another'
tags:
- skill-md
- claude
- prompting
- testing
- security
- agents
source:
  path: ai-dev-toolkit/patterns/agent-observability.md
  license: MIT
translations:
  pt-BR:
    title: Observabilidade de Agentes
    description: 'Agentes de codificação com IA produzem saídas que parecem corretas
      mas falham de formas sutis: alucinações, raciocínio incompleto, incoerência
      entre ferramentas. Observabilidade é a contramedida.'
---
> If you can't see what your agent did, you can't fix what it does wrong.

## The Problem

AI coding agents produce outputs that look correct but fail in subtle ways:
- Hallucinated function names that pass review but fail at runtime
- Tool call sequences that work once but regress under different inputs
- Prompt changes that improve one case but silently degrade another

Standard logging captures commands, not reasoning. You need traces — the full
chain from user input through every tool call to final output.

## The Pattern

Observability for agents has three layers:

| Layer | Answers | When it fires |
|-------|---------|---------------|
| **Tracing** | What did the agent do, step by step? | Every session |
| **Evaluation** | Did the output meet quality criteria? | On key outputs |
| **Regression testing** | Did a change break past behavior? | Before shipping |

Tracing is cheap and should run always. Evaluation and regression testing target
the outputs that matter — not every Bash call, but every generated feature or
answered question.

## Tracing with lmnr

[lmnr](https://github.com/lmnr-ai/lmnr) instruments agent runs and stores traces
you can query, replay, and annotate.

**Install:**
```bash
# macOS — system Python is externally managed (PEP 668); use pipx
pipx install lmnr          # CLI: ~/.local/bin/lmnr

# Ubuntu/Linux
pip3 install lmnr --break-system-packages
```

**Instrument a Python agent:**
```python
from lmnr import observe, Laminar

Laminar.initialize(project_api_key="<LMNR_API_KEY>")

@observe()
def generate_component(prompt: str) -> str:
    # Any LLM or tool calls made here are auto-traced
    result = call_llm(prompt)
    return result
```

**What gets captured per trace:**
- Input/output for every LLM call
- Tool invocations and their results
- Latency per step
- Token usage

**Querying traces:**
```bash
# View recent runs
lmnr traces list --limit 20

# Filter by label or score
lmnr traces list --label "needs-review"
```

## Prompt Regression Testing with promptfoo

[promptfoo](https://github.com/promptfoo/promptfoo) runs your prompt against a
test suite and fails if outputs regress. Pair it with lmnr: use lmnr traces to
identify good examples, then encode them as promptfoo test cases.

**Install:**
```bash
# macOS / any Node version
npm install -g promptfoo

# Ubuntu + Node 22 — better-sqlite3 has a native module version mismatch when
# installed globally. Install user-local instead so it compiles against current Node.
mkdir -p ~/.npm-global
npm install --prefix ~/.npm-global promptfoo@latest
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
```

**Define a test suite** (`promptfooconfig.yaml`):
```yaml
prompts:
  - "Generate a React button component: {{description}}"

providers:
  - anthropic:claude-sonnet-4-6

tests:
  - vars:
      description: "primary CTA button with loading state"
    assert:
      - type: contains
        value: "disabled"
      - type: contains
        value: "loading"
      - type: not-contains
        value: "TODO"

  - vars:
      description: "destructive delete button"
    assert:
      - type: contains
        value: "variant"
      - type: llm-rubric
        value: "Code uses a danger/destructive color variant"
```

**Run:**
```bash
promptfoo eval
promptfoo view   # open browser dashboard
```

**In CI:**
```yaml
- name: Prompt regression tests
  run: npx promptfoo eval --ci
```

## Security Scanning with claude-code-security-review

[claude-code-security-review](https://github.com/anthropics/claude-code-security-review)
is an official Anthropic GitHub Action that scans PRs for security issues using Claude.

**Add to CI** (`.github/workflows/security.yml`):
```yaml
name: Security Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-security-review@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

The action posts inline PR comments for security findings. It covers:
- Secret exposure
- SQL injection patterns
- Insecure deserialization
- SSRF and path traversal
- Dependency vulnerabilities

## TDD Guard: Enforcement at the Agent Level

[TDD Guard](https://github.com/nizos/tdd-guard) is a Claude Code hook that blocks
the agent from writing implementation before tests exist for the target.

**Setup** (`tdd-guard.json` in project root):
```json
{
  "enabled": true,
  "testDirs": ["src/__tests__", "tests"],
  "blockMessage": "Write the test first. No implementation without a failing test."
}
```

**How it works:**
- TDD Guard intercepts `Write` and `Edit` tool calls
- If the target file has no corresponding test file, it rejects the write
- The agent is forced to create the test file before the implementation

This enforces the test-first constraint at the tool level — the agent can't bypass
it with a clever prompt because the hook runs outside the model.

## Integrating the Three Layers

The highest-signal workflow:

```
1. lmnr traces every session → captures what actually happened
2. Review traces after each session → tag interesting inputs/outputs
3. Convert tagged examples → promptfoo test cases
4. Run promptfoo in CI → regressions caught before merge
5. claude-code-security-review on every PR → security issues surfaced inline
6. TDD Guard in project → implementation never precedes tests
```

This gives you **coverage from development through deployment**:
- Development: TDD Guard enforces test-first
- Review: security review catches vulnerabilities
- Regression: promptfoo catches prompt drift
- Production: lmnr traces let you replay and diagnose failures

## When to Add Each Layer

| Stage | Add |
|-------|-----|
| New project | TDD Guard from day one |
| First LLM call in production | lmnr tracing |
| First prompt iteration | promptfoo eval suite |
| First PR touching security-sensitive code | claude-code-security-review |
| After any model or prompt change | promptfoo regression run |
