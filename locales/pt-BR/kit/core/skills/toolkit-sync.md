---
name: toolkit-sync
description: Faça bump do pin de versão do ai-dev-toolkit em um repositório consumidor downstream e verifique o caminho de sincronização
triggers:
  - bump toolkit
  - sincronizar toolkit
  - atualizar versão do toolkit
  - toolkit desatualizado
---

# Toolkit Sync

Atualize a versão pinada do ai-dev-toolkit em um repositório consumidor e verifique se o caminho de fetch funciona.

## Steps

1. **Check current pin** — leia o arquivo `TOOLKIT_VERSION`
2. **Find latest release** — `gh release list -R LucasSantana-Dev/forgekit -L 1`
3. **Update pin** — escreva a nova versão em `TOOLKIT_VERSION`
4. **Test fetch** — rode o script de setup que baixa o toolkit tarball
5. **Verify** — rode `doctor.sh` ou equivalente para confirmar o novo version stamp
6. **Commit** — `chore: bump toolkit to vX.Y.Z`

## Output

```text
Previous: v<old>
Updated:  v<new>
Fetch:    OK | FAIL
Doctor:   OK | FAIL
```

## Rules

- Pare se a nova release tag não existir no GitHub
- Pare se o caminho de fetch falhar após a atualização
- Nunca pule a etapa de verificação
- Abra um PR para o bump de versão, não faça push direto para `main`
