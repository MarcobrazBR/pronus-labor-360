# Avaliacao UX Nielsen - Padronizacao de Clientes - 2026-04-28

Escopo avaliado: identificacao da empresa no Portal RH Cliente e padronizacao do fluxo de inclusao manual de clientes entre Portal RH Cliente e Portal PRONUS.

## Resultado por heuristica

1. **Visibilidade do status do sistema**
   - Atendido. O Portal RH agora mostra o nome da empresa ativa no shell, reduzindo duvida sobre o contexto operacional.

2. **Correspondencia com o mundo real**
   - Atendido. O sistema usa a empresa real como contexto do RH e mantem o conceito de cliente como funcionario da contratante.

3. **Controle e liberdade do usuario**
   - Atendido. Os modais podem ser fechados ou cancelados antes de qualquer envio. No PRONUS, a empresa pode ser escolhida; no RH, a empresa fica travada pela permissao.

4. **Consistencia e padroes**
   - Atendido. A inclusao manual usa o mesmo conjunto de campos nos dois portais: empresa, nome completo, CPF, setor, cargo, data de nascimento, data de inclusao, e-mail, telefone e observacao.

5. **Prevencao de erros**
   - Atendido parcialmente. Campos essenciais sao validados antes do envio e a empresa aparece explicitamente. Falta evoluir para validacao por campo e mascara de CPF/telefone.

6. **Reconhecimento em vez de memorizacao**
   - Atendido. O operador nao precisa lembrar qual empresa esta operando; o contexto fica visivel no menu e dentro do modal.

7. **Flexibilidade e eficiencia de uso**
   - Atendido. O PRONUS pode incluir clientes para qualquer empresa; o RH segue o mesmo processo dentro da sua permissao.

8. **Design estetico e minimalista**
   - Atendido. A lista do PRONUS foi convertida para linhas responsivas, evitando tabela larga e rolagem horizontal desnecessaria.

9. **Ajuda para reconhecer e corrigir erros**
   - Atendido parcialmente. Mensagens aparecem no fluxo, mas ainda precisam ficar associadas diretamente aos campos invalidos.

10. **Ajuda e documentacao**
    - Atendido parcialmente. A decisao foi registrada neste documento e no status do projeto; falta manual operacional para RH e operador PRONUS.

## Ajustes realizados nesta rodada

- Substituido o identificador generico `CLIENTE` pelo nome da empresa ativa no shell do Portal RH.
- Adicionado campo de empresa dentro do modal de movimentacao do Portal RH como contexto somente leitura.
- Adicionado fluxo manual de inclusao de cliente em Empresas > Clientes no Portal PRONUS.
- Mantidos os mesmos campos de inclusao entre Portal RH e Portal PRONUS, respeitando a diferenca de permissao de cada usuario.
- Resultado de clientes no Portal PRONUS passou para lista responsiva com CPF, empresa, setor, cargo, status e data de inclusao.

## Riscos de UX pendentes

- Criar componentes compartilhados para o formulario de cliente quando houver pacote interno de UI entre os portais.
- Adicionar mascaras e validacao por campo para CPF, telefone e e-mail.
- Persistir formalmente observacoes da inclusao e fila de aprovacao PRONUS em banco real.
