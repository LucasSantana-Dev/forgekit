# Compatibilidade forge-kit com oh-my-codex

Este arquivo é uma ponte opcional para setups mistos em que `forge-kit` e uma
orquestração estilo oh-my-codex são usados juntos.

Use este fluxo:

1. Mantenha `~/.codex/AGENTS.md` e `~/.codex/providers.json` gerenciados por `forge-kit`.
2. Mantenha comportamento específico de orquestração na sua camada oh-my-codex.
3. Evite definir a mesma policy nos dois lugares.

Divisão de ownership recomendada:

- `forge-kit`: regras base e registro de provedores.
- camada oh-my-codex: orquestração de tarefas e estratégia de roteamento de modelos.

Se surgirem conflitos, mantenha uma fonte canônica por responsabilidade.
