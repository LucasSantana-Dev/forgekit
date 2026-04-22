# Orquestração de Tarefas

> Pare de ser o escalonador. Defina o trabalho e deixe a máquina gerenciar a fila.

## O Problema

Você tem 5 projetos, cada um com uma sessão. Abre um por um, cola “continue com as próximas prioridades”, espera, troca, repete. Você está agindo como um cron humano.

## O Pattern

Separe **planejamento** de **execução**:

1. **Planeje uma vez** — analise todos os projetos, identifique o trabalho de maior valor e crie um backlog priorizado
2. **Despache automaticamente** — um processo em background escolhe a próxima tarefa, cria uma sessão e envia o prompt
3. **Monitore conclusão** — quando uma sessão ficar ociosa com tudo concluído, marque como feita e dispare a próxima
4. **Encadeie trabalho** — tarefas sequenciais são promovidas automaticamente quando as predecessoras terminam
