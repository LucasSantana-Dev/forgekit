---
status: draft
audience: technical
primitive: hook
---

# Hooks: Edit-Moment Gates

Three portable, optional hooks that run at edit moments. **Signature feature** — no public repo ships them.

---

## The Three Hooks

### 1. post-edit-format.sh

**When**: Immediately after you Write or Edit a file  
**What**: Runs your repo's formatter (`npm run format`, `make format`, `black`, etc.)  
**Output**: File formatted; advisory if formatting changes were made  
**Default**: OFF (opt-in)

```bash
# In your repo, runs automatically after edit:
$ claude "refactor this function"
[Claude writes code]
[Hook runs: npm run format]
[Console]: "✓ Formatted 3 files"
```

### 2. post-edit-typecheck.sh

**When**: After Write / Edit  
**What**: Runs type checker (`tsc --noEmit`, `mypy`, `go vet`)  
**Output**: Type errors listed; blocks if strict mode  
**Default**: OFF (opt-in, advisory mode)

```bash
$ claude "add async timeout"
[Claude writes code]
[Hook runs: tsc --noEmit]
[Console]: "⚠ Type error in line 42: Property 'timeout' not found"
```

### 3. evaluate-response.sh

**When**: After Claude finishes a response (PostToolUse)  
**What**: Scans output for lazy patterns (`// TODO implement`, `pass`, empty functions)  
**Output**: Warnings logged; never blocks  
**Default**: OFF, env-gated (`RAG_HOOKS_EVALUATE=1`)

```bash
$ RAG_HOOKS_EVALUATE=1 claude "write the service"
[Claude writes code]
[Hook runs: evaluate-response]
[Console]: "⚠ Detected placeholder: '// TODO implement auth'"
```

---

## Installation

### Option A: Per-Project Setup

```bash
cd your-project
bash packages/setup/scripts/install-rag.sh --with-hooks
```

This:

- Copies hooks to `~/.claude/hooks/`
- Wires them in `settings.json`
- Creates `.claude.local/hooks.json` with per-project toggles

### Option B: Global Setup

```bash
bash packages/setup/scripts/install-rag.sh --with-hooks --global
```

Hooks apply to all projects. Per-project overrides via `.claude.local/`.

---

## Opt-In by Environment

Each hook respects an environment variable:

```bash
# Enable specific hooks for a session:
export RAG_HOOKS_FORMAT=1        # post-edit-format
export RAG_HOOKS_TYPECHECK=1     # post-edit-typecheck
export RAG_HOOKS_EVALUATE=1      # evaluate-response

# Or disable:
export RAG_HOOKS_FORMAT=0
```

**Default**: All OFF unless explicitly enabled.

---

## Why "Signature Feature"?

**No other public AI dev toolkit ships edit-moment hooks.** Most solutions rely on:

- Manual "did you run lint?" prompting
- Post-session CI checks (late feedback)
- No automated feedback at all

Our hooks run **immediately**, **optionally**, **without blocking**. They're:

- ✓ Governance-safe (no execution, no secrets)
- ✓ Portable (work with any formatter / type checker)
- ✓ Silent by default (zero surprise on first install)
- ✓ Composable (stack multiple hooks without conflict)

---

## Implementation

Hooks are shell scripts in `kit/hooks/`:

```bash
kit/hooks/
├── post-edit-format.sh
├── post-edit-typecheck.sh
└── evaluate-response.sh
```

Each script:

1. **Checks prerequisites** (`command -v npm >/dev/null || exit 0`)
2. **Runs the tool** (formatter, type-checker, or analyzer)
3. **Logs output** (always to console, never silent)
4. **Returns 0** (never blocks, even on failure in advisory mode)

---

## Troubleshooting

**Q: Hook didn't run after I edited a file.**  
A: Check if the hook is enabled in `settings.json`. Also verify the tool exists (`npm run format` should work manually first).

**Q: I'm getting false positives from evaluate-response.**  
A: `evaluate-response` flags common placeholders (`// TODO`, `pass`, `...`). If your project legitimately uses these, set `RAG_HOOKS_EVALUATE=0`.

**Q: Can I write my own hook?**  
A: Yes. Copy the template from `kit/hooks/TEMPLATE.sh` and drop it in `~/.claude/hooks/`. It will be auto-discovered.

---

## Related

- **Hooks in the primitive taxonomy**: [Primitives](./primitives.md)
- **Full hook architecture**: `kit/hooks/README.md`
- **Safety & governance**: [Governance](./governance.md)
