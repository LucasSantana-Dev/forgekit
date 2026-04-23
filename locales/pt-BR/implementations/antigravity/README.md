# Implementação para Antigravity

Implementação de referência dos patterns do toolkit para Antigravity.

## Construção de Contexto

Antigravity usa `~/.antigravity/` como principal superfície de configuração.

Com `forge-kit`, a instalação base grava:

- `~/.antigravity/rules.md`
- `~/.antigravity/skills/`
- `~/.antigravity/providers.json`
- `~/.antigravity/mcp.json`

## Orquestração de Tarefas

Use `forge-kit` como baseline portátil e mantenha overlays de orquestração
específicos do Antigravity separados.

## Compatibilidade

Veja `oh-my-antigravity.md` para a divisão de ownership recomendada quando
você combinar `forge-kit` com uma camada de orquestração estilo oh-my.
