# Avaliacao UX Nielsen - Auditoria Cadastral e Notificacoes

Data: 2026-05-11

## Escopo

- API estrutural: auditoria e notificacoes de movimentacoes cadastrais.
- Portal PRONUS Operacoes: Empresas > Clientes.
- Preparacao de persistencia Prisma/Supabase para auditoria.

## Heuristicas aplicadas

1. Visibilidade do status do sistema
- A tela de Clientes agora mostra notificacoes abertas, movimentacoes pendentes e eventos recentes de auditoria antes da consulta operacional.
- Notificacoes exibem SLA visivel para orientar prioridade da equipe PRONUS.

2. Correspondencia com o mundo real
- A linguagem usa termos do processo administrativo: movimentacao cadastral, inclusao, alteracao, desligamento, SLA, RH Cliente e operacao PRONUS.
- A trilha de auditoria registra ator, papel, data e resumo da acao, como seria esperado em fiscalizacao e governanca.

3. Controle e liberdade do usuario
- O operador pode resolver uma notificacao sem alterar a lista de clientes.
- A consulta de clientes continua independente e sem carregamento automatico de dados.

4. Consistencia e padroes
- Os novos blocos usam os mesmos cards, bordas, badges de status e botoes ja existentes no Portal PRONUS.
- As cores seguem o padrao ja usado para alerta, risco e status.

5. Prevencao de erros
- Movimentacoes finalizadas nao podem ser decididas novamente pela API.
- A API rejeita tentativa de atualizar movimentacao para status pendente, exigindo aprovacao ou recusa.

6. Reconhecimento em vez de memorizacao
- A tela separa notificacoes, fila e auditoria em blocos nomeados, reduzindo ambiguidade entre pendencia e historico.

7. Flexibilidade e eficiencia de uso
- A equipe PRONUS consegue ver o que precisa de acao sem abrir cada cadastro individual.
- A trilha recente cria uma leitura rapida para suporte e auditoria.

8. Design estetico e minimalista
- Os blocos aparecem como resumo operacional compacto e nao competem com a tabela de consulta.
- Mantem a tela limpa ate o operador executar uma busca de clientes.

9. Ajuda para reconhecer e corrigir erros
- Notificacoes sem resposta da API podem ser marcadas localmente com mensagem de sincronizacao pendente.
- Estados vazios indicam quando nao ha notificacao, movimentacao ou evento registrado.

10. Ajuda e documentacao
- README e status de desenvolvimento foram atualizados com a nova camada de governanca cadastral.

## Proximos cuidados

- Gravar eventos e notificacoes em Supabase PostgreSQL com usuario autenticado real.
- Criar filtros de auditoria por empresa, periodo, ator, acao e status.
- Definir politica de retencao, exportacao e acesso aos logs conforme LGPD e exigencias contratuais.
