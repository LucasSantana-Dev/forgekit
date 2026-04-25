---
status: active
audience: developers
reading_time: 12 min
---

# Local models in your Forge Kit workflow

Forge Kit is built around Claude Code as the primary agent. It's also
completely fine with you running **local models** on the side —
open-weight LLMs (Llama 3, Qwen 2.5, Mistral, DeepSeek, Gemma) on your
own laptop, for privacy, offline work, bulk/cheap tasks, and tight
feedback loops.

This guide covers the three local runtimes that actually matter —
**Ollama**, **LM Studio**, **llama.cpp** — and how to wire them in
without over-committing.

## The short answer

- **Starting from scratch?** Install Ollama. `ollama pull qwen2.5-coder:7b`. Done. 90% of people who want local models want this.
- **Want a GUI and A/B model comparison?** LM Studio.
- **Building something that embeds inference?** llama.cpp.

All three expose an **OpenAI-compatible HTTP endpoint**, so any tool that
speaks OpenAI can point at them with only a base-URL change.

## Decide before you install

Answer these three questions first.

### 1. What's my hardware ceiling?

| You have | Realistic model size (quantized) |
|---|---|
| 8 GB unified / VRAM (MacBook Air M1, laptop with 1660 Ti) | 3B–7B |
| 16 GB (MacBook Pro M-series base, mid-range desktop) | 13B–14B |
| 24 GB (Mac Studio, RTX 3090/4090) | 30B–34B |
| 48 GB+ (M3/M4 Max, multi-GPU workstation) | 70B |

If you don't have at least 8 GB of usable VRAM or unified memory, skip
local. You'll spend more time fighting the setup than you'll save.

### 2. What am I actually trying to do?

- **Editor autocomplete / inline hints** → local shines here (sub-100ms).
- **Long-form code review on a diff** → Claude API still wins on quality.
- **Bulk labeling / summarization / translation of 1000 items** → local
  wins on cost once hardware is paid for.
- **Offline work on a plane** → local is the only option.
- **Sensitive / NDA code** → local or nothing.

### 3. Do I have 30 focused minutes?

That's enough to install Ollama, pull a model, and integrate it with one
editor. If not, bookmark this and come back — half-setups cause more
trouble than they solve.

## Install path by runtime

### Ollama (recommended starter)

**macOS:**
```bash
brew install ollama
ollama serve &                         # starts the daemon on :11434
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
systemctl --user enable --now ollama
```

**Pull a starter model** (~4 GB download):
```bash
ollama pull qwen2.5-coder:7b            # coding-tuned Qwen 2.5, small
# or:
ollama pull llama3.2:3b                 # Llama 3.2, very small
ollama pull mistral-nemo:12b            # if you have 16 GB+
```

**Test:**
```bash
ollama run qwen2.5-coder:7b "Write a Python function that reverses a string. One line."
```

Two endpoints get exposed:
- Native Ollama: `http://localhost:11434/api/generate`
- OpenAI-compatible: `http://localhost:11434/v1/chat/completions`

**Verify is it working**: see [Is it working?](./is-it-working.md) — same
honest-questions checklist, just pointed at a local model.

### LM Studio (GUI-first)

1. Download from [lmstudio.ai](https://lmstudio.ai/).
2. Install, launch.
3. **Discover** tab → search for a model (e.g. `Qwen2.5-Coder-7B-Instruct-GGUF`).
4. **Chat** tab → pick the model from the dropdown and try it.
5. **Local Server** tab → Start Server. You now have
   `http://localhost:1234/v1/chat/completions` (OpenAI-compatible).

LM Studio's killer feature is **side-by-side** — load two models and
compare their responses on the same prompt. Useful before committing
to one.

On Apple Silicon, prefer MLX-optimized model variants (LM Studio marks
them). They're 2–3× faster than GGUF.

### llama.cpp (lowest level)

Only reach for this if Ollama or LM Studio doesn't do what you need.

```bash
# macOS / Linux
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
cmake -B build
cmake --build build -j

# Download a GGUF model manually (Hugging Face, TheBloke, etc.)
# e.g. qwen2.5-coder-7b-instruct-q4_k_m.gguf

# Serve it
./build/bin/llama-server \
  -m /path/to/qwen2.5-coder-7b-instruct-q4_k_m.gguf \
  --port 8080 \
  --ctx-size 8192

# http://localhost:8080/v1/chat/completions is now live
```

Use cases:
- Very specific quantization (e.g. IQ4_XS, a custom mix).
- Embedding inference in your own app.
- Apple Metal / CUDA / ROCm build-flag control.

## Wiring local into your actual workflow

Three concrete patterns.

### Pattern 1 — Editor autocomplete (fast, low-stakes)

Use an editor extension pointed at the local endpoint for **inline
completions**:

- **Continue.dev** (VS Code / JetBrains) — in `~/.continue/config.json`:
  ```json
  {
    "models": [
      {
        "title": "Qwen 2.5 Coder 7B (local)",
        "provider": "ollama",
        "model": "qwen2.5-coder:7b",
        "apiBase": "http://localhost:11434"
      }
    ]
  }
  ```
- **Cursor / Windsurf** — most of these accept an OpenAI-compatible
  base URL in settings. Point it at
  `http://localhost:11434/v1`.

Keep Claude Code for the big-thinking turns; local handles the typing
assist. Different tools for different moments.

### Pattern 2 — Batch / offline tasks

Low-stakes, high-volume work that's 90%-good-enough on a local model:

- Labeling / classification of many items
- Translation spot-checks
- Test-data generation
- Log summarization
- Git commit message drafts
- Documentation first-pass

Tiny wrapper script that calls the local OpenAI-compatible endpoint over
1,000 items will often beat hitting the Claude API on cost, once
hardware is accounted for. Measure before you commit to it — see the
**`adt-cost`** skill.

### Pattern 3 — Privacy-gated pre-review

Run a local-model review pass against your diff **before** it ever leaves
the machine. Even a small model will flag obvious issues (missing
error paths, leaky try/except, TODO-left-in-code). Then the public
review tool handles the rest.

Useful for: NDA'd code, medical/legal projects, anything where "don't
send this to a third party" is table stakes.

```bash
# Conceptual — adjust paths + model to your setup
git diff origin/main...HEAD | \
  curl -s http://localhost:11434/v1/chat/completions \
    -H 'Content-Type: application/json' \
    -d @- <<EOF
{
  "model": "qwen2.5-coder:7b",
  "messages": [
    {"role": "system", "content": "You are a strict reviewer. Flag bugs, missing error paths, security issues. Be terse."},
    {"role": "user", "content": "$(cat)"}
  ]
}
EOF
```

## What local won't do well (today)

- **Frontier reasoning.** Hard multi-step debugging, architecture calls,
  complex refactors across many files — the best hosted model still
  wins. Don't pretend otherwise.
- **Long context.** Most local models cap at 32k tokens and degrade
  noticeably past 16k. The Claude API's 1M context is in a different
  league.
- **Agentic tool use.** Possible but rough. You'll spend time debugging
  the tool-call harness on top of debugging the model.
- **Consistency over many turns.** Local models drift more.

A sensible heuristic: if you'd write the prompt and re-read the response
carefully, local works. If you'd hand it off and trust the output blind,
stay on the API.

## Measurement: is local actually helping?

Same discipline as [Is it working?](./is-it-working.md):

1. **Speed delta.** Time 10 real tasks on Claude API, 10 on local. Be
   honest about setup friction.
2. **Quality delta.** For each task, would you ship local's output
   as-is? Or rework it? Track the rework rate.
3. **Cost delta.** API spend dropped? By how much? Accounting for
   hardware wear, power, your time.
4. **Enjoyment delta.** Fighting with ollama serve every morning isn't
   a win even if the tokens are free.

After a month, if local isn't winning on at least one axis, unwind it.
Novelty isn't adoption.

## Related

- [Local models catalog doc](/docs/local-models/) — site version of
  this topic.
- **`adt-model-serving`** skill — the production-scale side (vLLM, TGI,
  serving many users).
- **`adt-eval`** skill — how to compare local vs API output quality on
  your actual tasks before trusting.
- **`adt-cost`** skill — measure whether routing traffic local actually
  pays off.
- [Is it working?](./is-it-working.md) — the honest-check template.
