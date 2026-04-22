---
name: learn
description: Extraia automaticamente padrões reutilizáveis da sessão atual para skills ou memória
triggers:
  - learn
  - extrair padrões
  - o que eu aprendi
  - salvar padrão
  - aprendizado contínuo
---

# Learn

Extraia padrões reutilizáveis da sessão atual e persista-os.

## When to Use

- Fim de uma sessão produtiva com descobertas novas
- Depois de resolver um problema difícil de debugging
- Quando um workaround vira um padrão permanente
- Depois de entender as peculiaridades de uma biblioteca

## Steps

1. Revise a sessão em busca de decisões, correções e padrões
2. Classifique cada achado:
   - **Decision** — escolha de arquitetura, design de API, convenção de nomes
   - **Pattern** — abordagem reutilizável de código, workflow ou configuração
   - **Gotcha** — bug, peculiaridade ou modo de falha a evitar da próxima vez
   - **Preference** — escolha de estilo, seleção de ferramenta, formato de commit
3. Para cada achado, escreva uma entrada concisa:
   ```text
   [TYPE] <resumo em uma linha>
   Context: <quando isso se aplica>
   Evidence: <o que aconteceu e ensinou isso>
   Confidence: high | medium | low
   ```
4. Persista no local apropriado:
   - Decisions → `.agents/memory/decisions.md`
   - Patterns → `.agents/memory/patterns.md`
   - Gotchas → `.agents/memory/gotchas.md`
   - Preferences → `.agents/memory/preferences.md`
5. Se um padrão estiver maduro o suficiente (alta confiança, usado 3+ vezes), promova-o a skill

## Rules

- Extraia no fim da sessão, não continuamente
- Uma entrada por achado — mantenha tudo atômico
- Adicione data em toda entrada
- Remova entradas que não são mais verdadeiras
- Nunca extraia dados sensíveis (keys, senhas, URLs internas)
- Entradas de baixa confiança são aceitáveis — amadurecem com o tempo
- A base de código é a fonte de verdade; memória é complementar
