---
name: ship
description: Faça commit, push e abra um pull request com uma mensagem de commit convencional
triggers:
  - ship
  - criar PR
  - commit e push
  - pronto para mergear
---

# Ship

Rode verify primeiro. Depois faça commit, push e abra um PR.

## Steps

```bash
# 1. Verifique se os quality gates passam
# (rode /verify ou equivalente)

# 2. Faça stage dos arquivos específicos
git add <files>

# 3. Conventional commit
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>
EOF
)"

# 4. Push
git push -u origin <branch>

# 5. PR
gh pr create --title "<type>: <description>" --body "..."
```

## Commit Types

`feat` | `fix` | `refactor` | `chore` | `docs` | `style` | `ci` | `test`

## PR Body Template

```markdown
## Summary
- <o que mudou>

## Test plan
- [ ] CI passa
- [ ] Testado manualmente: <cenário>
```

## Rules

- Nunca faça push direto para `main`
- Nunca use `--no-verify`, a menos que a mudança seja apenas docs/config
- Faça stage de arquivos específicos — não use `git add .` cegamente
- Apague a branch local após o merge
