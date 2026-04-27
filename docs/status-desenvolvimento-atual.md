# Pronus Labor 360 - Status de Desenvolvimento

Data: 2026-04-27

## Ponto de Retomada

O computador reinicializou apos o scaffold inicial. Na retomada, o ambiente voltou com Git, Node.js e pnpm disponiveis no PATH.

Estado encontrado:

- Repositorio Git inicializado, ainda sem commits.
- Monorepo pnpm criado.
- Dependencias instaladas.
- Typecheck do scaffold passando.
- Apps web e API ainda em estado inicial.

## Avanco Realizado na Retomada

- Criado modulo inicial `structural` na API.
- Adicionados endpoints:
  - `GET /structural/summary`
  - `GET /structural/companies`
  - `GET /structural/companies/:id`
  - `POST /structural/companies`
  - `PATCH /structural/companies/:id`
  - `DELETE /structural/companies/:id`
  - `GET /structural/units`
  - `GET /structural/units/:id`
  - `POST /structural/units`
  - `PATCH /structural/units/:id`
  - `DELETE /structural/units/:id`
  - `GET /structural/departments`
  - `GET /structural/departments/:id`
  - `POST /structural/departments`
  - `PATCH /structural/departments/:id`
  - `DELETE /structural/departments/:id`
  - `GET /structural/job-positions`
  - `GET /structural/job-positions/:id`
  - `POST /structural/job-positions`
  - `PATCH /structural/job-positions/:id`
  - `DELETE /structural/job-positions/:id`
  - `GET /structural/employees`
  - `GET /structural/employees/:id`
  - `POST /structural/employees`
  - `POST /structural/employees/import`
  - `PATCH /structural/employees/:id`
  - `DELETE /structural/employees/:id`
- Criado fluxo inicial de primeiro acesso do colaborador:
  - `POST /employee-access/lookup`
  - `GET /employee-access/divergences`
  - `POST /employee-access/divergences`
  - `PATCH /employee-access/divergences/:id`
- Criado modulo inicial NR-01/GRO/PGR:
  - `GET /nr01/summary`
  - `GET /nr01/risks`
  - `GET /nr01/risks/:id`
  - `POST /nr01/risks`
  - `PATCH /nr01/risks/:id`
  - `DELETE /nr01/risks/:id`
  - `GET /nr01/action-plan`
  - `POST /nr01/action-plan`
  - `PATCH /nr01/action-plan/:id`
- Criado modulo inicial de risco psicossocial:
  - `GET /psychosocial/summary`
  - `GET /psychosocial/questions`
  - `GET /psychosocial/campaigns`
  - `GET /psychosocial/campaigns/:id`
  - `POST /psychosocial/campaigns`
  - `PATCH /psychosocial/campaigns/:id`
  - `GET /psychosocial/sector-signals`
  - `POST /psychosocial/answers`
- API estrutural agora valida campos obrigatorios, normaliza CPF/CNPJ, bloqueia duplicidades e faz inativacao logica.
- API estrutural agora cobre empresa, unidade, setor, cargo e colaborador.
- Importacao inicial de colaboradores via CSV adicionada, com modo `dryRun`, validacao por CNPJ ou empresa padrao, contagem de linhas validas, puladas e com erro.
- API psicossocial agora possui campanhas, questionario-base, envio inicial de respostas, calculo de adesao, classificacao de risco e sinais por setor com indicacao de privacidade.
- API psicossocial agora aplica pontuacao reversa nas perguntas positivas antes de classificar o nivel de risco.
- Portal PRONUS evoluido de placeholder para painel operacional inicial.
- Portal PRONUS passou a consumir a API local com fallback para dados-semente.
- Portal PRONUS reorganizado com navegacao real por paginas:
  - `/` para painel executivo;
  - `/empresas` para empresas, unidades, setores e cargos;
  - `/colaboradores` para base de colaboradores e importacao CSV;
  - `/nr01-pgr` para inventario de riscos e plano de acao;
  - `/psicossocial` para campanhas e sinais psicossociais;
  - `/documentos` para fila documental inicial.
- Portal PRONUS agora possui painel interativo para importacao CSV de colaboradores, com upload/cola de conteudo, selecao de empresa padrao, simulacao e importacao real.
- Portal PRONUS agora exibe painel inicial NR-01/PGR com inventario de riscos, niveis, evidencias e plano de acao.
- Portal PRONUS agora exibe painel inicial psicossocial com campanhas, adesao media, amostra minima, sinais por setor, recomendacoes e governanca de privacidade.
- Portal Colaborador agora possui consulta por CPF, conferencia cadastral, envio de divergencia e questionario psicossocial vinculado a campanha ativa da empresa.
- Portal RH Cliente agora mostra divergencias cadastrais pendentes/agregadas.
- Painel PRONUS agora exibe:
  - resumo de empresas, colaboradores, acoes NR-01 e campanhas;
  - unidades, setores e cargos;
  - tabela de empresas/CNPJs;
  - avancos por modulo;
  - colaboradores recentes;
  - sinais psicossociais agregados.

## Ainda Pendente

- Conectar API ao Prisma/Supabase quando `DATABASE_URL` estiver definido.
- Trocar persistencia temporaria em memoria por Prisma/Supabase.
- Evoluir importacao para reconciliar unidade/setor/cargo com cadastros estruturais existentes.
- Implementar autenticacao e permissoes.
- Persistir divergencias cadastrais no banco e vincular aprovacao formal a usuario RH autenticado.
- Evoluir NR-01/GRO/PGR para formularios completos, documentos e evidencias anexas.
- Evoluir risco psicossocial para anonimato por regra minima, relatorios tecnicos e plano de intervencao.
- Criar testes automatizados quando os fluxos deixarem de ser somente fundacao.

## Validacoes Executadas

- `pnpm --filter @pronus/api typecheck`
- `pnpm --filter @pronus/web-pronus typecheck`
- `pnpm build`
- Teste HTTP de criacao, vinculacao e inativacao de empresa/colaborador na API local.
- Teste HTTP de criacao, vinculacao e inativacao de unidade/setor/cargo na API local.
- Teste HTTP de importacao CSV em `dryRun` e criacao real, seguido de inativacao logica do colaborador importado.
- Typecheck do Portal PRONUS apos criacao do painel interativo de importacao.
- Teste HTTP de lookup por CPF, envio de divergencia cadastral e revisao da divergencia.
- Typecheck da API e Portal PRONUS apos criacao do modulo NR-01/PGR inicial.
- Typecheck da API e Portal PRONUS apos criacao do modulo psicossocial inicial.
- Teste HTTP de resumo, listagem de campanhas e envio de resposta psicossocial.
- Typecheck da API e Portal Colaborador apos inclusao do questionario psicossocial.
- Typecheck do Portal PRONUS apos reorganizacao da navegacao por paginas.
- Teste HTTP das rotas do Portal PRONUS: `/`, `/empresas`, `/colaboradores`, `/nr01-pgr`, `/psicossocial` e `/documentos`.
- Teste clicavel no navegador do menu do Portal PRONUS, cobrindo todos os itens laterais/horizontais.
- Build geral do monorepo apos reorganizacao da navegacao.
