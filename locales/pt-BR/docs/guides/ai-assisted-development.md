---
status: published
audience: all
primitive: mixed
---

# Desenvolvimento Assistido por IA (AAD)

**Contexto + Padrões + Gates = Qualidade Repetível**

O pilar AAD garante que cada resposta da IA respeite as normas do seu projeto antes da primeira palavra ser escrita.

---

## Três Camadas

### 1. Camada de Contexto
O que a ferramenta de IA *sabe* antes de você perguntar.

- **Arquivo de regras** (`rules/CLAUDE.md`): Configuração no carregamento. Padrões de codificação, expectativas de testes, limites de segurança.
- **Melhores práticas** (`best-practices/`): Checklists. Branching, commits, gates de code review.
- **Padrões** (`patterns/`): Manual. Roteamento multi-modelo, gerenciamento de sessão, sistemas de memória, fluxos Git.

**Benefício**: Zero "me lembrança do padrão a cada sessão".

### 2. Camada de Padrões
O que é executado *durante* o desenvolvimento.

- **Linting**: Hooks pré-commit capturam problemas de estilo.
- **Testes**: Cada PR requer cobertura de testes.
- **Type checking**: TypeScript / mypy / go vet antes de merge.
- **Scanning de segurança**: Padrões fatiados mantêm segredos fora do índice.

**Benefício**: Menos ciclos de review; gating é declarativo, não conhecimento tribal.

### 3. Camada de Gates
O que deve passar *antes* de merge.

- **Checks CI**: Lint ✓ type ✓ test ✓
- **Code review**: Humano ou assistido por IA (via agent).
- **Anexação de spec**: Cada feature tem um registro de decisão.

**Benefício**: Trilha de auditoria; sem surpresas "achei que estava feito".

---

## Fluxo de Trabalho

1. **Setup** (5 min): Copie arquivo `rules/`. Customize os padrões de codificação.
2. **Ativar skills** (10 min): `/recall`, `/plan`, `/dispatch` nos sprints.
3. **Iterar**: IA respeita seus padrões em cada resposta.
4. **Gate**: CI captura problemas antes de review humano.
5. **Registrar**: Pasta spec `docs/specs/` alimenta o roadmap.

---

## Relacionado

- **Regras** em detalhes: [Convenções como Código](./conventions-as-code.md)
- **Skills** que suportam AAD: Veja `kit/core/skills/plan.md`, `kit/core/skills/review.md`
- **Governança** para times: [Governança](./governance.md)

---

Para contexto completo, veja [AI_ASSISTED_DEVELOPMENT_SUMMARY.md](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md).
