# Avaliacao UX Nielsen - Logins, Logout e Seguranca Visual

Data: 2026-04-29

## Escopo

Rodada aplicada aos tres portais apos revisao de seguranca visual nas telas de login, padronizacao do botao Sair, validacao de troca obrigatoria de senha e documentacao dos acessos demonstrativos.

## Heuristicas Revisadas

1. Visibilidade do status do sistema
   - Os tres portais exibem o botao Sair no canto superior direito apos login.
   - A troca obrigatoria de senha permanece bloqueante e sai da tela apos salvamento valido.
   - O Portal PRONUS `/login` foi validado em navegador e responde sem 404.

2. Correspondencia com o mundo real
   - Operacoes acessa por CPF individual.
   - RH acessa por CNPJ da empresa.
   - Colaborador acessa por CPF proprio.

3. Controle e liberdade do usuario
   - O usuario autenticado consegue encerrar sessao nos tres portais.
   - O logout limpa a sessao local e retorna ao login.
   - A documentacao deixa claro quando usar senha padrao ou fluxo de reset.

4. Consistencia e padroes
   - As tres telas de login mantem o mesmo padrao visual: marca, titulo, campos, botao principal e acao de recuperacao quando aplicavel.
   - Credenciais demonstrativas foram removidas da interface.
   - O botao Sair usa o mesmo estilo visual nos portais autenticados.

5. Prevencao de erro
   - As telas de login nao expõem CPF, CNPJ ou senha de teste.
   - As credenciais foram transferidas para `docs/acessos-teste-portais.md`.
   - A senha nova exige exatamente 6 caracteres com letra, numero e caractere especial.

6. Reconhecimento em vez de memorizacao
   - A documentacao de acessos concentra URL, perfil, documento, senha padrao e regra de reset.
   - O operador nao precisa memorizar quem libera cada reset.
   - Os portais continuam indicando o contexto pelo titulo e pela marca.

7. Flexibilidade e eficiencia de uso
   - O logout permite alternar rapidamente entre usuarios de teste.
   - Os acessos demonstrativos ficam fora da interface, mas disponiveis para equipe tecnica.
   - O estado de sessao e atualizado apos troca de senha, reduzindo necessidade de recarregar manualmente.

8. Estetica e design minimalista
   - O bloco antigo do Portal Colaborador com empresa, nome e botao Sair foi simplificado.
   - O botao Sair foi isolado no topo, reduzindo peso visual.
   - As telas de login ficaram mais limpas e com menor carga cognitiva.

9. Reconhecimento, diagnostico e recuperacao de erros
   - Login sem documento ou senha retorna mensagem objetiva.
   - Senha invalida ou API indisponivel continua exibindo feedback claro.
   - Reset de senha retorna o acesso para a senha padrao e exige nova troca.

10. Ajuda e documentacao

- Criado `docs/acessos-teste-portais.md`.
- README aponta para o documento de acessos demonstrativos.
- Screenshots devem continuar atualizados quando login, shell ou marca mudarem.

## Resultado

Os portais ficaram mais seguros para demonstracao: credenciais nao aparecem mais na interface, os usuarios conseguem sair dos tres ambientes e a troca de senha foi validada em navegador nos portais PRONUS, RH Cliente e Colaborador.

## Proximos Cuidados

- Substituir acessos demonstrativos por seed controlado por ambiente.
- Criar logout com limpeza de cookies/tokens quando a autenticacao real for implementada.
- Adicionar identificacao discreta do usuario conectado em local apropriado sem competir com o conteudo principal.
- Criar testes automatizados para login, troca obrigatoria e logout.
