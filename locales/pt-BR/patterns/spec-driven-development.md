# Desenvolvimento Guiado por Especificação

> Escreva a spec primeiro. O agente escreve o código. Ambos trabalham a partir da mesma fonte de verdade.

## O Problema

Agentes de IA são rápidos para escrever código, mas não têm memória da sua intenção. Você descreve uma feature em um prompt, o agente constrói, e três sessões depois outro agente — ou você mesmo — altera aquilo de um jeito que se afasta do requisito original. A spec existe só na sua cabeça.

O segundo problema: agentes trabalhando em paralelo na mesma feature não têm um contrato compartilhado. Dois agentes construindo frontend e backend do mesmo endpoint vão divergir em nomes de campos, nulabilidade e formato de erro, a menos que algo os mantenha alinhados.

## O Pattern

Spec Driven Development (SDD) coloca uma spec legível por máquina no centro do workflow. A spec é escrita primeiro, os agentes são ancorados nela, e código que diverge da spec está errado — não apenas “diferente”.
