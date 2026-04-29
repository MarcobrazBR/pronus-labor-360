# Avaliacao UX Nielsen - Login PRONUS e Persistencia de Senhas

Data: 2026-04-29

## Escopo

Rodada aplicada ao login administrativo do Portal PRONUS, troca obrigatoria de senha, reset de usuarios internos, persistencia local de credenciais e refinamento visual de marca/textos dos portais.

## Heuristicas Revisadas

1. Visibilidade do status do sistema
   - O operador PRONUS sem sessao recebe um estado claro com acao direta para login.
   - Primeiro acesso exibe modal bloqueante de troca de senha antes de liberar a operacao.
   - Reset do Portal RH segue visivel em card vermelho no painel operacional.

2. Correspondencia com o mundo real
   - Login PRONUS usa CPF, alinhado ao acesso individual dos colaboradores internos.
   - Senha padrao do usuario PRONUS usa os seis primeiros digitos do CPF, mantendo a regra simples e consistente.
   - Perfil Administrador Geral representa o papel real de acesso amplo e suporte operacional.

3. Controle e liberdade do usuario
   - O master consegue resetar senha de usuarios administrativos e corpo clinico pelo modulo Colaboradores.
   - A troca obrigatoria salva a nova senha e libera a sessao sem exigir recarregamento manual.
   - Os acessos demonstrativos ficam disponiveis na tela de login para reduzir atrito de validacao.

4. Consistencia e padroes
   - Portal PRONUS, RH Cliente e Colaborador mantem a mesma marca, proporcao de logo, campos, botoes e feedbacks.
   - A senha nova segue a mesma regra: 6 caracteres com letra, numero e caractere especial.
   - Textos de navegacao lateral seguem caixa alta e nomenclatura consistente.

5. Prevencao de erro
   - O modal impede salvar senha fraca ou divergente.
   - A API persiste credenciais em caminho estavel do workspace para evitar perda ao reiniciar servidor por diretorio diferente.
   - Login antigo deixa de funcionar apos troca de senha, confirmando que nao ha duas senhas validas em paralelo.

6. Reconhecimento em vez de memorizacao
   - A tela de login mostra dois acessos teste com CPF e senha.
   - O menu lateral sinaliza item ativo com cor, borda e ponto visual.
   - A marca PRONUS fica mais presente sem competir com o conteudo operacional.

7. Flexibilidade e eficiencia de uso
   - Reset de usuario PRONUS fica no contexto da tabela de Usuarios.
   - Sessao local permite abrir rapidamente as telas operacionais para apresentacao.
   - Screenshots foram atualizados para apoiar avaliacao visual assincrona no GitHub.

8. Estetica e design minimalista
   - Textos de "MVP", "fase" e estados fragilizadores foram removidos das interfaces.
   - Indicadores do painel passaram a comunicar operacao, parametrizacao e monitoramento.
   - A logo foi aumentada de forma moderada nos tres portais.

9. Reconhecimento, diagnostico e recuperacao de erros
   - Erros de login e troca de senha retornam mensagens diretas.
   - Testes HTTP cobriram troca, persistencia, falha da senha antiga e reset para senha padrao nos tres portais.
   - O reset de usuario PRONUS devolve o usuario para troca obrigatoria no proximo acesso.

10. Ajuda e documentacao
   - README e status registram as credenciais demonstrativas e a nova regra visual.
   - Screenshots dos portais e logins foram regenerados.
   - A regra de atualizacao visual permanece em `docs/regra-atualizacao-screenshots.md`.

## Resultado

O acesso administrativo deixou de ser apenas uma simulacao local e passou a usar API, estado persistente e primeira troca obrigatoria. A interface ficou mais consistente para apresentacao, com marca mais visivel e sem textos que indiquem rascunho de produto.

## Proximos Cuidados

- Levar autenticacao para banco real com hash, trilha de auditoria e expiracao controlada.
- Restringir endpoints de reset por permissao real no backend.
- Criar logout e identificacao do operador conectado no shell.
- Evoluir a politica de senha e recuperacao com token seguro.
