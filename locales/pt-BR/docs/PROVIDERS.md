# Taxonomia de Provedores

O catálogo atribui a cada entrada um campo `provider` que identifica o runtime de agente de IA principal ao qual ela se destina. Este documento define cada provedor, seu caminho de instalação canônico e as regras que os contribuidores devem seguir ao declarar um.

## IDs de Provedor

| ID | Descrição | Caminho de instalação padrão |
|----|-----------|------------------------------|
| `claude` | Anthropic Claude Code (CLI), Claude API ou Claude.ai | `~/.claude/` |
| `codex` | Agente CLI OpenAI Codex (`openai/codex`) | `~/.codex/` |
| `gemini` | CLI Gemini do Google ou agente Vertex AI | `~/.gemini/` |
| `cursor` | Regras e integrações MCP do editor Cursor | `~/.cursor/rules/` |
| `local` | LLMs hospedados localmente: Ollama, vLLM, LM Studio, etc. | Dependente do runtime |
| `any` | Agnóstico de provedor — funciona sem alterações em qualquer um acima | N/A |

## Regras do campo

### Declarando `provider` em um manifesto

```json
{
  "id": "minha-skill",
  "provider": "claude",
  ...
}
```

- **Obrigatório para novas entradas.** O validador emite um aviso para entradas sem o campo.
- Use a string exata em minúsculas da tabela acima.
- Escolha o provedor no qual a entrada foi **desenvolvida e testada**. Se funcionar sem alterações em múltiplos provedores, use `any`.
- Uma skill que instala em `~/.claude/skills/` é `claude`, mesmo que um humano possa adaptá-la para outro runtime.

### Quando usar `any`

Use `any` quando a entrada é agnóstica de provedor por design:
- Documentação em Markdown sem destino de instalação
- Padrões conceituais (sem dependência de runtime)
- Entradas de coleção que agrupam conteúdo entre provedores
- Scripts shell agnósticos de ferramenta

Não use `any` como atalho quando `claude` (ou outro provedor específico) é o destino real. `any` é um sinal para os leitores de que nenhuma adaptação é necessária.

### Quando usar `local`

Use `local` para entradas que visam servidores de inferência auto-hospedados, independentemente do modelo ou framework específico:
- Scripts de integração do Ollama
- Configuração de servidor vLLM
- Guias de configuração do LM Studio
- Configurações de roteamento de modelo para implantações local-first

### Regras de promoção de provedor (guia de backfill)

Durante o backfill v0.25.x (#155), a automação aplica estas regras:

| Condição | Provedor atribuído |
|----------|-------------------|
| Entrada tem tag `codex` | `codex` |
| Entrada tem tag `gemini` | `gemini` |
| Entrada tem tag `cursor` | `cursor` |
| Entrada tem tag `ollama`, `vllm`, `lm-studio` ou `local-llm` | `local` |
| Entrada instala em `~/.claude/` sem outro sinal | `claude` |
| Entrada é `doc`, `collection` ou não tem destino de instalação | `any` |

Entradas que correspondem a múltiplas condições são revisadas manualmente.

## Convenções por provedor

### `claude`

- Skills instalam em `~/.claude/skills/<id>/`
- Agentes instalam em `~/.claude/agents/<id>.md`
- Comandos instalam em `~/.claude/commands/<id>.md`
- Hooks instalam em `~/.claude/hooks/<id>/`

### `codex`

- Skills instalam em `~/.codex/skills/<id>/`
- Sem sub-tipo de agente ainda; use o tipo `skill`

### `gemini`

- Skills instalam em `~/.gemini/skills/<id>/` (convenção pendente de estabilização upstream)
- Consulte a [documentação do Gemini CLI](https://ai.google.dev/gemini-api/docs) para os caminhos de instalação atuais

### `cursor`

- Regras instalam em `~/.cursor/rules/<id>.mdc` ou `.cursor/rules/<id>.mdc` (local do projeto)
- Servidores MCP configurados em `.cursor/mcp.json`

### `local`

- Entradas documentam a dependência de runtime explicitamente em `usage.prerequisites`
- Inclua o tamanho mínimo do modelo ou requisito de VRAM em `usage.resources`

## Adicionando uma nova entrada

1. Escolha o provedor na tabela acima.
2. Adicione `"provider": "<id>"` ao seu `manifest.json`.
3. Confirme que o caminho de instalação corresponde às convenções acima.
4. Execute `pnpm catalog:validate` — nenhum aviso esperado para novas entradas.

## Dúvidas?

Abra uma issue com o label `provider` ou pergunte em um comentário de PR.
