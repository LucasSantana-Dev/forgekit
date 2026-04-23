# Roteamento Multi-Modelo

> Use o modelo mais barato capaz de fazer o trabalho. Só escale quando necessário.

## O Problema

Usar um modelo de fronteira para toda tarefa desperdiça dinheiro e tempo. Usar um modelo fraco em tarefas difíceis desperdiça seu tempo corrigindo o resultado. A estratégia ideal roteia cada tarefa para o tier certo de capacidade.

## O Pattern

### Roteamento em Três Tiers

| Tier | Use para | Exemplos |
|------|---------|---------|
| **Rápido** (Haiku, GPT-5.4 mini, Flash) | Edições simples, formatação, mudanças de config, renomear arquivos, lookups rápidos | Corrigir typo, renomear variável, atualizar versão de dependência |
| **Padrão** (Sonnet, GPT-5.4, Pro) | Implementação, debugging, refatoração, escrita de testes | Construir feature, corrigir bug, escrever testes, fazer code review |
| **Profundo** (Opus, GPT-5-Codex, Deep Research) | Design de arquitetura, impacto cross-system, debugging complexo, planejamento | Desenhar API, analisar race condition, planejar migração |

### Heurísticas de Roteamento

**Roteie para Rápido quando:**
- A tarefa é mecânica (formatar, renomear, mover)
- O resultado é fácil de verificar (lint, type errors)
- O contexto é pequeno (<5 arquivos)
- Você mesmo faria isso em 2 minutos

**Roteie para Padrão quando:**
- A tarefa exige entender lógica de negócio
- Vários arquivos precisam de mudanças coordenadas
- Testes precisam ser escritos ou corrigidos
- O resultado precisa passar por code review

**Roteie para Profundo quando:**
- A decisão afeta vários repositórios
- Existem várias abordagens válidas e os tradeoffs importam
- O problema exige raciocínio em >10 arquivos
- Você está planejando, não implementando

### Matemática de custo

| Tier | Custo relativo | Velocidade |
|------|--------------|-------|
| Rápido | 1x | Instantâneo |
| Padrão | 5-10x | Rápido |
| Profundo | 20-50x | Lento |

Um dia típico pode ser: 70% Rápido, 25% Padrão, 5% Profundo.

## Mapeamento por ferramenta

| Tier | Claude | OpenAI | Google |
|------|--------|--------|--------|
| Rápido | Haiku 4.5 | GPT-5.4 mini | Flash 2.5 |
| Padrão | Sonnet 4.6 | GPT-5.4 | Pro 2.5 |
| Profundo | Opus 4.6 | GPT-5-Codex | Deep Research |

## Implementação

### Definições de agentes

Defina agentes nomeados com assignments fixos de modelo:

```json
{
  "agents": {
    "fast": { "model": "haiku-tier", "tools": ["read", "write", "edit", "bash"] },
    "primary": { "model": "standard-tier", "tools": ["all"] },
    "architect": { "model": "deep-tier", "tools": ["all"] }
  }
}
```

### Alocação de ferramentas

Nem todo agente precisa de todas as ferramentas:
- **Rápido**: apenas o core (`read`, `write`, `edit`, `bash`, `glob`, `grep`)
- **Padrão**: todas as ferramentas, incluindo web fetch e task management
- **Profundo**: todas as ferramentas — o custo está no raciocínio, não nos tool calls

### Anti-Patterns

- **Síndrome do Always-Opus**: usar o modelo mais caro para tudo “por segurança”
- **Economia burra**: usar um tier Rápido onde claramente seria necessário o Padrão e depois gastar 3x corrigindo a saída
- **Sem roteamento nenhum**: um modelo, um agente, um preço para tudo
- **Ignorar subagentes**: Claude Code cria subagentes para compactação e trabalho em background — eles usam o modelo padrão da sessão a menos que você sobrescreva `CLAUDE_CODE_SUBAGENT_MODEL`
