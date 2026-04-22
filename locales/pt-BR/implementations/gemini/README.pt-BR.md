# Implementação para Gemini

Implementação de referência dos padrões do toolkit para Gemini CLI e superfícies relacionadas do Gemini.

## Como o Gemini se Encaixa no Toolkit

Gemini usa `GEMINI.md` como superfície primária de instruções persistentes. No GitHub, Gemini Code Assist também usa `.gemini/styleguide.md` para guidance de repositório.

No toolkit, isso significa:

- `rules/GEMINI.md` é o arquivo-base de comportamento
- a implementação em `implementations/gemini/` mostra como adaptar patterns do toolkit para superfícies do Gemini
- `forge-kit` pode instalar a camada de regras do Gemini da mesma forma que faz para outras ferramentas

## Configuração

```bash
# Copie as regras globais do Gemini
cp ../../rules/GEMINI.md ~/.gemini/GEMINI.md

# Ou copie para a raiz do projeto
cp ../../rules/GEMINI.md your-project/GEMINI.md
```

Se você também usa Gemini Code Assist no GitHub, adapte as mesmas regras para:

```bash
mkdir -p .gemini
cp ../../rules/GEMINI.md .gemini/styleguide.md
```

## Modelo Mental

Use Gemini da mesma forma que as outras ferramentas no toolkit:

- regras definem o comportamento padrão
- patterns explicam os workflows
- skills definem procedimentos reutilizáveis
- implementações mostram como tudo isso se traduz para uma ferramenta concreta

O nome do arquivo muda, mas o modelo operacional não.

## O Que Preservar ao Adaptar

Ao converter guidance do toolkit para Gemini, preserve:

- identidade e estilo de colaboração
- padrões de código e limites de complexidade
- workflow de branching, commit e PR
- gates de teste e verificação
- regras de documentação
- disciplina de segurança
- expectativa de execução durável

## Integração com o Restante do Repo

Use esta implementação junto com:

- `rules/GEMINI.md`
- `patterns/context-building.md`
- `patterns/task-orchestration.md`
- `patterns/code-review.md`
- `patterns/testing.md`
- `best-practices/context-management.md`

Se precisar de bootstrap entre ferramentas, use `forge-kit` em vez de gerenciar arquivos manualmente.
