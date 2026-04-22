---
name: release-flow
description: Entregue mudanças validadas com evidência de release repetível — bump de versão, changelog, tag e release opcional no GitHub
triggers:
  - release
  - bump de versão
  - criar release
  - tag and release
  - publicar versão
---

# Release Flow

Depois que a verificação passar, faça bump da versão, atualize o changelog, crie a tag do repositório e, opcionalmente, um release no GitHub.

## Steps

1. **Confirme que a verificação passou** — recuse fazer release sem evidência prévia de quality gates
2. **Detecte a origem da versão** — `package.json`, `pyproject.toml`, arquivo `VERSION` ou tags git
3. **Preflight** — rode o helper em modo de verificação para confirmar limpeza do git, identidade git, disponibilidade da tag alvo, origem da versão, prontidão do changelog, destinos das release notes e prontidão opcional do `gh` antes de qualquer mutação
4. **Planeje o release** — visualize o nível do bump de versão (patch, minor, major) e a entrada do changelog
5. **Execute** — faça bump da versão, atualize o changelog e crie uma annotated git tag
6. **GitHub release** (opcional) — valide auth do `gh`, então crie o release com notes
7. **Reporte** — versão, tag, caminho do changelog e quaisquer etapas puladas com seus motivos

## Output

```text
Version:    <old> → <new>
Tag:        v<new>
Changelog:  updated | skipped (no [Unreleased] section)
Preflight:  ready | blocked (reason)
GH Release: created | skipped (reason)
```

## Rules

- Nunca faça release sem evidência prévia de verificação
- Nunca invente um arquivo de versão ou formato de changelog que o repo não usa
- Nunca publique artefatos sem auth confirmada
- Só atualize o changelog quando ele já tiver uma seção `[Unreleased]`
- Reporte etapas puladas com seus motivos em vez de falhar silenciosamente
