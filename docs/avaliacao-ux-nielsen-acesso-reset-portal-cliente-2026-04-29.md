# Avaliacao UX Nielsen - Acesso, Reset e Portal Colaborador

Data: 2026-04-29

## Escopo

Rodada aplicada aos fluxos de login do Portal Colaborador e Portal RH Cliente, troca obrigatoria de senha, pedidos de reset, cards de alerta e ajustes de consulta/pesquisa comportamental.

## Heuristicas Revisadas

1. Visibilidade do status do sistema
   - O primeiro acesso mostra modal bloqueante de troca de senha antes de qualquer acao operacional.
   - Pedidos de reset aparecem em cards vermelhos no portal responsavel: RH para colaborador, PRONUS para empresa.
   - A pesquisa comportamental indica pendencia/conclusao e progresso salvo.

2. Correspondencia com o mundo real
   - Colaborador acessa por CPF e senha padrao baseada nos seis primeiros digitos do CPF.
   - RH cliente acessa por CNPJ e senha padrao baseada nos seis primeiros digitos do CNPJ.
   - Reset de senha volta ao padrao operacional esperado e passa pelo responsavel correto.

3. Controle e liberdade do usuario
   - Colaborador pode pedir reset sem depender de suporte por fora do sistema.
   - RH pode liberar reset do colaborador em modal com lista clara.
   - PRONUS abre a empresa diretamente a partir do card de reset do Portal RH.

4. Consistencia e padroes
   - Os tres portais usam a mesma identidade visual, logo, cards, botoes e estados.
   - Botoes desabilitados usam o mesmo tratamento visual do botao de iniciar consulta.
   - Mensagens de indisponibilidade nao revelam regra interna de limite contratual ao colaborador.

5. Prevencao de erro
   - Senha nova exige exatamente 6 caracteres com letra, numero e caractere especial.
   - Consultas ficam bloqueadas ate troca de senha e conferencia cadastral.
   - O cliente final nao visualiza saldo, vagas usadas ou motivo contratual de bloqueio.

6. Reconhecimento em vez de memorizacao
   - O operador ve contadores e acoes no contexto do painel.
   - O reset aparece junto da empresa no cadastro PRONUS quando ha pedido pendente.
   - O colaborador ve apenas especialidade e acao de marcar consulta.

7. Flexibilidade e eficiencia de uso
   - O card vermelho leva o operador PRONUS direto para a empresa correta.
   - O modal de reset do RH permite resolver a demanda sem sair do painel.
   - Sessao local de demo reduz atrito no teste do MVP.

8. Estetica e design minimalista
   - A caixa antiga de consulta por CPF foi removida da tela do colaborador.
   - Tags e textos internos de validacao foram retirados da visao do cliente final.
   - A tela de consulta ficou mais limpa, sem saldo e sem status contratuais expostos.

9. Reconhecimento, diagnostico e recuperacao de erros
   - Login e troca de senha retornam mensagens claras quando a API nao responde ou os dados estao invalidos.
   - Pedidos de reset podem ser repetidos sem criar duplicidade pendente.
   - A mensagem de consulta indisponivel evita diagnostico contratual indevido para o cliente.

10. Ajuda e documentacao

- A regra de senha aparece no modal de primeiro acesso.
- O hover do botao de consulta por video continua explicando quando a sala abre.
- O plano de acesso externo foi documentado em `docs/acesso-externo-demo-investidores.md`.

## Resultado

O fluxo passou a se comportar como portal autenticado: o cliente nao pesquisa CPF dentro da tela, a primeira senha e temporaria, a troca e obrigatoria e os pedidos de reset seguem a cadeia operacional correta.

## Proximos Cuidados

- Levar credenciais e sessoes para banco real com auditoria.
- Definir politica de expiracao de senha padrao.
- Separar ambiente de demo em nuvem antes de apresentacoes recorrentes.
- Persistir respostas parciais do COPSOQ no backend para continuidade entre dispositivos.
