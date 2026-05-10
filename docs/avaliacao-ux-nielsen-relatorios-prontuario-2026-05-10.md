# Avaliacao UX Nielsen - Relatorios Ad Hoc e Busca de Prontuario

Data: 2026-05-10

## Escopo

- Portal Profissional de Saude: busca do Prontuario Integrado.
- Portal PRONUS Operacoes: novo modulo Relatorios.

## Heuristicas aplicadas

1. Visibilidade do status do sistema
- A busca de prontuario continua sem carregar registros por padrao e informa quando e necessario preencher CPF, nome ou empresa.
- O gerador de relatorios mostra quantidade de campos selecionados, campos sensiveis e estado de previa controlada.

2. Correspondencia com o mundo real
- O prontuario usa filtros familiares ao profissional: CPF, nome e empresa.
- Relatorios seguem conceitos esperados em BI e analise ad hoc: dimensoes, hierarquias, atributos, membros e medidas.

3. Controle e liberdade do usuario
- O operador pode selecionar e remover campos, limpar toda a composicao e gerar a previa antes de salvar ou exportar.
- O profissional pode buscar novamente sem expor lista ampla de prontuarios.

4. Consistencia e padroes
- O novo modulo usa a mesma lateral, cabecalho, icones, botoes, tabelas e cards do Portal PRONUS.
- O resultado de prontuario preserva a tabela, o badge de risco e o modal de timeline ja existentes.

5. Prevencao de erros
- Risco psicossocial nao e filtro de busca do prontuario para evitar procura direta por dado sensivel.
- Campos clinicos, psicossociais e financeiros ficam destacados no relatorio para revisao de permissao e finalidade.

6. Reconhecimento em vez de memorizacao
- O catalogo de relatorios apresenta campos agrupados por dominio do MVP, com descricao curta de cada campo.
- As categorias ficam visiveis como botoes, reduzindo a necessidade de lembrar a nomenclatura tecnica.

7. Flexibilidade e eficiencia de uso
- A busca do catalogo acelera a localizacao de campos por nome, grupo ou descricao.
- O relatorio permite montar composicoes diferentes para demandas pontuais de clientes sem criar uma tela nova para cada pedido.

8. Design estetico e minimalista
- A tela de relatorios evita dashboard numerico decorativo e foca em composicao, catalogo e previa.
- A tela usa largura maior em desktop, reduzindo a sensacao de conteudo solto no centro do monitor.

9. Ajuda para reconhecer e corrigir erros
- Estados vazios explicam o que falta para a busca ou previa funcionar.
- A ausencia de campo selecionado aparece por categoria na composicao do relatorio.

10. Ajuda e documentacao
- O README e o status de desenvolvimento foram atualizados para registrar o novo modulo e a regra de busca do prontuario.

## Pontos de atencao para proximas iteracoes

- Conectar o gerador de relatorios ao banco real e as permissoes por perfil antes de liberar exportacao em producao.
- Registrar auditoria para toda previa, exportacao e envio de relatorio com dados sensiveis.
- Criar templates salvos por tipo de solicitacao recorrente quando surgirem padroes comerciais.
