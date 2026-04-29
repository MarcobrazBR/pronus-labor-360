# Avaliacao UX Nielsen - Portal Colaborador, Agenda e Psicossocial

Data: 2026-04-29

## Escopo

Rodada aplicada aos ajustes de Portal Colaborador, card Psicossocial do Portal RH Cliente e aba Psicossocial dentro de Busca Empresa no Portal PRONUS.

## Heuristicas Revisadas

1. Visibilidade do status do sistema
   - O Portal Colaborador informa pesquisa pendente/concluida, limite mensal da especialidade, proxima consulta e estado do botao de video.
   - O modal COPSQ mostra termometro percentual e quantidade de respostas salvas.
   - O Portal RH mostra respostas, adesao e prazo no mesmo card.

2. Correspondencia com o mundo real
   - Especialidades sao apresentadas como coberturas do contrato da empresa.
   - O cliente escolhe dia e hora, mas nao escolhe profissional, refletindo a regra operacional da PRONUS.
   - A aba Psicossocial da empresa traz vidas no contrato, respondidas e pendentes, como o operador administrativo precisa acompanhar.

3. Controle e liberdade do usuario
   - O cliente pode abrir e fechar o COPSQ sem perder respostas.
   - A agenda so abre quando a especialidade esta elegivel, reduzindo caminhos bloqueados sem explicacao.
   - O operador pode alterar o prazo da campanha e gerar relatorio de pendentes.

4. Consistencia e padroes
   - Cores, bordas, raio de cards, botoes e estados seguem o padrao visual ja adotado nos tres portais.
   - A mesma linguagem de status foi mantida: verde para liberado/respondido, vermelho para pendente/bloqueado, azul para prazo informativo.

5. Prevencao de erro
   - O sistema bloqueia marcacao da mesma especialidade no mes.
   - O botao de video nao executa entrada antes da janela de uma hora e informa a regra no hover.
   - Finalizacao do COPSQ fica desabilitada ate 100% das respostas.

6. Reconhecimento em vez de memorizacao
   - O cliente visualiza cobertura, saldo contratual e estado mensal no proprio card da especialidade.
   - O RH ve a adesao e o prazo diretamente no painel.
   - O operador PRONUS ve a lista de pendentes no mesmo contexto do cadastro da empresa.

7. Flexibilidade e eficiencia de uso
   - Busca Empresa continua sem carregar dados por padrao e abre detalhes somente por acao do operador.
   - Relatorio de pendentes pode ser salvo em PDF via fluxo nativo de impressao do navegador.

8. Estetica e design minimalista
   - A tela do cliente foi organizada em duas colunas: jornada/cadastro e consultas, evitando excesso de paineis soltos.
   - O alerta psicossocial fica no topo e usa cor de prioridade sem competir com a agenda.

9. Reconhecimento, diagnostico e recuperacao de erros
   - Mensagens explicam indisponibilidade de vagas, API indisponivel e sincronizacao local do questionario.
   - Estados vazios orientam a proxima acao sem carregar listas automaticamente.

10. Ajuda e documentacao

- Microtextos operacionais foram usados apenas onde reduzem duvida: regra do video, salvamento do COPSQ e profissional automatico.

## Resultado

As telas ficaram alinhadas ao fluxo fisico esperado: a empresa define cobertura e prazo, o RH acompanha adesao, a PRONUS acompanha pendentes e o colaborador agenda dentro das regras contratuais.

## Proximos Cuidados

- Persistir respostas parciais do COPSQ no backend para continuidade entre dispositivos.
- Trocar sementes de agenda/cobertura por endpoints reais antes da validacao operacional.
- Revisar mascaramento de CPF em imagens publicas quando os dados deixarem de ser demonstrativos.
