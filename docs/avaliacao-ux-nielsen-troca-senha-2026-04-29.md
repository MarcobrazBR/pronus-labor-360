# Avaliacao UX Nielsen - Troca de Senha Obrigatoria

Data: 2026-04-29

## Escopo

Rodada aplicada aos modais de primeira troca de senha dos tres portais: Portal PRONUS, Portal RH Cliente e Portal Colaborador.

## Heuristicas Revisadas

1. Visibilidade do status do sistema
   - O modal agora mostra uma lista objetiva dos criterios da senha.
   - Cada criterio muda visualmente quando e atendido.
   - O botao informa quando esta salvando.

2. Correspondencia com o mundo real
   - A regra operacional continua clara: exatamente 6 caracteres, com letra, numero e caractere especial.
   - O exemplo documentado `Aa1@bc` continua valido para teste.

3. Controle e liberdade do usuario
   - O botao deixou de parecer bloqueado sem explicacao.
   - Ao clicar com senha invalida, o usuario recebe a causa exata do problema.

4. Consistencia e padroes
   - A mesma regra visual foi aplicada nos tres portais.
   - Mensagens e criterios usam a mesma ordem e linguagem.

5. Prevencao de erro
   - O sistema ainda impede salvar senha fraca.
   - A prevencao agora e acompanhada de feedback acionavel.

6. Reconhecimento em vez de memorizacao
   - O usuario nao precisa memorizar a regra da senha.
   - A lista de requisitos fica no proprio modal.

7. Flexibilidade e eficiencia de uso
   - Usuarios que ja conhecem a regra podem salvar normalmente.
   - Usuarios em duvida conseguem corrigir sem tentativa e erro.

8. Estetica e design minimalista
   - O checklist usa visual leve, sem adicionar uma etapa extra.
   - O conteudo permanece concentrado no modal.

9. Reconhecimento, diagnostico e recuperacao de erros
   - Erros passaram de genericos para especificos: tamanho, letra, numero, caractere especial ou confirmacao.
   - O fluxo master foi validado na API com troca e reset.

10. Ajuda e documentacao

- `docs/acessos-teste-portais.md` segue como referencia dos acessos e exemplo de senha valida.

## Resultado

A troca obrigatoria de senha ficou mais clara e menos frustrante. O botao nao fica mais com aparencia de proibido por falta de uma regra invisivel; o usuario recebe orientacao imediata e consegue concluir o acesso com menor atrito.
