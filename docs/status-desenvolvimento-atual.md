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
- Cadastro de empresa na API estrutural agora contempla status contratual e campos preparatorios para eSocial S-1000: validade, classificacao tributaria, indicadores cadastrais e contato responsavel.
- Importacao inicial de colaboradores via CSV adicionada, com modo `dryRun`, validacao por CNPJ ou empresa padrao, contagem de linhas validas, puladas e com erro.
- API psicossocial agora possui campanhas, questionario-base, envio inicial de respostas, calculo de adesao, classificacao de risco e sinais por setor com indicacao de privacidade.
- API psicossocial agora aplica pontuacao reversa nas perguntas positivas antes de classificar o nivel de risco.
- Portal PRONUS evoluido de placeholder para painel operacional inicial.
- Portal PRONUS passou a consumir a API local com fallback para dados-semente.
- Portal PRONUS reorganizado com navegacao real por paginas:
  - `/` para painel executivo;
  - `/empresas` para empresas, unidades, setores e cargos;
  - `/colaboradores` para usuarios, permissoes, agenda, feriados e tabela do corpo clinico;
  - `/nr01-pgr` para inventario de riscos e plano de acao;
  - `/psicossocial` para campanhas e sinais psicossociais;
  - `/documentos` para fila documental inicial.
- Portal PRONUS agora possui painel interativo para importacao CSV de clientes dentro de Empresas > Clientes, com upload/cola de conteudo, selecao de empresa padrao, simulacao e importacao real.
- Menu Empresas do Portal PRONUS agora possui pesquisa por nome/CNPJ/status, filtro por status contratual, acao de ajuste cadastral e modal para inclusao de empresa com campos preparatorios para eSocial.
- Menu Empresas do Portal PRONUS agora foi dividido em subniveis operacionais:
  - `/empresas` como resumo simples de empresas com pendencias de ajuste;
  - `/empresas/busca` para buscar empresa e incluir/ajustar cadastro;
  - `/empresas/cargos` para pesquisar e cadastrar cargos por perfil de uso, com referencia eSocial/CBO;
  - `/empresas/setores` para pesquisar e cadastrar setores por perfil de uso.
  - `/empresas/clientes` para importacao e consulta sob busca de funcionarios das contratantes, agora chamados de clientes.
- Cargos e setores agora funcionam como catalogos transversais por perfil: cliente, RH cliente, gestor cliente, administrativo PRONUS e corpo clinico PRONUS.
- Busca Empresa agora apresenta resultado em lista com abertura por lupa e abas: Geral, Cobertura, Clientes e Financeiro, com inclusao de vida avulsa e consolidado financeiro por intervalo informado.
- Telas de busca de empresa, cargos e setores nao carregam listas por padrao; os dados aparecem somente apos uma pesquisa do operador.
- Modulo Colaboradores agora foi separado de clientes das empresas e passou a organizar usuarios, permissoes por cargo, agenda do corpo clinico, bloqueios, feriados e tabela de pagamento profissional.
- Usuarios agora possuem CPF, data de cadastro, status operacional, acoes de ativar/suspender/cancelar e reset de senha para senha padrao de primeiro acesso.
- Agenda do corpo clinico agora calcula vagas pelo tempo de consulta, permite marcar dias de atendimento de segunda a sexta e registrar bloqueios por profissional e datas especificas.
- Portais PRONUS, RH Cliente e Colaborador agora possuem tela de login por CPF com troca obrigatoria de senha no primeiro acesso com senha padrao.
- Portal PRONUS recebeu refinamento visual de shell, navegacao e logo oficial, aplicando consistencia, feedback, prevencao de erro e reconhecimento visual.
- Favicon do produto foi configurado nos tres portais.
- Portal PRONUS agora exibe painel inicial NR-01/PGR com inventario de riscos, niveis, evidencias e plano de acao.
- Portal PRONUS agora exibe painel inicial psicossocial com campanhas, adesao media, amostra minima, sinais por setor, recomendacoes e governanca de privacidade.
- Portal Colaborador agora possui consulta por CPF, conferencia cadastral, envio de divergencia e questionario psicossocial vinculado a campanha ativa da empresa.
- Portal RH Cliente agora mostra divergencias cadastrais pendentes/agregadas.
- Painel PRONUS agora exibe:
  - resumo de empresas, clientes, acoes NR-01 e campanhas;
  - unidades, setores e cargos;
  - tabela de empresas/CNPJs;
  - avancos por modulo;
  - clientes recentes;
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
- Typecheck e build do Portal PRONUS apos separacao entre clientes, RH cliente e colaboradores internos PRONUS.
- Teste no navegador de `/empresas/clientes` com tela limpa por padrao e consulta sob busca, `/empresas/busca` com abertura por lupa, abas de cadastro/financeiro e `/colaboradores` com permissoes e agenda.
- Build geral do monorepo apos ajustes de Clientes, Colaboradores, permissoes, agenda e refinamento visual.
- Typecheck dos tres portais apos login por CPF, logo oficial, favicon e evolucao do modulo Colaboradores.
- Build geral do monorepo apos criacao dos logins, logo oficial, favicon e agenda/tabela/feriados.
- Teste no navegador de `Colaboradores` com aba Usuarios, acoes de status/reset, Agenda, Feriados, Tabela e logins dos portais PRONUS, RH Cliente e Colaborador.
- Teste HTTP de criacao de empresa com campos eSocial/contratuais.
- Teste clicavel no navegador da tela Empresas: pesquisa e modal de inclusao.
- Typecheck da API e Portal PRONUS apos reorganizacao do modulo Empresas em Busca, Cargos e Setores.
- Build geral do monorepo apos criacao dos subniveis de Empresas.
- Teste HTTP das rotas `/empresas`, `/empresas/busca`, `/empresas/cargos` e `/empresas/setores`.
- Teste interativo no navegador cobrindo busca de empresa, abas Geral/Cobertura/Colaborador/Financeiro, botao de vida avulsa e buscas de Cargos/Setores.
- Typecheck da API e Portal PRONUS apos ajuste de cargos/setores para catalogo por perfil.
- Build geral do monorepo apos ajuste de UX e modelo de cargos/setores.
- Teste interativo no navegador validando lista com lupa na busca de empresas, abertura sob demanda das abas, financeiro sem cards estreitos e Cargos/Setores sem filtro por empresa.
- Typecheck do Portal PRONUS apos separacao entre Clientes, RH, equipe PRONUS, permissoes e agenda.
