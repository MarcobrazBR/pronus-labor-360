# Avaliacao UX Nielsen - Portal RH Cliente - 2026-04-28

Escopo avaliado: Portal RH Cliente, navegacao responsiva e modal de movimentacao cadastral em `/clientes`.

## Resultado por heuristica

1. **Visibilidade do status do sistema**
   - Atendido. O menu ativo agora expoe `aria-current`, a navegacao destaca a pagina atual e o modal comunica claramente o tipo de movimentacao selecionado.

2. **Correspondencia com o mundo real**
   - Atendido. As opcoes usam linguagem operacional do RH: inclusao, alteracao cadastral e desligamento.

3. **Controle e liberdade do usuario**
   - Atendido. O usuario consegue abrir e fechar o modal sem gravar informacao, e a troca de tipo de movimentacao acontece sem perda visual do contexto.

4. **Consistencia e padroes**
   - Atendido. A tela manteve o mesmo shell, hierarquia visual, botao principal, modal e paleta ja usados no Portal RH Cliente.

5. **Prevencao de erros**
   - Atendido parcialmente. Campos obrigatorios seguem concentrados no modal antes do envio; falta evoluir mensagens por campo e fila persistente de aprovacao PRONUS.

6. **Reconhecimento em vez de memorizacao**
   - Atendido. O seletor de tipo virou controle segmentado, reduzindo a necessidade de abrir uma lista para lembrar as opcoes disponiveis.

7. **Flexibilidade e eficiencia de uso**
   - Atendido parcialmente. A busca por cliente segue sob demanda e a movimentacao pode ser iniciada direto pela tela de clientes; ainda falta persistencia completa da fila de alteracoes.

8. **Design estetico e minimalista**
   - Atendido. A navegacao mobile foi reorganizada em grade para evitar rolagem horizontal, e o modal manteve campos em uma coluna limpa em viewport estreito.

9. **Ajuda para reconhecer e corrigir erros**
   - Atendido parcialmente. A tela evita envio silencioso, mas ainda precisa de validacao mais granular por campo quando a API persistente de movimentacoes for criada.

10. **Ajuda e documentacao**
    - Atendido parcialmente. O fluxo esta documentado no status do projeto; falta um manual operacional curto para RH cliente e equipe PRONUS.

## Ajustes realizados nesta rodada

- Navegacao responsiva do Portal RH Cliente alterada de lista horizontal para grade, evitando barra de rolagem horizontal em telas estreitas.
- Links do menu receberam `aria-current` quando representam a pagina atual.
- Campo de tipo da movimentacao cadastral foi substituido por controle segmentado com feedback visual imediato.
- Validacao visual feita no navegador em `/clientes`, com abertura do modal, troca de tipo de movimentacao e conferencia do layout em viewport estreito.

## Riscos de UX pendentes

- Criar feedback por campo para CPF, nome, setor e cargo no envio de movimentacoes.
- Persistir alteracoes e desligamentos em fila formal de aprovacao PRONUS com status, SLA e historico.
- Validar responsividade em mais larguras apos a proxima rodada de telas do Portal RH Cliente.
