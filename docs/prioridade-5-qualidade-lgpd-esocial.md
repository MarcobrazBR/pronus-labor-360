# Prioridade 5 - Qualidade, LGPD, seguranca e eSocial SST

Data: 2026-05-13

## Objetivo

Criar a base para o PRONUS LABOR 360 crescer sem quebrar, reduzindo risco tecnico, juridico e operacional antes de ampliar agenda, prontuario, financeiro e integracoes oficiais.

## Escopo implementado nesta rodada

### 1. Testes automatizados

Criada a primeira suite com `node --test`, sem adicionar dependencias novas.

Arquivos:

- `tests/quality/validations.test.mjs`
- `tests/quality/quality-contracts.test.mjs`

Coberturas iniciais:

- CPF e CNPJ dos acessos demonstrativos.
- Rejeicao de documentos invalidos.
- Matriz de dominios criticos de teste: login, permissoes, cadastro, importacao, psicossocial, agenda, prontuario e financeiro.
- Contratos de LGPD e seguranca.
- Fila eSocial SST com S-2210, S-2220, S-2240 e S-3000 sem envio real.

Comando:

```bash
pnpm test:quality
```

### 2. Modulo de qualidade na API

Criado modulo `quality` na API:

- `GET /quality/summary`
- `GET /quality/automated-tests`
- `GET /quality/lgpd-governance`
- `GET /quality/esocial-sst-queue`

Esse modulo funciona como painel tecnico inicial para acompanhar prontidao de testes, governanca LGPD, politica de anexos e fila eSocial.

### 3. LGPD e seguranca

Foram modelados contratos iniciais para:

- consentimentos por finalidade;
- bases legais;
- versao do termo aceito;
- canal de coleta;
- politica de retencao;
- politica de anexos;
- trilha de acesso a dados sensiveis;
- decisao de acesso permitido/negado.

Regras de desenho:

- dado clinico e psicossocial individual nao deve ser tratado como simples dado administrativo;
- anexos clinicos usam bucket separado;
- URLs de anexos sensiveis devem ser assinadas e temporarias;
- acesso negado tambem deve gerar trilha;
- retencao deve ter responsavel, prazo e acao final.

### 4. eSocial SST

Criada fila futura para:

- `S-2210` - Comunicacao de Acidente de Trabalho;
- `S-2220` - Monitoramento da Saude do Trabalhador;
- `S-2240` - Condicoes Ambientais do Trabalho / agentes nocivos;
- `S-3000` - Exclusao de eventos.

Importante:

- O MVP nao envia eventos ao eSocial.
- A fila fica com `futureSubmissionEnabled=false`.
- A fila prepara validacao, origem, resumo de payload e mensagens de bloqueio.
- Eventos com dados incompletos ficam como `blocked_by_missing_data`.
- S-3000 permanece como rascunho ate existir recibo oficial de evento enviado futuramente.

Referencias oficiais:

- Documentacao tecnica eSocial: https://www.gov.br/esocial/pt-br/documentacao-tecnica
- MOS eSocial S-1.3: https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-03-2025.pdf

### 5. Prisma/Supabase

O schema Prisma recebeu modelos para persistencia futura:

- `LgpdConsentRecord`
- `LgpdRetentionPolicy`
- `AttachmentSecurityPolicy`
- `SensitiveAccessTrail`
- `ESocialSstEventQueue`

Esses modelos deixam o Supabase preparado para persistir governanca e fila eSocial quando o backend sair do modo demonstrativo.

## O que ainda falta para fechar a Prioridade 5

### Testes

- Testes HTTP de login e reset de senha com API real.
- Testes de autorizacao por perfil.
- Fixtures de importacao por planilha.
- Testes de agenda quando ela deixar de ser demonstrativa.
- Testes de prontuario quando houver persistencia clinica real.
- Testes financeiros de fechamento e pagamento profissional.

### LGPD

- Tela de gestao de consentimentos no Portal PRONUS.
- Coleta real de consentimento antes de gravacao/transcricao.
- Politica real de expurgo/anonymizacao.
- Hash de IP/user-agent sem armazenar dados excessivos.
- Separacao de storage por classe de dado.

### eSocial

- Revisao tecnico-juridica dos leiautes vigentes antes de qualquer envio.
- Mapeamento real de campos por evento.
- Validacao XML/JSON conforme leiaute vigente.
- Certificado digital/transmissao oficial.
- Recebimento e guarda de recibos.
- Retificacao e exclusao com rastreio de recibo.

## Decisao tecnica

A prioridade 5 nao deve comecar pelo envio real ao eSocial nem por criptografia complexa feita as pressas. A decisao correta para o MVP e criar contratos, testes, trilhas e fila bloqueada para envio, permitindo evoluir com seguranca quando a persistencia no Supabase e a API publica estiverem maduras.
