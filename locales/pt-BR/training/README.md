# Dados de Treinamento

Ferramentas e artefatos para fine-tuning de modelos a partir das suas próprias sessões de coding com IA.

## Capturando Dados de Treinamento do Claude Code

`tools/capture-training.py` extrai pares de instrução a partir dos logs de sessão do Claude Code.

O Claude Code armazena cada conversa em `~/.claude/projects/**/*.jsonl`. O script faz o parse desses arquivos, extrai trocas usuário→assistente e grava em formato Alpaca para fine-tuning.

**Início rápido:**

```bash
# Visualizar o que seria capturado
python3 tools/capture-training.py

# Exportar para training/dataset.jsonl
python3 tools/capture-training.py --export

# Incluir apenas sessões com múltiplos turnos
python3 tools/capture-training.py --export --min-turns 3
```
