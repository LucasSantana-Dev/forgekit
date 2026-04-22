# Implementação para Cursor

Implementação de referência dos patterns do toolkit para [Cursor](https://cursor.com).

## Construção de Contexto

Cursor usa `.cursorrules` (raiz do projeto) e `.cursor/rules/*.mdc` (regras com escopo).

```bash
cp ../../rules/CLAUDE.md your-project/.cursorrules
```

Para regras com escopo:
```
.cursor/
  rules/
    api.mdc          ← Regras ao trabalhar em src/api/
    frontend.mdc     ← Regras ao trabalhar em src/components/
    testing.mdc      ← Regras ao escrever testes
```

Veja o [pattern de Context Building](../../patterns/context-building.md).

## Roteamento Multi-Model

Cursor suporta seleção de modelo por chat:
- **Fast** (Tab completions): usa modelos menores automaticamente
- **Standard** (Cmd+K, Chat): configure nas settings
- **Deep** (Composer): use para mudanças em múltiplos arquivos

## Memória

Cursor não tem memória persistente nativa. Implemente por meio de:
- diretório `.cursor/context/` com arquivos markdown
- referência em `.cursorrules`: "Read .cursor/context/ files for project decisions"
- recurso Notepad para persistência em nível de sessão

## Orquestração de Tarefas

Use Cursor Composer para planos de múltiplas etapas:
1. Abra o Composer (Cmd+I)
2. Descreva o plano completo
3. O Composer quebra em mudanças por arquivo
4. Revise e aplique

Para gestão de backlog, use o mesmo pattern `backlog.json` com um wrapper de shell.

## Contribuições Bem-vindas

Se você construir implementações desses patterns para Cursor, abra um PR.
