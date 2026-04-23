# Guia de Roteamento de Agentes

> **Aplica-se a**: Codex CLI e OpenCode — ambos leem `AGENTS.md` automaticamente.  
> Para Claude Code, combine este arquivo com `CLAUDE.md`. Arquivos `AGENTS.md` mais profundos sobrescrevem os de nível superior.

## Estratégia Multi-Modelo

Use tiers de modelo diferentes para níveis diferentes de complexidade.
Prefira rótulos de tier na guidance compartilhada e deixe os nomes exatos dos modelos na configuração local.

**OpenCode com oh-my-openagent** ([configuração de referência](../implementations/opencode/oh-my-openagent.jsonc)):

Sisyphus delega por **categoria**, não por nome de modelo. Mantenha as categorias de roteamento estáveis e deixe a configuração em uso controlar o mapeamento exato entre provider e modelo.

| Agente | Tier | Uso |
|-------|------|-----|
| **Sisyphus** | Raciocínio profundo | Orquestrador padrão — planeja, delega e leva até a conclusão |
| **Hephaestus** | Raciocínio profundo | Arquitetura profunda, debugging multi-arquivo e raciocínio entre domínios |
| **Prometheus** | Raciocínio profundo | Planejamento estratégico e modo de entrevista |
| **Oracle** | Raciocínio profundo | Consulta de arquitetura e análise de trade-offs |
| **Librarian** | Raciocínio profundo | Busca em documentação, referência de código e lookup de patterns |
| **Atlas** | Equilibrado | Orquestração de TODOs e execução paralela |
| **Sisyphus-Junior** | Equilibrado | Subtarefas delegadas por Sisyphus |
| **Explore** | Rápido | Grep rápido no codebase e lookups pontuais |

| Categoria | Tier | Disparo |
|----------|------|---------|
| `visual-engineering` | Especialista visual | UI/UX, CSS, design, animação |
| `ultrabrain` | Raciocínio profundo | Arquitetura profunda, raciocínio complexo |
| `deep` | Raciocínio profundo | Pesquisa autônoma, investigação detalhada |
| `artistry` | Especialista visual ou criativo | Abordagens criativas ou não convencionais |
| `writing` | Equilibrado | Docs, CHANGELOG, README, prosa |
| `quick` | Rápido | Edições triviais, correções de typo, mudanças de uma linha |
| `unspecified-low` | Equilibrado | Tarefas gerais de baixo esforço |
| `unspecified-high` | Equilibrado ou raciocínio profundo | Tarefas gerais de maior esforço |

**Agentes do OpenCode vanilla** (sem oh-my-openagent):

| Agente | Tier | Uso |
|-------|------|-----|
| **primary** | Equilibrado | Padrão. Implementação, debugging e refatoração |
| **architect** | Raciocínio profundo | Design complexo, impacto cross-repo e desenho de API |
| **fast** | Rápido | Lint, formatação, edições simples e lookups rápidos |

**Tiers do Codex CLI** (defina os nomes reais dos modelos em `config.toml` ou por flags de sessão):

| Tarefa | Tier |
|------|------|
| Padrão / exploração | Tier equilibrado de código |
| Arquitetura complexa | Tier de raciocínio profundo |
| Edições rápidas | Tier rápido |
| Raciocínio sobre todo o codebase | Tier equilibrado ou de raciocínio profundo |

## Alocação de Ferramentas

Com oh-my-openagent, o acesso a ferramentas é definido por agente em `oh-my-opencode.jsonc` via overrides de `permission`.

Sem oh-my-openagent:
- **primary**: todas as ferramentas (`bash`, `read`, `write`, `edit`, `glob`, `grep`, `webfetch`, `task`, `todo`)
- **architect**: todas as ferramentas, porque precisa de capacidade de planejamento
- **fast**: apenas o core (`bash`, `read`, `write`, `edit`, `glob`, `grep` — sem `webfetch`, sem `task`)

## Estratégia de Servidores MCP

Mantenha o contexto enxuto ativando servidores apenas onde forem necessários:

- **Sempre ativos globalmente**: filesystem, git, fetch, github, memory
- **Por projeto**: supabase (para projetos com banco), vercel (para apps implantados), sentry (para apps monitorados)
- **Desativados por padrão**: playwright, stitch e huggingface, porque pesam no contexto

Regra: MCP remoto (`type: "remote"`) é mais barato do que local — as ferramentas se registram sob demanda.

## Comandos para Ter

Comandos essenciais de workflow que todo projeto deveria ter:

```
/resume   — Carrega o estado do git e sugere a próxima tarefa
/verify   — Roda lint + type-check + test + build
/ship     — Faz commit + push + cria PR
/commit   — Conventional commit sem push
/test     — Roda testes e reporta resultados
/clean    — Limpa artefatos de build
/validate — Scorecard completo de saúde do repositório
```
