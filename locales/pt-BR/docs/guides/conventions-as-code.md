---
status: published
audience: all
primitive: rule
---

# Convenções como Código

**Regras como arquivos de instrução rastreados por Git, agnósticos de vendor**

Seus padrões de codificação, gates de testes, políticas de segurança—tudo em um arquivo que carrega automaticamente.

---

## O Que é Uma Rule?

Uma **rule** é um arquivo Markdown que vive na raiz do seu projeto (`rules/CLAUDE.md`, `rules/COPILOT.md`, etc.) e é **sempre carregado** pela ferramenta de IA no início da sessão.

Arquivos de regras contêm:
- Padrões de codificação (nomeação, estilo, padrões)
- Expectativas de testes (gates de cobertura, tipos de testes)
- Limites de segurança (tratamento de segredos, requisitos de auditoria)
- Gates de fluxo de trabalho (higiene de commits, processo de review)
- Guardrails de entrega (bumping de versão, atualizações de changelog)

**Uma vez escrito, reutilizável para sempre.** Sem "repetir o padrão a cada sessão".

---

## O Modelo Tool-Overlay

Regras são **agnósticas de vendor no núcleo**, com overlays específicos de vendor:

```
rules/
├── TEMPLATE.md          ← Melhores práticas universais
├── CLAUDE.md            ← Especificidades Claude Code / Codex
├── COPILOT.md           ← Especificidades GitHub Copilot
├── GEMINI.md            ← Especificidades Gemini CLI
└── AGENTS.md            ← Orquestração multi-agent (agnóstico de vendor)
```

Você:
1. Copia o arquivo correspondente para a raiz do seu projeto.
2. Customiza a seção de padrões para sua codebase.
3. A ferramenta carrega automaticamente a cada sessão.

**Resultado**: Mesmos padrões executados em Claude, Copilot, Gemini, Cursor, etc.

---

## Anatomia de uma Rule

Seções típicas:

```markdown
# Regras do Projeto

## Identidade
Quem a IA é: "Você é um especialista em backend..."

## Padrões de Codificação
- TypeScript, componentes funcionais, strict null checks
- Sem classes, sem estado mutável
- Const-first immutability

## Testes
- Toda feature precisa de um unit test
- Gates de cobertura: ≥80% para código novo
- Tipos: unit, integration, E2E por componente

## Segurança
- Sem segredos no Git
- Variáveis de ambiente em `.env.example`
- Audit-log em toda escrita no banco de dados

## Fluxo de Trabalho
- Trunk-based, feature branches saindo de `main`
- PR requer 2 approvals antes de merge
- Commit message: `type(scope): description`

## Entrega
- Antes de merge: lint, typecheck, test pass
- Version bump: semantic versioning
- Changelog: uma entrada por PR
```

---

## Padrões Fatiados

Regras privadas vão em `~/.claude/standards/` (máquina do usuário, não Git):

```bash
~/.claude/standards/
├── security.md       ← Privado: Chaves de API, credenciais
├── compliance.md     ← Privado: Regras de auditoria da empresa
└── performance.md    ← Privado: Limites específicos da org
```

Regras rastreadas por Git incluem uma linha:
```markdown
## Conformidade
Carregue também `~/.claude/standards/compliance.md` para governança específica do trabalho.
```

**Benefício**: Repo público permanece seguro em termos de governança; regras privadas permanecem secretas.

---

## Relacionado

- **Suporte de ferramentas**: Veja [Tool Matrix](./tool-matrix.md) para quais ferramentas suportam regras customizadas.
- **Governança em escala**: [Governança](./governance.md)

---

Veja [AI_ASSISTED_DEVELOPMENT_SUMMARY.md](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md) para o diretório `rules/` completo.
