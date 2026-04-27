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
- API estrutural agora valida campos obrigatorios, normaliza CPF/CNPJ, bloqueia duplicidades e faz inativacao logica.
- API estrutural agora cobre empresa, unidade, setor, cargo e colaborador.
- Importacao inicial de colaboradores via CSV adicionada, com modo `dryRun`, validacao por CNPJ ou empresa padrao, contagem de linhas validas, puladas e com erro.
- Portal PRONUS evoluido de placeholder para painel operacional inicial.
- Portal PRONUS passou a consumir a API local com fallback para dados-semente.
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
- Evoluir importacao de colaboradores para upload real de arquivo no Portal PRONUS.
- Implementar autenticacao e permissoes.
- Criar fluxo real de divergencia cadastral no primeiro acesso.
- Implementar nucleos funcionais de NR-01/GRO/PGR e risco psicossocial.
- Criar testes automatizados quando os fluxos deixarem de ser somente fundacao.

## Validacoes Executadas

- `pnpm --filter @pronus/api typecheck`
- `pnpm --filter @pronus/web-pronus typecheck`
- `pnpm build`
- Teste HTTP de criacao, vinculacao e inativacao de empresa/colaborador na API local.
- Teste HTTP de criacao, vinculacao e inativacao de unidade/setor/cargo na API local.
- Teste HTTP de importacao CSV em `dryRun` e criacao real, seguido de inativacao logica do colaborador importado.
