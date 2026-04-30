# Avaliacao UX Nielsen - Pesquisa de clima e permissoes

Data: 2026-04-30

## Escopo revisado

- Portal do Cliente: janela da Pesquisa de Clima Organizacional.
- Portal do Cliente: atualizacao passiva de cadastro, risco psicossocial e liberacao de uso.
- Portal PRONUS Operacoes: identificacao do operador logado.
- Portal PRONUS Operacoes: acesso restrito a aba Permissoes do sistema.
- Portal PRONUS Operacoes: sincronizacao da aba Psicossocial da empresa.

## Heuristicas aplicadas

### 1. Visibilidade do status do sistema

- O termometro de respostas permanece visivel durante a rolagem da pesquisa.
- O percentual respondido e a contagem de perguntas continuam acessiveis sem exigir retorno ao topo.
- A aba Psicossocial em Empresas passa a atualizar respostas periodicamente e no foco da janela.

### 2. Correspondencia com o mundo real

- O titulo foi ajustado para Pesquisa de Clima Organizacional, linguagem mais clara para o cliente.
- A pesquisa passa a ser apresentada por blocos de fatores, acompanhando a logica tecnica do levantamento.
- O cargo Master foi formalizado como perfil operacional com acesso integral.

### 3. Controle e liberdade do usuario

- O cliente pode fechar a pesquisa e continuar depois sem perder as respostas ja salvas.
- A pesquisa so permite finalizar quando todas as perguntas foram respondidas.
- A mensagem final tem acao clara de fechamento, liberando o portal para continuidade do uso.

### 4. Consistencia e padroes

- O fluxo de pesquisa mantem botoes, bordas, cores e hierarquia visual usados nos demais portais.
- O operador logado aparece no mesmo ponto de saida do sistema, mantendo o padrao de navegacao superior.
- A permissao Master segue a mesma nomenclatura apresentada no login e na area de colaboradores.

### 5. Prevencao de erros

- O botao Proximo fica bloqueado enquanto o bloco atual estiver incompleto.
- O botao Finalizar pesquisa fica bloqueado ate que 100% das perguntas estejam respondidas.
- A aba Permissoes do sistema deixa de aparecer para usuarios nao Master.

### 6. Reconhecimento em vez de memorizacao

- A pesquisa mostra apenas o bloco atual, reduzindo a carga cognitiva e a ansiedade de ver muitas perguntas.
- O usuario nao precisa lembrar o progresso, pois o termometro acompanha a tela.
- O operador visualiza nome e cargo de quem esta logado sem depender de memoria ou contexto externo.

### 7. Flexibilidade e eficiencia

- A atualizacao passiva reduz necessidade de logout/login apos confirmacao cadastral ou resposta da pesquisa.
- A base psicossocial passa a expor resposta individual por colaborador, melhorando integracao entre portais.

### 8. Estetica e design minimalista

- O chip Amostra atingida foi removido da janela da pesquisa.
- O texto repetitivo do fator foi retirado de cada pergunta, permanecendo apenas no cabecalho do bloco.
- A mensagem final usa bloco unico, texto curto e botao direto.

### 9. Ajuda para reconhecer e recuperar falhas

- Se a API oscilar no envio da pesquisa, o portal mantem a pesquisa finalizada localmente e tenta sincronizar depois.
- A aba Psicossocial preserva o ultimo estado valido caso a API fique indisponivel temporariamente.

### 10. Ajuda e documentacao

- O comportamento de progresso, continuidade e finalizacao ficou explicito na propria interacao.
- As imagens da galeria visual foram atualizadas para refletir o estado atual dos portais.

## Resultado

A rodada reduz ansiedade no questionario, melhora feedback de progresso, elimina redundancia visual, corrige sincronizacao entre portais e protege configuracoes sensiveis para usuarios Master.
