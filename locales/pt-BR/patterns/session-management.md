# Gestão de Sessões

> Um workspace limpo é um workspace rápido. Automatize a limpeza.

## O Problema

Depois de uma semana trabalhando em 8 projetos, você tem 30+ sessões. A maioria está obsoleta. Alternar entre elas fica lento. Encontrar a sessão com seu trabalho em andamento exige rolagem e adivinhação.

## O Pattern

### Ciclo de vida da sessão

```
Ativa  →  Ociosa  →  Obsoleta  →  Arquivada/Apagada
  ↑          |
  └──────────┘  (retomada)
```

**Ativa**: mensagem enviada nos últimos 30 minutos
**Ociosa**: sem atividade há 30 min–2 h
**Obsoleta**: sem atividade há 2h+
**Arquivada**: apagada (sem mudanças não commitadas) ou compactada (com mudanças)

### Regras de auto-limpeza

| Condição | Ação |
|-----------|--------|
| >24h, sem mudanças de arquivo | Apagar |
| >2h ociosa, com mudanças | Marcar `[WIP]` |
| >3 sessões por projeto | Apagar as vazias mais antigas |
| Sessão volta a ficar ativa | Remover tags de status |

### Prefixos de status

Marque títulos de sessão para escanear a barra lateral instantaneamente:

| Prefixo | Significado |
|--------|---------|
| (nenhum) | Ativa — está sendo usada agora |
| `[IDLE]` | Inativa, sem mudanças não commitadas |
| `[WIP]` | Inativa, com mudanças não commitadas — não apagar |

### Performance

O maior inimigo da performance de sessão é o **tamanho do histórico de mensagens**. Uma sessão com 200+ mensagens renderiza lentamente em qualquer ferramenta. Mitigue isso:

1. **Auto-compacte** sessões ociosas (resuma o histórico)
2. **Limite sessões por projeto** (menos itens para renderizar)
3. **Comece do zero** em tarefas novas em vez de reutilizar sessões inchadas

### Retomar após reinício

Quando a ferramenta reinicia, sessões com trabalho pendente deveriam ser retomadas automaticamente. Rastreie:
- TODOs pendentes no momento em que a sessão ficou ociosa → salve em arquivo de estado
- Ao reiniciar → escaneie arquivos de estado → reative as sessões com trabalho pendente

## Implementação

Esses patterns podem ser implementados como:
- **Plugins** (OpenCode, extensões do Cursor)
- **Scripts de shell** (limpeza por cron via CLI)
- **Disciplina** (hábito manual de apagar sessões ao terminar)

### Implementação de referência

Veja: [`implementations/opencode/plugin/`](../implementations/opencode/plugin/)
- `session-manager.ts` — auto-cleanup e marcação de status
- `session-resume.ts` — persistência e retomada de trabalho interrompido
- `perf-optimizer.ts` — auto-compact para acelerar a troca entre sessões
