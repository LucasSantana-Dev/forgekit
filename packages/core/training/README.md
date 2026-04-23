# Training Data

Tools and artifacts for fine-tuning models on your own AI coding sessions.

## Capturing Training Data from Claude Code

`tools/capture-training.py` extracts instruction pairs from your Claude Code session logs.

Claude Code stores every conversation at `~/.claude/projects/**/*.jsonl`. The script parses these, extracts user→assistant exchanges, and writes them in alpaca format for fine-tuning.

**Quick start:**

```bash
# Preview what would be captured
python3 tools/capture-training.py

# Export to training/dataset.jsonl
python3 tools/capture-training.py --export

# Only include multi-turn sessions (higher quality)
python3 tools/capture-training.py --export --min-turns 3

# Custom output path
python3 tools/capture-training.py --export --output /path/to/my-dataset.jsonl
```

**Output format (alpaca):**

```json
{
  "instruction": "user message text",
  "input": "prior context from middle of conversation",
  "output": "assistant response text",
  "source": "claude-code-session",
  "captured_at": "2026-03-30"
}
```

The script deduplicates by file path hash — re-running after new sessions only adds new pairs.

**Recommended workflow:** Run `capture-training.py --export --min-turns 3` after each working session to grow your dataset over time.

---

## Fine-Tuning (Optional)

If you want to bake your captured patterns into a local model, use LoRA fine-tuning with [axolotl](https://github.com/axolotl-ai-cloud/axolotl).

### Requirements

- GPU with 16GB+ VRAM (tested on NVIDIA/AMD)
- Python 3.10+
- axolotl + PyTorch (CUDA or ROCm)

```bash
pip install axolotl transformers torch torchvision
```

### Convert dataset to axolotl format

```bash
python3 << 'EOF'
import json

with open('training/dataset.jsonl') as f:
    pairs = [json.loads(line) for line in f]

with open('training/axolotl-dataset.jsonl', 'w') as f:
    for p in pairs:
        f.write(json.dumps({
            "instruction": p["instruction"],
            "input": p.get("input", ""),
            "output": p["output"]
        }) + '\n')

print(f"Converted {len(pairs)} pairs")
EOF
```

### axolotl config (LoRA on Qwen2.5-Coder 14B)

```yaml
# axolotl-config.yml
base_model: Qwen/Qwen2.5-Coder-14B-Instruct
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer

load_in_4bit: true
strict: false

datasets:
  - path: training/axolotl-dataset.jsonl
    type: alpaca

val_set_size: 0.05
output_dir: ./fine-tuned-lora

sequence_len: 4096
sample_packing: true

lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj

gradient_accumulation_steps: 4
micro_batch_size: 2
num_epochs: 3
optimizer: adamw_torch
lr_scheduler: cosine
learning_rate: 0.0002

train_on_inputs: false
bf16: true

logging_steps: 1
warmup_steps: 10
saves_per_epoch: 1
```

```bash
axolotl train axolotl-config.yml
```

### Serving with Ollama

After training, export to GGUF and serve via Ollama:

```bash
# Merge LoRA weights
python3 -c "
from peft import AutoPeftModelForCausalLM
import torch
model = AutoPeftModelForCausalLM.from_pretrained('./fine-tuned-lora', torch_dtype=torch.float16)
merged = model.merge_and_unload()
merged.save_pretrained('./fine-tuned-merged')
"

# Convert to GGUF (requires llama.cpp)
python3 /path/to/llama.cpp/convert_hf_to_gguf.py fine-tuned-merged \
  --outfile fine-tuned.gguf --outtype q4_K_M

# Create Ollama Modelfile
cat > fine-tuned.Modelfile << 'EOF'
FROM ./fine-tuned.gguf
PARAMETER temperature 0.7
PARAMETER num_ctx 32768
EOF

ollama create my-model:14b -f fine-tuned.Modelfile
```
