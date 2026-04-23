---
id: best-security
title: Security Practices for AI-Assisted Development
description: '### Never in shell config Move API keys from ~/.bashrc/config.fish to
  a separate file: ``bash # ~/.config/fish/conf.d/secrets.fish (chmod 600) set -gx
  API_KEY "your-key" ``'
tags:
- best-practice
- ai-dev-toolkit
- security
- token-optimization
source:
  path: ai-dev-toolkit/packages/core/best-practices/security.md
  upstream: https://github.com/LucasSantana-Dev/ai-dev-toolkit/blob/main/packages/core/best-practices/security.md
  license: MIT
translations:
  pt-BR:
    title: Práticas de Segurança para Desenvolvimento Assistido por IA
    description: Nunca na config do shell. Mova API keys de ~/.bashrc/config.fish
      para um cofre separado. Padrões de segurança para fluxos com IA.
---
# Security Practices for AI-Assisted Development

## Secrets Management

### Never in shell config
Move API keys from `~/.bashrc`/`config.fish` to a separate file:
```bash
# ~/.config/fish/conf.d/secrets.fish (chmod 600)
set -gx API_KEY "your-key"
```

### Encrypt in dotfiles
Use `chezmoi` + `age` for dotfiles that contain secrets:
```bash
chezmoi add --encrypt ~/.config/fish/conf.d/secrets.fish
```

### Multi-machine sync
Use launchd (macOS) or systemd (Linux) to auto-sync secrets on file change:
```xml
<key>WatchPaths</key>
<array>
    <string>/path/to/secrets.fish</string>
</array>
```

## AI Agent Permissions

### Safe to auto-approve
- `git status`, `git add`, `git commit`, `git push`
- `npm test`, `pytest`, `make test/lint/build`
- `gh pr create`, `gh pr merge`

### Always confirm
- Anything touching `~/.aws`, `~/.ssh`, `~/.config/fish/config.fish`
- Destructive DB operations
- Force pushes, branch deletions
- Modifying CI/CD pipelines

## Code Review with AI

AI agents should check for:
1. Hardcoded secrets, API keys, tokens
2. SQL injection, XSS, command injection
3. Missing input validation at system boundaries
4. Overly permissive CORS or auth
5. Dependencies with known vulnerabilities

## CI/CD Security

- Run `npm audit` / `pip-audit` in CI
- Use Semgrep CE for static analysis (free, non-blocking)
- Use Trivy for container scanning (blocks on HIGH/CRITICAL)
- Never skip pre-commit hooks (`--no-verify`)
