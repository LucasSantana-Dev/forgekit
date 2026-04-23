# Práticas de Segurança para Desenvolvimento Assistido por IA

## Gestão de Segredos

### Nunca no config do shell
Mova API keys de `~/.bashrc` ou `config.fish` para um arquivo separado:
```bash
# ~/.config/fish/conf.d/secrets.fish (chmod 600)
set -gx API_KEY "your-key"
```

### Criptografe nos dotfiles
Use `chezmoi` + `age` para dotfiles que contenham segredos:
```bash
chezmoi add --encrypt ~/.config/fish/conf.d/secrets.fish
```

## Permissões de Agentes de IA

### Seguro para autoaprovar
- `git status`, `git add`, `git commit`, `git push`
- `npm test`, `pytest`, `make test/lint/build`
- `gh pr create`, `gh pr merge`
