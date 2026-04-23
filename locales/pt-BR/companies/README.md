
# Empresas

Organizações de agentes prontas para desenvolvimento assistido por IA. Cada empresa é uma equipe completa de agentes especializados com papéis, habilidades e protocolos de roteamento definidos, pronta para ser usada em qualquer projeto.

## Conceito

Uma empresa encaminha o trabalho automaticamente para o especialista certo:

```
Tarefa → CEO → CTO → Líder de Equipe → Especialista
```

Cada agente tem um contrato rigoroso:

- **O que o aciona** — condições que ativam o agente
- **O que ele faz** — responsabilidades específicas
- **O que ele produz** — entregas concretas
- **Para quem ele repassa** — próximo agente da cadeia

## Formato dos arquivos

```
companies/
  <company-name>/
    COMPANY.md          ← manifesto (nome, schema, objetivos)
    README.md           ← guia de uso
    agents/
      <role>/
        AGENTS.md       ← definição do agente (frontmatter + corpo)
    skills/
      <skill>/
        SKILL.md        ← definição de skill reutilizável
    teams/
      <team>/
        TEAM.md         ← agrupamento de equipe com membros
```

### Formato do agente (`AGENTS.md`)

```yaml
---
name: React Engineer
title: Senior React/Next.js Engineer
reportsTo: frontend-lead
skills:
  - react-expert
  - nextjs-developer
---
You are the React Engineer. You handle React and Next.js projects.
## What triggers you
...
## What you do
...
## What you produce
...
## Who you hand off to
...
```

O campo `skills` referencia entradas no diretório `skills/` da empresa.
Esse formato é nativo do toolkit. Algumas ferramentas conseguem usá-lo diretamente; outras precisam de um adaptador.

## Uso com ferramentas de IA

### Claude Code

Trate `companies/` como material-fonte. Exporte ou adapte um agente para o formato nativo de subagente do Claude em `.claude/agents/<role>.md`, com frontmatter específico do Claude como `name` e `description`.

### OpenCode

Use o corpo do agente do toolkit como material-fonte para seu agente ou camada de prompt no OpenCode.

### Codex CLI

Os agentes seguem o formato padrão `AGENTS.md`; basta colocá-los na raiz do repositório ou em um subdiretório.

### Cursor / Windsurf

Use o corpo do agente como uma entrada escopada em `.cursorrules` ou `.windsurfrules`.

## Empresas disponíveis

| Empresa                                             | Agentes | Skills | Equipes | Descrição                                                             |
| --------------------------------------------------- | ------- | ------ | ------- | --------------------------------------------------------------------- |
| [solopreneur](./solopreneur/)                       | 3       | 3      | 0       | Estúdio de produto liderado pelo fundador para SaaS solo e produtos indie |
| [startup-mvp](./startup-mvp/)                       | 4       | 4      | 0       | Pacote para startups em estágio inicial focado em construir MVPs e iterar lançamentos |
| [agency](./agency/)                                 | 5       | 4      | 0       | Modelo de entrega para clientes com discovery, execução, QA e comunicação |
| [open-source-maintainer](./open-source-maintainer/) | 5       | 4      | 0       | Organização focada em mantenedores para triagem, releases, docs e comunidade |
| [fullstack-forge](./fullstack-forge/)               | 49      | 66     | 10      | Consultoria completa de desenvolvimento de software em 11 departamentos |

## Atribuição

As empresas são licenciadas sob MIT. `fullstack-forge` foi importada de [paperclipai/companies](https://github.com/paperclipai/companies).
