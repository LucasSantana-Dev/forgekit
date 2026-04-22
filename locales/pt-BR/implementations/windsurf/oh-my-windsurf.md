# Compatibilidade forge-kit com oh-my-windsurf

Este arquivo é uma ponte opcional para setups mistos em que `forge-kit` e uma
camada de orquestração oh-my específica do Windsurf são usados juntos.

Use este fluxo:

1. Mantenha `.windsurfrules`, `.windsurf/skills/` e `.windsurf/providers.json`
   gerenciados por `forge-kit`.
2. Mantenha prompts, roteamento e overlays de workflow específicos de
   orquestração na sua camada oh-my Windsurf.
3. Evite definir a mesma policy nos dois lugares.

Divisão de ownership recomendada:

- `forge-kit`: regras base, skills portáveis, registro de provedores, baseline de MCP.
- camada oh-my Windsurf: orquestração de tarefas, roteamento de papéis e overlays
  especializados de workflow.

Se surgirem conflitos, mantenha uma fonte canônica por responsabilidade.
