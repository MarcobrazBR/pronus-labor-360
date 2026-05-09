# Avaliacao UX Nielsen - Organizacao do MVP e Portal Profissional

Data: 2026-05-09

## Escopo revisado

- Portal PRONUS Operacoes: simplificacao do menu lateral.
- Portal PRONUS Operacoes: remanejamento de Colaboradores, Documentos e Psicossocial.
- Portal Profissional de Saude: primeira versao do atendimento clinico.
- Documentacao, acessos demonstrativos e capturas do README.

## Heuristicas aplicadas

### 1. Visibilidade do status do sistema

- O menu lateral do Portal PRONUS passa a exibir apenas os quatro blocos principais do MVP.
- O Portal Profissional mostra atendimentos do dia, proximos atendimentos e consulta selecionada em regioes fixas.
- A anamnese exibe retorno imediato quando os pontos da consulta sao salvos.

### 2. Correspondencia com o mundo real

- Pessoas, agenda, feriados, tabelas e permissoes foram agrupados em Configuracoes, coerente com administracao operacional.
- Documentos tambem foram movidos para Configuracoes, refletindo sua natureza de parametro, modelo e governanca.
- Psicossocial foi integrado a Risco Ocupacional, alinhado a NR-01 e ao tratamento de riscos no sistema.

### 3. Controle e liberdade do usuario

- Rotas antigas de Colaboradores, Documentos e Psicossocial redirecionam para os novos pontos, evitando perda de contexto.
- O profissional pode selecionar atendimentos, alternar controles de video e salvar anamnese sem navegar para outra tela.
- O botao Sair permanece visivel no topo, preservando o padrao dos demais portais.

### 4. Consistencia e padroes

- O quarto portal usa a mesma marca, paleta, login por documento e troca obrigatoria de senha.
- A organizacao lateral do Portal PRONUS segue o mesmo padrao visual ja validado.
- Abas internas preservam os componentes existentes, reduzindo surpresa e retrabalho para usuarios recorrentes.

### 5. Prevencao de erros

- A reducao de opcoes laterais diminui risco de o operador entrar em modulos administrativos fora do contexto.
- A senha do profissional segue a mesma regra de primeiro acesso dos demais portais.
- A anamnese fica vinculada ao atendimento selecionado, reduzindo chance de registro no cliente errado.

### 6. Reconhecimento em vez de memorizacao

- O operador encontra Colaboradores e Documentos dentro de Configuracoes por nomes diretos.
- O tecnico encontra Psicossocial como aba de Risco Ocupacional, sem precisar lembrar uma rota separada.
- O profissional de saude visualiza atendimento atual, agenda do dia e proximas consultas na mesma tela.

### 7. Flexibilidade e eficiencia

- O painel profissional concentra videochamada e anamnese em uma tela de trabalho unica.
- As rotas antigas continuam funcionais por redirecionamento, protegendo links salvos ou habitos de teste.
- A estrutura do monorepo ganhou script dedicado `pnpm dev:clinician` para subir o quarto portal isoladamente.

### 8. Estetica e design minimalista

- A lateral do Portal PRONUS ficou mais curta, limpa e aderente a uma primeira versao de MVP.
- O Portal Profissional evita painel comercial e abre diretamente na experiencia de atendimento.
- Os controles de video usam botoes compactos com tooltip, mantendo foco na consulta.

### 9. Ajuda para reconhecer e recuperar falhas

- O login do profissional apresenta mensagens objetivas para CPF nao encontrado e senha invalida.
- A troca de senha informa exatamente o criterio pendente.
- A tela sem sessao direciona para o login, sem deixar o usuario parado em estado vazio.

### 10. Ajuda e documentacao

- `docs/acessos-teste-portais.md` foi atualizado com o quarto portal e seu acesso demonstrativo.
- A regra de screenshots inclui login e painel do profissional de saude.
- O README passa a apresentar os quatro portais e a nova organizacao do MVP.

## Resultado

A rodada prepara melhor a primeira versao do MVP: reduz navegacao lateral, agrupa funcoes administrativas em Configuracoes, trata Psicossocial como parte do risco ocupacional e adiciona o Portal Profissional de Saude para atendimento por video e registro de anamnese.
