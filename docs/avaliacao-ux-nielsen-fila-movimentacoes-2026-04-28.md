# Avaliacao UX Nielsen - Fila de Movimentacoes - 2026-04-28

Escopo avaliado: fila operacional de movimentacoes cadastrais de clientes, cobrindo Portal RH Cliente, Portal PRONUS e API estrutural.

## Resultado por heuristica

1. **Visibilidade do status do sistema**
   - Atendido. O Portal RH mostra a movimentacao como pendente PRONUS e o Portal PRONUS exibe contador de pendencias, status e SLA.

2. **Correspondencia com o mundo real**
   - Atendido. O fluxo reflete o processo operacional: RH solicita, PRONUS valida, aprova ou recusa antes de alterar o cadastro.

3. **Controle e liberdade do usuario**
   - Atendido. O operador pode cancelar modais antes do envio, e a PRONUS tem acoes claras para aprovar ou recusar movimentacoes pendentes.

4. **Consistencia e padroes**
   - Atendido. Inclusao, alteracao e desligamento seguem a mesma fila e os mesmos status nos dois portais.

5. **Prevencao de erros**
   - Atendido parcialmente. A API bloqueia duplicidade de movimentacao pendente, valida campos obrigatorios e impede aprovar movimento ja finalizado. Falta mascara visual para CPF, telefone e e-mail.

6. **Reconhecimento em vez de memorizacao**
   - Atendido. Tipo, status, empresa, CPF, setor, cargo, origem e SLA ficam visiveis na fila.

7. **Flexibilidade e eficiencia de uso**
   - Atendido. O RH pode abrir solicitacoes e a PRONUS pode operar a fila no mesmo modulo Empresas > Clientes.

8. **Design estetico e minimalista**
   - Atendido. A fila usa linhas responsivas em vez de tabela larga, reduzindo rolagem horizontal e mantendo leitura rapida.

9. **Ajuda para reconhecer e corrigir erros**
   - Atendido parcialmente. Mensagens de erro da API aparecem no fluxo, mas ainda precisam ficar associadas ao campo especifico.

10. **Ajuda e documentacao**
    - Atendido parcialmente. A regra foi documentada aqui e no status do projeto; falta manual operacional para aprovacao de movimentacoes.

## Ajustes realizados nesta rodada

- Criados contratos de API para movimentacoes cadastrais: inclusao, alteracao e desligamento.
- Criados endpoints `GET`, `POST` e `PATCH` em `/structural/employee-movements`.
- Portal RH passou a enviar movimentacoes para a fila PRONUS em vez de manter alteracao/desligamento apenas local.
- Portal PRONUS passou a exibir fila operacional com contador, SLA, origem, status e acoes de aprovar/recusar.
- Aprovacao da fila aplica a movimentacao no cadastro estrutural em memoria; recusa mantem historico.

## Riscos de UX pendentes

- Adicionar mascara e validacao por campo para CPF, telefone e e-mail.
- Criar filtros especificos da fila por empresa, tipo, status e SLA.
- Persistir fila em banco real com usuario aprovador autenticado e trilha de auditoria imutavel.
