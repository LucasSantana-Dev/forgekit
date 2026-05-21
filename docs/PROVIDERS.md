# Provider Taxonomy

The catalog assigns every entry a `provider` field that identifies the primary AI agent runtime it targets. This document defines each provider, its canonical install path, and the rules contributors should follow when declaring one.

## Provider IDs

| ID | Description | Default install path |
|----|-------------|----------------------|
| `claude` | Anthropic Claude Code (CLI), Claude API, or Claude.ai | `~/.claude/` |
| `codex` | OpenAI Codex CLI agent (`openai/codex`) | `~/.codex/` |
| `gemini` | Google Gemini CLI or Vertex AI agent | `~/.gemini/` |
| `cursor` | Cursor editor rules and MCP integrations | `~/.cursor/rules/` |
| `local` | Locally hosted LLMs: Ollama, vLLM, LM Studio, etc. | Runtime-dependent |
| `any` | Provider-agnostic — works unchanged on any of the above | N/A |

## Field rules

### Declaring `provider` in a manifest

```json
{
  "id": "my-skill",
  "provider": "claude",
  ...
}
```

- **Required for new entries.** The validator emits a warning for entries missing the field.
- Use the exact lowercase string from the table above.
- Choose the provider the entry was **authored and tested against**. If it genuinely works unchanged on multiple providers, use `any`.
- A skill that installs to `~/.claude/skills/` is `claude`, even if a human could adapt it for another runtime.

### When to use `any`

Use `any` when the entry is provider-agnostic by design:
- Markdown documentation with no install target
- Conceptual patterns (no runtime dependency)
- Collection entries that group cross-provider content
- Tool-agnostic shell scripts

Do not use `any` as a shortcut when `claude` (or another specific provider) is the real target. `any` is a signal to readers that no adaptation is needed.

### When to use `local`

Use `local` for entries that target self-hosted inference servers regardless of the specific model or framework:
- Ollama integration scripts
- vLLM server configuration
- LM Studio setup guides
- Model routing configurations for local-first deployments

### Provider promotion rules (backfill guidance)

During the v0.25.x backfill (#155), the automation applies these rules:

| Condition | Provider assigned |
|-----------|-------------------|
| Entry has tag `codex` | `codex` |
| Entry has tag `gemini` | `gemini` |
| Entry has tag `cursor` | `cursor` |
| Entry has tag `ollama`, `vllm`, `lm-studio`, or `local-llm` | `local` |
| Entry installs to `~/.claude/` with no other signal | `claude` |
| Entry is a `doc`, `collection`, or has no install target | `any` |

Entries that match multiple conditions are reviewed manually.

## Conventions by provider

### `claude`

- Skills install to `~/.claude/skills/<id>/`
- Agents install to `~/.claude/agents/<id>.md`
- Commands install to `~/.claude/commands/<id>.md`
- Hooks install to `~/.claude/hooks/<id>/`

### `codex`

- Skills install to `~/.codex/skills/<id>/`
- No agent sub-type yet; use `skill` kind

### `gemini`

- Skills install to `~/.gemini/skills/<id>/` (convention pending upstream stabilization)
- Check [Gemini CLI docs](https://ai.google.dev/gemini-api/docs) for current install paths

### `cursor`

- Rules install to `~/.cursor/rules/<id>.mdc` or `.cursor/rules/<id>.mdc` (project-local)
- MCP servers configured in `.cursor/mcp.json`

### `local`

- Entries document the runtime dependency explicitly in `usage.prerequisites`
- Include the minimum model size or VRAM requirement in `usage.resources`

## Adding a new entry

1. Pick the provider from the table above.
2. Add `"provider": "<id>"` to your `manifest.json`.
3. Confirm the install path matches the conventions above.
4. Run `pnpm catalog:validate` — zero warnings expected for new entries.

## Questions?

Open an issue with the `provider` label or ask in a PR comment.
