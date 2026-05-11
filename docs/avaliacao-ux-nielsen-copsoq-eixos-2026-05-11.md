# Avaliacao UX Nielsen - COPSOQ Por Eixos

Data: 2026-05-11

Escopo: card de analise COPSOQ agregado, grafico de disco e matriz setor x eixo nos portais PRONUS e RH Cliente.

## 1. Visibilidade Do Status Do Sistema

- O grafico central mostra o percentual agregado de risco da empresa.
- Cada eixo exibe percentual proprio, cor consistente e classificacao visual.
- A matriz deixa claro qual setor possui maior acumulado e qual eixo deve ser atacado primeiro.

## 2. Correspondencia Com O Mundo Real

- A interface usa os eixos tematicos informados para o COPSOQ: Exigencias do Trabalho, Organizacao e Conteudo do Trabalho, Relacoes Interpessoais e Lideranca, Relacao Empresa-Colaborador e Efeitos na Saude e Bem-estar.
- Setores aparecem como linhas porque a decisao real de intervencao normalmente acontece por area da empresa.
- O acumulado final apoia a leitura executiva de prioridade.

## 3. Controle E Liberdade Do Usuario

- No Portal PRONUS, o operador pode alternar a empresa analisada.
- No Portal RH Cliente, a leitura fica focada na empresa autenticada, reduzindo chance de erro de contexto.

## 4. Consistencia E Padroes

- Cards, badges, tabela, cores de risco e espacamento seguem o padrao visual ja usado nos portais.
- A mesma estrutura de informacao aparece nos portais PRONUS e RH, respeitando as permissoes e o contexto de cada usuario.

## 5. Prevencao De Erros

- O risco e apresentado como indicador agregado, sem expor respostas individuais.
- A matriz separa eixo e setor para evitar conclusoes genericas quando o problema e localizado.
- A recomendacao diferencia acao setorial e acao corporativa.

## 6. Reconhecimento Em Vez De Memorizacao

- Os eixos ficam sempre visiveis como colunas e barras.
- O usuario nao precisa lembrar os codigos internos do questionario; a leitura trabalha com temas de negocio.

## 7. Flexibilidade E Eficiencia

- O grafico de disco serve para leitura rapida.
- A matriz serve para diagnostico mais detalhado e priorizacao.
- A ordenacao por acumulado facilita atacar primeiro os setores mais sensiveis.

## 8. Estetica E Design Minimalista

- A tela evita textos explicativos longos dentro do produto.
- Cores sao usadas para diferenciar eixos e gravidade sem competir com a marca PRONUS.
- O conteudo ocupa melhor a largura disponivel, reduzindo a sensacao de tela solta.

## 9. Ajuda Para Reconhecer E Recuperar Erros

- Quando nao ha dados de analise, os portais preservam as demais informacoes psicossociais.
- Celulas sem dado podem ser exibidas como "Sem dados", sem quebrar a leitura da matriz.

## 10. Ajuda E Documentacao

- A regra de atualizacao visual continua registrada no README.
- O status do desenvolvimento documenta o novo endpoint e os novos pontos de visualizacao.

## Recomendacoes Para Proxima Iteracao

- Conectar o calculo real aos grupos/fatores do questionario COPSOQ completo.
- Adicionar filtros por periodo e campanha quando houver mais de uma campanha encerrada por empresa.
- Gerar relatorio PDF gerencial sem dados sensiveis para devolutiva ao RH.
- Registrar trilha de auditoria quando um profissional da PRONUS gerar recomendacao de intervencao.
