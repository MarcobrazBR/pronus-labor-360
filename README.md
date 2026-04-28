# Pronus Labor 360

Pronus Labor 360 e uma plataforma em desenvolvimento para transformar a gestao de saude ocupacional, riscos trabalhistas e bem-estar corporativo em uma operacao digital, auditavel e orientada por dados.

A proposta vai alem de um ERP tradicional. O produto nasce para conectar, em uma unica base, a operacao tecnica da PRONUS, o RH das empresas clientes e a jornada do colaborador. O objetivo e reduzir retrabalho, aumentar confiabilidade juridica, acelerar entregas de SST e criar inteligencia operacional sobre NR-01/GRO/PGR, risco psicossocial, documentos, indicadores e preparacao futura para eSocial.

## Visao

Empresas lidam com saude ocupacional em um ambiente cada vez mais regulado, sensivel e fragmentado. Dados ficam espalhados em planilhas, documentos, sistemas isolados, e-mails e processos manuais. Isso cria risco juridico, perda de produtividade, pouca rastreabilidade e baixa capacidade de decisao.

O Pronus Labor 360 busca ser a camada operacional e estrategica que organiza esse ecossistema:

- para a PRONUS, uma central de execucao, controle tecnico e produtividade;
- para o RH cliente, uma visao clara do status da saude ocupacional contratada;
- para o colaborador, uma jornada digital simples, segura e responsiva;
- para a gestao, uma base de dados confiavel para indicadores, documentos, auditoria e expansao futura.

## O Problema Que Estamos Resolvendo

A saude ocupacional brasileira exige cadastros consistentes, documentos corretos, rastreabilidade, privacidade e resposta rapida a mudancas reguladoras. Ao mesmo tempo, a inclusao de riscos psicossociais no centro da agenda corporativa aumenta a necessidade de processos bem desenhados, dados agregados e protecao de informacoes sensiveis.

O mercado ainda opera, em grande parte, com ferramentas desconectadas. Isso torna dificil:

- saber se a base cadastral esta correta;
- acompanhar a evolucao de PGR, inventario de riscos e planos de acao;
- executar campanhas psicossociais com privacidade e governanca;
- entregar documentos com controle de versao e evidencia;
- impedir vazamento de dados entre empresas e colaboradores;
- medir produtividade operacional e valor entregue ao cliente.

## Proposta De Valor

O Pronus Labor 360 foi pensado como uma plataforma 360 graus para a relacao entre operadora, empresa e colaborador.

Principais pilares:

- **Cadastro estrutural confiavel:** grupos, empresas, CNPJs, unidades, setores, cargos, clientes e colaboradores internos em uma base organizada.
- **Governanca de dados:** isolamento por empresa, status, historico, aprovacao de divergencias e trilhas de auditoria.
- **Risco ocupacional / NR-01/GRO/PGR:** base preparada para inventario de riscos, matriz, planos de acao, evidencias e documentos.
- **Risco psicossocial:** campanhas, questionarios, indicadores agregados, regras de privacidade e suporte a analise tecnica.
- **Documentos e evidencias:** estrutura para gerar, publicar e controlar documentos ocupacionais.
- **Operacao escalavel:** portais separados para PRONUS, RH Cliente e Colaborador.
- **Preparacao futura:** arquitetura pensada para eSocial SST, BI avancado, teleatendimento e automacoes inteligentes.

## Portais

```text
apps/
  web-pronus/      Portal operacional PRONUS
  web-client/      Portal RH Cliente
  web-employee/    Portal Colaborador
  api/             API Node.js/NestJS
packages/
  ui/              Componentes compartilhados
  config/          Configuracoes compartilhadas
  types/           Tipos compartilhados
  validations/     Validacoes compartilhadas
  database/        Prisma, schema e acesso ao banco
docs/              Documentacao de produto, arquitetura, dados e fluxos
```

## Estado Atual

O projeto esta em fase inicial de desenvolvimento do MVP.

Ja existe:

- monorepo com pnpm workspaces;
- tres portais Next.js;
- API NestJS;
- schema inicial Prisma;
- cadastro estrutural inicial na API;
- endpoints para empresas, unidades, setores, cargos e colaboradores;
- importacao inicial de colaboradores via CSV com modo de simulacao;
- painel operacional inicial no Portal PRONUS com navegacao por paginas;
- modulo Empresas do Portal PRONUS organizado em resumo, busca, cargos e setores;
- aba Clientes dentro do modulo Empresas para funcionarios das contratantes, com importacao e consulta sob busca;
- busca de empresas com lista, abertura por cadastro e abas de dados gerais, cobertura contratual, clientes e financeiro;
- cargos e setores como catalogos transversais por perfil de uso, preparados para clientes, RH, gestores, administrativo PRONUS e corpo clinico PRONUS;
- modulo Colaboradores com Usuarios, permissoes do sistema, agenda do corpo clinico, feriados e tabela de pagamento profissional;
- telas de login por CPF para Portal PRONUS, Portal RH Cliente e Portal Colaborador, com troca obrigatoria quando o usuario acessa pela senha padrao;
- logo oficial aplicada aos portais e favicon do produto configurado;
- fluxo de primeiro acesso do colaborador com conferencia cadastral;
- painel RH Cliente para acompanhar divergencias cadastrais;
- modulo Risco Ocupacional com abas de inventario de riscos, plano de acao, evidencias e documentos;
- base inicial de risco psicossocial com campanhas, questionario, adesao, sinais por setor e regras de privacidade;
- questionario psicossocial inicial no Portal Colaborador;
- documentacao funcional e tecnica em `docs/`.

Ainda esta em andamento:

- persistencia real com Prisma/Supabase;
- autenticacao e permissoes;
- reconciliacao avancada de planilhas com unidades, setores e cargos;
- persistencia real dos formularios de risco ocupacional, documentos e evidencias anexas;
- relatorios psicossociais, anonimato por regra minima e plano de intervencao;
- documentos, auditoria e dashboards avancados.

## Sinais De Tracao Do MVP

O MVP ja demonstra a tese central do produto: uma base unica que conecta operacao, RH e colaborador sem perder governanca.

- A operacao PRONUS ja visualiza empresas, CNPJs, estrutura, clientes, NR-01 e risco psicossocial em um painel inicial.
- O RH Cliente ja tem uma porta de entrada para acompanhar pendencias cadastrais e reduzir retrabalho.
- O colaborador ja consegue localizar o cadastro, sinalizar divergencias e responder o primeiro questionario psicossocial.
- A API ja organiza dominios separados para estrutura, primeiro acesso, NR-01 e risco psicossocial.
- A arquitetura ja esta preparada para evoluir para banco real, autenticacao, permissoes, documentos e automacoes.

Essa combinacao torna o Pronus Labor 360 mais que um sistema interno. Ele aponta para uma plataforma vertical de saude ocupacional, com potencial de receita recorrente, inteligencia regulatoria e dados operacionais de alto valor para empresas que precisam cuidar de pessoas com rastreabilidade.

## Stack Definida

- Next.js + React + TypeScript + Tailwind nos tres portais.
- NestJS no backend.
- PostgreSQL via Supabase.
- Prisma como ORM.
- pnpm workspaces.

## Primeiros Comandos

Depois de instalar dependencias:

```bash
pnpm install
pnpm dev
```

Comandos uteis:

```bash
pnpm build
pnpm typecheck
pnpm dev:pronus
pnpm dev:api
```

## Roadmap Do MVP

1. Cadastro estrutural: empresas, unidades, setores, cargos e colaboradores.
2. Importacao e validacao de colaboradores.
3. Autenticacao e isolamento multiempresa.
4. Primeiro acesso do colaborador e divergencia cadastral.
5. Nucleo de risco ocupacional / NR-01/GRO/PGR.
6. Campanhas de risco psicossocial.
7. Questionario psicossocial do colaborador.
8. Documentos iniciais e auditoria.

## Tese De Produto

O Pronus Labor 360 nasce de uma necessidade real: transformar saude ocupacional em uma operacao digital, rastreavel e escalavel. A oportunidade esta em unir conhecimento tecnico de SST, experiencia operacional da PRONUS e uma plataforma moderna capaz de criar vantagem competitiva, previsibilidade e novos modelos de receita.

Em um mercado pressionado por conformidade, privacidade, produtividade e cuidado com pessoas, a plataforma busca ocupar um espaco estrategico: ser o sistema operacional da saude ocupacional corporativa.

## Documentacao

A documentacao de produto, arquitetura, dados e fluxos esta em `docs/`.
